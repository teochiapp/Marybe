import { safeBannerLink } from './bannerDesign';
import { CATEGORIA_DESTACADA_ICONOS, findTitleIcon } from './categoriaDestacadaIconos';

export const DEFAULT_WHATSAPP_NUMBER = '5403854211687';

export const PROXIMOS_EVENTOS_DEFAULTS = Object.freeze({
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

export const EVENTOS_ICONO_OPTIONS = Object.freeze([
  { value: 'original', label: 'Calendario', description: 'Ícono original', Icon: null },
  { value: 'ninguno', label: 'Sin ícono', description: 'Ocultar ícono', Icon: null },
  ...CATEGORIA_DESTACADA_ICONOS.filter(item => item.value !== ''),
]);

export const EVENTOS_FUENTE_OPTIONS = Object.freeze([
  { value: 'principal', label: 'Brygada 1918', description: 'Original · con serifa' },
  { value: 'secundaria', label: 'Inter', description: 'Sin serifa' },
]);

export const EVENTOS_TAMANO_OPTIONS = Object.freeze([
  { value: 'chico', label: 'Chico', description: '36 px en escritorio' },
  { value: 'mediano', label: 'Mediano', description: '42 px en escritorio' },
  { value: 'grande', label: 'Grande', description: 'Original · 48 px' },
  { value: 'muy-grande', label: 'Muy grande', description: '56 px en escritorio' },
]);

export const EVENTOS_PESO_OPTIONS = Object.freeze([
  { value: 'normal', label: 'Normal', description: '400' },
  { value: 'semibold', label: 'Semibold', description: 'Original · 600' },
  { value: 'bold', label: 'Bold', description: '700' },
]);

export const EVENTOS_ESTILO_OPTIONS = Object.freeze([
  { value: 'cursiva', label: 'Cursiva', description: 'Original · Italic' },
  { value: 'normal', label: 'Normal', description: 'Recta' },
]);

export const EVENTOS_ALINEACION_OPTIONS = Object.freeze([
  { value: 'izquierda', label: 'Izquierda', description: 'Original' },
  { value: 'centro', label: 'Centro', description: 'Centrado' },
  { value: 'derecha', label: 'Derecha', description: 'Alineado a der.' },
]);

export const EVENTOS_BORDES_OPTIONS = Object.freeze([
  { value: 'cuadrado', label: 'Cuadrado', description: 'Esquinas rectas' },
  { value: 'redondeado', label: 'Redondeado', description: 'Original · 16 px' },
  { value: 'muy-redondeado', label: 'Suave', description: '26 px' },
]);

export const EVENTOS_ESPACIADO_OPTIONS = Object.freeze([
  { value: 'compacto', label: 'Compacto', description: 'Menor separación' },
  { value: 'normal', label: 'Normal', description: 'Original · 24 px' },
  { value: 'amplio', label: 'Amplio', description: 'Mayor aire' },
]);

export const EVENTOS_CANTIDAD_OPTIONS = Object.freeze([
  { value: 'todos', label: 'Todos', description: 'Sin límite' },
  { value: '1', label: '1 evento', description: 'Destaque único' },
  { value: '2', label: '2 eventos', description: 'Par de eventos' },
  { value: '3', label: '3 eventos', description: 'Fila completa' },
  { value: '4', label: '4 eventos', description: 'Hasta 4 tarjetas' },
]);

export const EVENTOS_BOTON_REDONDEO_OPTIONS = Object.freeze([
  { value: 'cuadrado', label: 'Cuadrado', description: 'Esquinas rectas' },
  { value: 'redondeado', label: 'Redondeado', description: 'Original · 12 px' },
  { value: 'pildora', label: 'Píldora', description: 'Bordes circulares' },
]);

const SIZE_MAP = {
  chico: { desktop: '36px', tablet: '32px', mobile: '26px' },
  mediano: { desktop: '42px', tablet: '36px', mobile: '28px' },
  grande: { desktop: '48px', tablet: '40px', mobile: '32px' },
  'muy-grande': { desktop: '56px', tablet: '46px', mobile: '36px' },
};

const WEIGHT_MAP = {
  normal: 400,
  semibold: 600,
  bold: 700,
};

const ALIGN_MAP = {
  izquierda: { alignItems: 'flex-start', textAlign: 'left' },
  centro: { alignItems: 'center', textAlign: 'center' },
  derecha: { alignItems: 'flex-end', textAlign: 'right' },
};

const RADIUS_MAP = {
  cuadrado: '4px',
  redondeado: '16px',
  'muy-redondeado': '26px',
};

const SPACING_MAP = {
  compacto: { gap: '16px', padding: '20px', mobilePadding: '18px' },
  normal: { gap: '24px', padding: '28px', mobilePadding: '24px' },
  amplio: { gap: '32px', padding: '34px', mobilePadding: '28px' },
};

const BTN_RADIUS_MAP = {
  cuadrado: '4px',
  redondeado: '12px',
  pildora: '999px',
};

export function resolveHeaderStyleProps(config = {}) {
  const size = SIZE_MAP[config.tamano] || SIZE_MAP.grande;
  const weight = WEIGHT_MAP[config.peso] || WEIGHT_MAP.semibold;
  const align = ALIGN_MAP[config.alineacion] || ALIGN_MAP.izquierda;
  const fontFamily =
    config.fuente === 'secundaria'
      ? 'var(--font-family-secondary)'
      : 'var(--font-family-primary)';
  const fontStyle = config.estilo === 'normal' ? 'normal' : 'italic';

  return {
    fontFamily,
    fontStyle,
    fontWeight: weight,
    desktopSize: size.desktop,
    tabletSize: size.tablet,
    mobileSize: size.mobile,
    alignItems: align.alignItems,
    textAlign: align.textAlign,
  };
}

export function resolveCardDesignProps(config = {}) {
  const borderRadius = RADIUS_MAP[config.bordes_tarjeta] || RADIUS_MAP.redondeado;
  const spacing = SPACING_MAP[config.espaciado_tarjetas] || SPACING_MAP.normal;
  const buttonRadius = BTN_RADIUS_MAP[config.boton_redondeo] || BTN_RADIUS_MAP.redondeado;

  return {
    cardRadius: borderRadius,
    gridGap: spacing.gap,
    cardPadding: spacing.padding,
    cardMobilePadding: spacing.mobilePadding,
    buttonRadius,
  };
}

export function resolveHeaderCustomIcon(iconoValue) {
  if (!iconoValue || iconoValue === 'original' || iconoValue === 'ninguno') return null;
  const entry = findTitleIcon(iconoValue);
  return entry?.Icon || null;
}

export function buildWhatsappReservaUrl(evento) {
  const message = `Hola, me gustaría reservar un turno para el evento "${evento.titulo || ''}" el día ${evento.fecha || ''} en ${evento.ubicacion || ''}.`;
  const rawNumber = String(evento.whatsapp_numero || '').replace(/[^\d]/g, '');
  const targetNumber = rawNumber || DEFAULT_WHATSAPP_NUMBER;
  return `https://wa.me/${targetNumber}?text=${encodeURIComponent(message)}`;
}

export function applyProximosEventosConfig(rawEventos = [], config = null) {
  const cfg = config && typeof config === 'object' ? config : {};
  const eventosCfg = cfg.eventos && typeof cfg.eventos === 'object' ? cfg.eventos : {};

  const normalizedList = (Array.isArray(rawEventos) ? rawEventos : []).map(item => {
    const base = item.attributes ? { id: item.id, documentId: item.documentId, ...item.attributes } : item;
    const key = base.documentId || String(base.id || '');
    const override = key && eventosCfg[key] ? eventosCfg[key] : {};

    return {
      ...base,
      id: base.id,
      documentId: base.documentId,
      titulo: override.titulo !== undefined ? override.titulo : base.titulo || '',
      descripcion: override.descripcion !== undefined ? override.descripcion : base.descripcion || '',
      fecha: override.fecha !== undefined ? override.fecha : base.fecha || '',
      ubicacion: override.ubicacion !== undefined ? override.ubicacion : base.ubicacion || '',
      whatsapp_numero:
        override.whatsapp_numero !== undefined ? override.whatsapp_numero : base.whatsapp_numero || '',
      boton_texto:
        override.boton_texto || base.boton_texto || PROXIMOS_EVENTOS_DEFAULTS.boton_reserva_texto,
      boton_enlace: safeBannerLink(override.boton_enlace ?? base.boton_enlace) || '',
    };
  });

  let ordered = normalizedList;
  if (Array.isArray(cfg.orden) && cfg.orden.length > 0) {
    const byId = new Map(normalizedList.map(ev => [ev.documentId || String(ev.id), ev]));
    const seen = new Set();
    const nextOrdered = [];
    for (const docId of cfg.orden) {
      if (byId.has(docId) && !seen.has(docId)) {
        seen.add(docId);
        nextOrdered.push(byId.get(docId));
      }
    }
    for (const ev of normalizedList) {
      const key = ev.documentId || String(ev.id);
      if (!seen.has(key)) nextOrdered.push(ev);
    }
    ordered = nextOrdered;
  }

  const cantidadStr = String(cfg.cantidad_visible ?? PROXIMOS_EVENTOS_DEFAULTS.cantidad_visible);
  const limit = ['1', '2', '3', '4'].includes(cantidadStr) ? Number(cantidadStr) : 0;
  const visibleEventos = limit > 0 ? ordered.slice(0, limit) : ordered;

  const rawFooterUrl = String(cfg.enlace_inferior_url ?? PROXIMOS_EVENTOS_DEFAULTS.enlace_inferior_url).trim();
  const safeFooterUrl =
    rawFooterUrl === '#' || !rawFooterUrl ? '#' : safeBannerLink(rawFooterUrl) || '#';

  return {
    titulo: cfg.titulo || PROXIMOS_EVENTOS_DEFAULTS.titulo,
    icono: cfg.icono || PROXIMOS_EVENTOS_DEFAULTS.icono,
    fuente: cfg.fuente || PROXIMOS_EVENTOS_DEFAULTS.fuente,
    tamano: cfg.tamano || PROXIMOS_EVENTOS_DEFAULTS.tamano,
    peso: cfg.peso || PROXIMOS_EVENTOS_DEFAULTS.peso,
    estilo: cfg.estilo || PROXIMOS_EVENTOS_DEFAULTS.estilo,
    alineacion: cfg.alineacion || PROXIMOS_EVENTOS_DEFAULTS.alineacion,
    bordes_tarjeta: cfg.bordes_tarjeta || PROXIMOS_EVENTOS_DEFAULTS.bordes_tarjeta,
    espaciado_tarjetas: cfg.espaciado_tarjetas || PROXIMOS_EVENTOS_DEFAULTS.espaciado_tarjetas,
    cantidad_visible: cantidadStr,
    boton_redondeo: cfg.boton_redondeo || PROXIMOS_EVENTOS_DEFAULTS.boton_redondeo,
    enlace_inferior_texto:
      cfg.enlace_inferior_texto || PROXIMOS_EVENTOS_DEFAULTS.enlace_inferior_texto,
    enlace_inferior_url: safeFooterUrl,
    eventos: visibleEventos,
    todosLosEventos: ordered,
  };
}
