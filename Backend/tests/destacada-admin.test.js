const { test } = require('node:test');
const assert = require('node:assert/strict');
const createService = require('../src/api/destacada-admin/services/destacada-admin');

const IMAGES = { 10: { id: 10, mime: 'image/webp', url: '/uploads/hero.webp', name: 'hero.webp' }, 11: { id: 11, mime: 'image/webp', url: '/uploads/mobile.webp', name: 'mobile.webp' }, 12: { id: 12, mime: 'image/svg+xml', url: '/x.svg' } };

function fixture() {
  let main = {
    documentId: 'main-1', updatedAt: 'v1', texto_toggle_perfumeria: 'Belleza',
    secciones: [
      { id: 1, seccion: 'Perfumeria', titulo_cursiva: 'Lo nuevo', titulo_normal: 'en Marybe', subtitulo: 'Sub', imagen_desktop: IMAGES[10], imagen_mobile: null },
      { id: 2, seccion: 'Hogar', titulo_cursiva: 'Tu espacio,', titulo_normal: 'tu hogar', imagen_desktop: IMAGES[11], imagen_mobile: IMAGES[10], escala_imagen_desktop: 80 },
    ],
    categorias_destacadas: [{ id: 7, titulo: 'Elixir', imagen: IMAGES[10], texto_boton: 'Conocer más', link_boton: '/tienda' }],
  };
  const products = [
    { documentId: 'p1', seccion: 'Perfumería', publicado: true, destacado: true },
    { documentId: 'p2', seccion: 'Perfumería', publicado: true, destacado: false },
    { documentId: 'h1', seccion: 'Hogar', publicado: true, destacado: true },
  ];
  const events = [];
  const matches = (product, filters = {}) => Object.entries(filters).every(([key, value]) => {
    if (key === '$or') return true;
    if (key === 'documentId') return value.$in.includes(product.documentId);
    return product[key] === value;
  });
  const strapi = {
    documents: uid => (uid.includes('producto') ? {
      findMany: async ({ filters }) => products.filter(product => matches(product, filters)).map(product => ({ ...product })),
    } : {
      findFirst: async () => structuredClone(main),
      update: async ({ data }) => { events.push(['update', data]); main = { ...main, ...data, updatedAt: 'v2' }; return main; },
      create: async ({ data }) => { events.push(['create', data]); main = { documentId: 'main-new', ...data, updatedAt: 'v2' }; return main; },
    }),
    db: {
      transaction: async run => { events.push(['transaction']); return run(); },
      query: uid => (uid.includes('upload') ? {
        findOne: async ({ where }) => IMAGES[where.id] || null,
        findMany: async ({ where }) => where.id.$in.map(id => IMAGES[id]).filter(Boolean),
      } : {
        updateMany: async ({ where, data }) => {
          events.push(['products', where.documentId.$in, data.destacado]);
          products.forEach(product => { if (where.documentId.$in.includes(product.documentId)) product.destacado = data.destacado; });
        },
      }),
    },
  };
  return { service: createService({ strapi }), events, main: () => main, products };
}

const body = (overrides = {}) => ({ version: 'v1', data: { titulo_cursiva: 'Lo más nuevo', titulo_normal: 'en Marybe', subtitulo: 'Nuevo', color_titulo_cursiva: '#f2dc8f', color_titulo_normal: '', imagen_desktop: { id: 10 }, imagen_mobile: { id: 11 }, escala_imagen_desktop: 140, escala_imagen_mobile: 100, banners: [{ titulo: 'Azzaro', imagen: { id: 11 }, escala_imagen_desktop: 60, escala_imagen_mobile: 120, texto_boton: 'Ver', link_boton: '/tienda' }], productos: ['p2'] }, ...overrides });

test('el resumen expone lo publicado por área sin borradores', async () => {
  const { service } = fixture();
  const result = await service.overview();
  assert.equal(result.version, 'v1');
  assert.equal(result.areas.perfumeria.published.titulo_cursiva, 'Lo nuevo');
  assert.equal(result.areas.perfumeria.published.imagen_desktop.url, '/uploads/hero.webp');
  assert.deepEqual(result.areas.perfumeria.published.productos, ['p1']);
  assert.equal(result.areas.perfumeria.published.banners[0].titulo, 'Elixir');
  assert.deepEqual(result.areas.hogar.published.banners, []);
  assert.deepEqual(result.areas.hogar.published.productos, ['h1']);
  assert.equal(result.areas.hogar.published.escala_imagen_desktop, 80);
  assert.equal(result.areas.perfumeria.published.escala_imagen_mobile, null);
  assert.equal(result.areas.perfumeria.draft, null);
});

test('guardar borrador no modifica secciones, banners ni productos publicados', async () => {
  const { service, events, products } = fixture();
  const result = await service.save('perfumeria', body());
  assert.deepEqual(events.map(event => event[0]), ['update']);
  assert.deepEqual(Object.keys(events[0][1]), ['borradores_editor_inicio']);
  assert.equal(result.areas.perfumeria.draft.titulo_cursiva, 'Lo más nuevo');
  assert.equal(result.areas.perfumeria.draft.imagen_mobile.url, '/uploads/mobile.webp');
  assert.equal(result.areas.perfumeria.published.titulo_cursiva, 'Lo nuevo');
  assert.equal(products.find(product => product.documentId === 'p1').destacado, true);
});

