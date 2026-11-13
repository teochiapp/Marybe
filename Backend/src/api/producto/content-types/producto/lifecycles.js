'use strict';

const { errors } = require('@strapi/utils');
const { calcularRangoPrecios } = require('../../../../utils/product-price-range');

const VARIANTE_UID = 'producto.variante';

// En Strapi 5 el Document Service crea los componentes antes de llamar al lifecycle
// y deja en `data.variantes` solo referencias ({ id, __pivot }). Se leen sus datos
// con strapi.db.query, que participa de la transacción en curso.
async function resolverVariantes(variantes) {
  if (!Array.isArray(variantes) || variantes.length === 0) return [];
  const faltantes = variantes
    .filter(v => v && v.id && (v.id_original === undefined || (v.precio === undefined && v.precio_oferta === undefined)))
    .map(v => v.id);
  if (faltantes.length === 0) return variantes;

  const filas = await strapi.db.query(VARIANTE_UID).findMany({
    where: { id: { $in: faltantes } },
    select: ['id', 'id_original', 'precio', 'precio_oferta'],
  });
  const porId = new Map(filas.map(f => [f.id, f]));
  return variantes.map(v => (v && porId.has(v.id) ? { ...v, ...porId.get(v.id) } : v));
}

function validarVariantesSinDuplicados(variantes) {
  const vistos = new Set();
  for (const v of (variantes || [])) {
    const varId = String(v?.id_original ?? '').trim();
    if (!varId) continue;
    const key = varId.toLowerCase();
    if (vistos.has(key)) {
      throw new errors.ValidationError(`Variante duplicada "${varId}". Cada variante del producto debe tener un id_original único.`);
    }
    vistos.add(key);
  }
}

module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;
    const variantes = await resolverVariantes(data.variantes);
    validarVariantesSinDuplicados(variantes);
    try {
      Object.assign(data, calcularRangoPrecios({ ...data, variantes }));
    } catch (error) {
      console.error('Error en beforeCreate lifecycle de Producto:', error);
    }
  },

  async beforeUpdate(event) {
    const { data, where } = event.params;

    const variantesEntrada = Array.isArray(data.variantes) ? await resolverVariantes(data.variantes) : null;
    if (variantesEntrada) {
      validarVariantesSinDuplicados(variantesEntrada);
    }

    try {
      const existingProduct = await strapi.db.query('api::producto.producto').findOne({
        where,
        populate: ['variantes'],
      });

      const variantes = variantesEntrada || existingProduct?.variantes || [];
      Object.assign(data, calcularRangoPrecios({ ...(existingProduct || {}), ...data, variantes }));
    } catch (error) {
      console.error('Error en beforeUpdate lifecycle de Producto:', error);
    }
  },
};
