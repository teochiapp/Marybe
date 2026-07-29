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
  // Fórmula guardada SIN result (ej: Excel re-guardado por LibreOffice):
  // el objeto tiene { formula: '...' } pero no 'result'. Devolvemos ''.
  if (cell.value && typeof cell.value === 'object' && 'formula' in cell.value) {
    return '';
  }
  // Cualquier otro objeto inesperado (evita "[object Object]" en el log)
  if (cell.value && typeof cell.value === 'object') {
    return '';
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
  if (val === null || val === undefined || val.toString().trim() === '') return null;
  if (typeof val === 'number') return val;
  let str = val.toString().trim();
  if (str.includes(',')) {
    // Formato español: 1.000,50 -> 1000.50
    str = str.replace(/\./g, '').replace(',', '.');
  }
  const num = parseFloat(str);
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

// ─── Validación y diagnóstico pre-importación ──────────────────────────────────────
function validarYDiagnosticar(productos, variantes, addLog) {
  addLog('─────────────────────────────────────────────');
  addLog('🔎 DIAGNÓSTICO PRE-IMPORTACIÓN');
  addLog('─────────────────────────────────────────────');

  const productosFiltrados = [];
  const productosSinId = [];

  // 1. Filtrar productos sin ID
  for (const p of productos) {
    const id = (p.id_original || '').trim();
    if (!id) {
      productosSinId.push(p.nombre || '(sin nombre)');
    } else {
      productosFiltrados.push(p);
    }
  }

  if (productosSinId.length > 0) {
    addLog(`⚠️  ${productosSinId.length} producto(s) IGNORADOS por no tener ID Original:`);
    productosSinId.slice(0, 10).forEach(n => addLog(`     └ "${n}"`))
    if (productosSinId.length > 10) addLog(`     ... y ${productosSinId.length - 10} más`);
  }

  // 2. Construir set de IDs válidos
  const idsProductos = new Set(productosFiltrados.map(p => (p.id_original || '').trim()));

  // 3. Clasificar variantes
  const variantesFiltradas = [];
  const variantesSinPadre  = [];
  const variantesSinId     = [];

  for (const v of variantes) {
    const id      = (v.id_original       || '').trim();
    const padreId = (v.producto_padre_id || '').trim();

    if (!id) {
      variantesSinId.push(`padre="${padreId}"`);
      continue;
    }
    if (!padreId || !idsProductos.has(padreId)) {
      variantesSinPadre.push({ id, padreId, nombre_col3: v.nombre_col3 || '' });
      continue;
    }
    variantesFiltradas.push(v);
  }

  // 4. Productos sin variantes asociadas
  const idsConVariante = new Set(variantesFiltradas.map(v => (v.producto_padre_id || '').trim()));
  const productosSinVariante = productosFiltrados.filter(p => !idsConVariante.has((p.id_original || '').trim()));

  // 5. Imprimir diagnóstico
  addLog(`📦 Productos con ID válido: ${productosFiltrados.length}`);
  addLog(`🔗 Variantes válidas (con padre en Productos): ${variantesFiltradas.length}`);

  if (variantesSinId.length > 0) {
    addLog(`⚠️  ${variantesSinId.length} variante(s) IGNORADAS por no tener ID propio:`);
    variantesSinId.slice(0, 5).forEach(v => addLog(`     └ ${v}`));
    if (variantesSinId.length > 5) addLog(`     ... y ${variantesSinId.length - 5} más`);
  }

  if (variantesSinPadre.length > 0) {
    addLog(`⚠️  ${variantesSinPadre.length} variante(s) IGNORADAS porque su ID Producto Padre NO existe en la hoja Productos:`);
    addLog(`   Estos productos fueron escritos en la hoja Variantes en lugar de Productos.`);
    addLog(`   Agreguélos primero a la hoja Productos y vuelva a importar.`);
    variantesSinPadre.slice(0, 15).forEach(v =>
      addLog(`     └ Variante ID="${v.id}" | PadreID="${v.padreId}" (no existe en Productos)`)
    );
    if (variantesSinPadre.length > 15) addLog(`     ... y ${variantesSinPadre.length - 15} más`);
  }

  if (productosSinVariante.length > 0) {
    const conPrecio = productosSinVariante.filter(p => parseDecimal(p.precio) > 0);
    const sinPrecio = productosSinVariante.filter(p => !(parseDecimal(p.precio) > 0));
    if (conPrecio.length > 0) {
      addLog(`🟡 ${conPrecio.length} producto(s) sin variantes pero CON precio (se creará variante auto -v1):`);
      conPrecio.slice(0, 5).forEach(p =>
        addLog(`     └ "${(p.nombre || '').substring(0, 50)}" (ID: ${p.id_original}) | Precio: ${p.precio}`)
      );
      if (conPrecio.length > 5) addLog(`     ... y ${conPrecio.length - 5} más`);
    }
    if (sinPrecio.length > 0) {
      addLog(`🔵 ${sinPrecio.length} producto(s) sin variantes en Excel y SIN precio (sus variantes en BD NO serán tocadas):`);
      sinPrecio.slice(0, 5).forEach(p =>
        addLog(`     └ "${(p.nombre || '').substring(0, 50)}" (ID: ${p.id_original})`)
      );
      if (sinPrecio.length > 5) addLog(`     ... y ${sinPrecio.length - 5} más`);
    }
  }

  addLog('─────────────────────────────────────────────');

  return { productosFiltrados, variantesFiltradas, variantesSinPadre, variantesSinId, productosSinId };
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
  const { productos: productosRaw, variantes: variantesRaw } = await leerExcel(rutaExcel);

  addLog(`📦 ${productosRaw.length} productos encontrados en el Excel (hoja Productos)`);
  addLog(`🔗 ${variantesRaw.length} variantes encontradas en el Excel (hoja Variantes)`);

  // ── Validación y diagnóstico ───────────────────────────────────────────────────────
  const validacion = validarYDiagnosticar(productosRaw, variantesRaw, addLog);
  const productos  = validacion.productosFiltrados;
  const variantes  = validacion.variantesFiltradas;

  addLog(`✅ Se procesarán: ${productos.length} productos | ${variantes.length} variantes`);
  if (validacion.productosSinId.length > 0) {
    addLog(`⏩ Productos omitidos (sin ID): ${validacion.productosSinId.length}`);
  }
  if (validacion.variantesSinPadre.length > 0) {
    addLog(`⏩ Variantes omitidas (padre inexistente): ${validacion.variantesSinPadre.length}`);
  }

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

      // Determinar si corresponde crear una variante automática o no:
      //   - Si hay variantes en el Excel    → usarlas (caso normal)
      //   - Si NO hay variantes Y precio > 0 → crear variante auto -v1 (Combo / producto simple)
      //   - Si NO hay variantes Y precio = 0 → el producto maneja precios vía variantes reales
      //     en la BD; NO crear -v1 ni tocar las variantes existentes.
      const precioProdNum = parseDecimal(p.precio);
      const tieneVariantesEnExcel = hijos.length > 0;
      const crearAutoVariante = !tieneVariantesEnExcel && precioProdNum > 0;

      // null = no hay variantes para importar → no incluir la key en productoData
      const hijosEfectivos = tieneVariantesEnExcel
        ? hijos
        : crearAutoVariante
          ? [{
              id_original:   `${idOriginal}-v1`,
              sku_ean:       (p.sku || '').trim(),
              volumen:       '',
              stock:         (p.stock || '0'),
              precio:        p.precio,
              precio_oferta: p.precio_oferta || '',
              pct_descuento: p.pct_descuento || '',
              publicado:     p.publicado,
              envio:         '1',
              color_nombre:  '',
            }]
          : null; // precio=0 y sin variantes en Excel → no tocar variantes de la BD

      // undefined = Strapi no recibirá la key, por lo que no modificará variantes existentes
      const variantesData = hijosEfectivos
        ? hijosEfectivos.map(v => ({
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
          }))
        : undefined;


      // maxDescuento: calculado desde precio_oferta de las variantes (incluye la auto-creada)
      // Si hijosEfectivos es null (no hay variantes que importar), maxDescuento = 0
      const maxDescuento = (hijosEfectivos || []).reduce((max, v) => {
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
        // Solo incluir variantes si hay datos reales (undefined = no tocar las de la BD)
        ...(variantesData !== undefined ? { variantes: variantesData } : {}),
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
    totalProductos:          productos.length,
    productosSinId:          validacion.productosSinId.length,
    variantesOmitidasSinPadre: validacion.variantesSinPadre.length,
    variantesOmitidasSinId:  validacion.variantesSinId.length,
    creados,
    actualizados,
    errores,
    erroresList,
    tiempoSegundos: parseFloat(elapsed),
    log,
  };

  addLog('─────────────────────────────────────────────');
  addLog(`✅ Importación completada en ${elapsed}s`);
  addLog(`   └ ✅ Creados:       ${creados}`);
  addLog(`   └ 🔄 Actualizados:  ${actualizados}`);
  addLog(`   └ ❌ Errores:       ${errores}`);
  if (validacion.productosSinId.length > 0)
    addLog(`   └ ⏩ Omitidos sin ID:         ${validacion.productosSinId.length}`);
  if (validacion.variantesSinPadre.length > 0)
    addLog(`   └ ⏩ Variantes sin padre:     ${validacion.variantesSinPadre.length} (padre no estaba en hoja Productos)`);
  if (validacion.variantesSinId.length > 0)
    addLog(`   └ ⏩ Variantes sin ID propio: ${validacion.variantesSinId.length}`);
  addLog('─────────────────────────────────────────────');

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

// ─── Verificación de Integridad de Precios ──────────────────────────────────────
async function verificarPreciosIntegridad(strapi) {
  const productos = await strapi.documents(UID_PRODUCTO).findMany({
    populate: ['variantes'],
    where: { publicado: true },
    limit: 10000
  });

  const discrepancias = [];
  let totalRevisados = 0;

  for (const p of productos) {
    if (!p.variantes || p.variantes.length === 0) continue;
    totalRevisados++;

    for (const v of p.variantes) {
      // Solo analizar si hay discrepancia numérica entre variante y producto padre
      if (Number(v.precio) !== Number(p.precio) || Number(v.precio_oferta) !== Number(p.precio_oferta)) {

        const padreId           = p.id_original || String(p.id);
        const esUnica           = p.variantes.length === 1;
        const sinAtributos      = !(v.volumen || '').trim() && !(v.color_nombre || '').trim();
        const precioPadreValido = Number(p.precio) > 0;

        // Consistente con el exportador: una variante es "sintética" solo si
        // su id termina en -v1, O si es única + sin atributos + precio padre > 0
        // Y su precio coincide con el padre (redundante → no debería diferir).
        // Una variante única sin atributos con precio DISTINTO al padre es legítima.
        const precioVariante = Number(v.precio);
        const precioCoincide = precioVariante === Number(p.precio);

        const esSintetica = v.id_original === `${padreId}-v1`
          || (esUnica && sinAtributos && precioPadreValido && precioCoincide);

        discrepancias.push({
          id_original:            p.id_original || String(p.id),
          nombre:                 p.nombre,
          precio_producto:        p.precio,
          precio_oferta_producto: p.precio_oferta,
          precio_variante:        v.precio,
          precio_oferta_variante: v.precio_oferta,
          volumen:                v.volumen || '',
          color:                  v.color_nombre || '',
          esErrorCritico:         esSintetica,
        });
      }
    }
  }

  const erroresCriticos = discrepancias.filter(d => d.esErrorCritico);
  const variacionesValidas = discrepancias.filter(d => !d.esErrorCritico);

  return {
    totalProductos:        productos.length,
    totalRevisados,
    erroresCriticos:       erroresCriticos.length,
    variacionesDiferentes: variacionesValidas.length,
    detalles:              erroresCriticos.slice(0, 100), // hasta 100 errores para el front
  };
}

module.exports = () => ({
  procesarImportacion,
  guardarArchivo,
  obtenerUltimaImportacion,
  verificarPreciosIntegridad
});
