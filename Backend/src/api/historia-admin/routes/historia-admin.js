'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/historia-admin',
      handler: 'historia-admin.get',
      config: { auth: false },
    },
    {
      method: 'PUT',
      path: '/historia-admin',
      handler: 'historia-admin.update',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/historia-admin/upload',
      handler: 'historia-admin.upload',
      config: { auth: false },
    },
  ],
};
