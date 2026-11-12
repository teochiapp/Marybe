'use strict';

const { verificarAdmin } = require('../../../utils/admin-auth');

module.exports = {
  async get(ctx) {
    if (!verificarAdmin(ctx, strapi)) return ctx.unauthorized('Iniciá sesión como administrador.');
    try {
      const data = await strapi.service('api::configuracion-general-admin.configuracion-general-admin').get();
      return ctx.send({ data });
    } catch (error) {
      strapi.log.error(`[ConfiguracionGeneralAdmin] ${error.message}`);
      return ctx.throw(500, 'No se pudo cargar la configuración general.');
    }
  },

  async update(ctx) {
    if (!verificarAdmin(ctx, strapi)) return ctx.unauthorized('Iniciá sesión como administrador.');
    try {
      const payload = ctx.request.body?.data || ctx.request.body;
      const data = await strapi.service('api::configuracion-general-admin.configuracion-general-admin').update(payload);
      return ctx.send({ data, message: 'Configuración guardada correctamente.' });
    } catch (error) {
      strapi.log.error(`[ConfiguracionGeneralAdmin] ${error.message}`);
      return ctx.throw(error.status || 500, error.message || 'No se pudo guardar la configuración general.');
    }
  },
};
