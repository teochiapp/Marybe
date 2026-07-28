/**
 * diagnostico3.js
 * Verifica la estructura de la hoja Variantes del Excel del cliente
 * y busca el desplazamiento de columnas.
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

(async () => {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(ARCHIVO);

  const wsV = wb.getWorksheet('🔗 Variantes');
  const wsP = wb.getWorksheet('📦 Productos');

  // ── Headers Variantes ────────────────────────────────────────────────────────
  console.log('\n══ HOJA VARIANTES — Encabezados (fila 3):');
  const hrV = wsV.getRow(3);
  for (let c = 1; c <= 15; c++) {
    const v = cellVal(hrV, c);
    console.log(`  Col ${c}: "${v}"`);
  }

  // ── Primeras 15 filas reales ──────────────────────────────────────────────────
  console.log('\n══ Primeras 15 filas de datos en Variantes:');
  let shown = 0;
  wsV.eachRow((row, rowNum) => {
    if (rowNum <= HEADER_ROW || shown >= 15) return;
    const id = cellVal(row, 1);
    if (!id || id.startsWith('═') || id.startsWith('→') || id.startsWith('↳')) return;
    shown++;
    console.log(`\n  Fila ${rowNum}:`);
    for (let c = 1; c <= 13; c++) {
      console.log(`    Col ${c}: "${cellVal(row, c)}"`);
    }
  });

  // ── Buscar filas en Variantes donde col 7 (precio) está vacía ───────────────
  console.log('\n══ Variantes con precio VACÍO (col 7):');
  let conPrecioVacio = 0;
  let sinPadreId = 0;
  wsV.eachRow((row, rowNum) => {
    if (rowNum <= HEADER_ROW) return;
    const id = cellVal(row, 1);
    if (!id || id.startsWith('═') || id.startsWith('→')) return;
    const padreId = cellVal(row, 2);
    const precio  = cellVal(row, 7);
    if (!padreId) sinPadreId++;
    if (!precio || precio === '0') {
      conPrecioVacio++;
    }
  });
  console.log(`  Con precio vacío: ${conPrecioVacio}`);
  console.log(`  Sin producto_padre_id: ${sinPadreId}`);

  // ── Verificar columnas de Productos: ¿falta la columna "Moneda"? ─────────────
  console.log('\n══ HOJA PRODUCTOS — Encabezados completos (fila 3):');
  const hrP = wsP.getRow(3);
  for (let c = 1; c <= 20; c++) {
    const v = cellVal(hrP, c);
    if (v) console.log(`  Col ${c}: "${v}"`);
  }

  // ── Análisis: el Excel del cliente tiene "Stock" en col 14 pero el código
  //    TAMBIÉN espera "Stock" en col 14 — verificar si la plantilla original
  //    tenía "Moneda" en col 14 y "Stock" en col 15 ──────────────────────────
  console.log('\n══ ANÁLISIS DE COLUMNAS: ¿Coinciden las posiciones?');
  const ESPERADO_PRODUCTOS = {
    1: 'id_original',
    2: 'sku',
    3: 'nombre',
    4: 'marca',
    5: 'seccion',
    6: 'categoria',
    7: 'subcategoria',
    8: 'tipo',
    9: 'descripcion',
    10: 'especificaciones',
    11: 'proveedor',
    12: 'publicado',
    13: 'destacado',
    14: 'stock',          // <-- el código lee stock de col 14
    15: 'caracteristicas', 
    16: 'precio',
    17: 'precio_oferta',
    18: 'pct_descuento',
  };
  for (const [col, campo] of Object.entries(ESPERADO_PRODUCTOS)) {
    const real = cellVal(hrP, parseInt(col));
    const ok = real ? '✅' : '⚠️ VACÍO';
    console.log(`  Col ${col} (espera: ${campo}) → real: "${real}" ${ok}`);
  }

  // ── ¿Tiene "Moneda" la plantilla? ───────────────────────────────────────────
  console.log('\n══ ¿Aparece la palabra "Moneda" en alguna columna de Productos?');
  for (let c = 1; c <= 20; c++) {
    const v = cellVal(hrP, c);
    if (v.toLowerCase().includes('moneda')) {
      console.log(`  ✅ "Moneda" encontrada en Col ${c}: "${v}"`);
    }
  }

  // ── Verificar Variantes: ¿tiene col 9 "% Descuento 🔒" o distinto? ─────────
  console.log('\n══ ¿Las columnas de Variantes tienen el orden esperado por el código?');
  const ESPERADO_VARIANTES = {
    1: 'id_original',
    2: 'producto_padre_id',
    3: '[ignorada - nombre_padre formula]',
    4: 'sku_ean',
    5: 'volumen',
    6: 'stock',
    7: 'precio',
    8: 'precio_oferta (usuario ingresa)',
    9: 'pct_descuento (calculado - ignorado)',
    10: 'publicado',
    11: 'envio',
    12: 'color_nombre',
  };
  for (const [col, campo] of Object.entries(ESPERADO_VARIANTES)) {
    const real = cellVal(hrV, parseInt(col));
    console.log(`  Col ${col} (espera: ${campo}) → real: "${real}"`);
  }

})().catch(err => console.error('Error:', err.stack));
