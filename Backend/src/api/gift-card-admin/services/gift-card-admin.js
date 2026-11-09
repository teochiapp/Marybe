'use strict';

const MAIN = 'api::seccion-principal.seccion-principal';
const FILE = 'plugin::upload.file';
const SECTION_KEY = 'gift-card';

const AREAS = {
  perfumeria: { label: 'Perfumería', defaultBg: '#6A0304' },
  hogar: { label: 'Hogar', defaultBg: '#B10002' },
};

const DEFAULTS = Object.freeze({
  titulo_destacado: 'Regalá',
  titulo_complementario: 'Marybe',
  bloque1_titulo: 'Producto',
  bloque1_descripcion: 'Elegí el producto perfecto para regalar',
  bloque1_icono: 'original',
  bloque2_titulo: 'Monto personalizado',
  bloque2_descripcion: 'Vos elegís cuánto regalar',
  bloque2_icono: 'original',
  imagen_tamano: 'mediano',
  imagen_posicion_x: 'centro',
  imagen_posicion_y: 'centro',
  imagen_ajuste: 'contener',
  modo_texto: 'auto',
  boton_texto: 'Conocer más',
  boton_enlace: '/gift-card',
});

const OPTIONS = {
  imagen_tamano: ['mediano', 'pequeno', 'grande'],
  imagen_posicion_x: ['centro', 'izquierda', 'derecha'],
  imagen_posicion_y: ['centro', 'arriba', 'abajo'],
  imagen_ajuste: ['contener', 'cubrir'],
  modo_texto: ['auto', 'claro', 'oscuro'],
  icono: [
    'original',
    'ninguno',
    'estrella',
    'corazon',
    'regalo',
    'destellos',
    'etiqueta',
    'flecha',
    'bolsa',
  ],
};

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

function fail(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  throw error;
}

function areaFor(areaKey) {
  const area = AREAS[areaKey];
  if (!area) fail('Área inválida.', 404);
  return area;
}

const cleanText = (value, max = 160) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

const media = file =>
  file?.id
    ? { id: file.id, url: file.url, name: file.name, width: file.width, height: file.height }
    : null;

const option = (name, value) => (OPTIONS[name].includes(value) ? value : OPTIONS[name][0]);

function normalizeColor(value, fallback) {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim().toUpperCase();
  return HEX_COLOR_RE.test(trimmed) ? trimmed : fallback;
}

function validateColor(value, fallback) {
  if (value == null || value === '') return fallback;
  if (typeof value !== 'string' || !HEX_COLOR_RE.test(value.trim())) {
    fail('El color de fondo debe ser un código HEX válido de 6 dígitos (ej. #6A0304).');
  }
  return value.trim().toUpperCase();
}

