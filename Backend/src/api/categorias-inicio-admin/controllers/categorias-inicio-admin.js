'use strict';

const { verificarAdmin } = require('../../../utils/admin-auth');

async function run(ctx, action, fallback = 'No se guardaron los cambios de Categorías: ninguna modificación quedó aplicada.') {
  if (!verificarAdmin(ctx, strapi)) return ctx.unauthorized('Iniciá sesión como administrador.');
  try {
    return ctx.send({ data: await action(strapi.service('api::categorias-inicio-admin.categorias-inicio-admin')) });
  } catch (error) {
    strapi.log.error(`[CategoriasInicioAdmin] ${error.message}`);
    return ctx.throw(error.status || 500, error.status ? error.message : fallback);
  }
}

module.exports = {
  overview: ctx => run(ctx, service => service.overview(), 'No se pudo cargar la sección Categorías.'),
  save: ctx => run(ctx, service => service.save(ctx.params.area, ctx.request.body)),
  // DELETE no lleva cuerpo: la versión viaja como parámetro de consulta.
  discard: ctx => run(ctx, service => service.discard(ctx.params.area, { version: ctx.query.version })),
};
