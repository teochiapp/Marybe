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
    {
      method: 'GET',
      path: '/admin-pedidos',
      handler: 'custom-pedido.adminFind',
      config: { auth: false },
    },
    {
      method: 'PUT',
      path: '/admin-pedidos/:id',
      handler: 'custom-pedido.adminUpdate',
      config: { auth: false },
    },
    {
      method: 'DELETE',
      path: '/admin-pedidos/:id',
      handler: 'custom-pedido.adminDelete',
      config: { auth: false },
    },
  ],
};
