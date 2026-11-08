const { test } = require('node:test');
const assert = require('node:assert/strict');
const createService = require('../src/api/categorias-inicio-admin/services/categorias-inicio-admin');
const { normalizeOrder } = createService;

const IMAGES = { 10: { id: 10, mime: 'image/webp', url: '/uploads/a.webp', name: 'a.webp' }, 11: { id: 11, mime: 'image/webp', url: '/uploads/b.webp', name: 'b.webp' }, 12: { id: 12, mime: 'image/svg+xml', url: '/x.svg' } };

function fixture(design) {
  let main = { documentId: 'main-1', updatedAt: 'v1', diseno_categorias: design, texto_toggle_perfumeria: 'Belleza' };
  const categories = [
    { id: 1, documentId: 'c1', nombre: 'Fragancias', seccion: 'Perfumería', portada: IMAGES[10] },
    { id: 2, documentId: 'c2', nombre: 'Maquillaje', seccion: 'Perfumería', portada: null },
    { id: 3, documentId: 'c3', nombre: 'Dermo', seccion: 'Perfumería', portada: null },
    { id: 4, documentId: 'h1', nombre: 'Limpieza', seccion: 'Hogar', portada: null },
  ];
  const rows = [{ id: 21, documentId: 'c2' }, { id: 22, documentId: 'c2' }];
  const events = [];
  const strapi = {
    documents: uid => (uid.includes('categoria') ? {
      findMany: async ({ filters }) => categories.filter(category => category.seccion === filters.seccion).map(category => ({ ...category })),
    } : {
      findFirst: async () => structuredClone(main),
      update: async ({ data }) => { events.push(['main', data]); main = { ...main, ...data, updatedAt: 'v2' }; return main; },
      create: async ({ data }) => { events.push(['create', data]); main = { documentId: 'new', ...data, updatedAt: 'v2' }; return main; },
    }),
    db: {
      transaction: async run => { events.push(['transaction']); return run(); },
      query: uid => (uid.includes('upload') ? {
        findOne: async ({ where }) => IMAGES[where.id] || null,
        findMany: async ({ where }) => where.id.$in.map(id => IMAGES[id]).filter(Boolean),
      } : {
        findMany: async ({ where }) => rows.filter(row => row.documentId === where.documentId),
        update: async ({ where, data }) => events.push(['cover', where.id, data]),
      }),
    },
  };
  return { service: createService({ strapi }), events, main: () => main };
}

const body = (overrides = {}) => ({ version: 'v1', data: { orden: ['c3', 'c1', 'c2'], forma: 'circular', boton: 'cuadrado', estiloBoton: 'claro', portadas: { c1: { id: 10 }, c2: { id: 11 }, c3: null } }, ...overrides });

test('el orden guardado ignora categorías eliminadas y agrega las nuevas al final', () => {
  const categories = [{ documentId: 'a' }, { documentId: 'b' }, { documentId: 'c' }];
  assert.deepEqual(normalizeOrder(categories, ['c', 'x', 'a', 'c']), ['c', 'a', 'b']);
  assert.deepEqual(normalizeOrder(categories, undefined), ['a', 'b', 'c']);
});

test('el resumen usa el diseño original y el orden del catálogo si no hay configuración', async () => {
  const { service } = fixture();
  const { areas } = await service.overview();
  assert.deepEqual(areas.perfumeria.published, { orden: ['c1', 'c2', 'c3'], forma: 'redondeado', boton: 'pildora', estiloBoton: 'relleno', portadas: { c1: { id: 10, url: '/uploads/a.webp', name: 'a.webp', width: undefined, height: undefined }, c2: null, c3: null } });
  assert.deepEqual(areas.hogar.categorias.map(category => category.documentId), ['h1']);
});

test('guardar borrador no modifica categorías ni el diseño publicado', async () => {
  const { service, events } = fixture({ perfumeria: { orden: ['c2', 'c1', 'c3'], forma: 'cuadrado' } });
  const result = await service.save('perfumeria', body());
  assert.deepEqual(events.map(event => event[0]), ['main']);
  assert.deepEqual(Object.keys(events[0][1]), ['borradores_editor_inicio']);
  assert.deepEqual(result.areas.perfumeria.draft.orden, ['c3', 'c1', 'c2']);
  assert.equal(result.areas.perfumeria.draft.portadas.c2.url, '/uploads/b.webp');
  assert.equal(result.areas.perfumeria.published.forma, 'cuadrado');
});

test('publicar guarda el diseño del área y actualiza solo las portadas cambiadas en ambas versiones', async () => {
  const { service, events, main } = fixture({ hogar: { forma: 'rectangular' } });
  await service.save('perfumeria', body({ publish: true }));
  assert.deepEqual(main().diseno_categorias, { hogar: { forma: 'rectangular' }, perfumeria: { orden: ['c3', 'c1', 'c2'], forma: 'circular', boton: 'cuadrado', estiloBoton: 'claro' } });
  assert.deepEqual(events.filter(event => event[0] === 'cover'), [['cover', 21, { portada: 11 }], ['cover', 22, { portada: 11 }]]);
  assert.ok(events.some(event => event[0] === 'transaction'));
  assert.equal(main().texto_toggle_perfumeria, 'Belleza');
});

test('rechaza conflictos, categorías ajenas, opciones e imágenes inválidas', async () => {
  const { service } = fixture();
  await assert.rejects(service.save('perfumeria', body({ version: 'viejo' })), error => error.status === 409);
  await assert.rejects(service.save('otra', body()), error => error.status === 404);
  await assert.rejects(service.save('perfumeria', body({ data: { ...body().data, orden: ['h1', 'c1'] } })), error => error.status === 409);
  await assert.rejects(service.save('perfumeria', body({ data: { ...body().data, orden: ['c1', 'c1'] } })), /repetidas/);
  await assert.rejects(service.save('perfumeria', body({ data: { ...body().data, forma: 'estrella' } })), /diseño/);
  await assert.rejects(service.save('perfumeria', body({ data: { ...body().data, portadas: { c1: { id: 12 } } } })), /imagen/);
});

test('descartar elimina solo el borrador del área', async () => {
  const { service } = fixture();
  let result = await service.save('perfumeria', body());
  result = await service.save('hogar', { version: result.version, data: { orden: ['h1'], forma: 'cuadrado' } });
  result = await service.discard('perfumeria', { version: result.version });
  assert.equal(result.areas.perfumeria.draft, null);
  assert.equal(result.areas.hogar.draft.forma, 'cuadrado');
});
