import { PROXIMOS_EVENTOS_DEFAULTS } from '../../../../../utils/proximosEventosSection';

export const PROXIMOS_EVENTOS_AREAS = [{ key: 'general', label: 'Próximos Eventos' }];

export const PART_ENCABEZADO = 'encabezado';
export const PART_ORDEN = 'orden';
export const PART_DISENO = 'diseno';
export const PART_ENLACE = 'enlace-inferior';

export const eventoPart = documentId => `evento-${documentId}`;
export const eventoFromPart = part =>
  /^evento-[a-z0-9_-]+$/i.test(part || '') ? part.slice(7) : null;

export function proximosEventosParts(eventosCatalogo = [], data = null) {
  const eventosMap = data?.eventos || {};
  return [
    { id: PART_ENCABEZADO, label: 'Encabezado y tipografía', group: 'encabezado' },
    { id: PART_ORDEN, label: 'Orden de los eventos', group: 'organizacion' },
    { id: PART_DISENO, label: 'Diseño de tarjetas y grilla', group: 'diseno' },
    { id: PART_ENLACE, label: 'Enlace «Ver todos los eventos»', group: 'enlace' },
    ...eventosCatalogo.map(ev => ({
      id: eventoPart(ev.documentId),
      label: eventosMap[ev.documentId]?.titulo || ev.titulo,
      group: 'eventos',
    })),
  ];
}

export function orderedEventos(data, eventosCatalogo = []) {
  if (!data) return [];
  const byId = new Map(eventosCatalogo.map(ev => [ev.documentId, ev]));
  const seen = new Set();
  const orderedIds = [];
  for (const id of data.orden || []) {
    if (byId.has(id) && !seen.has(id)) {
      seen.add(id);
      orderedIds.push(id);
    }
  }
  for (const ev of eventosCatalogo) {
    if (!seen.has(ev.documentId)) orderedIds.push(ev.documentId);
  }

  return orderedIds.map(id => {
    const base = byId.get(id);
    const ev = data.eventos?.[id] || {};
    const titulo = ev.titulo !== undefined ? ev.titulo : base.titulo || '';
    return {
      ...base,
      titulo,
      nombre: titulo,
      descripcion: ev.descripcion !== undefined ? ev.descripcion : '',
      fecha: ev.fecha !== undefined ? ev.fecha : '',
      ubicacion: ev.ubicacion !== undefined ? ev.ubicacion : '',
      whatsapp_numero: ev.whatsapp_numero !== undefined ? ev.whatsapp_numero : '',
      boton_texto: ev.boton_texto || PROXIMOS_EVENTOS_DEFAULTS.boton_reserva_texto,
      boton_enlace: ev.boton_enlace || '',
    };
  });
}

export function moveItem(list, from, to) {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(Math.max(0, Math.min(next.length, to)), 0, item);
  return next;
}

export function isEventoModified(documentId, data, published) {
  const curr = data?.eventos?.[documentId];
  const pub = published?.eventos?.[documentId];
  if (!curr || !pub) return false;
  return (
    curr.titulo !== pub.titulo ||
    curr.descripcion !== pub.descripcion ||
    curr.fecha !== pub.fecha ||
    curr.ubicacion !== pub.ubicacion ||
    curr.whatsapp_numero !== pub.whatsapp_numero ||
    curr.boton_texto !== pub.boton_texto ||
    curr.boton_enlace !== pub.boton_enlace
  );
}

export function changedEventosCount(data, published) {
  if (!data?.eventos || !published?.eventos) return 0;
  return Object.keys(data.eventos).filter(id => isEventoModified(id, data, published)).length;
}

export function isValidOptionalLink(value, allowHash = false) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return true;
  if (allowHash && trimmed === '#') return true;
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return true;
  return /^https?:\/\//i.test(trimmed);
}

export function validateProximosEventosData(data, eventosCatalogo = []) {
  if (!String(data?.titulo || '').trim()) {
    return 'Escribí el título principal de la sección Próximos Eventos.';
  }
  if (!String(data?.enlace_inferior_texto || '').trim()) {
    return 'Escribí el texto del enlace inferior.';
  }
  if (!isValidOptionalLink(data?.enlace_inferior_url, true)) {
    return 'El enlace inferior debe ser "#" o comenzar con "/" o con "https://".';
  }
  for (const ev of orderedEventos(data, eventosCatalogo)) {
    if (!String(ev.titulo || '').trim()) {
      return 'Todos los eventos deben tener un título.';
    }
    if (!String(ev.descripcion || '').trim()) {
      return `El evento "${ev.titulo}" necesita una descripción.`;
    }
    if (!String(ev.fecha || '').trim()) {
      return `El evento "${ev.titulo}" necesita fecha y horario.`;
    }
    if (!String(ev.ubicacion || '').trim()) {
      return `El evento "${ev.titulo}" necesita una ubicación.`;
    }
    if (!String(ev.boton_texto || '').trim()) {
      return `El botón de reserva del evento "${ev.titulo}" no puede quedar vacío.`;
    }
    if (!isValidOptionalLink(ev.boton_enlace, false)) {
      return `El enlace personalizado del evento "${ev.titulo}" debe comenzar con "/" o con "https://".`;
    }
  }
  return null;
}

export function toPreviewData(data, eventosCatalogo = []) {
  if (!data) return null;
  return {
    ...PROXIMOS_EVENTOS_DEFAULTS,
    ...data,
    eventos: orderedEventos(data, eventosCatalogo),
  };
}
