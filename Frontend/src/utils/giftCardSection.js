import { imageUrl, safeBannerLink } from './bannerDesign';
import { CATEGORIA_DESTACADA_ICONOS, findTitleIcon } from './categoriaDestacadaIconos';

export const DEFAULT_GIFT_CARD_IMAGE = '/inicio/giftcard.webp';

export const GIFT_CARD_DEFAULTS = Object.freeze({
  titulo_destacado: 'Regalá',
  titulo_complementario: 'Marybe',
  bloque1_titulo: 'Producto',
  bloque1_descripcion: 'Elegí el producto perfecto para regalar',
  bloque1_icono: 'original',
  bloque2_titulo: 'Monto personalizado',
  bloque2_descripcion: 'Vos elegís cuánto regalar',
  bloque2_icono: 'original',
  imagen: null,
  imagen_tamano: 'mediano',
  imagen_posicion_x: 'centro',
  imagen_posicion_y: 'centro',
  imagen_ajuste: 'contener',
  modo_texto: 'auto',
  boton_texto: 'Conocer más',
  boton_enlace: '/gift-card',
});

export const IMAGEN_TAMANO_OPTIONS = Object.freeze([
  { value: 'pequeno', label: 'Pequeño', description: 'Compacto' },
  { value: 'mediano', label: 'Mediano', description: 'Original' },
  { value: 'grande', label: 'Grande', description: 'Destacado' },
]);

export const IMAGEN_POSICION_X_OPTIONS = Object.freeze([
  { value: 'izquierda', label: 'Izquierda', description: 'Más a la izq.' },
  { value: 'centro', label: 'Centro', description: 'Original' },
  { value: 'derecha', label: 'Derecha', description: 'Más a la der.' },
]);

export const IMAGEN_POSICION_Y_OPTIONS = Object.freeze([
  { value: 'arriba', label: 'Arriba', description: 'Más arriba' },
  { value: 'centro', label: 'Centro', description: 'Original' },
  { value: 'abajo', label: 'Abajo', description: 'Más abajo' },
]);

export const IMAGEN_AJUSTE_OPTIONS = Object.freeze([
  { value: 'contener', label: 'Contener', description: 'Sin recortar' },
  { value: 'cubrir', label: 'Cubrir', description: 'Llenar espacio' },
]);

export const MODO_TEXTO_OPTIONS = Object.freeze([
  { value: 'auto', label: 'Automático', description: 'Según contraste' },
  { value: 'claro', label: 'Texto claro', description: 'Blanco y crema' },
  { value: 'oscuro', label: 'Texto oscuro', description: 'Bordó oscuro' },
]);

export const GIFT_CARD_COLOR_PRESETS = Object.freeze([
  { value: '#6A0304', label: 'Bordó Gift Card' },
  { value: '#B10002', label: 'Rojo Hogar' },
  { value: '#7C0405', label: 'Bordó secundario' },
  { value: '#560203', label: 'Bordó profundo' },
  { value: '#3E0102', label: 'Marrón principal' },
  { value: '#280101', label: 'Marrón oscuro' },
  { value: '#F7F3EC', label: 'Crema Gift Card' },
  { value: '#F6F4F0', label: 'Arena suave' },
  { value: '#E7E2DA', label: 'Piedra cálido' },
]);

export const GIFT_CARD_ICON_OPTIONS = Object.freeze([
  { value: 'original', label: 'Original', description: 'Ícono actual', Icon: null },
  { value: 'ninguno', label: 'Sin ícono', description: 'Solo el texto', Icon: null },
  ...CATEGORIA_DESTACADA_ICONOS.filter(item => item.value !== ''),
]);

export function defaultBgForSeccion(seccion) {
  return seccion === 'hogar' ? '#B10002' : '#6A0304';
}

export function isValidHexColor(value) {
  return typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value.trim());
}

