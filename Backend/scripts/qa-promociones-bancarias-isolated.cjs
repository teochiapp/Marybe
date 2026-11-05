'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const tmpDir = path.join(__dirname, '..', '.tmp');
fs.mkdirSync(tmpDir, { recursive: true });
const dbName = `qa-promos-${process.pid}-${Date.now()}.db`;
const dbFile = path.join(tmpDir, dbName);
process.env.DATABASE_CLIENT = 'sqlite';
process.env.DATABASE_FILENAME = `.tmp/${dbName}`;
process.env.APP_KEYS ||= 'qa-promos-one,qa-promos-two';
process.env.API_TOKEN_SALT ||= 'qa-promos-api';
process.env.ADMIN_JWT_SECRET ||= 'qa-promos-admin';
process.env.TRANSFER_TOKEN_SALT ||= 'qa-promos-transfer';
process.env.JWT_SECRET ||= 'qa-promos-jwt';

async function main() {
  let app;
  try {
    app = await require('@strapi/strapi').createStrapi().load();
    const uid = 'api::promocion-bancaria.promocion-bancaria';
    const role = await app.db.query('plugin::users-permissions.role').findOne({ where: { type: 'public' } });
    await app.db.query('plugin::users-permissions.permission').create({ data: {
      action: `${uid}.find`,
      role: role.id,
    } });

    for (let index = 1; index <= 12; index += 1) {
      await app.documents(uid).create({
        status: 'published',
        data: {
          nombre: `Banco ${String(index).padStart(2, '0')}`,
          cuotas_descripcion: 'Cuotas sin interés',
          cuotas_cantidad: index % 2 ? [3, 6] : 3,
          monto_minimo: `$${index * 10000}`,
          orden: index,
          activo: true,
        },
      });
    }
    await app.documents(uid).create({ status: 'published', data: {
      nombre: 'Banco inactivo', cuotas_descripcion: 'No debe mostrarse',
      monto_minimo: '$1', orden: 0, activo: false,
    } });

    await new Promise(resolve => app.server.listen(0, '127.0.0.1', resolve));
    const base = `http://127.0.0.1:${app.server.httpServer.address().port}`;
    const response = await fetch(`${base}/api/promociones-bancarias?sort=orden:asc&populate=logo&filters[activo][$eq]=true`);
    const body = await response.json();

    assert.equal(response.status, 200, JSON.stringify(body));
    assert.equal(body.data.length, 12);
    assert.equal(body.meta.pagination.total, 12);
    assert.deepEqual(body.data.map(item => item.nombre), Array.from({ length: 12 }, (_, index) => `Banco ${String(index + 1).padStart(2, '0')}`));
    assert.equal(body.data[0].monto_minimo, '$10000');
    assert.equal(body.data[11].monto_minimo, '$120000');
    assert.ok(body.data.every(item => !('monto_maximo' in item)));

    const knex = app.db.connection;
    assert.equal(await knex.schema.hasColumn('promociones_bancarias', 'monto_maximo'), true);
    assert.equal(await knex.schema.hasColumn('promociones_bancarias', 'monto_minimo'), false);
    console.log('Strapi REST aislado: 12 bancos activos ordenados, el inactivo queda excluido y monto_minimo conserva los valores en la columna existente.');
  } finally {
    if (app) await app.destroy();
    for (const suffix of ['', '-wal', '-shm']) {
      const file = dbFile + suffix;
      if (fs.existsSync(file)) fs.unlinkSync(file);
    }
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
