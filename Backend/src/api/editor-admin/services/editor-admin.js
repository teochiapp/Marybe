'use strict';

const UID_PRODUCTO = 'api::producto.producto';
const PAGE_SIZE    = 150;

// ─── Obtener proveedores únicos ───────────────────────────────────────────────
async function fetchProveedores() {
  const todos = [];
  let page    = 1;

  while (true) {
    const resultado = await strapi.documents(UID_PRODUCTO).findMany({
      fields: ['proveedor'],
      limit:  PAGE_SIZE,
      start:  (page - 1) * PAGE_SIZE,
      status: 'published',
    });
    if (!resultado || resultado.length === 0) break;
    todos.push(...resultado);
    if (resultado.length < PAGE_SIZE) break;
    page++;
  }

  return [
    ...new Set(
      todos
        .map(p => (p.proveedor || '').trim())
        .filter(p => p.length > 0)
    ),
  ].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
}

// ─── Obtener productos de un proveedor con imágenes ──────────────────────────
// NOTA: 'documentId' NO va en fields — Strapi v5 lo retorna siempre automáticamente.
// Se agrega status:'published' para traer los datos que ve el frontend.
async function fetchProductosPorProveedor(proveedor) {
  const todos = [];
  let page    = 1;

  while (true) {
    const resultado = await strapi.documents(UID_PRODUCTO).findMany({
      filters: { proveedor: { $eqi: proveedor } },
      fields:  ['id_original', 'nombre', 'marca', 'proveedor', 'precio', 'precio_oferta', 'stock'],
      populate: {
        portada: {
          fields: ['id', 'name', 'url', 'width', 'height', 'size'],
        },
        galeria: {
          fields: ['id', 'name', 'url', 'width', 'height', 'size'],
        },
      },
      limit:  PAGE_SIZE,
      start:  (page - 1) * PAGE_SIZE,
      status: 'published',
    });
    if (!resultado || resultado.length === 0) break;
    todos.push(...resultado);
    if (resultado.length < PAGE_SIZE) break;
    page++;
  }

  // Ordenar: nombre A→Z
  todos.sort((a, b) => {
    const na = (a.nombre || '').toLowerCase().trim();
    const nb = (b.nombre || '').toLowerCase().trim();
    return na < nb ? -1 : na > nb ? 1 : 0;
  });

  return todos;
}

// ─── Buscar producto por SKU / EAN ───────────────────────────────────────────────
// Busca únicamente en el campo sku (EAN/código de barras), case-insensitive.
async function fetchProductosPorSKU(query) {
  if (!query || query.trim().length < 2) return [];

  const q = query.trim();

  const resultado = await strapi.documents(UID_PRODUCTO).findMany({
    filters: { sku: { $containsi: q } },
    fields:  ['id_original', 'sku', 'nombre', 'marca', 'proveedor', 'precio', 'precio_oferta', 'stock'],
    populate: {
      portada: { fields: ['id', 'name', 'url', 'width', 'height', 'size'] },
      galeria: { fields: ['id', 'name', 'url', 'width', 'height', 'size'] },
    },
    limit:  20,
    start:  0,
    status: 'published',
  });

  return resultado || [];
}

// ─── Exports ──────────────────────────────────────────────────────────────────
module.exports = () => ({
  fetchProveedores,
  fetchProductosPorProveedor,
  fetchProductosPorSKU,
});
