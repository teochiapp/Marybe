'use strict';

const { safeUrl } = require('../../banners-admin/services/banners-admin');

const MAIN = 'api::seccion-principal.seccion-principal';
const PRODUCT = 'api::producto.producto';
const FILE = 'plugin::upload.file';

// `item` es el valor del enum de shared.seccion-principal-item; `products` el texto de producto.seccion.
const AREAS = {
  perfumeria: { label: 'Perfumería', item: 'Perfumeria', products: 'Perfumería', banners: true },
  hogar: { label: 'Hogar', item: 'Hogar', products: 'Hogar', banners: false },
};
// La landing pide los destacados sin paginar: Strapi devuelve como máximo 25 (config/api.js).
const MAX_PRODUCTS = 25;
const MAX_BANNERS = 2;
const MAX_SEARCH = 30;
const SCALE_MIN = 30;
const SCALE_MAX = 200;
const mainPopulate = { secciones: { populate: ['imagen_desktop', 'imagen_mobile'] }, categorias_destacadas: { populate: ['imagen'] } };
const productFields = ['nombre', 'marca', 'sku', 'seccion', 'precio', 'precio_oferta', 'descuento', 'stock', 'publicado', 'destacado', 'precio_minimo_calculado', 'precio_maximo_calculado'];
const productPopulate = { portada: { fields: ['url', 'width', 'height', 'alternativeText'] }, variantes: { populate: { portada: { fields: ['url'] } } } };

