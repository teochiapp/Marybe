import { CATEGORIA_DESTACADA_DISENO_ORIGINAL } from '../../../../../utils/disenoSeccion';
import {
  ALINEACION_OPTIONS,
  AREA_COLORS,
  ESPACIADO_OPTIONS,
  FONDO_OPTIONS,
  TAMANO_OPTIONS,
  labelOf,
} from '../ofertas/ofertasModel';

export {
  ALINEACION_OPTIONS,
  AREA_COLORS,
  CATEGORIA_DESTACADA_DISENO_ORIGINAL,
  ESPACIADO_OPTIONS,
  FONDO_OPTIONS,
  TAMANO_OPTIONS,
  labelOf,
};

export const CATEGORIA_DESTACADA_AREAS = [
  { key: 'perfumeria', label: 'Perfumería' },
  { key: 'hogar', label: 'Hogar' },
];
export const MAX_PRODUCTS = 25;

export const CATEGORIA_DESTACADA_MODULES = {
  'categoria-destacada-1': {
    key: 'categoria-destacada-1',
    title: 'Categoría Destacada (1)',
    eyebrow: 'CATEGORÍA DESTACADA (1)',
    ordinal: 'Primera categoría destacada',
    otherTitle: 'Categoría Destacada (2)',
    endpoint: '/api/categoria-destacada-admin',
  },
  'categoria-destacada-2': {
    key: 'categoria-destacada-2',
    title: 'Categoría Destacada (2)',
    eyebrow: 'CATEGORÍA DESTACADA (2)',
    ordinal: 'Segunda categoría destacada',
    otherTitle: 'Categoría Destacada (1)',
    endpoint: '/api/categoria-destacada-admin/modulo/categoria-destacada-2',
  },
};

export const CATEGORIA_DESTACADA_PARTS = [
  { id: 'contenido', label: 'Categoría y título', group: 'contenido' },
  { id: 'productos', label: 'Productos de la sección', group: 'productos' },
  { id: 'diseno', label: 'Fondo, espaciado y tarjetas', group: 'diseno' },
];

export const DENSIDAD_OPTIONS = [
  { value: 'original', label: 'Original', description: 'Diseño original' },
  { value: 'compacta', label: 'Compacta', description: 'Más tarjetas en vista' },
  { value: 'amplia', label: 'Amplia', description: 'Tarjetas más grandes' },
];

export const DENSIDAD_DISPOSITIVO_OPTIONS = [
  { value: 'heredar', label: 'Heredar', description: 'Ajuste general' },
  ...DENSIDAD_OPTIONS,
];

export const ENCUADRE_OPTIONS = [
  { value: 'original', label: 'Original', description: 'Producto completo' },
  { value: 'cubrir', label: 'Cubrir', description: 'Llenar recuadro' },
];

export const ENCUADRE_DISPOSITIVO_OPTIONS = [
  { value: 'heredar', label: 'Heredar', description: 'Ajuste general' },
  ...ENCUADRE_OPTIONS,
];

export const DEVICE_OVERRIDES = [
  { key: 'desktop', label: 'Computadora', densidadKey: 'densidad_desktop', encuadreKey: 'encuadre_desktop' },
  { key: 'tablet', label: 'Tablet', densidadKey: 'densidad_tablet', encuadreKey: 'encuadre_tablet' },
  { key: 'mobile', label: 'Celular', densidadKey: 'densidad_mobile', encuadreKey: 'encuadre_mobile' },
];

const DESIGN_KEYS = Object.keys(CATEGORIA_DESTACADA_DISENO_ORIGINAL);

export function moveItem(list, from, to) {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(Math.max(0, Math.min(next.length, to)), 0, item);
  return next;
}

// Sin selección manual la landing muestra los primeros productos de la categoría (orden del catálogo).
export function shownProducts(data, productIndex, automatic) {
  if (data.productos.length) return data.productos.map(id => productIndex[id]).filter(Boolean);
  return automatic.slice(0, MAX_PRODUCTS);
}

export function toPreviewData(data, productIndex, automatic) {
  const design = {};
  for (const key of DESIGN_KEYS) {
    if (data[key]) design[key] = data[key];
  }
  return {
    titulo: data.titulo,
    ...(data.icono ? { icono: data.icono } : {}),
    ...design,
    productos: shownProducts(data, productIndex, automatic),
  };
}

export function publishProblems(data) {
  const problems = [];
  if (!data.titulo?.trim()) problems.push({ part: 'contenido', message: 'Escribí el título de la sección.' });
  if (!data.categoria) problems.push({ part: 'contenido', message: 'Elegí la categoría de la sección.' });
  if (data.productos.length > MAX_PRODUCTS) problems.push({ part: 'productos', message: `La sección muestra hasta ${MAX_PRODUCTS} productos.` });
  return problems;
}
