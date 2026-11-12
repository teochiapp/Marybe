'use strict';
const jwt = require('jsonwebtoken');
const { validateBannerUpload } = require('../services/banner-media');
function authenticated(ctx) {
  const token = (ctx.request.header.authorization || '').replace(/^Bearer\s+/i, '').trim();
  const secret = strapi.config.get('plugin.users-permissions.jwtSecret');
  if (!secret || !token) return false;
  try { return jwt.verify(token, secret).isAdminImport === true; } catch { return false; }
}
async function run(ctx, action) {
  if (!authenticated(ctx)) return ctx.unauthorized('Iniciá sesión como administrador.');
  try { return ctx.send({ data: await action(strapi.service('api::banners-admin.banners-admin')) }); }
  catch (error) {
    strapi.log.error(`[BannersAdmin] ${error.message}`);
    return ctx.throw(error.status || 500, error.status ? error.message : 'No se pudieron guardar los banners.');
  }
}
module.exports = {
  list: ctx => run(ctx, service => service.list()),
  save: ctx => run(ctx, service => service.savePromotion(ctx.params.id, ctx.request.body)),
  remove: ctx => run(ctx, service => service.deletePromotion(ctx.params.id, ctx.request.body)),
  slots: ctx => run(ctx, service => service.saveSlots(ctx.request.body)),
  async publicSlots(ctx) { ctx.set('Cache-Control', 'no-cache'); return ctx.send({ data: await strapi.service('api::banners-admin.banners-admin').publicSlots() }); },
  media: ctx => run(ctx, () => strapi.db.query('plugin::upload.file').findMany({
    where: { $or: [{ mime: { $startsWith: 'image/' } }, { mime: { $in: ['video/mp4', 'video/webm'] } }] }, orderBy: { createdAt: 'desc' }, limit: 200,
    select: ['id', 'name', 'url', 'width', 'height', 'mime', 'size'],
  })),
  upload: ctx => run(ctx, async () => {
    const file = ctx.request.files?.files;
    await validateBannerUpload(file);
    return strapi.plugin('upload').service('upload').upload({ data: {}, files: file });
  }),
};
