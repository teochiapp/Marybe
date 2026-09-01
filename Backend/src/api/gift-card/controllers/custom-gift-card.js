'use strict';

const crypto = require('crypto');

function generarCodigo() {
  // Genera un código tipo: GC-A1B2C3D4
  return 'GC-' + crypto.randomBytes(4).toString('hex').toUpperCase();
}

module.exports = {
  async apply(ctx) {
    try {
      const { codigo } = ctx.request.body;

      if (!codigo) {
        return ctx.badRequest('El código es requerido');
      }

      // Buscar la gift card usando el entityService para ignorar permisos públicos de "find"
      const giftCards = await strapi.entityService.findMany('api::gift-card.gift-card', {
        filters: { codigo },
        limit: 1,
      });

      if (!giftCards || giftCards.length === 0) {
        return ctx.notFound('Código no válido');
      }

      const giftCard = giftCards[0];

      if (!giftCard.activa) {
        return ctx.badRequest('El código ingresado ya fue utilizado o no está activo');
      }

      // Validar fecha de expiración si existe
      if (giftCard.fecha_expiracion && new Date(giftCard.fecha_expiracion) < new Date()) {
        return ctx.badRequest('El código ingresado ya expiró');
      }

      return ctx.send({
        data: {
          id: giftCard.id,
          codigo: giftCard.codigo,
          monto: giftCard.monto,
          activa: giftCard.activa
        }
      });

    } catch (err) {
      ctx.body = err;
    }
  },
};
