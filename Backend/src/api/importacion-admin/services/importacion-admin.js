'use strict';

const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const os = require('os');

// ─── Constantes ────────────────────────────────────────────────────────────────
const UID_PRODUCTO = 'api::producto.producto';
const UID_CAT      = 'api::categoria.categoria';
const HEADER_ROW   = 3;
const BATCH_SIZE   = 30;

// ─── Estado en memoria de la última importación ────────────────────────────────
let ultimaImportacion = null;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function cellVal(row, colIndex) {
  const cell = row.getCell(colIndex);
  if (!cell || cell.value === null || cell.value === undefined) return '';
  if (cell.value && typeof cell.value === 'object' && 'result' in cell.value) {
    return cell.value.result !== null && cell.value.result !== undefined
      ? String(cell.value.result).trim()
      : '';
  }
  if (cell.value && cell.value.richText) {
    return cell.value.richText.map(rt => rt.text).join('').trim();
  }
  return String(cell.value).trim();
}

function isSeparatorOrEmpty(row) {
  const a = cellVal(row, 1);
  return a === '' || a.startsWith('═') || a.startsWith('→');
}

function parseBoolean(val) {
  const v = (val || '').toString().toLowerCase().trim();
  return ['1', 'true', 'si', 'sí', 'yes', 'verdadero', 'v', 't', 'y'].includes(v);
}

function parseDecimal(val) {
  if (!val || val.toString().trim() === '') return null;
  const num = parseFloat(val.toString().replace(/\./g, '').replace(',', '.'));
  return isNaN(num) ? null : num;
}

// ─── Leer el Excel y extraer filas de productos y variantes ──────────────────
async function leerExcel(rutaArchivo) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(rutaArchivo);

  // Hoja 1: Productos (busca por nombre; omite hoja oculta 'Listas')
  const wsP = wb.getWorksheet('📦 Productos')
    || wb.worksheets.find(ws => ws.name !== 'Listas');
  if (!wsP) throw new Error('No se encontró la hoja de Productos en el Excel.');

  const productos = [];
  wsP.eachRow((row, rowNum) => {
    if (rowNum <= HEADER_ROW) return;
    if (isSeparatorOrEmpty(row)) return;
    const id_original = cellVal(row, 1);
    if (!id_original) return;

    productos.push({
      id_original,
      sku:             cellVal(row, 2),
      nombre:          cellVal(row, 3),
      marca:           cellVal(row, 4),
      seccion:         cellVal(row, 5),
      categoria:       cellVal(row, 6),
      subcategoria:    cellVal(row, 7),
      tipo:            cellVal(row, 8),
      descripcion:     cellVal(row, 9),
      especificaciones: cellVal(row, 10),
      proveedor:       cellVal(row, 11),
      publicado:       cellVal(row, 12),
      destacado:       cellVal(row, 13) || 'FALSE',
      stock:           cellVal(row, 14) || '0',
      caracteristicas: cellVal(row, 15),
      precio:          cellVal(row, 16),
      precio_oferta:   cellVal(row, 17),   // Col Q — ahora el usuario ingresa el precio oferta
      pct_descuento:   cellVal(row, 18),   // Col R — calculado en Excel (lectura de respaldo)
    });
  });

  // Hoja 2: Variantes
  const wsV = wb.getWorksheet('🔗 Variantes')
    || wb.worksheets.find(ws => ws.name !== 'Listas' && ws !== wsP);
  if (!wsV) throw new Error('No se encontró la hoja de Variantes en el Excel.');

  const variantes = [];
  wsV.eachRow((row, rowNum) => {
    if (rowNum <= HEADER_ROW) return;
    if (isSeparatorOrEmpty(row)) return;
    const id_original = cellVal(row, 1);
    if (!id_original) return;

    const precio           = parseFloat(cellVal(row, 7)) || 0;
    const precio_oferta_raw = cellVal(row, 8); // Col H — ahora el usuario ingresa el precio oferta
    const pct_descuento_raw = cellVal(row, 9); // Col I — calculado en Excel (lectura de respaldo)

    // Precio oferta: primario desde col 8 (usuario), fallback calculado desde col 9 (% desc)
    let precio_oferta = null;
    if (precio_oferta_raw && parseFloat(precio_oferta_raw) > 0) {
      precio_oferta = parseFloat(precio_oferta_raw);
    }
    const pct_descuento = precio_oferta && precio > 0
      ? Math.round((1 - precio_oferta / precio) * 100)
      : parseFloat(pct_descuento_raw) || 0;

    variantes.push({
      id_original,
      producto_padre_id: cellVal(row, 2),
      sku_ean:           cellVal(row, 4),
      volumen:           cellVal(row, 5),
      stock:             cellVal(row, 6) || '0',
      precio:            String(precio),
      pct_descuento:     String(pct_descuento || ''),
      precio_oferta:     precio_oferta ? String(precio_oferta) : '',
      publicado:         cellVal(row, 10) || 'TRUE',
      envio:             cellVal(row, 11) || '1',
      color_nombre:      cellVal(row, 12),
    });
  });

  return { productos, variantes };
}

