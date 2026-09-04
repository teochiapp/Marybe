'use strict';

const jwt = require('jsonwebtoken');

// ─── Helper: verificar JWT de admin ──────────────────────────────────────────
function verificarAdmin(ctx) {
  const authHeader = ctx.request.header.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return false;

  try {
    const secret = strapi.config.get('plugin.users-permissions.jwtSecret') || 'custom-secret-key';
    const payload = jwt.verify(token, secret);
    return payload.isAdminImport === true;
  } catch {
    return false;
  }
}

// ─── Helper: respuesta de no autorizado ──────────────────────────────────────
function noAuth(ctx) {
  return ctx.unauthorized('No autenticado o sesión expirada. Iniciá sesión como administrador.');
}

// ─── Helper: update + publish (Strapi v5) ────────────────────────────────────
// En algunas versiones de Strapi v5, status:'published' en update() no propaga
// los cambios a la versión publicada. La manera segura (igual a importacion-admin)
// es: update() sobre el draft y luego publish() explícito.
async function updatePublished(documentId, data) {
  strapi.log.debug(`[EditorAdmin] updatePublished → documentId=${documentId} data=${JSON.stringify(data)}`);
  try {
    // 1. Actualizar el draft con los nuevos datos
    await strapi.documents(UID_PRODUCTO).update({ documentId, data });

    // 2. Publicar explícitamente para que el cambio sea visible en el frontend
    await strapi.documents(UID_PRODUCTO).publish({ documentId });

    strapi.log.debug(`[EditorAdmin] updatePublished OK (draft + publish) → documentId=${documentId}`);
  } catch (err) {
    strapi.log.error(`[EditorAdmin] updatePublished FAILED → documentId=${documentId}`);
    strapi.log.error(`  data: ${JSON.stringify(data)}`);
    strapi.log.error(`  message: ${err.message}`);
    strapi.log.error(`  stack: ${err.stack}`);
    if (err.details) strapi.log.error(`  details: ${JSON.stringify(err.details)}`);
    throw err;
  }
}


const UID_PRODUCTO = 'api::producto.producto';
const PAGE_SIZE    = 150;

