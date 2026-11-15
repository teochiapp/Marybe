'use strict';

const jwt = require('jsonwebtoken');
const taxonomia = require('../../../utils/excel-taxonomy.json');
const { verificarAdmin, getJwtSecret, handleAdminLogin } = require('../../../utils/admin-auth');

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
  async taxonomia(ctx) {
    if (!verificarAdmin(ctx)) return ctx.unauthorized('No autenticado.');
    return ctx.send({ taxonomia });
  },
  async productosRecategorizacion(ctx) {
    if (!verificarAdmin(ctx)) return ctx.unauthorized('No autenticado.');
    const { proveedores: entrada, busqueda } = ctx.request.body || {};
    const termino = typeof busqueda === 'string' ? busqueda.trim() : '';
    const proveedores = listaValida(entrada);
    if (busqueda !== undefined && (typeof busqueda !== 'string' || termino.length < 2 || termino.length > 100)) return ctx.badRequest('Ingresá entre 2 y 100 caracteres para buscar.');
    if (!termino && !proveedores) return ctx.badRequest('Seleccioná proveedores válidos.');
    try {
      const servicio = strapi.service('api::exportacion-proveedores-admin.exportacion-proveedores-admin');
      const publicados = termino ? await servicio.buscarProductosRecategorizacion(strapi, termino) : await servicio.fetchProductosPorProveedor(strapi, proveedores);
      const productos = await Promise.all(publicados.map(async p => {
        const draft = await strapi.documents('api::producto.producto').findOne({ documentId: p.documentId, status: 'draft', populate: ['clasificaciones', 'categoria'] });
        if (!draft || (draft.proveedor ?? null) !== (p.proveedor ?? null)) return null;
        const clasificaciones = draft.clasificaciones?.length ? draft.clasificaciones : [{ seccion: draft.seccion || '', categoria: draft.categoria?.nombre || '', subcategoria: draft.subcategoria || '', tipo: draft.tipo || '' }];
        return { documentId: p.documentId, nombre: p.nombre, proveedor: p.proveedor ?? null, updatedAt: draft.updatedAt, clasificaciones: clasificaciones.map(({ seccion, categoria, subcategoria, tipo }) => ({ seccion: seccion || '', categoria: categoria || '', subcategoria: subcategoria || '', tipo: tipo || '' })) };
      }));
      return ctx.send({ productos: productos.filter(Boolean), limiteAlcanzado: !!termino && publicados.length === 50 });
    } catch (err) { strapi.log.error(err); return ctx.internalServerError('No se pudieron cargar los productos.'); }
  },
  async guardarRecategorizacion(ctx) {
    if (!verificarAdmin(ctx)) return ctx.unauthorized('No autenticado.');
    const { documentId, proveedor, updatedAt, clasificaciones } = ctx.request.body || {};
    if (typeof documentId !== 'string' || (proveedor !== null && typeof proveedor !== 'string') || typeof updatedAt !== 'string' || !Array.isArray(clasificaciones) || !clasificaciones.length || clasificaciones.length > 30) return ctx.badRequest('Datos inválidos.');
    const validas = clasificaciones.every(c => c && ['Hogar', 'Perfumería'].includes(c.seccion) && Object.hasOwn(taxonomia, c.categoria) && typeof c.subcategoria === 'string' && typeof c.tipo === 'string' && (!c.subcategoria ? !c.tipo : Object.hasOwn(taxonomia[c.categoria], c.subcategoria) && (!c.tipo || taxonomia[c.categoria][c.subcategoria].includes(c.tipo))));
    if (!validas || new Set(clasificaciones.map(c => JSON.stringify([c.seccion,c.categoria,c.subcategoria,c.tipo]))).size !== clasificaciones.length) return ctx.badRequest('Revisá las clasificaciones y evitá duplicados.');
    try {
      const servicio = strapi.service('api::exportacion-proveedores-admin.exportacion-proveedores-admin');
      const resultado = await servicio.publicarRecategorizacion(strapi, { documentId, proveedor, updatedAt, clasificaciones });
      if (!resultado) return conflicto(ctx, 'El producto cambió o tiene otros cambios pendientes. Revisalo en el editor antes de guardar.');
      return ctx.send({ ok: true, updatedAt: resultado.updatedAt });
    } catch (err) { strapi.log.error(err); return ctx.internalServerError('No se pudieron guardar y publicar los cambios.'); }
  },

  async publicarRecategorizacion(ctx) {
    if (!verificarAdmin(ctx)) return ctx.unauthorized('No autenticado.');
    const { documentId, proveedor, updatedAt } = ctx.request.body || {};
    if (typeof documentId !== 'string' || typeof proveedor !== 'string' || typeof updatedAt !== 'string') return ctx.badRequest('Datos inválidos.');
    try {
      const servicio = strapi.service('api::exportacion-proveedores-admin.exportacion-proveedores-admin');
      if (!await servicio.publicarRecategorizacion(strapi, { documentId, proveedor, updatedAt })) return conflicto(ctx, 'El producto cambió o tiene otros cambios pendientes. Revisalo en el editor antes de publicar.');
      return ctx.send({ ok: true });
    } catch (err) { strapi.log.error(err); return ctx.internalServerError('No se pudo publicar el producto.'); }
  },
  async borrarVariante(ctx) {
    if (!verificarAdmin(ctx)) return ctx.unauthorized('No autenticado o sesión expirada.');
    const { proveedores: entrada, comprobante, producto, variante, confirmacion } = ctx.request.body || {};
    const proveedores = listaValida(entrada);
    if (!proveedores || !producto || !Number.isSafeInteger(variante) || confirmacion !== 'BORRAR' || typeof comprobante !== 'string') return ctx.badRequest('Seleccioná una variante y confirmá escribiendo BORRAR.');
    try {
      const vista = jwt.verify(comprobante, getJwtSecret(strapi));
      const servicio = strapi.service('api::exportacion-proveedores-admin.exportacion-proveedores-admin');
      if (vista.accion !== 'borrar-seleccion-proveedores' || JSON.stringify(vista.proveedores) !== JSON.stringify(proveedores)) return ctx.badRequest('La vista previa no es válida.');
      const snapshots = await servicio.vistaBorrado(strapi, proveedores);
      if (servicio.hashVistaBorrado(snapshots) !== vista.hash) return conflicto(ctx, 'El catálogo cambió. Volvé a preparar la selección.');
      const seleccionado = snapshots.find(p => p.documentId === producto);
      if (!seleccionado || !seleccionado.variantes.some(v => v.id === variante)) return ctx.badRequest('La variante no pertenece al producto seleccionado.');
      await servicio.borrarVariante(strapi, seleccionado, variante);
      return ctx.send({ ok: true });
    } catch (error) {
      strapi.log.error(`[Borrado variante] ${error.message}`);
      return conflicto(ctx, 'No se pudo borrar la variante. Revisá los cambios pendientes y volvé a intentarlo.');
    }
  },
  async vistaPreviaBorrado(ctx) {
    if (!verificarAdmin(ctx)) return ctx.unauthorized('No autenticado o sesión expirada.');
    const proveedores = listaValida(ctx.request.body?.proveedores);
    if (!proveedores) return ctx.badRequest('Seleccioná uno o más proveedores válidos.');
    try {
      const servicio = strapi.service('api::exportacion-proveedores-admin.exportacion-proveedores-admin');
      const productos = await servicio.vistaBorrado(strapi, proveedores);
      if (!productos.length) return ctx.badRequest('No hay productos publicados para los proveedores seleccionados.');
      const secret = getJwtSecret(strapi);
      if (!secret) throw new Error('JWT_SECRET no configurado.');
      const comprobante = jwt.sign({ accion: 'borrar-seleccion-proveedores', proveedores, hash: servicio.hashVistaBorrado(productos) }, secret, { expiresIn: '10m' });
      return ctx.send({ proveedores, total: productos.length, productos: productos.map(({ documentId, id_original, nombre, sku, skuVariantes, variantes, proveedor, draftProveedor }) => ({
        documentId, id_original, nombre, sku, skuVariantes, variantes, proveedor,
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
      const secret = getJwtSecret(strapi);
      if (!secret) throw new Error('JWT_SECRET no configurado.');
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
    return handleAdminLogin(ctx);
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
