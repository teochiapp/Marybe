'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/sucursales-admin',
      handler: 'sucursales-admin.get',
      config: { auth: false },
    },
    {
      method: 'PUT',
      path: '/sucursales-admin',
      handler: 'sucursales-admin.update',
      config: { auth: false },
    },
  ],
};
