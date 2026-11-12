'use strict';

const PROMO = 'api::promociones-inicio.promociones-inicio';
const MAIN = 'api::seccion-principal.seccion-principal';
const ROW_TYPES = ['layout.fila-1-columna', 'layout.fila-2-columnas', 'layout.fila-4-columnas', 'layout.fila-mixta'];
const SLOTS = ['featured_perfumeria', 'featured_hogar', 'descuento_perfumeria', 'descuento_hogar', 'categoria_0', 'categoria_1', 'gift_perfumeria', 'gift_hogar', 'whatsapp'];
const MEDIA = ['imagen_desktop', 'imagen_tablet', 'imagen_mobile'];
const populate = { Filas: { on: Object.fromEntries(ROW_TYPES.map(type => [type, { populate: { banners: { populate: MEDIA } } }])) } };
const mainPopulate = { secciones: { populate: ['imagen_desktop', 'imagen_mobile'] }, categorias_destacadas: { populate: ['imagen'] }, descuento_perfumeria: { populate: ['imagen_destacada'] }, descuento_hogar: { populate: ['imagen_destacada'] } };
const bounds = { height: [0, 1600], width: [10, 100], radius: [0, 160], padding: [0, 160], gap: [0, 100], columns: [1, 4], maxWidth: [320, 2560], margin: [0, 200], positionX: [0, 100], positionY: [0, 100], imageScale: [25, 200], textX: [0, 90], textY: [5, 95], textWidth: [10, 100], fontSize: [12, 150], subtitleSize: [10, 60], buttonSize: [10, 40], buttonRadius: [0, 100], fontWeight: [300, 900], lineHeight: [.8, 2], letterSpacing: [-2, 8], overlay: [0, 1] };
const colorKeys = ['background', 'color', 'buttonBackground', 'buttonColor'];
function fail(message, status = 400) { const error = new Error(message); error.status = status; throw error; }
function text(value, max = 500) { if (value == null) return ''; if (typeof value !== 'string' || value.length > max) fail('Texto demasiado largo o inválido.'); return value; }
function safeUrl(value) {
  const url = text(value, 2048).trim();
  if (/[\\\u0000-\u001f]/.test(url)) fail('URL inválida.');
  if (url && !(/^\/(?!\/)/.test(url) || /^https?:\/\//i.test(url))) fail('Usá una URL http(s) o una ruta interna que empiece con /.');
  return url;
}
function design(input) {
  if (input == null) return {};
  if (typeof input !== 'object' || Array.isArray(input)) fail('Diseño inválido.');
  const result = {};
  for (const device of ['desktop', 'tablet', 'mobile']) {
    if (!input[device]) continue;
    const source = input[device]; const target = {};
    if (typeof source !== 'object' || Array.isArray(source)) fail('Configuración de dispositivo inválida.');
    for (const [key, range] of Object.entries(bounds)) {
      if (source[key] == null || source[key] === '') continue;
      const value = Number(source[key]);
      if (!Number.isFinite(value) || value < range[0] || value > range[1] || (key === 'columns' && !Number.isInteger(value))) fail(`Valor inválido: ${key}.`);
      target[key] = value;
    }
    for (const key of colorKeys) if (source[key] != null) {
      if (!/^#[0-9a-f]{6}$/i.test(source[key])) fail('Color inválido.');
      target[key] = source[key];
    }
    if (source.fit != null) { if (!['cover', 'contain', 'fill'].includes(source.fit)) fail('Ajuste de imagen inválido.'); target.fit = source.fit; }
    if (source.align != null) { if (!['left', 'center', 'right'].includes(source.align)) fail('Alineación inválida.'); target.align = source.align; }
    if (source.fontFamily != null) { if (!['Inter', 'Brygada 1918', 'Arial', 'Georgia'].includes(source.fontFamily)) fail('Tipografía inválida.'); target.fontFamily = source.fontFamily; }
    if (source.hidden != null) target.hidden = source.hidden === true;
    result[device] = target;
  }
  return result;
}
function carouselSettings(input) {
  if (input == null) return null;
  if (typeof input !== 'object' || Array.isArray(input)) fail('Configuración del carrusel inválida.');
  if (typeof input.autoplay !== 'boolean' || !Number.isInteger(input.intervalo) || input.intervalo < 1 || input.intervalo > 60 || !['ninguno', 'puntos', 'contador'].includes(input.indicador) || typeof input.vistaParcial !== 'boolean') fail('Opciones del carrusel inválidas.');
  return { autoplay: input.autoplay, intervalo: input.intervalo, indicador: input.indicador, vistaParcial: input.vistaParcial };
}
async function mediaId(value, strapi) {
  const id = typeof value === 'object' ? value?.id || value?.data?.id : value;
  if (id == null) return null;
  if (!Number.isSafeInteger(Number(id)) || Number(id) < 1) fail('Imagen inválida.');
  const file = await strapi.db.query('plugin::upload.file').findOne({ where: { id: Number(id) } });
  if (!file || !(file.mime?.startsWith('image/') || ['video/mp4', 'video/webm'].includes(file.mime))) fail('Seleccioná una imagen o un video MP4 o WebM de la biblioteca.');
  return Number(id);
}
async function cleanBanner(input, strapi, slot = false) {
  const output = {
    titulo: text(input.titulo, 200), subtitulo: text(input.subtitulo, 2000), texto_boton: text(input.texto_boton, 100),
    enlace: safeUrl(input.enlace), mostrar_texto: input.mostrar_texto === true, activo: input.activo !== false,
    ancho_porcentaje: Math.max(1, Math.min(100, Math.round(Number(input.ancho_porcentaje) || 100))), diseno: design(input.diseno),
  };
  if (slot) {
    for (const key of MEDIA) {
      const image = input[key];
      const raw = typeof image === 'string' ? image : image?.url || image?.data?.attributes?.url || '';
      output[key] = { url: safeUrl(raw) };
    }
  } else {
    for (const key of MEDIA) output[key] = await mediaId(input[key], strapi);
    if (!output.imagen_desktop) fail('Cada banner necesita una imagen o video para PC.');
  }
  return output;
}
module.exports = ({ strapi }) => ({
  async list() {
    const promotions = [];
    for (let start = 0; ; start += 100) {
      const page = await strapi.documents(PROMO).findMany({ status: 'draft', populate, sort: 'id:asc', start, limit: 100 });
      promotions.push(...page);
      if (page.length < 100) break;
    }
    return { promotions };
  },
  async publicSlots() {
    const main = await strapi.documents(MAIN).findFirst({ fields: ['banners_visuales'] });
    return main?.banners_visuales?.published || {};
  },
  async savePromotion(documentId, body) {
    const current = documentId === 'new' ? null : await strapi.documents(PROMO).findOne({ documentId, status: 'draft', populate });
    if (documentId !== 'new' && !current) fail('El grupo de banners no existe.', 404);
    if (current && current.updatedAt !== body.version) fail('Otro administrador modificó estos banners. Recargá antes de guardar.', 409);
    const input = body.data;
    if (!input || !['Perfumería', 'Hogar'].includes(input.seccion)) fail('Sección inválida.');
    if (!input.titulo?.trim()) fail('Ingresá un nombre para el grupo.');
    if (!Array.isArray(input.Filas) || !input.Filas.length || input.Filas.length > 30) fail('Cada grupo necesita entre 1 y 30 filas.');
    const Filas = [];
    for (const row of input.Filas) {
      if (!ROW_TYPES.includes(row.__component)) fail('Tipo de fila inválido.');
      if (!Array.isArray(row.banners) || !row.banners.length || row.banners.length > 30) fail('Cada fila necesita entre 1 y 30 banners.');
      const existingRow = current?.Filas?.find(r => r.id === row.id && r.__component === row.__component);
      const banners = [];
      for (const banner of row.banners) {
        const clean = await cleanBanner(banner, strapi);
        const existing = existingRow?.banners?.find(b => b.id === banner.id);
        banners.push({ ...(existing ? { id: existing.id } : {}), ...clean });
      }
      Filas.push({ ...(existingRow ? { id: existingRow.id } : {}), __component: row.__component, es_carrusel: row.es_carrusel === true, diseno: design(row.diseno), config_carrusel: carouselSettings(row.config_carrusel), banners });
    }
    const data = { titulo: text(input.titulo, 200), seccion: input.seccion, Filas };
    const saved = current ? await strapi.documents(PROMO).update({ documentId, data }) : await strapi.documents(PROMO).create({ data });
    if (body.publish === true) await strapi.documents(PROMO).publish({ documentId: saved.documentId });
    return strapi.documents(PROMO).findOne({ documentId: saved.documentId, status: 'draft', populate });
  },
  async deletePromotion(documentId, body = {}) {
    const current = await strapi.documents(PROMO).findOne({ documentId, status: 'draft', populate });
    if (!current) fail('La sección de banners no existe.', 404);
    if (current.updatedAt !== body.version) fail('Otro administrador modificó estos banners. Recargá antes de eliminar.', 409);
    await strapi.documents(PROMO).delete({ documentId });
    return { documentId };
  },
  async saveSlots(body) {
    const current = await strapi.documents(MAIN).findFirst();
    if (!current) fail('Primero configurá la Página de Inicio en Strapi.', 404);
    if (current.updatedAt !== body.version) fail('La página fue modificada por otro administrador. Recargá antes de guardar.', 409);
    const input = body.data;
    if (!input || typeof input !== 'object' || Array.isArray(input)) fail('Piezas visuales inválidas.');
    const draft = {};
    for (const [key, value] of Object.entries(input)) {
      if (!SLOTS.includes(key)) fail('Ubicación de banner inválida.');
      if (value != null) draft[key] = await cleanBanner(value, strapi, true);
    }
    const previous = current.banners_visuales || {};
    let published = previous.published || {};
    if (body.publish === true) {
      if (body.slot) {
        if (!SLOTS.includes(body.slot)) fail('Ubicación de publicación inválida.');
        published = { ...published };
        if (draft[body.slot]) published[body.slot] = draft[body.slot]; else delete published[body.slot];
      } else published = draft;
    }
    await strapi.documents(MAIN).update({ documentId: current.documentId, data: { banners_visuales: { draft, published } } });
    return strapi.documents(MAIN).findFirst({ populate: mainPopulate });
  },
});
module.exports.design = design;
module.exports.safeUrl = safeUrl;