export function computeLuminance(hex) {
  if (!isValidHexColor(hex)) return 0.1;
  const clean = hex.trim().slice(1);
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const toLinear = c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export function resolveTextTone(colorFondo, modoTexto = 'auto') {
  if (modoTexto === 'claro') return 'claro';
  if (modoTexto === 'oscuro') return 'oscuro';
  return computeLuminance(colorFondo) > 0.42 ? 'oscuro' : 'claro';
}

export function resolveThemeColors(colorFondo, modoTexto = 'auto') {
  const tone = resolveTextTone(colorFondo, modoTexto);
  if (tone === 'oscuro') {
    return {
      tone: 'oscuro',
      textColor: '#280101',
      descColor: 'rgba(40, 1, 1, 0.78)',
      dividerColor: 'rgba(40, 1, 1, 0.2)',
      iconStroke: '#280101',
      btnBg: '#7C0405',
      btnText: '#FFFFFF',
      btnHoverBg: '#560203',
    };
  }
  return {
    tone: 'claro',
    textColor: 'var(--color-blanco)',
    descColor: 'rgba(255, 255, 255, 0.75)',
    dividerColor: 'rgba(255, 255, 255, 0.25)',
    iconStroke: '#FAF9F7',
    btnBg: 'var(--color-blanco)',
    btnText: 'var(--color-marron-tercero)',
    btnHoverBg: 'var(--color-rosa-tercero)',
  };
}

export function resolveGiftCardImageProps(config = {}) {
  const customUrl = imageUrl(config?.imagen);
  const src = customUrl || DEFAULT_GIFT_CARD_IMAGE;
  const scale =
    config?.imagen_tamano === 'pequeno'
      ? 0.84
      : config?.imagen_tamano === 'grande'
        ? 1.16
        : 1;
  const offsetX =
    config?.imagen_posicion_x === 'izquierda'
      ? -36
      : config?.imagen_posicion_x === 'derecha'
        ? 36
        : 0;
  const offsetY =
    config?.imagen_posicion_y === 'arriba'
      ? -24
      : config?.imagen_posicion_y === 'abajo'
        ? 24
        : 0;
  const objectFit = config?.imagen_ajuste === 'cubrir' ? 'cover' : 'contain';

  return { src, scale, offsetX, offsetY, objectFit, isCustomImage: Boolean(customUrl) };
}

export function resolveFeatureIconComponent(iconValue) {
  if (!iconValue || iconValue === 'original' || iconValue === 'ninguno') return null;
  const entry = findTitleIcon(iconValue);
  return entry?.Icon || null;
}

export function normalizeGiftCardConfig(raw = null, seccion = 'perfumeria') {
  const cfg = raw && typeof raw === 'object' ? raw : {};
  const defaultBg = defaultBgForSeccion(seccion);
  const color_fondo = isValidHexColor(cfg.color_fondo)
    ? cfg.color_fondo.trim().toUpperCase()
    : defaultBg;
  const safeLink = safeBannerLink(cfg.boton_enlace);

  return {
    titulo_destacado: cfg.titulo_destacado ?? GIFT_CARD_DEFAULTS.titulo_destacado,
    titulo_complementario: cfg.titulo_complementario ?? GIFT_CARD_DEFAULTS.titulo_complementario,
    bloque1_titulo: cfg.bloque1_titulo || GIFT_CARD_DEFAULTS.bloque1_titulo,
    bloque1_descripcion: cfg.bloque1_descripcion || GIFT_CARD_DEFAULTS.bloque1_descripcion,
    bloque1_icono: cfg.bloque1_icono || GIFT_CARD_DEFAULTS.bloque1_icono,
    bloque2_titulo: cfg.bloque2_titulo || GIFT_CARD_DEFAULTS.bloque2_titulo,
    bloque2_descripcion: cfg.bloque2_descripcion || GIFT_CARD_DEFAULTS.bloque2_descripcion,
    bloque2_icono: cfg.bloque2_icono || GIFT_CARD_DEFAULTS.bloque2_icono,
    imagen: cfg.imagen || null,
    imagen_tamano: cfg.imagen_tamano || GIFT_CARD_DEFAULTS.imagen_tamano,
    imagen_posicion_x: cfg.imagen_posicion_x || GIFT_CARD_DEFAULTS.imagen_posicion_x,
    imagen_posicion_y: cfg.imagen_posicion_y || GIFT_CARD_DEFAULTS.imagen_posicion_y,
    imagen_ajuste: cfg.imagen_ajuste || GIFT_CARD_DEFAULTS.imagen_ajuste,
    color_fondo,
    modo_texto: cfg.modo_texto || GIFT_CARD_DEFAULTS.modo_texto,
    boton_texto: cfg.boton_texto || GIFT_CARD_DEFAULTS.boton_texto,
    boton_enlace: safeLink || GIFT_CARD_DEFAULTS.boton_enlace,
  };
}
