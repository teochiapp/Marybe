'use strict';

const MAIN = 'api::seccion-principal.seccion-principal';
const CATEGORY = 'api::categoria.categoria';
const FILE = 'plugin::upload.file';

const AREAS = {
  perfumeria: { label: 'Perfumería', seccion: 'Perfumería' },
  hogar: { label: 'Hogar', seccion: 'Hogar' },
};
// Variantes visuales de la sección (aplicadas a todas las tarjetas). El primer valor es el diseño original.
const OPTIONS = {
  forma: ['redondeado', 'rectangular', 'cuadrado', 'circular'],
  boton: ['pildora', 'redondeado', 'cuadrado'],
  estiloBoton: ['relleno', 'claro'],
};
const DRAFT_KEY = 'categorias';

function fail(message, status = 400) { const error = new Error(message); error.status = status; throw error; }
function areaFor(key) {
  const area = AREAS[key];
  if (!area) fail('Área inválida.', 404);
  return area;
}
const media = file => (file?.id ? { id: file.id, url: file.url, name: file.name, width: file.width, height: file.height } : null);
const option = (name, value) => (OPTIONS[name].includes(value) ? value : OPTIONS[name][0]);

// Orden guardado (por documentId) sobre las categorías actuales: las que ya no existen se descartan
// y las nuevas se agregan al final en el orden predeterminado del catálogo.
function normalizeOrder(categories, order) {
  const known = categories.map(category => category.documentId);
  const saved = (Array.isArray(order) ? order : []).filter((id, index, list) => known.includes(id) && list.indexOf(id) === index);
  return [...saved, ...known.filter(id => !saved.includes(id))];
}

