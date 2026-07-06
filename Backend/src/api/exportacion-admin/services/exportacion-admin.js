'use strict';

const ExcelJS = require('exceljs');

// ─── Constantes ───────────────────────────────────────────────────────────────
const UID_PRODUCTO = 'api::producto.producto';
const PAGE_SIZE    = 100; // Cuántos productos traer por request a Strapi

// ─── Paleta de colores (idéntica a generar-plantilla.js) ─────────────────────
const C = {
  violeta:       'FF7C6AF7',
  violetaClaro:  'FFEDE9FE',
  coral:         'FFF77C6A',
  coralClaro:    'FFFCE7E4',
  verde:         'FF22C55E',
  verdeClaro:    'FFD1FAE5',
  amarillo:      'FFFBBF24',
  amarilloClaro: 'FFFEF3C7',
  azul:          'FF3B82F6',
  azulClaro:     'FFDBEAFE',
  grisOscuro:    'FF1E1B4B',
  grisClaro:     'FFF8F7FF',
  grisMedio:     'FFE0DEFF',
  blanco:        'FFFFFFFF',
  rojo:          'FFEF4444',
  rojoClaro:     'FFFEE2E2',
  texto:         'FF1E1B4B',
  textomuted:    'FF6B7280',
  naranja:       'FFFFA500',
  naranjaClaro:  'FFFFF3E0',
};

// ─── Helpers de estilo (idénticos a generar-plantilla.js) ────────────────────
function headerStyle(bgColor, textColor = C.blanco) {
  return {
    fill:      { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } },
    font:      { bold: true, color: { argb: textColor }, size: 10, name: 'Calibri' },
    alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
    border: {
      top:    { style: 'thin', color: { argb: 'FFD4D4D4' } },
      bottom: { style: 'thin', color: { argb: 'FFD4D4D4' } },
      left:   { style: 'thin', color: { argb: 'FFD4D4D4' } },
      right:  { style: 'thin', color: { argb: 'FFD4D4D4' } },
    },
  };
}

function dataStyle(bgColor = C.blanco, textColor = C.texto) {
  return {
    fill:      { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } },
    font:      { color: { argb: textColor }, size: 10, name: 'Calibri' },
    alignment: { vertical: 'middle', wrapText: true },
    border: {
      top:    { style: 'hair', color: { argb: 'FFE5E7EB' } },
      bottom: { style: 'hair', color: { argb: 'FFE5E7EB' } },
      left:   { style: 'hair', color: { argb: 'FFE5E7EB' } },
      right:  { style: 'hair', color: { argb: 'FFE5E7EB' } },
    },
  };
}

function noteStyle() {
  return {
    fill:      { type: 'pattern', pattern: 'solid', fgColor: { argb: C.amarilloClaro } },
    font:      { color: { argb: 'FF92400E' }, size: 9, italic: true, name: 'Calibri' },
    alignment: { vertical: 'middle', wrapText: true },
  };
}

function readonlyStyle() {
  return {
    fill:      { type: 'pattern', pattern: 'solid', fgColor: { argb: C.verdeClaro } },
    font:      { color: { argb: 'FF065F46' }, size: 10, name: 'Calibri' },
    alignment: { vertical: 'middle', horizontal: 'center' },
    border: {
      top:    { style: 'hair', color: { argb: 'FFE5E7EB' } },
      bottom: { style: 'hair', color: { argb: 'FFE5E7EB' } },
      left:   { style: 'hair', color: { argb: 'FFE5E7EB' } },
      right:  { style: 'hair', color: { argb: 'FFE5E7EB' } },
    },
  };
}

function applyStyle(cell, style) {
  if (style.fill)      cell.fill      = style.fill;
  if (style.font)      cell.font      = style.font;
  if (style.alignment) cell.alignment = style.alignment;
  if (style.border)    cell.border    = style.border;
}

// ─── Helpers de datos ─────────────────────────────────────────────────────────
function boolStr(val) {
  return val === true || val === 1 || String(val).toLowerCase() === 'true' ? 'TRUE' : 'FALSE';
}

