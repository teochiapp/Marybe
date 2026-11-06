'use strict';

const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

const {
  verificarAdmin,
  handleAdminLogin,
  resetRateLimits,
  validateImageUpload,
} = require('../src/utils/admin-auth');

const importController = require('../src/api/importacion-admin/controllers/importacion-admin');
const exportController = require('../src/api/exportacion-admin/controllers/exportacion-admin');
const provController = require('../src/api/exportacion-proveedores-admin/controllers/exportacion-proveedores-admin');
const editorController = require('../src/api/editor-admin/controllers/editor-admin');
const compController = require('../src/api/comparacion-admin/controllers/comparacion-admin');
const pedidoController = require('../src/api/pedido/controllers/custom-pedido');
const createPedidoService = require('../src/api/pedido/services/custom-pedido');
const giftCardController = require('../src/api/gift-card/controllers/custom-gift-card');
const cannonController = require('../src/api/cannon/controllers/cannon');
const createCorreoService = require('../src/api/correo/services/correo');
const confirmacionTemplate = require('../src/api/correo/services/templates/confirmacion-pedido-cliente');
const alertaAdminTemplate = require('../src/api/correo/services/templates/alerta-nuevo-pedido-admin');
const avisoEnviadoTemplate = require('../src/api/correo/services/templates/aviso-pedido-enviado');
const bienvenidaTemplate = require('../src/api/correo/services/templates/bienvenida-cliente');
const indexModule = require('../src/index');
const backendPkg = require('../package.json');

beforeEach(() => {
  resetRateLimits();
});

test('[SEC-01] Rechaza tokens firmados con "custom-secret-key" cuando JWT_SECRET no está configurado o es distinto', async () => {
  const previousStrapi = global.strapi;
  const prevSecret = process.env.JWT_SECRET;
  delete process.env.JWT_SECRET;

  try {
    const forgedToken = jwt.sign({ isAdminImport: true }, 'custom-secret-key');

    // Caso 1: config.get devuelve undefined
    global.strapi = { config: { get: () => undefined }, log: { info() {}, error() {}, warn() {} } };
    const ctxNoSecret = {
      request: { header: { authorization: `Bearer ${forgedToken}` } },
      unauthorized: msg => ({ status: 401, msg }),
    };

    assert.equal(verificarAdmin(ctxNoSecret), false);
    assert.equal((await importController.status(ctxNoSecret)).status, 401);
    assert.equal((await exportController.exportar(ctxNoSecret)).status, 401);
    assert.equal((await provController.proveedores(ctxNoSecret)).status, 401);
    assert.equal((await editorController.proveedores(ctxNoSecret)).status, 401);
    assert.equal((await compController.exportar(ctxNoSecret)).status, 401);
    assert.equal((await pedidoController.adminFind(ctxNoSecret)).status, 401);

    // Caso 2: config.get devuelve un secreto real
    global.strapi = { config: { get: () => 'real-production-secret-key-2026' } };
    assert.equal(verificarAdmin(ctxNoSecret), false);

    const validToken = jwt.sign({ isAdminImport: true }, 'real-production-secret-key-2026');
    const ctxValid = { request: { header: { authorization: `Bearer ${validToken}` } } };
    assert.equal(verificarAdmin(ctxValid), true);
  } finally {
    global.strapi = previousStrapi;
    if (prevSecret !== undefined) process.env.JWT_SECRET = prevSecret;
  }
});

