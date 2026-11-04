'use strict';

const getMercadoPagoService = require('../services/mercado-pago');
const crypto = require('crypto');

module.exports = {
  async crearPreferencia(ctx) {
    try {
      const { externalReference, checkoutToken } = ctx.request.body;

      const service = getMercadoPagoService();
      const preferencia = await service.crearPreferencia({
        externalReference,
        checkoutToken,
      });

      ctx.send({
        success: true,
        id: preferencia.id,
        init_point: preferencia.init_point,
        sandbox_init_point: preferencia.sandbox_init_point,
      });
    } catch (error) {
      console.error('Error en crearPreferencia controlador:', error);
      ctx.throw(500, error.message || 'Error al crear la preferencia de Mercado Pago');
    }
  },

  async consultarPago(ctx) {
    try {
      const { externalReference, checkoutToken, abort } = ctx.request.body;

      const service = getMercadoPagoService();
      const resultado = await service.sincronizar({ externalReference, checkoutToken, abort: abort === true });

      ctx.send(resultado);
    } catch (error) {
      console.error('Error en consultarPago controlador:', error);
      ctx.throw(400, 'No se pudo verificar el pago. Intentá nuevamente.');
    }
  },

  async webhook(ctx) {
    try {
      const query = ctx.request.query || {};
      const body = ctx.request.body || {};

      // Mercado Pago envía notificaciones de diferentes tipos (payment, merchant_order)
      const topic = body.type || query.type || query.topic;
      const id = query['data.id'] || body.data?.id || query.id;

      if (!id || (topic !== 'payment' && topic !== 'payment.created' && topic !== 'payment.updated')) {
        return ctx.send('OK'); // Ignorar otros eventos para no saturar
      }

      const secret = process.env.MP_WEBHOOK_SECRET;
      if (!secret) return ctx.throw(503, 'Firma de webhook no configurada.');
      const headers = ctx.request.headers || ctx.request.header || {};
      const signature = Object.fromEntries(String(headers['x-signature'] || '').split(',').map(part => part.trim().split('=')));
      const requestId = headers['x-request-id'];
      if (!signature.ts || !signature.v1 || !requestId || !/^\d+$/.test(String(id))) return ctx.unauthorized('Firma inválida.');
      const manifest = `id:${String(id).toLowerCase()};request-id:${requestId};ts:${signature.ts};`;
      const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
      if (!/^[a-f0-9]{64}$/i.test(signature.v1) || !crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature.v1, 'hex'))) return ctx.unauthorized('Firma inválida.');

      const service = getMercadoPagoService();
      await service.procesarWebhookDePago(id);

      ctx.send('OK');
    } catch (error) {
      console.error('Error procesando webhook de MP:', error);
      if (error.status) throw error;
      ctx.throw(500, 'Error procesando webhook');
    }
  },
};
