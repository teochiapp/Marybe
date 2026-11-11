'use strict';

// Prueba de componentes de Strapi sobre una base SQLite nueva y descartable.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ExcelJS = require('exceljs');

const backendDir = path.resolve(__dirname, '..');
const tmpDir = path.join(backendDir, '.tmp');
fs.mkdirSync(tmpDir, { recursive: true });
const dbName = `qa-excel-${process.pid}-${Date.now()}.db`;
const dbFile = path.join(tmpDir, dbName);
process.env.DATABASE_CLIENT = 'sqlite';
process.env.DATABASE_FILENAME = `.tmp/${dbName}`;
process.env.APP_KEYS ||= 'qa-excel-key-one,qa-excel-key-two';
process.env.API_TOKEN_SALT ||= 'qa-excel-api-salt';
process.env.ADMIN_JWT_SECRET ||= 'qa-excel-admin-secret';
process.env.TRANSFER_TOKEN_SALT ||= 'qa-excel-transfer-salt';
process.env.JWT_SECRET ||= 'qa-excel-jwt-secret';

const importService = require('../src/api/importacion-admin/services/importacion-admin')();
const generalService = require('../src/api/exportacion-admin/services/exportacion-admin')();
const supplierService = require('../src/api/exportacion-proveedores-admin/services/exportacion-proveedores-admin')();
const UID = 'api::producto.producto';

async function saveExcel(buffer, name, edit) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);
  if (edit) edit(wb);
  const filename = path.join(tmpDir, `qa-excel-${process.pid}-${name}.xlsx`);
  await wb.xlsx.writeFile(filename);
  return filename;
}

