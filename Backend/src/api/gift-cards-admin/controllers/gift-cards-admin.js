'use strict';

const { verificarAdmin } = require('../../../utils/admin-auth');

module.exports = {
  async list(ctx) {
    if (!verificarAdmin(ctx, strapi)) return ctx.unauthorized('Iniciá sesión como administrador.');
    try {
      const result = await strapi.service('api::gift-cards-admin.gift-cards-admin').list(ctx.query || {});
      return ctx.send({ data: result.items, meta: { stats: result.stats } });
    } catch (error) {
      strapi.log.error(`[GiftCardsAdmin] ${error.message}`);
      return ctx.throw(error.status || 500, error.message || 'No se pudieron cargar las Gift Cards.');
    }
  },

  async create(ctx) {
    if (!verificarAdmin(ctx, strapi)) return ctx.unauthorized('Iniciá sesión como administrador.');
    try {
      const payload = ctx.request.body?.data || ctx.request.body || {};
      const data = await strapi.service('api::gift-cards-admin.gift-cards-admin').create(payload);
      return ctx.send({ data, message: 'Gift Card creada correctamente.' });
    } catch (error) {
      strapi.log.error(`[GiftCardsAdmin] ${error.message}`);
      return ctx.throw(error.status || 500, error.message || 'No se pudo crear la Gift Card.');
    }
  },

  async update(ctx) {
    if (!verificarAdmin(ctx, strapi)) return ctx.unauthorized('Iniciá sesión como administrador.');
    try {
      const { id } = ctx.params || {};
      const payload = ctx.request.body?.data || ctx.request.body || {};
      const data = await strapi.service('api::gift-cards-admin.gift-cards-admin').update(id, payload);
      return ctx.send({ data, message: 'Gift Card actualizada correctamente.' });
    } catch (error) {
      strapi.log.error(`[GiftCardsAdmin] ${error.message}`);
      return ctx.throw(error.status || 500, error.message || 'No se pudo actualizar la Gift Card.');
    }
  },
};
