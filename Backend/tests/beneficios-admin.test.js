'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const createService = require('../src/api/beneficios-admin/services/beneficios-admin');
const controller = require('../src/api/beneficios-admin/controllers/beneficios-admin');
const routes = require('../src/api/beneficios-admin/routes/beneficios-admin');

function createHarness() {
  const promociones = [
    {
      id: 1,
      documentId: 'promo-naranja',
      nombre: 'Tarjeta Naranja X',
      cuotas_descripcion: 'sin interés',
      cuotas_cantidad: [3, 6],
      monto_minimo: '$30.000',
      orden: 1,
      activo: true,
      logo: { id: 101, name: 'naranja.png', url: '/uploads/naranja.png', width: 200, height: 80, mime: 'image/png' },
    },
    {
      id: 2,
      documentId: 'promo-macro',
      nombre: 'Banco Macro',
      cuotas_descripcion: 'sin interés todos los días',
      cuotas_cantidad: [3],
      monto_minimo: '$35.000',
      orden: 2,
      activo: true,
      logo: { id: 102, name: 'macro.png', url: '/uploads/macro.png', width: 200, height: 80, mime: 'image/png' },
    },
  ];

  const mediaFiles = new Map([
    [101, { id: 101, name: 'naranja.png', url: '/uploads/naranja.png', width: 200, height: 80, mime: 'image/png' }],
    [102, { id: 102, name: 'macro.png', url: '/uploads/macro.png', width: 200, height: 80, mime: 'image/png' }],
    [103, { id: 103, name: 'nuevo-logo.png', url: '/uploads/nuevo-logo.png', width: 240, height: 90, mime: 'image/png' }],
  ]);

  let mainRow = {
    id: 1,
    documentId: 'sec-1',
    updatedAt: '2026-11-01T10:00:00.000Z',
    diseno_secciones: {},
    borradores_editor_inicio: {},
  };

  const promoUpdates = [];

  const strapi = {
    config: { get: () => 'test-secret' },
    log: { error() {}, warn() {}, info() {} },
    documents(uid) {
      if (uid === 'api::seccion-principal.seccion-principal') {
        return {
          async findFirst() {
            return mainRow ? { ...mainRow } : null;
          },
          async update({ data }) {
            mainRow = {
              ...mainRow,
              ...data,
              updatedAt: '2026-11-01T11:00:00.000Z',
            };
            return mainRow;
          },
          async create({ data }) {
            mainRow = {
              id: 1,
              documentId: 'sec-1',
              updatedAt: '2026-11-01T11:00:00.000Z',
              ...data,
            };
            return mainRow;
          },
        };
      }
      if (uid === 'api::promocion-bancaria.promocion-bancaria') {
        return {
          async findMany() {
            return promociones.map(p => ({ ...p }));
          },
        };
      }
      throw new Error(`Document UID inesperado: ${uid}`);
    },
    db: {
      query(uid) {
        if (uid === 'plugin::upload.file') {
          return {
            async findOne({ where }) {
              return mediaFiles.get(Number(where.id)) || null;
            },
            async findMany({ where }) {
              const ids = where?.id?.$in || [];
              return ids.map(id => mediaFiles.get(Number(id))).filter(Boolean);
            },
          };
        }
        if (uid === 'api::promocion-bancaria.promocion-bancaria') {
          return {
            async findMany({ where }) {
              return promociones
                .filter(p => p.documentId === where.documentId)
                .map(p => ({ id: p.id }));
            },
            async update({ where, data }) {
              promoUpdates.push({ id: where.id, data });
              const target = promociones.find(p => p.id === where.id);
              if (target) {
                if (data.nombre !== undefined) target.nombre = data.nombre;
                if (data.cuotas_descripcion !== undefined) target.cuotas_descripcion = data.cuotas_descripcion;
                if (data.cuotas_cantidad !== undefined) target.cuotas_cantidad = data.cuotas_cantidad;
                if (data.monto_minimo !== undefined) target.monto_minimo = data.monto_minimo || '';
                if (data.logo !== undefined) target.logo = mediaFiles.get(data.logo) || null;
              }
              return target;
            },
          };
        }
        throw new Error(`Query inesperado: ${uid}`);
      },
    },
  };

  const service = createService({ strapi });
  strapi.service = () => service;

  return { strapi, service, promociones, promoUpdates, getMain: () => mainRow };
}

