'use strict';

/**
 * Cannon Integration — Service
 *
 * Búsqueda por EAN-13:
 *   1. Busca en variantes (sku_ean) de todos los productos publicados
 *   2. Si no hay, busca en el producto padre (sku)
 *   3. Si no se encuentra → null (el controller devuelve 404)
 *
 * Precio: precio_oferta si existe, si no precio.
 * URL: SITE_URL + /producto/{id_original}-{slug-nombre}
 */

const UID_PRODUCTO = 'api::producto.producto';

/**
 * Genera el slug del nombre de producto (igual al helper del frontend)
 */
function slugify(nombre) {
  if (!nombre) return '';
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')       // quitar acentos
    .replace(/[^a-z0-9]+/g, '-')           // no alfanuméricos → guiones
    .replace(/(^-|-$)+/g, '');             // quitar guiones extremos
}

/**
 * Construye la URL absoluta del producto en Marybe
 */
function buildProductUrl(idOriginal, nombre) {
  const base = (process.env.SITE_URL || 'https://marybe.surcodes.com').replace(/\/$/, '');
  if (!nombre) return `${base}/producto/${idOriginal}`;
  return `${base}/producto/${idOriginal}-${slugify(nombre)}`;
}

/**
 * Busca un producto por EAN y devuelve { stock, price, url } o null.
 */
async function buscarPorEan(strapi, ean) {
  const eanTrimmed = (ean || '').trim();
  if (!eanTrimmed) return null;

  // ── 1. Buscar en variantes (sku_ean) ────────────────────────────────────────
  // strapi.db.query permite filtrar dentro de componentes relacionales
  const productoConVariante = await strapi.db.query(UID_PRODUCTO).findOne({
    where: {
      publicado: true,
      variantes: { sku_ean: eanTrimmed },
    },
    populate: ['variantes'],
  });

  if (productoConVariante) {
    // Encontrar la variante específica que coincide
    const variante = (productoConVariante.variantes || []).find(
      v => (v.sku_ean || '').trim() === eanTrimmed
    );

    if (variante) {
      const price = variante.precio_oferta && variante.precio_oferta > 0
        ? Number(variante.precio_oferta)
        : Number(variante.precio);

      const stock = (variante.stock !== null && variante.stock !== undefined)
        ? variante.stock > 0
        : false;

      return {
        stock,
        price,
        url: buildProductUrl(productoConVariante.id_original, productoConVariante.nombre),
      };
    }
  }

  // ── 2. Buscar en producto padre (sku) ────────────────────────────────────────
  const productoPorSku = await strapi.db.query(UID_PRODUCTO).findOne({
    where: {
      publicado: true,
      sku: eanTrimmed,
    },
  });

  if (productoPorSku) {
    const price = productoPorSku.precio_oferta && productoPorSku.precio_oferta > 0
      ? Number(productoPorSku.precio_oferta)
      : Number(productoPorSku.precio);

    const stock = (productoPorSku.stock !== null && productoPorSku.stock !== undefined)
      ? productoPorSku.stock > 0
      : false;

    return {
      stock,
      price,
      url: buildProductUrl(productoPorSku.id_original, productoPorSku.nombre),
    };
  }

  // ── 3. No encontrado ─────────────────────────────────────────────────────────
  return null;
}

module.exports = () => ({
  buscarPorEan,
});
