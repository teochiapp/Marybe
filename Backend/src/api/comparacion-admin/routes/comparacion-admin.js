'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/comparacion-admin/login',
      handler: 'comparacion-admin.login',
      config: {
        auth: false,
        description: 'Login para el panel de comparación de stock (mismas credenciales que importación/exportación)',
        tags: ['Admin'],
      },
    },
    {
      method: 'GET',
      path: '/comparacion-admin/exportar',
      handler: 'comparacion-admin.exportar',
      config: {
        auth: false,
        description: 'Exporta tabla de comparación: ID, EAN/SKU, Descripción, Stock y Proveedor',
        tags: ['Admin'],
      },
    },
  ],
};
