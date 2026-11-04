'use strict';
const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const paymentDB = require('./helpers/payment-db');
const createService = require('../src/api/mercado-pago/services/mercado-pago');
const controller = require('../src/api/mercado-pago/controllers/mercado-pago');
const createOrderService = require('../src/api/pedido/services/custom-pedido');
let fixture, previous, requests, payments, service;
const reference = 'M-ABC123';
const payment = (status, extra = {}) => ({ id: 123456, status, external_reference: reference, transaction_amount: 2000, currency_id: 'ARS', ...extra });
const sync = (extra = {}) => service.sincronizar({ externalReference: reference, checkoutToken: fixture.checkout.token, ...extra });

beforeEach(async () => {
  previous = { strapi: global.strapi, fetch: global.fetch, token: process.env.MP_ACCESS_TOKEN, secret: process.env.MP_WEBHOOK_SECRET };
  process.env.MP_ACCESS_TOKEN = 'TEST-NO-REAL-PAYMENTS';
  process.env.MP_WEBHOOK_SECRET = 'qa-webhook-secret';
  fixture = await paymentDB(); global.strapi = fixture.api; service = createService(); requests = []; payments = [];
  global.fetch = async (url, options) => {
    requests.push({ url, options });
    return { ok: true, json: async () => url.includes('/payments/search') ? { results: payments } : url.includes('/v1/payments/') ? payments[0] : { id: 'PREF-QA', init_point: 'https://example.test/checkout' } };
  };
});
afterEach(async () => {
  await fixture.close(); global.strapi = previous.strapi; global.fetch = previous.fetch;
  for (const [key, value] of [['MP_ACCESS_TOKEN', previous.token], ['MP_WEBHOOK_SECRET', previous.secret]]) {
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
});

test('sin terminar el checkout y volver por failure sin payment_id queda Abortado, sin stock ni correos', async () => {
  const result = await sync({ abort: true });
  assert.equal(result.estado, 'Abortado'); assert.equal(result.pagado, false);
  assert.equal((await fixture.read('products', 1)).stock, 10); assert.equal(fixture.events.emails.length, 0);
});
for (const status of ['rejected', 'cancelled']) test(`webhook ${status} deja Abortado`, async () => {
  payments = [payment(status)];
  const result = await service.procesarWebhookDePago('123456');
  assert.equal(result.estado, 'Abortado'); assert.equal(result.status, status); assert.equal(result.pagado, false);
});
for (const status of ['pending', 'in_process', 'authorized', 'in_mediation']) test(`${status} sigue Pendiente de pago aunque el navegador solicite abortar`, async () => {
  payments = [payment(status)]; const result = await sync({ abort: true });
  assert.equal(result.estado, 'Pendiente de pago'); assert.equal(result.pagado, false); assert.equal(fixture.events.emails.length, 0);
});
test('approved acredita una sola vez frente a webhooks concurrentes y repetidos', async () => {
  payments = [payment('approved')];
  const results = await Promise.all([service.procesarWebhookDePago('123456'), sync(), sync({ abort: true })]);
  assert.ok(results.every(result => result.pagado)); assert.equal((await fixture.read('products', 1)).stock, 8);
  assert.equal(fixture.events.emails.length, 2);
  assert.equal((await sync()).estado, 'Procesando'); assert.equal((await fixture.read('products', 1)).stock, 8);
});
test('aborto seguido de aprobación tardía recupera el pedido real pagado', async () => {
  await sync({ abort: true }); payments = [payment('approved')];
  assert.equal((await sync()).estado, 'Procesando'); assert.equal((await fixture.read('products', 1)).stock, 8);
});
test('un intento rechazado no pisa otro aprobado de la misma referencia', async () => {
  payments = [payment('rejected', { id: 777 }), payment('approved')];
  assert.equal((await sync()).pagado, true);
  payments = [payment('rejected', { id: 777 })]; assert.equal((await sync({ abort: true })).pagado, true);
});
for (const extra of [{ transaction_amount: 1 }, { currency_id: 'USD' }, { transaction_amount: 'NaN' }]) test(`no acredita un importe/moneda inválido: ${JSON.stringify(extra)}`, async () => {
  payments = [payment('approved', extra)]; await assert.rejects(sync(), /no coincide/);
  assert.equal((await fixture.read('products', 1)).stock, 10); assert.equal(fixture.events.emails.length, 0);
});
test('fallo de stock revierte la transacción; el reintento completa efectos una sola vez', async () => {
  payments = [payment('approved')]; fixture.events.failStock = true;
  await assert.rejects(sync(), /stock database failure/);
  assert.equal((await fixture.read('orders', 1)).estado, 'Pendiente de pago');
  assert.equal((await fixture.read('orders', 1)).pago_mercadopago.processedAt, undefined);
  assert.equal(fixture.events.emails.length, 0);
  fixture.events.failStock = false; await sync(); assert.equal((await fixture.read('products', 1)).stock, 8);
});
test('stock insuficiente no marca pagado ni descuenta por debajo de cero', async () => {
  await fixture.api.entityService.update('api::producto.producto', 1, { data: { stock: 1 } });
  payments = [payment('approved')]; await assert.rejects(sync(), /Stock insuficiente/);
  assert.equal((await fixture.read('products', 1)).stock, 1); assert.equal(fixture.events.emails.length, 0);
});
test('una API caída no se interpreta como aborto', async () => {
  global.fetch = async () => ({ ok: false, status: 503 }); await assert.rejects(sync({ abort: true }), /HTTP 503/);
  assert.equal((await fixture.read('orders', 1)).estado, 'Pendiente de pago');
});
test('token incorrecto no consulta MP ni cambia el pedido; datos privados no salen en el estado', async () => {
  await assert.rejects(sync({ checkoutToken: '0'.repeat(64) }), /acceso/); assert.equal(requests.length, 0);
  const result = await sync(); assert.equal(JSON.stringify(result).includes('tokenHash'), false);
});
test('preferencia usa pedido persistido e ignora total, productos, email, URLs y referencia ajena del cliente', async () => {
  await service.crearPreferencia({ externalReference: reference, checkoutToken: fixture.checkout.token, total: 1, productos: [], userEmail: 'attacker@example.test', frontendUrl: 'https://attacker.test' });
  const body = JSON.parse(requests[0].options.body);
  assert.equal(body.items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0), 2000);
  assert.equal(body.payer.email, 'qa@example.test'); assert.equal(body.external_reference, reference);
  assert.ok(!JSON.stringify(body).includes('attacker')); assert.equal(body.expires, true);
  assert.ok(body.back_urls.failure.includes('reference=M-ABC123')); assert.ok(body.notification_url.endsWith('/api/mercado-pago/webhook'));
  await service.crearPreferencia({ externalReference: reference, checkoutToken: fixture.checkout.token });
  assert.ok(requests[1].url.endsWith('/checkout/preferences/PREF-QA')); // Reuses the existing preference.
});
test('cierre de pestaña: conciliación vence solo intentos sin pagos; un pending real no vence localmente', async () => {
  const order = await fixture.read('orders', 1);
  await fixture.api.entityService.update('api::pedido.pedido', 1, { data: { pago_mercadopago: { ...order.pago_mercadopago, expiresAt: new Date(Date.now() - 1000).toISOString() } } });
  payments = [payment('pending')]; await service.reconciliarPendientes();
  assert.equal((await fixture.read('orders', 1)).estado, 'Pendiente de pago');
  payments = []; await service.reconciliarPendientes(); assert.equal((await fixture.read('orders', 1)).estado, 'Abortado');
});
test('un pedido cancelado manualmente no se reabre por un pago tardío', async () => {
  await fixture.api.entityService.update('api::pedido.pedido', 1, { data: { estado: 'Cancelado' } });
  payments = [payment('approved')]; await assert.rejects(sync(), /Revisión manual/); assert.equal((await fixture.read('products', 1)).stock, 10);
});
for (const status of ['refunded', 'charged_back']) test(`${status} se registra para revisión sin volver a descontar ni reponer stock`, async () => {
  payments = [payment('approved')]; await sync(); payments = [payment(status)];
  const result = await sync(); assert.equal(result.status, status); assert.equal(result.pagado, false);
  assert.equal((await fixture.read('products', 1)).stock, 8); assert.equal(fixture.events.emails.length, 2); assert.equal(fixture.events.errors.length, 1);
});
test('webhook moderno: firma válida + data.id; firma inválida no procesa', async () => {
  payments = [payment('cancelled')];
  const ts = String(Date.now()); const requestId = 'qa-request';
  const signature = crypto.createHmac('sha256', process.env.MP_WEBHOOK_SECRET).update(`id:123456;request-id:${requestId};ts:${ts};`).digest('hex');
  const ctx = { request: { query: { 'data.id': '123456', type: 'payment' }, body: { type: 'payment', data: { id: 123456 } }, headers: { 'x-signature': `ts=${ts},v1=${signature}`, 'x-request-id': requestId } }, send: value => value, unauthorized: () => 'unauthorized', throw: (_, msg) => { throw new Error(msg); } };
  assert.equal(await controller.webhook(ctx), undefined); assert.equal((await fixture.read('orders', 1)).estado, 'Abortado');
  requests.length = 0; ctx.request.headers['x-signature'] = `ts=${ts},v1=${'0'.repeat(64)}`;
  assert.equal(await controller.webhook(ctx), 'unauthorized'); assert.equal(requests.length, 0);
});
test('descuentos falsificados y productos disfrazados de Gift Card no evaden la validación', async () => {
  const cart = [{ product: { id: 1, nombre: 'Gift Card falsa' }, quantity: 1, price: 1 }];
  const pricing = createOrderService({ strapi: fixture.api });
  assert.equal((await pricing.validateCartAndCalculateTotal(cart, 0, 0, 'sucursal')).finalTotal, 1000);
  await assert.rejects(pricing.validateCartAndCalculateTotal(cart, 0, 999, 'sucursal'), /código/);
  await assert.rejects(pricing.validateCartAndCalculateTotal(cart, 0, 999, 'sucursal', 'GC-FAKE'), /no está disponible/);
});

