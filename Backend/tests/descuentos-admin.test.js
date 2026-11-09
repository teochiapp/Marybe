const { test } = require('node:test');
const assert = require('node:assert/strict');
const createService = require('../src/api/descuentos-admin/services/descuentos-admin');

const CATEGORIAS = [
  { documentId: 'catperf1', nombre: 'Maquillaje', seccion: 'Perfumería', portada: { id: 7, url: '/uploads/maq.png', width: 600, height: 600, name: 'maq.png' } },
  { documentId: 'cathogar1', nombre: 'Limpieza del Hogar', seccion: 'Hogar', portada: null },
];
const PRODUCTOS = [
  { marca: 'Loreal', proveedor: 'Prov A', categoria: { documentId: 'catperf1' } },
  { marca: 'Loreal', proveedor: 'Prov A', categoria: { documentId: 'catperf1' } },
  { marca: 'Ala', proveedor: 'Prov B', categoria: { documentId: 'cathogar1' } },
  { marca: ' ', proveedor: null, categoria: null },
];
const FILES = { 7: { id: 7, url: '/uploads/maq.png', mime: 'image/png', width: 600, height: 600, name: 'maq.png' }, 8: { id: 8, url: '/uploads/x.svg', mime: 'image/svg+xml' }, 9: { id: 9, url: '/uploads/promo.webp', mime: 'image/webp', width: 900, height: 700, name: 'promo.webp' } };

function fixture(initial = {}) {
  let main = {
    documentId: 'main-1',
    updatedAt: 'v1',
    diseno_categorias: { perfumeria: { forma: 'circular' } },
    diseno_secciones: { ofertas: { perfumeria: { titulo: 'Ofertas' } } },
    borradores_editor_inicio: { categorias: { hogar: { data: {} } } },
    descuento_perfumeria: { titulo_cursiva: 'Descuentos', titulo_normal: 'de Miércoles', color_titulo_cursiva: '#F2DC8F', imagen_destacada: { id: 9, url: '/uploads/promo.webp', width: 900, height: 700, name: 'promo.webp' } },
    descuento_hogar: { titulo_cursiva: 'Ofertas', titulo_normal: 'del Hogar' },
    ...initial,
  };
  const events = [];
  const categoryDocs = { findMany: async () => structuredClone(CATEGORIAS), findOne: async ({ documentId }) => structuredClone(CATEGORIAS.find(item => item.documentId === documentId) || null) };
  const productDocs = {
    findMany: async ({ start = 0, limit }) => structuredClone(PRODUCTOS.slice(start, start + limit)),
    count: async ({ filters }) => PRODUCTOS.filter(product => Object.entries(filters).every(([key, value]) => key === 'publicado' || (value.$eq !== undefined && product[key] === value.$eq))).length,
  };
  const mainDocs = {
    findFirst: async () => structuredClone(main),
    update: async ({ data }) => { events.push(data); main = { ...main, ...data, updatedAt: `v${events.length + 1}` }; return main; },
    create: async ({ data }) => { events.push(data); main = { documentId: 'new', ...data, updatedAt: 'v2' }; return main; },
  };
  const strapi = {
    documents: uid => (uid.includes('categoria') ? categoryDocs : uid.includes('producto') ? productDocs : mainDocs),
    db: { query: () => ({ findOne: async ({ where }) => FILES[where.id] || null }) },
  };
  return { service: createService({ strapi }), events, main: () => main };
}

const valid = { entidad_tipo: 'marca', entidad_id: 'Loreal', texto_superior: 'Solo esta semana', titulo_cursiva: 'Promo', titulo_normal: 'de marca', boton_texto: 'Ver marca', boton_modo: 'auto', boton_enlace: '', imagen: { id: 9 } };

test('sin configuración muestra los valores actuales de la landing en ambos bloques', async () => {
  const { service } = fixture();
  const result = await service.overview();
  assert.deepEqual(Object.keys(result.areas), ['bloque-1', 'bloque-2']);
  const first = result.areas['bloque-1'].published;
  assert.equal(first.titulo_cursiva, 'Descuentos');
  assert.equal(first.titulo_normal, 'de Miércoles');
  assert.equal(first.color_titulo_cursiva, '#F2DC8F');
  assert.equal(first.imagen.id, 9);
  assert.equal(first.texto_superior, 'Envíos a todo el país');
  assert.equal(first.boton_texto, 'Conocer más');
  assert.equal(first.boton_modo, 'auto');
  assert.equal(first.entidad_tipo, '');
  const second = result.areas['bloque-2'].published;
  assert.equal(second.titulo_normal, 'del Hogar');
  assert.equal(second.imagen, null);
});

