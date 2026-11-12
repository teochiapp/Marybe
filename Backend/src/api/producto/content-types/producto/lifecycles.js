'use strict';

const { calcularRangoPrecios } = require('../../../../utils/product-price-range');

const VARIANTE_UID = 'producto.variante';

// En Strapi 5 el Document Service crea los componentes antes de llamar al lifecycle
// y deja en `data.variantes` solo referencias ({ id, __pivot }). Se leen sus precios
// con strapi.db.query, que participa de la transacción en curso.
async function resolverVariantes(variantes) {
  if (!Array.isArray(variantes) || variantes.length === 0) return [];
  const faltantes = variantes
    .filter(v => v && v.id && v.precio === undefined && v.precio_oferta === undefined)
    .map(v => v.id);
  if (faltantes.length === 0) return variantes;

  const filas = await strapi.db.query(VARIANTE_UID).findMany({
    where: { id: { $in: faltantes } },
    select: ['id', 'precio', 'precio_oferta'],
  });
  const porId = new Map(filas.map(f => [f.id, f]));
  return variantes.map(v => (v && porId.has(v.id) ? { ...v, ...porId.get(v.id) } : v));
}

module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;
    try {
      const variantes = await resolverVariantes(data.variantes);
      Object.assign(data, calcularRangoPrecios({ ...data, variantes }));
    } catch (error) {
      console.error('Error en beforeCreate lifecycle de Producto:', error);
    }
  },

  async beforeUpdate(event) {
    const { data, where } = event.params;

    try {
      const existingProduct = await strapi.db.query('api::producto.producto').findOne({
        where,
        populate: ['variantes'],
      });

      const variantes = Array.isArray(data.variantes)
        ? await resolverVariantes(data.variantes)
        : existingProduct?.variantes || [];

      Object.assign(data, calcularRangoPrecios({ ...(existingProduct || {}), ...data, variantes }));
    } catch (error) {
      console.error('Error en beforeUpdate lifecycle de Producto:', error);
    }
  },
};