test('al abortar se cierra la preferencia existente antes de permitir un nuevo intento', async () => {
  await service.crearPreferencia({ externalReference: reference, checkoutToken: fixture.checkout.token });
  await sync({ abort: true });
  const update = requests.find(r => r.options.method === 'PUT');
  assert.ok(update.url.endsWith('/checkout/preferences/PREF-QA'));
  assert.ok(Date.parse(JSON.parse(update.options.body).expiration_date_to) < Date.now());
  assert.equal((await fixture.read('orders', 1)).estado, 'Abortado');
});

test('fallo al cerrar preferencia no da por abortado un checkout todavía activo', async () => {
  await service.crearPreferencia({ externalReference: reference, checkoutToken: fixture.checkout.token });
  const fetch = global.fetch;
  global.fetch = async (url, options) => options.method === 'PUT' ? { ok: false, status: 503 } : fetch(url, options);
  await assert.rejects(sync({ abort: true }), /HTTP 503/);
  assert.equal((await fixture.read('orders', 1)).estado, 'Pendiente de pago');
});

test('transacción descuenta la variante exacta una sola vez', async () => {
  await fixture.api.entityService.update('api::producto.producto', 1, { data: { variantes: [{ id: 10, stock: 5 }, { id: 11, stock: 7 }] } });
  const order = await fixture.read('orders', 1);
  await fixture.api.entityService.update('api::pedido.pedido', 1, { data: { productos: order.productos.map(p => ({ ...p, id_variante: 10 })) } });
  payments = [payment('approved')]; await Promise.all([sync(), sync()]);
  assert.deepEqual((await fixture.read('products', 1)).variantes.map(v => v.stock), [3, 7]);
});

