'use strict';

/**
 * Rutas custom para el panel de edición rápida de productos.
 * Mismo sistema de autenticación JWT que importacion-admin / exportacion-admin.
 */
module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/editor-admin/login',
      handler: 'editor-admin.login',
      config: {
        auth: false,
        description: 'Login para el panel de edición rápida (mismas credenciales que importación/exportación)',
        tags: ['Admin'],
      },
    },
    {
      method: 'GET',
      path: '/editor-admin/proveedores',
      handler: 'editor-admin.proveedores',
      config: {
        auth: false,
        description: 'Devuelve la lista de proveedores únicos',
        tags: ['Admin'],
      },
    },
    {
      method: 'GET',
      path: '/editor-admin/productos',
      handler: 'editor-admin.productos',
      config: {
        auth: false,
        description: 'Devuelve los productos de un proveedor con portada y galería',
        tags: ['Admin'],
      },
    },
    {
      method: 'GET',
      path: '/editor-admin/buscar',
      handler: 'editor-admin.buscar',
      config: {
        auth: false,
        description: 'Busca productos por SKU/EAN (id_original) sin filtro de proveedor',
        tags: ['Admin'],
      },
    },
    {
      method: 'PATCH',
      path: '/editor-admin/productos/:documentId',
      handler: 'editor-admin.actualizarProducto',
      config: {
        auth: false,
        description: 'Actualiza precio, precio_oferta y stock de un producto',
        tags: ['Admin'],
      },
    },
    {
      method: 'POST',
      path: '/editor-admin/productos/:documentId/portada',
      handler: 'editor-admin.subirPortada',
      config: {
        auth: false,
        description: 'Sube y asigna la imagen de portada (max 200KB)',
        tags: ['Admin'],
      },
    },
    {
      method: 'POST',
      path: '/editor-admin/productos/:documentId/galeria',
      handler: 'editor-admin.agregarGaleria',
      config: {
        auth: false,
        description: 'Agrega imágenes a la galería del producto (append)',
        tags: ['Admin'],
      },
    },
    {
      method: 'DELETE',
      path: '/editor-admin/productos/:documentId/galeria/:mediaId',
      handler: 'editor-admin.eliminarImagenGaleria',
      config: {
        auth: false,
        description: 'Desvincula una imagen de la galería del producto',
        tags: ['Admin'],
      },
    },
    {
      method: 'PATCH',
      path: '/editor-admin/productos/:documentId/galeria/reordenar',
      handler: 'editor-admin.reordenarGaleria',
      config: {
        auth: false,
        description: 'Guarda el orden de la galería (array de mediaIds en el orden deseado)',
        tags: ['Admin'],
      },
    },
    {
      method: 'POST',
      path: '/editor-admin/productos/:documentId/variantes/:varianteId/portada',
      handler: 'editor-admin.subirPortadaVariante',
      config: {
        auth: false,
        description: 'Sube y asigna la imagen de portada a una variante específica (max 200KB)',
        tags: ['Admin'],
      },
    },
  ],
};
