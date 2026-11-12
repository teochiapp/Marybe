'use strict';

const HISTORIA_UID = 'api::pagina-historia.pagina-historia';
const ENCUADRES_VALIDOS = new Set(['centro', 'arriba', 'abajo', 'izquierda', 'derecha']);

const MEDIA_FIELDS = [
  'imagen_inicio',
  'imagen_secundaria',
  'imagen_final_desktop',
  'imagen_final_mobile',
];

const POPULATE = {
  imagen_inicio: { fields: ['id', 'url', 'name', 'width', 'height'] },
  imagen_secundaria: { fields: ['id', 'url', 'name', 'width', 'height'] },
  imagen_final_desktop: { fields: ['id', 'url', 'name', 'width', 'height'] },
  imagen_final_mobile: { fields: ['id', 'url', 'name', 'width', 'height'] },
};

function formatMedia(file) {
  if (!file || !file.id) return null;
  return {
    id: file.id,
    url: file.url || '',
    name: file.name || '',
    width: file.width || null,
    height: file.height || null,
  };
}

function normalizeEncuadre(value) {
  const clean = String(value || 'centro').trim().toLowerCase();
  return ENCUADRES_VALIDOS.has(clean) ? clean : 'centro';
}

function extractMediaId(value) {
  if (value === null || value === '') return null;
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) return value;
  if (typeof value === 'object' && value.id && Number.isInteger(Number(value.id))) {
    return Number(value.id);
  }
  return undefined;
}

function normalizeRecord(record) {
  const source = record || {};
  return {
    documentId: source.documentId || null,
    titulo: typeof source.titulo === 'string' && source.titulo.trim() ? source.titulo : 'Nuestra Historia',
    imagen_inicio: formatMedia(source.imagen_inicio),
    encuadre_imagen_inicio: normalizeEncuadre(source.encuadre_imagen_inicio),
    texto_banner_1: typeof source.texto_banner_1 === 'string' ? source.texto_banner_1 : '',
    texto_intermedio: typeof source.texto_intermedio === 'string' ? source.texto_intermedio : '',
    texto_banner_2: typeof source.texto_banner_2 === 'string' ? source.texto_banner_2 : '',
    imagen_secundaria: formatMedia(source.imagen_secundaria),
    encuadre_imagen_secundaria: normalizeEncuadre(source.encuadre_imagen_secundaria),
    imagen_final_desktop: formatMedia(source.imagen_final_desktop),
    encuadre_imagen_final_desktop: normalizeEncuadre(source.encuadre_imagen_final_desktop),
    imagen_final_mobile: formatMedia(source.imagen_final_mobile),
    encuadre_imagen_final_mobile: normalizeEncuadre(source.encuadre_imagen_final_mobile),
  };
}

module.exports = ({ strapi }) => ({
  async get() {
    const existing = await strapi.documents(HISTORIA_UID).findFirst({
      populate: POPULATE,
    });
    return normalizeRecord(existing);
  },

  async update(payload = {}) {
    const titulo = String(payload.titulo ?? 'Nuestra Historia').trim() || 'Nuestra Historia';

    const data = {
      titulo,
      texto_banner_1: typeof payload.texto_banner_1 === 'string' ? payload.texto_banner_1 : '',
      texto_intermedio: typeof payload.texto_intermedio === 'string' ? payload.texto_intermedio : '',
      texto_banner_2: typeof payload.texto_banner_2 === 'string' ? payload.texto_banner_2 : '',
      encuadre_imagen_inicio: normalizeEncuadre(payload.encuadre_imagen_inicio),
      encuadre_imagen_secundaria: normalizeEncuadre(payload.encuadre_imagen_secundaria),
      encuadre_imagen_final_desktop: normalizeEncuadre(payload.encuadre_imagen_final_desktop),
      encuadre_imagen_final_mobile: normalizeEncuadre(payload.encuadre_imagen_final_mobile),
    };

    for (const field of MEDIA_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(payload, field)) {
        const mediaId = extractMediaId(payload[field]);
        if (mediaId !== undefined) {
          data[field] = mediaId;
        }
      }
    }

    const existing = await strapi.documents(HISTORIA_UID).findFirst();
    const saved = existing?.documentId
      ? await strapi.documents(HISTORIA_UID).update({
          documentId: existing.documentId,
          data,
          populate: POPULATE,
        })
      : await strapi.documents(HISTORIA_UID).create({
          data,
          populate: POPULATE,
        });

    return normalizeRecord(saved);
  },
});
