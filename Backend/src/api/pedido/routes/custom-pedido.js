module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/mis-pedidos',
      handler: 'custom-pedido.createMyOrder',
    },
    {
      method: 'GET',
      path: '/mis-pedidos',
      handler: 'custom-pedido.getMyOrders',
    },
  ],
};
