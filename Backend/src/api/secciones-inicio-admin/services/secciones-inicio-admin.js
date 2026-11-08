'use strict';

const MAIN = 'api::seccion-principal.seccion-principal';

const AREAS = { perfumeria: 'Perfumería', hogar: 'Hogar' };
// Secciones de Inicio sin modelo propio: el editor cambia el título, su tipografía y opciones visuales simples.
const SECTIONS = {
  ofertas: { label: 'Ofertas', defaultTitle: 'Disfrutá de las mejores ofertas' },
};
// Opciones predefinidas (sin valores libres). El primer valor de cada grupo es el diseño original de la sección.
// Los colores y fondos son variables de la paleta de la tienda.
const OPTIONS = {
  fuente: ['secundaria', 'principal'],
  tamano: ['grande', 'chico', 'mediano', 'muy-grande'],
  peso: ['semibold', 'normal', 'bold'],
  alineacion: ['izquierda', 'centro', 'derecha'],
  color: ['original', 'bordo-secundario', 'bordo-tercero', 'marron-principal', 'marron-cuarto', 'hogar'],
  fondo: ['blanco', 'arena', 'rosado'],
  espaciado: ['original', 'compacto', 'amplio'],
};
const MAX_TITLE = 80;

function fail(message, status = 400) { const error = new Error(message); error.status = status; throw error; }
function sectionFor(key) {
  const section = Object.prototype.hasOwnProperty.call(SECTIONS, key) ? SECTIONS[key] : null;
  if (!section) fail('Sección inválida.', 404);
  return section;
}
function checkArea(key) { if (!Object.prototype.hasOwnProperty.call(AREAS, key)) fail('Área inválida.', 404); }
const option = (name, value) => (OPTIONS[name].includes(value) ? value : OPTIONS[name][0]);
const options = value => Object.fromEntries(Object.keys(OPTIONS).map(name => [name, option(name, value[name])]));

// Configuración completa a partir de lo guardado: lo que falte o sea inválido vuelve al diseño original.
function normalize(saved, section) {
  const value = saved && typeof saved === 'object' ? saved : {};
  return {
    titulo: typeof value.titulo === 'string' && value.titulo.trim() ? value.titulo.trim().slice(0, MAX_TITLE) : section.defaultTitle,
    ...options(value),
  };
}

function clean(input, publish) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) fail('Datos inválidos.');
  if (input.titulo != null && typeof input.titulo !== 'string') fail('Título inválido.');
  const titulo = (input.titulo || '').trim();
  if (titulo.length > MAX_TITLE) fail(`El título admite hasta ${MAX_TITLE} caracteres.`);
  if (publish && !titulo) fail('Escribí el título de la sección.');
  for (const name of Object.keys(OPTIONS)) {
    if (input[name] != null && !OPTIONS[name].includes(input[name])) fail('Opción de diseño inválida.');
  }
  return { titulo, ...options(input) };
}

module.exports = ({ strapi }) => {
  const loadMain = () => strapi.documents(MAIN).findFirst({ fields: ['updatedAt', 'diseno_secciones', 'borradores_editor_inicio'] });

  async function overview(sectionKey) {
    const section = sectionFor(sectionKey);
    const main = await loadMain();
    const drafts = main?.borradores_editor_inicio?.[sectionKey] || {};
    const areas = {};
    for (const key of Object.keys(AREAS)) {
      const stored = drafts[key];
      areas[key] = {
        published: normalize(main?.diseno_secciones?.[sectionKey]?.[key], section),
        draft: stored?.data ? { ...normalize(stored.data, section), titulo: typeof stored.data.titulo === 'string' ? stored.data.titulo : section.defaultTitle } : null,
        draftSavedAt: stored?.savedAt || null,
      };
    }
    return { version: main?.updatedAt || null, exists: Boolean(main), defaultTitle: section.defaultTitle, areas };
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

    async save(sectionKey, areaKey, body = {}) {
      sectionFor(sectionKey);
      checkArea(areaKey);
      const main = await loadMain();
      checkVersion(main, body.version);
      const data = clean(body.data, body.publish === true);
      const stored = main?.borradores_editor_inicio || {};
      const drafts = { ...stored, [sectionKey]: { ...(stored[sectionKey] || {}) } };
      if (body.publish !== true) {
        drafts[sectionKey][areaKey] = { data, savedAt: new Date().toISOString() };
        await writeMain(main, { borradores_editor_inicio: drafts });
        return overview(sectionKey);
      }
      delete drafts[sectionKey][areaKey];
      const current = main?.diseno_secciones || {};
      const design = { ...current, [sectionKey]: { ...(current[sectionKey] || {}), [areaKey]: data } };
      await writeMain(main, { diseno_secciones: design, borradores_editor_inicio: drafts });
      return overview(sectionKey);
    },

    async discard(sectionKey, areaKey, body = {}) {
      sectionFor(sectionKey);
      checkArea(areaKey);
      const main = await loadMain();
      checkVersion(main, body.version);
      const stored = main?.borradores_editor_inicio || {};
      if (!stored[sectionKey]?.[areaKey]) return overview(sectionKey);
      const section = { ...stored[sectionKey] };
      delete section[areaKey];
      await writeMain(main, { borradores_editor_inicio: { ...stored, [sectionKey]: section } });
      return overview(sectionKey);
    },
  };
};

module.exports.SECTIONS = SECTIONS;
module.exports.OPTIONS = OPTIONS;
module.exports.normalize = normalize;
