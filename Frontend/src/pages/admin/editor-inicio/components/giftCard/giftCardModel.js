import {
  GIFT_CARD_DEFAULTS,
  defaultBgForSeccion,
  isValidHexColor,
} from '../../../../../utils/giftCardSection';

export const GIFT_CARD_AREAS = [
  { key: 'perfumeria', label: 'Perfumería' },
  { key: 'hogar', label: 'Hogar' },
];

export const PART_CONTENIDO = 'contenido';
export const PART_IMAGEN = 'imagen';
export const PART_APARIENCIA = 'apariencia';
export const PART_BOTON = 'boton';

export const GIFT_CARD_PARTS = [
  { id: PART_CONTENIDO, label: 'Título y bloques descriptivos', group: 'contenido' },
  { id: PART_IMAGEN, label: 'Imagen principal', group: 'imagen' },
  { id: PART_APARIENCIA, label: 'Color de fondo y contraste', group: 'apariencia' },
  { id: PART_BOTON, label: 'Botón «Conocer más»', group: 'boton' },
];

export function isValidButtonLink(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return true;
  return /^https?:\/\//i.test(trimmed);
}

export function validateGiftCardData(data) {
  if (
    !String(data?.titulo_destacado || '').trim() &&
    !String(data?.titulo_complementario || '').trim()
  ) {
    return 'Escribí al menos una parte del título principal de Gift Card.';
  }
  if (!String(data?.bloque1_titulo || '').trim() || !String(data?.bloque1_descripcion || '').trim()) {
    return 'Completá el título y la descripción del primer bloque descriptivo.';
  }
  if (!String(data?.bloque2_titulo || '').trim() || !String(data?.bloque2_descripcion || '').trim()) {
    return 'Completá el título y la descripción del segundo bloque descriptivo.';
  }
  if (!isValidHexColor(data?.color_fondo)) {
    return 'Ingresá un color de fondo HEX válido de 6 dígitos (ej. #6A0304).';
  }
  if (!String(data?.boton_texto || '').trim()) {
    return 'Escribí el texto del botón.';
  }
  if (!isValidButtonLink(data?.boton_enlace)) {
    return 'El enlace del botón debe comenzar con "/" o con "https://".';
  }
  return null;
}

export function toPreviewData(data, areaKey = 'perfumeria') {
  if (!data) return null;
  const fallbackBg = defaultBgForSeccion(areaKey);
  return {
    ...GIFT_CARD_DEFAULTS,
    ...data,
    color_fondo: isValidHexColor(data.color_fondo)
      ? data.color_fondo.trim().toUpperCase()
      : fallbackBg,
  };
}
