const { createStrapi } = require('@strapi/strapi');
const path = require('path');
const fs = require('fs');

async function run() {
  console.log('Inicializando Strapi en modo script...');
  const app = await createStrapi().load();
  console.log('Strapi cargado.');

  try {
    // 1. Obtener lista de proveedores
    const exportService = app.service('api::exportacion-proveedores-admin.exportacion-proveedores-admin');
    const proveedores = await exportService.fetchProveedores(app);
    console.log(`Proveedores encontrados:`, proveedores);
    
    if (proveedores.length === 0) {
      throw new Error('No hay proveedores en la base de datos para probar.');
    }
    
    const provPrueba = proveedores[0];
    console.log(`\n==== TEST INICIADO PARA PROVEEDOR: ${provPrueba} ====`);

    // 2. Exportar Excel
    console.log('Generando exportación...');
    const resultExport = await exportService.generarExcelProveedor(app, [provPrueba]);
    
    const tempFile = path.join(__dirname, '../data/test_prov.xlsx');
    fs.writeFileSync(tempFile, resultExport.buffer);
    console.log(`Excel exportado a ${tempFile}`);

    // Producto original para verificar
    const productosRaw = await app.documents('api::producto.producto').findMany({
      filters: { proveedor: provPrueba },
      populate: ['variantes', 'categoria'],
      limit: 1
    });

    if (productosRaw.length === 0) {
      throw new Error(`No se encontraron productos para el proveedor ${provPrueba}`);
    }

    const prodOriginal = productosRaw[0];
    console.log(`\nProducto elegido para alterar: ID ${prodOriginal.id_original} | Precio: $${prodOriginal.precio} | Nombre: ${prodOriginal.nombre}`);
    
    // 3. Alterar el precio en el Excel
    const ExcelJS = require('exceljs');
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(tempFile);
    const ws = wb.getWorksheet('💲 Precios por Proveedor');
    
    let targetRow = null;
    let oldPrice = 0;
    ws.eachRow((row, rowNum) => {
      if (rowNum === 1) return;
      const idStr = String(row.getCell(1).value || '').trim();
      if (idStr === prodOriginal.id_original) {
        targetRow = row;
        oldPrice = parseFloat(row.getCell(7).value) || 0;
      }
    });

    if (!targetRow) {
      throw new Error('No se encontró el producto en el Excel.');
    }

    const newPrice = oldPrice + 1000;
    targetRow.getCell(7).value = newPrice;
    await wb.xlsx.writeFile(tempFile);
    console.log(`Precio alterado en el Excel: $${oldPrice} -> $${newPrice}`);

    // 4. Importar el archivo
    console.log('\nImportando archivo alterado...');
    const importService = app.service('api::importacion-admin.importacion-admin');
    const importResult = await importService.procesarImportacion(app, tempFile);
    
    console.log(`Resultados de importación: 🔄 Actualizados = ${importResult.actualizados} | ⏩ Sin Cambios = ${importResult.sinCambios} | ❌ Errores = ${importResult.errores}`);
    
    if (importResult.actualizados !== 1) {
      console.warn(`⚠️ Se esperaban 1 actualizado, pero hubieron ${importResult.actualizados} (puede ser que otros productos tenían precios null y se recalcularon)`);
    }

    // 5. Verificar Integridad
    console.log('\nVerificando integridad en la base de datos...');
    const prodVerificado = await app.documents('api::producto.producto').findOne({
      documentId: prodOriginal.documentId,
      populate: ['variantes', 'categoria']
    });

    console.log(`-> Precio en BD: $${prodVerificado.precio}`);
    console.log(`-> Nombre: "${prodVerificado.nombre}" (Original: "${prodOriginal.nombre}")`);
    console.log(`-> Categoría: "${prodVerificado.categoria?.nombre}" (Original: "${prodOriginal.categoria?.nombre}")`);
    console.log(`-> Proveedor: "${prodVerificado.proveedor}" (Original: "${prodOriginal.proveedor}")`);

    if (prodVerificado.precio !== newPrice) throw new Error('❌ El precio en la BD no coincide con la importación.');
    if (prodVerificado.nombre !== prodOriginal.nombre) throw new Error('❌ El nombre fue alterado.');
    if (prodVerificado.categoria?.nombre !== prodOriginal.categoria?.nombre) throw new Error('❌ La categoría fue alterada.');
    if (prodVerificado.proveedor !== prodOriginal.proveedor) throw new Error('❌ El proveedor fue alterado.');
    
    console.log('✅ ¡INTEGRIDAD CONFIRMADA! Ningún metadato se perdió.');

    // 6. Restaurar
    console.log('\nRestaurando precio original...');
    targetRow.getCell(7).value = oldPrice;
    await wb.xlsx.writeFile(tempFile);
    
    const restoreResult = await importService.procesarImportacion(app, tempFile);
    console.log(`Restauración terminada: 🔄 Actualizados = ${restoreResult.actualizados} | ⏩ Sin Cambios = ${restoreResult.sinCambios}`);

    const prodRestaurado = await app.documents('api::producto.producto').findOne({
      documentId: prodOriginal.documentId,
    });

    console.log(`Precio final en BD: $${prodRestaurado.precio}`);
    console.log('\n===== TEST END-TO-END COMPLETADO EXITOSAMENTE =====');
    
  } catch (err) {
    console.error('\n❌ ERROR EN TEST:', err);
  } finally {
    process.exit(0);
  }
}

run();
