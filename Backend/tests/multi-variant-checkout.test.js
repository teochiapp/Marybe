const { test } = require('node:test');
const assert = require('node:assert/strict');
const createOrderService = require('../src/api/pedido/services/custom-pedido');
const createMPService = require('../src/api/mercado-pago/services/mercado-pago');

const products = [
  { id: 1, nombre: 'Perfume A', variantes: [
    { id: 11, volumen: '100 ml', precio: 1000, stock: 8, sku_ean: 'A100' },
    { id: 12, volumen: '200 ml', precio: 2000, precio_oferta: 1500, stock: 3, sku_ean: 'A200' },
  ] },
  { id: 2, nombre: 'Perfume B', variantes: [
    { id: 21, id_original: 'B-100', volumen: '100 ml', precio: 3000, stock: 4, sku_ean: 'B100' },
    { id: 22, volumen: '200 ml', precio: 4000, stock: 2, sku_ean: 'B200' },
  ] },
];
const cart = products.flatMap(product => product.variantes.map(variant => ({
  product: { id: product.id, nombre: product.nombre }, variant, quantity: variant.id === 12 ? 2 : 1, price: 1,
})));
function setup() {
  const api = {
    db: { query: () => ({ findOne: async ({ where }) => products.find(p => p.id === Number(where.id)) }) },
    entityService: { findMany: async () => ({ costo_envio: 6000, envio_gratis_desde: 50000 }) },
  };
  const service = createOrderService({ strapi: api });
  api.service = () => service;
  return { api, service };
}

test('valida cuatro variantes de dos productos usando ID o ID original y precios de Strapi', async () => {
  const { service } = setup();
  const result = await service.validateCartAndCalculateTotal(cart, 0, 0, 'sucursal');
  assert.equal(result.finalTotal, 11000);
  assert.deepEqual(result.validatedItems.map(i => [i.dbProductId, i.dbVariantId, i.validatedPrice]), [[1, 11, 1000], [1, 12, 1500], [2, 21, 3000], [2, 22, 4000]]);
});
test('rechaza variantes desconocidas y cantidades combinadas que superan stock', async () => {
  const { service } = setup();
  await assert.rejects(service.validateCartAndCalculateTotal([{ ...cart[0], variant: { id: 999 } }], 0, 0, 'sucursal'), /Variante no encontrada/);
  await assert.rejects(service.validateCartAndCalculateTotal([{ ...cart[1], quantity: 2 }, { ...cart[1], quantity: 2 }], 0, 0, 'sucursal'), /stock suficiente/);
  await assert.rejects(service.validateCartAndCalculateTotal([{ ...cart[0], variant: {} }], 0, 0, 'sucursal'), /Seleccioná una variante/);
});

test('Mercado Pago recibe cuatro ítems identificados por producto y variante con precio validado', async () => {
  const previousStrapi = global.strapi;
  const previousFetch = global.fetch;
  const { api } = setup();
  global.strapi = api;
  let payload;
  global.fetch = async (url, request) => {
    assert.equal(url, 'https://api.mercadopago.com/checkout/preferences');
    payload = JSON.parse(request.body);
    return { ok: true, json: async () => ({ id: 'TEST', init_point: 'https://example.test/checkout' }) };
  };
  try {
    await createMPService().crearPreferencia({ productos: cart, metodo_envio: 'domicilio', envio: 6000, externalReference: 'TEST-ORDER' });
    assert.equal(payload.items.length, 5);
    assert.equal(new Set(payload.items.slice(0, 4).map(item => item.id)).size, 4);
    assert.deepEqual(payload.items.slice(0, 4).map(item => [item.quantity, item.unit_price]), [[1, 1000], [2, 1500], [1, 3000], [1, 4000]]);
    assert.ok(payload.items[1].title.includes('200 ml'));
    assert.equal(payload.items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0), 17000);
    assert.equal(payload.external_reference, 'TEST-ORDER');
  } finally { global.strapi = previousStrapi; global.fetch = previousFetch; }
});

test('el pedido conserva cada SKU, ID y subtotal validado para admin y descuento de stock', async () => {
  const previousStrapi = global.strapi;
  const { api } = setup();
  let stored;
  api.entityService.create = async ({}, options) => { stored = options.data; return { id: 100, ...stored }; };
  global.strapi = api;
  try {
    const controller = require('../src/api/pedido/controllers/custom-pedido');
    const ctx = { state: { user: { id: 9, email: 'test@example.com' } }, request: { body: {
      productos: cart, total: 11000, metodo_pago: 'mercadopago', metodo_envio: 'sucursal', direccion_envio: { sucursal: 'Test', provincia: 'Test' },
    } }, send: result => result, badRequest: msg => { throw new Error(msg); }, internalServerError: msg => { throw new Error(msg); } };
    await controller.createMyOrder(ctx);
    assert.equal(stored.productos.length, 4);
    assert.deepEqual(stored.productos.map(i => [i.sku, i.id_variante, i.subtotal]), [['A100', 11, 1000], ['A200', 12, 3000], ['B100', 21, 3000], ['B200', 22, 4000]]);
    assert.equal(stored.total, 11000);
  } finally { global.strapi = previousStrapi; }
});
