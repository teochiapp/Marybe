/**
 * puig_csv_to_excel.js
 * Convierte el CSV del proveedor Puig Selectivo a la Plantilla Marybe,
 * con la misma estructura de columnas y estilos que el exportador de admin.
 *
 * Uso:   node Backend/scripts/puig_csv_to_excel.js
 * Salida: Backend/data/Productos_Puig_Marybe.xlsx
 */

'use strict';

const ExcelJS = require('exceljs');
const path    = require('path');
const fs      = require('fs');

const CSV_PATH      = path.join(__dirname, '../../Frontend/puig selectivo - puig sele.csv');
const TEMPLATE_PATH = path.join(__dirname, '../data/Plantilla_Marybe.xlsx');
const OUTPUT_PATH   = path.join(__dirname, '../data/Productos_Puig_Marybe.xlsx');

const {
  C, headerStyle, dataStyle, noteStyle, readonlyStyle, applyStyle,
} = require('../src/utils/excel-utils');

function parsePrecio(str) {
  if (!str || str.toString().trim() === '') return null;
  const clean = str.toString().replace(/"/g, '').trim().replace(/\./g, '').replace(',', '.');
  const val = parseFloat(clean);
  return isNaN(val) ? null : val;
}

function extractVolume(nombre) {
  if (!nombre) return { base: nombre, vol: null };
  const matchX = nombre.match(/^(.*?)\s+X\s+(\d[\d.,]*.*?)$/i);
  if (matchX) {
    return { base: matchX[1].trim(), vol: ('X ' + matchX[2].trim()).replace(/\s+/g, ' ') };
  }
  const matchNum = nombre.match(/^(.*?)\s+(\d+(?:[.,]\d+)?\s*(?:ml|g|gr|oz|L|l|kg|Ml|ML))\s*$/i);
  if (matchNum) {
    return { base: matchNum[1].trim(), vol: matchNum[2].trim() };
  }
  return { base: nombre.trim(), vol: null };
}

function mapRubro(rubro) {
  const r = (rubro || '').toUpperCase().trim();
  const seccion   = 'Perfumería';
  const categoria = 'Fragancias';
  let subcategoria = 'Femeninas';
  if (r.includes('HOMBRE') || r.includes('MEN')) subcategoria = 'Masculinos';
  else if (r.includes('FEM') || r.includes('MUJER') || r.includes('WOMAN')) subcategoria = 'Femeninas';
  else if (r.includes('UNISEX')) subcategoria = 'Femeninas';
  return { seccion, categoria, subcategoria };
}

function calcDesc(publico, oferta) {
  if (!publico || !oferta || publico === 0) return 0;
  const pct = Math.round(((publico - oferta) / publico) * 100);
  return pct > 0 ? pct : 0;
}

function parseCSV(text) {
  const rows = [];
  let field = '', fields = [], inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQ && text[i + 1] === '"') { field += '"'; i++; }
      else inQ = !inQ;
    } else if (ch === ',' && !inQ) { fields.push(field.trim()); field = ''; }
    else if ((ch === '\n' || ch === '\r') && !inQ) {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      fields.push(field.trim()); rows.push(fields); fields = []; field = '';
    } else { field += ch; }
  }
  if (field || fields.length > 0) { fields.push(field.trim()); rows.push(fields); }
  return rows;
}

