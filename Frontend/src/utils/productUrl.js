export const generateProductUrl = (id, nombre) => {
  if (!id) return '/tienda';
  if (!nombre) return `/producto/${id}`;
  const slug = nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remover acentos
    .replace(/[^a-z0-9]+/g, '-') // caracteres no alfanuméricos por guiones
    .replace(/(^-|-$)+/g, ''); // eliminar guiones al inicio o final
  return `/producto/${id}-${slug}`;
};
