'use strict';

module.exports = {
  routes: [
    { method: 'GET', path: '/proximos-eventos-admin', handler: 'proximos-eventos-admin.overview', config: { auth: false } },
    { method: 'PUT', path: '/proximos-eventos-admin/:area', handler: 'proximos-eventos-admin.save', config: { auth: false } },
    { method: 'DELETE', path: '/proximos-eventos-admin/:area/borrador', handler: 'proximos-eventos-admin.discard', config: { auth: false } },
  ],
};