function fail(message, status = 400) { const error = new Error(message); error.status = status; throw error; }
function text(value, max) {
  if (value == null) return '';
  if (typeof value !== 'string' || value.length > max) fail('Texto demasiado largo o inválido.');
  return value;
}
function color(value) {
  if (value == null || value === '') return '';
  if (typeof value !== 'string' || !/^#[0-9a-f]{6}$/i.test(value)) fail('Color inválido. Usá el formato #RRGGBB.');
  return value.toUpperCase();
}
function scale(value) {
  if (value == null || value === '') return null;
  const number = Number(value);
  if (!Number.isInteger(number) || number < SCALE_MIN || number > SCALE_MAX) fail(`El tamaño de imagen debe estar entre ${SCALE_MIN}% y ${SCALE_MAX}%.`);
  return number === 100 ? null : number;
}
const scales = source => ({ escala_imagen_desktop: source?.escala_imagen_desktop ?? null, escala_imagen_mobile: source?.escala_imagen_mobile ?? null });
function areaFor(key) {
  const area = AREAS[key];
  if (!area) fail('Área inválida.', 404);
  return area;
}
const normalize = value => String(value || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const itemFor = (main, area) => (main?.secciones || []).find(item => normalize(item.seccion) === normalize(area.item));
const media = file => (file?.id ? { id: file.id, url: file.url, name: file.name, width: file.width, height: file.height } : null);
const mediaKey = value => (typeof value === 'object' && value !== null ? value.id : value);

function emptyData() {
  return { titulo_cursiva: '', titulo_normal: '', color_titulo_cursiva: '', color_titulo_normal: '', subtitulo: '', imagen_desktop: null, imagen_mobile: null, escala_imagen_desktop: null, escala_imagen_mobile: null, banners: [], productos: [] };
}

module.exports = ({ strapi }) => {
  async function loadMain() {
    return strapi.documents(MAIN).findFirst({ populate: mainPopulate });
  }

  async function productCards(where) {
    return strapi.documents(PRODUCT).findMany({ status: 'published', fields: productFields, populate: productPopulate, sort: 'id:asc', limit: 200, ...where });
  }

  async function featuredProducts(area) {
    return productCards({ filters: { publicado: true, destacado: true, seccion: area.products } });
  }

  async function filesById(ids) {
    const unique = [...new Set(ids.filter(id => Number.isSafeInteger(id)))];
    if (!unique.length) return new Map();
    const files = await strapi.db.query(FILE).findMany({ where: { id: { $in: unique } }, select: ['id', 'url', 'name', 'width', 'height', 'mime'] });
    return new Map(files.map(file => [file.id, file]));
  }

  function publishedState(main, area, products) {
    const item = itemFor(main, area);
    return {
      titulo_cursiva: item?.titulo_cursiva || '',
      titulo_normal: item?.titulo_normal || '',
      color_titulo_cursiva: item?.color_titulo_cursiva || '',
      color_titulo_normal: item?.color_titulo_normal || '',
      subtitulo: item?.subtitulo || '',
      imagen_desktop: media(item?.imagen_desktop),
      imagen_mobile: media(item?.imagen_mobile),
      ...scales(item),
      banners: area.banners ? (main?.categorias_destacadas || []).map(banner => ({ titulo: banner.titulo || '', imagen: media(banner.imagen), ...scales(banner), texto_boton: banner.texto_boton || '', link_boton: banner.link_boton || '' })) : [],
      productos: products.map(product => product.documentId),
    };
  }

  function hydrateDraft(stored, files) {
    if (!stored?.data) return null;
    const data = { ...emptyData(), ...stored.data };
    return {
      ...data,
      imagen_desktop: media(files.get(data.imagen_desktop)),
      imagen_mobile: media(files.get(data.imagen_mobile)),
      banners: (data.banners || []).map(banner => ({ ...banner, imagen: media(files.get(banner.imagen)) })),
    };
  }

  async function overview() {
    const main = await loadMain();
    const drafts = main?.borradores_editor_inicio?.destacada || {};
    const draftMediaIds = Object.values(drafts).flatMap(entry => [entry?.data?.imagen_desktop, entry?.data?.imagen_mobile, ...(entry?.data?.banners || []).map(banner => banner.imagen)]);
    const files = await filesById(draftMediaIds);
    const catalog = new Map();
    const areas = {};
    for (const [key, area] of Object.entries(AREAS)) {
      const featured = await featuredProducts(area);
      featured.forEach(product => catalog.set(product.documentId, product));
      areas[key] = { published: publishedState(main, area, featured), draft: hydrateDraft(drafts[key], files), draftSavedAt: drafts[key]?.savedAt || null };
    }
    const missing = Object.values(areas).flatMap(entry => entry.draft?.productos || []).filter(id => !catalog.has(id));
    if (missing.length) (await productCards({ filters: { documentId: { $in: missing } } })).forEach(product => catalog.set(product.documentId, product));
    return { version: main?.updatedAt || null, exists: Boolean(main), areas, products: Object.fromEntries(catalog) };
  }

  async function mediaId(value) {
    const id = mediaKey(value);
    if (id == null || id === '') return null;
    if (!Number.isSafeInteger(Number(id)) || Number(id) < 1) fail('Imagen inválida.');
    const file = await strapi.db.query(FILE).findOne({ where: { id: Number(id) } });
    if (!file || !file.mime?.startsWith('image/') || file.mime === 'image/svg+xml') fail('Seleccioná una imagen JPG, PNG, WebP, GIF o AVIF de la biblioteca.');
    return Number(id);
  }

  async function clean(input, area, strict) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) fail('Datos inválidos.');
    const data = {
      titulo_cursiva: text(input.titulo_cursiva, 120),
      titulo_normal: text(input.titulo_normal, 120),
      color_titulo_cursiva: color(input.color_titulo_cursiva),
      color_titulo_normal: color(input.color_titulo_normal),
      subtitulo: text(input.subtitulo, 500),
      imagen_desktop: await mediaId(input.imagen_desktop),
      imagen_mobile: await mediaId(input.imagen_mobile),
      escala_imagen_desktop: scale(input.escala_imagen_desktop),
      escala_imagen_mobile: scale(input.escala_imagen_mobile),
      banners: [],
      productos: [],
    };
    if (input.banners != null && !Array.isArray(input.banners)) fail('Banners inválidos.');
    if (area.banners) {
      if ((input.banners || []).length > MAX_BANNERS) fail(`La sección admite hasta ${MAX_BANNERS} banners.`);
      for (const banner of input.banners || []) {
        if (!banner || typeof banner !== 'object') fail('Banner inválido.');
        data.banners.push({ titulo: text(banner.titulo, 120), imagen: await mediaId(banner.imagen), escala_imagen_desktop: scale(banner.escala_imagen_desktop), escala_imagen_mobile: scale(banner.escala_imagen_mobile), texto_boton: text(banner.texto_boton, 60), link_boton: safeUrl(banner.link_boton) });
      }
    }
    if (input.productos != null && !Array.isArray(input.productos)) fail('Productos inválidos.');
    const ids = input.productos || [];
    if (ids.length > MAX_PRODUCTS) fail(`La tienda muestra hasta ${MAX_PRODUCTS} productos destacados por área. Quitá ${ids.length - MAX_PRODUCTS} y volvé a intentar.`);
    if (ids.some(id => typeof id !== 'string' || !/^[a-z0-9]{1,64}$/i.test(id))) fail('Producto inválido.');
    if (new Set(ids).size !== ids.length) fail('Hay productos repetidos.');
    if (ids.length) {
      const found = await strapi.documents(PRODUCT).findMany({ status: 'published', fields: ['seccion', 'publicado'], filters: { documentId: { $in: ids }, publicado: true, seccion: area.products }, limit: MAX_PRODUCTS });
      if (found.length !== ids.length) fail(`Algunos productos ya no están publicados en ${area.label}. Quitalos y volvé a intentar.`);
    }
    data.productos = ids;
    if (strict) {
      if (!data.titulo_cursiva.trim() || !data.titulo_normal.trim()) fail('Completá las dos partes del título antes de publicar.');
      if (!data.imagen_desktop) fail('Elegí la imagen para computadora antes de publicar.');
      if (data.banners.some(banner => !banner.titulo.trim() || !banner.imagen || !banner.texto_boton.trim())) fail('Cada banner inferior necesita título, imagen y texto del botón.');
    }
    return data;
  }

  function componentFrom(item) {
    return {
      id: item.id,
      seccion: item.seccion,
      titulo_cursiva: item.titulo_cursiva,
      titulo_normal: item.titulo_normal,
      color_titulo_cursiva: item.color_titulo_cursiva || null,
      color_titulo_normal: item.color_titulo_normal || null,
      subtitulo: item.subtitulo,
      imagen_desktop: item.imagen_desktop?.id ?? null,
      imagen_mobile: item.imagen_mobile?.id ?? null,
      ...scales(item),
    };
  }

  async function writeMain(main, data) {
    if (main) return strapi.documents(MAIN).update({ documentId: main.documentId, data });
    return strapi.documents(MAIN).create({ data: { secciones: [], ...data } });
  }

  async function syncProducts(area, ids) {
    const current = await strapi.documents(PRODUCT).findMany({ status: 'published', fields: ['documentId'], filters: { publicado: true, destacado: true, seccion: area.products }, limit: 1000 });
    const currentIds = current.map(product => product.documentId);
    const add = ids.filter(id => !currentIds.includes(id));
    const remove = currentIds.filter(id => !ids.includes(id));
    // Actualiza las filas borrador y publicada de cada producto sin publicar otros cambios pendientes.
    if (add.length) await strapi.db.query(PRODUCT).updateMany({ where: { documentId: { $in: add } }, data: { destacado: true } });
    if (remove.length) await strapi.db.query(PRODUCT).updateMany({ where: { documentId: { $in: remove } }, data: { destacado: false } });
    return { add, remove };
  }

  function checkVersion(main, version) {
    if ((main?.updatedAt || null) !== (version ?? null)) fail('Otro administrador modificó la Página de Inicio. Recargá antes de guardar.', 409);
  }

  return {
    overview,

    async search(query = {}) {
      const area = areaFor(query.area);
      const term = text(query.q, 80).trim();
      const filters = { publicado: true, seccion: area.products };
      if (term) filters.$or = [{ nombre: { $containsi: term } }, { marca: { $containsi: term } }, { sku: { $containsi: term } }];
      return strapi.documents(PRODUCT).findMany({ status: 'published', fields: productFields, populate: productPopulate, filters, sort: 'nombre:asc', limit: MAX_SEARCH });
    },

    async save(areaKey, body = {}) {
      const area = areaFor(areaKey);
      const main = await loadMain();
      checkVersion(main, body.version);
      const publish = body.publish === true;
      const data = await clean(body.data, area, publish);
      const stored = main?.borradores_editor_inicio || {};
      const drafts = { ...stored, destacada: { ...(stored.destacada || {}) } };
      if (!publish) {
        drafts.destacada[areaKey] = { data, savedAt: new Date().toISOString() };
        await writeMain(main, { borradores_editor_inicio: drafts });
        return overview();
      }
      delete drafts.destacada[areaKey];
      const values = {
        seccion: area.item,
        titulo_cursiva: data.titulo_cursiva.trim(),
        titulo_normal: data.titulo_normal.trim(),
        color_titulo_cursiva: data.color_titulo_cursiva || null,
        color_titulo_normal: data.color_titulo_normal || null,
        subtitulo: data.subtitulo,
        imagen_desktop: data.imagen_desktop,
        imagen_mobile: data.imagen_mobile,
        escala_imagen_desktop: data.escala_imagen_desktop,
        escala_imagen_mobile: data.escala_imagen_mobile,
      };
      const current = itemFor(main, area);
      const secciones = (main?.secciones || []).map(item => (item === current ? { id: item.id, ...values } : componentFrom(item)));
      if (!current) secciones.push(values);
      const update = { secciones, borradores_editor_inicio: drafts };
      if (area.banners) {
        const existing = main?.categorias_destacadas || [];
        update.categorias_destacadas = data.banners.map((banner, index) => ({ ...(existing[index]?.id ? { id: existing[index].id } : {}), ...banner }));
      }
      const run = async () => { await writeMain(main, update); await syncProducts(area, data.productos); };
      if (typeof strapi.db.transaction === 'function') await strapi.db.transaction(run); else await run();
      return overview();
    },

    async discard(areaKey, body = {}) {
      areaFor(areaKey);
      const main = await loadMain();
      checkVersion(main, body.version);
      const stored = main?.borradores_editor_inicio || {};
      if (!stored.destacada?.[areaKey]) return overview();
      const destacada = { ...stored.destacada };
      delete destacada[areaKey];
      await writeMain(main, { borradores_editor_inicio: { ...stored, destacada } });
      return overview();
    },
  };
};

module.exports.AREAS = AREAS;
module.exports.productFields = productFields;
module.exports.productPopulate = productPopulate;
