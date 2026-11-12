'use strict';

const { verificarAdmin } = require('../../../utils/admin-auth');

module.exports = {
  async get(ctx) {
    if (!verificarAdmin(ctx, strapi)) return ctx.unauthorized('Iniciá sesión como administrador.');
    try {
      const data = await strapi.service('api::sucursales-admin.sucursales-admin').get();
      return ctx.send({ data });
    } catch (error) {
      strapi.log.error(`[SucursalesAdmin] ${error.message}`);
      return ctx.throw(500, 'No se pudo cargar la información de sucursales.');
    }
  },

  async update(ctx) {
    if (!verificarAdmin(ctx, strapi)) return ctx.unauthorized('Iniciá sesión como administrador.');
    try {
      const payload = ctx.request.body?.data || ctx.request.body;
      const data = await strapi.service('api::sucursales-admin.sucursales-admin').update(payload);
      return ctx.send({ data, message: 'Sucursales guardadas correctamente.' });
    } catch (error) {
      strapi.log.error(`[SucursalesAdmin] ${error.message}`);
      return ctx.throw(error.status || 500, error.message || 'No se pudieron guardar las sucursales.');
    }
  },
};
