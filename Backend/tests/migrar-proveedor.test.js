'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const backendDir = path.resolve(__dirname, '..');
const dbName = `test-migrar-proveedor-${process.pid}-${Date.now()}.db`;
const dbPath = path.join(backendDir, '.tmp', dbName);
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
process.env.DATABASE_CLIENT = 'sqlite';
process.env.DATABASE_FILENAME = `.tmp/${dbName}`;
process.env.APP_KEYS ||= 'test-prov-one,test-prov-two';
process.env.API_TOKEN_SALT ||= 'test-prov-api';
process.env.ADMIN_JWT_SECRET ||= 'test-prov-admin';
process.env.TRANSFER_TOKEN_SALT ||= 'test-prov-transfer';
process.env.JWT_SECRET ||= 'test-prov-jwt';

const {
  DEFAULT_FROM,
  DEFAULT_TO,
  normalizarClave,
  parseArgs,
  coincideProveedor,
  migrarProveedor,
} = require('../scripts/migrar-proveedor');

const UID_PROD = 'api::producto.producto';
const UID_MAIN = 'api::seccion-principal.seccion-principal';

test('helpers parseArgs y coincideProveedor respetan modo flexible vs --exact', () => {
  assert.deepEqual(parseArgs([]), {
    apply: false,
    exact: false,
    from: DEFAULT_FROM,
    to: DEFAULT_TO,
  });
  assert.deepEqual(parseArgs(['--from=dcc sa', '--to=DCC S.A', '--exact', '--apply']), {
    apply: true,
    exact: true,
    from: 'dcc sa',
    to: 'DCC S.A',
  });
  assert.equal(normalizarClave('  DCC   SA '), 'dcc sa');
  assert.equal(coincideProveedor('  dcc   sa ', 'DCC SA', false), true);
  assert.equal(coincideProveedor('DCC S.A', 'DCC SA', false), false);
  assert.equal(coincideProveedor('dcc sa', 'DCC SA', true), false);
  assert.equal(coincideProveedor('DCC SA', 'DCC SA', true), true);
});

