module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/mi-perfil',
      handler: 'api::cliente.cliente.findMe',
      config: {
        auth: false,  // el controller valida el JWT manualmente
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/mi-perfil',
      handler: 'api::cliente.cliente.createOrUpdateMe',
      config: {
        auth: false,  // el controller valida el JWT manualmente
        policies: [],
        middlewares: [],
      },
    },
  ],
};
