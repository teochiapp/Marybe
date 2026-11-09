import { BENEFICIOS_DEFAULTS } from '../../../../../utils/beneficiosSection';

export const BENEFICIOS_AREAS = [{ key: 'general', label: 'Beneficios' }];

export const PART_CONTENIDO = 'contenido-general';
export const PART_ORDEN = 'orden';

export const cardPart = documentId => `beneficio-${documentId}`;
export const cardFromPart = part =>
  /^beneficio-[a-z0-9_-]+$/i.test(part || '') ? part.slice(10) : null;

export function beneficiosParts(promociones = [], data = null) {
  const tarjetas = data?.tarjetas || {};
  return [
    { id: PART_CONTENIDO, label: 'Textos y botón inferior', group: 'general' },
    { id: PART_ORDEN, label: 'Orden de beneficios', group: 'organizacion' },
    ...promociones.map(promo => ({
      id: cardPart(promo.documentId),
      label: tarjetas[promo.documentId]?.nombre || promo.nombre,
      group: 'tarjetas',
    })),
  ];
}

export function orderedPromociones(data, promociones = []) {
  if (!data) return [];
  const byId = new Map(promociones.map(promo => [promo.documentId, promo]));
  const seen = new Set();
  const orderedIds = [];
  for (const id of data.orden || []) {
    if (byId.has(id) && !seen.has(id)) {
      seen.add(id);
      orderedIds.push(id);
    }
  }
  for (const promo of promociones) {
    if (!seen.has(promo.documentId)) orderedIds.push(promo.documentId);
  }
  return orderedIds.map(id => {
    const base = byId.get(id);
    const card = data.tarjetas?.[id] || {};
    const logo = card.logo !== undefined ? card.logo : base.logo || null;
    return {
      ...base,
      nombre: card.nombre !== undefined ? card.nombre : base.nombre,
      cuotas_descripcion:
        card.cuotas_descripcion !== undefined ? card.cuotas_descripcion : base.cuotas_descripcion,
      cuotas_cantidad:
        card.cuotas_cantidad !== undefined ? card.cuotas_cantidad : base.cuotas_cantidad || [],
      monto_minimo: card.monto_minimo !== undefined ? card.monto_minimo : base.monto_minimo || '',
      logo,
      portada: logo,
      tamano_logo: card.tamano_logo || 'mediano',
      ajuste_logo: card.ajuste_logo || 'contener',
      posicion_logo: card.posicion_logo || 'centro',
    };
  });
}

export function moveItem(list, from, to) {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(Math.max(0, Math.min(next.length, to)), 0, item);
  return next;
}

export function isCardModified(documentId, data, published) {
  const curr = data?.tarjetas?.[documentId];
  const pub = published?.tarjetas?.[documentId];
  if (!curr || !pub) return false;
  return (
    curr.nombre !== pub.nombre ||
    curr.cuotas_descripcion !== pub.cuotas_descripcion ||
    curr.monto_minimo !== pub.monto_minimo ||
    JSON.stringify(curr.cuotas_cantidad || []) !== JSON.stringify(pub.cuotas_cantidad || []) ||
    (curr.logo?.id ?? null) !== (pub.logo?.id ?? null) ||
    curr.tamano_logo !== pub.tamano_logo ||
    curr.ajuste_logo !== pub.ajuste_logo ||
    curr.posicion_logo !== pub.posicion_logo
  );
}

export function changedCardsCount(data, published) {
  if (!data?.tarjetas || !published?.tarjetas) return 0;
  return Object.keys(data.tarjetas).filter(id => isCardModified(id, data, published)).length;
}

export function isValidButtonLink(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return true;
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return true;
  return /^https?:\/\//i.test(trimmed);
}

export function validateBeneficiosData(data, promociones = []) {
  if (!String(data?.titulo || '').trim()) {
    return 'Escribí un título principal para la sección Beneficios.';
  }
  if (!String(data?.info_titulo || '').trim()) {
    return 'Escribí un título para el bloque informativo inferior.';
  }
  if (!String(data?.info_descripcion || '').trim()) {
    return 'Escribí la descripción del bloque informativo inferior.';
  }
  if (!String(data?.boton_texto || '').trim()) {
    return 'Escribí el texto del botón inferior.';
  }
  if (!isValidButtonLink(data?.boton_enlace)) {
    return 'El enlace del botón debe comenzar con "/" o con "https://".';
  }
  for (const promo of orderedPromociones(data, promociones)) {
    if (!String(promo.nombre || '').trim()) {
      return 'Todas las tarjetas de beneficio deben tener un nombre.';
    }
    const hasCuotas = Array.isArray(promo.cuotas_cantidad) && promo.cuotas_cantidad.length > 0;
    if (!String(promo.cuotas_descripcion || '').trim() && !hasCuotas) {
      return `El beneficio "${promo.nombre}" necesita texto descriptivo o cantidad de cuotas.`;
    }
  }
  return null;
}

export function toPreviewData(data, promociones = []) {
  if (!data) return null;
  return {
    titulo: data.titulo || BENEFICIOS_DEFAULTS.titulo,
    info_titulo: data.info_titulo || BENEFICIOS_DEFAULTS.info_titulo,
    info_descripcion: data.info_descripcion || BENEFICIOS_DEFAULTS.info_descripcion,
    boton_texto: data.boton_texto || BENEFICIOS_DEFAULTS.boton_texto,
    boton_enlace: data.boton_enlace || '',
    orden: data.orden,
    promociones: orderedPromociones(data, promociones),
  };
}