test('[SEC-02] Login admin valida credenciales en tiempo constante y aplica rate limiting (HTTP 429 tras 5 intentos)', () => {
  const previousStrapi = global.strapi;
  const prevPass = process.env.IMPORT_ADMIN_PASSWORD;
  const prevEmail = process.env.IMPORT_ADMIN_EMAIL;

  process.env.IMPORT_ADMIN_EMAIL = 'admin@marybe.com';
  process.env.IMPORT_ADMIN_PASSWORD = 'SuperSecretPassword!2026';
  global.strapi = { config: { get: () => 'jwt-secret-test-2026' } };

  try {
    const makeCtx = (identifier, password, ip = '10.0.0.55') => ({
      ip,
      request: { ip, body: { identifier, password }, headers: {} },
      send: body => ({ status: 200, body }),
      badRequest: msg => ({ status: 400, msg }),
      internalServerError: msg => ({ status: 500, msg }),
    });

    // 5 intentos fallidos devuelven 400
    for (let i = 0; i < 5; i++) {
      const res = handleAdminLogin(makeCtx('admin@marybe.com', `wrong-${i}`));
      assert.equal(res.status, 400);
    }

    // 6.º intento desde la misma IP es bloqueado con HTTP 429
    const blockedCtx = makeCtx('admin@marybe.com', 'SuperSecretPassword!2026');
    const blockedRes = handleAdminLogin(blockedCtx);
    assert.equal(blockedCtx.status, 429);
    assert.equal(blockedRes.error.status, 429);

    // Otra IP puede iniciar sesión normalmente
    const okRes = handleAdminLogin(makeCtx('admin@marybe.com', 'SuperSecretPassword!2026', '10.0.0.99'));
    assert.equal(okRes.status, 200);
    assert.ok(okRes.body.jwt);
  } finally {
    global.strapi = previousStrapi;
    if (prevPass === undefined) delete process.env.IMPORT_ADMIN_PASSWORD;
    else process.env.IMPORT_ADMIN_PASSWORD = prevPass;
    if (prevEmail === undefined) delete process.env.IMPORT_ADMIN_EMAIL;
    else process.env.IMPORT_ADMIN_EMAIL = prevEmail;
  }
});

test('[SEC-02] Cannon API valida X-Api-Key con comparación timing-safe', async () => {
  const previousStrapi = global.strapi;
  const prevKey = process.env.CANNON_API_KEY;
  process.env.CANNON_API_KEY = 'cannon-secret-key-999';

  global.strapi = {
    log: { info() {}, warn() {}, error() {} },
    service: () => ({ buscarPorEan: async () => ({ stock: true, price: 15000, url: 'https://marybe.test/p/1' }) }),
  };

  try {
    const makeCtx = key => ({
      request: { headers: { 'x-api-key': key } },
      query: { ean: '7791234567890' },
      unauthorized: msg => ({ status: 401, msg }),
      badRequest: msg => ({ status: 400, msg }),
      notFound: msg => ({ status: 404, msg }),
      internalServerError: msg => ({ status: 500, msg }),
      send: body => ({ status: 200, body }),
    });

    assert.equal((await cannonController.product(makeCtx('wrong-key'))).status, 401);
    assert.equal((await cannonController.product(makeCtx('cannon-secret-key-999'))).status, 200);
  } finally {
    global.strapi = previousStrapi;
    if (prevKey === undefined) delete process.env.CANNON_API_KEY;
    else process.env.CANNON_API_KEY = prevKey;
  }
});

test('[SEC-03 & SEC-06] Gift Card: entropía de 12 bytes, rate limit (HTTP 429) y ocultamiento de errores internos', async () => {
  const previousStrapi = global.strapi;

  // Entropía: GC- + 24 hex chars (12 bytes)
  const code = giftCardController.generarCodigo();
  assert.match(code, /^GC-[0-9A-F]{24}$/);

  let throwDbError = false;
  global.strapi = {
    log: { error() {} },
    entityService: {
      findMany: async () => {
        if (throwDbError) {
          const dbErr = new Error('SELECT * FROM gift_cards WHERE secret_column = 1');
          dbErr.sql = 'SELECT * FROM gift_cards';
          throw dbErr;
        }
        return [];
      },
    },
  };

  try {
    const makeCtx = (ip = '192.168.1.50') => ({
      ip,
      request: { ip, body: { codigo: 'GC-INVALID' }, headers: {} },
      badRequest: msg => ({ status: 400, msg }),
      notFound: msg => ({ status: 404, msg }),
      internalServerError: msg => ({ status: 500, msg }),
      send: body => ({ status: 200, body }),
    });

    // SEC-06: un fallo interno de BD no filtra el objeto err crudo en ctx.body
    throwDbError = true;
    const errCtx = makeCtx('192.168.1.10');
    const errRes = await giftCardController.apply(errCtx);
    assert.equal(errRes.status, 500);
    assert.equal(errRes.msg, 'Error al procesar la solicitud');
    assert.equal(errCtx.body, undefined);
    throwDbError = false;

    // SEC-03: Rate limiting a partir del 6.º intento desde la misma IP
    for (let i = 0; i < 5; i++) {
      const res = await giftCardController.apply(makeCtx('192.168.1.77'));
      assert.equal(res.status, 404);
    }
    const rateLimitedCtx = makeCtx('192.168.1.77');
    await giftCardController.apply(rateLimitedCtx);
    assert.equal(rateLimitedCtx.status, 429);
  } finally {
    global.strapi = previousStrapi;
  }
});

