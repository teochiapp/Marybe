'use strict';

const crypto = require('crypto');
const { consumeRateLimit, sendTooManyRequests } = require('../../../utils/admin-auth');

function generarCodigo() {
  // Genera un código con 12 bytes aleatorios (24 caracteres hexadecimales)
  return 'GC-' + crypto.randomBytes(12).toString('hex').toUpperCase();
}

module.exports = {
  generarCodigo,
  async apply(ctx) {
    const limit = consumeRateLimit(ctx, 'gift-card-apply', { max: 5, windowMs: 60 * 1000 });
    if (limit.limited) {
      return sendTooManyRequests(ctx, 'Demasiadas consultas de Gift Card. Intentá nuevamente en un minuto.');
    }

    try {
      const { codigo } = ctx.request.body || {};

      if (!codigo || typeof codigo !== 'string' || !codigo.trim()) {
        return ctx.badRequest('El código es requerido');
      }

      const cleanCode = codigo.trim();

      // Buscar la gift card usando el entityService para ignorar permisos públicos de "find"
      const giftCards = await strapi.entityService.findMany('api::gift-card.gift-card', {
        filters: { codigo: cleanCode },
        limit: 1,
      });

      if (!giftCards || giftCards.length === 0) {
        return ctx.notFound('Código no válido');
      }

      const giftCard = giftCards[0];

      if (!giftCard.activa || Number(giftCard.monto) <= 0) {
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
      strapi?.log?.error?.('[GiftCard] Error al validar gift card:', err);
      return ctx.internalServerError('Error al procesar la solicitud');
    }
  },
};
