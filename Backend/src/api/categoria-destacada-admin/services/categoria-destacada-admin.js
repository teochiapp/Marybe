'use strict';

const { productFields, productPopulate } = require('../../destacada-admin/services/destacada-admin');

const MAIN = 'api::seccion-principal.seccion-principal';
const CATEGORY = 'api::categoria.categoria';
const PRODUCT = 'api::producto.producto';

const DEFAULT_MODULE = 'categoria-destacada-1';
const DEFAULT_TITLE = 'Categoría destacada';
// La landing pide los productos sin paginar: Strapi devuelve como máximo 25 (config/api.js).
const MAX_PRODUCTS = 25;
const PAGE_SIZE = 30;
// Íconos opcionales disponibles para acompañar el final del título principal.
const ICONOS = ['', 'estrella', 'corazon', 'regalo', 'destellos', 'etiqueta', 'flecha', 'bolsa'];

// Configuración reutilizable de ambos módulos de Categoría Destacada (1 y 2).
const MODULES = {
  'categoria-destacada-1': {
    draftKey: 'categoriaDestacada',
    defaultTitle: DEFAULT_TITLE,
    areas: {
      perfumeria: { label: 'Perfumería', field: 'destacada_perfumeria', hasMediaIcon: false },
      hogar: { label: 'Hogar', field: 'destacada_hogar', hasMediaIcon: false },
    },
  },
  'categoria-destacada-2': {
    draftKey: 'categoriaDestacada2',
    defaultTitle: DEFAULT_TITLE,
    areas: {
      perfumeria: { label: 'Perfumería', field: 'categoria_especifica_perfumeria', hasMediaIcon: true },
      hogar: { label: 'Hogar', field: 'categoria_especifica_hogar', hasMediaIcon: true },
    },
  },
};
const AREAS = MODULES[DEFAULT_MODULE].areas;

function fail(message, status = 400) { const error = new Error(message); error.status = status; throw error; }
function moduleFor(key = DEFAULT_MODULE) {
  const mod = Object.prototype.hasOwnProperty.call(MODULES, key) ? MODULES[key] : null;
  if (!mod) fail('Módulo de categoría destacada inválido.', 404);
  return mod;
}
function areaFor(mod, key) {
  const area = Object.prototype.hasOwnProperty.call(mod.areas, key) ? mod.areas[key] : null;
  if (!area) fail('Área inválida.', 404);
  return area;
}
function text(value, max) {
  if (value == null) return '';
  if (typeof value !== 'string' || value.length > max) fail('Texto demasiado largo o inválido.');
  return value;
}
const normalizeIcon = value => (typeof value === 'string' && ICONOS.includes(value) ? value : '');
const isDocumentId = value => typeof value === 'string' && /^[a-z0-9]{1,64}$/i.test(value);
// Mismo criterio que la landing: productos publicados de la categoría.
const productFilters = (categoryId, extra = {}) => ({ publicado: true, categoria: { documentId: categoryId }, ...extra });

module.exports = ({ strapi }) => {
  const populate = Object.fromEntries(
    Object.values(MODULES).flatMap(mod => Object.values(mod.areas).map(area => [
      area.field,
      { populate: { categoria: { fields: ['nombre', 'seccion'] }, ...(area.hasMediaIcon ? { icono: { fields: ['url'] } } : {}) } },
    ]))
  );
  const loadMain = () => strapi.documents(MAIN).findFirst({ fields: ['updatedAt', 'borradores_editor_inicio'], populate });

  function publishedState(main, area) {
    const value = main?.[area.field];
    return {
      titulo: value?.titulo || '',
      icono: normalizeIcon(value?.icono_titulo),
      categoria: value?.categoria?.documentId || null,
      productos: Array.isArray(value?.productos_orden) ? value.productos_orden.filter(isDocumentId) : [],
    };
  }

  function normalizeDraft(data) {
    if (!data || typeof data !== 'object') return null;
    return {
      titulo: typeof data.titulo === 'string' ? data.titulo : '',
      icono: normalizeIcon(data.icono),
      categoria: isDocumentId(data.categoria) ? data.categoria : null,
      productos: Array.isArray(data.productos) ? data.productos.filter(isDocumentId) : [],
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

  async function overview(moduleKey = DEFAULT_MODULE) {
    const mod = moduleFor(moduleKey);
    const main = await loadMain();
    const drafts = main?.borradores_editor_inicio?.[mod.draftKey] || {};
    const areas = {};
    const referenced = new Set();
    for (const [key, area] of Object.entries(mod.areas)) {
      const published = publishedState(main, area);
      const draft = normalizeDraft(drafts[key]?.data);
      [...published.productos, ...(draft?.productos || [])].forEach(id => referenced.add(id));
      areas[key] = { published, draft, draftSavedAt: drafts[key]?.savedAt || null };
    }
    const products = referenced.size ? await cards({ documentId: { $in: [...referenced] } }) : [];
    return {
      version: main?.updatedAt || null,
      exists: Boolean(main),
      defaultTitle: mod.defaultTitle,
      maxProducts: MAX_PRODUCTS,
      iconos: ICONOS,
      areas,
      categorias: await categoryList(),
      products: Object.fromEntries(products.map(product => [product.documentId, product])),
    };
  }

  async function clean(input, strict) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) fail('Datos inválidos.');
    const titulo = text(input.titulo, 120);
    const icono = input.icono == null ? '' : input.icono;
    if (typeof icono !== 'string' || !ICONOS.includes(icono)) fail('Ícono de título inválido.');
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
    return { titulo, icono, categoria, productos };
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

    async save(areaKey, body = {}, moduleKey = DEFAULT_MODULE) {
      const mod = moduleFor(moduleKey);
      const area = areaFor(mod, areaKey);
      const main = await loadMain();
      checkVersion(main, body.version);
      const publish = body.publish === true;
      const data = await clean(body.data, publish);
      const stored = main?.borradores_editor_inicio || {};
      const drafts = { ...stored, [mod.draftKey]: { ...(stored[mod.draftKey] || {}) } };
      if (!publish) {
        drafts[mod.draftKey][areaKey] = { data, savedAt: new Date().toISOString() };
        await writeMain(main, { borradores_editor_inicio: drafts });
        return overview(moduleKey);
      }
      delete drafts[mod.draftKey][areaKey];
      const previousMediaIcon = area.hasMediaIcon && main?.[area.field]?.icono?.id ? { icono: main[area.field].icono.id } : {};
      await writeMain(main, {
        [area.field]: { ...previousMediaIcon, titulo: data.titulo.trim(), icono_titulo: data.icono, categoria: data.categoria, productos_orden: data.productos },
        borradores_editor_inicio: drafts,
      });
      return overview(moduleKey);
    },

    async discard(areaKey, body = {}, moduleKey = DEFAULT_MODULE) {
      const mod = moduleFor(moduleKey);
      areaFor(mod, areaKey);
      const main = await loadMain();
      checkVersion(main, body.version);
      const stored = main?.borradores_editor_inicio || {};
      if (!stored[mod.draftKey]?.[areaKey]) return overview(moduleKey);
      const section = { ...stored[mod.draftKey] };
      delete section[areaKey];
      await writeMain(main, { borradores_editor_inicio: { ...stored, [mod.draftKey]: section } });
      return overview(moduleKey);
    },
  };
};

module.exports.AREAS = AREAS;
module.exports.MODULES = MODULES;
module.exports.ICONOS = ICONOS;
module.exports.MAX_PRODUCTS = MAX_PRODUCTS;