module.exports = ({ strapi }) => {
  const loadMain = () => strapi.documents(MAIN).findFirst({ fields: ['updatedAt', 'diseno_categorias', 'borradores_editor_inicio'] });

  const categoriesFor = area => strapi.documents(CATEGORY).findMany({
    status: 'published',
    filters: { seccion: area.seccion },
    fields: ['nombre', 'seccion'],
    populate: { portada: { fields: ['url', 'name', 'width', 'height'] } },
    sort: 'id:asc',
    limit: 200,
  });

  async function filesById(ids) {
    const unique = [...new Set(ids.filter(id => Number.isSafeInteger(id)))];
    if (!unique.length) return new Map();
    const files = await strapi.db.query(FILE).findMany({ where: { id: { $in: unique } }, select: ['id', 'url', 'name', 'width', 'height'] });
    return new Map(files.map(file => [file.id, file]));
  }

  function publishedState(main, key, categories) {
    const saved = main?.diseno_categorias?.[key] || {};
    return {
      orden: normalizeOrder(categories, saved.orden),
      forma: option('forma', saved.forma),
      boton: option('boton', saved.boton),
      estiloBoton: option('estiloBoton', saved.estiloBoton),
      portadas: Object.fromEntries(categories.map(category => [category.documentId, media(category.portada)])),
    };
  }

  function hydrateDraft(stored, categories, published, files) {
    if (!stored?.data) return null;
    const portadas = { ...published.portadas };
    for (const category of categories) {
      const fileId = stored.data.portadas?.[category.documentId];
      if (fileId != null && files.has(fileId)) portadas[category.documentId] = media(files.get(fileId));
    }
    return {
      orden: normalizeOrder(categories, stored.data.orden),
      forma: option('forma', stored.data.forma),
      boton: option('boton', stored.data.boton),
      estiloBoton: option('estiloBoton', stored.data.estiloBoton),
      portadas,
    };
  }

  async function overview() {
    const main = await loadMain();
    const drafts = main?.borradores_editor_inicio?.[DRAFT_KEY] || {};
    const files = await filesById(Object.values(drafts).flatMap(entry => Object.values(entry?.data?.portadas || {})));
    const areas = {};
    for (const [key, area] of Object.entries(AREAS)) {
      const categories = await categoriesFor(area);
      const published = publishedState(main, key, categories);
      areas[key] = {
        categorias: categories.map(category => ({ id: category.id, documentId: category.documentId, nombre: category.nombre })),
        published,
        draft: hydrateDraft(drafts[key], categories, published, files),
        draftSavedAt: drafts[key]?.savedAt || null,
      };
    }
    return { version: main?.updatedAt || null, exists: Boolean(main), areas };
  }

  async function mediaId(value) {
    const id = typeof value === 'object' && value !== null ? value.id : value;
    if (id == null || id === '') return null;
    if (!Number.isSafeInteger(Number(id)) || Number(id) < 1) fail('Imagen inválida.');
    const file = await strapi.db.query(FILE).findOne({ where: { id: Number(id) } });
    if (!file || !file.mime?.startsWith('image/') || file.mime === 'image/svg+xml') fail('Seleccioná una imagen JPG, PNG, WebP, GIF o AVIF de la biblioteca.');
    return Number(id);
  }

  async function clean(input, categories) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) fail('Datos inválidos.');
    const known = categories.map(category => category.documentId);
    if (input.orden != null && !Array.isArray(input.orden)) fail('Orden inválido.');
    const order = input.orden || [];
    if (order.some(id => typeof id !== 'string' || !known.includes(id))) fail('Las categorías de la sección cambiaron. Recargá el editor y volvé a ordenar.', 409);
    if (new Set(order).size !== order.length) fail('Hay categorías repetidas en el orden.');
    for (const name of Object.keys(OPTIONS)) {
      if (input[name] != null && !OPTIONS[name].includes(input[name])) fail('Opción de diseño inválida.');
    }
    if (input.portadas != null && (typeof input.portadas !== 'object' || Array.isArray(input.portadas))) fail('Imágenes inválidas.');
    const portadas = {};
    for (const [documentId, value] of Object.entries(input.portadas || {})) {
      if (!known.includes(documentId)) fail('Las categorías de la sección cambiaron. Recargá el editor.', 409);
      const fileId = await mediaId(value);
      if (fileId != null) portadas[documentId] = fileId;
    }
    return {
      orden: normalizeOrder(categories, order),
      forma: option('forma', input.forma),
      boton: option('boton', input.boton),
      estiloBoton: option('estiloBoton', input.estiloBoton),
      portadas,
    };
  }

  async function writeMain(main, data) {
    if (main) return strapi.documents(MAIN).update({ documentId: main.documentId, data });
    return strapi.documents(MAIN).create({ data: { secciones: [], ...data } });
  }

  // Cambia solo la portada, en la versión borrador y en la publicada de la categoría,
  // sin publicar otros cambios pendientes ni tocar el resto de sus campos.
  async function updateCover(documentId, fileId) {
    const rows = await strapi.db.query(CATEGORY).findMany({ where: { documentId }, select: ['id'] });
    for (const row of rows) await strapi.db.query(CATEGORY).update({ where: { id: row.id }, data: { portada: fileId } });
  }

  function checkVersion(main, version) {
    if ((main?.updatedAt || null) !== (version ?? null)) fail('Otro administrador modificó la Página de Inicio. Recargá antes de guardar.', 409);
  }

  return {
    overview,

    async save(areaKey, body = {}) {
      const area = areaFor(areaKey);
      const main = await loadMain();
      checkVersion(main, body.version);
      const categories = await categoriesFor(area);
      const data = await clean(body.data, categories);
      const stored = main?.borradores_editor_inicio || {};
      const drafts = { ...stored, [DRAFT_KEY]: { ...(stored[DRAFT_KEY] || {}) } };
      if (body.publish !== true) {
        drafts[DRAFT_KEY][areaKey] = { data, savedAt: new Date().toISOString() };
        await writeMain(main, { borradores_editor_inicio: drafts });
        return overview();
      }
      delete drafts[DRAFT_KEY][areaKey];
      const design = { ...(main?.diseno_categorias || {}), [areaKey]: { orden: data.orden, forma: data.forma, boton: data.boton, estiloBoton: data.estiloBoton } };
      const covers = categories.filter(category => data.portadas[category.documentId] != null && data.portadas[category.documentId] !== category.portada?.id);
      const run = async () => {
        await writeMain(main, { diseno_categorias: design, borradores_editor_inicio: drafts });
        for (const category of covers) await updateCover(category.documentId, data.portadas[category.documentId]);
      };
      if (typeof strapi.db.transaction === 'function') await strapi.db.transaction(run); else await run();
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

module.exports.OPTIONS = OPTIONS;
module.exports.normalizeOrder = normalizeOrder;
