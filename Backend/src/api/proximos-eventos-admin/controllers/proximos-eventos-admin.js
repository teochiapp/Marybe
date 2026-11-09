'use strict';

const { verificarAdmin } = require('../../../utils/admin-auth');

async function run(ctx, action, fallback = 'No se guardaron los cambios de Próximos Eventos: ninguna modificación quedó aplicada.') {
  if (!verificarAdmin(ctx, strapi)) return ctx.unauthorized('Iniciá sesión como administrador.');
  try {
    return ctx.send({ data: await action(strapi.service('api::proximos-eventos-admin.proximos-eventos-admin')) });
  } catch (error) {
    strapi.log.error(`[ProximosEventosAdmin] ${error.message}`);
    return ctx.throw(error.status || 500, error.status ? error.message : fallback);
  }
}

module.exports = {
  overview: ctx => run(ctx, service => service.overview(), 'No se pudo cargar la sección Próximos Eventos.'),
  save: ctx => run(ctx, service => service.save(ctx.params.area, ctx.request.body)),
  discard: ctx => run(ctx, service => service.discard(ctx.params.area, { version: ctx.query.version })),
};
