'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const dbName = `test-product-visibility-${process.pid}-${Date.now()}.db`;
const dbPath = path.join(__dirname, '..', '.tmp', dbName);
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
process.env.DATABASE_CLIENT = 'sqlite';
process.env.DATABASE_FILENAME = `.tmp/${dbName}`;
process.env.APP_KEYS ||= 'test-vis-one,test-vis-two';
process.env.API_TOKEN_SALT ||= 'test-vis-api';
process.env.ADMIN_JWT_SECRET ||= 'test-vis-admin';
process.env.TRANSFER_TOKEN_SALT ||= 'test-vis-transfer';
process.env.JWT_SECRET ||= 'test-vis-jwt';

const UID = 'api::producto.producto';
const variante = (id, precio, precio_oferta = null) => ({ id_original: id, volumen: `${id} ml`, stock: 5, precio, precio_oferta, publicado: true, envio: '1' });

test('el producto solo se oculta cuando ni el padre ni sus variantes tienen precio > 0', { timeout: 180000 }, async () => {
  const app = await require('@strapi/strapi').createStrapi().load();
  try {
    const create = data => app.documents(UID).create({ status: 'published', data: { publicado: true, ...data } });
    const conVariantes = await create({ nombre: 'VIS Padre vacio con variantes', id_original: 'VIS-A', marca: 'GIVENCHY', precio: null, variantes: [variante('A1', 5200), variante('A2', 5900, 5500)] });
    const variantesSinPrecio = await create({ nombre: 'VIS Padre y variantes sin precio', id_original: 'VIS-B', marca: 'GIVENCHY', precio: null, variantes: [variante('B1', 0), variante('B2', 0)] });
    const soloPadre = await create({ nombre: 'VIS Solo padre con precio', id_original: 'VIS-C', precio: 3000 });
    const vacio = await create({ nombre: 'VIS Sin precio ni variantes', id_original: 'VIS-D', precio: null });
    const soloOferta = await create({ nombre: 'VIS Variante solo con oferta', id_original: 'VIS-E', precio: 0, variantes: [variante('E1', 0, 4000)] });

    const row = documentId => app.db.query(UID).findOne({ where: { documentId, publishedAt: { $notNull: true } } });
    assert.equal(Number((await row(conVariantes.documentId)).precio_minimo_calculado), 5200);
    assert.equal(Number((await row(conVariantes.documentId)).precio_maximo_calculado), 5500);
    assert.equal((await row(variantesSinPrecio.documentId)).precio_minimo_calculado, null);
    assert.equal((await row(vacio.documentId)).precio_minimo_calculado, null);

    await new Promise(resolve => app.server.listen(0, '127.0.0.1', resolve));
    const role = await app.db.query('plugin::users-permissions.role').findOne({ where: { type: 'public' } });
    for (const action of ['api::producto.producto.find', 'api::producto.producto.findOne']) {
      const exists = await app.db.query('plugin::users-permissions.permission').findOne({ where: { action, role: role.id } });
      if (!exists) await app.db.query('plugin::users-permissions.permission').create({ data: { action, role: role.id } });
    }
    const base = `http://127.0.0.1:${app.server.httpServer.address().port}/api/productos`;
    const get = async query => {
      const res = await fetch(`${base}${query}`);
      return { status: res.status, body: await res.json() };
    };

    const list = await get('?filters[nombre][$startsWith]=VIS&pagination[pageSize]=50');
    assert.equal(list.status, 200);
    const ids = list.body.data.map(p => p.id_original).sort();
    assert.deepEqual(ids, ['VIS-A', 'VIS-C', 'VIS-E']);

    const search = await get('?filters[$or][0][nombre][$containsi]=con variantes&filters[$or][1][marca][$containsi]=con variantes&filters[publicado][$eq]=true');
    assert.deepEqual(search.body.data.map(p => p.id_original), ['VIS-A']);

    const hiddenSearch = await get('?filters[$or][0][nombre][$containsi]=sin precio&filters[$or][1][marca][$containsi]=sin precio');
    assert.deepEqual(hiddenSearch.body.data.map(p => p.id_original), []);

    const brandCatalogSearch = await get(
      '?filters[$and][0][$or][0][nombre][$containsi]=Givenchy'
      + '&filters[$and][0][$or][1][marca][$containsi]=Givenchy'
      + '&filters[$and][0][$or][2][subcategoria][$containsi]=Givenchy'
      + '&filters[$and][0][$or][3][tipo][$containsi]=Givenchy'
      + '&filters[publicado][$eq]=true'
    );
    assert.equal(brandCatalogSearch.status, 200, JSON.stringify(brandCatalogSearch.body));
    assert.deepEqual(brandCatalogSearch.body.data.map(p => p.id_original), ['VIS-A']);

    assert.equal((await get(`/${conVariantes.documentId}`)).status, 200);
    assert.equal((await get(`/${soloPadre.documentId}`)).status, 200);
    assert.equal((await get(`/${variantesSinPrecio.documentId}`)).status, 404);
    assert.equal((await get(`/${vacio.documentId}`)).status, 404);
    assert.equal((await get(`/${soloOferta.documentId}`)).status, 200);

    await app.documents(UID).update({ documentId: variantesSinPrecio.documentId, status: 'published', data: { variantes: [variante('B1', 7100)] } });
    assert.equal(Number((await row(variantesSinPrecio.documentId)).precio_minimo_calculado), 7100);
    assert.equal((await get(`/${variantesSinPrecio.documentId}`)).status, 200);

    await app.documents(UID).update({ documentId: conVariantes.documentId, status: 'published', data: { variantes: [variante('A1', 0)] } });
    assert.equal((await row(conVariantes.documentId)).precio_minimo_calculado, null);
    assert.equal((await get(`/${conVariantes.documentId}`)).status, 404);

    await assert.rejects(
      () => create({ nombre: 'VIS Variantes duplicadas', id_original: 'VIS-DUP', variantes: [variante('DUP-1', 1000), variante('DUP-1', 2000)] }),
      /Variante duplicada/
    );
    await assert.rejects(
      () => app.documents(UID).update({ documentId: soloPadre.documentId, status: 'published', data: { variantes: [variante('DUP-2', 1000), variante('dup-2', 2000)] } }),
      /Variante duplicada/
    );
  } finally {
    await app.destroy();
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  }
});
