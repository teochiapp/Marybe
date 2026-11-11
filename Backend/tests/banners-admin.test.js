const { test } = require('node:test');
const assert = require('node:assert/strict');
const createService = require('../src/api/banners-admin/services/banners-admin');
const { design, safeUrl } = createService;
const jwt = require('jsonwebtoken');

function fixture() {
  let promotion = { documentId: 'promo-1', updatedAt: 'v1', titulo: 'Inicio', seccion: 'Perfumería', Filas: [{ id: 1, __component: 'layout.fila-1-columna', banners: [{ id: 2, imagen_desktop: { id: 3 } }] }] };
  let main = { documentId: 'main-1', updatedAt: 'm1', texto_toggle_perfumeria: 'Perfumería', banners_visuales: { published: { whatsapp: { titulo: 'Anterior' } } } };
  const events = [];
  const api = {
    documents: uid => {
      const isMain = uid.includes('seccion-principal');
      return {
        findOne: async () => structuredClone(promotion),
        findFirst: async () => structuredClone(main),
        findMany: async () => [structuredClone(promotion)],
        create: async ({ data }) => { promotion = { ...data, documentId: 'new-1', updatedAt: 'v2' }; return promotion; },
        update: async ({ data }) => { events.push(['update', uid, data]); if (isMain) { main = { ...main, ...data, updatedAt: 'm2' }; return main; } promotion = { ...promotion, ...data, updatedAt: 'v2' }; return promotion; },
        publish: async ({ documentId }) => events.push(['publish', documentId]),
        delete: async ({ documentId }) => { events.push(['delete', documentId]); promotion = null; },
      };
    },
    db: { query: () => ({ findOne: async ({ where }) => where.id === 3 ? { id: 3, mime: 'image/webp' } : null }) },
  };
  return { service: createService({ strapi: api }), events, main: () => main };
}
function promoBody() { return { version: 'v1', data: { titulo: 'Campaña', seccion: 'Perfumería', Filas: [{ id: 1, __component: 'layout.fila-1-columna', es_carrusel: true, diseno: { desktop: { columns: 2 }, mobile: { columns: 1 } }, banners: [{ id: 2, titulo: 'Nuevo', imagen_desktop: { id: 3, url: '/uploads/test.webp' }, imagen_mobile: null, diseno: { desktop: { height: 500 }, mobile: { height: 300 } } }] }] } }; }

