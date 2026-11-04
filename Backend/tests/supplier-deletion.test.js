'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const service = require('../src/api/exportacion-proveedores-admin/services/exportacion-proveedores-admin')();
const controller = require('../src/api/exportacion-proveedores-admin/controllers/exportacion-proveedores-admin');

function fixture() {
  const records = [
    { documentId: 'one', id_original: '1', nombre: 'Uno', sku: 'SKU1', variantes: [{ sku_ean: 'EAN1' }], proveedor: 'A, SA', updatedAt: 'v1' },
    { documentId: 'two', id_original: '2', nombre: 'Dos', sku: 'SKU2', proveedor: 'A, SA', updatedAt: 'v1' },
    { documentId: 'other', id_original: '3', nombre: 'Otro', sku: 'SKU3', proveedor: 'B', updatedAt: 'v1' },
    { documentId: 'outside', id_original: '4', nombre: 'Fuera', proveedor: 'C', updatedAt: 'v1' },
  ];
  const draft = new Map(records.map(p => [p.documentId, { ...p }]));
  const removed = [];
  const docs = {
    async findMany({ filters, start, limit }) { return records.filter(p => filters.proveedor.$in.includes(p.proveedor)).slice(start, start + limit); },
    async findOne({ documentId, status }) { return status === 'draft' ? draft.get(documentId) : records.find(p => p.documentId === documentId); },
    async delete({ documentId }) {
      if (documentId === docs.fail) throw new Error('Error de prueba');
      removed.push(documentId);
      records.splice(records.findIndex(p => p.documentId === documentId), 1);
      draft.delete(documentId);
    },
  };
  global.strapi = { documents: () => docs, service: () => service, config: { get: () => 'test-secret' }, log: { info() {}, error() {} } };
  const admin = jwt.sign({ isAdminImport: true }, 'test-secret');
  const ctx = body => ({ request: { header: { authorization: `Bearer ${admin}` }, body },
    send(data) { this.body = data; return data; },
    unauthorized(message) { this.status = 401; this.body = { error: { message } }; },
    badRequest(message) { this.status = 400; this.body = { error: { message } }; },
    internalServerError(message) { this.status = 500; this.body = { error: { message } }; },
  });
  return { records, draft, removed, docs, ctx };
}

async function preview(f, proveedores = ['A, SA', 'B']) {
  const ctx = f.ctx({ proveedores });
  await controller.vistaPreviaBorrado(ctx);
  return ctx.body;
}
function confirmation(f, vista, productos, overrides = {}) {
  return f.ctx({ proveedores: vista.proveedores, productos, confirmacion: 'BORRAR', comprobante: vista.comprobante, ...overrides });
}

test('borra únicamente productos seleccionados de varios proveedores', async () => {
  const f = fixture();
  const vista = await preview(f);
  assert.equal(vista.total, 3);
  assert.deepEqual(vista.productos.find(p => p.documentId === 'one').skuVariantes, ['EAN1']);
  const ctx = confirmation(f, vista, ['one', 'other']);
  await controller.confirmarBorrado(ctx);
  assert.equal(ctx.body.borrados.length, 2);
  assert.deepEqual(f.removed.sort(), ['one', 'other']);
  assert.deepEqual(f.records.map(p => p.documentId).sort(), ['outside', 'two']);
});

test('rechaza selección vacía, IDs ajenos, proveedores alterados y comprobante vencido', async () => {
  const f = fixture();
  const vista = await preview(f);
  const empty = confirmation(f, vista, []);
  await controller.confirmarBorrado(empty);
  assert.equal(empty.status, 400);
  const foreign = confirmation(f, vista, ['one', 'outside']);
  await controller.confirmarBorrado(foreign);
  assert.equal(foreign.status, 409);
  const changed = confirmation(f, vista, ['outside'], { proveedores: ['C'] });
  await controller.confirmarBorrado(changed);
  assert.equal(changed.status, 400);
  const expired = jwt.sign({ accion: 'borrar-seleccion-proveedores', proveedores: vista.proveedores, hash: 'x', exp: Math.floor(Date.now() / 1000) - 1 }, 'test-secret');
  const expiredCtx = confirmation(f, vista, ['one'], { comprobante: expired });
  await controller.confirmarBorrado(expiredCtx);
  assert.equal(expiredCtx.status, 400);
  const unauth = f.ctx({ proveedores: ['A, SA'] });
  unauth.request.header.authorization = '';
  await controller.vistaPreviaBorrado(unauth);
  assert.equal(unauth.status, 401);
  assert.deepEqual(f.removed, []);
});

test('rechaza cambios y borradores de otro proveedor; informa errores parciales', async () => {
  const f = fixture();
  let vista = await preview(f);
  f.draft.get('one').updatedAt = 'v2';
  const stale = confirmation(f, vista, ['one']);
  await controller.confirmarBorrado(stale);
  assert.equal(stale.status, 409);
  f.draft.get('one').proveedor = 'C';
  vista = await preview(f);
  assert.equal(vista.productos.find(p => p.documentId === 'one').bloqueado, true);
  const blocked = confirmation(f, vista, ['one']);
  await controller.confirmarBorrado(blocked);
  assert.equal(blocked.status, 409);
  f.docs.fail = 'two';
  const partial = confirmation(f, vista, ['two', 'other']);
  await controller.confirmarBorrado(partial);
  assert.equal(partial.body.ok, false);
  assert.equal(partial.body.errores[0].id_original, '2');
  assert.deepEqual(f.removed, ['other']);
});

test('incluye productos de todas las páginas de proveedores seleccionados', async () => {
  const f = fixture();
  for (let i = 0; i < 110; i++) {
    const product = { documentId: `extra-${i}`, id_original: `ID-${i}`, nombre: `Producto ${i}`, proveedor: 'B', updatedAt: 'v1' };
    f.records.push(product);
    f.draft.set(product.documentId, { ...product });
  }
  const vista = await preview(f);
  assert.equal(vista.total, 113);
  assert.ok(vista.productos.some(p => p.documentId === 'extra-109'));
});
