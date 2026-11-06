'use strict';

const { verificarAdmin, handleAdminLogin, validateImageUpload } = require('../../../utils/admin-auth');

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
    return handleAdminLogin(ctx);
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

    const { precio, precio_oferta, stock, variantes } = rawBody;

    const data = {};
    if (precio        !== undefined) data.precio        = precio        === '' || precio        === null ? null : Number(precio);
    if (precio_oferta !== undefined) data.precio_oferta = precio_oferta === '' || precio_oferta === null ? null : Number(precio_oferta);
    if (stock         !== undefined) data.stock         = stock         === '' || stock         === null ? 0   : parseInt(stock, 10);

    // Variantes: mapear por índice al draft para evitar errores de IDs estancados (stale IDs) tras publicar
    if (variantes !== undefined) {
      if (!Array.isArray(variantes)) {
        return ctx.badRequest('El campo "variantes" debe ser un array.');
      }
      
      const pDraft = await strapi.documents(UID_PRODUCTO).findOne({ documentId, populate: ['variantes'] });

      data.variantes = variantes.map((v, i) => {
        const item = {};
        // Asignar el ID del borrador directamente por índice
        if (pDraft?.variantes?.[i]) {
           item.id = pDraft.variantes[i].id;
        }
        if (v.sku_ean       !== undefined) item.sku_ean       = v.sku_ean || null;
        if (v.volumen       !== undefined) item.volumen       = v.volumen || null;
        if (v.color_nombre  !== undefined) item.color_nombre  = v.color_nombre || null;
        if (v.precio        !== undefined) item.precio        = v.precio === '' || v.precio === null ? null : Number(v.precio);
        if (v.precio_oferta !== undefined) item.precio_oferta = v.precio_oferta === '' || v.precio_oferta === null ? null : Number(v.precio_oferta);
        if (v.stock         !== undefined) item.stock         = v.stock === '' || v.stock === null ? 0 : parseInt(v.stock, 10);
        if (v.portada       !== undefined) {
          item.portada = (v.portada && typeof v.portada === 'object') ? v.portada.id : v.portada;
        }
        return item;
      });
    }

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

    const uploadError = validateImageUpload(file, { maxSizeBytes: 200 * 1024 });
    if (uploadError) {
      return ctx.badRequest(uploadError);
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

  // ── POST /api/editor-admin/productos/:documentId/variantes/:varianteId/portada ─
  async subirPortadaVariante(ctx) {
    if (!verificarAdmin(ctx)) return noAuth(ctx);

    const { documentId, varianteId } = ctx.params;
    const indexVariante = parseInt(varianteId, 10); // El frontend ahora envía el índice en lugar del ID
    const files = ctx.request.files;

    if (!files || !files.portada) {
      return ctx.badRequest('No se recibió ningún archivo (campo: portada).');
    }

    const file = Array.isArray(files.portada) ? files.portada[0] : files.portada;

    const uploadError = validateImageUpload(file, { maxSizeBytes: 200 * 1024 });
    if (uploadError) {
      return ctx.badRequest(uploadError);
    }

    try {
      // 1. Upload
      const uploadedFiles = await strapi.plugins.upload.services.upload.upload({
        data: { fileInfo: { name: file.name, caption: '', alternativeText: '' } },
        files: file,
      });
      const mediaId = uploadedFiles[0].id;
      strapi.log.info(`[EditorAdmin] subirPortadaVariante: archivo subido → mediaId=${mediaId}`);

      // 2. Traer la versión draft para modificarla
      const productoDraft = await strapi.documents(UID_PRODUCTO).findOne({
        documentId,
        populate: ['variantes', 'variantes.portada'],
      });

      if (!productoDraft || !productoDraft.variantes || !productoDraft.variantes[indexVariante]) {
        return ctx.badRequest('Producto draft o variante por índice no encontrados.');
      }

      // 3. Modificar la variante en el draft
      const variantesModificadas = productoDraft.variantes.map((v, i) => {
        const item = { ...v };
        
        // Strapi falla si enviamos el objeto completo de portada, extraer solo el ID
        if (item.portada && typeof item.portada === 'object') {
          item.portada = item.portada.id;
        }

        if (i === indexVariante) {
          item.portada = mediaId;
        }
        
        return item;
      });

      // 4. Update (actualiza el draft y publica)
      await updatePublished(documentId, { variantes: variantesModificadas });

      strapi.log.info(`[EditorAdmin] ✅ Portada de variante índice ${indexVariante} del producto ${documentId} actualizada (published) → mediaId ${mediaId}`);
      return ctx.send({ ok: true, media: uploadedFiles[0] });
    } catch (err) {
      strapi.log.error(`[EditorAdmin] ❌ subirPortadaVariante FAILED: documentId=${documentId} varianteIndex=${varianteId}`);
      strapi.log.error(`  error: ${err.message}`);
      strapi.log.error(`  stack: ${err.stack}`);
      return ctx.internalServerError(`Error al subir portada de variante: ${err.message}`);
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

    for (const file of archivos) {
      const uploadError = validateImageUpload(file, { maxSizeBytes: 200 * 1024 });
      if (uploadError) {
        return ctx.badRequest(uploadError);
      }
    }

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

  // ── DELETE /api/editor-admin/productos/:documentId/portada ────────────────
  async eliminarPortada(ctx) {
    if (!verificarAdmin(ctx)) return noAuth(ctx);

    const { documentId } = ctx.params;

    try {
      await updatePublished(documentId, { portada: null });

      strapi.log.info(`[EditorAdmin] ✅ Portada del producto ${documentId} eliminada (published)`);
      return ctx.send({ ok: true });
    } catch (err) {
      strapi.log.error(`[EditorAdmin] eliminarPortada FAILED: documentId=${documentId} → ${err.message}`);
      return ctx.internalServerError(`Error al eliminar portada: ${err.message}`);
    }
  },

  // ── DELETE /api/editor-admin/productos/:documentId/variantes/:varianteId/portada ──
  async eliminarPortadaVariante(ctx) {
    if (!verificarAdmin(ctx)) return noAuth(ctx);

    const { documentId, varianteId } = ctx.params;
    const indexVariante = parseInt(varianteId, 10);

    try {
      const productoActual = await strapi.documents(UID_PRODUCTO).findOne({
        documentId,
        populate: ['variantes', 'variantes.portada'],
        status: 'published',
      });

      if (!productoActual?.variantes?.length) {
        return ctx.badRequest('El producto no tiene variantes.');
      }

      const variantes = productoActual.variantes.map((v, idx) => {
        const item = { ...v };
        // Extraer IDs de campos relacionales que Strapi necesita como número
        if (item.portada && typeof item.portada === 'object') item.portada = item.portada.id;
        if (item.color  && typeof item.color  === 'object') item.color  = item.color.id;
        // Eliminar la portada de la variante objetivo
        if (idx === indexVariante) item.portada = null;
        return item;
      });

      await updatePublished(documentId, { variantes });

      strapi.log.info(`[EditorAdmin] ✅ Portada de variante índice ${indexVariante} del producto ${documentId} eliminada (published)`);
      return ctx.send({ ok: true });
    } catch (err) {
      strapi.log.error(`[EditorAdmin] eliminarPortadaVariante FAILED: documentId=${documentId} varianteIndex=${varianteId} → ${err.message}`);
      return ctx.internalServerError(`Error al eliminar portada de variante: ${err.message}`);
    }
  },
};
