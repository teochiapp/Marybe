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
   * POST /api/exportacion-proveedores-admin/login
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
   * GET /api/exportacion-proveedores-admin/proveedores
   */
  async proveedores(ctx) {
    if (!verificarAdmin(ctx)) {
      return ctx.unauthorized('No autenticado o sesión expirada. Iniciá sesión como administrador.');
    }

    try {
      strapi.log.info('[ExportacionProveedoresAdmin] Obteniendo lista de proveedores...');
      const servicio = strapi.service('api::exportacion-proveedores-admin.exportacion-proveedores-admin');
      const lista    = await servicio.fetchProveedores(strapi);
      strapi.log.info(`[ExportacionProveedoresAdmin] ${lista.length} proveedores distintos encontrados.`);
      return ctx.send({ ok: true, proveedores: lista, total: lista.length });
    } catch (err) {
      strapi.log.error(`[ExportacionProveedoresAdmin] Error al obtener proveedores: ${err.message}`);
      return ctx.internalServerError(`Error al obtener proveedores: ${err.message}`);
    }
  },

  /**
   * GET /api/exportacion-proveedores-admin/exportar?proveedores=A&proveedores=B
   */
  async exportar(ctx) {
    if (!verificarAdmin(ctx)) {
      return ctx.unauthorized('No autenticado o sesión expirada. Iniciá sesión como administrador.');
    }

    const rawProveedores = ctx.query.proveedores;
    let proveedores = [];

    if (Array.isArray(rawProveedores)) {
      proveedores = rawProveedores.map(p => p.trim()).filter(p => p.length > 0);
    } else if (typeof rawProveedores === 'string' && rawProveedores.trim()) {
      proveedores = rawProveedores.split(',').map(p => p.trim()).filter(p => p.length > 0);
    }

    if (proveedores.length === 0) {
      return ctx.badRequest('Debés seleccionar al menos un proveedor.');
    }

    try {
      strapi.log.info(`[ExportacionProveedoresAdmin] Exportando para: ${proveedores.join(', ')}`);
      const servicio = strapi.service('api::exportacion-proveedores-admin.exportacion-proveedores-admin');
      const { buffer, totalProductos, totalVariantes } = await servicio.generarExcelProveedor(strapi, proveedores);

      const fecha         = new Date().toISOString().slice(0, 10);
      const nombresCortos = proveedores.length <= 2
        ? proveedores.map(p => p.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]/g, '-')).join('_')
        : `${proveedores.length}-proveedores`;
      const filename = `Precios_Proveedores_${nombresCortos}_${fecha}.xlsx`;

      ctx.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      ctx.set('Content-Disposition', `attachment; filename="${filename}"`);
      ctx.set('X-Total-Productos', String(totalProductos));
      ctx.set('X-Total-Variantes', String(totalVariantes));

      strapi.log.info(`[ExportacionProveedoresAdmin] ✅ ${totalProductos} productos, ${totalVariantes} variantes → ${filename}`);
      ctx.body = buffer;
    } catch (err) {
      strapi.log.error(`[ExportacionProveedoresAdmin] Error: ${err.message}`);
      return ctx.internalServerError(`Error al exportar: ${err.message}`);
    }
  },
};