test('generación de Gift Card y descuento de stock son atómicos e idempotentes', async () => {
  const order = await fixture.read('orders', 1);
  await fixture.api.entityService.update('api::pedido.pedido', 1, { data: { total: 3000, productos: [...order.productos, { producto: 'Gift Card', id_producto: 'gift-card-1000', cantidad: 1, precio_unitario: 1000, sku: 'GIFT-CARD' }] } });
  payments = [payment('approved', { transaction_amount: 3000 })]; await sync(); await sync();
  assert.equal((await fixture.read('products', 1)).stock, 8);
  const cards = await fixture.api.entityService.findMany('api::gift-card.gift-card');
  assert.equal(cards.length, 1); assert.equal(cards[0].monto, 1000);
  assert.deepEqual((await fixture.read('orders', 1)).gift_cards_generadas, [cards[0].codigo]);
  assert.ok(fixture.events.emails[0][3].gift_cards_generadas.includes(cards[0].codigo));
});

test('fallo de emisión Gift Card revierte también el stock ya descontado', async () => {
  const order = await fixture.read('orders', 1);
  await fixture.api.entityService.update('api::pedido.pedido', 1, { data: { total: 3000, productos: [...order.productos, { producto: 'Gift Card', id_producto: 'gift-card-1000', cantidad: 1, precio_unitario: 1000, sku: 'GIFT-CARD' }] } });
  fixture.api.entityService.create = async () => { throw new Error('GC database failure'); };
  payments = [payment('approved', { transaction_amount: 3000 })]; await assert.rejects(sync(), /GC database failure/);
  assert.equal((await fixture.read('products', 1)).stock, 10);
  assert.equal((await fixture.read('orders', 1)).estado_pago, 'requires_review');
  assert.equal((await fixture.read('orders', 1)).pago_mercadopago.processedAt, undefined);
  assert.equal(fixture.events.emails.length, 0);
});

for (const activa of [true, false]) test(`consumo de Gift Card valida estado y participa de la transacción; activa=${activa}`, async () => {
  await fixture.api.entityService.create('api::gift-card.gift-card', { data: { codigo: 'GC-VALID', activa, monto: 1000 } });
  const order = await fixture.read('orders', 1);
  await fixture.api.entityService.update('api::pedido.pedido', 1, { data: { total: 1000, productos: [...order.productos, { producto: 'Descuento por Gift Card (GC-VALID)', sku: 'DESCUENTO-GC', subtotal: -1000 }] } });
  payments = [payment('approved', { transaction_amount: 1000 })];
  if (activa) {
    await sync(); await sync(); assert.equal((await fixture.read('cards', 1)).activa, false); assert.equal((await fixture.read('products', 1)).stock, 8);
  } else {
    await assert.rejects(sync(), /ya utilizada/); assert.equal((await fixture.read('products', 1)).stock, 10);
  }
});

test('sin credenciales configuradas no usa una clave incrustada ni envía una solicitud', async () => {
  delete process.env.MP_ACCESS_TOKEN; await assert.rejects(sync(), /Access Token no configurado/); assert.equal(requests.length, 0);
});
