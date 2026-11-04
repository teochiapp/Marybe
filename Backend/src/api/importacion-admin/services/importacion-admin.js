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
function traducirErrorValidacion(mensaje) {
  return String(mensaje).replace(
    /\b([\w.]+) must be one of the following values:([^\n]*)/g,
    (_, campo, valores) => `${campo === 'seccion' ? 'La sección' : `El campo ${campo}`} debe ser uno de los siguientes valores: ${valores.split(',').map(v => v.trim()).filter(Boolean).join(', ')}`
  );
}

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
  const num = Number(str);
  return Number.isFinite(num) ? num : null;
}

function parseExcelNumber(value, label, row) {
  const parsed = parseDecimal(value);
  if (value !== '' && value !== null && value !== undefined && parsed === null) {
    throw new Error(`Fila ${row}: ${label} "${value}" no es un número válido.`);
  }
  return parsed;
}

function parseExcelStock(value, row) {
  const parsed = parseExcelNumber(value, 'Stock', row);
  if (parsed !== null && (!Number.isInteger(parsed) || parsed < 0)) {
    throw new Error(`Fila ${row}: Stock debe ser un entero mayor o igual a cero.`);
  }
  return parsed;
}

function sameFields(left, right, keys) {
  return keys.every(key => String(left?.[key] ?? '').trim() === String(right?.[key] ?? '').trim());
}

function dataHasChanges(newData, oldData) {
  const classificationFields = ['seccion', 'categoria', 'subcategoria', 'tipo'];
  const variantFields = ['id_original', 'sku_ean', 'volumen', 'stock', 'precio', 'precio_oferta', 'publicado', 'envio', 'color_nombre'];
  for (const [key, value] of Object.entries(newData)) {
    if (key === 'variantes' || key === 'clasificaciones') continue;
    if (key === 'categoria') {
      if (String(value?.documentId ?? value ?? '') !== String(oldData.categoria?.documentId ?? oldData.categoria ?? '')) return true;
    } else if (String(value ?? '').trim() !== String(oldData[key] ?? '').trim()) return true;
  }
  if (newData.clasificaciones) {
    const current = oldData.clasificaciones || [];
    if (newData.clasificaciones.length !== current.length) return true;
    if (newData.clasificaciones.some((item, index) => !sameFields(item, current[index], classificationFields))) return true;
  }
  if (newData.variantes) {
    const current = oldData.variantes || [];
    if (newData.variantes.length !== current.length) return true;
    if (newData.variantes.some(item => !sameFields(item, current.find(v => v.id_original === item.id_original), variantFields))) return true;
  }
  return false;
}

// ─── Agrupar filas duplicadas por id_original ─────────────────────────────────
//
// Opción A (recomendada): varias filas con el mismo ID en el Excel.
// La PRIMERA fila aporta todos los datos base (nombre, precio, marca, etc.).
// CADA fila (incluida la primera) aporta una clasificación al array.
//
// Regla de conflicto: si la fila N tiene un precio distinto al de la fila 1,
// se ignora y se loguea un warning. Los datos base siempre los manda la fila 1.
//
// Resultado: array de productos únicos, cada uno con:
//   { ...datosDeFila1, clasificaciones: [{ seccion, categoria, subcategoria, tipo }, ...] }
//
function agruparFilasDuplicadas(filas, addLog) {
  const mapaProductos = new Map(); // id_original → producto agrupado
  const warnings = [];

  for (const fila of filas) {
    const id = (fila.id_original || '').trim();
    if (!id) continue;

    const clasificacion = {
      seccion:      (fila.seccion      || '').trim(),
      categoria:    (fila.categoria    || '').trim(),
      subcategoria: (fila.subcategoria || '').trim(),
      tipo:         (fila.tipo         || '').trim(),
    };

    if (!mapaProductos.has(id)) {
      // Primera fila para este ID → establece los datos base
      mapaProductos.set(id, {
        ...fila,
        clasificaciones: [clasificacion],
      });
    } else {
      // Fila duplicada → solo añade la clasificación
      const existente = mapaProductos.get(id);

      // Detectar conflictos en datos base (precio, nombre, marca)
      if (fila.nombre && existente.nombre && fila.nombre.trim() !== existente.nombre.trim()) {
        warnings.push(`⚠️  CONFLICTO en nombre para ID="${id}": fila 1="${existente.nombre}", fila extra="${fila.nombre}" → se usa fila 1`);
      }
      if (fila.precio && existente.precio && String(fila.precio).trim() !== String(existente.precio).trim()) {
        warnings.push(`⚠️  CONFLICTO en precio para ID="${id}": fila 1="${existente.precio}", fila extra="${fila.precio}" → se usa fila 1`);
      }

      // Evitar clasificaciones duplicadas exactas
      const claveClasif = `${clasificacion.seccion}|${clasificacion.categoria}|${clasificacion.subcategoria}|${clasificacion.tipo}`;
      const yaExiste = existente.clasificaciones.some(
        c => `${c.seccion}|${c.categoria}|${c.subcategoria}|${c.tipo}` === claveClasif
      );

      if (!yaExiste) {
        existente.clasificaciones.push(clasificacion);
      }
    }
  }

  // Loguear warnings
  if (addLog && warnings.length > 0) {
    warnings.forEach(w => addLog(w));
  }

  return Array.from(mapaProductos.values());
}

