'use strict';

const { verificarAdmin } = require('../../../utils/admin-auth');

async function run(ctx, action) {
  if (!verificarAdmin(ctx, strapi)) return ctx.unauthorized('Iniciá sesión como administrador.');
  try {
    return ctx.send({ data: await action(strapi.service('api::destacada-admin.destacada-admin')) });
  } catch (error) {
    strapi.log.error(`[DestacadaAdmin] ${error.message}`);
    return ctx.throw(error.status || 500, error.status ? error.message : 'No se pudo guardar la Sección Destacada.');
  }
}

module.exports = {
  overview: ctx => run(ctx, service => service.overview()),
  search: ctx => run(ctx, service => service.search(ctx.query)),
  save: ctx => run(ctx, service => service.save(ctx.params.area, ctx.request.body)),
  // DELETE no lleva cuerpo: la versión viaja como parámetro de consulta.
  discard: ctx => run(ctx, service => service.discard(ctx.params.area, { version: ctx.query.version })),
};
