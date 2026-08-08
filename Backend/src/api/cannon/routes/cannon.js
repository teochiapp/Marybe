'use strict';

/**
 * Cannon Integration — Rutas
 * GET /api/cannon/product?ean=<EAN-13>
 *
 * Contrato: Fragancias Cannon (guía de integración API a medida)
 * Autenticación: header X-Api-Key (validado en el controller, NO en Strapi auth)
 */
module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/cannon/product',
      handler: 'cannon.product',
      config: {
        auth: false,
        description: 'Consulta de producto por EAN para integración Fragancias Cannon',
        tags: ['Cannon'],
      },
    },
  ],
};