// ─── Leer el Excel y extraer filas de productos y variantes ──────────────────
async function leerExcel(rutaArchivo) {
  const wb = new ExcelJS.Workbook();
  try {
    await wb.xlsx.readFile(rutaArchivo);
  } catch (cause) {
    const error = new Error('El archivo no es un Excel .xlsx válido o está dañado. Descargá una plantilla nueva y volvé a intentarlo.');
    error.code = 'INVALID_EXCEL';
    error.cause = cause;
    throw error;
  }

  const wsProveedor = wb.getWorksheet('💲 Precios por Proveedor');
  const wsProductos = wb.getWorksheet('📦 Productos');

  const filasRaw = [];  // filas crudas (antes de agrupar)
  const variantes = [];
  let hasVariantesSheet = false;
  let isPartialUpdate = false;
  let isModoAlta = false; // Marcador de plantilla vacía MODO_ALTA

  // ─── Detectar marcador MODO_ALTA en celda AA1 (columna 27) de la hoja Productos ───
  if (wsProductos) {
    const cellMarcador = wsProductos.getCell(1, 27);
    const valMarcador  = cellMarcador && cellMarcador.value ? String(cellMarcador.value).trim() : '';
    if (valMarcador === 'MODO_ALTA') {
      isModoAlta = true;
    }
  }

  // ─── LECTURA MODO PROVEEDOR (1 hoja, actualización rápida) ───
  if (wsProveedor) {
    isPartialUpdate = true;
    let currentPadreId = null;

    wsProveedor.eachRow((row, rowNum) => {
      if (rowNum <= HEADER_ROW) return;
      if (isSeparatorOrEmpty(row)) return;

      const rawId = cellVal(row, 1);
      if (!rawId) return;

      const isVariante = rawId.startsWith('↳') || rawId.trim().startsWith('↳');
      const cleanId = rawId.replace('↳', '').trim();

      // Nuevos índices de columna con el formato A–O (15 columnas):
      //   A(1) ID  B(2) SKU  C(3) Proveedor  D(4) Nombre
      //   E(5) Sección  F(6) Categoría  G(7) Subcategoría  H(8) Tipo
      //   I(9) Publicado  J(10) Destacado  K(11) Tamaño  L(12) Stock
      //   M(13) Precio  N(14) Precio Oferta  O(15) % Desc.
      const sku_raw       = cellVal(row, 2);
      const seccion       = cellVal(row, 5);
      const categoria     = cellVal(row, 6);
      const subcategoria  = cellVal(row, 7);
      const tipo          = cellVal(row, 8);
      const publicado_raw = cellVal(row, 9);
      const destacado_raw = cellVal(row, 10);
      const stock         = cellVal(row, 12);
      const precio        = cellVal(row, 13);
      const precio_oferta = cellVal(row, 14);
      parseExcelStock(stock, rowNum);
      parseExcelNumber(precio, 'Precio', rowNum);
      parseExcelNumber(precio_oferta, 'Precio Oferta', rowNum);

      if (!isVariante) {
        currentPadreId = cleanId;
        filasRaw.push({
          id_original:   cleanId,
          _excelRow:     rowNum,
          sku:           sku_raw,
          seccion:       seccion,
          categoria:     categoria,
          subcategoria:  subcategoria,
          tipo:          tipo,
          publicado:     publicado_raw,
          destacado:     destacado_raw,
          stock:         stock,
          precio:        precio,
          precio_oferta,
        });
      } else {
        if (!currentPadreId) return; // Variante huérfana
        const volumen_raw = cellVal(row, 11); // K: Tamaño / Variante
        variantes.push({
          id_original:       cleanId,
          _excelRow:         rowNum,
          producto_padre_id: currentPadreId,
          sku_ean:           sku_raw,
          publicado:         publicado_raw,
          volumen:           volumen_raw,
          stock:             stock,
          precio:            precio,
          precio_oferta,
        });
      }
    });

    // En formato proveedor simulamos que existe hoja de variantes para que no borre las existentes.
    hasVariantesSheet = true;
  }
  // ─── LECTURA CLÁSICA (2 hojas completas) ───
  else if (wsProductos) {
    wsProductos.eachRow((row, rowNum) => {
      if (rowNum <= HEADER_ROW) return;
      if (isSeparatorOrEmpty(row)) return;
      const id_original = cellVal(row, 1);
      if (!id_original) return;
      parseExcelStock(cellVal(row, 14), rowNum);
      parseExcelNumber(cellVal(row, 16), 'Precio del producto', rowNum);
      parseExcelNumber(cellVal(row, 17), 'Precio Oferta del producto', rowNum);

      filasRaw.push({
        id_original,
        _excelRow:       rowNum,
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
        precio_oferta:   cellVal(row, 17),
        pct_descuento:   cellVal(row, 18),
      });
    });

    const wsV = wb.getWorksheet('🔗 Variantes') || wb.worksheets.find(ws => ws.name !== 'Listas' && ws !== wsProductos);
    if (!wsV) throw new Error('No se encontró la hoja de Variantes en el Excel.');

    wsV.eachRow((row, rowNum) => {
      if (rowNum <= HEADER_ROW) return;
      if (isSeparatorOrEmpty(row)) return;
      const id_original = cellVal(row, 1);
      if (!id_original) return;
      parseExcelStock(cellVal(row, 6), rowNum);

      const precio           = cellVal(row, 7);
      const precio_oferta_raw = cellVal(row, 8);
      parseExcelNumber(precio, 'Precio de variante', rowNum);
      parseExcelNumber(precio_oferta_raw, 'Precio Oferta de variante', rowNum);

      variantes.push({
        id_original,
        _excelRow:         rowNum,
        producto_padre_id: cellVal(row, 2),
        sku_ean:           cellVal(row, 4),
        volumen:           cellVal(row, 5),
        stock:             cellVal(row, 6) || '0',
        precio,
        precio_oferta:     precio_oferta_raw,
        publicado:         cellVal(row, 10) || 'TRUE',
        envio:             cellVal(row, 11) || '1',
        color_nombre:      cellVal(row, 12),
      });
    });
    hasVariantesSheet = true;
  } else {
    throw new Error('Formato de Excel no reconocido. Faltan hojas de Productos o Precios por Proveedor.');
  }

  // ─── AGRUPAMIENTO: filas duplicadas por ID → clasificaciones[] ───────────────
  // Se hace SIEMPRE (modo clásico y modo proveedor) después de leer las filas.
  // La función recibe las filas crudas y devuelve productos con clasificaciones[].
  // addLog no está disponible aquí todavía, se pasará en procesarImportacion().
  const productos = filasRaw; // se agrupará en procesarImportacion() con acceso a addLog

  return { filasRaw: productos, variantes, hasVariantesSheet, isPartialUpdate, isModoAlta };
}

