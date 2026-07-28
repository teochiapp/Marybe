const strapi = require('@strapi/strapi');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

const importAdmin = require('../src/api/importacion-admin/services/importacion-admin.js');
const exportAdmin = require('../src/api/exportacion-admin/services/exportacion-admin.js');

async function readExcel(filePath) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(filePath);
  
  const wsP = wb.getWorksheet('📦 Productos') || wb.worksheets.find(ws => ws.name !== 'Listas');
  const wsV = wb.getWorksheet('🔗 Variantes') || wb.worksheets.find(ws => ws.name !== 'Listas' && ws !== wsP);

  const productos = [];
  if (wsP) {
    wsP.eachRow((row, r) => {
      if (r <= 3) return; // skip header
      const id = row.getCell(1).value;
      if (!id) return;
      productos.push(row.values.slice(1, 19).map(v => typeof v === 'object' && v !== null && v.result !== undefined ? v.result : v));
    });
  }

  const variantes = [];
  if (wsV) {
    wsV.eachRow((row, r) => {
      if (r <= 3) return;
      const id = row.getCell(1).value;
      if (!id) return;
      variantes.push(row.values.slice(1, 13).map(v => typeof v === 'object' && v !== null && v.result !== undefined ? v.result : v));
    });
  }

  return { productos, variantes };
}

function compareExcels(data1, data2) {
  let passed = true;

  // Comparar Productos
  console.log(`Comparando Productos: Antes=${data1.productos.length} vs Después=${data2.productos.length}`);
  if (data1.productos.length !== data2.productos.length) {
    console.log('❌ La cantidad de productos es diferente.');
    passed = false;
  }

  const p1Map = new Map(data1.productos.map(p => [String(p[0]), p]));
  for (const p2 of data2.productos) {
    const id = String(p2[0]);
    const p1 = p1Map.get(id);
    if (!p1) {
      console.log(`❌ Producto ${id} no estaba en el original.`);
      passed = false;
      continue;
    }
    // Comparamos columnas clave
    for (let i = 0; i < p1.length; i++) {
      // Ignorar diferencias menores o decimales
      const v1 = p1[i] === undefined || p1[i] === null ? '' : String(p1[i]).trim();
      const v2 = p2[i] === undefined || p2[i] === null ? '' : String(p2[i]).trim();
      if (v1 !== v2) {
        // Tolerancia para números que pueden parsearse ligeramente distinto
        if (!isNaN(parseFloat(v1)) && !isNaN(parseFloat(v2)) && Math.abs(parseFloat(v1) - parseFloat(v2)) < 0.01) continue;
        console.log(`❌ Producto ${id}: Diferencia en columna ${i + 1}. Original: "${v1}" | Nuevo: "${v2}"`);
        passed = false;
      }
    }
  }

  // Comparar Variantes
  console.log(`Comparando Variantes: Antes=${data1.variantes.length} vs Después=${data2.variantes.length}`);
  if (data1.variantes.length !== data2.variantes.length) {
    console.log('❌ La cantidad de variantes es diferente.');
    passed = false;
  }

  const v1Map = new Map(data1.variantes.map(v => [String(v[0]), v]));
  for (const v2 of data2.variantes) {
    const id = String(v2[0]);
    const v1 = v1Map.get(id);
    if (!v1) {
      console.log(`❌ Variante ${id} no estaba en el original.`);
      passed = false;
      continue;
    }
    for (let i = 0; i < v1.length; i++) {
      // Ignoramos la columna 3 (Nombre Producto Padre) que es formula VLOOKUP
      if (i === 2) continue;

      const val1 = v1[i] === undefined || v1[i] === null ? '' : String(v1[i]).trim();
      const val2 = v2[i] === undefined || v2[i] === null ? '' : String(v2[i]).trim();
      if (val1 !== val2) {
        if (!isNaN(parseFloat(val1)) && !isNaN(parseFloat(val2)) && Math.abs(parseFloat(val1) - parseFloat(val2)) < 0.01) continue;
        console.log(`❌ Variante ${id}: Diferencia en columna ${i + 1}. Original: "${val1}" | Nuevo: "${val2}"`);
        passed = false;
      }
    }
  }

  return passed;
}

async function main() {
  console.log('⏳ Iniciando Strapi...');
  const app = await require('@strapi/strapi').createStrapi().load();
  console.log('✅ Strapi iniciado.');

  try {
    const tmpDir = path.join(__dirname, '../tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

    const baselinePath = path.join(tmpDir, 'baseline.xlsx');
    const afterPath = path.join(tmpDir, 'after.xlsx');

    console.log('1️⃣ Exportando estado base...');
    const baselineResult = await exportAdmin().generarExcel(app);
    fs.writeFileSync(baselinePath, baselineResult.buffer);
    console.log(`✅ Base exportada: ${baselineResult.totalProductos} productos.`);

    console.log('2️⃣ Importando base exportada...');
    const importResult = await importAdmin().procesarImportacion(app, baselinePath);
    console.log(`✅ Importación completada. Errores: ${importResult.errores}`);

    console.log('3️⃣ Exportando estado nuevo...');
    const afterResult = await exportAdmin().generarExcel(app);
    fs.writeFileSync(afterPath, afterResult.buffer);
    console.log(`✅ Nuevo estado exportado: ${afterResult.totalProductos} productos.`);

    console.log('4️⃣ Comparando Excel...');
    const dataBaseline = await readExcel(baselinePath);
    const dataAfter = await readExcel(afterPath);

    const success = compareExcels(dataBaseline, dataAfter);

    if (success) {
      console.log('\n🎉 TEST SUPERADO: La importación y exportación son consistentes e idempotentes.');
    } else {
      console.log('\n⚠️ TEST FALLIDO: Hay diferencias entre la exportación base y la nueva.');
    }
  } catch (error) {
    console.error('❌ Error en el test:', error);
  } finally {
    process.exit(0);
  }
}

main();
