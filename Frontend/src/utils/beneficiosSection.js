import { imageUrl, safeBannerLink } from './bannerDesign';

export const BENEFICIOS_DEFAULTS = Object.freeze({
  titulo: 'Beneficios para vos',
  info_titulo: '¿Necesitás más información?',
  info_descripcion: 'Consultá todas las promociones vigentes y encontrá la que más te conviene.',
  boton_texto: 'Ver todas las promociones',
  boton_enlace: '',
});

export const TAMANO_LOGO_OPTIONS = Object.freeze([
  { value: 'pequeno', label: 'Pequeño', description: 'Compacto' },
  { value: 'mediano', label: 'Mediano', description: 'Original' },
  { value: 'grande', label: 'Grande', description: 'Destacado' },
]);

export const AJUSTE_LOGO_OPTIONS = Object.freeze([
  { value: 'contener', label: 'Contener', description: 'Completo' },
  { value: 'cubrir', label: 'Cubrir', description: 'Rellenar' },
]);

export const POSICION_LOGO_OPTIONS = Object.freeze([
  { value: 'centro', label: 'Centro', description: 'Centrado' },
  { value: 'izquierda', label: 'Izquierda', description: 'Alineado a izq.' },
  { value: 'derecha', label: 'Derecha', description: 'Alineado a der.' },
  { value: 'arriba', label: 'Arriba', description: 'Borde superior' },
  { value: 'abajo', label: 'Abajo', description: 'Borde inferior' },
]);

const SIZE_MAP = {
  pequeno: { height: '28px', maxWidth: '96px' },
  mediano: { height: '38px', maxWidth: 'min(100%, 120px)' },
  grande: { height: '54px', maxWidth: 'min(100%, 160px)' },
};

const POS_MAP = {
  centro: { objectPosition: 'center center', alignSelf: 'center' },
  izquierda: { objectPosition: 'left center', alignSelf: 'flex-start' },
  derecha: { objectPosition: 'right center', alignSelf: 'flex-end' },
  arriba: { objectPosition: 'center top', alignSelf: 'center' },
  abajo: { objectPosition: 'center bottom', alignSelf: 'center' },
};

export function formatCuotas(cuotas_cantidad) {
  if (!cuotas_cantidad) return null;
  const arr = Array.isArray(cuotas_cantidad) ? cuotas_cantidad : [cuotas_cantidad];
  if (arr.length === 0) return null;
  if (arr.length === 1) return `${arr[0]} cuotas`;
  const last = arr[arr.length - 1];
  const rest = arr.slice(0, -1);
  return `${rest.join(', ')} y ${last} cuotas`;
}

export function formatCuotasInput(cuotas) {
  if (!cuotas) return '';
  if (Array.isArray(cuotas)) return cuotas.join(', ');
  return String(cuotas);
}

export function parseCuotasInput(raw) {
  if (raw == null || raw === '') return [];
  const parts = Array.isArray(raw)
    ? raw
    : String(raw)
        .split(/[,;\sy]+/i)
        .map(part => part.trim())
        .filter(Boolean);
  const seen = new Set();
  const result = [];
  for (const part of parts) {
    const num = Number(part);
    if (Number.isInteger(num) && num >= 1 && num <= 120 && !seen.has(num)) {
      seen.add(num);
      result.push(num);
    }
  }
  return result;
}

export function isDefaultLogoDesign(card = {}) {
  const tamano = card?.tamano_logo || 'mediano';
  const ajuste = card?.ajuste_logo || 'contener';
  const posicion = card?.posicion_logo || 'centro';
  return tamano === 'mediano' && ajuste === 'contener' && posicion === 'centro';
}

export function logoContainerStyle(card = {}) {
  if (isDefaultLogoDesign(card)) return undefined;
  const pos = POS_MAP[card?.posicion_logo] || POS_MAP.centro;
  return {
    justifyContent:
      card?.posicion_logo === 'izquierda'
        ? 'flex-start'
        : card?.posicion_logo === 'derecha'
          ? 'flex-end'
          : 'center',
    alignItems:
      card?.posicion_logo === 'arriba'
        ? 'flex-start'
        : card?.posicion_logo === 'abajo'
          ? 'flex-end'
          : 'center',
    alignSelf: pos.alignSelf,
  };
}

export function logoImgStyle(card = {}) {
  if (isDefaultLogoDesign(card)) return undefined;
  const size = SIZE_MAP[card?.tamano_logo] || SIZE_MAP.mediano;
  const pos = POS_MAP[card?.posicion_logo] || POS_MAP.centro;
  const cubrir = card?.ajuste_logo === 'cubrir';
  return {
    height: size.height,
    maxWidth: size.maxWidth,
    width: cubrir ? size.maxWidth : 'auto',
    objectFit: cubrir ? 'cover' : 'contain',
    objectPosition: pos.objectPosition,
    alignSelf: pos.alignSelf,
  };
}

export function resolveLogoUrl(logo) {
  if (!logo) return null;
  return imageUrl(logo) || null;
}

export function resolveSafeButtonLink(rawLink) {
  return safeBannerLink(rawLink) || '';
}

export function applyBeneficiosConfig(rawPromos = [], config = null) {
  const cfg = config && typeof config === 'object' ? config : {};
  const tarjetasCfg = cfg.tarjetas && typeof cfg.tarjetas === 'object' ? cfg.tarjetas : {};

  const merged = (Array.isArray(rawPromos) ? rawPromos : []).map(promo => {
    const key = promo.documentId || String(promo.id || '');
    const override = key && tarjetasCfg[key] ? tarjetasCfg[key] : {};
    return {
      ...promo,
      nombre: override.nombre !== undefined ? override.nombre : promo.nombre,
      cuotas_descripcion:
        override.cuotas_descripcion !== undefined ? override.cuotas_descripcion : promo.cuotas_descripcion,
      cuotas_cantidad:
        override.cuotas_cantidad !== undefined ? override.cuotas_cantidad : promo.cuotas_cantidad,
      monto_minimo: override.monto_minimo !== undefined ? override.monto_minimo : promo.monto_minimo,
      logo: override.logo !== undefined ? override.logo : promo.logo,
      tamano_logo: override.tamano_logo || promo.tamano_logo || 'mediano',
      ajuste_logo: override.ajuste_logo || promo.ajuste_logo || 'contener',
      posicion_logo: override.posicion_logo || promo.posicion_logo || 'centro',
    };
  });

  let promociones = merged;
  if (Array.isArray(cfg.orden) && cfg.orden.length > 0) {
    const byId = new Map(merged.map(item => [item.documentId || String(item.id), item]));
    const seen = new Set();
    const ordered = [];
    for (const docId of cfg.orden) {
      if (byId.has(docId) && !seen.has(docId)) {
        seen.add(docId);
        ordered.push(byId.get(docId));
      }
    }
    for (const item of merged) {
      const key = item.documentId || String(item.id);
      if (!seen.has(key)) ordered.push(item);
    }
    promociones = ordered;
  }

  return {
    titulo: cfg.titulo || BENEFICIOS_DEFAULTS.titulo,
    info_titulo: cfg.info_titulo || BENEFICIOS_DEFAULTS.info_titulo,
    info_descripcion: cfg.info_descripcion || BENEFICIOS_DEFAULTS.info_descripcion,
    boton_texto: cfg.boton_texto || BENEFICIOS_DEFAULTS.boton_texto,
    boton_enlace: resolveSafeButtonLink(cfg.boton_enlace),
    promociones,
  };
}