// ─── Validación y diagnóstico pre-importación ──────────────────────────────────────
// NOTA: recibe productos YA AGRUPADOS (con clasificaciones[])
function validarYDiagnosticar(productos, variantes, hasVariantesSheet, addLog) {
  addLog('─────────────────────────────────────────────');
  addLog('🔎 DIAGNÓSTICO PRE-IMPORTACIÓN');
  addLog('─────────────────────────────────────────────');

  const productosFiltrados = [];
  const productosSinId = [];
  const productosEjemplo = [];

  // 1. Filtrar productos sin ID y productos de ejemplo (EJEMPLO-*)
  for (const p of productos) {
    const id = (p.id_original || '').trim();
    if (!id) {
      productosSinId.push(p.nombre || '(sin nombre)');
    } else if (id.toUpperCase().startsWith('EJEMPLO-')) {
      // Fila de plantilla de ejemplo — se ignora automáticamente
      productosEjemplo.push(id);
    } else {
      productosFiltrados.push(p);
    }
  }

  if (productosSinId.length > 0) {
    addLog(`⚠️  ${productosSinId.length} producto(s) IGNORADOS por no tener ID Original:`);
    productosSinId.slice(0, 10).forEach(n => addLog(`     └ "${n}"`))
    if (productosSinId.length > 10) addLog(`     ... y ${productosSinId.length - 10} más`);
  }

  // 1b. Loguear filas de ejemplo omitidas
  if (productosEjemplo.length > 0) {
    addLog(`🗑️  ${productosEjemplo.length} fila(s) de EJEMPLO omitidas automáticamente (ID comienza con "EJEMPLO-"):`);
    productosEjemplo.forEach(id => addLog(`     └ ID: "${id}"`));
  }

  // 1c. Loguear productos con múltiples clasificaciones
  const multiClasif = productosFiltrados.filter(p => p.clasificaciones && p.clasificaciones.length > 1);
  if (multiClasif.length > 0) {
    addLog(`🏷️  ${multiClasif.length} producto(s) con MÚLTIPLES CLASIFICACIONES:`);
    multiClasif.slice(0, 10).forEach(p => {
      addLog(`     └ "${p.nombre || p.id_original}" → ${p.clasificaciones.length} clasificaciones`);
    });
    if (multiClasif.length > 10) addLog(`     ... y ${multiClasif.length - 10} más`);
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
    // Ignorar variantes de ejemplo automáticamente
    if (id.toUpperCase().startsWith('EJEMPLO-') || padreId.toUpperCase().startsWith('EJEMPLO-')) {
      continue;
    }
    if (!padreId || !idsProductos.has(padreId)) {
      variantesSinPadre.push({ id, padreId, nombre_col3: v.nombre_col3 || '' });
      continue;
    }
    variantesFiltradas.push(v);
  }

  const idsConVariante = new Set(variantesFiltradas.map(v => (v.producto_padre_id || '').trim()));
  const productosSinVariante = productosFiltrados.filter(p => !idsConVariante.has((p.id_original || '').trim()));

  addLog(`📦 Productos únicos con ID válido: ${productosFiltrados.length}`);
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
    addLog(`🔵 ${productosSinVariante.length} producto(s) sin variantes en el Excel. Se conservan las variantes internas ocultas; si falta una variante comercial se rechaza ese producto:`);
    productosSinVariante.slice(0, 5).forEach(p =>
      addLog(`     └ "${(p.nombre || '').substring(0, 50)}" (ID: ${p.id_original}) | Precio: ${p.precio || '(sin precio)'}`)
    );
    if (productosSinVariante.length > 5) addLog(`     ... y ${productosSinVariante.length - 5} más`);
  }

  addLog('─────────────────────────────────────────────');

  return { productosFiltrados, variantesFiltradas, variantesSinPadre, variantesSinId, productosSinId };
}

