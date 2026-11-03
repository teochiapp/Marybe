'use strict';
const jwt = require('jsonwebtoken');
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
  slots: ctx => run(ctx, service => service.saveSlots(ctx.request.body)),
  async publicSlots(ctx) { ctx.set('Cache-Control', 'no-cache'); return ctx.send({ data: await strapi.service('api::banners-admin.banners-admin').publicSlots() }); },
  media: ctx => run(ctx, () => strapi.db.query('plugin::upload.file').findMany({
    where: { mime: { $startsWith: 'image/' }, $not: { mime: 'image/svg+xml' } }, orderBy: { createdAt: 'desc' }, limit: 200,
    select: ['id', 'name', 'url', 'width', 'height', 'mime'],
  })),
  upload: ctx => run(ctx, async () => {
    const file = ctx.request.files?.files;
    if (!file || Array.isArray(file) || !['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'].includes(file.mimetype || file.type) || file.size > 10 * 1024 * 1024) {
      const error = new Error('Subí una imagen JPG, PNG, WebP, GIF o AVIF de hasta 10 MB.'); error.status = 400; throw error;
    }
    return strapi.plugin('upload').service('upload').upload({ data: {}, files: file });
  }),
};
