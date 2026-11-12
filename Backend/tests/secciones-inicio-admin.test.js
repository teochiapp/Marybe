const { test } = require('node:test');
const assert = require('node:assert/strict');
const createService = require('../src/api/secciones-inicio-admin/services/secciones-inicio-admin');

const ORIGINAL = { titulo: 'Disfrutá de las mejores ofertas', fuente: 'secundaria', tamano: 'grande', peso: 'semibold', alineacion: 'izquierda', color: 'original', fondo: 'blanco', espaciado: 'original' };

function fixture(initial = {}) {
  let main = { documentId: 'main-1', updatedAt: 'v1', diseno_categorias: { perfumeria: { forma: 'circular' } }, borradores_editor_inicio: { categorias: { hogar: { data: {} } } }, ...initial };
  const events = [];
  const strapi = {
    db: { metadata: { get: () => ({tableName: 'main'}) }, transaction: async action => action({trx: () => ({select: () => ({forUpdate: async () => {}})})}) },
    documents: () => ({
      findFirst: async () => structuredClone(main),
      update: async ({ data }) => { events.push(data); main = { ...main, ...data, updatedAt: 'v2' }; return main; },
      create: async ({ data }) => { events.push(data); main = { documentId: 'new', ...data, updatedAt: 'v2' }; return main; },
    }),
  };
  return { service: createService({ strapi }), events, main: () => main };
}

const data = { titulo: '  Ofertas de la semana ', fuente: 'principal', tamano: 'muy-grande', peso: 'bold', alineacion: 'centro', color: 'marron-principal', fondo: 'arena', espaciado: 'compacto' };

test('guardar la composición actualiza Inicio directamente y solo el área seleccionada', async () => {
  const { service, main } = fixture();
  const initial = await service.overview('composicion');
  const original = initial.areas.perfumeria.published;
  const edited = { orden: [...original.orden].reverse(), ocultos: ['banners'] };
  let state = await service.save('composicion', 'perfumeria', { version: 'v1', data: edited });
  assert.deepEqual(state.areas.perfumeria.published, edited);
  assert.equal(state.areas.perfumeria.draft, null);
  assert.deepEqual(state.areas.hogar.published, initial.areas.hogar.published);
  assert.ok(main().borradores_editor_inicio.categorias.hogar);
  assert.equal(main().borradores_editor_inicio.composicion, undefined);
  await assert.rejects(service.save('composicion', 'hogar', { version: 'v2', data: { orden: ['banners', 'banners'], ocultos: [] } }), /inválida/);
  await assert.rejects(service.save('composicion', 'hogar', { version: 'viejo', data: initial.areas.hogar.published }), error => error.status === 409);
});

test('sin configuración devuelve el título y la tipografía originales en las dos áreas', async () => {
  const { service } = fixture();
  const result = await service.overview('ofertas');
  assert.equal(result.defaultTitle, ORIGINAL.titulo);
  assert.deepEqual(result.areas.perfumeria, { published: ORIGINAL, draft: null, draftSavedAt: null });
  assert.deepEqual(result.areas.hogar.published, ORIGINAL);
});

test('el borrador no cambia lo publicado y conserva los borradores de otras secciones', async () => {
  const { service, events, main } = fixture();
  const result = await service.save('ofertas', 'perfumeria', { version: 'v1', data });
  assert.deepEqual(Object.keys(events[0]), ['borradores_editor_inicio']);
  assert.deepEqual(result.areas.perfumeria.published, ORIGINAL);
  assert.deepEqual(result.areas.perfumeria.draft, { ...data, titulo: 'Ofertas de la semana' });
  assert.ok(main().borradores_editor_inicio.categorias.hogar);
});

test('publicar guarda solo el área elegida y borra su borrador sin tocar otras configuraciones', async () => {
  const { service, main } = fixture({ diseno_secciones: { ofertas: { hogar: { titulo: 'Hogar' } } } });
  await service.save('ofertas', 'perfumeria', { version: 'v1', data });
  await service.save('ofertas', 'perfumeria', { version: 'v2', data, publish: true });
  assert.deepEqual(main().diseno_secciones.ofertas.perfumeria, { ...data, titulo: 'Ofertas de la semana' });
  assert.deepEqual(main().diseno_secciones.ofertas.hogar, { titulo: 'Hogar' });
  assert.deepEqual(main().diseno_categorias, { perfumeria: { forma: 'circular' } });
  assert.equal(main().borradores_editor_inicio.ofertas.perfumeria, undefined);
});

test('valores guardados inválidos vuelven al diseño original', () => {
  const { normalize, SECTIONS } = createService;
  assert.deepEqual(normalize({ titulo: ' ', fuente: 'comic', tamano: 'enorme', color: '#FF0000', fondo: 'url(x)' }, SECTIONS.ofertas), ORIGINAL);
});

test('rechaza conflictos, secciones, áreas, opciones, colores y títulos inválidos', async () => {
  const { service } = fixture();
  await assert.rejects(service.save('ofertas', 'perfumeria', { version: 'viejo', data }), error => error.status === 409);
  await assert.rejects(service.save('descuentos', 'perfumeria', { version: 'v1', data }), error => error.status === 404);
  await assert.rejects(service.save('ofertas', 'otra', { version: 'v1', data }), error => error.status === 404);
  await assert.rejects(service.save('ofertas', 'perfumeria', { version: 'v1', data: { ...data, peso: 'black' } }), /diseño/);
  await assert.rejects(service.save('ofertas', 'perfumeria', { version: 'v1', data: { ...data, color: '#FF0000' } }), /diseño/);
  await assert.rejects(service.save('ofertas', 'perfumeria', { version: 'v1', data: { ...data, fondo: 'red' } }), /diseño/);
  await assert.rejects(service.save('ofertas', 'perfumeria', { version: 'v1', data: { ...data, titulo: 'x'.repeat(81) } }), /80/);
  await assert.rejects(service.save('ofertas', 'perfumeria', { version: 'v1', data: { ...data, titulo: ' ' }, publish: true }), /título/);
  await assert.rejects(service.overview('__proto__'), error => error.status === 404);
});

test('descartar elimina solo el borrador del área', async () => {
  const { service, main } = fixture();
  await service.save('ofertas', 'perfumeria', { version: 'v1', data });
  const result = await service.discard('ofertas', 'perfumeria', { version: 'v2' });
  assert.equal(result.areas.perfumeria.draft, null);
  assert.ok(main().borradores_editor_inicio.categorias.hogar);
});
