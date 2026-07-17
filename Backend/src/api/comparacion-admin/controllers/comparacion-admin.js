'use strict';

const jwt = require('jsonwebtoken');

function verificarAdmin(ctx) {
  const authHeader = ctx.request.header.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return false;

  try {
    const secret = strapi.config.get('plugin.users-permissions.jwtSecret') || 'custom-secret-key';
    const payload = jwt.verify(token, secret);
    return payload.isAdminImport === true;
  } catch (err) {
    return false;
  }
}

module.exports = {
  /**
   * POST /api/comparacion-admin/login
   * Mismas credenciales que importacion-admin / exportacion-admin.
   */
  async login(ctx) {
    const { identifier, password } = ctx.request.body;
    const adminEmail    = process.env.IMPORT_ADMIN_EMAIL || 'admin@marybe.com';
    const adminPassword = process.env.IMPORT_ADMIN_PASSWORD;

    if (!adminPassword) {
      return ctx.internalServerError('Error del servidor: IMPORT_ADMIN_PASSWORD no configurado.');
    }

    if (identifier === adminEmail && password === adminPassword) {
      const secret = strapi.config.get('plugin.users-permissions.jwtSecret') || 'custom-secret-key';
      const token  = jwt.sign({ isAdminImport: true, email: adminEmail }, secret, { expiresIn: '1d' });
      return ctx.send({ jwt: token });
    }

    return ctx.badRequest('Invalid identifier or password');
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
