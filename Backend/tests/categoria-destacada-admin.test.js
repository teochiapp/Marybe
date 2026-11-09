const { test } = require('node:test');
const assert = require('node:assert/strict');
const createService = require('../src/api/categoria-destacada-admin/services/categoria-destacada-admin');

function fixture() {
  let main = {
    documentId: 'main-1', updatedAt: 'v1',
    destacada_perfumeria: { id: 5, titulo: 'Categoría destacada', categoria: { documentId: 'dermo', nombre: 'Dermo' } },
    destacada_hogar: { id: 6, titulo: 'Hogar', icono_titulo: 'estrella', categoria: { documentId: 'frag', nombre: 'Fragancias' }, productos_orden: ['f1'] },
    categoria_especifica_perfumeria: { id: 7, titulo: 'Maquillaje elegido', icono: { id: 42, url: '/uploads/icon.png' }, icono_titulo: 'regalo', categoria: { documentId: 'frag', nombre: 'Fragancias' }, productos_orden: ['f1'] },
    categoria_especifica_hogar: { id: 8, titulo: 'Hogar 2', categoria: { documentId: 'dermo', nombre: 'Dermo' } },
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
        update: async ({ data }) => {
          events.push(data);
          main = { ...main, ...data, updatedAt: `v${events.length + 1}` };
          for (const field of ['destacada_perfumeria', 'destacada_hogar', 'categoria_especifica_perfumeria', 'categoria_especifica_hogar']) {
            if (data[field]) main[field] = { ...data[field], categoria: { documentId: data[field].categoria } };
          }
          return main;
        },
      };
    },
  };
  return { service: createService({ strapi }), events, main: () => main };
}

const body = (overrides = {}) => ({ version: 'v1', data: { titulo: 'Lo mejor en dermo', icono: '', categoria: 'dermo', productos: ['p2', 'p1'] }, ...overrides });

test('el resumen usa la configuración actual, carga el ícono opcional y cuenta los productos por categoría', async () => {
  const { service } = fixture();
  const result = await service.overview();
  assert.deepEqual(result.areas.perfumeria.published, { titulo: 'Categoría destacada', icono: '', categoria: 'dermo', productos: [] });
  assert.equal(result.areas.hogar.published.icono, 'estrella');
  assert.deepEqual(result.areas.hogar.published.productos, ['f1']);
  assert.deepEqual(result.categorias.map(category => category.productos), [2, 1]);
  assert.equal(result.maxProducts, 25);
});

test('el borrador no toca la sección publicada y es compatible con datos sin campo icono', async () => {
  const { service, events } = fixture();
  const result = await service.save('perfumeria', { version: 'v1', data: { titulo: 'Lo mejor en dermo', categoria: 'dermo', productos: ['p2', 'p1'] } });
  assert.deepEqual(Object.keys(events[0]), ['borradores_editor_inicio']);
  assert.deepEqual(result.areas.perfumeria.draft.productos, ['p2', 'p1']);
  assert.equal(result.areas.perfumeria.draft.icono, '');
  assert.equal(result.areas.perfumeria.published.titulo, 'Categoría destacada');
});

test('publicar guarda título, ícono, categoría y productos en orden solo en el área elegida', async () => {
  const { service, events } = fixture();
  await service.save('perfumeria', body({ publish: true, data: { ...body().data, icono: 'estrella' } }));
  assert.deepEqual(events[0].destacada_perfumeria, { titulo: 'Lo mejor en dermo', icono_titulo: 'estrella', categoria: 'dermo', productos_orden: ['p2', 'p1'] });
  assert.equal(events[0].destacada_hogar, undefined);
});

test('Categoría Destacada (2) funciona con su propio campo y borrador sin afectar Categoría Destacada (1)', async () => {
  const { service, events, main } = fixture();
  const initial2 = await service.overview('categoria-destacada-2');
  assert.deepEqual(initial2.areas.perfumeria.published, { titulo: 'Maquillaje elegido', icono: 'regalo', categoria: 'frag', productos: ['f1'] });

  // Guardar borrador en Categoría Destacada (2)
  await service.save('perfumeria', { version: 'v1', data: { titulo: 'Especial Dermo 2', icono: 'corazon', categoria: 'dermo', productos: ['p1', 'p2'] } }, 'categoria-destacada-2');
  assert.ok(main().borradores_editor_inicio.categoriaDestacada2.perfumeria);
  assert.equal(main().borradores_editor_inicio.categoriaDestacada, undefined);

  // Publicar en Categoría Destacada (2) conserva icono media previo y no modifica Categoría Destacada (1)
  const published2 = await service.save('perfumeria', { version: 'v2', publish: true, data: { titulo: 'Especial Dermo 2', icono: 'corazon', categoria: 'dermo', productos: ['p1', 'p2'] } }, 'categoria-destacada-2');
  assert.deepEqual(events[1].categoria_especifica_perfumeria, { icono: 42, titulo: 'Especial Dermo 2', icono_titulo: 'corazon', categoria: 'dermo', productos_orden: ['p1', 'p2'] });
  assert.equal(events[1].destacada_perfumeria, undefined);
  assert.equal(published2.areas.perfumeria.published.icono, 'corazon');

  const check1 = await service.overview('categoria-destacada-1');
  assert.equal(check1.areas.perfumeria.published.titulo, 'Categoría destacada');
  assert.equal(check1.areas.perfumeria.published.icono, '');
});

test('rechaza productos de otra categoría, repetidos, de más, íconos inválidos, módulos inválidos y categorías inexistentes', async () => {
  const { service } = fixture();
  await assert.rejects(service.save('perfumeria', body({ data: { ...body().data, productos: ['f1'] } })), /no pertenecen/);
  await assert.rejects(service.save('perfumeria', body({ data: { ...body().data, productos: ['p1', 'p1'] } })), /repetidos/);
  await assert.rejects(service.save('perfumeria', body({ data: { ...body().data, productos: Array.from({ length: 26 }, (_, i) => `x${i}`) } })), /hasta 25/);
  await assert.rejects(service.save('perfumeria', body({ data: { ...body().data, categoria: 'borrada' } })), /ya no existe/);
  await assert.rejects(service.save('perfumeria', body({ data: { titulo: 'x', categoria: null, productos: ['p1'] } })), /Elegí una categoría/);
  await assert.rejects(service.save('perfumeria', body({ data: { ...body().data, icono: 'cohete' } })), /Ícono de título inválido/);
  await assert.rejects(service.save('perfumeria', body({ publish: true, data: { ...body().data, titulo: '' } })), /título/);
  await assert.rejects(service.save('perfumeria', body({ version: 'viejo' })), error => error.status === 409);
  await assert.rejects(service.overview('categoria-destacada-3'), error => error.status === 404);
});
