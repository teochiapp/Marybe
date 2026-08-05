'use strict';

/**
 * Rutas custom para la exportación de productos por proveedor.
 * Reutiliza el mismo sistema de autenticación JWT que importacion-admin / exportacion-admin.
 */
module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/exportacion-proveedores-admin/login',
      handler: 'exportacion-proveedores-admin.login',
      config: {
        auth: false,
        description: 'Login custom para el panel de exportación por proveedor (mismas credenciales que importación/exportación)',
        tags: ['Admin'],
      },
    },
    {
      method: 'GET',
      path: '/exportacion-proveedores-admin/proveedores',
      handler: 'exportacion-proveedores-admin.proveedores',
      config: {
        auth: false,
        description: 'Devuelve la lista de proveedores únicos disponibles en el catálogo',
        tags: ['Admin'],
      },
    },
    {
      method: 'GET',
      path: '/exportacion-proveedores-admin/exportar',
      handler: 'exportacion-proveedores-admin.exportar',
      config: {
        auth: false,
        description: 'Exporta productos filtrados por proveedor(es) como archivo .xlsx',
        tags: ['Admin'],
      },
    },
  ],
};
