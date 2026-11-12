'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/configuracion-general-admin',
      handler: 'configuracion-general-admin.get',
      config: { auth: false },
    },
    {
      method: 'PUT',
      path: '/configuracion-general-admin',
      handler: 'configuracion-general-admin.update',
      config: { auth: false },
    },
  ],
};
