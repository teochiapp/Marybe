'use strict';

const fs   = require('fs');
const path = require('path');
const jwt  = require('jsonwebtoken');

function verificarAdminImportacion(ctx) {
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

/**
 * Controller de Importación Admin
 *
 * Endpoints:
 *  POST /api/importacion-admin/upload  → recibe .xlsx, valida rol, importa
 *  GET  /api/importacion-admin/status  → última importación
 */
module.exports = {
  /**
   * POST /api/importacion-admin/login
   * Bypass de DB. Login basado en variables de entorno.
   */
  async login(ctx) {
    const { identifier, password } = ctx.request.body;
    const adminEmail = process.env.IMPORT_ADMIN_EMAIL || 'admin@marybe.com';
    const adminPassword = process.env.IMPORT_ADMIN_PASSWORD;

    if (!adminPassword) {
      return ctx.internalServerError('Error del servidor: IMPORT_ADMIN_PASSWORD no configurado en entorno.');
    }

    if (identifier === adminEmail && password === adminPassword) {
      const secret = strapi.config.get('plugin.users-permissions.jwtSecret') || 'custom-secret-key';
      const token = jwt.sign({ isAdminImport: true, email: adminEmail }, secret, { expiresIn: '1d' });
      return ctx.send({ jwt: token });
    }

    // Devolvemos el mismo error de Strapi para mantener la compatibilidad con el front
    return ctx.badRequest('Invalid identifier or password');
  },

  /**
   * POST /api/importacion-admin/upload
   * Requiere: JWT Custom en el header Authorization.
   */
  async upload(ctx) {
    // ── 1. Verificar JWT Custom ─────────────────────────
    if (!verificarAdminImportacion(ctx)) {
      return ctx.unauthorized('No autenticado o sesión expirada. Debés iniciar sesión como administrador.');
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
    if (!verificarAdminImportacion(ctx)) {
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
