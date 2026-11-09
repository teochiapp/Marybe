'use strict';

module.exports = {
  routes: [
    { method: 'GET', path: '/gift-card-admin', handler: 'gift-card-admin.overview', config: { auth: false } },
    { method: 'PUT', path: '/gift-card-admin/:area', handler: 'gift-card-admin.save', config: { auth: false } },
    { method: 'DELETE', path: '/gift-card-admin/:area/borrador', handler: 'gift-card-admin.discard', config: { auth: false } },
  ],
};
