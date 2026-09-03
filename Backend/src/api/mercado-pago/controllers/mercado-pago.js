'use strict';

const getMercadoPagoService = require('../services/mercado-pago');

module.exports = {
  async crearPreferencia(ctx) {
    try {
      const { productos = [], total = 0, userEmail = '', externalReference = '', frontendUrl = '' } = ctx.request.body;

      const service = getMercadoPagoService();
      const preferencia = await service.crearPreferencia({
        productos,
        total,
        userEmail,
        externalReference,
        frontendUrl,
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
      const { external_reference } = ctx.request.query;

      const service = getMercadoPagoService();
      const resultado = await service.consultarPago({ externalReference: external_reference });

      ctx.send(resultado);
    } catch (error) {
      console.error('Error en consultarPago controlador:', error);
      ctx.send({ pagado: false });
    }
  },

  async webhook(ctx) {
    try {
      const query = ctx.request.query;
      const body = ctx.request.body;

      // Mercado Pago envía notificaciones de diferentes tipos (payment, merchant_order)
      const topic = query.topic || body.type;
      const id = query.id || body.data?.id;

      if (!id || (topic !== 'payment' && topic !== 'payment.created' && topic !== 'payment.updated')) {
        return ctx.send('OK'); // Ignorar otros eventos para no saturar
      }

      const service = getMercadoPagoService();
      await service.procesarWebhookDePago(id);

      ctx.send('OK');
    } catch (error) {
      console.error('Error procesando webhook de MP:', error);
      ctx.throw(500, 'Error procesando webhook');
    }
  },
};