function safeNum(val) {
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

/**
 * Calcula el % de descuento dado precio normal y precio oferta.
 * Si ya hay un campo `descuento` en el producto, lo usa directamente.
 */
function calcPct(precio, precioOferta, descuentoExplicito) {
  if (descuentoExplicito && descuentoExplicito > 0) return descuentoExplicito;
  if (precio && precioOferta && precio > 0 && precioOferta < precio) {
    return Math.round(((precio - precioOferta) / precio) * 100);
  }
  return 0;
}

// ─── Traer TODOS los productos de Strapi con paginación ──────────────────────
async function fetchAllProductos(strapi) {
  const todos = [];
  let page = 1;

  while (true) {
    const resultado = await strapi.documents(UID_PRODUCTO).findMany({
      populate: ['variantes', 'categoria'],
      limit:  PAGE_SIZE,
      start:  (page - 1) * PAGE_SIZE,
      status: 'published',
    });

    if (!resultado || resultado.length === 0) break;
    todos.push(...resultado);

    if (resultado.length < PAGE_SIZE) break; // última página
    page++;
  }

  return todos;
}

// ─── Generador principal del Excel ───────────────────────────────────────────
async function generarExcel(strapi) {
  // 1. Obtener todos los productos actuales (incluyendo los editados desde el panel)
  strapi.log.info('[ExportAdmin] Obteniendo productos de Strapi...');
  const productos = await fetchAllProductos(strapi);
  strapi.log.info(`[ExportAdmin] ${productos.length} productos obtenidos`);

  // 2. Construir workbook
  const wb   = new ExcelJS.Workbook();
  wb.creator = 'Marybe';
  wb.created = new Date();

  // ══════════════════════════════════════════════════════════════════════════
  // HOJA 1: PRODUCTOS (columnas A–R, igual que importacion-admin)
  // ══════════════════════════════════════════════════════════════════════════
  const wsP = wb.addWorksheet('📦 Productos', {
    properties: { tabColor: { argb: C.violeta } },
    pageSetup:  { fitToPage: true, fitToWidth: 1, orientation: 'landscape' },
    views:      [{ state: 'frozen', xSplit: 0, ySplit: 3 }],
  });

  // Fila 1 — Título
  wsP.mergeCells('A1:R1');
  const titleP     = wsP.getCell('A1');
  titleP.value     = `📦 MARYBE — Exportación de Productos (${new Date().toLocaleDateString('es-AR')})`;
  titleP.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.grisOscuro } };
  titleP.font      = { bold: true, color: { argb: C.blanco }, size: 14, name: 'Calibri' };
  titleP.alignment = { horizontal: 'center', vertical: 'middle' };
  wsP.getRow(1).height = 36;

  // Fila 2 — Instrucción
  wsP.mergeCells('A2:R2');
  const instrP     = wsP.getCell('A2');
  instrP.value     = `⚠ Exportación generada el ${new Date().toLocaleString('es-AR')} — ${productos.length} productos exportados. Compatible con la Plantilla de Importación Marybe.`;
  applyStyle(instrP, noteStyle());
  wsP.getRow(2).height = 28;

  // Columnas con anchos (idéntico a generar-plantilla.js)
  const colDefsP = [
    { header: 'ID Original *',    width: 14, group: 'base',   note: 'ID único del producto' },
    { header: 'SKU / EAN',        width: 18, group: 'base',   note: 'Código de barras o código interno' },
    { header: 'Nombre *',         width: 40, group: 'base',   note: 'Nombre completo del producto' },
    { header: 'Marca',            width: 16, group: 'base',   note: 'Marca comercial' },
    { header: 'Sección *',        width: 16, group: 'cat',    note: 'Nivel 1: Perfumería o Hogar' },
    { header: 'Categoría',        width: 22, group: 'cat',    note: 'Nivel 2' },
    { header: 'Subcategoría',     width: 22, group: 'cat',    note: 'Nivel 3' },
    { header: 'Tipo',             width: 22, group: 'cat',    note: 'Nivel 4' },
    { header: 'Descripción',      width: 60, group: 'extra',  note: 'Descripción del producto' },
    { header: 'Especificaciones', width: 50, group: 'extra',  note: 'Especificaciones técnicas' },
    { header: 'Proveedor',        width: 28, group: 'extra',  note: 'Nombre del proveedor' },
    { header: 'Publicado',        width: 12, group: 'extra',  note: 'TRUE = visible | FALSE = oculto' },
    { header: 'Destacado',        width: 12, group: 'extra',  note: 'TRUE = destacado | FALSE = normal' },
    { header: 'Moneda',           width: 10, group: 'extra',  note: 'ARS, USD, EUR' },
    { header: 'Características',  width: 40, group: 'extra',  note: 'Separadas por |' },
    { header: 'Precio *',         width: 16, group: 'precio', note: 'Precio de lista' },
    { header: '% Descuento',      width: 14, group: 'precio', note: 'Porcentaje de descuento (0-100)' },
    { header: 'Precio Oferta 🔒', width: 16, group: 'precio', note: 'Calculado automáticamente' },
  ];

  wsP.columns = colDefsP.map(h => ({ width: h.width }));

  // Fila 3 — Headers con colores por grupo
  const rowHeaderP = wsP.getRow(3);
  colDefsP.forEach((h, i) => {
    const cell = rowHeaderP.getCell(i + 1);
    cell.value = h.header;
    const color = h.group === 'base' ? C.violeta
      : h.group === 'cat'   ? C.azul
      : h.group === 'precio' ? C.verde
      : C.grisOscuro;
    applyStyle(cell, headerStyle(color));
    if (h.note) cell.note = { texts: [{ text: h.note }] };
  });
  rowHeaderP.height = 30;

  // ─ Filas de datos ─
  let rowIdxP  = 3;
  let totalVariantes = 0;

  for (const prod of productos) {
    rowIdxP++;
    const isEven  = rowIdxP % 2 === 0;
    const bgColor = isEven ? C.blanco : C.grisClaro;

    // Calcular % descuento del producto principal
    const precioNum       = safeNum(prod.precio);
    const precioOfertaNum = safeNum(prod.precio_oferta);
    const pctDesc         = calcPct(precioNum, precioOfertaNum, prod.descuento);

    const valores = [
      prod.id_original   || String(prod.id || ''),  // A: ID Original
      prod.sku            || '',                      // B: SKU/EAN
      prod.nombre         || '',                      // C: Nombre
      prod.marca          || '',                      // D: Marca
      prod.seccion        || '',                      // E: Sección
      prod.categoria?.nombre || '',                   // F: Categoría (relación)
      prod.subcategoria   || '',                      // G: Subcategoría
      prod.tipo           || '',                      // H: Tipo
      prod.descripcion    || '',                      // I: Descripción
      prod.especificaciones || '',                    // J: Especificaciones
      prod.proveedor      || '',                      // K: Proveedor
      boolStr(prod.publicado),                        // L: Publicado
      boolStr(prod.destacado),                        // M: Destacado
      prod.moneda         || 'ARS',                   // N: Moneda
      prod.caracteristicas || '',                     // O: Características
      // P, Q, R: con estilos especiales (abajo)
    ];

    const r = wsP.getRow(rowIdxP);
    r.height = 20;

    // Columnas A–O
    valores.forEach((val, ci) => {
      const cell = r.getCell(ci + 1);
      cell.value = val;
      applyStyle(cell, dataStyle(bgColor));

      // Categorías en azul (E,F,G,H = índices 4-7)
      if (ci >= 4 && ci <= 7) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isEven ? C.azulClaro : 'FFBFDBFE' } };
        cell.font = { color: { argb: '1E3A5F' }, size: 10, name: 'Calibri' };
      }
      // Publicado/Destacado en verde/rojo (L,M = índices 11,12)
      if (ci === 11 || ci === 12) {
        cell.font = { bold: true, color: { argb: val === 'TRUE' ? '16A34A' : 'EF4444' }, size: 10 };
      }
    });

    // P: Precio
    const cP = r.getCell(16);
    if (precioNum !== null) cP.value = precioNum;
    applyStyle(cP, dataStyle(isEven ? C.verdeClaro : 'FFD1FAE5'));
    cP.font      = { bold: true, color: { argb: '065F46' }, size: 10, name: 'Calibri' };
    cP.alignment = { vertical: 'middle', horizontal: 'right' };

    // Q: % Descuento
    const cQ = r.getCell(17);
    cQ.value = pctDesc;
    applyStyle(cQ, dataStyle(isEven ? C.verdeClaro : 'FFD1FAE5'));
    cQ.font      = { color: { argb: '065F46' }, size: 10, name: 'Calibri' };
    cQ.alignment = { vertical: 'middle', horizontal: 'center' };

    // R: Precio Oferta (fórmula igual que en importación)
    const cR = r.getCell(18);
    cR.value = { formula: `IF(Q${rowIdxP}>0,ROUND(P${rowIdxP}*(1-Q${rowIdxP}/100),2),"")` };
    // Si ya hay precio_oferta guardado, también lo ponemos como valor de caché
    if (precioOfertaNum !== null) cR.value = precioOfertaNum;
    applyStyle(cR, readonlyStyle());
    cR.font = { color: { argb: 'FF065F46' }, size: 10, name: 'Calibri', italic: true };

    r.commit();
    totalVariantes += (prod.variantes || []).length;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // HOJA 2: VARIANTES (columnas A–M, igual que importacion-admin)
  // ══════════════════════════════════════════════════════════════════════════
  const wsV = wb.addWorksheet('🔗 Variantes', {
    properties: { tabColor: { argb: C.coral } },
    pageSetup:  { fitToPage: true, fitToWidth: 1, orientation: 'landscape' },
    views:      [{ state: 'frozen', xSplit: 0, ySplit: 3 }],
  });

  // Fila 1 — Título
  wsV.mergeCells('A1:M1');
  const titleV     = wsV.getCell('A1');
  titleV.value     = '🔗 MARYBE — Variantes exportadas';
  titleV.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7C3AED' } };
  titleV.font      = { bold: true, color: { argb: C.blanco }, size: 14, name: 'Calibri' };
  titleV.alignment = { horizontal: 'center', vertical: 'middle' };
  wsV.getRow(1).height = 36;

  // Fila 2 — Instrucción
  wsV.mergeCells('A2:M2');
  const instrV     = wsV.getCell('A2');
  instrV.value     = '⚠ Una fila por variante. "producto_padre_id" debe coincidir con el "ID Original" de la hoja Productos. Columnas C e I son calculadas automáticamente.';
  applyStyle(instrV, noteStyle());
  wsV.getRow(2).height = 28;

  // Columnas (idéntico a generar-plantilla.js)
  const colDefsV = [
    { header: 'ID Variante *',            width: 16, color: C.coral,     note: 'ID único de esta variante' },
    { header: 'ID Producto Padre *',      width: 18, color: C.coral,     note: 'Debe coincidir con ID Original de Productos' },
    { header: 'Nombre Producto Padre 🔒', width: 32, color: C.verde,     note: 'Calculado automáticamente con BUSCARV' },
    { header: 'SKU / EAN',               width: 18, color: C.grisOscuro, note: 'Código de barras único de esta variante' },
    { header: 'Volumen / Tamaño',         width: 16, color: C.grisOscuro, note: 'Ej: 30 ml, 50 ml, 100 ml' },
    { header: 'Stock',                    width: 10, color: C.grisOscuro, note: 'Cantidad disponible' },
    { header: 'Precio *',                 width: 14, color: C.coral,     note: 'Precio de venta normal' },
    { header: '% Descuento',              width: 14, color: C.grisOscuro, note: 'Porcentaje de descuento (0-100)' },
    { header: 'Precio Oferta 🔒',         width: 16, color: C.verde,     note: 'Calculado automáticamente' },
    { header: 'Publicado',                width: 12, color: C.grisOscuro, note: 'TRUE = visible | FALSE = oculto' },
    { header: 'Envío',                    width: 10, color: C.grisOscuro, note: '1 = tiene envío | 0 = sin envío' },
    { header: 'Moneda',                   width: 10, color: C.grisOscuro, note: 'ARS, USD, EUR' },
    { header: '🎨 Color',                width: 20, color: C.naranja,    note: 'Nombre del color' },
  ];

  wsV.columns = colDefsV.map(h => ({ width: h.width }));

  // Fila 3 — Headers
  const rowHeaderV = wsV.getRow(3);
  colDefsV.forEach((h, i) => {
    const cell = rowHeaderV.getCell(i + 1);
    cell.value = h.header;
    applyStyle(cell, headerStyle(h.color));
    if (h.note) cell.note = { texts: [{ text: h.note }] };
  });
  rowHeaderV.height = 30;

  // ─ Filas de variantes ─
  let rowIdxV = 3;

  for (const prod of productos) {
    const padreIdOriginal = prod.id_original || String(prod.id || '');
    const variantes       = prod.variantes   || [];

    // Si el producto no tiene variantes, exportar igual con una fila "vacía" de variante
    // para que sea re-importable (la importación necesita al menos una variante)
    const filasVariantes = variantes.length > 0 ? variantes : [{
      id_original:  `${padreIdOriginal}-v1`,
      sku_ean:      prod.sku  || '',
      volumen:      '',
      stock:        0,
      precio:       prod.precio || 0,
      precio_oferta: prod.precio_oferta || null,
      publicado:    prod.publicado !== false,
      envio:        '1',
      moneda:       prod.moneda || 'ARS',
      color_nombre: null,
    }];

    for (const v of filasVariantes) {
      rowIdxV++;
      const isEven  = rowIdxV % 2 === 0;
      const bgColor = isEven ? C.blanco : 'FFFFF7ED';

      const precioV       = safeNum(v.precio);
      const precioOfertaV = safeNum(v.precio_oferta);
      const pctDescV      = calcPct(precioV, precioOfertaV, 0);

      const r = wsV.getRow(rowIdxV);
      r.height = 20;

      // A: ID Variante
      const cA = r.getCell(1);
      cA.value = v.id_original || '';
      applyStyle(cA, dataStyle(bgColor));

      // B: ID Producto Padre
      const cB = r.getCell(2);
      cB.value = padreIdOriginal;
      applyStyle(cB, dataStyle(bgColor));

      // C: Nombre Padre (fórmula VLOOKUP)
      const cC = r.getCell(3);
      cC.value = { formula: `IF(B${rowIdxV}<>"",IFERROR(VLOOKUP(B${rowIdxV},'📦 Productos'!A:C,3,FALSE),""),"")` };
      applyStyle(cC, readonlyStyle());

      // D: SKU/EAN
      const cD = r.getCell(4);
      cD.value = v.sku_ean || '';
      applyStyle(cD, dataStyle(bgColor));

      // E: Volumen
      const cE = r.getCell(5);
      cE.value = v.volumen || '';
      applyStyle(cE, dataStyle(bgColor));

      // F: Stock
      const cF = r.getCell(6);
      cF.value = v.stock !== undefined && v.stock !== null ? Number(v.stock) : 0;
      applyStyle(cF, dataStyle(bgColor));
      cF.alignment = { vertical: 'middle', horizontal: 'center' };

      // G: Precio
      const cG = r.getCell(7);
      if (precioV !== null) cG.value = precioV;
      applyStyle(cG, dataStyle(bgColor));
      cG.font = { bold: true, color: { argb: C.grisOscuro }, size: 10, name: 'Calibri' };

      // H: % Descuento
      const cH = r.getCell(8);
      cH.value = pctDescV;
      applyStyle(cH, dataStyle(bgColor));
      if (pctDescV > 0) cH.font = { bold: true, color: { argb: '7C3AED' }, size: 10 };

      // I: Precio Oferta (valor real si existe, si no fórmula)
      const cI = r.getCell(9);
      if (precioOfertaV !== null) {
        cI.value = precioOfertaV;
      } else {
        cI.value = { formula: `IF(H${rowIdxV}>0,ROUND(G${rowIdxV}*(1-H${rowIdxV}/100),2),"")` };
      }
      applyStyle(cI, readonlyStyle());

      // J: Publicado
      const cJ = r.getCell(10);
      cJ.value = boolStr(v.publicado);
      cJ.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
      cJ.font  = { bold: true, color: { argb: cJ.value === 'TRUE' ? '16A34A' : 'EF4444' }, size: 10 };
      cJ.alignment = { vertical: 'middle' };

      // K: Envío
      const cK = r.getCell(11);
      cK.value = v.envio !== undefined && v.envio !== null ? String(v.envio) : '1';
      applyStyle(cK, dataStyle(bgColor));
      cK.alignment = { vertical: 'middle', horizontal: 'center' };

      // L: Moneda
      const cL = r.getCell(12);
      cL.value = v.moneda || 'ARS';
      applyStyle(cL, dataStyle(bgColor));

      // M: Color
      const cM = r.getCell(13);
      cM.value = v.color_nombre || '';
      applyStyle(cM, dataStyle(bgColor));

      r.commit();
    }
  }

  // 3. Serializar a buffer en memoria (sin escribir a disco)
  const buffer = await wb.xlsx.writeBuffer();

  return {
    buffer,
    totalProductos: productos.length,
    totalVariantes,
  };
}

// ─── Exports ──────────────────────────────────────────────────────────────────
module.exports = () => ({
  generarExcel,
});
