'use strict';

// Autenticación propia del panel (JWT isAdminImport), validada en el controlador.
module.exports = {
  routes: [
    { method: 'GET', path: '/categorias-inicio-admin', handler: 'categorias-inicio-admin.overview', config: { auth: false } },
    { method: 'PUT', path: '/categorias-inicio-admin/:area', handler: 'categorias-inicio-admin.save', config: { auth: false } },
    { method: 'DELETE', path: '/categorias-inicio-admin/:area/borrador', handler: 'categorias-inicio-admin.discard', config: { auth: false } },
  ],
};
