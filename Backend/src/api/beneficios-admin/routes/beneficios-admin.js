'use strict';

module.exports = {
  routes: [
    { method: 'GET', path: '/beneficios-admin', handler: 'beneficios-admin.overview', config: { auth: false } },
    { method: 'PUT', path: '/beneficios-admin/:area', handler: 'beneficios-admin.save', config: { auth: false } },
    { method: 'DELETE', path: '/beneficios-admin/:area/borrador', handler: 'beneficios-admin.discard', config: { auth: false } },
  ],
};
