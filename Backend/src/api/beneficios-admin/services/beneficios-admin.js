'use strict';

const MAIN = 'api::seccion-principal.seccion-principal';
const PROMO_UID = 'api::promocion-bancaria.promocion-bancaria';
const FILE = 'plugin::upload.file';
const SECTION_KEY = 'beneficios';
const AREA_KEY = 'general';

const DEFAULTS = Object.freeze({
  titulo: 'Beneficios para vos',
  info_titulo: '¿Necesitás más información?',
  info_descripcion: 'Consultá todas las promociones vigentes y encontrá la que más te conviene.',
  boton_texto: 'Ver todas las promociones',
  boton_enlace: '',
});

const OPTIONS = {
  tamano_logo: ['mediano', 'pequeno', 'grande'],
  ajuste_logo: ['contener', 'cubrir'],
  posicion_logo: ['centro', 'izquierda', 'derecha', 'arriba', 'abajo'],
};

function fail(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  throw error;
}

function checkArea(areaKey) {
  if (areaKey !== AREA_KEY) fail('Área inválida.', 404);
}

const cleanText = (value, max = 200) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

const media = file =>
  file?.id
    ? { id: file.id, url: file.url, name: file.name, width: file.width, height: file.height }
    : null;

const option = (name, value) => (OPTIONS[name].includes(value) ? value : OPTIONS[name][0]);

