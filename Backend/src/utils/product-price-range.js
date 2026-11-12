'use strict';

function parsePositiveNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : null;
}

function getEffectivePrice(item) {
  if (!item || typeof item !== 'object') return null;
  const offer = parsePositiveNumber(item.precio_oferta);
  if (offer !== null) return offer;
  return parsePositiveNumber(item.precio);
}

/**
 * Calcula el rango mínimo y máximo considerando el precio del producto padre
 * y los precios de todas sus variantes con valor > 0.
 */
function calcularRangoPrecios(sourceData = {}) {
  let min = Infinity;
  let max = -Infinity;

  const parentEffective = getEffectivePrice(sourceData);
  if (parentEffective !== null) {
    if (parentEffective < min) min = parentEffective;
    if (parentEffective > max) max = parentEffective;
  }

  const variantes = Array.isArray(sourceData.variantes) ? sourceData.variantes : [];
  for (const variante of variantes) {
    const vEffective = getEffectivePrice(variante);
    if (vEffective !== null) {
      if (vEffective < min) min = vEffective;
      if (vEffective > max) max = vEffective;
    }
  }

  return {
    precio_minimo_calculado: min !== Infinity ? min : null,
    precio_maximo_calculado: max !== -Infinity ? max : null,
  };
}

/**
 * Recalcula precio_minimo_calculado y precio_maximo_calculado para productos existentes
 * cuyo rango quedó en NULL o <= 0 pese a tener variantes (o precio padre) > 0.
 */
async function reconciliarRangoPrecios(strapi) {
  if (!strapi?.db?.query || !strapi?.db?.connection) return 0;

  const candidatos = await strapi.db.query('api::producto.producto').findMany({
    where: {
      $or: [
        { precio_minimo_calculado: { $null: true } },
        { precio_minimo_calculado: { $lte: 0 } },
      ],
    },
    populate: ['variantes'],
    limit: 5000,
  });

  let reparados = 0;
  for (const prod of Array.isArray(candidatos) ? candidatos : []) {
    const range = calcularRangoPrecios(prod);
    if (range.precio_minimo_calculado !== null && range.precio_minimo_calculado > 0) {
      await strapi.db
        .connection('productos')
        .where({ id: prod.id })
        .update({
          precio_minimo_calculado: range.precio_minimo_calculado,
          precio_maximo_calculado: range.precio_maximo_calculado,
        });
      reparados += 1;
    }
  }

  if (reparados > 0) {
    strapi.log?.info?.(`[Producto] Rango de precios reconciliado en ${reparados} producto(s).`);
  }
  return reparados;
}

module.exports = {
  parsePositiveNumber,
  getEffectivePrice,
  calcularRangoPrecios,
  reconciliarRangoPrecios,
};
