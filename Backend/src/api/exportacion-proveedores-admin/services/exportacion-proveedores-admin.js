'use strict';

const ExcelJS = require('exceljs');

// ─── Constantes ───────────────────────────────────────────────────────────────
const UID_PRODUCTO = 'api::producto.producto';
const PAGE_SIZE    = 100;

// ─── Paleta (igual a comparacion-admin) ──────────────────────────────────────
const C = {
  violeta:      'FF7C6AF7',
  violetaClaro: 'FFEDE9FE',
  verde:        'FF22C55E',
  verdeClaro:   'FFD1FAE5',
  azul:         'FF3B82F6',
  azulClaro:    'FFDBEAFE',
  amarilloClaro:'FFFEF3C7',
  grisOscuro:   'FF1E1B4B',
  grisClaro:    'FFF8F7FF',
  blanco:       'FFFFFFFF',
  texto:        'FF1E1B4B',
  coral:        'FFF77C6A',
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

function safeNum(val) {
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

function calcPct(precio, precioOferta) {
  if (precio && precioOferta && precio > 0 && precioOferta < precio) {
    return Math.round(((precio - precioOferta) / precio) * 100);
  }
  return 0;
}

// ─── Obtener proveedores únicos ───────────────────────────────────────────────
async function fetchProveedores(strapi) {
  const todos = [];
  let page    = 1;

  while (true) {
    const resultado = await strapi.documents(UID_PRODUCTO).findMany({
      fields:  ['proveedor'],
      limit:   PAGE_SIZE,
      start:   (page - 1) * PAGE_SIZE,
      status:  'published',
    });
    if (!resultado || resultado.length === 0) break;
    todos.push(...resultado);
    if (resultado.length < PAGE_SIZE) break;
    page++;
  }

  return [...new Set(
    todos
      .map(p => (p.proveedor || '').trim())
      .filter(p => p.length > 0)
  )].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
}

// ─── Traer productos filtrados por proveedor ──────────────────────────────────
async function fetchProductosPorProveedor(strapi, proveedores) {
  const todos = [];
  let page    = 1;

  while (true) {
    const resultado = await strapi.documents(UID_PRODUCTO).findMany({
      filters:  { proveedor: { $in: proveedores } },
      populate: { variantes: true },
      limit:    PAGE_SIZE,
      start:    (page - 1) * PAGE_SIZE,
      status:   'published',
    });
    if (!resultado || resultado.length === 0) break;
    todos.push(...resultado);
    if (resultado.length < PAGE_SIZE) break;
    page++;
  }

  // Proveedor A→Z, luego Nombre A→Z dentro de cada proveedor
  todos.sort((a, b) => {
    const pa = (a.proveedor || '').toLowerCase().trim();
    const pb = (b.proveedor || '').toLowerCase().trim();
    if (pa !== pb) return pa < pb ? -1 : 1;
    const na = (a.nombre || '').toLowerCase().trim();
    const nb = (b.nombre || '').toLowerCase().trim();
    return na < nb ? -1 : na > nb ? 1 : 0;
  });

  return todos;
}

// ─── Generador del Excel ──────────────────────────────────────────────────────
// Hoja única estilo comparacion-admin:
//   Producto Padre (fila en negrita)
//     ↳ Variante 1 (indentada, tono azul)
//     ↳ Variante 2
//
// Orden de columnas:
//   A: ID / ID Variante
//   B: SKU / EAN
//   C: Proveedor
//   D: Nombre
//   E: Tamaño / Variante
//   F: Stock
//   G: Precio
//   H: Precio Oferta
//   I: % Descuento
async function generarExcelProveedor(strapi, proveedores) {
  strapi.log.info(`[ExportacionProveedoresAdmin] Obteniendo productos para: ${proveedores.join(', ')}...`);
  const productos = await fetchProductosPorProveedor(strapi, proveedores);
  strapi.log.info(`[ExportacionProveedoresAdmin] ${productos.length} productos obtenidos`);

  const wb   = new ExcelJS.Workbook();
  wb.creator = 'Marybe';
  wb.created = new Date();

  const provNombres = proveedores.length <= 3
    ? proveedores.join(', ')
    : `${proveedores.length} proveedores`;

  const ws = wb.addWorksheet('💲 Precios por Proveedor', {
    properties: { tabColor: { argb: C.violeta } },
    pageSetup:  { fitToPage: true, fitToWidth: 1, orientation: 'landscape' },
    views:      [{ state: 'frozen', xSplit: 0, ySplit: 3 }],
  });

  // ── Columnas (A–I) ────────────────────────────────────────────────────────
  const colDefs = [
    { header: 'ID / ID Variante',             width: 24,  group: 'id'     }, // A
    { header: 'SKU / EAN',                    width: 22,  group: 'base'   }, // B
    { header: 'Proveedor',                    width: 26,  group: 'prov'   }, // C
    { header: 'Nombre',                       width: 52,  group: 'base'   }, // D
    { header: 'Tamaño / Variante',            width: 20,  group: 'base'   }, // E
    { header: 'Stock',                        width: 10,  group: 'base'   }, // F
    { header: 'Precio',                       width: 14,  group: 'precio' }, // G
    { header: 'Precio Oferta',                width: 14,  group: 'precio' }, // H
    { header: '% Desc.',                      width: 10,  group: 'precio' }, // I
  ];

  ws.columns = colDefs.map(c => ({ width: c.width }));

  // ── Fila 1: Título ────────────────────────────────────────────────────────
  ws.mergeCells('A1:I1');
  const title     = ws.getCell('A1');
  title.value     = `💲 MARYBE — Precios por Proveedor: ${provNombres} (${new Date().toLocaleDateString('es-AR')})`;
  title.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.grisOscuro } };
  title.font      = { bold: true, color: { argb: C.blanco }, size: 14, name: 'Calibri' };
  title.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 36;

  // ── Fila 2: Instrucción ───────────────────────────────────────────────────
  ws.mergeCells('A2:I2');
  const instr = ws.getCell('A2');
  instr.value = `⚠ Generado el ${new Date().toLocaleString('es-AR')} — ${productos.length} productos. Las variantes aparecen indentadas (↳) debajo de su producto padre. Columnas en verde: Precio / Precio Oferta.`;
  applyStyle(instr, noteStyle());
  ws.getRow(2).height = 28;

  // ── Fila 3: Headers ───────────────────────────────────────────────────────
  const rowHeader = ws.getRow(3);
  colDefs.forEach((c, i) => {
    const cell  = rowHeader.getCell(i + 1);
    cell.value  = c.header;
    const color = c.group === 'id'     ? C.grisOscuro
      : c.group === 'prov'   ? C.violeta
      : c.group === 'precio' ? C.verde
      : C.azul;
    applyStyle(cell, headerStyle(color));
  });
  rowHeader.height = 30;

  // ── Filas de datos ────────────────────────────────────────────────────────
  let rowIdx         = 3;
  let totalVariantes = 0;

  for (const prod of productos) {
    rowIdx++;
    const isEven    = rowIdx % 2 === 0;
    const bgProd    = isEven ? C.blanco : C.grisClaro;
    const variantes = prod.variantes || [];
    const padreId   = prod.id_original || String(prod.id || '');

    // Precio del padre — con fallback desde variante fantasma
    let precioNum       = safeNum(prod.precio);
    let precioOfertaNum = safeNum(prod.precio_oferta);

    if (precioNum === null && variantes.length > 0) {
      const v1 = variantes.find(v => v.id_original === `${padreId}-v1`);
      if (v1) {
        precioNum       = safeNum(v1.precio);
        if (precioOfertaNum === null) precioOfertaNum = safeNum(v1.precio_oferta);
      } else if (variantes.length === 1) {
        const v = variantes[0];
        if (!(v.volumen || '').trim() && !(v.color_nombre || '').trim()) {
          precioNum       = safeNum(v.precio);
          if (precioOfertaNum === null) precioOfertaNum = safeNum(v.precio_oferta);
        }
      }
    }
    const pctDesc = calcPct(precioNum, precioOfertaNum);

    // Variantes reales (sin fantasmas ni únicas-vacías)
    const variantesLimpias = variantes.filter(v => {
      const esV1         = v.id_original === `${padreId}-v1`;
      const esUnicaVacia = variantes.length === 1
        && !(v.volumen || '').trim()
        && !(v.color_nombre || '').trim();
      return !(esV1 || esUnicaVacia);
    });

    // ── Fila del Producto Padre ───────────────────────────────────────────
    const rProd = ws.getRow(rowIdx);
    rProd.height = 22;

    // A: ID
    const cA = rProd.getCell(1);
    cA.value  = padreId;
    cA.numFmt = '@';
    applyStyle(cA, dataStyle(bgProd));
    cA.font   = { bold: true, color: { argb: C.grisOscuro }, size: 10, name: 'Calibri' };

    // B: SKU/EAN
    const cB = rProd.getCell(2);
    cB.value  = prod.sku || '';
    applyStyle(cB, dataStyle(bgProd));

    // C: Proveedor
    const cC = rProd.getCell(3);
    cC.value  = prod.proveedor || '';
    applyStyle(cC, dataStyle(bgProd));
    cC.font   = { bold: true, color: { argb: '5B21B6' }, size: 10, name: 'Calibri' };

    // D: Nombre
    const cD = rProd.getCell(4);
    cD.value  = prod.nombre || '';
    applyStyle(cD, dataStyle(bgProd));
    cD.font   = { bold: true, color: { argb: C.grisOscuro }, size: 10, name: 'Calibri' };

    // E: Tamaño (vacío en padre)
    const cE = rProd.getCell(5);
    cE.value  = '';
    applyStyle(cE, dataStyle(bgProd));

    // F: Stock (solo si no tiene variantes reales)
    const cF = rProd.getCell(6);
    cF.value     = variantesLimpias.length === 0 ? (prod.stock ?? '') : '';
    applyStyle(cF, dataStyle(bgProd));
    cF.alignment = { vertical: 'middle', horizontal: 'center' };

    // G: Precio
    const cG = rProd.getCell(7);
    if (precioNum !== null) cG.value = precioNum;
    applyStyle(cG, dataStyle(isEven ? C.verdeClaro : 'FFD1FAE5'));
    cG.font      = { bold: true, color: { argb: '065F46' }, size: 10, name: 'Calibri' };
    cG.alignment = { vertical: 'middle', horizontal: 'right' };

    // H: Precio Oferta
    const cH = rProd.getCell(8);
    if (precioOfertaNum !== null) cH.value = precioOfertaNum;
    applyStyle(cH, dataStyle(isEven ? C.verdeClaro : 'FFD1FAE5'));
    cH.font      = { bold: true, color: { argb: '065F46' }, size: 10, name: 'Calibri' };
    cH.alignment = { vertical: 'middle', horizontal: 'right' };

    // I: % Descuento
    const cI = rProd.getCell(9);
    cI.value = {
      formula: `IF(G${rowIdx}>0, IF(AND(H${rowIdx}<>"", H${rowIdx}<G${rowIdx}), 1 - H${rowIdx}/G${rowIdx}, 0), 0)`
    };
    applyStyle(cI, readonlyStyle());
    cI.font      = { color: { argb: 'FF065F46' }, size: 10, name: 'Calibri', italic: true };
    cI.alignment = { vertical: 'middle', horizontal: 'center' };
    cI.numFmt    = '0%';

    rProd.commit();

    // ── Filas de Variantes ────────────────────────────────────────────────
    for (const v of variantesLimpias) {
      rowIdx++;
      totalVariantes++;

      const rVar  = ws.getRow(rowIdx);
      rVar.height = 20;
      const bgVar = isEven ? C.azulClaro : 'FFEFF6FF';

      const precioV       = safeNum(v.precio);
      const precioOfertaV = safeNum(v.precio_oferta);
      const pctDescV      = calcPct(precioV, precioOfertaV);
      const tamanio       = [v.volumen, v.color_nombre].filter(Boolean).join(' / ');

      // A: ID Variante (indentado con ↳)
      const vA = rVar.getCell(1);
      vA.value  = v.id_original ? `  ↳ ${v.id_original}` : '';
      vA.numFmt = '@';
      applyStyle(vA, dataStyle(bgVar));
      vA.font   = { color: { argb: '1E40AF' }, size: 9, name: 'Calibri', italic: true };

      // B: SKU/EAN variante
      const vB = rVar.getCell(2);
      vB.value  = v.sku_ean || '';
      applyStyle(vB, dataStyle(bgVar));
      vB.font   = { color: { argb: '1E40AF' }, size: 9, name: 'Calibri' };

      // C: Proveedor (heredado del padre)
      const vC = rVar.getCell(3);
      vC.value  = prod.proveedor || '';
      applyStyle(vC, dataStyle(bgVar));
      vC.font   = { color: { argb: '6D28D9' }, size: 9, name: 'Calibri', italic: true };

      // D: Nombre + identificador de variante
      const vD      = rVar.getCell(4);
      const volDesc = v.volumen      ? ` — ${v.volumen}`      : '';
      const colDesc = v.color_nombre ? ` (${v.color_nombre})` : '';
      vD.value  = `    ${prod.nombre || ''}${volDesc}${colDesc}`;
      applyStyle(vD, dataStyle(bgVar));
      vD.font   = { color: { argb: '1E40AF' }, size: 9, name: 'Calibri', italic: true };

      // E: Tamaño / Variante
      const vE = rVar.getCell(5);
      vE.value  = tamanio || '';
      applyStyle(vE, dataStyle(bgVar));
      vE.font   = { bold: !!tamanio, color: { argb: '1E40AF' }, size: 9, name: 'Calibri' };

      // F: Stock variante
      const vF = rVar.getCell(6);
      vF.value     = v.stock !== undefined && v.stock !== null ? Number(v.stock) : '';
      applyStyle(vF, dataStyle(bgVar));
      vF.alignment = { vertical: 'middle', horizontal: 'center' };
      vF.font      = { color: { argb: '1E40AF' }, size: 9, name: 'Calibri' };

      // G: Precio variante
      const vG = rVar.getCell(7);
      if (precioV !== null) vG.value = precioV;
      applyStyle(vG, dataStyle(isEven ? C.verdeClaro : 'FFD1FAE5'));
      vG.font      = { bold: true, color: { argb: '065F46' }, size: 9, name: 'Calibri' };
      vG.alignment = { vertical: 'middle', horizontal: 'right' };

      // H: Precio Oferta variante
      const vH = rVar.getCell(8);
      if (precioOfertaV !== null) vH.value = precioOfertaV;
      applyStyle(vH, dataStyle(isEven ? C.verdeClaro : 'FFD1FAE5'));
      vH.font      = { bold: true, color: { argb: '065F46' }, size: 9, name: 'Calibri' };
      vH.alignment = { vertical: 'middle', horizontal: 'right' };

      // I: % Descuento variante
      const vI = rVar.getCell(9);
      vI.value = {
        formula: `IF(G${rowIdx}>0, IF(AND(H${rowIdx}<>"", H${rowIdx}<G${rowIdx}), 1 - H${rowIdx}/G${rowIdx}, 0), 0)`
      };
      applyStyle(vI, readonlyStyle());
      vI.font      = { color: { argb: 'FF065F46' }, size: 9, name: 'Calibri', italic: true };
      vI.alignment = { vertical: 'middle', horizontal: 'center' };
      vI.numFmt    = '0%';

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

// ─── Exports ──────────────────────────────────────────────────────────────────
module.exports = () => ({
  fetchProveedores,
  generarExcelProveedor,
});
