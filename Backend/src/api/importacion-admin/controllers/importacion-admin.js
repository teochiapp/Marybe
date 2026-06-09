'use strict';

const fs   = require('fs');
const path = require('path');

/**
 * Controller de Importación Admin
 *
 * Endpoints:
 *  POST /api/importacion-admin/upload  → recibe .xlsx, valida rol, importa
 *  GET  /api/importacion-admin/status  → última importación
 */
module.exports = {
  /**
   * POST /api/importacion-admin/upload
   * Requiere: JWT con rol "admin-importacion" en el header Authorization.
   */
  async upload(ctx) {
    // ── 1. Verificar que el usuario autenticado tiene el rol adecuado ─────────
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('No autenticado. Debés iniciar sesión como administrador.');
    }

    // Cargar el usuario con su rol (el populate no viene por default)
    const userConRol = await strapi
      .plugin('users-permissions')
      .service('user')
      .fetchAuthenticatedUser(user.id);

    const roleName = userConRol?.role?.name || '';
    if (roleName !== 'admin-importacion') {
      return ctx.forbidden('Acceso denegado. Se requiere rol "admin-importacion".');
    }

    // ── 2. Verificar que llegó un archivo ─────────────────────────────────────
    const files = ctx.request.files;
    if (!files || !files.archivo) {
      return ctx.badRequest('No se recibió ningún archivo. Enviá el campo "archivo" como multipart.');
    }

    const archivo = files.archivo;
    const ext = path.extname(archivo.name || archivo.originalFilename || '').toLowerCase();
    if (ext !== '.xlsx') {
      return ctx.badRequest('El archivo debe ser un .xlsx válido (Plantilla_Marybe).');
    }

    let rutaTemporal = null;

    try {
      // ── 3. Guardar el archivo temporalmente ──────────────────────────────────
      // koa-body guarda el archivo en un path temporal (archivo.path)
      rutaTemporal = archivo.path || archivo.filepath;

      if (!rutaTemporal || !fs.existsSync(rutaTemporal)) {
        return ctx.badRequest('No se pudo acceder al archivo subido.');
      }

      strapi.log.info(`[ImportAdmin] Archivo recibido: ${archivo.name} (${archivo.size} bytes) → ${rutaTemporal}`);

      // ── 4. Ejecutar la importación (upsert) ──────────────────────────────────
      const servicio = strapi.service('api::importacion-admin.importacion-admin');
      const resultado = await servicio.procesarImportacion(strapi, rutaTemporal);

      return ctx.send({
        ok: true,
        mensaje: `Importación completada en ${resultado.tiempoSegundos}s`,
        datos: {
          totalProductos: resultado.totalProductos,
          creados:        resultado.creados,
          actualizados:   resultado.actualizados,
          errores:        resultado.errores,
          erroresList:    resultado.erroresList,
          tiempoSegundos: resultado.tiempoSegundos,
        },
      });
    } catch (err) {
      strapi.log.error(`[ImportAdmin] Error durante importación: ${err.message}`);
      return ctx.internalServerError(`Error al importar: ${err.message}`);
    } finally {
      // Limpiar archivo temporal si sigue existiendo
      if (rutaTemporal && fs.existsSync(rutaTemporal)) {
        try { fs.unlinkSync(rutaTemporal); } catch (_) {}
      }
    }
  },

  /**
   * GET /api/importacion-admin/status
   * Devuelve el resultado de la última importación realizada en esta sesión.
   */
  async status(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('No autenticado.');
    }

    const servicio = strapi.service('api::importacion-admin.importacion-admin');
    const ultima = servicio.obtenerUltimaImportacion();

    if (!ultima) {
      return ctx.send({ ok: true, mensaje: 'No se ha realizado ninguna importación aún.', datos: null });
    }

    return ctx.send({ ok: true, datos: ultima });
  },
};
