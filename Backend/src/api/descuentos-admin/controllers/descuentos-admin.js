'use strict';

const { verificarAdmin } = require('../../../utils/admin-auth');

async function run(ctx, action, fallback = 'No se guardaron los cambios de Descuentos: ninguna modificación quedó aplicada.') {
  if (!verificarAdmin(ctx, strapi)) return ctx.unauthorized('Iniciá sesión como administrador.');
  try {
    return ctx.send({ data: await action(strapi.service('api::descuentos-admin.descuentos-admin')) });
  } catch (error) {
    strapi.log.error(`[DescuentosAdmin] ${error.message}`);
    return ctx.throw(error.status || 500, error.status ? error.message : fallback);
  }
}

module.exports = {
  overview: ctx => run(ctx, service => service.overview(), 'No se pudo cargar Descuentos.'),
  entities: ctx => run(ctx, service => service.entities(), 'No se pudieron cargar las categorías, marcas y proveedores.'),
  save: ctx => run(ctx, service => service.save(ctx.params.area, ctx.request.body)),
  // DELETE no lleva cuerpo: la versión viaja como parámetro de consulta.
  discard: ctx => run(ctx, service => service.discard(ctx.params.area, { version: ctx.query.version })),
};