test('publicar actualiza solo el área elegida, conserva ids y sincroniza destacados', async () => {
  const { service, events, main, products } = fixture();
  await service.save('perfumeria', body({ publish: true }));
  const update = events.find(event => event[0] === 'update')[1];
  assert.deepEqual(update.secciones[0], { id: 1, seccion: 'Perfumeria', titulo_cursiva: 'Lo más nuevo', titulo_normal: 'en Marybe', color_titulo_cursiva: '#F2DC8F', color_titulo_normal: null, subtitulo: 'Nuevo', imagen_desktop: 10, imagen_mobile: 11, escala_imagen_desktop: 140, escala_imagen_mobile: null });
  assert.deepEqual(update.secciones[1], { id: 2, seccion: 'Hogar', titulo_cursiva: 'Tu espacio,', titulo_normal: 'tu hogar', color_titulo_cursiva: null, color_titulo_normal: null, subtitulo: undefined, imagen_desktop: 11, imagen_mobile: 10, escala_imagen_desktop: 80, escala_imagen_mobile: null });
  assert.deepEqual(update.categorias_destacadas, [{ id: 7, titulo: 'Azzaro', imagen: 11, escala_imagen_desktop: 60, escala_imagen_mobile: 120, texto_boton: 'Ver', link_boton: '/tienda' }]);
  assert.deepEqual(events.filter(event => event[0] === 'products'), [['products', ['p2'], true], ['products', ['p1'], false]]);
  assert.ok(events.some(event => event[0] === 'transaction'));
  assert.equal(products.find(product => product.documentId === 'h1').destacado, true, 'Hogar no cambia');
  assert.equal(main().borradores_editor_inicio.destacada.perfumeria, undefined);
});

test('Hogar no publica banners inferiores', async () => {
  const { service, events } = fixture();
  await service.save('hogar', body({ publish: true, data: { ...body().data, productos: ['h1'] } }));
  const update = events.find(event => event[0] === 'update')[1];
  assert.equal(update.categorias_destacadas, undefined);
  assert.equal(update.secciones[1].titulo_cursiva, 'Lo más nuevo');
  assert.equal(update.secciones[0].titulo_cursiva, 'Lo nuevo');
});

test('rechaza conflictos y datos inválidos', async () => {
  const { service } = fixture();
  await assert.rejects(service.save('perfumeria', body({ version: 'viejo' })), error => error.status === 409);
  await assert.rejects(service.save('marketing', body()), error => error.status === 404);
  await assert.rejects(service.save('perfumeria', body({ data: { ...body().data, imagen_desktop: { id: 12 } } })), /imagen/);
  await assert.rejects(service.save('perfumeria', body({ data: { ...body().data, color_titulo_normal: 'red' } })), /Color/);
  await assert.rejects(service.save('perfumeria', body({ data: { ...body().data, productos: ['h1'] } })), /no están publicados/);
  await assert.rejects(service.save('perfumeria', body({ data: { ...body().data, productos: ['p2', 'p2'] } })), /repetidos/);
  await assert.rejects(service.save('perfumeria', body({ data: { ...body().data, productos: Array.from({ length: 26 }, (_, i) => `p${i}`) } })), /hasta 25/);
  await assert.rejects(service.save('perfumeria', body({ data: { ...body().data, banners: [{ titulo: 'x', link_boton: 'javascript:alert(1)' }] } })), /URL/);
  await assert.rejects(service.save('perfumeria', body({ data: { ...body().data, banners: [{}, {}, {}] } })), /hasta 2/);
  await assert.rejects(service.save('perfumeria', body({ data: { ...body().data, escala_imagen_desktop: 250 } })), /entre 30% y 200%/);
  await assert.rejects(service.save('perfumeria', body({ data: { ...body().data, banners: [{ titulo: 'x', escala_imagen_mobile: 12.5 }] } })), /tamaño de imagen/i);
});

test('publicar exige título completo, imagen de computadora y banners completos', async () => {
  const { service } = fixture();
  await assert.rejects(service.save('perfumeria', body({ publish: true, data: { ...body().data, titulo_normal: ' ' } })), /título/);
  await assert.rejects(service.save('perfumeria', body({ publish: true, data: { ...body().data, imagen_desktop: null } })), /computadora/);
  await assert.rejects(service.save('perfumeria', body({ publish: true, data: { ...body().data, banners: [{ titulo: 'Sin imagen', texto_boton: 'Ver' }] } })), /banner inferior/);
  await service.save('perfumeria', body({ data: { ...body().data, imagen_desktop: null } }));
});

test('descartar elimina solo el borrador del área', async () => {
  const { service } = fixture();
  let result = await service.save('perfumeria', body());
  result = await service.save('hogar', { version: result.version, data: { ...body().data, productos: [] } });
  result = await service.discard('perfumeria', { version: result.version });
  assert.equal(result.areas.perfumeria.draft, null);
  assert.equal(result.areas.hogar.draft.titulo_cursiva, 'Lo más nuevo');
});
