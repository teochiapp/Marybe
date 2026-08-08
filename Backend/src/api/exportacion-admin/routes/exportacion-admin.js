'use strict';

/**
 * Rutas custom para la exportación de productos por parte del administrador.
 * Reutiliza el mismo sistema de autenticación JWT que importacion-admin.
 */
module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/exportacion-admin/login',
      handler: 'exportacion-admin.login',
      config: {
        auth: false,
        description: 'Login custom para el panel de exportación (mismas credenciales que importación)',
        tags: ['Admin'],
      },
    },
    {
      method: 'GET',
      path: '/exportacion-admin/exportar',
      handler: 'exportacion-admin.exportar',
      config: {
        auth: false,
        description: 'Exporta todos los productos actuales de Strapi como archivo .xlsx',
        tags: ['Admin'],
      },
    },
    {
      method: 'GET',
      path: '/exportacion-admin/exportar-plantilla-vacia',
      handler: 'exportacion-admin.exportarPlantillaVacia',
      config: {
        auth: false,
        description: 'Genera una plantilla .xlsx vacía para dar de alta nuevos productos (MODO_ALTA)',
        tags: ['Admin'],
      },
    },
  ],
};
