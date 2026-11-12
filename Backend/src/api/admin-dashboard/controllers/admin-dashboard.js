'use strict';

const { verificarAdmin } = require('../../../utils/admin-auth');

module.exports = {
  async index(ctx) {
    if (!verificarAdmin(ctx, strapi)) return ctx.unauthorized('Iniciá sesión como administrador.');
    try {
      ctx.send({ data: await strapi.service('api::admin-dashboard.admin-dashboard').overview() });
    } catch (error) {
      strapi.log.error(`[AdminDashboard] ${error.message}`);
      ctx.throw(500, 'No se pudieron cargar las estadísticas.');
    }
  },
};
