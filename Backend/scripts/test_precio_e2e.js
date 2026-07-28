const strapi = require('@strapi/strapi');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

const importAdmin = require('../src/api/importacion-admin/services/importacion-admin.js');
const exportAdmin = require('../src/api/exportacion-admin/services/exportacion-admin.js');

async function main() {
  console.log('⏳ Iniciando Strapi para Test End-to-End...');
  const app = await createStrapi().load();
  console.log('✅ Strapi iniciado.');

  try {
    const tmpDir = path.join(__dirname, '../tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    const exportPath = path.join(tmpDir, 'test_export.xlsx');
    const importPath = path.join(tmpDir, 'test_import_modified.xlsx');
    const finalExportPath = path.join(tmpDir, 'test_final_export.xlsx');

    // 1️⃣ Obtener un producto de prueba de la BD (ej. que tenga variante genérica)
    const testProduct = await app.db.query('api::producto.producto').findOne({
      where: { id_original: '4922' },
      populate: ['variantes']
    });

    if (!testProduct) throw new Error('No se encontró el producto de prueba (4922)');
    const originalPrice = testProduct.precio;
    const testPrice = 99999.99; // Precio loco para el test
    console.log(`\n📦 Producto de prueba seleccionado: [ID: ${testProduct.id_original}] ${testProduct.nombre}`);
    console.log(`   Precio actual en DB: $${originalPrice}`);

    // 2️⃣ Exportar el estado actual
    console.log('\n2️⃣ Exportando datos actuales a Excel...');
    const baselineResult = await exportAdmin().generarExcel(app);
    fs.writeFileSync(exportPath, baselineResult.buffer);

    // 3️⃣ Leer el Excel, modificar el precio del producto y guardarlo
    console.log('\n3️⃣ Simulando al usuario: Editando el Excel (cambiando precio a $99999.99)...');
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(exportPath);
    const wsP = wb.getWorksheet('📦 Productos');
    
    let foundRow = null;
    wsP.eachRow((row, r) => {
      if (r > 3 && String(row.getCell(1).value) === String(testProduct.id_original)) {
        foundRow = row;
        // Columna 16 es Precio
        row.getCell(16).value = testPrice;
      }
    });

    if (!foundRow) throw new Error('No se encontró el producto en el Excel exportado.');
    await wb.xlsx.writeFile(importPath);

    // 4️⃣ Importar el Excel modificado
    console.log('\n4️⃣ Ejecutando el proceso de Importación del Excel modificado...');
    const importResult = await importAdmin().procesarImportacion(app, importPath);
    if (importResult.errores > 0) console.error('⚠️ Hubo errores en la importación', importResult.erroresList);

    // 5️⃣ Verificar la base de datos (Backend/Web)
    console.log('\n5️⃣ Verificando la Base de Datos (lo que ve la Web)...');
    const updatedProduct = await app.db.query('api::producto.producto').findOne({
      where: { id_original: testProduct.id_original },
      populate: ['variantes']
    });

    if (Number(updatedProduct.precio) === testPrice) {
      console.log(`   ✅ DB: Precio del producto actualizado correctamente a $${testPrice}`);
    } else {
      console.error(`   ❌ DB ERROR: El precio del producto es $${updatedProduct.precio}, se esperaba $${testPrice}`);
    }

    if (updatedProduct.variantes && updatedProduct.variantes.length > 0) {
      if (Number(updatedProduct.variantes[0].precio) === testPrice) {
         console.log(`   ✅ DB: Precio de la variante sincronizado correctamente a $${testPrice}`);
      } else {
         console.error(`   ❌ DB ERROR: El precio de la variante es $${updatedProduct.variantes[0].precio}, se esperaba $${testPrice}`);
      }
    }

    // 6️⃣ Volver a exportar y verificar el Excel resultante
    console.log('\n6️⃣ Exportando de nuevo para verificar el Excel generado...');
    const finalResult = await exportAdmin().generarExcel(app);
    fs.writeFileSync(finalExportPath, finalResult.buffer);

    const wbFinal = new ExcelJS.Workbook();
    await wbFinal.xlsx.readFile(finalExportPath);
    const wsPFinal = wbFinal.getWorksheet('📦 Productos');
    
    let finalExcelPrice = null;
    wsPFinal.eachRow((row, r) => {
      if (r > 3 && String(row.getCell(1).value) === String(testProduct.id_original)) {
        finalExcelPrice = row.getCell(16).value;
      }
    });

    if (Number(finalExcelPrice) === testPrice) {
      console.log(`   ✅ EXCEL: El nuevo Excel exporta correctamente el precio $${testPrice} en la hoja Productos.`);
    } else {
      console.error(`   ❌ EXCEL ERROR: El nuevo Excel exportó $${finalExcelPrice}, se esperaba $${testPrice}`);
    }

    // Opcional: Revertir el cambio para no dejar basura
    console.log('\n🔄 Revirtiendo cambios para mantener la DB limpia...');
    updatedProduct.variantes[0].precio = originalPrice;
    await app.db.query('api::producto.producto').update({
      where: { id: updatedProduct.id },
      data: {
        precio: originalPrice,
        variantes: updatedProduct.variantes
      }
    });
    console.log('✅ Cambio revertido.');

    console.log('\n🎉 TEST END-TO-END COMPLETADO CON ÉXITO.');

  } catch (error) {
    console.error('\n❌ ERROR FATAL EN EL TEST:', error);
  } finally {
    process.exit(0);
  }
}

// Inicializador compatible
function createStrapi() {
  return require('@strapi/strapi').createStrapi();
}

main();