test('[SEC-04] OAuth callback redirige tokens mediante hash fragment (#) en lugar de query string (?)', async () => {
  let middleware;
  const fakeStrapi = {
    customFields: { register() {} },
    server: {
      app: {},
      use(fn) { middleware = fn; },
    },
    db: { lifecycles: { subscribe() {} } },
  };
  indexModule.register({ strapi: fakeStrapi });

  let redirectedLocation = 'https://marybe.surcodes.com/auth/google/callback';
  const ctx = {
    cookies: {},
    request: { path: '/api/connect/google/callback', query: {} },
    state: { grant: { response: { access_token: 'ya29.secret-token', id_token: 'eyJ.id-token' } } },
    response: {
      get: name => (name === 'Location' ? redirectedLocation : ''),
      set: (name, val) => { if (name === 'Location') redirectedLocation = val; },
    },
  };

  await middleware(ctx, async () => {});
  assert.ok(redirectedLocation.includes('#access_token=ya29.secret-token&id_token=eyJ.id-token'));
  assert.ok(!redirectedLocation.includes('?access_token='));
});

test('[SEC-05] Editor Admin rechaza subida de archivos SVG, HTML o mayores a 200KB en portada y galería', async () => {
  const previousStrapi = global.strapi;
  const secret = 'editor-test-secret';
  const adminToken = jwt.sign({ isAdminImport: true }, secret);
  let uploadCalled = false;

  global.strapi = {
    config: { get: () => secret },
    log: { info() {}, error() {}, debug() {}, warn() {} },
    plugins: { upload: { services: { upload: { upload: async () => { uploadCalled = true; return [{ id: 1 }]; } } } } },
  };

  try {
    const makeUploadCtx = (field, file) => ({
      params: { documentId: 'doc-1', varianteId: '0' },
      request: {
        header: { authorization: `Bearer ${adminToken}` },
        files: { [field]: file },
      },
      badRequest: msg => ({ status: 400, msg }),
      unauthorized: msg => ({ status: 401, msg }),
      internalServerError: msg => ({ status: 500, msg }),
      send: body => ({ status: 200, body }),
    });

    const svgFile = { name: 'xss.svg', mimetype: 'image/svg+xml', size: 1024 };
    const htmlFile = { name: 'exploit.html', mimetype: 'text/html', size: 512 };
    const disguisedSvg = { name: 'vector.svg', mimetype: 'image/png', size: 1024 };

    const resPortadaSvg = await editorController.subirPortada(makeUploadCtx('portada', svgFile));
    assert.equal(resPortadaSvg.status, 400);
    assert.match(resPortadaSvg.msg, /Formato de archivo no permitido/);

    const resVarianteHtml = await editorController.subirPortadaVariante(makeUploadCtx('portada', htmlFile));
    assert.equal(resVarianteHtml.status, 400);

    const resGaleriaSvg = await editorController.agregarGaleria(makeUploadCtx('imagenes', [disguisedSvg]));
    assert.equal(resGaleriaSvg.status, 400);
    assert.equal(uploadCalled, false);

    assert.equal(validateImageUpload({ name: 'foto.webp', mimetype: 'image/webp', size: 150 * 1024 }), null);
  } finally {
    global.strapi = previousStrapi;
  }
});

