const { test } = require('node:test');
const assert = require('node:assert/strict');
const createService = require('../src/api/pedido/services/custom-pedido');

function service(config = { costo_envio: 6000, envio_gratis_desde: 50000 }) {
  return createService({ strapi: {
    db: { query: () => ({ findOne: async () => ({ id: 1, stock: 10, precio: 1000, variantes: [] }) }) },
    entityService: { findMany: async uid => uid.includes('gift-card') ? [{ activa: true, monto: 500 }] : config },
  } });
}
const items = [{ product: { id: 1, nombre: 'Shampoo' }, quantity: 2 }];
test('domicilio no permite evadir envío enviando costo cero', async () => {
  const result = await service().validateCartAndCalculateTotal(items, 0, 0, 'domicilio');
  assert.equal(result.costoEnvioFinal, 6000);
  assert.equal(result.finalTotal, 8000);
});
test('retiro gratuito, incluyendo transferencia o Mercado Pago', async () => {
  const result = await service().validateCartAndCalculateTotal(items, 6000, 0, 'sucursal');
  assert.equal(result.costoEnvioFinal, 0);
  assert.equal(result.finalTotal, 2000);
});
test('domicilio respeta umbral de envío gratis y descuento', async () => {
  const result = await service({ costo_envio: 6000, envio_gratis_desde: 2000 }).validateCartAndCalculateTotal(items, 6000, 500, 'domicilio', 'GC-QA');
  assert.equal(result.costoEnvioFinal, 0);
  assert.equal(result.finalTotal, 1500);
});
test('no confirma entrega a domicilio si falta configuración de envío', async () => {
  await assert.rejects(service(null).validateCartAndCalculateTotal(items, 0, 0, 'domicilio'), /costo de envío/);
});
