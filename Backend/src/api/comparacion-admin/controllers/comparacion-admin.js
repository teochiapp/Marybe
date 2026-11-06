'use strict';

const { verificarAdmin, handleAdminLogin } = require('../../../utils/admin-auth');

module.exports = {
  /**
   * POST /api/comparacion-admin/login
   * Mismas credenciales que importacion-admin / exportacion-admin.
   */
  async login(ctx) {
    return handleAdminLogin(ctx);
  },

  /**
   * GET /api/comparacion-admin/exportar
   * Genera y descarga un .xlsx con todos los productos y sus variantes
   * mostrando: ID, EAN/SKU, Descripción, Stock, Proveedor.
   */
  async exportar(ctx) {
    if (!verificarAdmin(ctx)) {
      return ctx.unauthorized('No autenticado o sesión expirada. Iniciá sesión como administrador.');
    }

    try {
      strapi.log.info('[ComparacionAdmin] Iniciando generación del Excel de comparación...');

      const servicio = strapi.service('api::comparacion-admin.comparacion-admin');
      const { buffer, totalProductos, totalVariantes } = await servicio.generarExcelComparacion(strapi);

      const fecha    = new Date().toISOString().slice(0, 10);
      const filename = `Comparacion_Stock_Marybe_${fecha}.xlsx`;

      ctx.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      ctx.set('Content-Disposition', `attachment; filename="${filename}"`);
      ctx.set('X-Total-Productos', String(totalProductos));
      ctx.set('X-Total-Variantes', String(totalVariantes));

      strapi.log.info(`[ComparacionAdmin] ✅ ${totalProductos} productos, ${totalVariantes} variantes → ${filename}`);

      ctx.body = buffer;
    } catch (err) {
      strapi.log.error(`[ComparacionAdmin] Error: ${err.message}`);
      return ctx.internalServerError(`Error al generar comparación: ${err.message}`);
    }
  },
};
