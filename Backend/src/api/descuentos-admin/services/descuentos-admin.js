'use strict';

const { safeUrl } = require('../../banners-admin/services/banners-admin');

const MAIN = 'api::seccion-principal.seccion-principal';
const CATEGORY = 'api::categoria.categoria';
const PRODUCT = 'api::producto.producto';
const FILE = 'plugin::upload.file';

const SECTION_KEY = 'descuentos';
// Identificadores estables de los dos bloques. `field` es el componente inicio.descuentos que hoy
// alimenta cada bloque y sirve de valor predeterminado mientras no haya configuración guardada.
const BLOQUES = {
  'bloque-1': { label: 'Bloque 1', field: 'descuento_perfumeria', titleNormal: 'de Miércoles' },
  'bloque-2': { label: 'Bloque 2', field: 'descuento_hogar', titleNormal: 'de Hogar' },
};
// Tipos de contenido promocionables. Solo las categorías son un modelo de Strapi; marca y proveedor
// son campos de texto de producto, por eso su identificador es el propio valor.
const TIPOS = ['categoria', 'marca', 'proveedor'];
const MODOS = ['auto', 'personalizado'];
const POSICIONES_IMAGEN = ['centro', 'arriba', 'abajo', 'izquierda', 'derecha'];
const AJUSTES_IMAGEN = ['contener', 'cubrir'];
const SCALE_MIN = 30;
const SCALE_MAX = 200;
const DEFAULTS = { texto_superior: 'Envíos a todo el país', titulo_cursiva: 'Descuentos', boton_texto: 'Conocer más' };
const PAGE_SCAN = 1000;

function fail(message, status = 400) { const error = new Error(message); error.status = status; throw error; }
function bloqueFor(key) {
  const bloque = Object.prototype.hasOwnProperty.call(BLOQUES, key) ? BLOQUES[key] : null;
  if (!bloque) fail('Bloque inválido.', 404);
  return bloque;
}
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
const normalizeScale = value => {
  if (value == null || value === '') return null;
  const number = Number(value);
  return Number.isInteger(number) && number >= SCALE_MIN && number <= SCALE_MAX && number !== 100 ? number : null;
};
const isDocumentId = value => typeof value === 'string' && /^[a-z0-9]{1,64}$/i.test(value);
const media = file => (file?.id ? { id: file.id, url: file.url, name: file.name, width: file.width, height: file.height } : null);

const emptyData = bloque => ({
  entidad_tipo: '',
  entidad_id: '',
  entidad_nombre: '',
  entidad_seccion: '',
  texto_superior: DEFAULTS.texto_superior,
  titulo_cursiva: DEFAULTS.titulo_cursiva,
  titulo_normal: bloque.titleNormal,
  color_titulo_cursiva: '',
  color_titulo_normal: '',
  imagen: null,
  imagen_mobile: null,
  escala_imagen_desktop: null,
  escala_imagen_mobile: null,
  imagen_posicion: 'centro',
  imagen_ajuste: 'contener',
  imagen_sombra: true,
  boton_texto: DEFAULTS.boton_texto,
  boton_modo: 'auto',
  boton_enlace: '',
});