test('[LOG-01 & LOG-02] Pedido cubierto 100% por Gift Card ($0 a pagar) se procesa con éxito y conserva saldo remanente', async () => {
  const previousStrapi = global.strapi;

  const product = { id: 1, nombre: 'Perfume Gourmand', stock: 5, precio: 30000, variantes: [] };
  const giftCard = { id: 10, codigo: 'GC-50K', activa: true, monto: 50000 };
  const orders = [];
  const emails = [];

  const api = {
    log: { info() {}, warn() {}, error() {} },
    db: {
      query: () => ({ findOne: async () => product }),
      metadata: { get: () => ({ tableName: 'qa' }) },
      transaction: async fn => fn({ trx: () => ({ where() { return this; }, forUpdate() { return this; }, first: async () => ({}) }) }),
    },
    entityService: {
      create: async (uid, { data }) => {
        const created = { id: orders.length + 1, ...data };
        orders.push(created);
        return created;
      },
      findMany: async uid => {
        if (uid === 'api::gift-card.gift-card') return [giftCard];
        if (uid === 'api::configuracion-general.configuracion-general') return [{ costo_envio: 6000, envio_gratis_desde: 50000 }];
        return orders;
      },
      update: async (uid, id, { data }) => {
        if (uid === 'api::producto.producto') Object.assign(product, data);
        if (uid === 'api::gift-card.gift-card') Object.assign(giftCard, data);
      },
    },
  };

  const pedidoService = createPedidoService({ strapi: api });
  const correoService = {
    enviarConfirmacionPedido: async (...args) => emails.push(['cliente', ...args]),
    enviarAlertaNuevoPedidoAdmin: async (...args) => emails.push(['admin', ...args]),
  };
  api.service = uid => (uid === 'api::correo.correo' ? correoService : pedidoService);
  global.strapi = api;

  try {
    const ctx = {
      state: {},
      request: {
        body: {
          cliente: { nombre: 'Lucía', apellido: 'Gómez', email: 'lucia@example.com', telefono: '3854001122' },
          productos: [{ product: { id: 1, nombre: 'Perfume Gourmand' }, quantity: 1, price: 30000 }],
          total: 0,
          metodo_pago: 'transferencia',
          metodo_envio: 'sucursal',
          direccion_envio: { metodo_envio: 'sucursal', sucursal: 'Absalón Rojas 55', provincia: 'Santiago del Estero' },
          descuento_gift_card: 50000,
          codigo_gift_card: 'GC-50K',
        },
      },
      send: data => ({ status: 200, ...data }),
      badRequest: msg => ({ status: 400, error: msg }),
      unauthorized: msg => ({ status: 401, error: msg }),
      internalServerError: msg => ({ status: 500, error: msg }),
    };

    const res = await pedidoController.createGuestOrder(ctx);
    assert.equal(res.status, 200);
    assert.equal(orders.length, 1);
    assert.equal(orders[0].total, 0);
    assert.equal(orders[0].estado, 'Procesando');
    assert.equal(product.stock, 4);

    // LOG-02: La Gift Card de $50.000 consumió $30.000 y conserva $20.000 activos
    assert.equal(giftCard.monto, 20000);
    assert.equal(giftCard.activa, true);

    // Segunda compra por $20.000 consume el remanente y desactiva la Gift Card
    product.precio = 20000;
    ctx.request.body.productos = [{ product: { id: 1, nombre: 'Perfume Gourmand' }, quantity: 1, price: 20000 }];
    ctx.request.body.descuento_gift_card = 20000;
    const res2 = await pedidoController.createGuestOrder(ctx);
    assert.equal(res2.status, 200);
    assert.equal(giftCard.monto, 0);
    assert.equal(giftCard.activa, false);
  } finally {
    global.strapi = previousStrapi;
  }
});

test('[LOG-03] Rechaza compra de Gift Cards con montos inferiores a $1.000 o no enteros', async () => {
  const service = createPedidoService({
    strapi: {
      entityService: { findMany: async () => [{ costo_envio: 0 }] },
    },
  });

  await assert.rejects(
    service.validateCartAndCalculateTotal([{ product: { id: 'gift-card-1' }, quantity: 1 }], 0, 0, 'sucursal'),
    /Monto de gift card inválido/
  );
  const valid = await service.validateCartAndCalculateTotal([{ product: { id: 'gift-card-10000' }, quantity: 1 }], 0, 0, 'sucursal');
  assert.equal(valid.finalTotal, 10000);
});

