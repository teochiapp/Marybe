export const CATEGORIAS_AREAS = [
  { key: 'perfumeria', label: 'Perfumería' },
  { key: 'hogar', label: 'Hogar' },
];

// El primer valor de cada grupo es el diseño original de la sección.
export const FORMA_OPTIONS = [
  { value: 'redondeado', label: 'Bordes redondeados', description: 'Diseño original' },
  { value: 'rectangular', label: 'Rectangular', description: 'Esquinas rectas' },
  { value: 'cuadrado', label: 'Cuadrado', description: 'Tarjetas de igual ancho y alto' },
  { value: 'circular', label: 'Circular', description: 'Imagen redonda con el botón debajo' },
];
export const BOTON_OPTIONS = [
  { value: 'pildora', label: 'Píldora', description: 'Diseño original' },
  { value: 'redondeado', label: 'Redondeado', description: 'Esquinas suaves' },
  { value: 'cuadrado', label: 'Cuadrado', description: 'Esquinas rectas' },
];
export const ESTILO_BOTON_OPTIONS = [
  { value: 'relleno', label: 'Bordó', description: 'Diseño original' },
  { value: 'claro', label: 'Claro', description: 'Fondo blanco y texto bordó' },
];

export const categoryPart = documentId => `categoria-${documentId}`;
export const categoryFromPart = part => (/^categoria-[a-z0-9]+$/i.test(part || '') ? part.slice(10) : null);

export function categoriasParts(categories) {
  return [
    ...categories.map(category => ({ id: categoryPart(category.documentId), label: category.nombre, group: 'contenido' })),
    { id: 'orden', label: 'Orden de las categorías', group: 'organizacion' },
    { id: 'forma', label: 'Forma de las tarjetas', group: 'diseno' },
    { id: 'botones', label: 'Estilo de los botones', group: 'diseno' },
  ];
}

export function orderedCategories(data, categories) {
  const byId = new Map(categories.map(category => [category.documentId, category]));
  return data.orden.map(id => byId.get(id)).filter(Boolean).map(category => ({ ...category, portada: data.portadas[category.documentId] || null }));
}

export function moveItem(list, from, to) {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(Math.max(0, Math.min(next.length, to)), 0, item);
  return next;
}

export function toPreviewData(data, categories) {
  return { categorias: orderedCategories(data, categories), diseno: { forma: data.forma, boton: data.boton, estiloBoton: data.estiloBoton } };
}

export function changedCovers(data, published) {
  return Object.keys(data.portadas).filter(id => (data.portadas[id]?.id ?? null) !== (published.portadas[id]?.id ?? null));
}