test('routes define GET, PUT y DELETE para beneficios-admin', () => {
  assert.equal(routes.routes.length, 3);
  assert.deepEqual(
    routes.routes.map(r => `${r.method} ${r.path}`),
    [
      'GET /beneficios-admin',
      'PUT /beneficios-admin/:area',
      'DELETE /beneficios-admin/:area/borrador',
    ]
  );
});

test('overview devuelve beneficios activos, orden y textos por defecto', async () => {
  const { service } = createHarness();
  const state = await service.overview();

  assert.equal(state.version, '2026-11-01T10:00:00.000Z');
  const area = state.areas.general;
  assert.equal(area.promociones.length, 2);
  assert.equal(area.published.titulo, 'Beneficios para vos');
  assert.equal(area.published.info_titulo, '¿Necesitás más información?');
  assert.equal(area.published.boton_texto, 'Ver todas las promociones');
  assert.deepEqual(area.published.orden, ['promo-naranja', 'promo-macro']);
  assert.equal(area.published.tarjetas['promo-naranja'].nombre, 'Tarjeta Naranja X');
  assert.equal(area.published.tarjetas['promo-naranja'].tamano_logo, 'mediano');
  assert.equal(area.published.tarjetas['promo-naranja'].ajuste_logo, 'contener');
  assert.equal(area.published.tarjetas['promo-naranja'].posicion_logo, 'centro');
  assert.equal(area.draft, null);
});

test('save en modo borrador guarda orden, textos y ajustes de logo sin alterar registros publicados', async () => {
  const { service, promoUpdates } = createHarness();
  const initial = await service.overview();

  const updated = await service.save('general', {
    version: initial.version,
    publish: false,
    data: {
      titulo: 'Beneficios exclusivos',
      info_titulo: '¿Querés conocer más?',
      info_descripcion: 'Consultá todos los medios de pago.',
      boton_texto: 'Ver medios',
      boton_enlace: '/tienda',
      orden: ['promo-macro', 'promo-naranja'],
      tarjetas: {
        'promo-naranja': {
          nombre: 'Naranja X Plan Z',
          cuotas_descripcion: 'sin interés especial',
          cuotas_cantidad: [3, 6, 12],
          monto_minimo: '$45.000',
          logo: { id: 103 },
          tamano_logo: 'grande',
          ajuste_logo: 'cubrir',
          posicion_logo: 'izquierda',
        },
      },
    },
  });

  assert.equal(promoUpdates.length, 0);
  const area = updated.areas.general;
  assert.ok(area.draft);
  assert.equal(area.draft.titulo, 'Beneficios exclusivos');
  assert.equal(area.published.titulo, 'Beneficios para vos');
  assert.deepEqual(area.draft.orden, ['promo-macro', 'promo-naranja']);
  assert.deepEqual(area.published.orden, ['promo-naranja', 'promo-macro']);

  const naranjaDraft = area.draft.tarjetas['promo-naranja'];
  assert.equal(naranjaDraft.nombre, 'Naranja X Plan Z');
  assert.deepEqual(naranjaDraft.cuotas_cantidad, [3, 6, 12]);
  assert.equal(naranjaDraft.monto_minimo, '$45.000');
  assert.equal(naranjaDraft.logo.id, 103);
  assert.equal(naranjaDraft.tamano_logo, 'grande');
  assert.equal(naranjaDraft.ajuste_logo, 'cubrir');
  assert.equal(naranjaDraft.posicion_logo, 'izquierda');
  assert.equal(area.published.tarjetas['promo-naranja'].nombre, 'Tarjeta Naranja X');
});