// ─── Upsert de categoría ───────────────────────────────────────────────────────
async function upsertCategoria(strapi, { nombre, seccion, subcategoriasMap }) {
  const nombreTrim = (nombre || '').trim();
  if (!nombreTrim) return null;

  const encontrados = await strapi.documents(UID_CAT).findMany({
    filters: {
      nombre: { $eq: nombreTrim },
      seccion: { $eq: seccion || '' }
    },
    populate: {
      subcategorias: {
        populate: ['tipos']
      }
    },
    limit: 1,
  });

  if (encontrados.length > 0) {
    const catExistente = encontrados[0];
    const subcatsExistentes = catExistente.subcategorias || [];
    let modificado = false;

    const nuevasSubcatsParaMerge = [];

    for (const [subName, tiposSet] of subcategoriasMap.entries()) {
      const subExistente = subcatsExistentes.find(s => s.nombre.trim() === subName);
      if (subExistente) {
        // Merge de tipos en subcategoría existente
        const tiposExistentes = subExistente.tipos || [];
        const nombresTiposExistentes = new Set(tiposExistentes.map(t => t.nombre.trim()));
        let tiposModificados = false;

        for (const tipoName of tiposSet) {
          if (!nombresTiposExistentes.has(tipoName)) {
            tiposExistentes.push({ nombre: tipoName });
            tiposModificados = true;
          }
        }
        if (tiposModificados) {
          subExistente.tipos = tiposExistentes;
          modificado = true;
        }
      } else {
        // Nueva subcategoría con sus tipos
        nuevasSubcatsParaMerge.push({
          nombre: subName,
          tipos: Array.from(tiposSet).map(t => ({ nombre: t }))
        });
      }
    }

    if (nuevasSubcatsParaMerge.length > 0 || (seccion && catExistente.seccion !== seccion) || modificado) {
      const dataUpdate = {};
      if (seccion && catExistente.seccion !== seccion) {
        dataUpdate.seccion = seccion;
      }
      if (nuevasSubcatsParaMerge.length > 0 || modificado) {
        // Se preservan los IDs de subcatsExistentes para que Strapi actualice en lugar de recrear
        dataUpdate.subcategorias = [...subcatsExistentes, ...nuevasSubcatsParaMerge];
      }

      await strapi.documents(UID_CAT).update({
        documentId: catExistente.documentId,
        data: dataUpdate,
        status: 'published'
      });
    }

    return catExistente.documentId;
  }

  // Si la categoría no existe, creamos todo desde cero
  const subcatData = [];
  for (const [subName, tiposSet] of subcategoriasMap.entries()) {
    subcatData.push({
      nombre: subName,
      tipos: Array.from(tiposSet).map(t => ({ nombre: t }))
    });
  }

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

// ─── Función principal de importación (wrapper para el Controller) ─────────────
async function procesarImportacion(strapi, rutaExcel) {
  const inicio = Date.now();
  const log = [];

  const addLog = (msg) => {
    strapi.log.info(`[ImportAdmin] ${msg}`);
    log.push(msg);
  };

  addLog(`📂 Leyendo archivo: ${path.basename(rutaExcel)}`);

  // 1. Leer el Excel (devuelve filas crudas sin agrupar)
  const { filasRaw, variantes: variantesRaw, hasVariantesSheet, isPartialUpdate, isModoAlta } = await leerExcel(rutaExcel);

  addLog(`📦 ${filasRaw.length} filas de productos encontradas en el Excel (antes de agrupar)`);
  addLog(`🔗 ${variantesRaw.length} variantes encontradas en el Excel (hoja Variantes)`);

  // 2. Agrupar filas duplicadas → productos con clasificaciones[]
  const productosAgrupados = agruparFilasDuplicadas(filasRaw, addLog);

  const filasConMultipleClasif = productosAgrupados.filter(p => p.clasificaciones && p.clasificaciones.length > 1);
  if (filasConMultipleClasif.length > 0) {
    addLog(`🏷️  Agrupamiento completado: ${filasRaw.length} filas → ${productosAgrupados.length} productos únicos`);
    addLog(`   └ ${filasConMultipleClasif.length} producto(s) con múltiples clasificaciones`);
  } else {
    addLog(`🏷️  Agrupamiento completado: ${productosAgrupados.length} productos únicos (todos con 1 clasificación)`);
  }

  if (isPartialUpdate) {
    addLog('🟢 MODO PROVEEDOR DETECTADO: Actualización parcial (solo stock y precios).');
  }
  if (isModoAlta) {
    addLog('🟡 MODO ALTA DETECTADO: Solo se crearán productos NUEVOS. Si algún ID ya existe en la BD se cancelará la importación.');
  }

  // 3. Validación y diagnóstico (sobre productos ya agrupados)
  const validacion = validarYDiagnosticar(productosAgrupados, variantesRaw, hasVariantesSheet, addLog);
  const productos  = validacion.productosFiltrados;
  const variantes  = validacion.variantesFiltradas;

  addLog(`✅ Se procesarán: ${productos.length} productos | ${variantes.length} variantes`);
  if (validacion.productosSinId.length > 0) {
    addLog(`⏩ Productos omitidos (sin ID): ${validacion.productosSinId.length}`);
  }
  if (validacion.variantesSinPadre.length > 0) {
    addLog(`⏩ Variantes omitidas (padre inexistente): ${validacion.variantesSinPadre.length}`);
  }

  // 4. Ejecutar Upsert
  return await ejecutarUpsert(strapi, productos, variantes, hasVariantesSheet, isPartialUpdate, isModoAlta, validacion, addLog, log, inicio);
}

// ─── Proceso principal de BD (Categorías y Productos) ────────────────────────────────────
async function ejecutarUpsert(strapi, productos, variantes, hasVariantesSheet, isPartialUpdate, isModoAlta, validacion, addLog, log, inicio) {

  // ─── MODO ALTA: Validar que ningún ID del Excel ya exista en la BD ────────────────
  if (isModoAlta && productos.length > 0) {
    addLog('🔍 MODO ALTA: Verificando que los IDs no existan en la BD...');
    const idsAVerificar = productos.map(p => (p.id_original || '').trim()).filter(Boolean);
    const duplicados    = [];

    // Verificar en batches de 50 para no sobrecargar la BD
    for (let i = 0; i < idsAVerificar.length; i += 50) {
      const batch = idsAVerificar.slice(i, i + 50);
      for (const id of batch) {
        const existe = await strapi.db.query(UID_PRODUCTO).findOne({
          where: { id_original: id },
          select: ['id', 'id_original', 'nombre'],
        });
        if (existe) {
          duplicados.push({
            id_original: id,
            nombre: existe.nombre || '',
          });
        }
      }
    }

    if (duplicados.length > 0) {
      const idsStr = duplicados.map(d => `"${d.id_original}"`).join(', ');
      addLog(`❌ MODO ALTA cancelado: ${duplicados.length} ID(s) ya existen en la BD: ${idsStr}`);
      addLog('⚠️  Correccón: Cambiá los IDs por valores únicos que no existan en el catálogo.');
      addLog('─────────────────────────────────────────────');

      ultimaImportacion = {
        ok:             false,
        fecha:          new Date().toISOString(),
        errorModoAlta:  true,
        duplicados,
        log,
      };

      return {
        ok:            false,
        errorModoAlta: true,
        duplicados,
        log,
      };
    }

    addLog(`✅ Todos los IDs son únicos. Procediendo con la importación...`);
  }

  // ─── Procesar categorías de TODAS las clasificaciones ────────────────────────
  // Un producto puede tener N clasificaciones → N categorías a upsertear.
  const categoriasMap = new Map();

  for (const p of productos) {
    const clasificaciones = p.clasificaciones || [];

    for (const clasif of clasificaciones) {
      const cat    = (clasif.categoria    || '').trim();
      const seccion = (clasif.seccion     || '').trim();
      const subcat  = (clasif.subcategoria || '').trim();
      const tipo    = (clasif.tipo         || '').trim();
      if (!cat) continue;

      const keyCat = `${seccion}__${cat}`;
      if (!categoriasMap.has(keyCat)) {
        categoriasMap.set(keyCat, { nombre: cat, seccion, subcategoriasMap: new Map() });
      }
      if (subcat) {
        const subcatsMap = categoriasMap.get(keyCat).subcategoriasMap;
        if (!subcatsMap.has(subcat)) {
          subcatsMap.set(subcat, new Set());
        }
        if (tipo) {
          subcatsMap.get(subcat).add(tipo);
        }
      }
    }
  }

  if (categoriasMap.size > 0) {
    addLog(`🗂 Procesando ${categoriasMap.size} categorías...`);
  }
  const categoriaIdPorNombre = new Map();
  const categoriasFallidas = new Map();

  for (const [keyCat, { nombre, seccion, subcategoriasMap }] of categoriasMap) {
    try {
      const docId = await upsertCategoria(strapi, {
        nombre,
        seccion,
        subcategoriasMap,
      });
      categoriaIdPorNombre.set(keyCat, docId);
    } catch (e) {
      const mensaje = traducirErrorValidacion(e.message);
      categoriasFallidas.set(keyCat, mensaje);
      addLog(`❌ Error en categoría "${nombre}": ${mensaje}`);
    }
  }

  const variantesIndex = new Map();
  for (const v of variantes) {
    const padreId = (v.producto_padre_id || '').trim();
    const lista   = variantesIndex.get(padreId) || [];
    lista.push(v);
    variantesIndex.set(padreId, lista);
  }

  let creados   = 0;
  let actualizados = 0;
  let sinCambios = 0;
  let errores   = 0;
  const erroresList = [];
  const actualizadosDetalle = [];

  for (let i = 0; i < productos.length; i += BATCH_SIZE) {
    const batch = productos.slice(i, i + BATCH_SIZE);

    for (const p of batch) {
      const idOriginal      = (p.id_original || '').trim();
      const hijos           = variantesIndex.get(idOriginal) || [];
      const hijosEfectivos = hijos.length > 0 ? hijos : null;

      const variantesData = hijosEfectivos
        ? hijosEfectivos.map(v => isPartialUpdate ? {
            id_original: (v.id_original || '').trim(),
            ...(v.sku_ean ? { sku_ean: v.sku_ean.trim() } : {}),
            ...(v.stock !== '' ? { stock: parseExcelStock(v.stock, v._excelRow) } : {}),
            ...(v.precio !== '' ? { precio: parseDecimal(v.precio) } : {}),
            precio_oferta: parseDecimal(v.precio_oferta),
            ...(v.publicado !== '' ? { publicado: parseBoolean(v.publicado) } : {}),
          } : {
            id_original: (v.id_original || '').trim(),
            sku_ean: (v.sku_ean || '').trim(),
            volumen: (v.volumen || '').trim(),
            stock: parseExcelStock(v.stock, v._excelRow) ?? 0,
            precio: parseDecimal(v.precio) ?? 0,
            precio_oferta: parseDecimal(v.precio_oferta),
            publicado: parseBoolean(v.publicado),
            envio: (v.envio || '').trim(),
            color_nombre: (v.color_nombre || '').trim() || null,
          })
        : (isPartialUpdate ? undefined : []);


      const maxDescuento = (hijosEfectivos || []).reduce((max, v) => {
        const precioV  = parseDecimal(v.precio);
        const ofertaV  = parseDecimal(v.precio_oferta);
        const pct = ofertaV && precioV && precioV > 0
          ? Math.round((1 - ofertaV / precioV) * 100) : 0;
        return pct > max ? pct : max;
      }, 0);

      // Calculate minimum prices from variants for sorting fallback
      const minPrecioVariantes = (hijosEfectivos || []).reduce((min, v) => {
        const pv = parseDecimal(v.precio);
        if (pv && pv > 0) return min === null ? pv : Math.min(min, pv);
        return min;
      }, null);

      let precioProd       = parseDecimal(p.precio) ?? minPrecioVariantes;
      const precioOfertaProd = parseDecimal(p.precio_oferta);

      const pctDescProd = precioOfertaProd && precioProd && precioProd > 0
        ? Math.round((1 - precioOfertaProd / precioProd) * 100)
        : 0;

      // ─── Construir el array de clasificaciones para Strapi ───────────────────
      // Siempre reemplaza (idempotente): el Excel es la fuente de verdad.
      const clasificacionesData = (p.clasificaciones || []).map(c => ({
        seccion:      (c.seccion      || '').trim(),
        categoria:    (c.categoria    || '').trim(),
        subcategoria: (c.subcategoria || '').trim(),
        tipo:         (c.tipo         || '').trim(),
      }));

      // ─── Primera clasificación para campos planos de retrocompatibilidad ─────
      const primeraClasif = clasificacionesData[0] || {};
      const nombreCat1    = (primeraClasif.categoria || '').trim();
      const seccion1      = (primeraClasif.seccion   || '').trim();
      const keyCat1       = `${seccion1}__${nombreCat1}`;
      const catDocId1     = categoriaIdPorNombre.get(keyCat1) || null;

      let productoData = isPartialUpdate ? {
        ...(p.stock !== '' ? { stock: parseExcelStock(p.stock, p._excelRow) } : {}),
        ...(p.precio !== '' ? { precio: precioProd } : {}),
        precio_oferta: precioOfertaProd,
      } : {
        stock: parseExcelStock(p.stock, p._excelRow) ?? 0,
        descuento: maxDescuento || pctDescProd,
        precio: precioProd,
        precio_oferta: precioOfertaProd,
        clasificaciones: clasificacionesData,
      };

      // En MODO PROVEEDOR, también actualizamos los campos de categoría, visibilidad y SKU
      // si el usuario los completó en el Excel (celdas no vacías).
      if (isPartialUpdate) {
        // Actualizar campos planos desde la primera clasificación
        if (primeraClasif.seccion)      productoData.seccion      = primeraClasif.seccion;
        if (primeraClasif.subcategoria) productoData.subcategoria = primeraClasif.subcategoria;
        if (primeraClasif.tipo)         productoData.tipo         = primeraClasif.tipo;
        // SKU: actualizar si la celda tiene valor (permite cambiar el SKU desde la plantilla)
        const skuVal = (p.sku || '').trim();
        if (skuVal) productoData.sku = skuVal;

        // Publicado y Destacado: usar parseBoolean para manejar todos los formatos posibles
        // (SI/NO, TRUE/FALSE, true/false, 1/0, SÍ, etc.)
        const pubRaw = (p.publicado || '').trim();
        if (pubRaw !== '') {
          productoData.publicado = parseBoolean(pubRaw);
        }

        const destRaw = (p.destacado || '').trim();
        if (destRaw !== '') {
          productoData.destacado = parseBoolean(destRaw);
        }

      }

      if (!isPartialUpdate) {
        productoData = {
          ...productoData,
          id_original:     idOriginal,
          sku:             (p.sku || '').trim(),
          nombre:          (p.nombre || '').trim(),
          marca:           (p.marca || '').trim(),
          // Campos planos de retrocompatibilidad (primera clasificación)
          seccion:         primeraClasif.seccion      || '',
          subcategoria:    primeraClasif.subcategoria || '',
          tipo:            primeraClasif.tipo          || '',
          descripcion:     (p.descripcion || '').trim(),
          especificaciones: (p.especificaciones || '').trim(),
          proveedor:       (p.proveedor || '').trim(),
          publicado:       parseBoolean(p.publicado),
          destacado:       parseBoolean(p.destacado),
          caracteristicas: (p.caracteristicas || '').trim() || null,
          // Relación categoria (retrocompatibilidad): vincula la primera clasificación
          categoria:       catDocId1 ? catDocId1 : null,
        };
      }

      if (variantesData !== undefined) {
        productoData.variantes = variantesData;
      }

      try {
        const categoriaFallida = (p.clasificaciones || []).find(c =>
          categoriasFallidas.has(`${(c.seccion || '').trim()}__${(c.categoria || '').trim()}`));
        if (categoriaFallida) {
          const key = `${categoriaFallida.seccion.trim()}__${categoriaFallida.categoria.trim()}`;
          throw new Error(`No se pudo guardar la categoría "${categoriaFallida.categoria}": ${categoriasFallidas.get(key)}. El producto quedó sin cambios.`);
        }
        const existente = await strapi.db.query(UID_PRODUCTO).findOne({
          where: { id_original: idOriginal },
          populate: ['variantes', 'clasificaciones', 'categoria']
        });

        if (existente) {
          const existentes = existente.variantes || [];
          if (isPartialUpdate) {
            const byId = new Map(existentes.map(v => [v.id_original, v]));
            const primeraExistente = existente.clasificaciones?.[0] || {};
            const nuevaPrimera = { ...primeraExistente };
            for (const field of ['seccion', 'categoria', 'subcategoria', 'tipo']) {
              if (primeraClasif[field]) nuevaPrimera[field] = primeraClasif[field];
            }
            const changedCategory = ['seccion', 'categoria'].some(field =>
              String(nuevaPrimera[field] || '').trim() !== String(primeraExistente[field] || '').trim());
            if (changedCategory && nombreCat1 && catDocId1) productoData.categoria = catDocId1;
            if (['seccion', 'categoria', 'subcategoria', 'tipo'].some(field => nuevaPrimera[field])) {
              productoData.clasificaciones = [nuevaPrimera, ...(existente.clasificaciones || []).slice(1)];
            }
            // La hoja de proveedor muestra el tamaño y el color juntos como referencia.
            // Solo precios, stock, SKU y visibilidad de variantes son editables allí.
            if (variantesData) {
              for (const v of variantesData) {
                if (!byId.has(v.id_original)) throw new Error(`Variante ${v.id_original} (fila ${hijos.find(h => h.id_original === v.id_original)?._excelRow}): no existe en el producto. Usá la plantilla general para crear variantes.`);
              }
              productoData.variantes = existentes.map(v => ({ ...v, ...(variantesData.find(edit => edit.id_original === v.id_original) || {}) }));
            }
            const finalVariants = productoData.variantes || existentes;
            const effectivePrice = productoData.precio ?? existente.precio;
            const effectiveOffer = productoData.precio_oferta;
            const parentDiscount = effectivePrice > 0 && effectiveOffer > 0 && effectiveOffer < effectivePrice
              ? Math.round((1 - effectiveOffer / effectivePrice) * 100) : 0;
            const variantDiscount = finalVariants.reduce((max, v) => v.precio > 0 && v.precio_oferta > 0 && v.precio_oferta < v.precio
              ? Math.max(max, Math.round((1 - v.precio_oferta / v.precio) * 100)) : max, 0);
            const changedOffer = Number(effectiveOffer ?? 0) !== Number(existente.precio_oferta ?? 0) ||
              variantesData?.some(v => Number(v.precio_oferta ?? 0) !== Number(byId.get(v.id_original)?.precio_oferta ?? 0));
            if (changedOffer) {
              productoData.descuento = Math.max(parentDiscount, variantDiscount);
            }
          } else {
            const inputIds = new Set((variantesData || []).map(v => v.id_original));
            const hidden = v => v.id_original === `${idOriginal}-v1` ||
              (existentes.length === 1 && !v.volumen && !v.color_nombre);
            const missingReal = existentes.filter(v => !inputIds.has(v.id_original) && !hidden(v));
            if (missingReal.length) {
              throw new Error(`Faltan variantes existentes: ${missingReal.map(v => v.id_original || `ID interno ${v.id}`).join(', ')}. Se conservó el producto sin cambios; restaurá las filas en la hoja Variantes.`);
            }
            const oldById = new Map(existentes.map(v => [v.id_original, v]));
            const merged = (variantesData || []).map(v => ({ ...(oldById.get(v.id_original) || {}), ...v }));
            merged.push(...existentes.filter(v => !inputIds.has(v.id_original) && hidden(v)));
            if (merged.length) productoData.variantes = merged;
            else delete productoData.variantes;
            productoData.clasificaciones = clasificacionesData.map((c, index) => ({
              ...(existente.clasificaciones?.[index]?.id ? { id: existente.clasificaciones[index].id } : {}), ...c,
            }));
          }
          if (!dataHasChanges(productoData, existente)) {
            sinCambios++;
          } else {
            await strapi.documents(UID_PRODUCTO).update({
              documentId: existente.documentId,
              data: productoData,
              status: 'published',
            });
            actualizados++;
            if (actualizadosDetalle.length < 50) {
              actualizadosDetalle.push(`Fila ${p._excelRow || '?'} · producto ${idOriginal}${p.nombre ? ` (${p.nombre.substring(0, 80)})` : ''}`);
            }
          }
        } else {
          if (isPartialUpdate) throw new Error('El producto no existe. La planilla de proveedores solo actualiza productos existentes; usá la plantilla de alta para crearlo.');
          await strapi.documents(UID_PRODUCTO).create({
            data: productoData,
            status: 'published',
          });
          creados++;
        }
      } catch (err) {
        errores++;
        const msg = `Fila ${p._excelRow || '?'} · producto ${idOriginal}${p.nombre ? ` (${p.nombre.substring(0, 40)})` : ''}: ${traducirErrorValidacion(err.message)}`;
        erroresList.push(msg);
        addLog(`❌ ${msg}`);
      }
    }

  }

  addLog(`🔄 Republicando ${categoriaIdPorNombre.size} categorías para asentar relaciones...`);
  for (const [keyCat, docId] of categoriaIdPorNombre) {
    try {
      await strapi.documents(UID_CAT).publish({
        documentId: docId
      });
    } catch (e) {
      addLog(`❌ Error al republicar categoría: ${e.message}`);
    }
  }

  const elapsed = ((Date.now() - inicio) / 1000).toFixed(1);
  const resumen = {
    ok: errores === 0 && validacion.productosSinId.length === 0 &&
      validacion.variantesSinPadre.length === 0 && validacion.variantesSinId.length === 0,
    totalProductos:          productos.length,
    productosSinId:          validacion.productosSinId.length,
    variantesOmitidasSinPadre: validacion.variantesSinPadre.length,
    variantesOmitidasSinId:  validacion.variantesSinId.length,
    creados,
    actualizados,
    sinCambios,
    errores,
    erroresList,
    tiempoSegundos: parseFloat(elapsed),
    log,
  };

  addLog('─────────────────────────────────────────────');
  addLog(`${resumen.ok ? '✅ Importación completada' : '⚠️ Importación parcial'} en ${elapsed}s`);
  addLog(`   └ ✅ Creados:       ${creados}`);
  addLog(`   └ 🔄 Actualizados:  ${actualizados}`);
  addLog(`   └ ⏩ Sin cambios:    ${sinCambios}`);
  addLog(`   └ ❌ Errores:       ${errores}`);
  if (actualizadosDetalle.length) {
    addLog('🔄 Productos actualizados:');
    actualizadosDetalle.forEach(detalle => addLog(`   └ ${detalle}`));
    if (actualizados > actualizadosDetalle.length) {
      addLog(`   └ ... y ${actualizados - actualizadosDetalle.length} producto(s) actualizado(s) más`);
    }
  }
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
      const padreId = p.id_original || String(p.id);
      const sinAtributos = !(v.volumen || '').trim() && !(v.color_nombre || '').trim();
      const esSintetica = v.id_original === `${padreId}-v1` || sinAtributos;

      const precioPadreNum = Number(p.precio) || 0;

      // Si el padre no tiene precio (es null o 0) y esta es una variante real (no fantasma),
      // es el comportamiento esperado: el precio vive en las variantes. No es discrepancia.
      if (precioPadreNum === 0 && !esSintetica) {
        continue;
      }

      // Analizar si hay discrepancia numérica entre variante y producto padre
      if (Number(v.precio) !== precioPadreNum || Number(v.precio_oferta) !== Number(p.precio_oferta)) {

        // Consistente con el nuevo exportador: toda variante sin atributos (sin volumen
        // ni color) es considerada sintética/fantasma.
        // Si el padre no tiene precio, y la variante fantasma SÍ, la perdonamos porque
        // ya agregamos un fallback en el frontend para que la tienda funcione con esta data.
        // Solo es Error Crítico si el padre SÍ tiene precio y la variante fantasma lo contradice.
        const esErrorCritico = esSintetica && precioPadreNum > 0;

        discrepancias.push({
          id_original:            p.id_original || String(p.id),
          nombre:                 p.nombre,
          precio_producto:        p.precio,
          precio_oferta_producto: p.precio_oferta,
          precio_variante:        v.precio,
          precio_oferta_variante: v.precio_oferta,
          volumen:                v.volumen || '',
          color:                  v.color_nombre || '',
          esErrorCritico:         esErrorCritico,
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

// ─── Migración one-shot de clasificaciones existentes ─────────────────────────
async function migrarClasificacionesExistentes(strapi, offset = 0, limit = 500) {
  const todos = await strapi.documents(UID_PRODUCTO).findMany({
    populate: {
      clasificaciones: true,
      categoria: true,
    },
    start: offset,
    limit: limit,
  });

  let migrados = 0;
  let omitidos = 0;
  let sinDatos = 0;
  let errores  = 0;
  const erroresList = [];

  for (const prod of todos) {
    if (prod.clasificaciones && prod.clasificaciones.length > 0) {
      omitidos++;
      continue;
    }

    const seccion      = (prod.seccion || prod.categoria?.seccion || '').trim();
    const categoria    = (prod.categoria?.nombre || '').trim();
    const subcategoria = (prod.subcategoria || '').trim();
    const tipo         = (prod.tipo || '').trim();

    if (!seccion && !categoria && !subcategoria && !tipo) {
      sinDatos++;
      continue;
    }

    try {
      await strapi.documents(UID_PRODUCTO).update({
        documentId: prod.documentId,
        data: {
          clasificaciones: [
            { seccion, categoria, subcategoria, tipo }
          ]
        },
        status: 'published',
      });
      migrados++;
    } catch (err) {
      errores++;
      erroresList.push({ id: prod.id_original || prod.documentId, error: err.message });
    }
  }

  return {
    ok: true,
    total: todos.length,
    migrados,
    omitidos,
    sinDatos,
    errores,
    erroresList: erroresList.slice(0, 50),
  };
}

module.exports = () => ({
  procesarImportacion,
  guardarArchivo,
  obtenerUltimaImportacion,
  verificarPreciosIntegridad,
  migrarClasificacionesExistentes,
  // Exportar agruparFilasDuplicadas para tests
  agruparFilasDuplicadas,
});

