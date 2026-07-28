/**
 * diagnostico_v1_b.js
 * Análisis profundo: busca variantes con IDs que terminen en -v1 o -v2 etc,
 * e IDs que contienen guion, en ambos archivos.
 * También analiza si hay IDs de variante que son el ID padre + sufijo
 */
const ExcelJS = require('exceljs');
const path    = require('path');

const ARCHIVOS = [
  { label: 'IMPORTACIÓN (Jul 28)', file: 'Exportacion_Marybe_2026-07-28 (1).xlsx' },
  { label: 'EXPORTACIÓN (Jul 10)', file: 'Exportacion_Marybe_2026-07-10 (4).xlsx' },
];

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
  for (const { label, file } of ARCHIVOS) {
    const rutaCompleta = path.join(__dirname, '../../Frontend', file);
    console.log('\n' + '═'.repeat(70));
    console.log(`📋 ${label}: ${file}`);
    console.log('═'.repeat(70));

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(rutaCompleta);

    console.log('\n📋 Hojas:');
    wb.worksheets.forEach((ws, i) => console.log(`  [${i}] "${ws.name}" state=${ws.state}`));

    const wsP = wb.getWorksheet('📦 Productos') || wb.worksheets.find(ws => !ws.name.includes('Listas'));
    const wsV = wb.getWorksheet('🔗 Variantes') || wb.worksheets.find(ws => ws !== wsP && !ws.name.includes('Listas'));

    // Leer productos
    const productos = [];
    wsP.eachRow((row, rowNum) => {
      if (rowNum <= HEADER_ROW || isSep(row)) return;
      const id = cellVal(row, 1);
      if (!id) return;
      productos.push({ rowNum, id_original: id, nombre: cellVal(row, 3), precio: cellVal(row, 16) });
    });

    // Leer variantes con TODOS los campos visibles
    const variantes = [];
    wsV.eachRow((row, rowNum) => {
      if (rowNum <= HEADER_ROW || isSep(row)) return;
      const id = cellVal(row, 1);
      if (!id) return;
      variantes.push({
        rowNum,
        id_original: id,
        producto_padre_id: cellVal(row, 2),
        nombre_padre: cellVal(row, 3),
        sku_ean: cellVal(row, 4),
        volumen: cellVal(row, 5),
        stock: cellVal(row, 6),
        precio: cellVal(row, 7),
      });
    });

    console.log(`\n📦 Productos: ${productos.length}`);
    console.log(`🔗 Variantes: ${variantes.length}`);

    // Buscar variantes con guion en el ID
    const conGuion = variantes.filter(v => v.id_original.includes('-'));
    console.log(`\n🔍 Variantes con guion en ID: ${conGuion.length}`);
    conGuion.slice(0, 20).forEach(v => {
      console.log(`   Fila ${v.rowNum} | ID="${v.id_original}" | PadreID="${v.producto_padre_id}" | Vol="${v.volumen}" | Precio="${v.precio}"`);
    });

    // Buscar variantes que terminan en -v1, -v2, etc
    const v1s = variantes.filter(v => /\-v\d+$/.test(v.id_original));
    console.log(`\n🔍 Variantes con patrón -vN al final: ${v1s.length}`);
    v1s.slice(0, 30).forEach(v => {
      console.log(`   Fila ${v.rowNum} | ID="${v.id_original}" | PadreID="${v.producto_padre_id}" | Vol="${v.volumen}" | Precio="${v.precio}"`);
    });

    // Rango de IDs de los productos
    const idsProd = productos.map(p => p.id_original);
    const idsNum = idsProd.filter(id => !isNaN(parseInt(id))).map(id => parseInt(id));
    if (idsNum.length > 0) {
      console.log(`\n📊 Rango de IDs de Productos: ${Math.min(...idsNum)} → ${Math.max(...idsNum)}`);
    }

    // Productos sin variantes
    const varPorPadre = new Map();
    for (const v of variantes) {
      const pid = (v.producto_padre_id || '').trim();
      const lista = varPorPadre.get(pid) || [];
      lista.push(v);
      varPorPadre.set(pid, lista);
    }

    const sinVariante = productos.filter(p => {
      const hijos = varPorPadre.get((p.id_original || '').trim()) || [];
      return hijos.length === 0;
    });

    console.log(`\n⚠️  Productos SIN variante: ${sinVariante.length}`);
    if (sinVariante.length > 0) {
      sinVariante.slice(0, 20).forEach(p => {
        console.log(`   Fila ${p.rowNum} | ID="${p.id_original}" | "${p.nombre?.substring(0,50)}" | Precio="${p.precio}"`);
      });
    }

    // Primeras 5 filas RAW de Variantes para ver qué hay
    console.log('\n── Primeras 10 filas de datos en hoja Variantes:');
    let shown = 0;
    wsV.eachRow((row, rowNum) => {
      if (rowNum <= HEADER_ROW || shown >= 10) return;
      const id = cellVal(row, 1);
      if (!id || id.startsWith('═') || id.startsWith('→')) return;
      shown++;
      const cols = [];
      for (let c = 1; c <= 8; c++) cols.push(`c${c}="${cellVal(row, c)}"`);
      console.log(`  Fila ${rowNum}: ${cols.join(' | ')}`);
    });
  }
})().catch(err => console.error('Error:', err.stack));
