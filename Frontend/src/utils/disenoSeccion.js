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

// ─── Categoría Destacada (1 y 2) ──────────────────────────────────────────────
// Tamaños de título [computadora, celular ≤768 px]: 'grande' conserva el tamaño original (2.5rem / 2rem).
export const CATEGORIA_DESTACADA_TAMANOS = {
  chico: ['1.9rem', '1.5rem'],
  mediano: ['2.2rem', '1.75rem'],
  grande: ['2.5rem', '2rem'],
  'muy-grande': ['3rem', '2.25rem'],
};

// Separación vertical [computadora, ≤1024 px, ≤768 px]: 'original' conserva 40px / 30px / 20px.
export const CATEGORIA_DESTACADA_ESPACIADOS = {
  compacto: ['24px', '18px', '14px'],
  original: ['40px', '30px', '20px'],
  amplio: ['64px', '44px', '32px'],
};

// Densidad de las tarjetas del carrusel por dispositivo: 'original' conserva las dimensiones originales.
export const CATEGORIA_DESTACADA_DENSIDADES = {
  compacta: {
    desktop: { cardWidth: '236px', cardPadding: '16px', cardRadius: '20px', imageHeight: '200px', gap: '24px' },
    tablet: { cardWidth: '224px', cardPadding: '16px', cardRadius: '20px', imageHeight: '190px', gap: '20px' },
    mobile: { cardWidth: '190px', cardPadding: '10px', cardRadius: '16px', imageHeight: '135px', gap: '14px' },
  },
  original: {
    desktop: { cardWidth: '290px', cardPadding: '20px', cardRadius: '24px', imageHeight: '250px', gap: '40px' },
    tablet: { cardWidth: '280px', cardPadding: '20px', cardRadius: '24px', imageHeight: '250px', gap: '30px' },
    mobile: { cardWidth: '240px', cardPadding: '12px', cardRadius: '18px', imageHeight: '160px', gap: '20px' },
  },
  amplia: {
    desktop: { cardWidth: '340px', cardPadding: '24px', cardRadius: '26px', imageHeight: '280px', gap: '48px' },
    tablet: { cardWidth: '320px', cardPadding: '22px', cardRadius: '24px', imageHeight: '260px', gap: '36px' },
    mobile: { cardWidth: '272px', cardPadding: '16px', cardRadius: '20px', imageHeight: '185px', gap: '24px' },
  },
};

export const CATEGORIA_DESTACADA_ENCUADRES = {
  original: 'contain',
  cubrir: 'cover',
};

export const CATEGORIA_DESTACADA_DISENO_ORIGINAL = Object.freeze({
  tamano: 'grande',
  alineacion: 'izquierda',
  fondo: 'blanco',
  espaciado: 'original',
  densidad: 'original',
  densidad_desktop: 'heredar',
  densidad_tablet: 'heredar',
  densidad_mobile: 'heredar',
  encuadre: 'original',
  encuadre_desktop: 'heredar',
  encuadre_tablet: 'heredar',
  encuadre_mobile: 'heredar',
});

function pickTamano(val) {
  if (val === 'original') return 'grande';
  return valid(CATEGORIA_DESTACADA_TAMANOS, val) ? val : 'grande';
}
function pickAlineacion(val) {
  if (val === 'original') return 'izquierda';
  return valid(SECCION_ALINEACIONES, val) ? val : 'izquierda';
}
function pickFondo(val) {
  if (val === 'original') return 'blanco';
  return valid(SECCION_FONDOS, val) ? val : 'blanco';
}
function pickEspaciado(val) {
  return valid(CATEGORIA_DESTACADA_ESPACIADOS, val) ? val : 'original';
}
function pickDensidad(val, allowInherit = false) {
  if (allowInherit && (val === 'heredar' || !val)) return 'heredar';
  return valid(CATEGORIA_DESTACADA_DENSIDADES, val) ? val : 'original';
}
function pickEncuadre(val, allowInherit = false) {
  if (allowInherit && (val === 'heredar' || !val)) return 'heredar';
  if (val === 'contener') return 'original';
  return valid(CATEGORIA_DESTACADA_ENCUADRES, val) ? val : 'original';
}

// Resuelve el diseño de Categoría Destacada (1 y 2) aplicando la herencia del ajuste general por dispositivo.
export function disenoCategoriaDestacada(raw) {
  const source = raw?.diseno && typeof raw.diseno === 'object' ? { ...raw, ...raw.diseno } : raw && typeof raw === 'object' ? raw : {};
  const tamano = pickTamano(source.tamano);
  const alineacion = pickAlineacion(source.alineacion);
  const fondo = pickFondo(source.fondo);
  const espaciado = pickEspaciado(source.espaciado);
  const densidad = pickDensidad(source.densidad, false);
  const densidad_desktop = pickDensidad(source.densidad_desktop, true);
  const densidad_tablet = pickDensidad(source.densidad_tablet, true);
  const densidad_mobile = pickDensidad(source.densidad_mobile, true);
  const encuadre = pickEncuadre(source.encuadre, false);
  const encuadre_desktop = pickEncuadre(source.encuadre_desktop, true);
  const encuadre_tablet = pickEncuadre(source.encuadre_tablet, true);
  const encuadre_mobile = pickEncuadre(source.encuadre_mobile, true);

  const effectiveDensidad = {
    desktop: densidad_desktop !== 'heredar' ? densidad_desktop : densidad,
    tablet: densidad_tablet !== 'heredar' ? densidad_tablet : densidad,
    mobile: densidad_mobile !== 'heredar' ? densidad_mobile : densidad,
  };
  const effectiveEncuadre = {
    desktop: encuadre_desktop !== 'heredar' ? encuadre_desktop : encuadre,
    tablet: encuadre_tablet !== 'heredar' ? encuadre_tablet : encuadre,
    mobile: encuadre_mobile !== 'heredar' ? encuadre_mobile : encuadre,
  };

  return {
    tamano,
    alineacion,
    fondo,
    espaciado,
    densidad,
    densidad_desktop,
    densidad_tablet,
    densidad_mobile,
    encuadre,
    encuadre_desktop,
    encuadre_tablet,
    encuadre_mobile,
    effectiveDensidad,
    effectiveEncuadre,
    metrics: {
      desktop: CATEGORIA_DESTACADA_DENSIDADES[effectiveDensidad.desktop].desktop,
      tablet: CATEGORIA_DESTACADA_DENSIDADES[effectiveDensidad.tablet].tablet,
      mobile: CATEGORIA_DESTACADA_DENSIDADES[effectiveDensidad.mobile].mobile,
    },
    objectFit: {
      desktop: CATEGORIA_DESTACADA_ENCUADRES[effectiveEncuadre.desktop],
      tablet: CATEGORIA_DESTACADA_ENCUADRES[effectiveEncuadre.tablet],
      mobile: CATEGORIA_DESTACADA_ENCUADRES[effectiveEncuadre.mobile],
    },
  };
}
