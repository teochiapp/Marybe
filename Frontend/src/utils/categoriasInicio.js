// Configuración visual de la sección Categorías de Inicio (seccion-principal.diseno_categorias).

// Aplica el orden guardado (documentId). Las categorías que no figuran se agregan al final
// en el orden en que llegan de la API, así una categoría nueva nunca queda oculta.
export function orderCategories(categories, order) {
  if (!Array.isArray(order) || !order.length) return categories;
  const position = new Map(order.map((id, index) => [id, index]));
  return categories
    .map((category, index) => ({ category, index, rank: position.has(category.documentId) ? position.get(category.documentId) : order.length + index }))
    .sort((a, b) => a.rank - b.rank)
    .map(entry => entry.category);
}

export const categoriesAreaKey = seccion => (seccion === 'hogar' ? 'hogar' : 'perfumeria');
