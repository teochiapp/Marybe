'use strict';

const { productFields, productPopulate } = require('../../destacada-admin/services/destacada-admin');

const MAIN = 'api::seccion-principal.seccion-principal';
const CATEGORY = 'api::categoria.categoria';
const PRODUCT = 'api::producto.producto';

// Campos de seccion-principal (componente inicio.destacada) de cada área.
const AREAS = {
  perfumeria: { label: 'Perfumería', field: 'destacada_perfumeria' },
  hogar: { label: 'Hogar', field: 'destacada_hogar' },
};
const DEFAULT_TITLE = 'Categoría destacada';
// La landing pide los productos sin paginar: Strapi devuelve como máximo 25 (config/api.js).
const MAX_PRODUCTS = 25;
const PAGE_SIZE = 30;
const DRAFT_KEY = 'categoriaDestacada';

function fail(message, status = 400) { const error = new Error(message); error.status = status; throw error; }
function areaFor(key) {
  const area = AREAS[key];
  if (!area) fail('Área inválida.', 404);
  return area;
}
function text(value, max) {
  if (value == null) return '';
  if (typeof value !== 'string' || value.length > max) fail('Texto demasiado largo o inválido.');
  return value;
}
const isDocumentId = value => typeof value === 'string' && /^[a-z0-9]{1,64}$/i.test(value);
// Mismo criterio que la landing: productos publicados de la categoría.
const productFilters = (categoryId, extra = {}) => ({ publicado: true, categoria: { documentId: categoryId }, ...extra });

