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

function conflicto(ctx, message) {
  ctx.status = 409;
  ctx.body = { error: { status: 409, message } };
}

function listaValida(value) {
  if (!Array.isArray(value) || !value.length || value.some(v => typeof v !== 'string' || !v.trim() || v !== v.trim())) return null;
  if (new Set(value).size !== value.length) return null;
  return [...value].sort();
}

module.exports = {
  async vistaPreviaBorrado(ctx) {
    if (!verificarAdmin(ctx)) return ctx.unauthorized('No autenticado o sesión expirada.');
    const proveedores = listaValida(ctx.request.body?.proveedores);
    if (!proveedores) return ctx.badRequest('Seleccioná uno o más proveedores válidos.');
    try {
      const servicio = strapi.service('api::exportacion-proveedores-admin.exportacion-proveedores-admin');
      const productos = await servicio.vistaBorrado(strapi, proveedores);
      if (!productos.length) return ctx.badRequest('No hay productos publicados para los proveedores seleccionados.');
      const secret = strapi.config.get('plugin.users-permissions.jwtSecret') || 'custom-secret-key';
      const comprobante = jwt.sign({ accion: 'borrar-seleccion-proveedores', proveedores, hash: servicio.hashVistaBorrado(productos) }, secret, { expiresIn: '10m' });
      return ctx.send({ proveedores, total: productos.length, productos: productos.map(({ documentId, id_original, nombre, sku, skuVariantes, proveedor, draftProveedor }) => ({
        documentId, id_original, nombre, sku, skuVariantes, proveedor,
        bloqueado: draftProveedor !== null && draftProveedor !== proveedor,
      })), comprobante });
    } catch (err) {
      strapi.log.error(`[ExportacionProveedoresAdmin] vista previa de borrado: ${err.message}`);
      return ctx.internalServerError('No se pudo preparar la vista previa.');
    }
  },

  async confirmarBorrado(ctx) {
    if (!verificarAdmin(ctx)) return ctx.unauthorized('No autenticado o sesión expirada.');
    const { confirmacion, comprobante } = ctx.request.body || {};
    const proveedores = listaValida(ctx.request.body?.proveedores);
    const ids = listaValida(ctx.request.body?.productos);
    if (!proveedores || !ids || confirmacion !== 'BORRAR' || typeof comprobante !== 'string') {
      return ctx.badRequest('Seleccioná productos y confirmá escribiendo BORRAR.');
    }
    let vista;
    try {
      const secret = strapi.config.get('plugin.users-permissions.jwtSecret') || 'custom-secret-key';
      vista = jwt.verify(comprobante, secret);
      if (vista.accion !== 'borrar-seleccion-proveedores' || JSON.stringify(vista.proveedores) !== JSON.stringify(proveedores) || typeof vista.hash !== 'string') throw new Error('invalid preview');
    } catch {
      return ctx.badRequest('La vista previa venció o no es válida. Volvé a prepararla.');
    }
    try {
      const servicio = strapi.service('api::exportacion-proveedores-admin.exportacion-proveedores-admin');
      const productos = await servicio.vistaBorrado(strapi, proveedores);
      if (!productos.length || servicio.hashVistaBorrado(productos) !== vista.hash) {
        return conflicto(ctx, 'Los productos cambiaron desde la vista previa. Volvé a revisarlos.');
      }
      const idsElegidos = new Set(ids);
      const seleccion = productos.filter(p => idsElegidos.has(p.documentId));
      if (seleccion.length !== ids.length || seleccion.some(p => p.draftProveedor !== null && p.draftProveedor !== p.proveedor)) {
        return conflicto(ctx, 'La selección contiene productos inválidos o con otro proveedor en su borrador.');
      }
      const resultado = await servicio.borrarVista(strapi, seleccion);
      strapi.log.info(`[ExportacionProveedoresAdmin] Borrado para ${proveedores.join(', ')}: ${resultado.borrados.length} borrados, ${resultado.errores.length} errores.`);
      return ctx.send({ ok: resultado.errores.length === 0, ...resultado });
    } catch (err) {
      strapi.log.error(`[ExportacionProveedoresAdmin] borrado de proveedor: ${err.message}`);
      return ctx.internalServerError('No se pudo completar el borrado. Revisá el catálogo antes de volver a intentarlo.');
    }
  },
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
      proveedores = [rawProveedores.trim()].filter(Boolean);
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
