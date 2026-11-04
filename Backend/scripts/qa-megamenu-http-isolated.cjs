'use strict';
// Exercise the actual frontend filter builder through Strapi's REST API and count.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const tmpDir = path.join(__dirname, '..', '.tmp');
fs.mkdirSync(tmpDir, { recursive: true });
const dbName = `qa-menu-http-${process.pid}-${Date.now()}.db`;
const dbFile = path.join(tmpDir, dbName);
process.env.DATABASE_CLIENT = 'sqlite';
process.env.DATABASE_FILENAME = `.tmp/${dbName}`;
process.env.APP_KEYS ||= 'qa-menu-one,qa-menu-two';
process.env.API_TOKEN_SALT ||= 'qa-menu-api';
process.env.ADMIN_JWT_SECRET ||= 'qa-menu-admin';
process.env.TRANSFER_TOKEN_SALT ||= 'qa-menu-transfer';
process.env.JWT_SECRET ||= 'qa-menu-jwt';

const source = fs.readFileSync(path.join(__dirname, '../../Frontend/src/utils/catalogClassificationFilters.js'), 'utf8');
const loadFilter = new Function('module', source.replace('export function addClassificationFilters', 'function addClassificationFilters') + '\nmodule.exports = addClassificationFilters;');
const filterModule = { exports: {} };
loadFilter(filterModule);
const addClassificationFilters = filterModule.exports;

