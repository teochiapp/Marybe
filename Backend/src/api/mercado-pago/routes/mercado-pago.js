module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/mercado-pago/crear-preferencia',
      handler: 'mercado-pago.crearPreferencia',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/mercado-pago/consultar-pago',
      handler: 'mercado-pago.consultarPago',
      config: {
        auth: false, // El token aleatorio de checkout autoriza únicamente este pedido.
      },
    },
    {
      method: 'POST',
      path: '/mercado-pago/webhook',
      handler: 'mercado-pago.webhook',
      config: {
        auth: false,
      },
    },
  ],
};
