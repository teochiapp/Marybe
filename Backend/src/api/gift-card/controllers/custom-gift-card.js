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

  async consume(ctx) {
    try {
      const { codigo } = ctx.request.body;

      if (!codigo) return ctx.badRequest('El código es requerido');

      const giftCards = await strapi.entityService.findMany('api::gift-card.gift-card', {
        filters: { codigo },
        limit: 1,
      });

      if (!giftCards || giftCards.length === 0) return ctx.notFound('Código no válido');

      const giftCard = giftCards[0];

      if (!giftCard.activa) return ctx.badRequest('El código ya fue utilizado');

      // Marcar como inactiva
      await strapi.entityService.update('api::gift-card.gift-card', giftCard.id, {
        data: { activa: false }
      });

      return ctx.send({ success: true, message: 'Gift card consumida correctamente' });
    } catch (err) {
      ctx.body = err;
    }
  },

  // ── Generar gift cards al comprarlas ────────────────────────────────────────
  // Recibe en el body: { items: [{ monto, cantidad }], numero_pedido: "M-XXXX" }
  // Crea un registro en la colección gift-cards por cada unidad comprada.
  async generate(ctx) {
    try {
      const { items, numero_pedido } = ctx.request.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return ctx.badRequest('Se requiere un array de items con monto y cantidad');
      }

      const created = [];

      for (const item of items) {
        const { monto, cantidad = 1 } = item;

        if (!monto || monto <= 0) {
          return ctx.badRequest(`Monto inválido: ${monto}`);
        }

        for (let i = 0; i < cantidad; i++) {
          // Generar código único con hasta 10 reintentos ante colisión
          let codigo;
          let attempts = 0;
          while (attempts < 10) {
            const candidato = generarCodigo();
            const existente = await strapi.entityService.findMany('api::gift-card.gift-card', {
              filters: { codigo: candidato },
              limit: 1,
            });
            if (!existente || existente.length === 0) {
              codigo = candidato;
              break;
            }
            attempts++;
          }

          if (!codigo) {
            return ctx.internalServerError('No se pudo generar un código único. Intente nuevamente.');
          }

          // Fecha de expiración: 1 año desde hoy
          const fechaExpiracion = new Date();
          fechaExpiracion.setFullYear(fechaExpiracion.getFullYear() + 1);

          const nuevaGiftCard = await strapi.entityService.create('api::gift-card.gift-card', {
            data: {
              codigo,
              monto,
              activa: true,
              fecha_expiracion: fechaExpiracion.toISOString(),
            },
          });

          created.push({
            codigo: nuevaGiftCard.codigo,
            monto: nuevaGiftCard.monto,
            fecha_expiracion: nuevaGiftCard.fecha_expiracion,
          });
        }
      }

      strapi.log.info(`[GiftCard] ${created.length} gift card(s) generadas para pedido ${numero_pedido || 'sin número'}`);

      return ctx.send({ success: true, giftCards: created });
    } catch (err) {
      strapi.log.error('[GiftCard] Error al generar gift cards:', err);
      return ctx.internalServerError('Error al generar las gift cards');
    }
  },
};
