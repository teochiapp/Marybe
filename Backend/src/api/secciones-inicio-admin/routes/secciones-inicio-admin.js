'use strict';

// Título y tipografía de las secciones de Inicio sin modelo propio (hoy: ofertas).
// Autenticación propia del panel (JWT isAdminImport), validada en el controlador.
module.exports = {
  routes: [
    { method: 'GET', path: '/secciones-inicio-admin/:seccion', handler: 'secciones-inicio-admin.overview', config: { auth: false } },
    { method: 'PUT', path: '/secciones-inicio-admin/:seccion/:area', handler: 'secciones-inicio-admin.save', config: { auth: false } },
    { method: 'DELETE', path: '/secciones-inicio-admin/:seccion/:area/borrador', handler: 'secciones-inicio-admin.discard', config: { auth: false } },
  ],
};
