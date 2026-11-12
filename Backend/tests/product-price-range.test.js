const { test } = require('node:test');
const assert = require('node:assert/strict');
const { calcularRangoPrecios, reconciliarRangoPrecios } = require('../src/utils/product-price-range');

test('calcula min y max desde variantes cuando el producto padre no tiene precio', () => {
  const range = calcularRangoPrecios({
    precio: null,
    precio_oferta: null,
    variantes: [
      { id_original: '30000', precio: 5200, precio_oferta: null },
      { id_original: '30001', precio: 5900, precio_oferta: 5500 },
      { id_original: '30002', precio: 0, precio_oferta: null },
    ],
  });

  assert.equal(range.precio_minimo_calculado, 5200);
  assert.equal(range.precio_maximo_calculado, 5500);
});

test('devuelve null cuando ni el producto padre ni las variantes tienen precio mayor a 0', () => {
  const range = calcularRangoPrecios({
    precio: 0,
    variantes: [{ precio: null }, { precio: 0 }],
  });

  assert.equal(range.precio_minimo_calculado, null);
  assert.equal(range.precio_maximo_calculado, null);
});

test('reconciliarRangoPrecios repara productos existentes sin precio_minimo_calculado que tienen variantes con precio', async () => {
  const updates = [];
  const strapi = {
    db: {
      query: () => ({
        findMany: async () => [
          {
            id: 41028,
            precio: null,
            precio_minimo_calculado: null,
            variantes: [
              { precio: 5200, precio_oferta: null },
              { precio: 5900, precio_oferta: null },
            ],
          },
          {
            id: 99999,
            precio: null,
            precio_minimo_calculado: null,
            variantes: [{ precio: 0 }],
          },
        ],
      }),
      connection: () => ({
        where: (cond) => ({
          update: async (values) => {
            updates.push({ cond, values });
          },
        }),
      }),
    },
    log: { info: () => {} },
  };

  const count = await reconciliarRangoPrecios(strapi);
  assert.equal(count, 1);
  assert.equal(updates.length, 1);
  assert.deepEqual(updates[0], {
    cond: { id: 41028 },
    values: { precio_minimo_calculado: 5200, precio_maximo_calculado: 5900 },
  });
});

test('el controlador de producto conserva $or de búsqueda e incluye variantes con precio > 0', async () => {
  let capturedFilters = null;
  const superFindCalls = [];
  const fakeFactories = {
    createCoreController: (_uid, customizer) => customizer({ strapi: {} }),
  };

  const Module = require('module');
  const origLoad = Module._load;
  Module._load = function patched(request, parent, isMain) {
    if (request === '@strapi/strapi') return { factories: fakeFactories };
    return origLoad.call(this, request, parent, isMain);
  };

  let ctrlFactory;
  try {
    delete require.cache[require.resolve('../src/api/producto/controllers/producto')];
    ctrlFactory = require('../src/api/producto/controllers/producto');
  } finally {
    Module._load = origLoad;
  }

  // Simular prototype super.find
  const proto = {
    async find(ctx) {
      capturedFilters = ctx.query.filters;
      superFindCalls.push(ctx.query);
      return { data: [], meta: {} };
    },
  };
  const ctrl = Object.assign(Object.create(proto), ctrlFactory);
  ctrl.find = async function boundFind(ctx) {
    const original = ctrlFactory.find;
    // Rebind super fallback using custom helper
    const savedProtoFind = proto.find;
    return original.call({ find: savedProtoFind }, ctx);
  };

  // Llamar directamente pasando super a través del prototype
  const ctx = {
    query: {
      filters: {
        $or: [{ nombre: { $containsi: 'colbert' } }],
        publicado: { $eq: true },
      },
    },
  };
  await Object.setPrototypeOf(ctrlFactory, proto).find(ctx);

  assert.equal(capturedFilters.$or[0].nombre.$containsi, 'colbert');
  assert.equal(capturedFilters.publicado.$eq, true);
  assert.ok(Array.isArray(capturedFilters.$and));
  const priceOr = capturedFilters.$and[0].$or;
  assert.ok(priceOr.some((cond) => cond.variantes?.precio?.$gt === 0));
  assert.ok(priceOr.some((cond) => cond.precio_minimo_calculado?.$gt === 0));
});
