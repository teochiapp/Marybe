'use strict';

// Autenticación propia del panel (JWT isAdminImport), validada en el controlador.
module.exports = {
  routes: [
    { method: 'GET', path: '/destacada-admin', handler: 'destacada-admin.overview', config: { auth: false } },
    { method: 'GET', path: '/destacada-admin/productos', handler: 'destacada-admin.search', config: { auth: false } },
    { method: 'PUT', path: '/destacada-admin/:area', handler: 'destacada-admin.save', config: { auth: false } },
    { method: 'DELETE', path: '/destacada-admin/:area/borrador', handler: 'destacada-admin.discard', config: { auth: false } },
  ],
};
