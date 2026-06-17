'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::cliente.cliente', ({ strapi }) => ({
  async findMe(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('No estás autenticado');
    }

    const cliente = await strapi.db.query('api::cliente.cliente').findOne({
      where: { usuario: user.id },
      populate: true,
    });

    return { data: cliente || null };
  },

  async createOrUpdateMe(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('No estás autenticado');
    }

    const { telefono, direcciones } = ctx.request.body.data;

    const existingCliente = await strapi.db.query('api::cliente.cliente').findOne({
      where: { usuario: user.id },
    });

    let result;
    if (existingCliente) {
      result = await strapi.entityService.update('api::cliente.cliente', existingCliente.id, {
        data: { telefono, direcciones },
      });
    } else {
      result = await strapi.entityService.create('api::cliente.cliente', {
        data: { telefono, direcciones, usuario: user.id },
      });
    }

    return { data: result };
  }
}));
