const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const controller = require('../src/api/exportacion-proveedores-admin/controllers/exportacion-proveedores-admin');
const secret = 'test-secret-for-recategorization';
global.strapi = { config: { get: () => secret }, log: { error() {} } };
function ctx(body, authorized = true) {
  return { request: { body, header: { authorization: authorized ? `Bearer ${jwt.sign({ isAdminImport: true }, secret)}` : '' } }, unauthorized: m => ({ status: 401, message: m }), badRequest: m => ({ status: 400, message: m }), send: body => body };
}
test('requiere autenticacion', async () => {
  assert.equal((await controller.guardarRecategorizacion(ctx({}, false))).status, 401);
});
test('rechaza una rama ajena a la taxonomia', async () => {
  const result = await controller.guardarRecategorizacion(ctx({ documentId: 'p', proveedor: 'A', updatedAt: 'v', clasificaciones: [{ seccion: 'Hogar', categoria: 'NO EXISTE', subcategoria: '', tipo: '' }] }));
  assert.equal(result.status, 400);
});
