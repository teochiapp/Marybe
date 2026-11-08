'use strict';

// Autenticación propia del panel (JWT isAdminImport), validada en el controlador.
module.exports = {
  routes: [
    { method: 'GET', path: '/categoria-destacada-admin', handler: 'categoria-destacada-admin.overview', config: { auth: false } },
    { method: 'GET', path: '/categoria-destacada-admin/productos', handler: 'categoria-destacada-admin.products', config: { auth: false } },
    { method: 'PUT', path: '/categoria-destacada-admin/:area', handler: 'categoria-destacada-admin.save', config: { auth: false } },
    { method: 'DELETE', path: '/categoria-destacada-admin/:area/borrador', handler: 'categoria-destacada-admin.discard', config: { auth: false } },
  ],
};
