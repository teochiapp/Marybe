'use strict';

// Autenticación propia del panel (JWT isAdminImport), validada en el controlador.
// Soporta tanto las rutas originales de Categoría Destacada (1) como las rutas parametrizadas por módulo (`categoria-destacada-1` y `categoria-destacada-2`).
module.exports = {
  routes: [
    { method: 'GET', path: '/categoria-destacada-admin', handler: 'categoria-destacada-admin.overview', config: { auth: false } },
    { method: 'GET', path: '/categoria-destacada-admin/productos', handler: 'categoria-destacada-admin.products', config: { auth: false } },
    { method: 'PUT', path: '/categoria-destacada-admin/:area', handler: 'categoria-destacada-admin.save', config: { auth: false } },
    { method: 'DELETE', path: '/categoria-destacada-admin/:area/borrador', handler: 'categoria-destacada-admin.discard', config: { auth: false } },
    { method: 'GET', path: '/categoria-destacada-admin/modulo/:modulo', handler: 'categoria-destacada-admin.overview', config: { auth: false } },
    { method: 'PUT', path: '/categoria-destacada-admin/modulo/:modulo/:area', handler: 'categoria-destacada-admin.save', config: { auth: false } },
    { method: 'DELETE', path: '/categoria-destacada-admin/modulo/:modulo/:area/borrador', handler: 'categoria-destacada-admin.discard', config: { auth: false } },
  ],
};