test('migrarProveedor unifica DCC SA -> DCC S.A en published, draft y bloques de descuentos', { timeout: 180000 }, async () => {
  const origCwd = process.cwd();
  process.chdir(backendDir);
  const app = await require('@strapi/strapi').createStrapi({ appDir: backendDir, distDir: backendDir }).load();
  try {
    const p1 = await app.documents(UID_PROD).create({
      status: 'published',
      data: {
        id_original: 'PRV-1',
        nombre: 'Preal Gel Fijación',
        proveedor: 'DCC SA',
        publicado: true,
      },
    });
    await app.documents(UID_PROD).update({
      documentId: p1.documentId,
      status: 'draft',
      data: {
        nombre: 'Preal Gel Fijación (borrador)',
        proveedor: 'DCC SA',
      },
    });

    const p2Draft = await app.documents(UID_PROD).create({
      status: 'draft',
      data: {
        id_original: 'PRV-2',
        nombre: 'Vidol Talco Borrador',
        proveedor: '  dcc   sa ',
        publicado: false,
      },
    });

    const p3Destino = await app.documents(UID_PROD).create({
      status: 'published',
      data: {
        id_original: 'PRV-3',
        nombre: 'Preal Colonia',
        proveedor: 'DCC S.A',
        publicado: true,
      },
    });

    const p4Otro = await app.documents(UID_PROD).create({
      status: 'published',
      data: {
        id_original: 'PRV-4',
        nombre: 'Producto Ajeno',
        proveedor: 'OTRO PROVEEDOR',
        publicado: true,
      },
    });

    const uploadedFile = await app.db.query('plugin::upload.file').create({
      data: {
        name: 'prov-test.webp',
        hash: 'prov_test_hash',
        ext: '.webp',
        mime: 'image/webp',
        size: 1,
        url: '/uploads/prov-test.webp',
        provider: 'local',
      },
    });

    await app.documents(UID_MAIN).create({
      data: {
        secciones: [{ seccion: 'Perfumeria', titulo_cursiva: 'Lo nuevo', titulo_normal: 'en Marybe', imagen_desktop: uploadedFile.id }],
        diseno_secciones: {
          descuentos: {
            'bloque-1': {
              entidad_tipo: 'proveedor',
              entidad_id: 'DCC SA',
              entidad_nombre: 'DCC SA',
              titulo_cursiva: 'Descuentos',
            },
          },
        },
        borradores_editor_inicio: {
          descuentos: {
            'bloque-2': {
              data: {
                entidad_tipo: 'proveedor',
                entidad_id: 'dcc sa',
                entidad_nombre: 'dcc sa',
              },
              savedAt: '2026-11-14T00:00:00.000Z',
            },
          },
        },
      },
    });

    // 1. Modo --exact en dry-run solo detecta coincidencia literal (p1 y bloque-1)
    const dryExact = await migrarProveedor(app, { apply: false, exact: true });
    assert.equal(dryExact.modo, 'dry-run');
    assert.equal(dryExact.exacto, true);
    assert.equal(dryExact.productosAfectadosCount, 1);
    assert.equal(dryExact.filasAActualizarCount, 2);
    assert.equal(dryExact.bloquesInicioAfectados.length, 1);

    // 2. Modo flexible en dry-run incluye p1 (pub+draft) y p2 (draft con espacios/minúsculas), sin tocar DB
    const dry = await migrarProveedor(app, { apply: false });
    assert.equal(dry.modo, 'dry-run');
    assert.equal(dry.productosAfectadosCount, 2);
    assert.equal(dry.filasAActualizarCount, 3);
    assert.equal(dry.destinoYaExistenteDocs, 1);
    assert.equal(dry.bloquesInicioAfectados.length, 2);

    const p1Before = await app.documents(UID_PROD).findOne({ documentId: p1.documentId, status: 'published' });
    assert.equal(p1Before.proveedor, 'DCC SA');

    // 3. Apply unifica productos y referencias en seccion-principal sin pisar borradores ni otros proveedores
    const applied = await migrarProveedor(app, { apply: true });
    assert.equal(applied.modo, 'apply');
    assert.equal(applied.productosAfectadosCount, 2);
    assert.equal(applied.filasActualizadasCount, 3);
    assert.equal(applied.seccionPrincipalActualizada, true);
    assert.equal(applied.restantesOrigenCount, 0);

    const p1PubAfter = await app.documents(UID_PROD).findOne({ documentId: p1.documentId, status: 'published' });
    const p1DraftAfter = await app.documents(UID_PROD).findOne({ documentId: p1.documentId, status: 'draft' });
    assert.equal(p1PubAfter.proveedor, 'DCC S.A');
    assert.equal(p1PubAfter.nombre, 'Preal Gel Fijación');
    assert.equal(p1DraftAfter.proveedor, 'DCC S.A');
    assert.equal(p1DraftAfter.nombre, 'Preal Gel Fijación (borrador)');

    const p2PubAfter = await app.documents(UID_PROD).findOne({ documentId: p2Draft.documentId, status: 'published' });
    const p2DraftAfter = await app.documents(UID_PROD).findOne({ documentId: p2Draft.documentId, status: 'draft' });
    assert.equal(p2PubAfter, null);
    assert.equal(p2DraftAfter.proveedor, 'DCC S.A');

    const p3After = await app.documents(UID_PROD).findOne({ documentId: p3Destino.documentId, status: 'published' });
    const p4After = await app.documents(UID_PROD).findOne({ documentId: p4Otro.documentId, status: 'published' });
    assert.equal(p3After.proveedor, 'DCC S.A');
    assert.equal(p4After.proveedor, 'OTRO PROVEEDOR');

    const mainAfter = await app.documents(UID_MAIN).findFirst();
    assert.equal(mainAfter.diseno_secciones.descuentos['bloque-1'].entidad_id, 'DCC S.A');
    assert.equal(mainAfter.diseno_secciones.descuentos['bloque-1'].entidad_nombre, 'DCC S.A');
    assert.equal(mainAfter.borradores_editor_inicio.descuentos['bloque-2'].data.entidad_id, 'DCC S.A');
    assert.equal(mainAfter.borradores_editor_inicio.descuentos['bloque-2'].data.entidad_nombre, 'DCC S.A');

    // 4. Segunda ejecución es idempotente
    const idempotent = await migrarProveedor(app, { apply: false });
    assert.equal(idempotent.productosAfectadosCount, 0);
    assert.equal(idempotent.filasAActualizarCount, 0);
    assert.equal(idempotent.bloquesInicioAfectados.length, 0);
  } finally {
    process.chdir(origCwd);
    await app.destroy();
    for (const suffix of ['', '-shm', '-wal']) {
      if (fs.existsSync(dbPath + suffix)) fs.unlinkSync(dbPath + suffix);
    }
  }
});
