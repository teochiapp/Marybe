'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const dbName = `test-banners-carousel-${process.pid}-${Date.now()}.db`;
const dbPath = path.join(__dirname, '..', '.tmp', dbName);
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
process.env.DATABASE_CLIENT = 'sqlite';
process.env.DATABASE_FILENAME = `.tmp/${dbName}`;
process.env.APP_KEYS ||= 'test-banners-one,test-banners-two';
process.env.API_TOKEN_SALT ||= 'test-banners-api';
process.env.ADMIN_JWT_SECRET ||= 'test-banners-admin';
process.env.TRANSFER_TOKEN_SALT ||= 'test-banners-transfer';
process.env.JWT_SECRET ||= 'test-banners-jwt';

test('configuración de carrusel y herencia persisten sin publicar el borrador', { timeout: 120000 }, async () => {
  const app = await require('@strapi/strapi').createStrapi().load();
  try {
    const image = await app.db.query('plugin::upload.file').create({ data: { name: 'test.webp', hash: 'test-banner', ext: '.webp', mime: 'image/webp', size: 1, url: '/uploads/test.webp', provider: 'local' } });
    const uid = 'api::promociones-inicio.promociones-inicio';
    const populate = { Filas: { on: { 'layout.fila-1-columna': { populate: { banners: { populate: '*' } } } } } };
    const created = await app.documents(uid).create({ status: 'published', data: { titulo: 'Prueba', seccion: 'Perfumería', Filas: [{ __component: 'layout.fila-1-columna', es_carrusel: true, banners: [{ titulo: 'Banner', imagen_desktop: image.id, diseno: { desktop: { height: 480 }, mobile: { height: 300, positionX: 20 } } }] }] } });
    const current = await app.documents(uid).findOne({ documentId: created.documentId, status: 'draft', populate });
    const data = structuredClone(current);
    data.Filas[0].config_carrusel = { autoplay: false, intervalo: 5, indicador: 'contador', vistaParcial: true };
    delete data.Filas[0].banners[0].diseno.mobile.height;
    const service = app.service('api::banners-admin.banners-admin');
    const draft = await service.savePromotion(created.documentId, { version: current.updatedAt, data, publish: false });
    assert.equal(draft.Filas[0].banners[0].diseno.mobile.height, undefined);
    assert.equal(draft.Filas[0].banners[0].diseno.mobile.positionX, 20);
    assert.deepEqual(draft.Filas[0].config_carrusel, data.Filas[0].config_carrusel);
    const publishedBefore = await app.documents(uid).findOne({ documentId: created.documentId, status: 'published', populate });
    assert.equal(publishedBefore.Filas[0].config_carrusel, null);
    assert.equal(publishedBefore.Filas[0].banners[0].diseno.mobile.height, 300);
    await service.savePromotion(created.documentId, { version: draft.updatedAt, data: draft, publish: true });
    const publishedAfter = await app.documents(uid).findOne({ documentId: created.documentId, status: 'published', populate });
    assert.deepEqual(publishedAfter.Filas[0].config_carrusel, data.Filas[0].config_carrusel);
    assert.equal(publishedAfter.Filas[0].banners[0].diseno.mobile.height, undefined);
    const video = await app.db.query('plugin::upload.file').create({ data: { name: 'test.mp4', hash: 'test-video', ext: '.mp4', mime: 'video/mp4', size: 10, url: '/uploads/test.mp4', provider: 'local' } });
    const svg = await app.db.query('plugin::upload.file').create({ data: { name: 'test.svg', hash: 'test-svg', ext: '.svg', mime: 'image/svg+xml', size: 1, url: '/uploads/test.svg', provider: 'local' } });
    const currentDraft = await app.documents(uid).findOne({ documentId: created.documentId, status: 'draft', populate });
    currentDraft.Filas[0].banners[0].imagen_desktop = video;
    currentDraft.Filas[0].banners[0].imagen_mobile = svg;
    const videoDraft = await service.savePromotion(created.documentId, { version: currentDraft.updatedAt, data: currentDraft, publish: false });
    assert.equal(videoDraft.Filas[0].banners[0].imagen_desktop.mime, 'video/mp4');
    assert.equal(videoDraft.Filas[0].banners[0].imagen_mobile.mime, 'image/svg+xml');
    const stillPublished = await app.documents(uid).findOne({ documentId: created.documentId, status: 'published', populate });
    assert.equal(stillPublished.Filas[0].banners[0].imagen_desktop.mime, 'image/webp');
    await service.savePromotion(created.documentId, { version: videoDraft.updatedAt, data: videoDraft, publish: true });
    const videoPublished = await app.documents(uid).findOne({ documentId: created.documentId, status: 'published', populate });
    assert.equal(videoPublished.Filas[0].banners[0].imagen_desktop.mime, 'video/mp4');
    assert.equal(videoPublished.Filas[0].banners[0].imagen_mobile.mime, 'image/svg+xml');

    // Real multipart endpoint and upload service, with in-memory storage to avoid filesystem writes.
    await new Promise(resolve => app.server.listen(0, '127.0.0.1', resolve));
    const base = `http://127.0.0.1:${app.server.httpServer.address().port}`;
    const jwt = require('jsonwebtoken').sign({ isAdminImport: true }, process.env.JWT_SECRET);
    const provider = app.plugin('upload').provider;
    const originalUploadStream = provider.uploadStream;
    const accepted = [];
    provider.uploadStream = async file => {
      for await (const chunk of file.stream) { void chunk; }
      accepted.push(file.mime);
      file.url = `/uploads/${file.hash}${file.ext}`;
    };
    const send = async (bytes, name, mime, authenticated = true) => {
      const form = new FormData();
      form.append('files', new Blob([bytes], { type: mime }), name);
      return fetch(`${base}/api/banners-admin/upload`, { method: 'POST', headers: authenticated ? { Authorization: `Bearer ${jwt}` } : {}, body: form });
    };
    try {
      const safeSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"><path d="M0 0h1v1z"/></svg>';
      assert.equal((await send(safeSvg, 'safe.svg', 'image/svg+xml', false)).status, 401);
      assert.equal((await send(safeSvg, 'safe.svg', 'image/svg+xml')).status, 200);
      assert.equal((await send('<svg xmlns="http://www.w3.org/2000/svg"><script/></svg>', 'unsafe.svg', 'image/svg+xml')).status, 400);
      assert.equal((await send(Buffer.alloc(300 * 1024 + 1), 'large.png', 'image/png')).status, 400);
      assert.equal((await send(Buffer.from('000000186674797069736f6d0000020069736f6d69736f32', 'hex'), 'test.mp4', 'video/mp4')).status, 200);
      assert.equal((await send(Buffer.from('1a45dfa39f4286810142f7810142f2810442f381084282847765626d4287810242858102', 'hex'), 'test.webm', 'video/webm')).status, 200);
      assert.equal((await send(Buffer.alloc(8 * 1024 * 1024 + 1), 'large.mp4', 'video/mp4')).status, 400);
      assert.deepEqual(accepted, ['image/svg+xml', 'video/mp4', 'video/webm']);
    } finally { provider.uploadStream = originalUploadStream; }
  } finally {
    await app.destroy();
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  }
});