test('save con publish=true actualiza promocion-bancaria en Strapi y limpia el borrador', async () => {
  const { service, promoUpdates, getMain } = createHarness();
  const initial = await service.overview();

  const published = await service.save('general', {
    version: initial.version,
    publish: true,
    data: {
      titulo: 'Beneficios Marybe',
      info_titulo: '¿Necesitás ayuda?',
      info_descripcion: 'Revisá las bases y condiciones.',
      boton_texto: 'Ver bases',
      boton_enlace: 'https://marybe.com/promos',
      orden: ['promo-macro', 'promo-naranja'],
      tarjetas: {
        'promo-naranja': {
          nombre: 'Tarjeta Naranja X Oficial',
          cuotas_descripcion: 'sin interés con Plan Z',
          cuotas_cantidad: [3, 6],
          monto_minimo: '$32.000',
          logo: { id: 103 },
          tamano_logo: 'pequeno',
          ajuste_logo: 'contener',
          posicion_logo: 'derecha',
        },
        'promo-macro': {
          nombre: 'Banco Macro',
          cuotas_descripcion: 'sin interés todos los días',
          cuotas_cantidad: [3],
          monto_minimo: '$35.000',
          logo: { id: 102 },
          tamano_logo: 'mediano',
          ajuste_logo: 'contener',
          posicion_logo: 'centro',
        },
      },
    },
  });

  assert.equal(promoUpdates.length, 1);
  assert.equal(promoUpdates[0].id, 1);
  assert.equal(promoUpdates[0].data.nombre, 'Tarjeta Naranja X Oficial');
  assert.equal(promoUpdates[0].data.logo, 103);

  const area = published.areas.general;
  assert.equal(area.draft, null);
  assert.equal(area.published.titulo, 'Beneficios Marybe');
  assert.deepEqual(area.published.orden, ['promo-macro', 'promo-naranja']);
  assert.equal(area.published.tarjetas['promo-naranja'].nombre, 'Tarjeta Naranja X Oficial');
  assert.equal(area.published.tarjetas['promo-naranja'].tamano_logo, 'pequeno');

  const main = getMain();
  assert.equal(main.diseno_secciones.beneficios.general.titulo, 'Beneficios Marybe');
  assert.equal(
    main.diseno_secciones.beneficios.general.tarjetas['promo-naranja'].tamano_logo,
    'pequeno'
  );
  assert.equal(main.borradores_editor_inicio.beneficios?.general, undefined);
});

test('discard elimina el borrador y restaura los valores publicados', async () => {
  const { service } = createHarness();
  const initial = await service.overview();

  const saved = await service.save('general', {
    version: initial.version,
    publish: false,
    data: {
      titulo: 'Borrador temporal',
      orden: ['promo-macro', 'promo-naranja'],
    },
  });
  assert.ok(saved.areas.general.draft);

  const discarded = await service.discard('general', { version: saved.version });
  assert.equal(discarded.areas.general.draft, null);
  assert.equal(discarded.areas.general.published.titulo, 'Beneficios para vos');
});

test('rechaza enlaces inseguros, cuotas inválidas y conflicto de versión', async () => {
  const { service } = createHarness();
  const initial = await service.overview();

  await assert.rejects(
    () =>
      service.save('general', {
        version: 'version-vieja',
        publish: false,
        data: { titulo: 'Test' },
      }),
    err => err.status === 409
  );

  await assert.rejects(
    () =>
      service.save('general', {
        version: initial.version,
        publish: false,
        data: { boton_enlace: 'javascript:alert(1)' },
      }),
    err => err.status === 400
  );

  await assert.rejects(
    () =>
      service.save('general', {
        version: initial.version,
        publish: false,
        data: {
          tarjetas: {
            'promo-naranja': {
              cuotas_cantidad: ['abc'],
            },
          },
        },
      }),
    err => err.status === 400
  );
});

test('controlador exige sesión de administrador', async () => {
  const { strapi } = createHarness();
  global.strapi = strapi;
  let unauthorizedMsg = null;
  const ctx = {
    request: { header: {} },
    unauthorized(msg) {
      unauthorizedMsg = msg;
      return { unauthorized: msg };
    },
  };
  await controller.overview(ctx);
  assert.equal(unauthorizedMsg, 'Iniciá sesión como administrador.');
});