async function main() {
  let app;
  try {
    app = await require('@strapi/strapi').createStrapi().load();
    const role = await app.db.query('plugin::users-permissions.role').findOne({ where: { type: 'public' } });
    await app.db.query('plugin::users-permissions.permission').create({ data: { action: 'api::producto.producto.find', role: role.id } });
    await app.db.query('plugin::users-permissions.permission').create({ data: { action: 'api::categoria.categoria.find', role: role.id } });
    const catUid = 'api::categoria.categoria';
    const prodUid = 'api::producto.producto';
    const perf = await app.documents(catUid).create({ status: 'published', data: { nombre: 'Cuidado Personal', seccion: 'Perfumería' } });
    const hogar = await app.documents(catUid).create({ status: 'published', data: { nombre: 'Cuidado Personal', seccion: 'Hogar' } });
    const cases = [
      { id: 'BOTH', sec: 'Perfumería', cat: perf, sub: 'Rostro', tipo: 'Crema', descuento: 20, cls: [
        { seccion: 'Perfumería', categoria: 'Cuidado Personal', subcategoria: 'Rostro', tipo: 'Crema' },
        { seccion: 'Hogar', categoria: 'Cuidado Personal', subcategoria: 'Baño', tipo: 'Jabón' },
        { seccion: 'Hogar', categoria: 'Cuidado Personal', subcategoria: 'Baño', tipo: 'Gel' },
      ] },
      { id: 'PERF', sec: 'Perfumería', cat: perf, sub: 'Rostro', tipo: 'Crema', cls: [
        { seccion: 'Perfumería', categoria: 'Cuidado Personal', subcategoria: 'Rostro', tipo: 'Crema' },
      ] },
      { id: 'HOME', sec: 'Hogar', cat: hogar, sub: 'Baño', tipo: 'Jabón', cls: [
        { seccion: 'Hogar', categoria: 'Cuidado Personal', subcategoria: 'Baño', tipo: 'Jabón' },
      ] },
      { id: 'SPLIT', sec: 'Perfumería', cat: perf, sub: 'Rostro', tipo: 'Crema', cls: [
        { seccion: 'Hogar', categoria: 'Cuidado Personal', subcategoria: 'Cocina', tipo: 'Lavado' },
        { seccion: 'Hogar', categoria: 'Limpieza', subcategoria: 'Baño', tipo: 'Jabón' },
      ] },
      ...Array.from({ length: 13 }, (_, i) => ({ id: `EXTRA-${String(i).padStart(2, '0')}`, sec: 'Hogar', cat: hogar, sub: 'Baño', tipo: 'Jabón', descuento: 10, cls: [
        { seccion: 'Hogar', categoria: 'Cuidado Personal', subcategoria: 'Baño', tipo: 'Jabón' },
      ] })),
      { id: 'UNPUBLISHED', sec: 'Hogar', cat: hogar, sub: 'Baño', tipo: 'Jabón', publicado: false, cls: [
        { seccion: 'Hogar', categoria: 'Cuidado Personal', subcategoria: 'Baño', tipo: 'Jabón' },
      ] },
    ];
    for (const p of cases) await app.documents(prodUid).create({ status: 'published', data: {
      id_original: p.id, nombre: p.id, publicado: p.publicado !== false, descuento: p.descuento || 0, precio: 100,
      marca: p.id === 'BOTH' ? 'Marca A' : 'Marca B',
      ...(p.id === 'BOTH' ? { variantes: [{ id_original: 'BOTH-50', volumen: '50 ml', precio: 80 }] } : {}),
      seccion: p.sec, categoria: p.cat.documentId, subcategoria: p.sub, tipo: p.tipo, clasificaciones: p.cls,
    } });
    // Set the denormalized bounds as they appear once both prices are indexed.
    await app.db.connection('productos').where({ id_original: 'BOTH' }).update({ precio_minimo_calculado: 80, precio_maximo_calculado: 100 });
    await new Promise(resolve => app.server.listen(0, '127.0.0.1', resolve));
    const base = `http://127.0.0.1:${app.server.httpServer.address().port}`;
    async function query(filters, page = 1, offer = false, additional = false) {
      const params = new URLSearchParams({ 'pagination[page]': page, 'pagination[pageSize]': '12', populate: '*', 'filters[publicado][$eq]': 'true', 'sort[0]': 'nombre:asc' });
      const nextIndex = addClassificationFilters(params, filters);
      if (offer) params.set('filters[descuento][$gt]', '0');
      if (additional) {
        params.set('filters[marca][$in][0]', 'Marca A');
        params.set('filters[variantes][volumen][$in][0]', '50 ml');
        params.set(`filters[$and][${nextIndex}][precio_minimo_calculado][$lte]`, additional === 'gap' ? '95' : '120');
        params.set(`filters[$and][${nextIndex}][precio_maximo_calculado][$gte]`, additional === 'gap' ? '90' : '70');
      }
      const res = await fetch(`${base}/api/productos?${params}`);
      const body = await res.json();
      assert.equal(res.status, 200, JSON.stringify(body));
      return body;
    }
    const home = { seccion: 'Hogar', categoria: 'Cuidado Personal' };
    const p1 = await query(home);
    const p2 = await query(home, 2);
    assert.equal(p1.meta.pagination.total, 16);
    assert.equal(p2.meta.pagination.total, 16);
    assert.equal(new Set([...p1.data, ...p2.data].map(p => p.documentId)).size, 16);
    const sub = await query({ ...home, subcategoria: 'Baño' });
    assert.equal(sub.meta.pagination.total, 15);
    const type = await query({ ...home, subcategoria: 'Baño', tipo: 'Jabón' });
    assert.equal(type.meta.pagination.total, 15);
    const split = await query({ ...home, subcategoria: 'Baño', tipo: 'Gel' });
    assert.deepEqual(split.data.map(p => p.id_original), ['BOTH']);
    const perfProducts = await query({ seccion: 'Perfumería', categoria: 'Cuidado Personal' });
    assert.deepEqual(perfProducts.data.map(p => p.id_original).sort(), ['BOTH', 'PERF', 'SPLIT']);
    const general = await query({ categoria: 'Cuidado Personal' });
    assert.equal(general.meta.pagination.total, 17);
    const offers = await query(home, 1, true);
    assert.equal(offers.meta.pagination.total, 14);
    const combined = await query({ ...home, subcategoria: 'Baño', tipo: 'Jabón' }, 1, true, true);
    assert.equal(combined.meta.pagination.total, 1);
    assert.deepEqual(combined.data.map(p => p.id_original), ['BOTH']);
    // Current range matching uses product min/max, so it includes the gap
    // between the 80 variant and the 100 parent price.
    const gap = await query(home, 1, false, 'gap');
    assert.deepEqual(gap.data.map(p => p.id_original), ['BOTH']);
    console.log('REST real: Hogar 16 (2 páginas), Baño 15, Jabón 15, Gel 1, Perfumería 3 y ofertas 14.');
  } finally {
    if (app) await app.destroy();
    for (const suffix of ['', '-wal', '-shm']) {
      const file = dbFile + suffix;
      if (fs.existsSync(file)) fs.unlinkSync(file);
    }
  }
}
main().catch(err => { console.error(err); process.exitCode = 1; });