// ─── Upsert de categoría ───────────────────────────────────────────────────────
async function upsertCategoria(strapi, { nombre, seccion, subcategorias }) {
  const nombreTrim = (nombre || '').trim();
  if (!nombreTrim) return null;

  const encontrados = await strapi.documents(UID_CAT).findMany({
    filters: { nombre: { $eq: nombreTrim } },
    limit: 1,
  });

  if (encontrados.length > 0) {
    // Ya existe: devolver su documentId (sin modificar subcategorías existentes)
    return encontrados[0].documentId;
  }

  // Crear nueva categoría con sus subcategorías
  const subcatData = subcategorias
    .filter(s => s && s.trim())
    .map(s => ({ nombre: s.trim() }));

  const nueva = await strapi.documents(UID_CAT).create({
    data: {
      nombre: nombreTrim,
      seccion: seccion || '',
      subcategorias: subcatData,
    },
    status: 'published',
  });

  return nueva.documentId;
}

// ─── Función principal de importación (UPSERT) ────────────────────────────────
async function procesarImportacion(strapi, rutaExcel) {
  const inicio = Date.now();
  const log = [];

  const addLog = (msg) => {
    strapi.log.info(`[ImportAdmin] ${msg}`);
    log.push(msg);
  };

  addLog(`📂 Leyendo archivo: ${path.basename(rutaExcel)}`);
  const { productos, variantes } = await leerExcel(rutaExcel);

  addLog(`📦 ${productos.length} productos encontrados en el Excel`);
  addLog(`🔗 ${variantes.length} variantes encontradas en el Excel`);

  // ── Paso 1: Construir categorías únicas ──────────────────────────────────────
  const categoriasMap = new Map();
  for (const p of productos) {
    const cat    = (p.categoria    || '').trim();
    const seccion = (p.seccion     || '').trim();
    const subcat  = (p.subcategoria || '').trim();
    if (!cat) continue;

    if (!categoriasMap.has(cat)) {
      categoriasMap.set(cat, { seccion, subcategorias: new Set() });
    }
    if (subcat) {
      categoriasMap.get(cat).subcategorias.add(subcat);
    }
  }

  // ── Paso 2: Upsert categorías ─────────────────────────────────────────────────
  addLog(`🗂 Procesando ${categoriasMap.size} categorías...`);
  const categoriaIdPorNombre = new Map();

  for (const [nombre, { seccion, subcategorias }] of categoriasMap) {
    try {
      const docId = await upsertCategoria(strapi, {
        nombre,
        seccion,
        subcategorias: [...subcategorias],
      });
      categoriaIdPorNombre.set(nombre, docId);
    } catch (e) {
      addLog(`❌ Error en categoría "${nombre}": ${e.message}`);
    }
  }

  // ── Paso 3: Indexar variantes por producto_padre_id ───────────────────────────
  const variantesIndex = new Map();
  for (const v of variantes) {
    const padreId = (v.producto_padre_id || '').trim();
    const lista   = variantesIndex.get(padreId) || [];
    lista.push(v);
    variantesIndex.set(padreId, lista);
  }

  // ── Paso 4: Upsert de productos ───────────────────────────────────────────────
  let creados   = 0;
  let actualizados = 0;
  let errores   = 0;
  const erroresList = [];

  for (let i = 0; i < productos.length; i += BATCH_SIZE) {
    const batch = productos.slice(i, i + BATCH_SIZE);

    for (const p of batch) {
      const idOriginal      = (p.id_original || '').trim();
      const nombreCategoria = (p.categoria  || '').trim();
      const hijos           = variantesIndex.get(idOriginal) || [];
      const categoriaDocId  = categoriaIdPorNombre.get(nombreCategoria) || null;

      const variantesData = hijos.map(v => ({
        id_original:   (v.id_original || '').trim(),
        sku_ean:       (v.sku_ean || '').trim(),
        volumen:       (v.volumen || '').trim(),
        stock:         parseInt(v.stock) || 0,
        precio:        parseDecimal(v.precio) || 0,
        // precio_oferta es primario (col 8, usuario lo ingresa)
        precio_oferta: (() => {
          const oferta = parseDecimal(v.precio_oferta);
          if (oferta && oferta > 0) return oferta;
          // fallback: calcular desde % descuento (col 9)
          const pct    = parseDecimal(v.pct_descuento);
          const precio = parseDecimal(v.precio);
          if (pct && precio) return Math.round(precio * (1 - pct / 100) * 100) / 100;
          return null;
        })(),
        publicado:    parseBoolean(v.publicado),
        envio:        (v.envio  || '').trim(),
        color_nombre: (v.color_nombre || '').trim() || null,
      }));

      // maxDescuento: calculado desde precio_oferta de las variantes
      const maxDescuento = hijos.reduce((max, v) => {
        const precioV  = parseDecimal(v.precio);
        const ofertaV  = parseDecimal(v.precio_oferta);
        const pct = ofertaV && precioV && precioV > 0
          ? Math.round((1 - ofertaV / precioV) * 100)
          : Math.round(parseDecimal(v.pct_descuento) || 0);
        return pct > max ? pct : max;
      }, 0);

      const precioProd       = parseDecimal(p.precio);
      // precio_oferta es primario (col Q, usuario lo ingresa)
      const precioOfertaProd = (() => {
        const raw = parseDecimal(p.precio_oferta);
        if (raw && raw > 0) return raw;
        // fallback: calcular desde % descuento (col R, calculado en Excel)
        const pct = parseDecimal(p.pct_descuento);
        if (pct && precioProd) return Math.round(precioProd * (1 - pct / 100) * 100) / 100;
        return null;
      })();
      // Calcular % descuento para Strapi desde precio y precio_oferta
      const pctDescProd = precioOfertaProd && precioProd && precioProd > 0
        ? Math.round((1 - precioOfertaProd / precioProd) * 100)
        : Math.round(parseDecimal(p.pct_descuento) || 0);

      const productoData = {
        id_original:     idOriginal,
        sku:             (p.sku || '').trim(),
        nombre:          (p.nombre || '').trim(),
        marca:           (p.marca || '').trim(),
        seccion:         (p.seccion || '').trim(),
        subcategoria:    (p.subcategoria || '').trim(),
        tipo:            (p.tipo || '').trim(),
        descripcion:     (p.descripcion || '').trim(),
        especificaciones: (p.especificaciones || '').trim(),
        proveedor:       (p.proveedor || '').trim(),
        publicado:       parseBoolean(p.publicado),
        destacado:       parseBoolean(p.destacado),
        stock:           parseInt(p.stock) || 0,
        descuento:       maxDescuento || pctDescProd,
        precio:          precioProd,
        precio_oferta:   precioOfertaProd,
        variantes:       variantesData,
        caracteristicas: (p.caracteristicas || '').trim() || null,
        ...(categoriaDocId ? { categoria: { documentId: categoriaDocId } } : {}),
      };

      try {
        // Buscar si ya existe por id_original
        const existentes = await strapi.documents(UID_PRODUCTO).findMany({
          filters: { id_original: { $eq: idOriginal } },
          limit: 1,
        });

        if (existentes.length > 0) {
          // Actualizar el existente
          await strapi.documents(UID_PRODUCTO).update({
            documentId: existentes[0].documentId,
            data: productoData,
            status: 'published',
          });
          actualizados++;
        } else {
          // Crear nuevo
          await strapi.documents(UID_PRODUCTO).create({
            data: productoData,
            status: 'published',
          });
          creados++;
        }
      } catch (err) {
        errores++;
        const msg = `"${(p.nombre || '').substring(0, 40)}" (${idOriginal}): ${err.message}`;
        erroresList.push(msg);
        addLog(`❌ ${msg}`);
      }
    }

    const procesados = Math.min(i + BATCH_SIZE, productos.length);
    addLog(`Progreso: ${procesados}/${productos.length} — ✅ Creados: ${creados} | 🔄 Actualizados: ${actualizados} | ❌ Errores: ${errores}`);
  }

  const elapsed = ((Date.now() - inicio) / 1000).toFixed(1);
  const resumen = {
    ok: true,
    totalProductos: productos.length,
    creados,
    actualizados,
    errores,
    erroresList,
    tiempoSegundos: parseFloat(elapsed),
    log,
  };

  addLog(`✅ Importación completada en ${elapsed}s`);

  // Guardar estado en memoria
  ultimaImportacion = {
    ...resumen,
    fecha: new Date().toISOString(),
  };

  return resumen;
}

// ─── Guardar archivo subido en carpeta temporal segura ────────────────────────
async function guardarArchivo(stream, nombreOriginal) {
  const tmpDir = path.join(os.tmpdir(), 'marybe-import');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  const ext = path.extname(nombreOriginal) || '.xlsx';
  const destino = path.join(tmpDir, `importacion-${Date.now()}${ext}`);

  await new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(destino);
    stream.pipe(writer);
    writer.on('finish', resolve);
    writer.on('error', reject);
  });

  return destino;
}

// ─── Obtener estado de la última importación ──────────────────────────────────
function obtenerUltimaImportacion() {
  return ultimaImportacion;
}

module.exports = () => ({
  procesarImportacion,
  guardarArchivo,
  obtenerUltimaImportacion,
});
