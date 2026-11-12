'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

const ACTIVE_PRICE_CONDITION = {
  $or: [
    { precio_minimo_calculado: { $gt: 0 } },
    { precio: { $gt: 0 } },
    { precio_oferta: { $gt: 0 } },
    { variantes: { precio: { $gt: 0 } } },
    { variantes: { precio_oferta: { $gt: 0 } } },
  ],
};

function applyPriceAvailabilityFilter(ctx) {
  const currentFilters = ctx.query?.filters && typeof ctx.query.filters === 'object'
    ? { ...ctx.query.filters }
    : {};

  const existingAnd = Array.isArray(currentFilters.$and) ? currentFilters.$and : [];
  delete currentFilters.$and;

  ctx.query.filters = {
    ...currentFilters,
    $and: [...existingAnd, ACTIVE_PRICE_CONDITION],
  };
}

module.exports = createCoreController('api::producto.producto', () => ({
  async find(ctx) {
    applyPriceAvailabilityFilter(ctx);
    const { data, meta } = await super.find(ctx);
    return { data, meta };
  },

  async findOne(ctx) {
    applyPriceAvailabilityFilter(ctx);
    const response = await super.findOne(ctx);
    return response;
  },
}));
