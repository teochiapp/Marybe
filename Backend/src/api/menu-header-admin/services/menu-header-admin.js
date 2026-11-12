'use strict';

const ORDER = 'api::ordenamiento-menu-header.ordenamiento-menu-header';
const MENU = 'api::menu-lanzamientos-ofertas.menu-lanzamientos-ofertas';
const CATEGORY = 'api::categoria.categoria';
const PRODUCT = 'api::producto.producto';
const FIELDS = { perfumeria: 'categoriasPerfumeria', hogar: 'categoriasHogar', general: 'categoriasGeneral' };
const SPECIALS = ['ofertas', 'lanzamientos'];
const MENU_FONTS = ['', 'Inter', 'Brygada 1918', 'Montserrat', 'Raleway', 'Playfair Display', 'Cormorant Garamond', 'Arial', 'Georgia', 'Verdana'];
const AREAS = [...Object.keys(FIELDS), ...SPECIALS];
const populate = {
  ofertas: { populate: { columnas_categorias: { populate: { categorias: true } }, productos_destacados: { populate: { portada: true } } } },
  lanzamientos: { populate: { categorias: true, productos_destacados: { populate: { portada: true } } } },
};

function fail(message, status = 400) { const error = new Error(message); error.status = status; throw error; }
function areaFor(area) { if (!AREAS.includes(area)) fail('Área inválida.', 404); }
function ids(items) { return (items || []).map(item => item.documentId).filter(Boolean); }
function title(value) {
  if (typeof value !== 'string' || value.length > 160) fail('Título inválido.');
  return value;
}
function list(value) {
  if (!Array.isArray(value) || value.length > 200 || value.some(id => typeof id !== 'string') || new Set(value).size !== value.length) fail('Selección inválida o repetida.');
  return value;
}
function orderFor(categories, saved) {
  const names = new Set();
  const available = categories.filter(category => {
    const key = `${category.seccion || ''}\u0000${category.nombre}`;
    if (!category.nombre || names.has(key) || ['Ofertas', 'Lanzamientos'].includes(category.nombre)) return false;
    names.add(key);
    return true;
  }).map(category => `categoria:${category.documentId}`);
  const fallback = [...SPECIALS, ...available];
  const result = Array.isArray(saved) ? saved.filter((id, index) => fallback.includes(id) && saved.indexOf(id) === index) : [];
  return [...result, ...fallback.filter(id => !result.includes(id))];
}

