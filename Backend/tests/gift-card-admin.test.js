'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const createService = require('../src/api/gift-card-admin/services/gift-card-admin');
const controller = require('../src/api/gift-card-admin/controllers/gift-card-admin');
const routes = require('../src/api/gift-card-admin/routes/gift-card-admin');

function createHarness() {
  const mediaFiles = new Map([
    [
      201,
      {
        id: 201,
        name: 'gift-custom.webp',
        url: '/uploads/gift-custom.webp',
        width: 800,
        height: 500,
        mime: 'image/webp',
      },
    ],
    [
      202,
      {
        id: 202,
        name: 'vector.svg',
        url: '/uploads/vector.svg',
        width: 100,
        height: 100,
        mime: 'image/svg+xml',
      },
    ],
  ]);

  let mainRow = {
    id: 1,
    documentId: 'sec-1',
    updatedAt: '2026-11-01T10:00:00.000Z',
    diseno_secciones: {},
    borradores_editor_inicio: {},
    banners_visuales: {
      published: {
        gift_perfumeria: { activo: true, url: '/uploads/old.png' },
      },
    },
  };

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
              updatedAt: '2026-11-01T12:00:00.000Z',
            };
            return mainRow;
          },
          async create({ data }) {
            mainRow = {
              id: 1,
              documentId: 'sec-1',
              updatedAt: '2026-11-01T12:00:00.000Z',
              ...data,
            };
            return mainRow;
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
        throw new Error(`Query inesperado: ${uid}`);
      },
    },
  };

  const service = createService({ strapi });
  strapi.service = () => service;

  return { strapi, service, getMain: () => mainRow };
}

test('routes define GET, PUT y DELETE para gift-card-admin', () => {
  assert.equal(routes.routes.length, 3);
  assert.deepEqual(
    routes.routes.map(r => `${r.method} ${r.path}`),
    [
      'GET /gift-card-admin',
      'PUT /gift-card-admin/:area',
      'DELETE /gift-card-admin/:area/borrador',
    ]
  );
});

test('overview devuelve configuración predeterminada para perfumeria y hogar', async () => {
  const { service } = createHarness();
  const state = await service.overview();

  assert.equal(state.version, '2026-11-01T10:00:00.000Z');
  assert.equal(state.areas.perfumeria.published.titulo_destacado, 'Regalá');
  assert.equal(state.areas.perfumeria.published.titulo_complementario, 'Marybe');
  assert.equal(state.areas.perfumeria.published.color_fondo, '#6A0304');
  assert.equal(state.areas.hogar.published.color_fondo, '#B10002');
  assert.equal(state.areas.perfumeria.published.boton_texto, 'Conocer más');
  assert.equal(state.areas.perfumeria.published.boton_enlace, '/gift-card');
  assert.equal(state.areas.perfumeria.draft, null);
});

test('save en modo borrador guarda textos, imagen, ajustes y color sin alterar published', async () => {
  const { service } = createHarness();
  const initial = await service.overview();

  const updated = await service.save('perfumeria', {
    version: initial.version,
    publish: false,
    data: {
      titulo_destacado: 'Sorprendé con',
      titulo_complementario: 'Marybe Gift',
      bloque1_titulo: 'Fragancias',
      bloque1_descripcion: 'Elegí su perfume favorito',
      bloque1_icono: 'regalo',
      bloque2_titulo: 'Saldo libre',
      bloque2_descripcion: 'Definí el importe que quieras',
      bloque2_icono: 'estrella',
      imagen: { id: 201 },
      imagen_tamano: 'grande',
      imagen_posicion_x: 'derecha',
      imagen_posicion_y: 'arriba',
      imagen_ajuste: 'contener',
      color_fondo: '#f7f3ec',
      modo_texto: 'auto',
      boton_texto: 'Regalar ahora',
      boton_enlace: '/gift-card',
    },
  });

  const area = updated.areas.perfumeria;
  assert.ok(area.draft);
  assert.equal(area.draft.titulo_destacado, 'Sorprendé con');
  assert.equal(area.draft.titulo_complementario, 'Marybe Gift');
  assert.equal(area.draft.bloque1_icono, 'regalo');
  assert.equal(area.draft.bloque2_icono, 'estrella');
  assert.equal(area.draft.imagen.id, 201);
  assert.equal(area.draft.imagen_tamano, 'grande');
  assert.equal(area.draft.imagen_posicion_x, 'derecha');
  assert.equal(area.draft.imagen_posicion_y, 'arriba');
  assert.equal(area.draft.color_fondo, '#F7F3EC');
  assert.equal(area.published.titulo_destacado, 'Regalá');
});

