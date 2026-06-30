// Verificación del Excel generado con ExcelJS
const ExcelJS = require('exceljs');
const path    = require('path');

async function main() {
  const wb  = new ExcelJS.Workbook();
  await wb.xlsx.readFile(path.join(__dirname, '../data/Productos_RevlonKenzo_Marybe.xlsx'));

  const wsP = wb.getWorksheet('📦 Productos');
  const wsV = wb.getWorksheet('🔗 Variantes');

  // Contar filas de datos
  let countP = 0, countV = 0;
  wsP.eachRow((row, n) => { if (n > 3 && row.getCell(1).value) countP++; });
  wsV.eachRow((row, n) => { if (n > 3 && row.getCell(1).value) countV++; });

  console.log(`\n=== VERIFICACIÓN ===`);
  console.log(`✅ Filas en Productos: ${countP}`);
  console.log(`✅ Filas en Variantes: ${countV}`);

  console.log(`\n=== Primeras 5 filas de Productos (nuevas) ===`);
  let shown = 0;
  wsP.eachRow((row, n) => {
    if (shown >= 5) return;
    if (n < 4) return;
    const id = row.getCell(1).value;
    if (!id || parseInt(id) < 4752) return;
    console.log(`  Fila ${n}: ID=${row.getCell(1).value} | EAN=${row.getCell(2).value} | Nombre=${row.getCell(3).value} | Marca=${row.getCell(4).value} | Seccion=${row.getCell(5).value} | Categoria=${row.getCell(6).value} | Proveedor=${row.getCell(12).value} | Publicado=${row.getCell(13).value}`);
    shown++;
  });

  console.log(`\n=== Primeras 8 filas de Variantes (nuevas) ===`);
  shown = 0;
  wsV.eachRow((row, n) => {
    if (shown >= 8) return;
    if (n < 4) return;
    const id = row.getCell(1).value;
    if (!id || parseInt(id) < 13900) return;
    const precioOferta = row.getCell(9).value;
    const poStr = precioOferta && typeof precioOferta === 'object' && precioOferta.formula
      ? `formula:${precioOferta.formula}`
      : precioOferta;
    console.log(`  Fila ${n}: VarID=${id} | ProdID=${row.getCell(2).value} | EAN=${row.getCell(4).value} | Size=${row.getCell(5).value} | Precio=${row.getCell(7).value} | Desc%=${row.getCell(8).value} | PrecioOferta=${poStr} | Pub=${row.getCell(10).value}`);
    shown++;
  });

  // Verificar hojas existentes
  console.log(`\n=== Hojas del workbook ===`);
  wb.worksheets.forEach(ws => console.log(`  - "${ws.name}" (state: ${ws.state || 'visible'})`));
}

main().catch(e => console.error('Error:', e.message));
