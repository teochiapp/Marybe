'use strict';

const { verificarAdmin, validateImageUpload } = require('../../../utils/admin-auth');

module.exports = {
  async get(ctx) {
    if (!verificarAdmin(ctx, strapi)) return ctx.unauthorized('Iniciá sesión como administrador.');
    try {
      const data = await strapi.service('api::historia-admin.historia-admin').get();
      return ctx.send({ data });
    } catch (error) {
      strapi.log.error(`[HistoriaAdmin] ${error.message}`);
      return ctx.throw(500, 'No se pudo cargar el contenido de Nuestra Historia.');
    }
  },

  async update(ctx) {
    if (!verificarAdmin(ctx, strapi)) return ctx.unauthorized('Iniciá sesión como administrador.');
    try {
      const payload = ctx.request.body?.data || ctx.request.body || {};
      const data = await strapi.service('api::historia-admin.historia-admin').update(payload);
      return ctx.send({ data, message: 'Página Nuestra Historia guardada correctamente.' });
    } catch (error) {
      strapi.log.error(`[HistoriaAdmin] ${error.message}`);
      return ctx.throw(error.status || 500, error.message || 'No se pudo guardar Nuestra Historia.');
    }
  },

  async upload(ctx) {
    if (!verificarAdmin(ctx, strapi)) return ctx.unauthorized('Iniciá sesión como administrador.');
    try {
      const rawFiles = ctx.request.files?.files || ctx.request.files?.file;
      const file = Array.isArray(rawFiles) ? rawFiles[0] : rawFiles;
      if (!file) {
        return ctx.badRequest('Debés adjuntar una imagen.');
      }

      const validationError = validateImageUpload(file, { maxSizeBytes: 5 * 1024 * 1024 });
      if (validationError) {
        return ctx.badRequest(validationError);
      }

      const uploaded = await strapi.plugin('upload').service('upload').upload({
        data: {},
        files: file,
      });

      const uploadedFile = Array.isArray(uploaded) ? uploaded[0] : uploaded;
      if (!uploadedFile?.id) {
        return ctx.throw(500, 'No se pudo procesar la imagen subida.');
      }

      return ctx.send({
        data: {
          id: uploadedFile.id,
          url: uploadedFile.url || '',
          name: uploadedFile.name || '',
          width: uploadedFile.width || null,
          height: uploadedFile.height || null,
        },
      });
    } catch (error) {
      strapi.log.error(`[HistoriaAdminUpload] ${error.message}`);
      return ctx.throw(error.status || 500, error.message || 'No se pudo subir la imagen.');
    }
  },
};
