'use strict';

const jwt = require('jsonwebtoken');

/**
 * Verifica que el JWT del header sea un token de admin de importación/exportación.
 * Reutiliza exactamente el mismo mecanismo que importacion-admin.
 */
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
   * POST /api/exportacion-admin/login
   * Mismas credenciales que importacion-admin (IMPORT_ADMIN_EMAIL / IMPORT_ADMIN_PASSWORD).
   */
  async login(ctx) {
    const { identifier, password } = ctx.request.body;
    const adminEmail    = process.env.IMPORT_ADMIN_EMAIL || 'admin@marybe.com';
    const adminPassword = process.env.IMPORT_ADMIN_PASSWORD;

    if (!adminPassword) {
      return ctx.internalServerError('Error del servidor: IMPORT_ADMIN_PASSWORD no configurado en entorno.');
    }

    if (identifier === adminEmail && password === adminPassword) {
      const secret = strapi.config.get('plugin.users-permissions.jwtSecret') || 'custom-secret-key';
      const token  = jwt.sign({ isAdminImport: true, email: adminEmail }, secret, { expiresIn: '1d' });
      return ctx.send({ jwt: token });
    }

    return ctx.badRequest('Invalid identifier or password');
  },

  /**
   * GET /api/exportacion-admin/exportar
   * Genera y descarga un .xlsx con todos los productos actuales de Strapi.
   */
  async exportar(ctx) {
    if (!verificarAdmin(ctx)) {
      return ctx.unauthorized('No autenticado o sesión expirada. Iniciá sesión como administrador.');
    }

    try {
      strapi.log.info('[ExportAdmin] Iniciando exportación de productos...');

      const servicio = strapi.service('api::exportacion-admin.exportacion-admin');
      const { buffer, totalProductos, totalVariantes } = await servicio.generarExcel(strapi);

      const fecha     = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const filename  = `Exportacion_Marybe_${fecha}.xlsx`;

      ctx.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      ctx.set('Content-Disposition', `attachment; filename="${filename}"`);
      ctx.set('X-Total-Productos', String(totalProductos));
      ctx.set('X-Total-Variantes', String(totalVariantes));

      strapi.log.info(`[ExportAdmin] ✅ Exportados ${totalProductos} productos y ${totalVariantes} variantes → ${filename}`);

      ctx.body = buffer;
    } catch (err) {
      strapi.log.error(`[ExportAdmin] Error durante exportación: ${err.message}`);
      return ctx.internalServerError(`Error al exportar: ${err.message}`);
    }
  },
};