test('lista categorías, marcas y proveedores con su cantidad de productos', async () => {
  const { service } = fixture();
  const result = await service.entities();
  assert.deepEqual(result.categoria.map(item => [item.documentId, item.productos]), [['catperf1', 2], ['cathogar1', 1]]);
  assert.equal(result.categoria[0].portada.url, '/uploads/maq.png');
  assert.deepEqual(result.marca, [{ nombre: 'Ala', productos: 1 }, { nombre: 'Loreal', productos: 2 }]);
  assert.deepEqual(result.proveedor.map(item => item.nombre), ['Prov A', 'Prov B']);
});

test('el borrador no cambia lo publicado y cada bloque es independiente', async () => {
  const { service, events, main } = fixture();
  const result = await service.save('bloque-1', { version: 'v1', data: valid });
  assert.deepEqual(Object.keys(events[0]), ['borradores_editor_inicio']);
  assert.equal(result.areas['bloque-1'].published.entidad_tipo, '');
  assert.equal(result.areas['bloque-1'].draft.entidad_id, 'Loreal');
  assert.equal(result.areas['bloque-2'].draft, null);
  assert.ok(main().borradores_editor_inicio.categorias.hogar);
});

test('publicar guarda solo el bloque elegido, con imagen real y sin tocar otras configuraciones', async () => {
  const { service, main } = fixture();
  await service.save('bloque-2', { version: 'v1', data: { ...valid, entidad_tipo: 'categoria', entidad_id: 'cathogar1', imagen: { id: 9, url: 'https://evil.test/x.png' } } });
  const published = await service.save('bloque-2', { version: 'v2', data: { ...valid, entidad_tipo: 'categoria', entidad_id: 'cathogar1', imagen: { id: 9, url: 'https://evil.test/x.png' } }, publish: true });
  const stored = main().diseno_secciones.descuentos['bloque-2'];
  assert.equal(stored.entidad_tipo, 'categoria');
  assert.equal(stored.entidad_nombre, 'Limpieza del Hogar');
  assert.equal(stored.entidad_seccion, 'Hogar');
  assert.equal(stored.imagen.url, '/uploads/promo.webp');
  assert.equal(main().diseno_secciones.descuentos['bloque-1'], undefined);
  assert.deepEqual(main().diseno_secciones.ofertas, { perfumeria: { titulo: 'Ofertas' } });
  assert.deepEqual(main().diseno_categorias, { perfumeria: { forma: 'circular' } });
  assert.equal(main().borradores_editor_inicio.descuentos['bloque-2'], undefined);
  assert.equal(published.areas['bloque-2'].published.entidad_id, 'cathogar1');
  assert.equal(published.areas['bloque-1'].published.entidad_tipo, '');
});

test('guardar no modifica categorías ni productos', async () => {
  const { service, events } = fixture();
  await service.save('bloque-1', { version: 'v1', data: valid, publish: true });
  assert.ok(events.every(event => Object.keys(event).every(key => ['diseno_secciones', 'borradores_editor_inicio'].includes(key))));
  assert.deepEqual(CATEGORIAS[0].nombre, 'Maquillaje');
});

test('rechaza entidades inexistentes, tipos, imágenes, enlaces y colores inválidos', async () => {
  const { service } = fixture();
  const save = (data, extra = {}) => service.save('bloque-1', { version: 'v1', data: { ...valid, ...data }, ...extra });
  await assert.rejects(save({ entidad_tipo: 'categoria', entidad_id: 'noexiste' }), /ya no existe/);
  await assert.rejects(save({ entidad_tipo: 'categoria', entidad_id: 'no valido!' }), /inválida/);
  await assert.rejects(save({ entidad_id: 'Marca sin productos' }), /no tiene productos/);
  await assert.rejects(save({ entidad_tipo: 'proveedor', entidad_id: 'Prov Z' }), /no tiene productos/);
  await assert.rejects(save({ entidad_tipo: 'pagina' }), /Tipo de contenido/);
  await assert.rejects(save({ entidad_id: '' }), /Elegí qué querés promocionar/);
  await assert.rejects(save({ imagen: { id: 8 } }), /imagen JPG/);
  await assert.rejects(save({ imagen: { id: 99 } }), /imagen JPG/);
  await assert.rejects(save({ imagen: { id: 'x' } }), /Imagen inválida/);
  await assert.rejects(save({ boton_enlace: 'javascript:alert(1)' }), /URL http/);
  await assert.rejects(save({ boton_enlace: '//evil.test' }), /URL http/);
  await assert.rejects(save({ color_titulo_cursiva: 'rojo' }), /Color inválido/);
  await assert.rejects(save({ titulo_cursiva: 'x'.repeat(121) }), /demasiado largo/);
  await assert.rejects(save({ boton_modo: 'otro' }), /Modo de enlace/);
  await assert.rejects(save({ escala_imagen_desktop: 20 }), /entre 30% y 200%/);
  await assert.rejects(save({ escala_imagen_mobile: 250 }), /entre 30% y 200%/);
  await assert.rejects(save({ imagen_posicion: 'diagonal' }), /Posición de imagen inválida/);
  await assert.rejects(save({ imagen_ajuste: 'estirar' }), /Ajuste de imagen inválido/);
  await assert.rejects(save({ imagen_sombra: 'no' }), /Opción de sombra inválida/);
});

