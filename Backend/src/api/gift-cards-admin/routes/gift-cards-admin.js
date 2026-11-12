'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/gift-cards-admin',
      handler: 'gift-cards-admin.list',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/gift-cards-admin',
      handler: 'gift-cards-admin.create',
      config: { auth: false },
    },
    {
      method: 'PATCH',
      path: '/gift-cards-admin/:id',
      handler: 'gift-cards-admin.update',
      config: { auth: false },
    },
  ],
};
