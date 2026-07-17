'use strict';

const ExcelJS = require('exceljs');

const UID_PRODUCTO = 'api::producto.producto';
const PAGE_SIZE    = 100;

// ─── Paleta (igual a exportacion-admin) ──────────────────────────────────────
const C = {
  violeta:      'FF7C6AF7',
  violetaClaro: 'FFEDE9FE',
  coral:        'FFF77C6A',
  coralClaro:   'FFFCE7E4',
  verde:        'FF22C55E',
  verdeClaro:   'FFD1FAE5',
  azul:         'FF3B82F6',
  azulClaro:    'FFDBEAFE',
  amarilloClaro:'FFFEF3C7',
  grisOscuro:   'FF1E1B4B',
  grisClaro:    'FFF8F7FF',
  blanco:       'FFFFFFFF',
  texto:        'FF1E1B4B',
};

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

function applyStyle(cell, style) {
  if (style.fill)      cell.fill      = style.fill;
  if (style.font)      cell.font      = style.font;
  if (style.alignment) cell.alignment = style.alignment;
  if (style.border)    cell.border    = style.border;
}

// ─── Traer todos los productos con paginación ─────────────────────────────────
async function fetchAllProductos(strapi) {
  const todos = [];
  let page = 1;
  while (true) {
    const resultado = await strapi.documents(UID_PRODUCTO).findMany({
      populate: ['variantes'],
      limit:    PAGE_SIZE,
      start:    (page - 1) * PAGE_SIZE,
      status:   'published',
    });
    if (!resultado || resultado.length === 0) break;
    todos.push(...resultado);
    if (resultado.length < PAGE_SIZE) break;
    page++;
  }
  return todos;
}