function safeLink(value) {
  const link = cleanText(value, 300);
  if (!link) return DEFAULTS.boton_enlace;
  if ((link.startsWith('/') && !link.startsWith('//')) || /^https?:\/\//i.test(link)) return link;
  fail('El enlace del botón debe comenzar con "/" o con "https://".');
}

module.exports = ({ strapi }) => {
  const loadMain = () =>
    strapi.documents(MAIN).findFirst({
      fields: ['updatedAt', 'diseno_secciones', 'borradores_editor_inicio', 'banners_visuales'],
    });

  async function filesById(ids) {
    const unique = [...new Set(ids.filter(id => Number.isSafeInteger(id)))];
    if (!unique.length) return new Map();
    const files = await strapi.db.query(FILE).findMany({
      where: { id: { $in: unique } },
      select: ['id', 'url', 'name', 'width', 'height'],
    });
    return new Map(files.map(file => [file.id, file]));
  }

  function normalizeState(saved, areaKey, files) {
    const area = AREAS[areaKey];
    const s = saved && typeof saved === 'object' ? saved : {};
    let imagen = null;
    if (s.imagen?.id && files.has(s.imagen.id)) {
      imagen = media(files.get(s.imagen.id));
    } else if (Number.isSafeInteger(s.imagenId) && files.has(s.imagenId)) {
      imagen = media(files.get(s.imagenId));
    } else if (s.imagen?.url) {
      imagen = media(s.imagen);
    }

    return {
      titulo_destacado: cleanText(s.titulo_destacado, 60) || DEFAULTS.titulo_destacado,
      titulo_complementario: cleanText(s.titulo_complementario, 60) || DEFAULTS.titulo_complementario,
      bloque1_titulo: cleanText(s.bloque1_titulo, 80) || DEFAULTS.bloque1_titulo,
      bloque1_descripcion: cleanText(s.bloque1_descripcion, 200) || DEFAULTS.bloque1_descripcion,
      bloque1_icono: option('icono', s.bloque1_icono),
      bloque2_titulo: cleanText(s.bloque2_titulo, 80) || DEFAULTS.bloque2_titulo,
      bloque2_descripcion: cleanText(s.bloque2_descripcion, 200) || DEFAULTS.bloque2_descripcion,
      bloque2_icono: option('icono', s.bloque2_icono),
      imagen,
      imagen_tamano: option('imagen_tamano', s.imagen_tamano),
      imagen_posicion_x: option('imagen_posicion_x', s.imagen_posicion_x),
      imagen_posicion_y: option('imagen_posicion_y', s.imagen_posicion_y),
      imagen_ajuste: option('imagen_ajuste', s.imagen_ajuste),
      color_fondo: normalizeColor(s.color_fondo, area.defaultBg),
      modo_texto: option('modo_texto', s.modo_texto),
      boton_texto: cleanText(s.boton_texto, 80) || DEFAULTS.boton_texto,
      boton_enlace:
        typeof s.boton_enlace === 'string' && s.boton_enlace.trim()
          ? s.boton_enlace.trim().slice(0, 300)
          : DEFAULTS.boton_enlace,
    };
  }

  async function overview() {
    const main = await loadMain();
    const publishedSection = main?.diseno_secciones?.[SECTION_KEY] || {};
    const draftSection = main?.borradores_editor_inicio?.[SECTION_KEY] || {};

    const fileIds = [];
    for (const key of Object.keys(AREAS)) {
      const pubImgId = publishedSection[key]?.imagen?.id ?? publishedSection[key]?.imagenId;
      const dftImgId = draftSection[key]?.data?.imagen?.id ?? draftSection[key]?.data?.imagenId;
      if (Number.isSafeInteger(pubImgId)) fileIds.push(pubImgId);
      if (Number.isSafeInteger(dftImgId)) fileIds.push(dftImgId);
    }
    const files = await filesById(fileIds);

    const areas = {};
    for (const [key, area] of Object.entries(AREAS)) {
      const pub = normalizeState(publishedSection[key], key, files);
      const storedDraft = draftSection[key];
      const draft = storedDraft?.data ? normalizeState(storedDraft.data, key, files) : null;
      areas[key] = {
        defaultBg: area.defaultBg,
        published: pub,
        draft,
        draftSavedAt: storedDraft?.savedAt || null,
      };
    }

    return {
      version: main?.updatedAt || null,
      exists: Boolean(main),
      defaults: DEFAULTS,
      areas,
    };
  }

  async function resolveImage(value) {
    if (value == null || value === '') return null;
    const id = typeof value === 'object' ? value.id : value;
    if (id == null || id === '') return null;
    if (!Number.isSafeInteger(Number(id)) || Number(id) < 1) fail('Imagen inválida.');
    const file = await strapi.db.query(FILE).findOne({
      where: { id: Number(id) },
      select: ['id', 'url', 'name', 'width', 'height', 'mime'],
    });
    if (!file || !file.mime?.startsWith('image/') || file.mime === 'image/svg+xml') {
      fail('Seleccioná una imagen JPG, PNG, WebP, GIF o AVIF de la biblioteca.');
    }
    return media(file);
  }

  async function clean(input, areaKey, { requireComplete }) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) fail('Datos inválidos.');
    const area = areaFor(areaKey);

    for (const field of ['imagen_tamano', 'imagen_posicion_x', 'imagen_posicion_y', 'imagen_ajuste', 'modo_texto']) {
      if (input[field] != null && !OPTIONS[field].includes(input[field])) {
        fail('Opción de diseño inválida.');
      }
    }
    for (const iconField of ['bloque1_icono', 'bloque2_icono']) {
      if (input[iconField] != null && !OPTIONS.icono.includes(input[iconField])) {
        fail('Ícono seleccionado inválido.');
      }
    }

    const titulo_destacado = cleanText(input.titulo_destacado ?? DEFAULTS.titulo_destacado, 60);
    const titulo_complementario = cleanText(
      input.titulo_complementario ?? DEFAULTS.titulo_complementario,
      60
    );
    const bloque1_titulo = cleanText(input.bloque1_titulo ?? DEFAULTS.bloque1_titulo, 80);
    const bloque1_descripcion = cleanText(
      input.bloque1_descripcion ?? DEFAULTS.bloque1_descripcion,
      200
    );
    const bloque2_titulo = cleanText(input.bloque2_titulo ?? DEFAULTS.bloque2_titulo, 80);
    const bloque2_descripcion = cleanText(
      input.bloque2_descripcion ?? DEFAULTS.bloque2_descripcion,
      200
    );
    const boton_texto = cleanText(input.boton_texto ?? DEFAULTS.boton_texto, 80);
    const boton_enlace = safeLink(input.boton_enlace ?? DEFAULTS.boton_enlace);
    const color_fondo = validateColor(input.color_fondo, area.defaultBg);
    const imagen = await resolveImage(input.imagen);

    if (requireComplete) {
      if (!titulo_destacado && !titulo_complementario) {
        fail('El título principal de Gift Card no puede quedar vacío.');
      }
      if (!bloque1_titulo || !bloque1_descripcion) {
        fail('Completá el título y la descripción del primer bloque descriptivo.');
      }
      if (!bloque2_titulo || !bloque2_descripcion) {
        fail('Completá el título y la descripción del segundo bloque descriptivo.');
      }
      if (!boton_texto) {
        fail('El texto del botón no puede quedar vacío.');
      }
    }

    return {
      titulo_destacado: titulo_destacado || DEFAULTS.titulo_destacado,
      titulo_complementario: titulo_complementario || DEFAULTS.titulo_complementario,
      bloque1_titulo: bloque1_titulo || DEFAULTS.bloque1_titulo,
      bloque1_descripcion: bloque1_descripcion || DEFAULTS.bloque1_descripcion,
      bloque1_icono: option('icono', input.bloque1_icono),
      bloque2_titulo: bloque2_titulo || DEFAULTS.bloque2_titulo,
      bloque2_descripcion: bloque2_descripcion || DEFAULTS.bloque2_descripcion,
      bloque2_icono: option('icono', input.bloque2_icono),
      imagen,
      imagen_tamano: option('imagen_tamano', input.imagen_tamano),
      imagen_posicion_x: option('imagen_posicion_x', input.imagen_posicion_x),
      imagen_posicion_y: option('imagen_posicion_y', input.imagen_posicion_y),
      imagen_ajuste: option('imagen_ajuste', input.imagen_ajuste),
      color_fondo,
      modo_texto: option('modo_texto', input.modo_texto),
      boton_texto: boton_texto || DEFAULTS.boton_texto,
      boton_enlace,
    };
  }

  async function writeMain(main, data) {
    if (main) return strapi.documents(MAIN).update({ documentId: main.documentId, data });
    return strapi.documents(MAIN).create({ data: { secciones: [], ...data } });
  }

  function checkVersion(main, version) {
    if ((main?.updatedAt || null) !== (version ?? null)) {
      fail('Otro administrador modificó la Página de Inicio. Recargá antes de guardar.', 409);
    }
  }

  return {
    overview,

    async save(areaKey, body = {}) {
      areaFor(areaKey);
      const main = await loadMain();
      checkVersion(main, body.version);
      const publish = body.publish === true;
      const data = await clean(body.data, areaKey, { requireComplete: publish });

      const storedDrafts = main?.borradores_editor_inicio || {};
      const drafts = {
        ...storedDrafts,
        [SECTION_KEY]: { ...(storedDrafts[SECTION_KEY] || {}) },
      };

      if (!publish) {
        drafts[SECTION_KEY][areaKey] = { data, savedAt: new Date().toISOString() };
        await writeMain(main, { borradores_editor_inicio: drafts });
        return overview();
      }

      delete drafts[SECTION_KEY][areaKey];
      const currentDiseno = main?.diseno_secciones || {};
      const nextDiseno = {
        ...currentDiseno,
        [SECTION_KEY]: {
          ...(currentDiseno[SECTION_KEY] || {}),
          [areaKey]: data,
        },
      };

      const payload = {
        diseno_secciones: nextDiseno,
        borradores_editor_inicio: drafts,
      };

      const slotKey = `gift_${areaKey}`;
      if (main?.banners_visuales?.published?.[slotKey]) {
        const nextPublishedSlots = { ...main.banners_visuales.published };
        delete nextPublishedSlots[slotKey];
        payload.banners_visuales = {
          ...main.banners_visuales,
          published: nextPublishedSlots,
        };
      }

      await writeMain(main, payload);
      return overview();
    },

    async discard(areaKey, body = {}) {
      areaFor(areaKey);
      const main = await loadMain();
      checkVersion(main, body.version);
      const stored = main?.borradores_editor_inicio || {};
      if (!stored[SECTION_KEY]?.[areaKey]) return overview();
      const section = { ...stored[SECTION_KEY] };
      delete section[areaKey];
      await writeMain(main, {
        borradores_editor_inicio: { ...stored, [SECTION_KEY]: section },
      });
      return overview();
    },
  };
};

module.exports.AREAS = AREAS;
module.exports.DEFAULTS = DEFAULTS;
module.exports.OPTIONS = OPTIONS;
