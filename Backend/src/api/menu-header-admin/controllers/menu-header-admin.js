'use strict';

const { verificarAdmin } = require('../../../utils/admin-auth');

async function run(ctx, action) {
  if (!verificarAdmin(ctx, strapi)) return ctx.unauthorized('Iniciá sesión como administrador.');
  try {
    return ctx.send({ data: await action(strapi.service('api::menu-header-admin.menu-header-admin')) });
  } catch (error) {
    strapi.log.error(`[MenuHeaderAdmin] ${error.message}`);
    return ctx.throw(error.status || 500, error.status ? error.message : 'No se pudo completar la operación del menú.');
  }
}

module.exports = {
  overview: ctx => run(ctx, service => service.overview()),
  products: ctx => run(ctx, service => service.products(ctx.query)),
  save: ctx => run(ctx, service => service.save(ctx.params.area, ctx.request.body)),
  discard: ctx => run(ctx, service => service.discard(ctx.params.area, ctx.query.version)),
};
