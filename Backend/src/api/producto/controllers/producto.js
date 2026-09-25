'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::producto.producto', ({ strapi }) => ({
  async find(ctx) {
    // Inicializar filters si no existen
    if (!ctx.query.filters) {
      ctx.query.filters = {};
    }

    // Asegurar que solo se devuelvan productos con precio mayor a 0
    ctx.query.filters = {
      ...ctx.query.filters,
      precio_minimo_calculado: { $gt: 0 }
    };

    const { data, meta } = await super.find(ctx);
    return { data, meta };
  },

  async findOne(ctx) {
    if (!ctx.query.filters) {
      ctx.query.filters = {};
    }

    ctx.query.filters = {
      ...ctx.query.filters,
      precio_minimo_calculado: { $gt: 0 }
    };

    const response = await super.findOne(ctx);
    return response;
  }
}));
