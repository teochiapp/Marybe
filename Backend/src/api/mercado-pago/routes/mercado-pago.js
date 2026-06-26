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
      method: 'GET',
      path: '/mercado-pago/consultar-pago',
      handler: 'mercado-pago.consultarPago',
      config: {
        auth: false, // Permitir consulta pública desde el temporizador del modal
      },
    },
  ],
};
