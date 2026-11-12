'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const dbName = `test-composicion-${process.pid}-${Date.now()}.db`;
const dbPath = path.join(__dirname, '..', '.tmp', dbName);
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
process.env.DATABASE_CLIENT = 'sqlite';
process.env.DATABASE_FILENAME = `.tmp/${dbName}`;
process.env.APP_KEYS ||= 'test-composition-one,test-composition-two';
process.env.API_TOKEN_SALT ||= 'test-composition-api';
process.env.ADMIN_JWT_SECRET ||= 'test-composition-admin';
process.env.TRANSFER_TOKEN_SALT ||= 'test-composition-transfer';
process.env.JWT_SECRET ||= 'test-composition-jwt';

test('composición: publicación y descarte concurrentes con Strapi real', { timeout: 120000 }, async () => {
  const app = await require('@strapi/strapi').createStrapi().load();
  const MAIN = 'api::seccion-principal.seccion-principal';
  try {
    let main = await app.documents(MAIN).findFirst();
    const data = { borradores_editor_inicio: { ofertas: { hogar: { data: { titulo: 'No publicar' } } } } };
    if (main) await app.documents(MAIN).update({ documentId: main.documentId, data });
    else main = await app.documents(MAIN).create({ data: { secciones: [], ...data } });
    const service = app.service('api::secciones-inicio-admin.secciones-inicio-admin');
    let state = await service.overview('composicion');
    const originalHome = state.areas.hogar.published;
    const edited = { orden: [...state.areas.perfumeria.published.orden].reverse(), ocultos: ['banners'] };
    const concurrent = await Promise.allSettled([
      service.save('composicion', 'perfumeria', { version: state.version, data: edited }),
      service.save('composicion', 'hogar', { version: state.version, data: originalHome, publish: true }),
    ]);
    assert.equal(concurrent.filter(result => result.status === 'fulfilled').length, 1);
    assert.equal(concurrent.find(result => result.status === 'rejected').reason.status, 409);
    state = await service.overview('composicion');
    assert.deepEqual(state.areas.perfumeria.draft, edited);
    assert.notDeepEqual(state.areas.perfumeria.published, edited);
    const race = await Promise.allSettled([
      service.save('composicion', 'perfumeria', { version: state.version, data: edited, publish: true }),
      service.discard('composicion', 'perfumeria', { version: state.version }),
    ]);
    assert.equal(race.filter(result => result.status === 'fulfilled').length, 1);
    assert.equal(race.find(result => result.status === 'rejected').reason.status, 409);
    state = await service.overview('composicion');
    assert.deepEqual(state.areas.perfumeria.published, edited);
    assert.deepEqual(state.areas.hogar.published, originalHome);
    assert.equal(state.areas.perfumeria.draft, null);
    const stored = await app.documents(MAIN).findFirst();
    assert.equal(stored.borradores_editor_inicio.ofertas.hogar.data.titulo, 'No publicar');
    await new Promise(resolve => app.server.listen(0, '127.0.0.1', resolve));
    const base = `http://127.0.0.1:${app.server.httpServer.address().port}/api`;
    assert.equal((await fetch(`${base}/secciones-inicio-admin/composicion`)).status, 401);
    const jwt = require('jsonwebtoken').sign({ isAdminImport: true }, process.env.JWT_SECRET);
    const admin = await fetch(`${base}/secciones-inicio-admin/composicion`, { headers: { Authorization: `Bearer ${jwt}` } });
    assert.equal(admin.status, 200);
    assert.deepEqual((await admin.json()).data.areas.perfumeria.published, edited);
    const role = await app.db.query('plugin::users-permissions.role').findOne({ where: { type: 'public' } });
    const action = 'api::seccion-principal.seccion-principal.find';
    if (!await app.db.query('plugin::users-permissions.permission').findOne({ where: { action, role: role.id } })) await app.db.query('plugin::users-permissions.permission').create({ data: { action, role: role.id } });
    const publicResponse = await fetch(`${base}/seccion-principal`);
    assert.equal(publicResponse.status, 200);
    const publicData = (await publicResponse.json()).data;
    assert.deepEqual(publicData.composicion_inicio.perfumeria, edited);
    assert.equal(publicData.borradores_editor_inicio, undefined);
  } finally {
    await app.destroy();
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  }
});
