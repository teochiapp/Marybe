'use strict';

/**
 * Rutas custom para la importación de productos por parte del administrador.
 * Protegidas mediante JWT del plugin users-permissions.
 */
module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/importacion-admin/login',
      handler: 'importacion-admin.login',
      config: {
        auth: false,
        description: 'Login custom para el panel de importación',
        tags: ['Admin'],
      },
    },
    {
      method: 'POST',
      path: '/importacion-admin/upload',
      handler: 'importacion-admin.upload',
      config: {
        auth: false,
        description: 'Recibe un archivo .xlsx y lo importa como productos al catálogo',
        tags: ['Admin'],
      },
    },
    {
      method: 'GET',
      path: '/importacion-admin/status',
      handler: 'importacion-admin.status',
      config: {
        auth: false,
        description: 'Devuelve el estado de la última importación',
        tags: ['Admin'],
      },
    },
    {
      method: 'GET',
      path: '/importacion-admin/verificar-precios',
      handler: 'importacion-admin.verificarPrecios',
      config: {
        auth: false,
        description: 'Verifica la integridad de los precios entre web y exportación',
        tags: ['Admin'],
      },
    },
    {
      method: 'GET',
      path: '/importacion-admin/taxonomia-vacia',
      handler: 'importacion-admin.taxonomiaVacia',
      config: {
        auth: false,
        description: 'Devuelve categorías, subcategorías y tipos sin productos asignados',
        tags: ['Admin'],
      },
    },
    {
      method: 'DELETE',
      path: '/importacion-admin/categoria/:id',
      handler: 'importacion-admin.eliminarCategoria',
      config: {
        auth: false,
        description: 'Elimina una categoría vacía por ID',
        tags: ['Admin'],
      },
    },
    {
      method: 'DELETE',
      path: '/importacion-admin/subcategoria/:categoriaId/:subcatId',
      handler: 'importacion-admin.eliminarSubcategoria',
      config: {
        auth: false,
        description: 'Elimina una subcategoría vacía (componente) de su categoría padre',
        tags: ['Admin'],
      },
    },
    {
      method: 'DELETE',
      path: '/importacion-admin/tipo/:categoriaId/:subcatId/:tipoId',
      handler: 'importacion-admin.eliminarTipo',
      config: {
        auth: false,
        description: 'Elimina un tipo vacío (componente) de su subcategoría padre',
        tags: ['Admin'],
      },
    },
  ],
};
