'use strict';

// Verify Strapi's real component joins with two categories that share a name.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const tmpDir = path.join(__dirname, '..', '.tmp');
fs.mkdirSync(tmpDir, { recursive: true });
const dbName = `qa-categories-${process.pid}-${Date.now()}.db`;
const dbFile = path.join(tmpDir, dbName);
process.env.DATABASE_CLIENT = 'sqlite';
process.env.DATABASE_FILENAME = `.tmp/${dbName}`;
process.env.APP_KEYS ||= 'qa-category-key-one,qa-category-key-two';
process.env.API_TOKEN_SALT ||= 'qa-category-api-salt';
process.env.ADMIN_JWT_SECRET ||= 'qa-category-admin-secret';
process.env.TRANSFER_TOKEN_SALT ||= 'qa-category-transfer-salt';
process.env.JWT_SECRET ||= 'qa-category-jwt-secret';

const UID_PRODUCT = 'api::producto.producto';
const UID_CATEGORY = 'api::categoria.categoria';

async function main() {
  let app;
  try {
    app = await require('@strapi/strapi').createStrapi().load();
    const perf = await app.documents(UID_CATEGORY).create({ status: 'published', data: { nombre: 'Cuidado Personal', seccion: 'Perfumería' } });
    const hogar = await app.documents(UID_CATEGORY).create({ status: 'published', data: { nombre: 'Cuidado Personal', seccion: 'Hogar' } });
    assert.notEqual(perf.documentId, hogar.documentId);

    const cases = [
      { id: 'BOTH', primary: perf, section: 'Perfumería', sub: 'Rostro', classifications: [
        { seccion: 'Perfumería', categoria: 'Cuidado Personal', subcategoria: 'Rostro', tipo: 'Crema' },
        { seccion: 'Hogar', categoria: 'Cuidado Personal', subcategoria: 'Baño', tipo: 'Jabón' },
      ] },
      { id: 'PERF', primary: perf, section: 'Perfumería', sub: 'Rostro', classifications: [
        { seccion: 'Perfumería', categoria: 'Cuidado Personal', subcategoria: 'Rostro', tipo: 'Crema' },
      ] },
      { id: 'HOME', primary: hogar, section: 'Hogar', sub: 'Baño', classifications: [
        { seccion: 'Hogar', categoria: 'Cuidado Personal', subcategoria: 'Baño', tipo: 'Jabón' },
      ] },
      { id: 'SPLIT', primary: perf, section: 'Perfumería', sub: 'Rostro', classifications: [
        { seccion: 'Hogar', categoria: 'Cuidado Personal', subcategoria: 'Cocina', tipo: 'Lavado' },
        { seccion: 'Hogar', categoria: 'Limpieza', subcategoria: 'Baño', tipo: 'Jabón' },
      ] },
    ];
    for (const item of cases) {
      await app.documents(UID_PRODUCT).create({ status: 'published', data: {
        id_original: item.id, nombre: item.id, publicado: true,
        seccion: item.section, categoria: item.primary.documentId,
        subcategoria: item.sub, clasificaciones: item.classifications,
      } });
    }

    const filters = { publicado: true, $and: [{ $or: [
      { seccion: 'Hogar', categoria: { nombre: { $in: ['Cuidado Personal'] } }, subcategoria: { $in: ['Baño'] } },
      { clasificaciones: { seccion: 'Hogar', categoria: { $in: ['Cuidado Personal'] }, subcategoria: { $in: ['Baño'] } } },
    ] }] };
    const products = await app.documents(UID_PRODUCT).findMany({ status: 'published', filters });
    assert.deepEqual(products.map(p => p.id_original).sort(), ['BOTH', 'HOME']);
    console.log('Clasificaciones de Hogar y Perfumería separadas, incluso con el mismo nombre y varias filas.');
  } finally {
    if (app) await app.destroy();
    for (const suffix of ['', '-shm', '-wal']) {
      const file = dbFile + suffix;
      if (fs.existsSync(file)) fs.unlinkSync(file);
    }
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
