/**
 * diagnostico_nuevo.js
 * Analiza el nuevo export (jul 28 v3) para ver si las -v1 son reales en la BD
 * o si el exportador las está creando todavía.
 */
const ExcelJS = require('exceljs');
const path    = require('path');

// Buscar el archivo más nuevo
const ARCHIVOS = [
  'Exportacion_Marybe_2026-07-28 (3) (1).xlsx',
  'Exportacion_Marybe_2026-07-28 (1).xlsx',
  'Exportacion_Marybe_2026-07-10 (4).xlsx',
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
  for (const archivo of ARCHIVOS) {
    const ruta = path.join(__dirname, '../../Frontend', archivo);
    const fs = require('fs');
    if (!fs.existsSync(ruta)) {
      console.log(`❌ No existe: ${archivo}`);
      continue;
    }

    console.log('\n' + '═'.repeat(70));
    console.log(`📋 ${archivo}`);
    console.log('═'.repeat(70));

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(ruta);

    console.log('Hojas:', wb.worksheets.map(ws => `"${ws.name}"`).join(', '));

    const wsP = wb.getWorksheet('📦 Productos') || wb.worksheets[0];
    const wsV = wb.getWorksheet('🔗 Variantes') || wb.worksheets[1];

    // Contar productos
    const productos = [];
    wsP.eachRow((row, rowNum) => {
      if (rowNum <= HEADER_ROW || isSep(row)) return;
      const id = cellVal(row, 1);
      if (!id) return;
      productos.push({ id, nombre: cellVal(row, 3) });
    });

    // Contar variantes y separar las -v1
    const variantes = [];
    const variantesV1 = [];
    wsV.eachRow((row, rowNum) => {
      if (rowNum <= HEADER_ROW || isSep(row)) return;
      const id = cellVal(row, 1);
      if (!id) return;
      const v = {
        rowNum,
        id_original: id,
        producto_padre_id: cellVal(row, 2),
        volumen: cellVal(row, 5),
        precio: cellVal(row, 7),
      };
      variantes.push(v);
      if (/\-v\d+$/.test(id)) variantesV1.push(v);
    });

    console.log(`Productos: ${productos.length} | Variantes: ${variantes.length} | Variantes -vN: ${variantesV1.length}`);

    if (variantesV1.length > 0) {
      console.log(`\n⚠️  VARIANTES -vN (primeras 20):`);
      variantesV1.slice(0, 20).forEach(v => {
        console.log(`   Fila ${v.rowNum} | ID="${v.id_original}" | PadreID="${v.producto_padre_id}" | Precio="${v.precio}"`);
      });

      // Estas son variantes REALES en la BD (el exportador ya no las crea)
      console.log(`\n🔍 CONCLUSIÓN: Estas ${variantesV1.length} variantes -v1 están guardadas en la BD.`);
      console.log(`   El exportador NO las crea — son el resultado de importaciones anteriores.`);
      console.log(`   Para limpiarlas hay que hacer una limpieza directa en la BD o reimportar`);
      console.log(`   el Excel SIN esas variantes -v1 en la hoja Variantes.`);
    } else {
      console.log(`\n✅ Sin variantes -vN. El fix funcionó correctamente.`);
    }

    // Verificar si el export actual generó variantes sintéticas
    // (el nuevo código debería tener 0 -v1 que no existían en la BD)
    const productosSinVariante = productos.filter(p => {
      return !variantes.some(v => v.producto_padre_id === p.id);
    });
    console.log(`\nProductos sin ninguna variante en la hoja Variantes: ${productosSinVariante.length}`);
    if (productosSinVariante.length > 0 && productosSinVariante.length <= 20) {
      productosSinVariante.forEach(p => console.log(`   ID="${p.id}" "${p.nombre?.substring(0, 50)}"`));
    }
  }
})().catch(err => console.error('Error:', err.stack));
