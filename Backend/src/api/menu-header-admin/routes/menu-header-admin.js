'use strict';

module.exports = {
  routes: [
    { method: 'GET', path: '/menu-header-admin', handler: 'menu-header-admin.overview', config: { auth: false } },
    { method: 'GET', path: '/menu-header-admin/productos', handler: 'menu-header-admin.products', config: { auth: false } },
    { method: 'PUT', path: '/menu-header-admin/:area', handler: 'menu-header-admin.save', config: { auth: false } },
    { method: 'DELETE', path: '/menu-header-admin/:area/borrador', handler: 'menu-header-admin.discard', config: { auth: false } },
  ],
};
