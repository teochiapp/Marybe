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
];

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
  return {
    titulo: data.titulo,
    ...(data.icono ? { icono: data.icono } : {}),
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
