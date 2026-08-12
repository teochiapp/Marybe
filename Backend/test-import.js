const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const { createStrapi } = require('@strapi/strapi');

(async () => {
  // Create a test XLSX file
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('📦 Productos');
  
  // Headers (Row 1-3 based on importacion-admin.js parsing)
  ws.addRow(['Title']);
  ws.addRow(['Subtitle']);
  ws.addRow([
    'ID Original *', 'SKU / EAN', 'Nombre *', 'Marca', 'Sección *', 'Categoría', 
    'Subcategoría', 'Tipo', 'Descripción', 'Especificaciones', 'Proveedor', 
    'Publicado', 'Destacado', 'Stock', 'Características', 'Precio *', 
    'Precio Oferta', '% Descuento 🔒'
  ]);
  
  // Product 1: Perfumería -> Maquillaje -> Rostro
  ws.addRow(['TEST-1', '111', 'Test Perfumeria Maquillaje', 'Marca', 'Perfumería', 'Maquillaje', 'Rostro', 'Bases de Maquillaje', 'Desc', 'Esp', 'Prov', 'SI', 'NO', '10', 'Car', '1000', '', '']);
  
  // Product 2: Hogar -> Maquillaje -> Labios
  ws.addRow(['TEST-2', '222', 'Test Hogar Maquillaje', 'Marca', 'Hogar', 'Maquillaje', 'Labios', 'Bálsamos Labiales', 'Desc', 'Esp', 'Prov', 'SI', 'NO', '10', 'Car', '1000', '', '']);
  
  const wsV = wb.addWorksheet('🔗 Variantes');
  wsV.addRow(['Title']);
  wsV.addRow(['Subtitle']);
  wsV.addRow(['ID Original *', 'Producto Padre ID', 'Nombre Col3', 'SKU / EAN', 'Volumen', 'Stock', 'Precio', 'Precio Oferta', '% Desc', 'Publicado', 'Envio', 'Color']);

  const testFile = path.join(__dirname, 'test-import.xlsx');
  await wb.xlsx.writeFile(testFile);
  
  console.log('Test XLSX created. Starting Strapi...');
  const app = await createStrapi({ appDir: __dirname, distDir: __dirname }).load();
  
  console.log('Running import...');
  const importService = app.service('api::importacion-admin.importacion-admin');
  
  try {
    const result = await importService.procesarImportacion(app, testFile);
    console.log('Import Result:', result);
    
    console.log('\nChecking Categories in Database...');
    const categorias = await app.documents('api::categoria.categoria').findMany({
      filters: { nombre: { $eq: 'Maquillaje' } },
      populate: {
        subcategorias: {
          populate: ['tipos']
        }
      }
    });
    
    console.log(`Found ${categorias.length} category(ies) named "Maquillaje"`);
    for (const cat of categorias) {
      console.log(`\n- Categoría: ${cat.nombre}`);
      console.log(`  Sección: ${cat.seccion}`);
      console.log(`  Subcategorías:`);
      for (const sub of cat.subcategorias) {
        console.log(`    * ${sub.nombre}`);
        for (const tipo of sub.tipos) {
          console.log(`      - ${tipo.nombre}`);
        }
      }
    }
  } catch (error) {
    console.error('Error during import test:', error);
  } finally {
    process.exit(0);
  }
})();
