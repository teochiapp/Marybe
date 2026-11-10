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
  } finally {
    await app.destroy();
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  }
});