module.exports = ({ strapi }) => {
  let queue = Promise.resolve();
  const exclusive = action => {
    const result = queue.then(action, action);
    queue = result.catch(() => {});
    return result;
  };
  const readOrder = () => strapi.documents(ORDER).findFirst({ populate: Object.fromEntries(Object.values(FIELDS).map(field => [field, { fields: ['nombre', 'seccion'] }])) });
  const readMenu = () => strapi.documents(MENU).findFirst({ populate });
  const versionOf = (order, menu) => JSON.stringify([order?.updatedAt || null, menu?.updatedAt || null]);
  const writeOrder = (order, data) => order
    ? strapi.documents(ORDER).update({ documentId: order.documentId, data })
    : strapi.documents(ORDER).create({ data });

  async function allCategories() {
    const result = [];
    for (let start = 0; ; start += 200) {
      const page = await strapi.documents(CATEGORY).findMany({ status: 'published', fields: ['nombre', 'seccion'], sort: 'id:asc', start, limit: 200 });
      result.push(...page);
      if (page.length < 200) return result;
    }
  }
  function contentState(menu, area) {
    const config = menu?.[area] || {};
    if (area === 'ofertas') return {
      mostrar_columna_descuentos: Boolean(config.mostrar_columna_descuentos),
      titulo_descuentos: config.titulo_descuentos || '',
      columnas_categorias: (config.columnas_categorias || []).map(column => ({ id: column.id, titulo_columna: column.titulo_columna || '', categorias: ids(column.categorias) })),
      titulo_destacados: config.titulo_destacados || '', productos_destacados: ids(config.productos_destacados),
    };
    return { titulo_categorias: config.titulo_categorias || '', categorias: ids(config.categorias), titulo_destacados: config.titulo_destacados || '', productos_destacados: ids(config.productos_destacados) };
  }
  async function overview() {
    const [order, menu, categorias] = await Promise.all([readOrder(), readMenu(), allCategories()]);
    const areas = {};
    for (const area of AREAS) {
      const published = FIELDS[area]
        ? { orden: orderFor(order?.[FIELDS[area]] || [], order?.ordenVisual?.[area]), ...(order?.ordenVisual?.estilos?.[area] ? { estilo: order.ordenVisual.estilos[area] } : {}), ...(area !== 'general' ? { ocultos: (order?.ordenVisual?.especialesOcultos?.[area] || []).filter(id => SPECIALS.includes(id)) } : {}) }
        : contentState(menu, area);
      const savedDraft = order?.borradoresMenu?.[area];
      let draft = savedDraft?.data || null;
      if (FIELDS[area] && draft && !draft.estilo && published.estilo) draft = { ...draft, estilo: published.estilo };
      if (FIELDS[area] && draft && !savedDraft.identidadPorSeccion && Array.isArray(draft.orden)) {
        const firstByName = new Map();
        const restored = [];
        for (const category of order?.[FIELDS[area]] || []) {
          if (!firstByName.has(category.nombre)) firstByName.set(category.nombre, category);
          else if (firstByName.get(category.nombre).seccion !== category.seccion && draft.orden.includes(`categoria:${firstByName.get(category.nombre).documentId}`) && !draft.orden.includes(`categoria:${category.documentId}`)) restored.push(`categoria:${category.documentId}`);
        }
        draft = { ...draft, orden: [...draft.orden, ...restored] };
      }
      areas[area] = { published, draft };
    }
    const referenced = [...new Set(SPECIALS.flatMap(area => [areas[area].published, areas[area].draft].filter(Boolean).flatMap(data => data.productos_destacados || [])))];
    const products = referenced.length ? await strapi.documents(PRODUCT).findMany({ status: 'published', filters: { documentId: { $in: referenced } }, fields: ['nombre', 'sku'], populate: { portada: { fields: ['url'] } }, limit: referenced.length }) : [];
    return { version: versionOf(order, menu), areas, categorias, products, menuCategories: Object.fromEntries(Object.entries(FIELDS).map(([key, field]) => [key, order?.[field] || []])) };
  }
  async function validateReferences(uid, selected) {
    if (!selected.length) return;
    const found = await strapi.documents(uid).findMany({ status: 'published', fields: ['documentId'], filters: { documentId: { $in: selected } }, limit: selected.length });
    if (found.length !== selected.length) fail('Una categoría o producto ya no está disponible. Recargá el editor.', 409);
  }
  async function clean(area, input, order, menu) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) fail('Datos inválidos.');
    if (FIELDS[area]) {
      const values = list(input.orden);
      if (SPECIALS.some(id => !values.includes(id)) || values.some(id => !SPECIALS.includes(id) && !id.startsWith('categoria:'))) fail('Las opciones del menú cambiaron. Recargá el editor.', 409);
      const existing = ids(order?.[FIELDS[area]]);
      const selectedIds = values.filter(id => id.startsWith('categoria:')).map(id => id.slice('categoria:'.length));
      const added = selectedIds.filter(id => !existing.includes(id));
      await validateReferences(CATEGORY, added);
      const categories = await allCategories();
      const byId = new Map([...categories, ...(order?.[FIELDS[area]] || [])].map(category => [category.documentId, category]));
      const selectedNames = new Set();
      for (const id of selectedIds) {
        const category = byId.get(id);
        const key = `${category?.seccion || ''}\u0000${category?.nombre}`;
        if (!category?.nombre || selectedNames.has(key) || ['Ofertas', 'Lanzamientos'].includes(category.nombre)) fail('Ya existe una opción del menú con ese nombre en la misma sección.');
        selectedNames.add(key);
      }
      const estilo = input.estilo;
      if (estilo !== undefined && (!estilo || typeof estilo !== 'object' || !MENU_FONTS.includes(estilo.fuente) || (estilo.color !== '' && !/^#[0-9a-f]{6}$/i.test(estilo.color)) || (estilo.tamanoPx != null && (!Number.isInteger(estilo.tamanoPx) || estilo.tamanoPx < 12 || estilo.tamanoPx > 24)))) fail('Tipografía, tamaño o color inválido.');
      if (area !== 'general') {
        const ocultos = input.ocultos === undefined ? [] : list(input.ocultos);
        if (ocultos.some(id => !SPECIALS.includes(id))) fail('Opciones ocultas inválidas.');
        return { orden: values, ocultos, ...(estilo ? { estilo } : {}) };
      }
      return { orden: values, ...(estilo ? { estilo } : {}) };
    }
    const productIds = list(input.productos_destacados);
    const data = { titulo_destacados: title(input.titulo_destacados), productos_destacados: productIds };
    const categoryIds = [];
    if (area === 'ofertas') {
      if (typeof input.mostrar_columna_descuentos !== 'boolean' || !Array.isArray(input.columnas_categorias) || input.columnas_categorias.length > 20) fail('Configuración de ofertas inválida.');
      const existingIds = new Set((menu?.ofertas?.columnas_categorias || []).map(column => column.id));
      const usedIds = new Set();
      data.mostrar_columna_descuentos = input.mostrar_columna_descuentos;
      data.titulo_descuentos = title(input.titulo_descuentos);
      data.columnas_categorias = input.columnas_categorias.map(column => {
        const categorias = list(column.categorias);
        categoryIds.push(...categorias);
        if (column.id != null && (!existingIds.has(column.id) || usedIds.has(column.id))) fail('Las columnas cambiaron. Recargá el editor.', 409);
        if (column.id != null) usedIds.add(column.id);
        return { ...(column.id != null ? { id: column.id } : {}), ...(typeof column.key === 'string' && column.key.length < 100 ? { key: column.key } : {}), titulo_columna: title(column.titulo_columna), categorias };
      });
    } else {
      data.titulo_categorias = title(input.titulo_categorias);
      data.categorias = list(input.categorias);
      categoryIds.push(...data.categorias);
    }
    await Promise.all([validateReferences(CATEGORY, [...new Set(categoryIds)]), validateReferences(PRODUCT, productIds)]);
    return data;
  }
  async function commit(area, body, discard = false) {
    areaFor(area);
    return exclusive(async () => {
      await strapi.db.transaction(async ({ trx }) => {
        await trx(strapi.db.metadata.get(ORDER).tableName).select('id').forUpdate();
        await trx(strapi.db.metadata.get(MENU).tableName).select('id').forUpdate();
        const [order, menu] = await Promise.all([readOrder(), readMenu()]);
        if (versionOf(order, menu) !== body.version) fail('Otro administrador modificó el menú. Recargá el editor.', 409);
        const drafts = { ...(order?.borradoresMenu || {}) };
        const data = discard ? null : await clean(area, body.data, order, menu);
        const currentIds = FIELDS[area] ? ids(order?.[FIELDS[area]]) : [];
        const draftBase = drafts[area]?.baseCategorias;
        if (!discard && Array.isArray(draftBase) && JSON.stringify(draftBase) !== JSON.stringify(currentIds)) fail('Las categorías del menú cambiaron desde que se guardó el borrador. Descartalo y volvé a editar.', 409);
        if (discard || body.publish === true) delete drafts[area];
        else drafts[area] = { data, savedAt: new Date().toISOString(), ...(FIELDS[area] ? { baseCategorias: currentIds, identidadPorSeccion: true } : {}) };
        if (!discard && body.publish === true && !FIELDS[area]) {
          const component = { ...(menu?.[area]?.id ? { id: menu[area].id } : {}), ...data };
          if (area === 'ofertas') component.columnas_categorias = data.columnas_categorias.map(column => {
            const saved = { ...column };
            delete saved.key;
            return saved;
          });
          if (menu) await strapi.documents(MENU).update({ documentId: menu.documentId, data: { [area]: component } });
          else await strapi.documents(MENU).create({ data: { [area]: component } });
        }
        let visual = order?.ordenVisual;
        let relations = {};
        if (!discard && body.publish === true && FIELDS[area]) {
          const currentCategories = order?.[FIELDS[area]] || [];
          const selected = data.orden.filter(id => id.startsWith('categoria:')).map(id => id.slice('categoria:'.length));
          const added = selected.filter(id => !currentIds.includes(id));
          const visible = orderFor(currentCategories, null).filter(id => id.startsWith('categoria:')).map(id => id.slice('categoria:'.length));
          const visibleByName = new Map(currentCategories.filter(category => visible.includes(category.documentId)).map(category => [`${category.seccion || ''}\u0000${category.nombre}`, category.documentId]));
          const retained = currentCategories.filter(category => selected.includes(category.documentId) || (!visible.includes(category.documentId) && selected.includes(visibleByName.get(`${category.seccion || ''}\u0000${category.nombre}`)))).map(category => category.documentId);
          const nextRelations = [...retained, ...added];
          if (JSON.stringify(currentIds) !== JSON.stringify(nextRelations)) relations = { [FIELDS[area]]: nextRelations };
          const previousAdded = visual?.categoriasAgregadas || {};
          const previousIds = Array.isArray(previousAdded[area]) ? previousAdded[area] : [];
          visual = { ...(visual || {}), [area]: data.orden, categoriasAgregadas: { ...previousAdded, [area]: [...new Set([...previousIds.filter(id => selected.includes(id)), ...added])] } };
          if (data.estilo) visual.estilos = { ...(visual.estilos || {}), [area]: data.estilo };
          if (area !== 'general') visual.especialesOcultos = { ...(visual.especialesOcultos || {}), [area]: data.ocultos };
        }
        await writeOrder(order, { borradoresMenu: drafts, ...(visual != null ? { ordenVisual: visual } : {}), ...relations });
      });
      return overview();
    });
  }
  return {
    overview,
    async products(query = {}) {
      const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
      const q = String(query.q || '').trim().slice(0, 80);
      const filters = q ? { $or: [{ nombre: { $containsi: q } }, { sku: { $containsi: q } }] } : {};
      const [items, total] = await Promise.all([
        strapi.documents(PRODUCT).findMany({ status: 'published', filters, fields: ['nombre', 'sku'], populate: { portada: { fields: ['url'] } }, sort: 'nombre:asc', start: (page - 1) * 30, limit: 30 }),
        strapi.documents(PRODUCT).count({ status: 'published', filters }),
      ]);
      return { items, total, page };
    },
    save: (area, body = {}) => commit(area, body),
    discard: (area, version) => commit(area, { version }, true),
  };
};

module.exports.orderFor = orderFor;