async function main() {
  let app;
  const files = [];
  try {
    app = await require('@strapi/strapi').createStrapi().load();
    const p = await app.documents(UID).create({
      status: 'published',
      data: {
        id_original: 'QA-P2', nombre: 'Prueba Excel', proveedor: 'Proveedor, S.A.',
        seccion: 'Perfumería', subcategoria: 'Mujer', tipo: 'Perfume',
        stock: 17, precio: 1250.75, precio_oferta: 1000, descuento: 20,
        publicado: true, destacado: false,
        clasificaciones: [
          { seccion: 'Perfumería', categoria: 'Fragancias', subcategoria: 'Mujer', tipo: 'Perfume' },
          { seccion: 'Perfumería', categoria: 'Regalos', subcategoria: 'Sets', tipo: 'Cofres' },
        ],
        variantes: [
          { id_original: 'QA-P2-100', volumen: '100 ml', color_nombre: 'Rojo', stock: 8, precio: 1250.75, precio_oferta: 1000, publicado: true, envio: '1' },
          { id_original: 'QA-P2-50', volumen: '50 ml', color_nombre: 'Azul', stock: 6, precio: 900, publicado: true, envio: '1' },
        ],
      },
    });
    const before = await app.db.query(UID).findOne({ where: { id_original: 'QA-P2' }, populate: ['variantes', 'clasificaciones'] });
    assert.equal(before.variantes.length, 2);

    const supplier = await supplierService.generarExcelProveedor(app, ['Proveedor, S.A.']);
    const unchanged = await saveExcel(supplier.buffer, 'unchanged');
    files.push(unchanged);
    const initial = await importService.procesarImportacion(app, unchanged);
    assert.equal(initial.errores, 0, initial.erroresList.join('; '));
    assert.equal(initial.sinCambios, 1, 'la hoja de proveedor sin cambios no debe reescribir el producto');
    let after = await app.db.query(UID).findOne({ where: { id_original: 'QA-P2' }, populate: ['variantes', 'clasificaciones'] });
    assert.equal(after.stock, 17);
    assert.equal(after.clasificaciones.length, 2);
    assert.equal(after.variantes.length, 2);
    assert.equal(after.variantes[0].color_nombre, 'Rojo');

    const changed = await saveExcel(supplier.buffer, 'changed', wb => {
      const ws = wb.getWorksheet('💲 Precios por Proveedor');
      ws.getCell(4, 14).value = null;
      const row = ws._rows.findIndex(r => r && String(r.getCell(1).value).includes('QA-P2-100')) + 1;
      ws.getCell(row, 12).value = 3;
      ws.getCell(row, 13).value = '1.250,75';
    });
    files.push(changed);
    const modified = await importService.procesarImportacion(app, changed);
    assert.equal(modified.errores, 0, modified.erroresList.join('; '));
    after = await app.db.query(UID).findOne({ where: { id_original: 'QA-P2' }, populate: ['variantes', 'clasificaciones'] });
    assert.equal(after.stock, 17);
    assert.equal(after.precio_oferta, null);
    assert.equal(after.clasificaciones.length, 2);
    assert.equal(after.variantes.length, 2);
    assert.equal(after.variantes.find(v => v.id_original === 'QA-P2-100').stock, 3);
    assert.equal(Number(after.variantes.find(v => v.id_original === 'QA-P2-100').precio), 1250.75);
    assert.equal(after.variantes.find(v => v.id_original === 'QA-P2-100').color_nombre, 'Rojo');

    const newProductFile = await saveExcel(supplier.buffer, 'new-product', wb => {
      const ws = wb.getWorksheet('💲 Precios por Proveedor');
      ws.getCell(4, 14).value = null;
      const row = ws.getRow(ws.rowCount + 2);
      ['QA-NUEVO', 'SKU-N', 'Proveedor, S.A.', 'Producto nuevo', 'Perfumería', 'Fragancias', 'Mujer', 'Perfume', 'SI', 'NO', '', 5, 1200, 900].forEach((v, i) => { row.getCell(i + 1).value = v; });
      const vs = wb.getWorksheet('🔗 Variantes');
      const vr = vs.getRow(vs.rowCount + 1);
      ['QA-NUEVO-1', 'QA-NUEVO', '', 'EAN-N', '100 ml', 5, 1200, 900, '', 'SI', '1', 'Rojo'].forEach((v, i) => { vr.getCell(i + 1).value = v; });
    });
    files.push(newProductFile);
    const created = await importService.procesarImportacion(app, newProductFile);
    assert.equal(created.creados, 1, created.erroresList.join('; '));
    const newProduct = await app.db.query(UID).findOne({ where: { id_original: 'QA-NUEVO' }, populate: ['variantes', 'clasificaciones'] });
    assert.equal(newProduct.nombre, 'Producto nuevo');
    assert.equal(newProduct.proveedor, 'Proveedor, S.A.');
    assert.equal(newProduct.variantes[0].id_original, 'QA-NUEVO-1');
    assert.equal(newProduct.clasificaciones[0].categoria, 'Fragancias');

    const simple = await app.documents(UID).create({
      status: 'published',
      data: { id_original: 'QA-SIMPLE', nombre: 'Producto simple', proveedor: 'Otro', stock: 4, precio: 500,
        variantes: [{ id_original: 'QA-SIMPLE-v1', stock: 4, precio: 500, publicado: true, envio: '1' }] },
    });
    assert.ok(p.documentId && simple.documentId);
    const simpleBefore = await app.db.query(UID).findOne({ where: { id_original: 'QA-SIMPLE' }, populate: ['variantes'] });
    const general = await generalService.generarExcel(app);
    const generalFile = await saveExcel(general.buffer, 'general');
    files.push(generalFile);
    const result = await importService.procesarImportacion(app, generalFile);
    assert.equal(result.errores, 0, result.erroresList.join('; '));
    const simpleAfter = await app.db.query(UID).findOne({ where: { id_original: 'QA-SIMPLE' }, populate: ['variantes'] });
    assert.equal(simpleAfter.variantes.length, 1);
    assert.equal(simpleAfter.variantes[0].id_original, 'QA-SIMPLE-v1');
    assert.equal(simpleAfter.variantes[0].id, simpleBefore.variantes[0].id);
    const parentAfterGeneral = await app.db.query(UID).findOne({ where: { id_original: 'QA-P2' } });
    assert.equal(parentAfterGeneral.precio_oferta, null, 'la importación general no debe reconstruir la oferta del padre desde una variante');
    console.log('SQLite aislada: proveedor sin cambios, edición y -v1 general verificados.');
  } finally {
    if (app) await app.destroy();
    for (const file of files) if (fs.existsSync(file)) fs.unlinkSync(file);
    for (const suffix of ['', '-shm', '-wal']) {
      const file = dbFile + suffix;
      if (fs.existsSync(file)) fs.unlinkSync(file);
    }
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
