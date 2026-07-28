/**
 * diagnostico2.js
 * Análisis profundo del Excel subido por clientes (julio 10)
 * Detecta: desalineamiento de columnas, formato de columnas en Variantes
 * y qué hoja se detecta primero.
 */
const ExcelJS = require('exceljs');
const path    = require('path');

const ARCHIVO = path.join(__dirname, '../../Frontend/Exportacion_Marybe_2026-07-10 (3).xlsx');
const HEADER_ROW = 3;

function cellVal(row, colIndex) {
  const cell = row.getCell(colIndex);
  if (!cell || cell.value === null || cell.value === undefined) return '';
  if (cell.value && typeof cell.value === 'object' && 'result' in cell.value) {
    return cell.value.result !== null && cell.value.result !== undefined
      ? String(cell.value.result).trim() : '';
  }
  if (cell.value && cell.value.richText)
    return cell.value.richText.map(rt => rt.text).join('').trim();
  return String(cell.value).trim();
}

function isSeparatorOrEmpty(row) {
  const a = cellVal(row, 1);
  return a === '' || a.startsWith('═') || a.startsWith('→');
}

(async () => {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(ARCHIVO);

  console.log('\n📋 TODAS LAS HOJAS (en orden):');
  wb.worksheets.forEach((ws, i) => {
    console.log(`   [${i}] "${ws.name}"  state=${ws.state}`);
  });

  // ── Qué hojas detecta el código actual ──────────────────────────────────────
  const wsP_byName = wb.getWorksheet('📦 Productos');
  const wsP_fallback = wb.worksheets.find(ws => ws.name !== 'Listas');

  console.log(`\n🔍 wsP por nombre exacto: ${wsP_byName ? `"${wsP_byName.name}"` : 'NO ENCONTRADA'}`);
  console.log(`🔍 wsP fallback (primera que no sea "Listas"): "${wsP_fallback?.name}"`);

  const wsP = wsP_byName || wsP_fallback;

  const wsV_byName = wb.getWorksheet('🔗 Variantes');
  const wsV_fallback = wb.worksheets.find(ws => ws.name !== 'Listas' && ws !== wsP);

  console.log(`🔍 wsV por nombre exacto: ${wsV_byName ? `"${wsV_byName.name}"` : 'NO ENCONTRADA'}`);
  console.log(`🔍 wsV fallback: "${wsV_fallback?.name}"`);

  // ── Hoja Productos: verificar columnas ──────────────────────────────────────
  console.log('\n\n══ HOJA PRODUCTOS (' + wsP.name + ') ══');
  console.log('\nFila 3 (Headers):');
  const hr3 = wsP.getRow(3);
  for (let c = 1; c <= 20; c++) {
    const v = cellVal(hr3, c);
    if (v) console.log(`  Col ${c}: "${v}"`);
  }

  // Primeras 5 filas de datos reales
  console.log('\nPrimeras 5 filas de datos (fila 4 en adelante):');
  let shown = 0;
  wsP.eachRow((row, rowNum) => {
    if (rowNum <= HEADER_ROW || shown >= 5) return;
    const id = cellVal(row, 1);
    if (!id || id.startsWith('═') || id.startsWith('→')) return;
    shown++;
    console.log(`\n  Fila ${rowNum}:`);
    for (let c = 1; c <= 18; c++) {
      const v = cellVal(row, c);
      if (v) console.log(`    Col ${c}: "${v}"`);
    }
  });

  // ── Hoja Variantes: verificar columnas ──────────────────────────────────────
  console.log('\n\n══ HOJA VARIANTES (' + wsV.name + ') ══');
  console.log('\nFila 3 (Headers):');
  const hrV3 = wsV.getRow(3);
  for (let c = 1; c <= 15; c++) {
    const v = cellVal(hrV3, c);
    if (v) console.log(`  Col ${c}: "${v}"`);
  }

  // Primeras 10 filas de datos reales en Variantes (saltando separadores)
  console.log('\nPrimeras 10 filas de datos reales en Variantes:');
  let shownV = 0;
  wsV.eachRow((row, rowNum) => {
    if (rowNum <= HEADER_ROW || shownV >= 10) return;
    const id = cellVal(row, 1);
    if (!id || id.startsWith('═') || id.startsWith('→')) return;
    shownV++;
    const padreId = cellVal(row, 2);
    const precio = cellVal(row, 7);
    const precioOferta = cellVal(row, 8);
    const pctDesc = cellVal(row, 9);
    console.log(`  Fila ${rowNum}: ID="${id}" PadreID="${padreId}" Precio(7)="${precio}" PrecioOferta(8)="${precioOferta}" %Desc(9)="${pctDesc}"`);
  });

  // ── Detectar el problema real: ¿las columnas de Variantes están desplazadas? ──
  console.log('\n\n══ VERIFICACIÓN DE COLUMNAS EN VARIANTES ══');
  console.log('El código de importación lee así las Variantes:');
  console.log('  Col 1 = id_original');
  console.log('  Col 2 = producto_padre_id');
  console.log('  Col 3 = [ignorada — nombre_padre fórmula]');
  console.log('  Col 4 = sku_ean');
  console.log('  Col 5 = volumen');
  console.log('  Col 6 = stock');
  console.log('  Col 7 = precio');
  console.log('  Col 8 = precio_oferta (usuario lo ingresa)');
  console.log('  Col 9 = % descuento (calculado)');
  console.log('  Col 10 = publicado');
  console.log('  Col 11 = envio');
  console.log('  Col 12 = color_nombre');
  console.log('\nEncabezados reales del Excel:');
  for (let c = 1; c <= 15; c++) {
    const v = cellVal(hrV3, c);
    if (v) console.log(`  Col ${c}: "${v}"`);
  }

  // ── Detectar el problema en Productos: ¿la col 14 es "moneda" o "stock"? ──
  console.log('\n\n══ VERIFICACIÓN DE COLUMNAS EN PRODUCTOS ══');
  console.log('El código de importación lee así los Productos:');
  console.log('  Col 1  = id_original');
  console.log('  Col 2  = sku');
  console.log('  Col 3  = nombre');
  console.log('  Col 4  = marca');
  console.log('  Col 5  = seccion');
  console.log('  Col 6  = categoria');
  console.log('  Col 7  = subcategoria');
  console.log('  Col 8  = tipo');
  console.log('  Col 9  = descripcion');
  console.log('  Col 10 = especificaciones');
  console.log('  Col 11 = proveedor');
  console.log('  Col 12 = publicado');
  console.log('  Col 13 = destacado');
  console.log('  Col 14 = stock  ← ¡IMPORTANTE!');
  console.log('  Col 15 = caracteristicas');
  console.log('  Col 16 = precio');
  console.log('  Col 17 = precio_oferta');
  console.log('  Col 18 = pct_descuento');
  console.log('\nEncabezados reales del Excel Productos:');
  for (let c = 1; c <= 20; c++) {
    const v = cellVal(hr3, c);
    if (v) console.log(`  Col ${c}: "${v}"`);
  }

  // ── Contar filas por estado ──────────────────────────────────────────────────
  let totalP = 0, emptySection = 0;
  wsP.eachRow((row, rowNum) => {
    if (rowNum <= HEADER_ROW) return;
    if (isSeparatorOrEmpty(row)) return;
    const id = cellVal(row, 1);
    if (!id) return;
    totalP++;
    const seccion = cellVal(row, 5);
    if (!seccion) emptySection++;
  });

  console.log(`\n\n══ ESTADÍSTICAS PRODUCTOS ══`);
  console.log(`  Total filas con datos: ${totalP}`);
  console.log(`  Filas con sección VACÍA (col 5): ${emptySection} (${Math.round(emptySection/totalP*100)}%)`);

})().catch(err => console.error('Error:', err.message));