test('guarda filas, medios y diseño responsive sin publicar hasta solicitarlo', async () => {
  const { service, events } = fixture();
  const result = await service.savePromotion('promo-1', promoBody());
  assert.equal(result.Filas[0].banners[0].imagen_desktop, 3);
  assert.equal(result.Filas[0].banners[0].id, 2);
  assert.equal(result.Filas[0].diseno.mobile.columns, 1);
  assert.equal(events.filter(e => e[0] === 'publish').length, 0);
});
test('valida y conserva las opciones del carrusel en el borrador', async () => {
  const { service, events } = fixture();
  const body = promoBody();
  body.data.Filas[0].config_carrusel = { autoplay: false, intervalo: 5, indicador: 'puntos', vistaParcial: true };
  const result = await service.savePromotion('promo-1', body);
  assert.deepEqual(result.Filas[0].config_carrusel, body.data.Filas[0].config_carrusel);
  assert.equal(events.filter(event => event[0] === 'publish').length, 0);
  const invalid = promoBody();
  invalid.version = 'v2';
  invalid.data.Filas[0].config_carrusel = { autoplay: true, intervalo: 0, indicador: 'otro', vistaParcial: true };
  await assert.rejects(service.savePromotion('promo-1', invalid), /carrusel/);
});
test('la lista del editor solo consulta los grupos principales', async () => {
  const service = createService({ strapi: { documents: uid => {
    assert.equal(uid, 'api::promociones-inicio.promociones-inicio');
    return { findMany: async () => [{ documentId: 'primary' }] };
  } } });
  assert.deepEqual(await service.list(), { promotions: [{ documentId: 'primary' }] });
});
test('la lista del editor obtiene todas las páginas de secciones', async () => {
  const calls = [];
  const service = createService({ strapi: { documents: () => ({ findMany: async options => {
    calls.push(options.start);
    return options.start === 0 ? Array.from({ length: 100 }, (_, i) => ({ documentId: String(i) })) : [{ documentId: '100' }];
  } }) } });
  const result = await service.list();
  assert.equal(result.promotions.length, 101);
  assert.deepEqual(calls, [0, 100]);
});
test('publicación usa update de borrador y publish explícito de Strapi', async () => {
  const { service, events } = fixture();
  await service.savePromotion('promo-1', { ...promoBody(), publish: true });
  assert.deepEqual(events.map(e => e[0]), ['update', 'publish']);
});
test('deleting a section requires the current version and removes the document', async () => {
  const { service, events } = fixture();
  await assert.rejects(service.deletePromotion('promo-1', { version: 'old' }), error => error.status === 409);
  assert.deepEqual(await service.deletePromotion('promo-1', { version: 'v1' }), { documentId: 'promo-1' });
  assert.deepEqual(events.filter(event => event[0] === 'delete'), [['delete', 'promo-1']]);
});
test('conflictos, filas desconocidas, imágenes inexistentes y enlaces ejecutables son rechazados', async () => {
  const { service } = fixture();
  await assert.rejects(service.savePromotion('promo-1', { ...promoBody(), version: 'old' }), error => error.status === 409);
  const badRow = promoBody(); badRow.data.Filas[0].__component = 'layout.hack';
  await assert.rejects(service.savePromotion('promo-1', badRow), /Tipo de fila/);
  const badImage = promoBody(); badImage.data.Filas[0].banners[0].imagen_desktop = 999;
  await assert.rejects(service.savePromotion('promo-1', badImage), /imagen/);
  assert.throws(() => safeUrl('javascript:alert(1)'), /URL/);
  assert.throws(() => safeUrl('//evil.test'), /URL/);
  assert.throws(() => design({ mobile: { height: 99999 } }), /height/);
  assert.throws(() => design({ desktop: { background: 'red; display:none' } }), /Color/);
  assert.deepEqual(design({ desktop: { height: 0, hidden: true, unsupported: 'value' } }), { desktop: { height: 0, hidden: true } });
});
test('las piezas guardadas como borrador no aparecen en la API pública y preservan el resto de Inicio', async () => {
  const { service, main } = fixture();
  const draft = { whatsapp: { titulo: 'Nuevo WhatsApp', mostrar_texto: true, imagen_desktop: { url: '/inicio/giftcard.webp' } } };
  await service.saveSlots({ version: 'm1', data: draft });
  assert.equal((await service.publicSlots()).whatsapp.titulo, 'Anterior');
  assert.equal(main().texto_toggle_perfumeria, 'Perfumería');
  await service.saveSlots({ version: 'm2', data: draft, publish: true });
  assert.equal((await service.publicSlots()).whatsapp.titulo, 'Nuevo WhatsApp');
  assert.equal((await service.publicSlots()).whatsapp.imagen_desktop.url, '/inicio/giftcard.webp');
});
test('publicar un mapa vacío restaura los diseños originales', async () => {
  const { service } = fixture();
  await service.saveSlots({ version: 'm1', data: {}, publish: true });
  assert.deepEqual(await service.publicSlots(), {});
});
test('publicar una pieza no publica otros borradores pendientes', async () => {
  const { service } = fixture();
  await service.saveSlots({ version: 'm1', data: { whatsapp: { titulo: 'WhatsApp pendiente' }, gift_hogar: { titulo: 'Gift nueva' } }, publish: true, slot: 'gift_hogar' });
  const published = await service.publicSlots();
  assert.equal(published.whatsapp.titulo, 'Anterior');
  assert.equal(published.gift_hogar.titulo, 'Gift nueva');
});
test('el panel rechaza visitantes y tokens de clientes; acepta el token administrativo', async () => {
  const previous = global.strapi;
  const controller = require('../src/api/banners-admin/controllers/banners-admin');
  let called = false;
  global.strapi = { config: { get: () => 'test-secret' }, service: () => ({ list: async () => { called = true; return { promotions: [] }; } }) };
  const ctx = { request: { header: {} }, unauthorized: () => 'denied', send: data => data };
  try {
    assert.equal(await controller.list(ctx), 'denied');
    ctx.request.header.authorization = `Bearer ${jwt.sign({ id: 1 }, 'test-secret')}`;
    assert.equal(await controller.list(ctx), 'denied');
    assert.equal(called, false);
    ctx.request.header.authorization = `Bearer ${jwt.sign({ isAdminImport: true }, 'test-secret')}`;
    assert.deepEqual(await controller.list(ctx), { data: { promotions: [] } });
  } finally { global.strapi = previous; }
});
