'use strict';

// Autenticación propia del panel (JWT isAdminImport), validada en el controlador.
module.exports = {
  routes: [
    { method: 'GET', path: '/descuentos-admin', handler: 'descuentos-admin.overview', config: { auth: false } },
    { method: 'GET', path: '/descuentos-admin/entidades', handler: 'descuentos-admin.entities', config: { auth: false } },
    { method: 'PUT', path: '/descuentos-admin/:area', handler: 'descuentos-admin.save', config: { auth: false } },
    { method: 'DELETE', path: '/descuentos-admin/:area/borrador', handler: 'descuentos-admin.discard', config: { auth: false } },
  ],
};