// ─── Generador del Excel de comparación ──────────────────────────────────────
async function generarExcelComparacion(strapi) {
  strapi.log.info('[ComparacionAdmin] Obteniendo productos...');
  const productos = await fetchAllProductos(strapi);
  strapi.log.info(`[ComparacionAdmin] ${productos.length} productos obtenidos`);

  const wb   = new ExcelJS.Workbook();
  wb.creator = 'Marybe';
  wb.created = new Date();

  const ws = wb.addWorksheet('📋 Comparación', {
    properties: { tabColor: { argb: C.azul } },
    pageSetup:  { fitToPage: true, fitToWidth: 1, orientation: 'landscape' },
    views:      [{ state: 'frozen', xSplit: 0, ySplit: 3 }],
  });

  // ── Fila 1: Título ──────────────────────────────────────────────────────────
  ws.mergeCells('A1:E1');
  const title     = ws.getCell('A1');
  title.value     = `📋 MARYBE — Comparación de Stock (${new Date().toLocaleDateString('es-AR')})`;
  title.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.grisOscuro } };
  title.font      = { bold: true, color: { argb: C.blanco }, size: 14, name: 'Calibri' };
  title.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 36;

  // ── Fila 2: Instrucción ─────────────────────────────────────────────────────
  ws.mergeCells('A2:E2');
  const instr = ws.getCell('A2');
  instr.value = `⚠ Generado el ${new Date().toLocaleString('es-AR')} — ${productos.length} productos. Las variantes aparecen indentadas debajo de su producto padre.`;
  applyStyle(instr, noteStyle());
  ws.getRow(2).height = 28;

  // ── Columnas ────────────────────────────────────────────────────────────────
  const colDefs = [
    { header: 'ID / ID Variante', width: 22 },
    { header: 'Código de Barras (EAN / SKU)', width: 28 },
    { header: 'Descripción', width: 60 },
    { header: 'Stock', width: 12 },
    { header: 'Proveedor', width: 30 },
  ];

  ws.columns = colDefs.map(c => ({ width: c.width }));

  // ── Fila 3: Headers ─────────────────────────────────────────────────────────
  const rowHeader = ws.getRow(3);
  colDefs.forEach((c, i) => {
    const cell = rowHeader.getCell(i + 1);
    cell.value = c.header;
    applyStyle(cell, headerStyle(C.azul));
  });
  rowHeader.height = 30;

  // ── Filas de datos ──────────────────────────────────────────────────────────
  let rowIdx     = 3;
  let totalVariantes = 0;

  for (const prod of productos) {
    rowIdx++;
    const isEven  = rowIdx % 2 === 0;
    const bgProd  = isEven ? C.blanco : C.grisClaro;

    // ── Fila del Producto ────────────────────────────────────────────────────
    const rProd = ws.getRow(rowIdx);
    rProd.height = 22;

    // A: ID
    const cA = rProd.getCell(1);
    cA.value = prod.id_original || String(prod.id || '');
    applyStyle(cA, dataStyle(bgProd));
    cA.font = { bold: true, color: { argb: C.grisOscuro }, size: 10, name: 'Calibri' };

    // B: SKU/EAN
    const cB = rProd.getCell(2);
    cB.value = prod.sku || '';
    applyStyle(cB, dataStyle(bgProd));

    // C: Descripción (nombre del producto)
    const cC = rProd.getCell(3);
    cC.value = prod.nombre || '';
    applyStyle(cC, dataStyle(bgProd));
    cC.font = { bold: true, color: { argb: C.grisOscuro }, size: 10, name: 'Calibri' };

    // D: Stock del producto (solo si no tiene variantes)
    const variantes = prod.variantes || [];
    const cD = rProd.getCell(4);
    if (variantes.length === 0) {
      cD.value = prod.stock ?? '';
      applyStyle(cD, dataStyle(bgProd));
      cD.alignment = { vertical: 'middle', horizontal: 'center' };
    } else {
      // Si tiene variantes, el stock del padre queda vacío (se ve en las variantes)
      cD.value = '';
      applyStyle(cD, dataStyle(bgProd));
    }

    // E: Proveedor
    const cE = rProd.getCell(5);
    cE.value = prod.proveedor || '';
    applyStyle(cE, dataStyle(bgProd));

    rProd.commit();

    // ── Filas de Variantes ───────────────────────────────────────────────────
    for (const v of variantes) {
      rowIdx++;
      totalVariantes++;

      const rVar = ws.getRow(rowIdx);
      rVar.height = 20;

      // Fondo levemente diferente para variantes (tono más claro)
      const bgVar = isEven ? C.azulClaro : 'FFEFF6FF';

      // A: ID Variante (indentado con "  ↳ ")
      const vA = rVar.getCell(1);
      vA.value = v.id_original ? `  ↳ ${v.id_original}` : '';
      applyStyle(vA, dataStyle(bgVar));
      vA.font = { color: { argb: '1E40AF' }, size: 9, name: 'Calibri', italic: true };

      // B: SKU/EAN variante
      const vB = rVar.getCell(2);
      vB.value = v.sku_ean || '';
      applyStyle(vB, dataStyle(bgVar));
      vB.font = { color: { argb: '1E40AF' }, size: 9, name: 'Calibri' };

      // C: Descripción = nombre prod + volumen si tiene
      const vC = rVar.getCell(3);
      const volDesc = v.volumen ? ` — ${v.volumen}` : '';
      const colorDesc = v.color_nombre ? ` (${v.color_nombre})` : '';
      vC.value = `    ${prod.nombre || ''}${volDesc}${colorDesc}`;
      applyStyle(vC, dataStyle(bgVar));
      vC.font = { color: { argb: '1E40AF' }, size: 9, name: 'Calibri', italic: true };

      // D: Stock de la variante
      const vD = rVar.getCell(4);
      vD.value = v.stock !== undefined && v.stock !== null ? Number(v.stock) : '';
      applyStyle(vD, dataStyle(bgVar));
      vD.alignment = { vertical: 'middle', horizontal: 'center' };
      vD.font = { color: { argb: '1E40AF' }, size: 9, name: 'Calibri' };

      // E: Proveedor (heredado del padre — las variantes no tienen proveedor propio)
      const vE = rVar.getCell(5);
      vE.value = prod.proveedor || '';
      applyStyle(vE, dataStyle(bgVar));
      vE.font = { color: { argb: '1E40AF' }, size: 9, name: 'Calibri', italic: true };

      rVar.commit();
    }
  }

  const buffer = await wb.xlsx.writeBuffer();

  return {
    buffer,
    totalProductos: productos.length,
    totalVariantes,
  };
}

module.exports = () => ({
  generarExcelComparacion,
});
