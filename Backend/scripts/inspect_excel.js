// Script para ver más filas del Excel existente
const XLSX = require('xlsx');
const path = require('path');

const excelPath = path.join(__dirname, '..', 'data', 'Plantilla_Marybe.xlsx');
const wb = XLSX.readFile(excelPath, { cellStyles: true });

// Inspect Productos
const wsP = wb.Sheets['📦 Productos'];
const rangeP = XLSX.utils.decode_range(wsP['!ref']);

console.log('=== PRODUCTOS - rows 3-10 ===');
for (let r = 2; r <= Math.min(rangeP.e.r, 9); r++) {
  const rowData = {};
  for (let c = rangeP.s.c; c <= rangeP.e.c; c++) {
    const addr = XLSX.utils.encode_cell({ r, c });
    const cell = wsP[addr];
    if (cell) rowData[XLSX.utils.encode_col(c)] = cell.v;
  }
  console.log(`Row ${r + 1}:`, JSON.stringify(rowData));
}

// Inspect Variantes
const wsV = wb.Sheets['🔗 Variantes'];
const rangeV = XLSX.utils.decode_range(wsV['!ref']);

console.log('\n=== VARIANTES - rows 3-10 ===');
for (let r = 2; r <= Math.min(rangeV.e.r, 9); r++) {
  const rowData = {};
  for (let c = rangeV.s.c; c <= rangeV.e.c; c++) {
    const addr = XLSX.utils.encode_cell({ r, c });
    const cell = wsV[addr];
    if (cell) rowData[XLSX.utils.encode_col(c)] = cell.v;
  }
  console.log(`Row ${r + 1}:`, JSON.stringify(rowData));
}

// Check formulas in variantes
console.log('\n=== VARIANTES Formulas ===');
const wbF = XLSX.readFile(excelPath, { cellFormula: true });
const wsVF = wbF.Sheets['🔗 Variantes'];
for (let r = 2; r <= Math.min(rangeV.e.r, 9); r++) {
  const rowData = {};
  for (let c = rangeV.s.c; c <= rangeV.e.c; c++) {
    const addr = XLSX.utils.encode_cell({ r, c });
    const cell = wsVF[addr];
    if (cell && cell.f) rowData[XLSX.utils.encode_col(c)] = { formula: cell.f, value: cell.v };
  }
  if (Object.keys(rowData).length > 0)
    console.log(`Row ${r + 1}:`, JSON.stringify(rowData));
}
