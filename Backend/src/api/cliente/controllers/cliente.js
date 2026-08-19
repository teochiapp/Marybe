'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

/**
 * Extrae y verifica el JWT del header Authorization.
 * Retorna el usuario o null si el token es inválido/inexistente.
 */
async function getUserFromCtx(ctx, strapi) {
  const authHeader = ctx.request.headers.authorization || ctx.request.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return null;

  try {
    const jwtService = strapi.plugin('users-permissions').service('jwt');
    const decoded = await jwtService.verify(token);
    if (!decoded || !decoded.id) return null;

    const user = await strapi.entityService.findOne(
      'plugin::users-permissions.user',
      decoded.id
    );
    return user || null;
  } catch {
    return null;
  }
}

module.exports = createCoreController('api::cliente.cliente', ({ strapi }) => ({
  async findMe(ctx) {
    const user = await getUserFromCtx(ctx, strapi);
    if (!user) {
      return ctx.unauthorized('No estás autenticado o tu sesión expiró.');
    }

    const cliente = await strapi.db.query('api::cliente.cliente').findOne({
      where: { usuario: user.id },
      populate: true,
    });

    return { data: cliente || null };
  },

  async createOrUpdateMe(ctx) {
    const user = await getUserFromCtx(ctx, strapi);
    if (!user) {
      return ctx.unauthorized('No estás autenticado o tu sesión expiró.');
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
  },
}));
