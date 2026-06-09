'use strict';

/**
 * Rutas custom para la importación de productos por parte del administrador.
 * Protegidas mediante JWT del plugin users-permissions.
 */
module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/importacion-admin/upload',
      handler: 'importacion-admin.upload',
      config: {
        middlewares: [],
        description: 'Recibe un archivo .xlsx y lo importa como productos al catálogo',
        tags: ['Admin'],
      },
    },
    {
      method: 'GET',
      path: '/importacion-admin/status',
      handler: 'importacion-admin.status',
      config: {
        description: 'Devuelve el estado de la última importación',
        tags: ['Admin'],
      },
    },
  ],
};
