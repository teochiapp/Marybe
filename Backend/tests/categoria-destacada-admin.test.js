const { test } = require('node:test');
const assert = require('node:assert/strict');
const createService = require('../src/api/categoria-destacada-admin/services/categoria-destacada-admin');

function fixture() {
  let main = {
    documentId: 'main-1', updatedAt: 'v1',
    destacada_perfumeria: { id: 5, titulo: 'Categoría destacada', categoria: { documentId: 'dermo', nombre: 'Dermo' } },
    destacada_hogar: { id: 6, titulo: 'Hogar', categoria: { documentId: 'frag', nombre: 'Fragancias' }, productos_orden: ['f1'] },
  };
  const products = [
    { documentId: 'p1', nombre: 'Protector', categoria: 'dermo', publicado: true },
    { documentId: 'p2', nombre: 'Serum', categoria: 'dermo', publicado: true },
    { documentId: 'f1', nombre: 'Perfume', categoria: 'frag', publicado: true },
  ];
  const events = [];
  const matches = (product, filters = {}) => (!filters.categoria || product.categoria === filters.categoria.documentId)
    && (!filters.documentId || filters.documentId.$in.includes(product.documentId));
  const strapi = {
    documents: uid => {
      if (uid.includes('producto')) return { findMany: async ({ filters }) => products.filter(product => matches(product, filters)), count: async ({ filters }) => products.filter(product => matches(product, filters)).length };
      if (uid.includes('categoria')) return { findMany: async () => [{ documentId: 'dermo', nombre: 'Dermo', seccion: 'Perfumería' }, { documentId: 'frag', nombre: 'Fragancias', seccion: 'Perfumería' }], findOne: async ({ documentId }) => (['dermo', 'frag'].includes(documentId) ? { documentId } : null) };
      return {
        findFirst: async () => structuredClone(main),
        update: async ({ data }) => { events.push(data); main = { ...main, ...data, updatedAt: 'v2' }; if (data.destacada_perfumeria) main.destacada_perfumeria = { ...data.destacada_perfumeria, categoria: { documentId: data.destacada_perfumeria.categoria } }; return main; },
      };
    },
  };
  return { service: createService({ strapi }), events };
}

const body = (overrides = {}) => ({ version: 'v1', data: { titulo: 'Lo mejor en dermo', categoria: 'dermo', productos: ['p2', 'p1'] }, ...overrides });

test('el resumen usa la configuración actual y cuenta los productos por categoría', async () => {
  const { service } = fixture();
  const result = await service.overview();
  assert.deepEqual(result.areas.perfumeria.published, { titulo: 'Categoría destacada', categoria: 'dermo', productos: [] });
  assert.deepEqual(result.areas.hogar.published.productos, ['f1']);
  assert.deepEqual(result.categorias.map(category => category.productos), [2, 1]);
  assert.equal(result.maxProducts, 25);
});

test('el borrador no toca la sección publicada', async () => {
  const { service, events } = fixture();
  const result = await service.save('perfumeria', body());
  assert.deepEqual(Object.keys(events[0]), ['borradores_editor_inicio']);
  assert.deepEqual(result.areas.perfumeria.draft.productos, ['p2', 'p1']);
  assert.equal(result.areas.perfumeria.published.titulo, 'Categoría destacada');
});

test('publicar guarda título, categoría y productos en orden solo en el área elegida', async () => {
  const { service, events } = fixture();
  await service.save('perfumeria', body({ publish: true }));
  assert.deepEqual(events[0].destacada_perfumeria, { titulo: 'Lo mejor en dermo', categoria: 'dermo', productos_orden: ['p2', 'p1'] });
  assert.equal(events[0].destacada_hogar, undefined);
});

test('rechaza productos de otra categoría, repetidos, de más y categorías inexistentes', async () => {
  const { service } = fixture();
  await assert.rejects(service.save('perfumeria', body({ data: { ...body().data, productos: ['f1'] } })), /no pertenecen/);
  await assert.rejects(service.save('perfumeria', body({ data: { ...body().data, productos: ['p1', 'p1'] } })), /repetidos/);
  await assert.rejects(service.save('perfumeria', body({ data: { ...body().data, productos: Array.from({ length: 26 }, (_, i) => `x${i}`) } })), /hasta 25/);
  await assert.rejects(service.save('perfumeria', body({ data: { ...body().data, categoria: 'borrada' } })), /ya no existe/);
  await assert.rejects(service.save('perfumeria', body({ data: { titulo: 'x', categoria: null, productos: ['p1'] } })), /Elegí una categoría/);
  await assert.rejects(service.save('perfumeria', body({ publish: true, data: { ...body().data, titulo: '' } })), /título/);
  await assert.rejects(service.save('perfumeria', body({ version: 'viejo' })), error => error.status === 409);
});