async function main() {
  console.log('📂 Leyendo CSV de Puig...');
  const csvRaw = fs.readFileSync(CSV_PATH, 'utf8');
  const rows   = parseCSV(csvRaw);

  let headerIdx = -1;
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0] === 'Codigo') { headerIdx = i; break; }
  }
  if (headerIdx === -1) { console.error('No se encontró fila de encabezado (Codigo)'); process.exit(1); }

  const headers = rows[headerIdx];
  const COL = {};
  headers.forEach((h, i) => { COL[h.trim()] = i; });
  console.log('Columnas detectadas:', Object.keys(COL).join(', '));

  const dataRows = [];
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const f = rows[i];
    if (f.length < 4) continue;
    const descripcion = (f[COL['Descripcion']] || '').replace(/"/g, '').trim();
    if (!descripcion) continue;
    dataRows.push({
      codigo:    (f[COL['Codigo']]    || '').replace(/"/g, '').trim(),
      descripcion,
      marca:     (f[COL['MARCA']]     || '').replace(/"/g, '').trim(),
      rubro:     (f[COL['Rubro']]     || '').replace(/"/g, '').trim(),
      proveedor: (f[COL['Proveedor']] || '').replace(/"/g, '').trim(),
      publico:   parsePrecio(f[COL['Publico']] || ''),
      oferta:    parsePrecio(f[COL['Oferta']]  || ''),
    });
  }
  console.log(`${dataRows.length} filas leídas`);

  const grupos = new Map();
  for (const row of dataRows) {
    const { base, vol } = extractVolume(row.descripcion);
    const { seccion, categoria, subcategoria } = mapRubro(row.rubro);
    if (!grupos.has(base)) {
      grupos.set(base, { nombre: base, marca: row.marca, seccion, categoria, subcategoria, proveedor: row.proveedor, variantes: [] });
    }
    grupos.get(base).variantes.push({ codigo: row.codigo, nombre: row.descripcion, vol: vol || '', publico: row.publico, oferta: row.oferta });
  }
  console.log(`${grupos.size} productos padre | ${[...grupos.values()].reduce((s,g)=>s+g.variantes.length,0)} variantes`);

  // IDs fijos para Puig: cada re-ejecución produce el mismo archivo (idempotente).
  // Rango reservado: Productos 6000–6999 | Variantes 15000–15999
  const PUIG_BASE_PROD = 6000;
  const PUIG_BASE_VAR  = 15000;
  let nextProdId = PUIG_BASE_PROD;
  let nextVarId  = PUIG_BASE_VAR;
  console.log(`IDs Producto desde: ${nextProdId} | IDs Variante desde: ${nextVarId}`);

  const wb = new ExcelJS.Workbook();
  wb.creator = 'Marybe — Script Puig'; wb.created = new Date();

  // HOJA PRODUCTOS
  const wsP = wb.addWorksheet('📦 Productos', { properties: { tabColor: { argb: C.violeta } }, pageSetup: { fitToPage: true, fitToWidth: 1, orientation: 'landscape' }, views: [{ state: 'frozen', xSplit: 0, ySplit: 3 }] });

  wsP.mergeCells('A1:R1');
  const titleP = wsP.getCell('A1');
  titleP.value = `📦 MARYBE — Productos Puig Selectivo (${new Date().toLocaleDateString('es-AR')})`;
  titleP.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.grisOscuro } };
  titleP.font = { bold: true, color: { argb: C.blanco }, size: 14, name: 'Calibri' };
  titleP.alignment = { horizontal: 'center', vertical: 'middle' };
  wsP.getRow(1).height = 36;

  wsP.mergeCells('A2:R2');
  const instrP = wsP.getCell('A2');
  instrP.value = `⚠ Generado automáticamente desde CSV Puig Selectivo — ${grupos.size} productos | ${[...grupos.values()].reduce((s,g)=>s+g.variantes.length,0)} variantes. El precio del padre queda vacío cuando hay variantes (1+); el precio vive en cada variante.`;
  applyStyle(instrP, noteStyle());
  wsP.getRow(2).height = 28;

  const colDefsP = [
    { header: 'ID Original *',    width: 14, group: 'base',   note: 'ID único del producto' },
    { header: 'SKU / EAN',        width: 18, group: 'base',   note: 'Código EAN del primer variante' },
    { header: 'Nombre *',         width: 40, group: 'base',   note: 'Nombre del producto padre (sin volumen)' },
    { header: 'Marca',            width: 16, group: 'base',   note: 'Marca comercial' },
    { header: 'Sección *',        width: 16, group: 'cat',    note: 'Perfumería o Hogar' },
    { header: 'Categoría',        width: 22, group: 'cat',    note: 'Fragancias, Maquillaje, etc.' },
    { header: 'Subcategoría',     width: 22, group: 'cat',    note: 'Masculinos, Femeninas, etc.' },
    { header: 'Tipo',             width: 22, group: 'cat',    note: 'Premium, Sets, etc.' },
    { header: 'Descripción',      width: 60, group: 'extra',  note: 'Descripción' },
    { header: 'Especificaciones', width: 50, group: 'extra',  note: 'Especificaciones técnicas' },
    { header: 'Proveedor',        width: 28, group: 'extra',  note: 'Proveedor' },
    { header: 'Publicado',        width: 12, group: 'extra',  note: 'SI = visible | NO = oculto' },
    { header: 'Destacado',        width: 12, group: 'extra',  note: 'SI = destacado | NO = normal' },
    { header: 'Stock',            width: 12, group: 'extra',  note: 'Stock' },
    { header: 'Características',  width: 40, group: 'extra',  note: 'Separadas por |' },
    { header: 'Precio *',         width: 16, group: 'precio', note: 'Precio de lista (vacío si hay múltiples variantes)' },
    { header: 'Precio Oferta',    width: 16, group: 'precio', note: 'Precio con descuento' },
    { header: '% Descuento 🔒',  width: 14, group: 'precio', note: 'Calculado automáticamente' },
  ];
  wsP.columns = colDefsP.map(h => ({ width: h.width }));

  const rowHeaderP = wsP.getRow(3);
  colDefsP.forEach((h, i) => {
    const cell = rowHeaderP.getCell(i + 1);
    cell.value = h.header;
    const color = h.group === 'base' ? C.violeta : h.group === 'cat' ? C.azul : h.group === 'precio' ? C.verde : C.grisOscuro;
    applyStyle(cell, headerStyle(color));
    if (h.note) cell.note = { texts: [{ text: h.note }] };
  });
  rowHeaderP.height = 30;

  let rowIdxP = 3;
  const baseToId = new Map();

  for (const [base, grupo] of grupos) {
    rowIdxP++;
    const prodId = nextProdId++;
    baseToId.set(base, prodId);
    const isEven = rowIdxP % 2 === 0;
    const bgColor = isEven ? C.blanco : C.grisClaro;
    // El precio se pone en el padre SOLO si la variante es única (no hay para elegir).
    // Si tiene 2+ variantes, el precio vive en cada fila de variante.
    const sinVariantes      = grupo.variantes.length === 1;
    const precioPadre       = sinVariantes ? grupo.variantes[0]?.publico ?? null : null;
    const precioOfertaPadre = sinVariantes ? grupo.variantes[0]?.oferta  ?? null : null;
    const pctDescPadre      = sinVariantes ? calcDesc(precioPadre, precioOfertaPadre) : 0;
    const skuPadre = grupo.variantes[0]?.codigo || '';

    // Para variante única, guardamos el tamaño/combo en Especificaciones para no perderlo.
    const volUnico = sinVariantes ? (grupo.variantes[0]?.vol || '') : '';
    // Características: convertimos separador '+' a '|' (formato Marybe)
    const volCaracteristicas = volUnico ? volUnico.replace(/\s*\+\s*/g, ' | ') : '';

    const valores = [
      String(prodId), skuPadre, base, grupo.marca,
      grupo.seccion, grupo.categoria, grupo.subcategoria, 'Premium',
      '', volUnico, grupo.proveedor, 'SI', 'NO', 0, volCaracteristicas,
    ];
    const r = wsP.getRow(rowIdxP);
    r.height = 20;
    valores.forEach((val, ci) => {
      const cell = r.getCell(ci + 1);
      cell.value = ci === 0 ? String(val) : val;
      applyStyle(cell, dataStyle(bgColor));
      if (ci === 0) cell.numFmt = '@';
      if (ci >= 4 && ci <= 7) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isEven ? C.azulClaro : 'FFBFDBFE' } }; cell.font = { color: { argb: '1E3A5F' }, size: 10, name: 'Calibri' }; }
      if (ci === 11 || ci === 12) cell.font = { bold: true, color: { argb: val === 'SI' ? '16A34A' : 'EF4444' }, size: 10 };
    });

    const cP = r.getCell(16);
    if (precioPadre !== null) cP.value = precioPadre;
    applyStyle(cP, dataStyle(isEven ? C.verdeClaro : 'FFD1FAE5'));
    cP.font = { bold: true, color: { argb: '065F46' }, size: 10, name: 'Calibri' };
    cP.alignment = { vertical: 'middle', horizontal: 'right' };

    const cQ = r.getCell(17);
    if (precioOfertaPadre !== null) cQ.value = precioOfertaPadre;
    applyStyle(cQ, dataStyle(isEven ? C.verdeClaro : 'FFD1FAE5'));
    cQ.font = { bold: true, color: { argb: '065F46' }, size: 10, name: 'Calibri' };
    cQ.alignment = { vertical: 'middle', horizontal: 'right' };

    const cR = r.getCell(18);
    cR.value = pctDescPadre;
    applyStyle(cR, readonlyStyle());
    cR.font = { color: { argb: 'FF065F46' }, size: 10, name: 'Calibri', italic: true };
    cR.alignment = { vertical: 'middle', horizontal: 'center' };
    r.commit();
  }

  // HOJA VARIANTES
  const wsV = wb.addWorksheet('🔗 Variantes', { properties: { tabColor: { argb: C.coral } }, pageSetup: { fitToPage: true, fitToWidth: 1, orientation: 'landscape' }, views: [{ state: 'frozen', xSplit: 0, ySplit: 3 }] });

  wsV.mergeCells('A1:L1');
  const titleV = wsV.getCell('A1');
  titleV.value = '🔗 MARYBE — Variantes Puig Selectivo';
  titleV.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7C3AED' } };
  titleV.font = { bold: true, color: { argb: C.blanco }, size: 14, name: 'Calibri' };
  titleV.alignment = { horizontal: 'center', vertical: 'middle' };
  wsV.getRow(1).height = 36;

  wsV.mergeCells('A2:L2');
  const instrV = wsV.getCell('A2');
  instrV.value = '⚠ Una fila por variante. "ID Producto Padre" debe coincidir con "ID Original" en hoja Productos. Nombre Padre es calculado automáticamente.';
  applyStyle(instrV, noteStyle());
  wsV.getRow(2).height = 28;

  const colDefsV = [
    { header: 'ID Variante *',            width: 16, color: C.coral,      note: 'ID único de esta variante' },
    { header: 'ID Producto Padre *',      width: 18, color: C.coral,      note: 'Debe coincidir con ID Original de Productos' },
    { header: 'Nombre Producto Padre 🔒', width: 32, color: C.verde,      note: 'Calculado con BUSCARV' },
    { header: 'SKU / EAN',               width: 20, color: C.grisOscuro, note: 'EAN de esta variante' },
    { header: 'Volumen / Tamaño',         width: 22, color: C.grisOscuro, note: 'Ej: X 100 ml' },
    { header: 'Stock',                    width: 10, color: C.grisOscuro, note: 'Cantidad disponible' },
    { header: 'Precio *',                 width: 14, color: C.coral,      note: 'Precio de venta normal' },
    { header: 'Precio Oferta',            width: 16, color: C.grisOscuro, note: 'Precio con descuento' },
    { header: '% Descuento 🔒',          width: 14, color: C.verde,      note: 'Calculado desde Precio Oferta' },
    { header: 'Publicado',                width: 12, color: C.grisOscuro, note: 'SI = visible | NO = oculto' },
    { header: 'Envío',                    width: 10, color: C.grisOscuro, note: '1 = tiene envío' },
    { header: '🎨 Color',                width: 20, color: C.naranja,    note: 'Nombre del color' },
  ];
  wsV.columns = colDefsV.map(h => ({ width: h.width }));

  const rowHeaderV = wsV.getRow(3);
  colDefsV.forEach((h, i) => {
    const cell = rowHeaderV.getCell(i + 1);
    cell.value = h.header;
    applyStyle(cell, headerStyle(h.color));
    if (h.note) cell.note = { texts: [{ text: h.note }] };
  });
  rowHeaderV.height = 30;

  let rowIdxV = 3;
  for (const [base, grupo] of grupos) {
    const prodId = baseToId.get(base);
    // Solo exportar a Variantes si hay 2+ opciones. Con variante única el precio ya vive en el padre.
    if (grupo.variantes.length <= 1) continue;
    for (const v of grupo.variantes) {
      rowIdxV++;
      const varId = nextVarId++;
      const isEven = rowIdxV % 2 === 0;
      const bgColor = isEven ? C.blanco : 'FFFFF7ED';
      const pctDescV = calcDesc(v.publico, v.oferta);
      const r = wsV.getRow(rowIdxV);
      r.height = 20;

      const cA = r.getCell(1); cA.value = String(varId); applyStyle(cA, dataStyle(bgColor)); cA.numFmt = '@';
      const cB = r.getCell(2); cB.value = String(prodId); applyStyle(cB, dataStyle(bgColor)); cB.numFmt = '@';
      const cC = r.getCell(3);
      cC.value = { formula: `IF(B${rowIdxV}<>"",IFERROR(VLOOKUP(B${rowIdxV},'📦 Productos'!A:C,3,FALSE),IFERROR(VLOOKUP(B${rowIdxV}&"",'📦 Productos'!A:C,3,FALSE),IFERROR(VLOOKUP(VALUE(B${rowIdxV}),'📦 Productos'!A:C,3,FALSE),""))),"")`};
      applyStyle(cC, readonlyStyle());
      const cD = r.getCell(4); cD.value = v.codigo || ''; applyStyle(cD, dataStyle(bgColor)); cD.numFmt = '@';
      const cE = r.getCell(5); cE.value = v.vol || ''; applyStyle(cE, dataStyle(bgColor));
      const cF = r.getCell(6); cF.value = 0; applyStyle(cF, dataStyle(bgColor)); cF.alignment = { vertical: 'middle', horizontal: 'center' };

      const cG = r.getCell(7);
      if (v.publico !== null) cG.value = v.publico;
      applyStyle(cG, dataStyle(bgColor));
      cG.font = { bold: true, color: { argb: C.grisOscuro }, size: 10, name: 'Calibri' };
      cG.alignment = { vertical: 'middle', horizontal: 'right' };

      const cH = r.getCell(8);
      if (v.oferta !== null) cH.value = v.oferta;
      applyStyle(cH, dataStyle(bgColor));
      cH.font = { bold: true, color: { argb: C.grisOscuro }, size: 10, name: 'Calibri' };
      cH.alignment = { vertical: 'middle', horizontal: 'right' };

      const cI = r.getCell(9); cI.value = pctDescV; applyStyle(cI, readonlyStyle());
      cI.font = { color: { argb: 'FF065F46' }, size: 10, name: 'Calibri', italic: true };
      cI.alignment = { vertical: 'middle', horizontal: 'center' };

      const cJ = r.getCell(10); cJ.value = 'SI'; applyStyle(cJ, dataStyle(bgColor));
      cJ.font = { bold: true, color: { argb: '16A34A' }, size: 10 }; cJ.alignment = { vertical: 'middle' };

      const cK = r.getCell(11); cK.value = '1'; applyStyle(cK, dataStyle(bgColor)); cK.alignment = { vertical: 'middle', horizontal: 'center' };
      const cL = r.getCell(12); cL.value = ''; applyStyle(cL, dataStyle(bgColor));
      r.commit();
    }
  }

  await wb.xlsx.writeFile(OUTPUT_PATH);

  const conVariantes = [...grupos.values()].filter(g => g.variantes.length > 1).length;
  const sinVariantes = [...grupos.values()].filter(g => g.variantes.length <= 1).length;
  const varExportadas = [...grupos.values()].filter(g => g.variantes.length > 1).reduce((s,g)=>s+g.variantes.length,0);

  console.log('\n✅ Excel generado:');
  console.log(`   Archivo: ${OUTPUT_PATH}`);
  console.log(`   Productos totales: ${grupos.size}`);
  console.log(`     - Con múltiples variantes (sin precio padre): ${conVariantes}`);
  console.log(`     - Con variante única (precio en fila padre): ${sinVariantes}`);
  console.log(`   Variantes exportadas: ${varExportadas}`);
}

main().catch(err => { console.error('Error fatal:', err.message, err.stack); process.exit(1); });