test('[COM-01 & COM-02] Concurrencia en pedidos offline: dos compras simultáneas por la última unidad solo aprueban una y rechazan la segunda sin sobrevender', async () => {
  const previousStrapi = global.strapi;

  const product = { id: 1, nombre: 'Edición Limitada', stock: 1, precio: 15000, variantes: [] };
  const orders = [];

  const api = {
    log: { info() {}, warn() {}, error() {} },
    db: {
      query: () => ({
        findOne: async () => {
          // Simular latencia asíncrona de lectura en base de datos
          await new Promise(resolve => setTimeout(resolve, 15));
          return product;
        },
      }),
      metadata: { get: () => ({ tableName: 'qa' }) },
      transaction: async fn => fn({ trx: () => ({ where() { return this; }, forUpdate() { return this; }, first: async () => ({}) }) }),
    },
    entityService: {
      create: async (uid, { data }) => {
        const order = { id: orders.length + 1, ...data };
        orders.push(order);
        return order;
      },
      findMany: async () => [{ costo_envio: 0 }],
      update: async (uid, id, { data }) => {
        if (uid === 'api::producto.producto') {
          product.stock = data.stock;
        }
      },
    },
  };

  const pedidoService = createPedidoService({ strapi: api });
  api.service = uid => (uid === 'api::correo.correo'
    ? { enviarConfirmacionPedido: async () => {}, enviarAlertaNuevoPedidoAdmin: async () => {} }
    : pedidoService);
  global.strapi = api;

  try {
    const makeOrderCtx = email => ({
      state: {},
      request: {
        body: {
          cliente: { nombre: 'Cliente', apellido: 'Test', email, telefono: '3854112233' },
          productos: [{ product: { id: 1, nombre: 'Edición Limitada' }, quantity: 1, price: 15000 }],
          total: 15000,
          metodo_pago: 'transferencia',
          metodo_envio: 'sucursal',
          direccion_envio: { metodo_envio: 'sucursal', sucursal: 'Absalón Rojas 55', provincia: 'Santiago del Estero' },
        },
      },
      send: data => ({ status: 200, ...data }),
      badRequest: msg => ({ status: 400, error: msg }),
      unauthorized: msg => ({ status: 401, error: msg }),
      internalServerError: msg => ({ status: 500, error: msg }),
    });

    const [res1, res2] = await Promise.all([
      pedidoController.createGuestOrder(makeOrderCtx('uno@example.com')),
      pedidoController.createGuestOrder(makeOrderCtx('dos@example.com')),
    ]);

    const statuses = [res1.status, res2.status].sort();
    assert.deepEqual(statuses, [200, 400]);
    assert.equal(orders.length, 1);
    assert.equal(product.stock, 0);
  } finally {
    global.strapi = previousStrapi;
  }
});

test('[INT-01, INT-02 & MGT-02] Sanitización HTML en plantillas de email, destinatario admin configurable y remoción de xlsx', async () => {
  assert.equal(backendPkg.dependencies.xlsx, undefined);

  const maliciousOrder = {
    numero_pedido: 'M-XSS123',
    total: 5000,
    metodo_pago: 'transferencia',
    cliente_email: 'cliente@example.com',
    codigo_seguimiento: '<img src=x onerror=alert(1)>',
    productos: [
      {
        producto: '<script>alert("xss")</script>Perfume',
        variante: '<b onmouseover=alert(1)>100ml</b>',
        cantidad: 1,
        precio_unitario: 5000,
        subtotal: 5000,
      },
    ],
    direccion_envio: { metodo_envio: 'sucursal', sucursal: 'Centro', provincia: 'Tucumán' },
  };

  const clientHtml = confirmacionTemplate('cliente@example.com', 'Ana', maliciousOrder);
  const adminHtml = alertaAdminTemplate(maliciousOrder, 'Ana');
  const shippedHtml = avisoEnviadoTemplate('cliente@example.com', 'Ana', maliciousOrder);
  const welcomeHtml = bienvenidaTemplate('<script>evil()</script>');

  for (const html of [clientHtml, adminHtml]) {
    assert.ok(!html.includes('<script>alert("xss")</script>'));
    assert.ok(html.includes('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;Perfume'));
    assert.ok(!html.includes('<b onmouseover=alert(1)>'));
    assert.ok(html.includes('&lt;b onmouseover=alert(1)&gt;100ml&lt;/b&gt;'));
  }

  assert.ok(!shippedHtml.includes('<img src=x onerror=alert(1)>'));
  assert.ok(shippedHtml.includes('&lt;img src=x onerror=alert(1)&gt;'));
  assert.ok(!welcomeHtml.includes('<script>evil()</script>'));
  assert.ok(welcomeHtml.includes('&lt;script&gt;evil()&lt;/script&gt;'));

  // MGT-02: ADMIN_NOTIFICATION_EMAIL configurable
  const prevAdminNotify = process.env.ADMIN_NOTIFICATION_EMAIL;
  process.env.ADMIN_NOTIFICATION_EMAIL = 'operaciones@marybe.com';
  try {
    const correo = createCorreoService({ strapi: {} });
    let sentTo = null;
    correo.enviar = async opts => { sentTo = opts.to; return { success: true }; };
    await correo.enviarAlertaNuevoPedidoAdmin(maliciousOrder, 'Ana');
    assert.equal(sentTo, 'operaciones@marybe.com');
  } finally {
    if (prevAdminNotify === undefined) delete process.env.ADMIN_NOTIFICATION_EMAIL;
    else process.env.ADMIN_NOTIFICATION_EMAIL = prevAdminNotify;
  }
});
