'use strict';

const MAIN = 'api::seccion-principal.seccion-principal';
const EVENTO_UID = 'api::evento.evento';
const SECTION_KEY = 'proximos-eventos';
const AREA_KEY = 'general';

const DEFAULTS = Object.freeze({
  titulo: 'Próximos eventos',
  icono: 'original',
  fuente: 'principal',
  tamano: 'grande',
  peso: 'semibold',
  estilo: 'cursiva',
  alineacion: 'izquierda',
  bordes_tarjeta: 'redondeado',
  espaciado_tarjetas: 'normal',
  cantidad_visible: 'todos',
  boton_redondeo: 'redondeado',
  enlace_inferior_texto: 'Ver todos los eventos',
  enlace_inferior_url: '#',
  boton_reserva_texto: 'Reservar turno',
});

const OPTIONS = {
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
  fuente: ['principal', 'secundaria'],
  tamano: ['grande', 'chico', 'mediano', 'muy-grande'],
  peso: ['semibold', 'normal', 'bold'],
  estilo: ['cursiva', 'normal'],
  alineacion: ['izquierda', 'centro', 'derecha'],
  bordes_tarjeta: ['redondeado', 'cuadrado', 'muy-redondeado'],
  espaciado_tarjetas: ['normal', 'compacto', 'amplio'],
  cantidad_visible: ['todos', '1', '2', '3', '4'],
  boton_redondeo: ['redondeado', 'cuadrado', 'pildora'],
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

const cleanMultiline = (value, max = 1200) =>
  typeof value === 'string'
    ? value
        .replace(/\r\n/g, '\n')
        .trim()
        .slice(0, max)
    : '';

const option = (name, value) => (OPTIONS[name].includes(value) ? value : OPTIONS[name][0]);

function safeLink(value, allowHash = false) {
  const link = cleanText(value, 300);
  if (!link) return allowHash ? '#' : '';
  if (allowHash && link === '#') return '#';
  if ((link.startsWith('/') && !link.startsWith('//')) || /^https?:\/\//i.test(link)) return link;
  fail('El enlace debe comenzar con "/" o con "https://".');
}

function cleanWhatsappNumber(value) {
  const raw = cleanText(value, 40);
  if (!raw) return '';
  const digits = raw.replace(/[^\d+]/g, '');
  if (!/^\+?\d{6,20}$/.test(digits)) {
    fail('El número de WhatsApp debe contener entre 6 y 20 dígitos.');
  }
  return digits.replace(/^\+/, '');
}

function normalizeOrder(eventos, order) {
  const known = eventos.map(ev => ev.documentId);
  const saved = (Array.isArray(order) ? order : []).filter(
    (id, index, list) => known.includes(id) && list.indexOf(id) === index
  );
  return [...saved, ...known.filter(id => !saved.includes(id))];
}

function serializeEvento(row) {
  return {
    id: row.id,
    documentId: row.documentId,
    titulo: row.titulo || '',
    descripcion: row.descripcion || '',
    fecha: row.fecha || '',
    ubicacion: row.ubicacion || '',
    whatsapp_numero: row.whatsapp_numero || '',
  };
}

module.exports = ({ strapi }) => {
  const loadMain = () =>
    strapi.documents(MAIN).findFirst({
      fields: ['updatedAt', 'diseno_secciones', 'borradores_editor_inicio'],
    });

  const loadEventos = async () => {
    const rows = await strapi.documents(EVENTO_UID).findMany({
      status: 'published',
      fields: ['titulo', 'descripcion', 'fecha', 'ubicacion', 'whatsapp_numero'],
      sort: ['id:asc'],
      limit: 200,
    });
    const seen = new Set();
    return (rows || [])
      .filter(row => row?.documentId && !seen.has(row.documentId) && seen.add(row.documentId))
      .map(serializeEvento);
  };

  function publishedState(main, eventos) {
    const saved = main?.diseno_secciones?.[SECTION_KEY]?.[AREA_KEY] || {};
    const savedEventos = saved.eventos && typeof saved.eventos === 'object' ? saved.eventos : {};
    const eventosMap = {};

    for (const ev of eventos) {
      const cfg = savedEventos[ev.documentId] || {};
      eventosMap[ev.documentId] = {
        titulo: ev.titulo,
        descripcion: ev.descripcion,
        fecha: ev.fecha,
        ubicacion: ev.ubicacion,
        whatsapp_numero: ev.whatsapp_numero,
        boton_texto: cleanText(cfg.boton_texto, 60) || DEFAULTS.boton_reserva_texto,
        boton_enlace: cleanText(cfg.boton_enlace, 300),
      };
    }

    return {
      titulo: cleanText(saved.titulo, 100) || DEFAULTS.titulo,
      icono: option('icono', saved.icono),
      fuente: option('fuente', saved.fuente),
      tamano: option('tamano', saved.tamano),
      peso: option('peso', saved.peso),
      estilo: option('estilo', saved.estilo),
      alineacion: option('alineacion', saved.alineacion),
      bordes_tarjeta: option('bordes_tarjeta', saved.bordes_tarjeta),
      espaciado_tarjetas: option('espaciado_tarjetas', saved.espaciado_tarjetas),
      cantidad_visible: option('cantidad_visible', String(saved.cantidad_visible ?? 'todos')),
      boton_redondeo: option('boton_redondeo', saved.boton_redondeo),
      enlace_inferior_texto:
        cleanText(saved.enlace_inferior_texto, 80) || DEFAULTS.enlace_inferior_texto,
      enlace_inferior_url:
        cleanText(saved.enlace_inferior_url, 300) || DEFAULTS.enlace_inferior_url,
      orden: normalizeOrder(eventos, saved.orden),
      eventos: eventosMap,
    };
  }

  function hydrateDraft(stored, eventos, published) {
    if (!stored?.data) return null;
    const d = stored.data;
    const eventosMap = {};

    for (const ev of eventos) {
      const pubEv = published.eventos[ev.documentId];
      const dEv = d.eventos?.[ev.documentId] || {};
      eventosMap[ev.documentId] = {
        titulo: dEv.titulo !== undefined ? cleanText(dEv.titulo, 140) : pubEv.titulo,
        descripcion:
          dEv.descripcion !== undefined ? cleanMultiline(dEv.descripcion, 1200) : pubEv.descripcion,
        fecha: dEv.fecha !== undefined ? cleanText(dEv.fecha, 120) : pubEv.fecha,
        ubicacion:
          dEv.ubicacion !== undefined ? cleanText(dEv.ubicacion, 160) : pubEv.ubicacion,
        whatsapp_numero:
          dEv.whatsapp_numero !== undefined
            ? cleanText(dEv.whatsapp_numero, 40)
            : pubEv.whatsapp_numero,
        boton_texto:
          dEv.boton_texto !== undefined
            ? cleanText(dEv.boton_texto, 60) || DEFAULTS.boton_reserva_texto
            : pubEv.boton_texto,
        boton_enlace:
          dEv.boton_enlace !== undefined
            ? cleanText(dEv.boton_enlace, 300)
            : pubEv.boton_enlace,
      };
    }

    return {
      titulo: cleanText(d.titulo ?? published.titulo, 100) || DEFAULTS.titulo,
      icono: option('icono', d.icono ?? published.icono),
      fuente: option('fuente', d.fuente ?? published.fuente),
      tamano: option('tamano', d.tamano ?? published.tamano),
      peso: option('peso', d.peso ?? published.peso),
      estilo: option('estilo', d.estilo ?? published.estilo),
      alineacion: option('alineacion', d.alineacion ?? published.alineacion),
      bordes_tarjeta: option('bordes_tarjeta', d.bordes_tarjeta ?? published.bordes_tarjeta),
      espaciado_tarjetas: option(
        'espaciado_tarjetas',
        d.espaciado_tarjetas ?? published.espaciado_tarjetas
      ),
      cantidad_visible: option(
        'cantidad_visible',
        String(d.cantidad_visible ?? published.cantidad_visible)
      ),
      boton_redondeo: option('boton_redondeo', d.boton_redondeo ?? published.boton_redondeo),
      enlace_inferior_texto:
        cleanText(d.enlace_inferior_texto ?? published.enlace_inferior_texto, 80) ||
        DEFAULTS.enlace_inferior_texto,
      enlace_inferior_url:
        cleanText(d.enlace_inferior_url ?? published.enlace_inferior_url, 300) ||
        DEFAULTS.enlace_inferior_url,
      orden: normalizeOrder(eventos, d.orden),
      eventos: eventosMap,
    };
  }

  async function overview() {
    const [main, eventos] = await Promise.all([loadMain(), loadEventos()]);
    const storedDraft = main?.borradores_editor_inicio?.[SECTION_KEY]?.[AREA_KEY] || null;
    const published = publishedState(main, eventos);

    return {
      version: main?.updatedAt || null,
      exists: Boolean(main),
      defaults: DEFAULTS,
      areas: {
        [AREA_KEY]: {
          eventosCatalogo: eventos.map(ev => ({
            id: ev.id,
            documentId: ev.documentId,
            titulo: ev.titulo,
          })),
          published,
          draft: hydrateDraft(storedDraft, eventos, published),
          draftSavedAt: storedDraft?.savedAt || null,
        },
      },
    };
  }

  function clean(input, eventos, { requireComplete }) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) fail('Datos inválidos.');
    const known = eventos.map(ev => ev.documentId);

    if (input.orden != null && !Array.isArray(input.orden)) fail('Orden inválido.');
    const order = input.orden || [];
    if (order.some(id => typeof id !== 'string' || !known.includes(id))) {
      fail('Los eventos activos cambiaron. Recargá el editor y volvé a ordenar.', 409);
    }
    if (new Set(order).size !== order.length) fail('Hay eventos repetidos en el orden.');

    for (const optKey of Object.keys(OPTIONS)) {
      if (input[optKey] != null && !OPTIONS[optKey].includes(String(input[optKey]))) {
        fail('Opción de diseño o tipografía inválida.');
      }
    }

    const titulo = cleanText(input.titulo ?? DEFAULTS.titulo, 100);
    const enlace_inferior_texto = cleanText(
      input.enlace_inferior_texto ?? DEFAULTS.enlace_inferior_texto,
      80
    );
    const enlace_inferior_url = safeLink(
      input.enlace_inferior_url ?? DEFAULTS.enlace_inferior_url,
      true
    );

    if (requireComplete) {
      if (!titulo) fail('El título de Próximos Eventos no puede quedar vacío.');
      if (!enlace_inferior_texto) fail('El texto del enlace inferior no puede quedar vacío.');
    }

    if (input.eventos != null && (typeof input.eventos !== 'object' || Array.isArray(input.eventos))) {
      fail('Datos de eventos inválidos.');
    }

    const rawEventos = input.eventos || {};
    for (const docId of Object.keys(rawEventos)) {
      if (!known.includes(docId)) {
        fail('Los eventos activos cambiaron. Recargá el editor.', 409);
      }
    }

    const eventosClean = {};
    for (const ev of eventos) {
      const evIn = rawEventos[ev.documentId] || {};
      const evTitulo = evIn.titulo !== undefined ? cleanText(evIn.titulo, 140) : ev.titulo;
      const evDesc =
        evIn.descripcion !== undefined ? cleanMultiline(evIn.descripcion, 1200) : ev.descripcion;
      const evFecha = evIn.fecha !== undefined ? cleanText(evIn.fecha, 120) : ev.fecha;
      const evUbicacion =
        evIn.ubicacion !== undefined ? cleanText(evIn.ubicacion, 160) : ev.ubicacion;
      const evWhatsapp =
        evIn.whatsapp_numero !== undefined
          ? cleanWhatsappNumber(evIn.whatsapp_numero)
          : ev.whatsapp_numero;
      const boton_texto =
        evIn.boton_texto !== undefined
          ? cleanText(evIn.boton_texto, 60)
          : DEFAULTS.boton_reserva_texto;
      const boton_enlace =
        evIn.boton_enlace !== undefined ? safeLink(evIn.boton_enlace, false) : '';

      if (requireComplete) {
        if (!evTitulo) fail(`El evento "${ev.titulo}" necesita un título.`);
        if (!evDesc) fail(`El evento "${evTitulo}" necesita una descripción.`);
        if (!evFecha) fail(`El evento "${evTitulo}" necesita fecha y horario.`);
        if (!evUbicacion) fail(`El evento "${evTitulo}" necesita una ubicación.`);
        if (!boton_texto) fail(`El botón del evento "${evTitulo}" no puede quedar vacío.`);
      }

      eventosClean[ev.documentId] = {
        titulo: evTitulo,
        descripcion: evDesc,
        fecha: evFecha,
        ubicacion: evUbicacion,
        whatsapp_numero: evWhatsapp,
        boton_texto: boton_texto || DEFAULTS.boton_reserva_texto,
        boton_enlace,
      };
    }

    return {
      titulo: titulo || DEFAULTS.titulo,
      icono: option('icono', input.icono),
      fuente: option('fuente', input.fuente),
      tamano: option('tamano', input.tamano),
      peso: option('peso', input.peso),
      estilo: option('estilo', input.estilo),
      alineacion: option('alineacion', input.alineacion),
      bordes_tarjeta: option('bordes_tarjeta', input.bordes_tarjeta),
      espaciado_tarjetas: option('espaciado_tarjetas', input.espaciado_tarjetas),
      cantidad_visible: option(
        'cantidad_visible',
        String(input.cantidad_visible ?? DEFAULTS.cantidad_visible)
      ),
      boton_redondeo: option('boton_redondeo', input.boton_redondeo),
      enlace_inferior_texto: enlace_inferior_texto || DEFAULTS.enlace_inferior_texto,
      enlace_inferior_url,
      orden: normalizeOrder(eventos, order),
      eventos: eventosClean,
    };
  }

  async function writeMain(main, data) {
    if (main) return strapi.documents(MAIN).update({ documentId: main.documentId, data });
    return strapi.documents(MAIN).create({ data: { secciones: [], ...data } });
  }

  async function updateEvento(documentId, data) {
    const rows = await strapi.db.query(EVENTO_UID).findMany({
      where: { documentId },
      select: ['id'],
    });
    for (const row of rows) {
      await strapi.db.query(EVENTO_UID).update({
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
      const eventos = await loadEventos();
      const publish = body.publish === true;
      const data = clean(body.data, eventos, { requireComplete: publish });

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
      const publishedEventosCfg = {};
      for (const [docId, evData] of Object.entries(data.eventos)) {
        publishedEventosCfg[docId] = {
          boton_texto: evData.boton_texto,
          boton_enlace: evData.boton_enlace,
        };
      }

      const nextDiseno = {
        ...prevDiseno,
        [SECTION_KEY]: {
          ...(prevDiseno[SECTION_KEY] || {}),
          [areaKey]: {
            titulo: data.titulo,
            icono: data.icono,
            fuente: data.fuente,
            tamano: data.tamano,
            peso: data.peso,
            estilo: data.estilo,
            alineacion: data.alineacion,
            bordes_tarjeta: data.bordes_tarjeta,
            espaciado_tarjetas: data.espaciado_tarjetas,
            cantidad_visible: data.cantidad_visible,
            boton_redondeo: data.boton_redondeo,
            enlace_inferior_texto: data.enlace_inferior_texto,
            enlace_inferior_url: data.enlace_inferior_url,
            orden: data.orden,
            eventos: publishedEventosCfg,
          },
        },
      };

      const changedEventos = eventos.filter(ev => {
        const nextEv = data.eventos[ev.documentId];
        if (!nextEv) return false;
        return (
          nextEv.titulo !== ev.titulo ||
          nextEv.descripcion !== ev.descripcion ||
          nextEv.fecha !== ev.fecha ||
          nextEv.ubicacion !== ev.ubicacion ||
          nextEv.whatsapp_numero !== ev.whatsapp_numero
        );
      });

      const run = async () => {
        await writeMain(main, {
          diseno_secciones: nextDiseno,
          borradores_editor_inicio: drafts,
        });
        for (const ev of changedEventos) {
          const nextEv = data.eventos[ev.documentId];
          await updateEvento(ev.documentId, {
            titulo: nextEv.titulo,
            descripcion: nextEv.descripcion,
            fecha: nextEv.fecha,
            ubicacion: nextEv.ubicacion,
            whatsapp_numero: nextEv.whatsapp_numero || null,
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

module.exports.DEFAULTS = DEFAULTS;
module.exports.OPTIONS = OPTIONS;
module.exports.normalizeOrder = normalizeOrder;
