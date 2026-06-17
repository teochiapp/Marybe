module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/mi-perfil',
      handler: 'api::cliente.cliente.findMe',
    },
    {
      method: 'POST',
      path: '/mi-perfil',
      handler: 'api::cliente.cliente.createOrUpdateMe',
    }
  ]
};