module.exports = {
  // ── POST /api/editor-admin/login ──────────────────────────────────────────
  async login(ctx) {
    const { identifier, password } = ctx.request.body;
    const adminEmail    = process.env.IMPORT_ADMIN_EMAIL || 'admin@marybe.com';
    const adminPassword = process.env.IMPORT_ADMIN_PASSWORD;

    if (!adminPassword) {
      return ctx.internalServerError('IMPORT_ADMIN_PASSWORD no configurado.');
    }

    if (identifier === adminEmail && password === adminPassword) {
      const secret = strapi.config.get('plugin.users-permissions.jwtSecret') || 'custom-secret-key';
      const token  = jwt.sign({ isAdminImport: true, email: adminEmail }, secret, { expiresIn: '1d' });
      return ctx.send({ jwt: token });
    }

    return ctx.badRequest('Invalid identifier or password');
  },

  // ── GET /api/editor-admin/proveedores ─────────────────────────────────────
  async proveedores(ctx) {
    if (!verificarAdmin(ctx)) return noAuth(ctx);

    try {
      const servicio = strapi.service('api::editor-admin.editor-admin');
      const lista    = await servicio.fetchProveedores();
      return ctx.send({ ok: true, proveedores: lista, total: lista.length });
    } catch (err) {
      strapi.log.error(`[EditorAdmin] proveedores: ${err.message}`);
      return ctx.internalServerError(`Error al obtener proveedores: ${err.message}`);
    }
  },

  // ── GET /api/editor-admin/productos?proveedor=X ───────────────────────────
  async productos(ctx) {
    if (!verificarAdmin(ctx)) return noAuth(ctx);

    const proveedor = (ctx.query.proveedor || '').trim();
    if (!proveedor) return ctx.badRequest('Debés indicar un proveedor.');

    try {
      const servicio  = strapi.service('api::editor-admin.editor-admin');
      const productos = await servicio.fetchProductosPorProveedor(proveedor);
      return ctx.send({ ok: true, productos, total: productos.length });
    } catch (err) {
      strapi.log.error(`[EditorAdmin] productos: ${err.message}`);
      return ctx.internalServerError(`Error al obtener productos: ${err.message}`);
    }
  },

  // ── GET /api/editor-admin/buscar?q=<sku_o_ean> ─────────────────────
  async buscar(ctx) {
    if (!verificarAdmin(ctx)) return noAuth(ctx);

    const q = (ctx.query.q || '').trim();
    if (q.length < 2) return ctx.badRequest('Ingresá al menos 2 caracteres para buscar.');

    try {
      const servicio  = strapi.service('api::editor-admin.editor-admin');
      const productos = await servicio.fetchProductosPorSKU(q);
      return ctx.send({ ok: true, productos, total: productos.length });
    } catch (err) {
      strapi.log.error(`[EditorAdmin] buscar: ${err.message}`);
      return ctx.internalServerError(`Error al buscar productos: ${err.message}`);
    }
  },

  // ── PATCH /api/editor-admin/productos/:documentId ─────────────────────────
  async actualizarProducto(ctx) {
    if (!verificarAdmin(ctx)) return noAuth(ctx);

    const { documentId } = ctx.params;
    const rawBody = ctx.request.body;
    strapi.log.info(`[EditorAdmin] PATCH productos/${documentId} body=${JSON.stringify(rawBody)}`);

    const { precio, precio_oferta, stock } = rawBody;

    const data = {};
    if (precio        !== undefined) data.precio        = precio        === '' || precio        === null ? null : Number(precio);
    if (precio_oferta !== undefined) data.precio_oferta = precio_oferta === '' || precio_oferta === null ? null : Number(precio_oferta);
    if (stock         !== undefined) data.stock         = stock         === '' || stock         === null ? 0   : parseInt(stock, 10);

    if (Object.keys(data).length === 0) {
      strapi.log.warn(`[EditorAdmin] actualizarProducto ${documentId}: body sin campos reconocidos`);
      return ctx.badRequest('No hay campos para actualizar.');
    }

    try {
      await updatePublished(documentId, data);
      strapi.log.info(`[EditorAdmin] ✅ Producto ${documentId} actualizado (published): ${JSON.stringify(data)}`);
      return ctx.send({ ok: true });
    } catch (err) {
      strapi.log.error(`[EditorAdmin] ❌ actualizarProducto FAILED: documentId=${documentId}`);
      strapi.log.error(`  body recibido: ${JSON.stringify(rawBody)}`);
      strapi.log.error(`  data procesada: ${JSON.stringify(data)}`);
      strapi.log.error(`  error: ${err.message}`);
      strapi.log.error(`  stack: ${err.stack}`);
      return ctx.internalServerError(`Error al actualizar producto: ${err.message}`);
    }
  },

  // ── POST /api/editor-admin/productos/:documentId/portada ──────────────────
  async subirPortada(ctx) {
    if (!verificarAdmin(ctx)) return noAuth(ctx);

    const { documentId } = ctx.params;
    const files = ctx.request.files;

    if (!files || !files.portada) {
      return ctx.badRequest('No se recibió ningún archivo (campo: portada).');
    }

    const file = Array.isArray(files.portada) ? files.portada[0] : files.portada;

    if (file.size > 200 * 1024) {
      return ctx.badRequest(`La imagen supera el tamaño máximo permitido (200KB). Tamaño recibido: ${Math.round(file.size / 1024)}KB.`);
    }

    try {
      const uploadedFiles = await strapi.plugins.upload.services.upload.upload({
        data: { fileInfo: { name: file.name, caption: '', alternativeText: '' } },
        files: file,
      });

      const mediaId = uploadedFiles[0].id;
      strapi.log.info(`[EditorAdmin] subirPortada: archivo subido → mediaId=${mediaId} name=${file.name} size=${file.size}`);

      await updatePublished(documentId, { portada: mediaId });

      strapi.log.info(`[EditorAdmin] ✅ Portada del producto ${documentId} actualizada (published) → mediaId ${mediaId}`);
      return ctx.send({ ok: true, media: uploadedFiles[0] });
    } catch (err) {
      strapi.log.error(`[EditorAdmin] ❌ subirPortada FAILED: documentId=${documentId} archivo=${file?.name} size=${file?.size}`);
      strapi.log.error(`  error: ${err.message}`);
      strapi.log.error(`  stack: ${err.stack}`);
      return ctx.internalServerError(`Error al subir portada: ${err.message}`);
    }
  },

  // ── POST /api/editor-admin/productos/:documentId/galeria ──────────────────
  async agregarGaleria(ctx) {
    if (!verificarAdmin(ctx)) return noAuth(ctx);

    const { documentId } = ctx.params;
    const files = ctx.request.files;

    if (!files || !files.imagenes) {
      return ctx.badRequest('No se recibieron archivos (campo: imagenes).');
    }

    const archivos = Array.isArray(files.imagenes) ? files.imagenes : [files.imagenes];

    try {
      const uploadedFiles = await Promise.all(
        archivos.map(file =>
          strapi.plugins.upload.services.upload.upload({
            data: { fileInfo: { name: file.name, caption: '', alternativeText: '' } },
            files: file,
          })
        )
      );
      const nuevosIds = uploadedFiles.flat().map(f => f.id);

      // Obtener galería actual desde la versión publicada
      const productoActual = await strapi.documents(UID_PRODUCTO).findOne({
        documentId,
        populate: ['galeria'],
        status: 'published',
      });
      const galeriaActual = (productoActual?.galeria || []).map(img => img.id);
      const galeriaFinal  = [...galeriaActual, ...nuevosIds];

      await updatePublished(documentId, { galeria: galeriaFinal });

      const nuevasImagenes = uploadedFiles.flat();
      strapi.log.info(`[EditorAdmin] ✅ Galería del producto ${documentId}: +${nuevasImagenes.length} imágenes (published, total: ${galeriaFinal.length})`);
      return ctx.send({ ok: true, nuevasImagenes, totalGaleria: galeriaFinal.length });
    } catch (err) {
      strapi.log.error(`[EditorAdmin] agregarGaleria ${documentId}: ${err.message}`);
      return ctx.internalServerError(`Error al agregar a galería: ${err.message}`);
    }
  },

  // ── DELETE /api/editor-admin/productos/:documentId/galeria/:mediaId ───────
  async eliminarImagenGaleria(ctx) {
    if (!verificarAdmin(ctx)) return noAuth(ctx);

    const { documentId, mediaId } = ctx.params;
    const mediaIdNum = parseInt(mediaId, 10);

    try {
      const productoActual = await strapi.documents(UID_PRODUCTO).findOne({
        documentId,
        populate: ['galeria'],
        status: 'published',
      });
      const galeriaActual = (productoActual?.galeria || []).map(img => img.id);
      const galeriaFinal  = galeriaActual.filter(id => id !== mediaIdNum);

      await updatePublished(documentId, { galeria: galeriaFinal });

      strapi.log.info(`[EditorAdmin] ✅ Galería ${documentId}: eliminada imagen mediaId ${mediaId} (published)`);
      return ctx.send({ ok: true, totalGaleria: galeriaFinal.length });
    } catch (err) {
      strapi.log.error(`[EditorAdmin] eliminarImagenGaleria ${documentId}/${mediaId}: ${err.message}`);
      return ctx.internalServerError(`Error al eliminar imagen: ${err.message}`);
    }
  },

  // ── PATCH /api/editor-admin/productos/:documentId/galeria/reordenar ───────
  async reordenarGaleria(ctx) {
    if (!verificarAdmin(ctx)) return noAuth(ctx);

    const { documentId } = ctx.params;
    const { orden } = ctx.request.body;

    if (!Array.isArray(orden)) {
      return ctx.badRequest('Se esperaba un array "orden" con los IDs de las imágenes.');
    }

    try {
      await updatePublished(documentId, { galeria: orden.map(Number) });

      strapi.log.info(`[EditorAdmin] ✅ Galería de ${documentId} reordenada (published): ${orden.join(', ')}`);
      return ctx.send({ ok: true });
    } catch (err) {
      strapi.log.error(`[EditorAdmin] reordenarGaleria ${documentId}: ${err.message}`);
      return ctx.internalServerError(`Error al reordenar galería: ${err.message}`);
    }
  },
};