// Configuración completa a partir de lo guardado: lo que falte o sea inválido vuelve al valor predeterminado.
function normalize(saved, bloque, fallback = emptyData(bloque)) {
  const value = saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
  const str = (name, max) => (typeof value[name] === 'string' ? value[name].slice(0, max) : fallback[name]);
  const tipo = TIPOS.includes(value.entidad_tipo) && typeof value.entidad_id === 'string' && value.entidad_id ? value.entidad_tipo : '';
  const hex = name => (/^#[0-9a-f]{6}$/i.test(value[name] || '') ? value[name].toUpperCase() : (value[name] === '' ? '' : fallback[name]));
  const image = value.imagen && typeof value.imagen === 'object' && Number.isSafeInteger(Number(value.imagen.id)) ? media(value.imagen) : fallback.imagen;
  const imageMobile = value.imagen_mobile && typeof value.imagen_mobile === 'object' && Number.isSafeInteger(Number(value.imagen_mobile.id)) ? media(value.imagen_mobile) : fallback.imagen_mobile;
  const modo = MODOS.includes(value.boton_modo) ? value.boton_modo : fallback.boton_modo;
  return {
    entidad_tipo: tipo,
    entidad_id: tipo ? value.entidad_id : '',
    entidad_nombre: tipo && typeof value.entidad_nombre === 'string' ? value.entidad_nombre.slice(0, 200) : '',
    entidad_seccion: tipo && typeof value.entidad_seccion === 'string' ? value.entidad_seccion.slice(0, 40) : '',
    texto_superior: str('texto_superior', 120),
    titulo_cursiva: str('titulo_cursiva', 120),
    titulo_normal: str('titulo_normal', 120),
    color_titulo_cursiva: hex('color_titulo_cursiva'),
    color_titulo_normal: hex('color_titulo_normal'),
    imagen: value.imagen === null ? null : image,
    imagen_mobile: value.imagen_mobile === null ? null : imageMobile,
    escala_imagen_desktop: normalizeScale(value.escala_imagen_desktop ?? fallback.escala_imagen_desktop),
    escala_imagen_mobile: normalizeScale(value.escala_imagen_mobile ?? fallback.escala_imagen_mobile),
    imagen_posicion: POSICIONES_IMAGEN.includes(value.imagen_posicion) ? value.imagen_posicion : fallback.imagen_posicion,
    imagen_ajuste: AJUSTES_IMAGEN.includes(value.imagen_ajuste) ? value.imagen_ajuste : fallback.imagen_ajuste,
    imagen_sombra: typeof value.imagen_sombra === 'boolean' ? value.imagen_sombra : fallback.imagen_sombra,
    boton_texto: str('boton_texto', 60),
    boton_modo: modo,
    boton_enlace: typeof value.boton_enlace === 'string' ? value.boton_enlace.slice(0, 2048) : fallback.boton_enlace,
  };
}

module.exports = ({ strapi }) => {
  const populate = Object.fromEntries(Object.values(BLOQUES).map(bloque => [bloque.field, { populate: ['imagen_destacada'] }]));
  const loadMain = () => strapi.documents(MAIN).findFirst({ fields: ['updatedAt', 'diseno_secciones', 'borradores_editor_inicio', 'banners_visuales'], populate });

  // Valor predeterminado de cada bloque: lo que hoy muestra la landing (componente de Strapi o texto original).
  function legacyData(main, bloque) {
    const base = emptyData(bloque);
    const component = main?.[bloque.field];
    if (!component) return base;
    return {
      ...base,
      titulo_cursiva: component.titulo_cursiva || base.titulo_cursiva,
      titulo_normal: component.titulo_normal || base.titulo_normal,
      color_titulo_cursiva: component.color_titulo_cursiva || '',
      color_titulo_normal: component.color_titulo_normal || '',
      imagen: media(component.imagen_destacada),
    };
  }

  const publishedData = (main, key, bloque) => normalize(main?.diseno_secciones?.[SECTION_KEY]?.[key], bloque, legacyData(main, bloque));

  async function overview() {
    const main = await loadMain();
    const drafts = main?.borradores_editor_inicio?.[SECTION_KEY] || {};
    const areas = {};
    for (const [key, bloque] of Object.entries(BLOQUES)) {
      const stored = drafts[key];
      areas[key] = {
        published: publishedData(main, key, bloque),
        draft: stored?.data ? normalize(stored.data, bloque, publishedData(main, key, bloque)) : null,
        draftSavedAt: stored?.savedAt || null,
      };
    }
    return { version: main?.updatedAt || null, exists: Boolean(main), defaults: DEFAULTS, tipos: TIPOS, areas };
  }

  // Entidades promocionables y cuántos productos publicados las usan (un solo recorrido del catálogo).
  async function entities() {
    const categories = await strapi.documents(CATEGORY).findMany({ status: 'published', fields: ['nombre', 'seccion'], populate: { portada: { fields: ['url', 'width', 'height', 'name'] } }, sort: ['seccion:asc', 'nombre:asc'], limit: 1000 });
    const perCategory = new Map();
    const brands = new Map();
    const suppliers = new Map();
    const bump = (map, key) => { if (key) map.set(key, (map.get(key) || 0) + 1); };
    for (let start = 0; ; start += PAGE_SCAN) {
      const page = await strapi.documents(PRODUCT).findMany({ status: 'published', fields: ['marca', 'proveedor'], populate: { categoria: { fields: ['documentId'] } }, filters: { publicado: true }, sort: 'id:asc', start, limit: PAGE_SCAN });
      page.forEach(product => {
        bump(perCategory, product.categoria?.documentId);
        bump(brands, typeof product.marca === 'string' ? product.marca.trim() : '');
        bump(suppliers, typeof product.proveedor === 'string' ? product.proveedor.trim() : '');
      });
      if (page.length < PAGE_SCAN) break;
    }
    const byName = map => [...map.entries()].map(([nombre, productos]) => ({ nombre, productos })).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    return {
      categoria: categories.map(category => ({ documentId: category.documentId, nombre: category.nombre, seccion: category.seccion || '', productos: perCategory.get(category.documentId) || 0, portada: media(category.portada) })),
      marca: byName(brands),
      proveedor: byName(suppliers),
    };
  }

  async function resolveEntity(tipo, id) {
    if (tipo === 'categoria') {
      if (!isDocumentId(id)) fail('Categoría inválida.');
      const found = await strapi.documents(CATEGORY).findOne({ documentId: id, status: 'published', fields: ['nombre', 'seccion'] });
      if (!found) fail('La categoría elegida ya no existe o no está publicada. Elegí otra.');
      return { entidad_nombre: found.nombre, entidad_seccion: found.seccion || '' };
    }
    const field = tipo === 'marca' ? 'marca' : 'proveedor';
    const name = text(id, 200).trim();
    if (!name) fail(`${tipo === 'marca' ? 'Marca' : 'Proveedor'} inválido.`);
    const count = await strapi.documents(PRODUCT).count({ status: 'published', filters: { publicado: true, [field]: { $eq: name } } });
    if (!count) fail(`${tipo === 'marca' ? 'La marca' : 'El proveedor'} elegido no tiene productos publicados. Elegí otro.`);
    return { entidad_nombre: name, entidad_seccion: '' };
  }

  async function cleanImage(value) {
    if (value == null || value === '') return null;
    const id = typeof value === 'object' ? value.id : value;
    if (!Number.isSafeInteger(Number(id)) || Number(id) < 1) fail('Imagen inválida.');
    const file = await strapi.db.query(FILE).findOne({ where: { id: Number(id) } });
    if (!file || !file.mime?.startsWith('image/') || file.mime === 'image/svg+xml') fail('Seleccioná una imagen JPG, PNG, WebP, GIF o AVIF de la biblioteca.');
    // La URL y las medidas salen siempre del archivo real, nunca del cliente.
    return media(file);
  }

  async function clean(input, strict) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) fail('Datos inválidos.');
    const tipo = input.entidad_tipo == null ? '' : input.entidad_tipo;
    if (tipo !== '' && !TIPOS.includes(tipo)) fail('Tipo de contenido inválido.');
    const id = input.entidad_id == null ? '' : input.entidad_id;
    if (tipo && (typeof id !== 'string' || !id.trim())) fail('Elegí qué querés promocionar.');
    const entity = tipo ? await resolveEntity(tipo, id) : { entidad_nombre: '', entidad_seccion: '' };
    const modo = input.boton_modo == null ? 'auto' : input.boton_modo;
    if (!MODOS.includes(modo)) fail('Modo de enlace inválido.');
    const enlace = safeUrl(input.boton_enlace == null ? '' : input.boton_enlace);
    if (modo === 'personalizado' && strict && !enlace) fail('Escribí el enlace del botón o volvé al enlace automático.');
    const posicion = input.imagen_posicion == null ? 'centro' : input.imagen_posicion;
    if (!POSICIONES_IMAGEN.includes(posicion)) fail('Posición de imagen inválida.');
    const ajuste = input.imagen_ajuste == null ? 'contener' : input.imagen_ajuste;
    if (!AJUSTES_IMAGEN.includes(ajuste)) fail('Ajuste de imagen inválido.');
    if (input.imagen_sombra != null && typeof input.imagen_sombra !== 'boolean') fail('Opción de sombra inválida.');
    const data = {
      entidad_tipo: tipo,
      entidad_id: tipo ? (tipo === 'categoria' ? id : entity.entidad_nombre) : '',
      ...entity,
      texto_superior: text(input.texto_superior, 120),
      titulo_cursiva: text(input.titulo_cursiva, 120),
      titulo_normal: text(input.titulo_normal, 120),
      color_titulo_cursiva: color(input.color_titulo_cursiva),
      color_titulo_normal: color(input.color_titulo_normal),
      imagen: await cleanImage(input.imagen),
      imagen_mobile: await cleanImage(input.imagen_mobile),
      escala_imagen_desktop: scale(input.escala_imagen_desktop),
      escala_imagen_mobile: scale(input.escala_imagen_mobile),
      imagen_posicion: posicion,
      imagen_ajuste: ajuste,
      imagen_sombra: input.imagen_sombra !== false,
      boton_texto: text(input.boton_texto, 60),
      boton_modo: modo,
      boton_enlace: enlace,
    };
    if (strict && !data.titulo_cursiva.trim() && !data.titulo_normal.trim()) fail('Escribí el título del bloque antes de publicar.');
    return data;
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
    entities,

    async save(areaKey, body = {}) {
      const bloque = bloqueFor(areaKey);
      const main = await loadMain();
      checkVersion(main, body.version);
      const publish = body.publish === true;
      const data = await clean(body.data, publish);
      const stored = main?.borradores_editor_inicio || {};
      const drafts = { ...stored, [SECTION_KEY]: { ...(stored[SECTION_KEY] || {}) } };
      if (!publish) {
        drafts[SECTION_KEY][areaKey] = { data, savedAt: new Date().toISOString() };
        await writeMain(main, { borradores_editor_inicio: drafts });
        return overview();
      }
      delete drafts[SECTION_KEY][areaKey];
      const current = main?.diseno_secciones || {};
      const design = { ...current, [SECTION_KEY]: { ...(current[SECTION_KEY] || {}), [areaKey]: data } };
      const update = { diseno_secciones: design, borradores_editor_inicio: drafts };
      if (main?.banners_visuales?.published?.[bloque.field] || main?.banners_visuales?.draft?.[bloque.field]) {
        const draftBanners = { ...(main.banners_visuales?.draft || {}) };
        const publishedBanners = { ...(main.banners_visuales?.published || {}) };
        delete draftBanners[bloque.field];
        delete publishedBanners[bloque.field];
        update.banners_visuales = { ...main.banners_visuales, draft: draftBanners, published: publishedBanners };
      }
      await writeMain(main, update);
      return overview();
    },

    async discard(areaKey, body = {}) {
      bloqueFor(areaKey);
      const main = await loadMain();
      checkVersion(main, body.version);
      const stored = main?.borradores_editor_inicio || {};
      if (!stored[SECTION_KEY]?.[areaKey]) return overview();
      const section = { ...stored[SECTION_KEY] };
      delete section[areaKey];
      await writeMain(main, { borradores_editor_inicio: { ...stored, [SECTION_KEY]: section } });
      return overview();
    },
  };
};

module.exports.BLOQUES = BLOQUES;
module.exports.TIPOS = TIPOS;
module.exports.DEFAULTS = DEFAULTS;
module.exports.normalize = normalize;
