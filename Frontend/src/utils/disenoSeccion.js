// Diseño configurable de las secciones de Inicio sin modelo propio (Editor de Inicio → seccion-principal.diseno_secciones).
// Solo opciones predefinidas; cada valor por defecto reproduce el diseño original de la sección.
export const SECCION_FUENTES = {
  secundaria: 'var(--font-family-secondary)',
  principal: 'var(--font-family-primary)',
};
// [computadora, celular ≤768 px, celular ≤400 px]
export const SECCION_TAMANOS = {
  chico: ['1.9rem', '1.15rem', '1rem'],
  mediano: ['2.2rem', '1.3rem', '1.1rem'],
  grande: ['2.5rem', '1.4rem', '1.2rem'],
  'muy-grande': ['3rem', '1.65rem', '1.4rem'],
};
export const SECCION_PESOS = { normal: 400, semibold: 600, bold: 700 };
export const SECCION_ALINEACIONES = { izquierda: 'left', centro: 'center', derecha: 'right' };
// 'original' conserva el color propio de cada área.
export const SECCION_COLORES = {
  original: null,
  'bordo-secundario': 'var(--color-bordo-secundario)',
  'bordo-tercero': 'var(--color-bordo-tercero)',
  'marron-principal': 'var(--color-marron-principal)',
  'marron-cuarto': 'var(--color-marron-cuarto)',
  hogar: 'var(--color-hogar)',
};
export const SECCION_FONDOS = {
  blanco: 'var(--color-blanco)',
  arena: 'var(--color-fondo-tarjetas-promo)',
  rosado: 'var(--color-blanco-pero-no-tan-blanco)',
};
// Margen superior e inferior: [computadora, ≤1024 px]
export const SECCION_ESPACIADOS = {
  compacto: ['24px', '18px'],
  original: ['40px', '30px'],
  amplio: ['64px', '44px'],
};

export const SECCION_ORIGINAL = { fuente: 'secundaria', tamano: 'grande', peso: 'semibold', alineacion: 'izquierda', color: 'original', fondo: 'blanco', espaciado: 'original' };

const MAPS = { fuente: SECCION_FUENTES, tamano: SECCION_TAMANOS, peso: SECCION_PESOS, alineacion: SECCION_ALINEACIONES, color: SECCION_COLORES, fondo: SECCION_FONDOS, espaciado: SECCION_ESPACIADOS };
const valid = (map, value) => typeof value === 'string' && Object.prototype.hasOwnProperty.call(map, value);

// Configuración segura a partir de lo guardado: lo inválido o ausente vuelve al diseño original.
export function disenoSeccion(config, defaultTitle) {
  const value = config && typeof config === 'object' ? config : {};
  const result = { titulo: typeof value.titulo === 'string' && value.titulo.trim() ? value.titulo.trim() : defaultTitle };
  for (const [name, map] of Object.entries(MAPS)) result[name] = valid(map, value[name]) ? value[name] : SECCION_ORIGINAL[name];
  return result;
}