test('guarda imagen de celular, escala, encuadre, ajuste y sombra del bloque', async () => {
  const { service, main } = fixture();
  await service.save('bloque-1', {
    version: 'v1',
    publish: true,
    data: {
      ...valid,
      imagen_mobile: { id: 7 },
      escala_imagen_desktop: 125,
      escala_imagen_mobile: 90,
      imagen_posicion: 'derecha',
      imagen_ajuste: 'cubrir',
      imagen_sombra: false,
    },
  });
  const stored = main().diseno_secciones.descuentos['bloque-1'];
  assert.equal(stored.imagen_mobile.url, '/uploads/maq.png');
  assert.equal(stored.escala_imagen_desktop, 125);
  assert.equal(stored.escala_imagen_mobile, 90);
  assert.equal(stored.imagen_posicion, 'derecha');
  assert.equal(stored.imagen_ajuste, 'cubrir');
  assert.equal(stored.imagen_sombra, false);
});

test('para publicar exige título y, en modo personalizado, un enlace', async () => {
  const { service } = fixture();
  const publish = data => service.save('bloque-1', { version: 'v1', data: { ...valid, ...data }, publish: true });
  await assert.rejects(publish({ titulo_cursiva: ' ', titulo_normal: '' }), /título/);
  await assert.rejects(publish({ boton_modo: 'personalizado', boton_enlace: '' }), /enlace/);
  await publish({ boton_modo: 'personalizado', boton_enlace: '/tienda?marca=Loreal' });
});

test('acepta enlaces personalizados internos y externos y conserva el modo', async () => {
  const { service, main } = fixture();
  await service.save('bloque-1', { version: 'v1', data: { ...valid, boton_modo: 'personalizado', boton_enlace: 'https://marybe.com.ar/promo' }, publish: true });
  assert.equal(main().diseno_secciones.descuentos['bloque-1'].boton_modo, 'personalizado');
  assert.equal(main().diseno_secciones.descuentos['bloque-1'].boton_enlace, 'https://marybe.com.ar/promo');
});

test('rechaza conflictos de versión y bloques inválidos', async () => {
  const { service } = fixture();
  await assert.rejects(service.save('bloque-1', { version: 'viejo', data: valid }), error => error.status === 409);
  await assert.rejects(service.save('perfumeria', { version: 'v1', data: valid }), error => error.status === 404);
  await assert.rejects(service.save('__proto__', { version: 'v1', data: valid }), error => error.status === 404);
  await assert.rejects(service.discard('otro', { version: 'v1' }), error => error.status === 404);
});

test('una entidad eliminada después de publicar no rompe el resumen y se conserva la selección', async () => {
  const { service } = fixture({ diseno_secciones: { descuentos: { 'bloque-1': { ...valid, entidad_tipo: 'categoria', entidad_id: 'borrada1', entidad_nombre: 'Borrada', entidad_seccion: 'Hogar' } } } });
  const result = await service.overview();
  assert.equal(result.areas['bloque-1'].published.entidad_id, 'borrada1');
  assert.equal(result.areas['bloque-1'].published.entidad_nombre, 'Borrada');
});

test('descartar elimina solo el borrador del bloque', async () => {
  const { service, main } = fixture();
  await service.save('bloque-1', { version: 'v1', data: valid });
  await service.save('bloque-2', { version: 'v2', data: valid });
  const result = await service.discard('bloque-1', { version: 'v3' });
  assert.equal(result.areas['bloque-1'].draft, null);
  assert.ok(result.areas['bloque-2'].draft);
  assert.ok(main().borradores_editor_inicio.categorias.hogar);
});

test('valores guardados inválidos vuelven a los predeterminados', () => {
  const { normalize, BLOQUES } = createService;
  const result = normalize({ entidad_tipo: 'otra', entidad_id: 'x', boton_modo: 'raro', color_titulo_cursiva: 'rojo', imagen: { id: 'z' } }, BLOQUES['bloque-1']);
  assert.equal(result.entidad_tipo, '');
  assert.equal(result.boton_modo, 'auto');
  assert.equal(result.color_titulo_cursiva, '');
  assert.equal(result.imagen, null);
  assert.equal(result.titulo_normal, 'de Miércoles');
});