function safeLink(value) {
  const link = cleanText(value, 300);
  if (!link) return '';
  if ((link.startsWith('/') && !link.startsWith('//')) || /^https?:\/\//i.test(link)) return link;
  fail('El enlace del botón debe comenzar con "/" o con "https://".');
}

function normalizeCuotasCantidad(raw) {
  if (raw == null || raw === '') return [];
  const items = Array.isArray(raw)
    ? raw
    : typeof raw === 'number'
      ? [raw]
      : String(raw)
          .split(/[,;\sy]+/i)
          .map(part => part.trim())
          .filter(Boolean);

  const seen = new Set();
  const result = [];
  for (const item of items) {
    const num = Number(item);
    if (!Number.isInteger(num) || num < 1 || num > 120) {
      fail('Las cuotas deben ser números enteros entre 1 y 120.');
    }
    if (!seen.has(num)) {
      seen.add(num);
      result.push(num);
    }
  }
  return result;
}

function normalizeOrder(promociones, order) {
  const known = promociones.map(promo => promo.documentId);
  const saved = (Array.isArray(order) ? order : []).filter(
    (id, index, list) => known.includes(id) && list.indexOf(id) === index
  );
  return [...saved, ...known.filter(id => !saved.includes(id))];
}

function serializePromo(row) {
  let cuotas = [];
  if (Array.isArray(row.cuotas_cantidad)) {
    cuotas = row.cuotas_cantidad.map(Number).filter(n => Number.isInteger(n) && n > 0);
  } else if (Number.isInteger(Number(row.cuotas_cantidad)) && Number(row.cuotas_cantidad) > 0) {
    cuotas = [Number(row.cuotas_cantidad)];
  }
  return {
    id: row.id,
    documentId: row.documentId,
    nombre: row.nombre || '',
    cuotas_descripcion: row.cuotas_descripcion || '',
    cuotas_cantidad: cuotas,
    monto_minimo: row.monto_minimo || '',
    orden: Number.isFinite(Number(row.orden)) ? Number(row.orden) : 0,
    logo: media(row.logo),
  };
}

module.exports = ({ strapi }) => {
  const loadMain = () =>
    strapi.documents(MAIN).findFirst({
      fields: ['updatedAt', 'diseno_secciones', 'borradores_editor_inicio'],
    });

  const loadPromociones = async () => {
    const rows = await strapi.documents(PROMO_UID).findMany({
      status: 'published',
      filters: { activo: true },
      fields: ['nombre', 'cuotas_descripcion', 'cuotas_cantidad', 'monto_minimo', 'orden'],
      populate: { logo: { fields: ['url', 'name', 'width', 'height', 'mime'] } },
      sort: ['orden:asc', 'id:asc'],
      limit: 200,
    });
    const seen = new Set();
    return (rows || [])
      .filter(row => row?.documentId && !seen.has(row.documentId) && seen.add(row.documentId))
      .map(serializePromo);
  };

  async function filesById(ids) {
    const unique = [...new Set(ids.filter(id => Number.isSafeInteger(id)))];
    if (!unique.length) return new Map();
    const files = await strapi.db.query(FILE).findMany({
      where: { id: { $in: unique } },
      select: ['id', 'url', 'name', 'width', 'height'],
    });
    return new Map(files.map(file => [file.id, file]));
  }

  function publishedState(main, promociones) {
    const saved = main?.diseno_secciones?.[SECTION_KEY]?.[AREA_KEY] || {};
    const savedTarjetas = saved.tarjetas && typeof saved.tarjetas === 'object' ? saved.tarjetas : {};
    const tarjetas = {};

    for (const promo of promociones) {
      const cfg = savedTarjetas[promo.documentId] || {};
      tarjetas[promo.documentId] = {
        nombre: promo.nombre,
        cuotas_descripcion: promo.cuotas_descripcion,
        cuotas_cantidad: promo.cuotas_cantidad,
        monto_minimo: promo.monto_minimo,
        logo: promo.logo,
        tamano_logo: option('tamano_logo', cfg.tamano_logo),
        ajuste_logo: option('ajuste_logo', cfg.ajuste_logo),
        posicion_logo: option('posicion_logo', cfg.posicion_logo),
      };
    }

    return {
      titulo: cleanText(saved.titulo, 120) || DEFAULTS.titulo,
      info_titulo: cleanText(saved.info_titulo, 140) || DEFAULTS.info_titulo,
      info_descripcion: cleanText(saved.info_descripcion, 260) || DEFAULTS.info_descripcion,
      boton_texto: cleanText(saved.boton_texto, 80) || DEFAULTS.boton_texto,
      boton_enlace: cleanText(saved.boton_enlace, 300) || DEFAULTS.boton_enlace,
      orden: normalizeOrder(promociones, saved.orden),
      tarjetas,
    };
  }

  function hydrateDraft(stored, promociones, published, files) {
    if (!stored?.data) return null;
    const d = stored.data;
    const tarjetas = {};
    for (const promo of promociones) {
      const pubCard = published.tarjetas[promo.documentId];
      const dCard = d.tarjetas?.[promo.documentId] || {};
      let logo = pubCard.logo;
      if (dCard.logoId === null) {
        logo = null;
      } else if (dCard.logoId != null && files.has(dCard.logoId)) {
        logo = media(files.get(dCard.logoId));
      }
      tarjetas[promo.documentId] = {
        nombre: dCard.nombre !== undefined ? cleanText(dCard.nombre, 120) : pubCard.nombre,
        cuotas_descripcion:
          dCard.cuotas_descripcion !== undefined
            ? cleanText(dCard.cuotas_descripcion, 200)
            : pubCard.cuotas_descripcion,
        cuotas_cantidad: Array.isArray(dCard.cuotas_cantidad)
          ? dCard.cuotas_cantidad
          : pubCard.cuotas_cantidad,
        monto_minimo:
          dCard.monto_minimo !== undefined ? cleanText(dCard.monto_minimo, 80) : pubCard.monto_minimo,
        logo,
        tamano_logo: option('tamano_logo', dCard.tamano_logo ?? pubCard.tamano_logo),
        ajuste_logo: option('ajuste_logo', dCard.ajuste_logo ?? pubCard.ajuste_logo),
        posicion_logo: option('posicion_logo', dCard.posicion_logo ?? pubCard.posicion_logo),
      };
    }

    return {
      titulo: cleanText(d.titulo ?? published.titulo, 120) || DEFAULTS.titulo,
      info_titulo: cleanText(d.info_titulo ?? published.info_titulo, 140) || DEFAULTS.info_titulo,
      info_descripcion:
        cleanText(d.info_descripcion ?? published.info_descripcion, 260) || DEFAULTS.info_descripcion,
      boton_texto: cleanText(d.boton_texto ?? published.boton_texto, 80) || DEFAULTS.boton_texto,
      boton_enlace: cleanText(d.boton_enlace ?? published.boton_enlace, 300),
      orden: normalizeOrder(promociones, d.orden),
      tarjetas,
    };
  }

  async function overview() {
    const [main, promociones] = await Promise.all([loadMain(), loadPromociones()]);
    const storedDraft = main?.borradores_editor_inicio?.[SECTION_KEY]?.[AREA_KEY] || null;
    const draftLogoIds = Object.values(storedDraft?.data?.tarjetas || {})
      .map(card => card?.logoId)
      .filter(id => Number.isSafeInteger(id));
    const files = await filesById(draftLogoIds);
    const published = publishedState(main, promociones);

    return {
      version: main?.updatedAt || null,
      exists: Boolean(main),
      defaults: DEFAULTS,
      areas: {
        [AREA_KEY]: {
          promociones: promociones.map(p => ({
            id: p.id,
            documentId: p.documentId,
            nombre: p.nombre,
            orden: p.orden,
          })),
          published,
          draft: hydrateDraft(storedDraft, promociones, published, files),
          draftSavedAt: storedDraft?.savedAt || null,
        },
      },
    };
  }

  async function mediaId(value) {
    const id = typeof value === 'object' && value !== null ? value.id : value;
    if (id == null || id === '') return null;
    if (!Number.isSafeInteger(Number(id)) || Number(id) < 1) fail('Logo inválido.');
    const file = await strapi.db.query(FILE).findOne({ where: { id: Number(id) } });
    if (!file || !file.mime?.startsWith('image/')) {
      fail('Seleccioná una imagen válida de la biblioteca.');
    }
    return Number(id);
  }

  async function clean(input, promociones, { requireComplete }) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) fail('Datos inválidos.');
    const known = promociones.map(p => p.documentId);
    const promoById = new Map(promociones.map(p => [p.documentId, p]));

    if (input.orden != null && !Array.isArray(input.orden)) fail('Orden inválido.');
    const order = input.orden || [];
    if (order.some(id => typeof id !== 'string' || !known.includes(id))) {
      fail('Los beneficios activos cambiaron. Recargá el editor y volvé a ordenar.', 409);
    }
    if (new Set(order).size !== order.length) fail('Hay beneficios repetidos en el orden.');

    const titulo = cleanText(input.titulo ?? DEFAULTS.titulo, 120);
    const info_titulo = cleanText(input.info_titulo ?? DEFAULTS.info_titulo, 140);
    const info_descripcion = cleanText(input.info_descripcion ?? DEFAULTS.info_descripcion, 260);
    const boton_texto = cleanText(input.boton_texto ?? DEFAULTS.boton_texto, 80);
    const boton_enlace = safeLink(input.boton_enlace);

    if (requireComplete) {
      if (!titulo) fail('El título principal de Beneficios no puede quedar vacío.');
      if (!info_titulo) fail('El título del bloque inferior no puede quedar vacío.');
      if (!info_descripcion) fail('La descripción del bloque inferior no puede quedar vacía.');
      if (!boton_texto) fail('El texto del botón no puede quedar vacío.');
    }

    if (input.tarjetas != null && (typeof input.tarjetas !== 'object' || Array.isArray(input.tarjetas))) {
      fail('Tarjetas inválidas.');
    }

    const rawTarjetas = input.tarjetas || {};
    for (const documentId of Object.keys(rawTarjetas)) {
      if (!known.includes(documentId)) {
        fail('Los beneficios activos cambiaron. Recargá el editor.', 409);
      }
    }

    const tarjetas = {};
    for (const promo of promociones) {
      const cardIn = rawTarjetas[promo.documentId] || {};
      for (const optName of Object.keys(OPTIONS)) {
        if (cardIn[optName] != null && !OPTIONS[optName].includes(cardIn[optName])) {
          fail('Opción de diseño de logo inválida.');
        }
      }

      const nombre = cardIn.nombre !== undefined ? cleanText(cardIn.nombre, 120) : promo.nombre;
      const cuotas_descripcion =
        cardIn.cuotas_descripcion !== undefined
          ? cleanText(cardIn.cuotas_descripcion, 200)
          : promo.cuotas_descripcion;
      const cuotas_cantidad =
        cardIn.cuotas_cantidad !== undefined
          ? normalizeCuotasCantidad(cardIn.cuotas_cantidad)
          : promo.cuotas_cantidad;
      const monto_minimo =
        cardIn.monto_minimo !== undefined ? cleanText(cardIn.monto_minimo, 80) : promo.monto_minimo;

      const hasLogoProp = Object.prototype.hasOwnProperty.call(cardIn, 'logo');
      const logoId = hasLogoProp ? await mediaId(cardIn.logo) : promo.logo?.id ?? null;

      if (requireComplete) {
        if (!nombre) fail(`El beneficio "${promo.nombre}" necesita un nombre.`);
        if (!cuotas_descripcion && (!cuotas_cantidad || cuotas_cantidad.length === 0)) {
          fail(`El beneficio "${nombre}" necesita descripción o cantidad de cuotas.`);
        }
      }

      tarjetas[promo.documentId] = {
        nombre,
        cuotas_descripcion,
        cuotas_cantidad,
        monto_minimo,
        logoId,
        tamano_logo: option('tamano_logo', cardIn.tamano_logo),
        ajuste_logo: option('ajuste_logo', cardIn.ajuste_logo),
        posicion_logo: option('posicion_logo', cardIn.posicion_logo),
      };
    }

    return {
      titulo: titulo || DEFAULTS.titulo,
      info_titulo: info_titulo || DEFAULTS.info_titulo,
      info_descripcion: info_descripcion || DEFAULTS.info_descripcion,
      boton_texto: boton_texto || DEFAULTS.boton_texto,
      boton_enlace,
      orden: normalizeOrder(promociones, order),
      tarjetas,
    };
  }

  async function writeMain(main, data) {
    if (main) return strapi.documents(MAIN).update({ documentId: main.documentId, data });
    return strapi.documents(MAIN).create({ data: { secciones: [], ...data } });
  }

  async function updatePromocion(documentId, data) {
    const rows = await strapi.db.query(PROMO_UID).findMany({
      where: { documentId },
      select: ['id'],
    });
    for (const row of rows) {
      await strapi.db.query(PROMO_UID).update({
        where: { id: row.id },
        data,
      });
    }
  }

  function checkVersion(main, version) {
    if ((main?.updatedAt || null) !== (version ?? null)) {
      fail('Otro administrador modificó la Página de Inicio. Recargá antes de guardar.', 409);
    }
  }

  return {
    overview,

    async save(areaKey, body = {}) {
      checkArea(areaKey);
      const main = await loadMain();
      checkVersion(main, body.version);
      const promociones = await loadPromociones();
      const publish = body.publish === true;
      const data = await clean(body.data, promociones, { requireComplete: publish });

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
      const prevDiseno = main?.diseno_secciones || {};
      const publishedTarjetas = {};
      for (const [docId, card] of Object.entries(data.tarjetas)) {
        publishedTarjetas[docId] = {
          tamano_logo: card.tamano_logo,
          ajuste_logo: card.ajuste_logo,
          posicion_logo: card.posicion_logo,
        };
      }

      const nextDiseno = {
        ...prevDiseno,
        [SECTION_KEY]: {
          ...(prevDiseno[SECTION_KEY] || {}),
          [areaKey]: {
            titulo: data.titulo,
            info_titulo: data.info_titulo,
            info_descripcion: data.info_descripcion,
            boton_texto: data.boton_texto,
            boton_enlace: data.boton_enlace,
            orden: data.orden,
            tarjetas: publishedTarjetas,
          },
        },
      };

      const changedPromos = promociones.filter(promo => {
        const nextCard = data.tarjetas[promo.documentId];
        if (!nextCard) return false;
        const currLogoId = promo.logo?.id ?? null;
        const cuotasDiff =
          JSON.stringify(nextCard.cuotas_cantidad || []) !==
          JSON.stringify(promo.cuotas_cantidad || []);
        return (
          nextCard.nombre !== promo.nombre ||
          nextCard.cuotas_descripcion !== promo.cuotas_descripcion ||
          nextCard.monto_minimo !== promo.monto_minimo ||
          nextCard.logoId !== currLogoId ||
          cuotasDiff
        );
      });

      const run = async () => {
        await writeMain(main, {
          diseno_secciones: nextDiseno,
          borradores_editor_inicio: drafts,
        });
        for (const promo of changedPromos) {
          const nextCard = data.tarjetas[promo.documentId];
          await updatePromocion(promo.documentId, {
            nombre: nextCard.nombre,
            cuotas_descripcion: nextCard.cuotas_descripcion,
            cuotas_cantidad: nextCard.cuotas_cantidad,
            monto_minimo: nextCard.monto_minimo || null,
            logo: nextCard.logoId,
          });
        }
      };

      if (typeof strapi.db.transaction === 'function') {
        await strapi.db.transaction(run);
      } else {
        await run();
      }
      return overview();
    },

    async discard(areaKey, body = {}) {
      checkArea(areaKey);
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

module.exports.OPTIONS = OPTIONS;
module.exports.DEFAULTS = DEFAULTS;
module.exports.normalizeOrder = normalizeOrder;
