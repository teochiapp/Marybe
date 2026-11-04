'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const tmpDir = path.join(__dirname, '..', '.tmp');
fs.mkdirSync(tmpDir, { recursive: true });
const dbName = `qa-delete-${process.pid}-${Date.now()}.db`;
const dbFile = path.join(tmpDir, dbName);
process.env.DATABASE_CLIENT = 'sqlite';
process.env.DATABASE_FILENAME = `.tmp/${dbName}`;
process.env.APP_KEYS ||= 'qa-delete-one,qa-delete-two';
process.env.API_TOKEN_SALT ||= 'qa-delete-api';
process.env.ADMIN_JWT_SECRET ||= 'qa-delete-admin';
process.env.TRANSFER_TOKEN_SALT ||= 'qa-delete-transfer';
process.env.JWT_SECRET ||= 'qa-delete-jwt';
const controller = require('../src/api/exportacion-proveedores-admin/controllers/exportacion-proveedores-admin');
const jwt = require('jsonwebtoken');

async function main() {
  let app;
  try {
    app = await require('@strapi/strapi').createStrapi().load();
    const uid = 'api::producto.producto';
    const a = await app.documents(uid).create({ status: 'published', data: {
      nombre: 'Producto A', id_original: 'QA-A', proveedor: 'Proveedor A',
      variantes: [{ id_original: 'QA-A-1', precio: 50, stock: 1 }],
    } });
    const b = await app.documents(uid).create({ status: 'published', data: {
      nombre: 'Producto B', id_original: 'QA-B', proveedor: 'Proveedor B',
    } });
    const untouched = await app.documents(uid).create({ status: 'published', data: {
      nombre: 'Conservar', id_original: 'QA-C', proveedor: 'Proveedor A',
    } });
    const pedido = await app.documents('api::pedido.pedido').create({ data: {
      numero_pedido: 'QA-DELETE', total: 50, productos: [{ producto: 'Producto A', id_producto: a.id, cantidad: 1 }],
    } });
    const secret = app.config.get('plugin.users-permissions.jwtSecret') || 'custom-secret-key';
    const token = jwt.sign({ isAdminImport: true }, secret);
    const ctx = body => ({ request: { header: { authorization: `Bearer ${token}` }, body },
      send(data) { this.body = data; return data; },
      unauthorized(message) { throw new Error(message); }, badRequest(message) { throw new Error(message); },
      internalServerError(message) { throw new Error(message); },
    });
    const previewCtx = ctx({ proveedores: ['Proveedor A', 'Proveedor B'] });
    await controller.vistaPreviaBorrado(previewCtx);
    const preview = previewCtx.body;
    assert.equal(preview.total, 3);
    const confirmCtx = ctx({ proveedores: preview.proveedores, productos: [a.documentId, b.documentId], confirmacion: 'BORRAR', comprobante: preview.comprobante });
    await controller.confirmarBorrado(confirmCtx);
    const result = confirmCtx.body;
    assert.equal(result.borrados.length, 2, JSON.stringify(result));
    assert.equal(await app.documents(uid).findOne({ documentId: a.documentId, status: 'published' }), null);
    assert.equal(await app.documents(uid).findOne({ documentId: a.documentId, status: 'draft' }), null);
    assert.equal((await app.db.query('producto.variante').findMany({ where: { id_original: 'QA-A-1' } })).length, 0);
    assert.equal(await app.documents(uid).findOne({ documentId: b.documentId, status: 'published' }), null);
    assert.ok(await app.documents(uid).findOne({ documentId: untouched.documentId, status: 'published' }));
    const savedOrder = await app.documents('api::pedido.pedido').findOne({ documentId: pedido.documentId });
    assert.equal(savedOrder.productos[0].producto, 'Producto A');
    console.log('Borrado en SQLite: versiones, variantes y pedido histórico verificados.');
  } finally {
    if (app) await app.destroy();
    for (const suffix of ['', '-wal', '-shm']) {
      const file = dbFile + suffix;
      if (fs.existsSync(file)) fs.unlinkSync(file);
    }
  }
}
main().catch(err => { console.error(err); process.exitCode = 1; });