test('save con publish=true publica en diseno_secciones, limpia borrador y remueve slot heredado', async () => {
  const { service, getMain } = createHarness();
  const initial = await service.overview();

  const published = await service.save('perfumeria', {
    version: initial.version,
    publish: true,
    data: {
      titulo_destacado: 'Regalá',
      titulo_complementario: 'Experiencias',
      bloque1_titulo: 'Producto',
      bloque1_descripcion: 'Elegí el producto perfecto para regalar',
      bloque1_icono: 'original',
      bloque2_titulo: 'Monto personalizado',
      bloque2_descripcion: 'Vos elegís cuánto regalar',
      bloque2_icono: 'ninguno',
      imagen: { id: 201 },
      imagen_tamano: 'pequeno',
      imagen_posicion_x: 'izquierda',
      imagen_posicion_y: 'abajo',
      imagen_ajuste: 'cubrir',
      color_fondo: '#3E0102',
      modo_texto: 'claro',
      boton_texto: 'Comprar Gift Card',
      boton_enlace: 'https://marybe.com/gift-card',
    },
  });

  const area = published.areas.perfumeria;
  assert.equal(area.draft, null);
  assert.equal(area.published.titulo_complementario, 'Experiencias');
  assert.equal(area.published.bloque2_icono, 'ninguno');
  assert.equal(area.published.imagen.url, '/uploads/gift-custom.webp');
  assert.equal(area.published.color_fondo, '#3E0102');
  assert.equal(area.published.boton_texto, 'Comprar Gift Card');
  assert.equal(area.published.boton_enlace, 'https://marybe.com/gift-card');

  const main = getMain();
  assert.equal(main.banners_visuales.published.gift_perfumeria, undefined);
});

test('discard elimina el borrador del área indicada', async () => {
  const { service } = createHarness();
  const initial = await service.overview();

  const saved = await service.save('hogar', {
    version: initial.version,
    publish: false,
    data: {
      titulo_destacado: 'Borrador',
      titulo_complementario: 'Hogar',
      color_fondo: '#560203',
    },
  });
  assert.ok(saved.areas.hogar.draft);

  const discarded = await service.discard('hogar', { version: saved.version });
  assert.equal(discarded.areas.hogar.draft, null);
  assert.equal(discarded.areas.hogar.published.color_fondo, '#B10002');
});

test('rechaza colores HEX inválidos, enlaces inseguros, archivos SVG y conflicto 409', async () => {
  const { service } = createHarness();
  const initial = await service.overview();

  await assert.rejects(
    () =>
      service.save('perfumeria', {
        version: 'version-vieja',
        publish: false,
        data: {},
      }),
    err => err.status === 409
  );

  await assert.rejects(
    () =>
      service.save('perfumeria', {
        version: initial.version,
        publish: false,
        data: { color_fondo: 'rojo' },
      }),
    err => err.status === 400
  );

  await assert.rejects(
    () =>
      service.save('perfumeria', {
        version: initial.version,
        publish: false,
        data: { boton_enlace: 'javascript:alert(1)' },
      }),
    err => err.status === 400
  );

  await assert.rejects(
    () =>
      service.save('perfumeria', {
        version: initial.version,
        publish: false,
        data: { imagen: { id: 202 } },
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