module.exports = ({ strapi }) => {
  const populate = Object.fromEntries(Object.values(AREAS).map(area => [area.field, { populate: { categoria: { fields: ['nombre', 'seccion'] } } }]));
  const loadMain = () => strapi.documents(MAIN).findFirst({ fields: ['updatedAt', 'borradores_editor_inicio'], populate });

  function publishedState(main, area) {
    const value = main?.[area.field];
    return {
      titulo: value?.titulo || '',
      categoria: value?.categoria?.documentId || null,
      productos: Array.isArray(value?.productos_orden) ? value.productos_orden.filter(isDocumentId) : [],
    };
  }

  async function categoryList() {
    const categories = await strapi.documents(CATEGORY).findMany({ status: 'published', fields: ['nombre', 'seccion'], sort: ['seccion:asc', 'nombre:asc'], limit: 500 });
    return Promise.all(categories.map(async category => ({
      documentId: category.documentId,
      nombre: category.nombre,
      seccion: category.seccion || '',
      productos: await strapi.documents(PRODUCT).count({ status: 'published', filters: productFilters(category.documentId) }),
    })));
  }

  const cards = filters => strapi.documents(PRODUCT).findMany({ status: 'published', fields: productFields, populate: productPopulate, filters, sort: 'id:asc', limit: 200 });

  async function overview() {
    const main = await loadMain();
    const drafts = main?.borradores_editor_inicio?.[DRAFT_KEY] || {};
    const areas = {};
    const referenced = new Set();
    for (const [key, area] of Object.entries(AREAS)) {
      const published = publishedState(main, area);
      const draft = drafts[key]?.data || null;
      [...published.productos, ...(draft?.productos || [])].forEach(id => referenced.add(id));
      areas[key] = { published, draft, draftSavedAt: drafts[key]?.savedAt || null };
    }
    const products = referenced.size ? await cards({ documentId: { $in: [...referenced] } }) : [];
    return {
      version: main?.updatedAt || null,
      exists: Boolean(main),
      defaultTitle: DEFAULT_TITLE,
      maxProducts: MAX_PRODUCTS,
      areas,
      categorias: await categoryList(),
      products: Object.fromEntries(products.map(product => [product.documentId, product])),
    };
  }

  async function clean(input, strict) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) fail('Datos inválidos.');
    const titulo = text(input.titulo, 120);
    const categoria = input.categoria == null || input.categoria === '' ? null : input.categoria;
    if (categoria !== null && !isDocumentId(categoria)) fail('Categoría inválida.');
    if (categoria) {
      const found = await strapi.documents(CATEGORY).findOne({ documentId: categoria, status: 'published', fields: ['nombre'] });
      if (!found) fail('La categoría elegida ya no existe o no está publicada. Elegí otra.');
    }
    if (input.productos != null && !Array.isArray(input.productos)) fail('Productos inválidos.');
    const productos = input.productos || [];
    if (productos.some(id => !isDocumentId(id))) fail('Producto inválido.');
    if (new Set(productos).size !== productos.length) fail('Hay productos repetidos.');
    if (productos.length > MAX_PRODUCTS) fail(`La sección muestra hasta ${MAX_PRODUCTS} productos. Quitá ${productos.length - MAX_PRODUCTS}.`);
    if (productos.length) {
      if (!categoria) fail('Elegí una categoría antes de seleccionar productos.');
      const found = await strapi.documents(PRODUCT).findMany({ status: 'published', fields: ['nombre'], filters: productFilters(categoria, { documentId: { $in: productos } }), limit: MAX_PRODUCTS });
      if (found.length !== productos.length) fail('Algunos productos no pertenecen a la categoría elegida o ya no están publicados. Quitalos y volvé a intentar.');
    }
    if (strict) {
      if (!titulo.trim()) fail('Escribí el título de la sección antes de publicar.');
      if (!categoria) fail('Elegí la categoría de la sección antes de publicar.');
    }
    return { titulo, categoria, productos };
  }

  async function writeMain(main, data) {
    if (main) return strapi.documents(MAIN).update({ documentId: main.documentId, data });
    return strapi.documents(MAIN).create({ data: { secciones: [], ...data } });
  }

  function checkVersion(main, version) {
    if ((main?.updatedAt || null) !== (version ?? null)) fail('Otro administrador modificó la Página de Inicio. Recargá antes de guardar.', 409);
  }

  return {
    overview,

    // Productos publicados de una categoría para elegir en el editor (orden del catálogo, paginados).
    async products(query = {}) {
      if (!isDocumentId(query.categoria)) fail('Categoría inválida.');
      const term = text(query.q, 80).trim();
      const page = Math.max(1, Math.min(1000, Number.parseInt(query.page, 10) || 1));
      const filters = productFilters(query.categoria);
      if (term) filters.$or = [{ nombre: { $containsi: term } }, { marca: { $containsi: term } }, { sku: { $containsi: term } }];
      const [items, total] = await Promise.all([
        strapi.documents(PRODUCT).findMany({ status: 'published', fields: productFields, populate: productPopulate, filters, sort: 'id:asc', limit: PAGE_SIZE, start: (page - 1) * PAGE_SIZE }),
        strapi.documents(PRODUCT).count({ status: 'published', filters }),
      ]);
      return { items, total, page, pageSize: PAGE_SIZE };
    },

    async save(areaKey, body = {}) {
      const area = areaFor(areaKey);
      const main = await loadMain();
      checkVersion(main, body.version);
      const publish = body.publish === true;
      const data = await clean(body.data, publish);
      const stored = main?.borradores_editor_inicio || {};
      const drafts = { ...stored, [DRAFT_KEY]: { ...(stored[DRAFT_KEY] || {}) } };
      if (!publish) {
        drafts[DRAFT_KEY][areaKey] = { data, savedAt: new Date().toISOString() };
        await writeMain(main, { borradores_editor_inicio: drafts });
        return overview();
      }
      delete drafts[DRAFT_KEY][areaKey];
      await writeMain(main, {
        [area.field]: { titulo: data.titulo.trim(), categoria: data.categoria, productos_orden: data.productos },
        borradores_editor_inicio: drafts,
      });
      return overview();
    },

    async discard(areaKey, body = {}) {
      areaFor(areaKey);
      const main = await loadMain();
      checkVersion(main, body.version);
      const stored = main?.borradores_editor_inicio || {};
      if (!stored[DRAFT_KEY]?.[areaKey]) return overview();
      const section = { ...stored[DRAFT_KEY] };
      delete section[areaKey];
      await writeMain(main, { borradores_editor_inicio: { ...stored, [DRAFT_KEY]: section } });
      return overview();
    },
  };
};

module.exports.AREAS = AREAS;
module.exports.MAX_PRODUCTS = MAX_PRODUCTS;
