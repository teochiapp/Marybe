'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const jwt = require('jsonwebtoken');
const dir = path.join(__dirname, '..', '.tmp');
fs.mkdirSync(dir, { recursive: true });
const name = `qa-recategorizar-${process.pid}-${Date.now()}.db`;
const file = path.join(dir, name);
process.env.DATABASE_CLIENT = 'sqlite';
process.env.DATABASE_FILENAME = `.tmp/${name}`;
process.env.APP_KEYS = 'qa-key-one,qa-key-two';
process.env.API_TOKEN_SALT = 'qa-api-salt';
process.env.ADMIN_JWT_SECRET = 'qa-admin-secret';
process.env.TRANSFER_TOKEN_SALT = 'qa-transfer-salt';
process.env.JWT_SECRET = 'qa-recategorizar-secret';
const controller = require('../src/api/exportacion-proveedores-admin/controllers/exportacion-proveedores-admin');
const uid = 'api::producto.producto';
function context(body) {
  return { request: { body, header: { authorization: `Bearer ${jwt.sign({ isAdminImport: true }, process.env.JWT_SECRET)}` } }, send(value) { this.body = value; return value; }, badRequest(message) { throw new Error(message); }, unauthorized(message) { throw new Error(message); }, internalServerError(message) { throw new Error(message); } };
}
async function main() {
  let app;
  try {
    app = await require('@strapi/strapi').createStrapi().load();
    global.strapi = app;
    const docs = app.documents(uid);
    const p = await docs.create({ status: 'published', data: { nombre: 'Producto QA', proveedor: 'Proveedor QA', precio: 100, publicado: true } });
    const sinProveedor = await docs.create({ status: 'published', data: { nombre: 'Sin proveedor QA', sku: 'EAN-QA-123', precio: 100, publicado: true } });
    const busqueda = context({ busqueda: 'EAN-QA-123' });
    await controller.productosRecategorizacion(busqueda);
    assert.equal(busqueda.body.productos.length, 1);
    assert.equal(busqueda.body.productos[0].documentId, sinProveedor.documentId);
    assert.equal(busqueda.body.productos[0].proveedor, null);
    const draft = await docs.findOne({ documentId: p.documentId, status: 'draft' });
    const tax = require('../src/utils/excel-taxonomy.json');
    const category = Object.keys(tax)[0];
    const sub = Object.keys(tax[category])[0];
    const type = tax[category][sub][0] || '';
    const classes = [{ seccion: 'Perfumería', categoria: category, subcategoria: sub, tipo: type }, { seccion: 'Hogar', categoria: category, subcategoria: sub, tipo: type }];
    const sinProveedorSave = context({ documentId: sinProveedor.documentId, proveedor: null, updatedAt: busqueda.body.productos[0].updatedAt, clasificaciones: classes });
    await controller.guardarRecategorizacion(sinProveedorSave);
    assert.equal(sinProveedorSave.body.ok, true);
    const save = context({ documentId: p.documentId, proveedor: 'Proveedor QA', updatedAt: draft.updatedAt, clasificaciones: classes });
    await controller.guardarRecategorizacion(save);
    assert.equal(save.body.ok, true);
    assert.ok(save.body.updatedAt);
    const saveAgain = context({ documentId: p.documentId, proveedor: 'Proveedor QA', updatedAt: save.body.updatedAt, clasificaciones: classes });
    await controller.guardarRecategorizacion(saveAgain);
    assert.equal(saveAgain.body.ok, true);
    const after = await docs.findOne({ documentId: p.documentId, status: 'published', populate: ['clasificaciones', 'categoria'] });
    assert.equal(after.categoria.nombre, category);
    assert.deepEqual(after.clasificaciones.map(c => c.seccion), ['Perfumería', 'Hogar']);
    const filtered = await docs.findMany({ status: 'published', filters: { clasificaciones: { seccion: 'Hogar', categoria: category, subcategoria: sub } } });
    assert.ok(filtered.some(item => item.documentId === p.documentId));
    await docs.update({ documentId: p.documentId, data: { precio: 200 } });
    const dirty = await docs.findOne({ documentId: p.documentId, status: 'draft' });
    const blocked = context({ documentId: p.documentId, proveedor: 'Proveedor QA', updatedAt: dirty.updatedAt, clasificaciones: [classes[1]] });
    await controller.guardarRecategorizacion(blocked);
    assert.equal(blocked.status, 409);
    assert.equal(Number((await docs.findOne({ documentId: p.documentId, status: 'published' })).precio), 100);
    const stillPublished = await docs.findOne({ documentId: p.documentId, status: 'published', populate: ['clasificaciones'] });
    assert.deepEqual(stillPublished.clasificaciones.map(c => c.seccion), ['Perfumería', 'Hogar']);
    console.log('QA recategorización y publicación aisladas: OK');
  } finally {
    if (app) await app.destroy();
    for (const suffix of ['', '-shm', '-wal']) if (fs.existsSync(file + suffix)) fs.unlinkSync(file + suffix);
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
