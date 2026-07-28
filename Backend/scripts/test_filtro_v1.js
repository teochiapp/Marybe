/**
 * test_filtro_v1.js
 * Simula la lógica del exportador con el filtro de variantes sintéticas
 * aplicado al archivo actual de la BD (el export nuevo).
 */
const ExcelJS = require('exceljs');
const path    = require('path');

const ARCHIVO = path.join(__dirname, '../../Frontend/Exportacion_Marybe_2026-07-28 (3) (1).xlsx');
const HEADER_ROW = 3;

function cellVal(row, colIndex) {
  const cell = row.getCell(colIndex);
  if (!cell || cell.value === null || cell.value === undefined) return '';
  if (cell.value && typeof cell.value === 'object' && 'result' in cell.value)
    return cell.value.result !== null ? String(cell.value.result).trim() : '';
  if (cell.value && typeof cell.value === 'object') return '';
  if (cell.value && cell.value.richText)
    return cell.value.richText.map(rt => rt.text).join('').trim();
  return String(cell.value).trim();
}
function isSep(row) {
  const a = cellVal(row, 1);
  return a === '' || a.startsWith('═') || a.startsWith('→');
}

(async () => {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(ARCHIVO);

  const wsP = wb.getWorksheet('📦 Productos');
  const wsV = wb.getWorksheet('🔗 Variantes');

  // Leer todos los productos
  const productos = [];
  wsP.eachRow((row, rowNum) => {
    if (rowNum <= HEADER_ROW || isSep(row)) return;
    const id = cellVal(row, 1);
    if (!id) return;
    productos.push({ id, nombre: cellVal(row, 3) });
  });

  // Leer variantes y agrupar por padre
  const variantesXPadre = new Map();
  wsV.eachRow((row, rowNum) => {
    if (rowNum <= HEADER_ROW || isSep(row)) return;
    const id = cellVal(row, 1);
    if (!id) return;
    const padreId = cellVal(row, 2);
    const lista = variantesXPadre.get(padreId) || [];
    lista.push({ id, padreId, precio: cellVal(row, 7) });
    variantesXPadre.set(padreId, lista);
  });

  // Simular el filtro del exportador
  let totalV1Filtradas = 0;
  let productosSinVariante = 0;
  let variantesRealesExportadas = 0;

  for (const prod of productos) {
    const variantes = variantesXPadre.get(prod.id) || [];

    // NUEVO FILTRO: eliminar sintéticas
    const variantesLimpias = variantes.filter(v => {
      const esSintetica = v.id === `${prod.id}-v1` && variantes.length === 1;
      if (esSintetica) totalV1Filtradas++;
      return !esSintetica;
    });

    if (variantesLimpias.length === 0) {
      productosSinVariante++;
    } else {
      variantesRealesExportadas += variantesLimpias.length;
    }
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('SIMULACIÓN DEL EXPORTADOR CON FILTRO APLICADO');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Productos totales:              ${productos.length}`);
  console.log(`Variantes sintéticas filtradas: ${totalV1Filtradas} ← ESTAS DESAPARECEN DEL EXCEL`);
  console.log(`Productos sin variante (skip):  ${productosSinVariante}`);
  console.log(`Variantes reales a exportar:    ${variantesRealesExportadas}`);
  console.log('\nResultado esperado del próximo export:');
  console.log(`  Hoja Productos: ${productos.length} filas`);
  console.log(`  Hoja Variantes: ${variantesRealesExportadas} filas (sin ninguna -v1)`);
  console.log('═══════════════════════════════════════════════════════\n');
})().catch(err => console.error('Error:', err.stack));
