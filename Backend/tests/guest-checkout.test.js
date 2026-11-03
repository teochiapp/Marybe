const { test } = require('node:test');
const assert = require('node:assert/strict');
const controller = require('../src/api/pedido/controllers/custom-pedido');
const createOrderService = require('../src/api/pedido/services/custom-pedido');
const createMPService = require('../src/api/mercado-pago/services/mercado-pago');
const { deliveryDetails } = require('../src/api/correo/services/templates/delivery-details');

const contact = { nombre: 'Ana', apellido: 'Pérez', email: 'ANA@example.com', telefono: '3851234567' };
const pickup = { metodo_envio: 'sucursal', sucursal: 'Maipú 164', provincia: 'Tucumán', telefono_sucursal: '3811234567' };
const home = { metodo_envio: 'domicilio', calle: 'Mitre', numero: '123', ciudad: 'Ciudad', provincia: 'Provincia', cp: '4200' };
function fixture(method = 'efectivo', delivery = pickup) {
  const events = { orders: [], stock: [], emails: [] };
  const product = { id: 1, nombre: 'Perfume', stock: 5, precio: 1000, variantes: [] };
  const api = {
    db: { query: () => ({ findOne: async () => product }) },
    entityService: {
      create: async (uid, { data }) => { assert.equal(uid, 'api::pedido.pedido'); const order = { id: 7, ...data }; events.orders.push(order); return order; },
      findMany: async uid => uid === 'api::pedido.pedido' ? events.orders : { costo_envio: 6000 },
      update: async (uid, id, { data }) => {
        if (uid === 'api::producto.producto') events.stock.push(data.stock);
        else Object.assign(events.orders.find(order => order.id === id), data);
      },
    },
  };
  const service = createOrderService({ strapi: api });
  const correo = {
    enviarConfirmacionPedido: async (...args) => events.emails.push(['cliente', ...args]),
    enviarAlertaNuevoPedidoAdmin: async (...args) => events.emails.push(['admin', ...args]),
  };
  api.service = uid => uid === 'api::correo.correo' ? correo : service;
  const ctx = { state: {}, request: { body: {
    cliente: contact, productos: [{ product: { id: 1, nombre: 'Perfume' }, quantity: 2, price: 1000 }],
    total: 2000, metodo_pago: method, metodo_envio: delivery.metodo_envio, direccion_envio: delivery,
    usuario: 999, // A guest must never be linked by a client-supplied user ID.
  } }, send: data => data, badRequest: message => ({ error: message }), unauthorized: message => ({ unauthorized: message }), internalServerError: message => { throw new Error(message); } };
  return { api, ctx, events };
}

for (const method of ['efectivo', 'transferencia', 'aconvenir']) {
  test(`invitado con ${method}: persiste contacto, descuenta stock y notifica sin crear cuenta`, async () => {
    const previous = global.strapi;
    const { api, ctx, events } = fixture(method);
    global.strapi = api;
    try {
      await controller.createGuestOrder(ctx);
      const order = events.orders[0];
      assert.equal(order.cliente_email, 'ana@example.com');
      assert.equal(order.es_invitado, true);
      assert.equal(order.usuario, undefined);
      assert.equal(order.direccion_envio.nombre, 'Ana Pérez');
      assert.equal(order.direccion_envio.telefono, contact.telefono);
      assert.equal(order.direccion_envio.sucursal, pickup.sucursal);
      assert.equal(order.total, 2000);
      assert.deepEqual(events.stock, [3]);
      assert.equal(events.emails.length, 2);
      assert.equal(events.emails[0][1], 'ana@example.com');
    } finally { global.strapi = previous; }
  });
}
test('invitado a domicilio guarda número, contacto y costo de envío recalculado', async () => {
  const previous = global.strapi;
  const { api, ctx, events } = fixture('efectivo', home);
  global.strapi = api;
  try {
    await controller.createGuestOrder(ctx);
    assert.equal(events.orders[0].total, 8000);
    assert.equal(events.orders[0].direccion_envio.numero, '123');
    assert.ok(deliveryDetails(events.orders[0].direccion_envio).includes('Mitre 123'));
  } finally { global.strapi = previous; }
});
test('datos inválidos o sucursal ausente no crean pedido; historial sigue requiriendo login', async () => {
  const { ctx, events } = fixture();
  ctx.request.body.cliente = { ...contact, email: 'invalido' };
  assert.match((await controller.createGuestOrder(ctx)).error, /email/);
  ctx.request.body.cliente = contact;
  ctx.request.body.direccion_envio = { metodo_envio: 'sucursal' };
  assert.match((await controller.createGuestOrder(ctx)).error, /sucursal/);
  assert.equal(events.orders.length, 0);
  assert.ok((await controller.getMyOrders(ctx)).unauthorized);
  const registeredCtx = fixture().ctx;
  assert.ok((await controller.createMyOrder(registeredCtx)).unauthorized);
});
test('Mercado Pago: invitado pendiente pasa por webhook, envía correos y descuenta stock una vez', async () => {
  const previous = global.strapi;
  const previousFetch = global.fetch;
  const { api, ctx, events } = fixture('mercadopago');
  global.strapi = api;
  try {
    await controller.createGuestOrder(ctx);
    assert.equal(events.stock.length, 0);
    assert.equal(events.emails.length, 0);
    global.fetch = async () => ({ ok: true, json: async () => ({ status: 'approved', external_reference: events.orders[0].numero_pedido }) });
    const service = createMPService();
    await service.procesarWebhookDePago('TEST-7');
    await service.procesarWebhookDePago('TEST-7');
    assert.deepEqual(events.stock, [3]);
    assert.equal(events.emails.length, 2);
    assert.equal(events.emails[0][1], 'ana@example.com');
    assert.match(events.orders[0].metodo_pago, /Pagado/);
  } finally { global.strapi = previous; global.fetch = previousFetch; }
});
test('emails muestran sucursal/provincia/teléfono y domicilio completo con datos de invitado', () => {
  const clientTemplate = require('../src/api/correo/services/templates/confirmacion-pedido-cliente');
  const adminTemplate = require('../src/api/correo/services/templates/alerta-nuevo-pedido-admin');
  const order = { numero_pedido: 'TEST', productos: [], total: 1000, cliente_email: 'ana@example.com', direccion_envio: { ...pickup, telefono: contact.telefono } };
  for (const html of [clientTemplate(order.cliente_email, '<Ana>', order), adminTemplate(order, '<Ana>')]) {
    for (const value of [pickup.sucursal, pickup.provincia, pickup.telefono_sucursal, '&lt;Ana&gt;']) assert.ok(html.includes(value));
    assert.ok(!html.includes('<Ana>'));
  }
  const html = deliveryDetails(home);
  for (const value of ['Mitre 123', '4200', 'Provincia']) assert.ok(html.includes(value));
});
