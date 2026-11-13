'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const backendDir = path.resolve(__dirname, '..');
const dbName = `test-migrar-coloracion-${process.pid}-${Date.now()}.db`;
const dbPath = path.join(backendDir, '.tmp', dbName);
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
process.env.DATABASE_CLIENT = 'sqlite';
process.env.DATABASE_FILENAME = `.tmp/${dbName}`;
process.env.APP_KEYS ||= 'test-mig-one,test-mig-two';
process.env.API_TOKEN_SALT ||= 'test-mig-api';
process.env.ADMIN_JWT_SECRET ||= 'test-mig-admin';
process.env.TRANSFER_TOKEN_SALT ||= 'test-mig-transfer';
process.env.JWT_SECRET ||= 'test-mig-jwt';

const {
  migrarCategoriaDuplicada,
  normalizarClave,
  combinarSubcategorias,
  normalizarClasificaciones,
} = require('../scripts/migrar-coloracion-capilar');
const TAXONOMY = require('../src/utils/excel-taxonomy.json');

const UID_CAT = 'api::categoria.categoria';
const UID_PROD = 'api::producto.producto';
const UID_ORDER = 'api::ordenamiento-menu-header.ordenamiento-menu-header';
const UID_MENU = 'api::menu-lanzamientos-ofertas.menu-lanzamientos-ofertas';
const UID_MAIN = 'api::seccion-principal.seccion-principal';

test('excel-taxonomy.json usa Coloración Capilar con tilde', () => {
  assert.ok(Object.prototype.hasOwnProperty.call(TAXONOMY, 'Coloración Capilar'));
  assert.equal(Object.prototype.hasOwnProperty.call(TAXONOMY, 'Coloracion Capilar'), false);
  assert.equal(normalizarClave('Coloración Capilar'), 'coloracion capilar');
});

test('combinarSubcategorias y normalizarClasificaciones deduplican variantes por tilde/mayúsculas', () => {
  const merged = combinarSubcategorias(
    [{ id: 10, nombre: 'Matizadores', tipos: [] }],
    [[{ id: 99, nombre: 'matizadores', tipos: [{ id: 5, nombre: 'Violeta' }] }, { id: 100, nombre: 'Decoloración', tipos: [] }]]
  );
  assert.equal(merged.length, 2);
  assert.deepEqual(merged[0], { nombre: 'Matizadores', tipos: [{ nombre: 'Violeta' }] });
  assert.deepEqual(merged[1], { nombre: 'Decoloración', tipos: [] });

  const clasifRes = normalizarClasificaciones(
    [
      { seccion: 'Perfumería', categoria: 'Coloracion Capilar', subcategoria: 'Matizadores', tipo: '' },
      { seccion: 'Perfumería', categoria: 'Coloración Capilar', subcategoria: 'Matizadores', tipo: '' },
    ],
    {
      targetKey: 'coloracion capilar',
      targetName: 'Coloración Capilar',
      mergeSections: false,
      seccionObjetivo: '',
      seccionesAbsorbidas: new Set(),
    }
  );
  assert.equal(clasifRes.changed, true);
  assert.deepEqual(clasifRes.clasificaciones, [
    { seccion: 'Perfumería', categoria: 'Coloración Capilar', subcategoria: 'Matizadores', tipo: '' },
  ]);
});

test('migrarCategoriaDuplicada unifica Coloracion Capilar -> Coloración Capilar en Strapi sin perder borradores ni menú', { timeout: 180000 }, async () => {
  const origCwd = process.cwd();
  process.chdir(backendDir);
  const app = await require('@strapi/strapi').createStrapi({ appDir: backendDir, distDir: backendDir }).load();
  try {
    const catSinTilde = await app.documents(UID_CAT).create({
      status: 'published',
      data: {
        nombre: 'Coloracion Capilar',
        seccion: 'Perfumería',
        subcategorias: [
          { nombre: 'Matizadores', tipos: [{ nombre: 'Violeta' }] },
          { nombre: 'Decoloración', tipos: [] },
        ],
      },
    });
    const catConTilde = await app.documents(UID_CAT).create({
      status: 'published',
      data: {
        nombre: 'Coloración Capilar',
        seccion: 'Perfumería',
        subcategorias: [
          { nombre: 'Matizadores', tipos: [] },
          { nombre: 'Coloración Permanente', tipos: [] },
        ],
      },
    });
    const catHogar = await app.documents(UID_CAT).create({
      status: 'published',
      data: { nombre: 'Coloracion Capilar', seccion: 'Hogar', subcategorias: [] },
    });
    const capilares = await app.documents(UID_CAT).create({
      status: 'published',
      data: { nombre: 'Capilares', seccion: 'Perfumería', subcategorias: [] },
    });

    const p1 = await app.documents(UID_PROD).create({
      status: 'published',
      data: {
        id_original: 'COL-1',
        nombre: 'Tintura 1',
        publicado: true,
        seccion: 'Perfumería',
        categoria: catSinTilde.documentId,
        subcategoria: 'Matizadores',
        tipo: 'Violeta',
        clasificaciones: [
          { seccion: 'Perfumería', categoria: 'Coloracion Capilar', subcategoria: 'Matizadores', tipo: 'Violeta' },
        ],
      },
    });
    await app.documents(UID_PROD).update({
      documentId: p1.documentId,
      status: 'draft',
      data: { nombre: 'Tintura 1 (borrador)' },
    });

    const p2 = await app.documents(UID_PROD).create({
      status: 'published',
      data: {
        id_original: 'COL-2',
        nombre: 'Producto Mixto',
        publicado: true,
        seccion: 'Perfumería',
        categoria: capilares.documentId,
        clasificaciones: [
          { seccion: 'Perfumería', categoria: 'Capilares', subcategoria: 'Shampoo', tipo: '' },
          { seccion: 'Perfumería', categoria: 'Coloracion Capilar', subcategoria: 'Decoloración', tipo: '' },
          { seccion: 'Perfumería', categoria: 'Coloración Capilar', subcategoria: 'Decoloración', tipo: '' },
        ],
      },
    });

    const p3Draft = await app.documents(UID_PROD).create({
      status: 'draft',
      data: {
        id_original: 'COL-3',
        nombre: 'Borrador Exclusivo',
        publicado: false,
        seccion: 'Perfumería',
        categoria: catSinTilde.documentId,
        clasificaciones: [
          { seccion: 'Perfumería', categoria: 'Coloracion Capilar', subcategoria: 'Matizadores', tipo: '' },
        ],
      },
    });

    await app.documents(UID_ORDER).create({
      data: {
        categoriasPerfumeria: [catSinTilde.documentId, catConTilde.documentId],
        ordenVisual: {
          perfumeria: ['ofertas', `categoria:${catSinTilde.documentId}`, `categoria:${catConTilde.documentId}`],
          categoriasAgregadas: { perfumeria: [catSinTilde.documentId] },
        },
      },
    });

    await app.documents(UID_MENU).create({
      data: {
        ofertas: {
          mostrar_columna_descuentos: true,
          titulo_descuentos: 'Descuentos',
          titulo_destacados: 'Destacados',
          productos_destacados: [p1.documentId],
          columnas_categorias: [
            { titulo_columna: 'Pelo', categorias: [catSinTilde.documentId, capilares.documentId] },
          ],
        },
        lanzamientos: {
          titulo_categorias: 'Categorías',
          titulo_destacados: 'Nuevos',
          productos_destacados: [p2.documentId],
          categorias: [catSinTilde.documentId],
        },
      },
    });

    const uploadedFile = await app.db.query('plugin::upload.file').create({
      data: {
        name: 'banner-test.webp',
        hash: 'banner_test_hash',
        ext: '.webp',
        mime: 'image/webp',
        size: 1,
        url: '/uploads/banner-test.webp',
        provider: 'local',
      },
    });

    await app.documents(UID_MAIN).create({
      data: {
        secciones: [{ seccion: 'Perfumeria', titulo_cursiva: 'Lo nuevo', titulo_normal: 'en Marybe', imagen_desktop: uploadedFile.id }],
        diseno_categorias: { perfumeria: { orden: [catSinTilde.documentId, capilares.documentId] } },
        destacada_perfumeria: { titulo: 'Color', categoria: catSinTilde.documentId },
        categoria_especifica_perfumeria: { titulo: 'Color Específica', icono: uploadedFile.id, categoria: catSinTilde.documentId },
      },
    });

    // 1. Dry-run no escribe cambios
    const dry = await migrarCategoriaDuplicada(app, { apply: false });
    assert.equal(dry.modo, 'dry-run');
    assert.equal(dry.categoriasEliminadas.length, 0);
    assert.equal(dry.productosAfectadosCount, 3);
    assert.ok(await app.documents(UID_CAT).findOne({ documentId: catSinTilde.documentId, status: 'published' }));

    // 2. Apply unifica dentro de cada sección
    const applied = await migrarCategoriaDuplicada(app, { apply: true });
    assert.equal(applied.modo, 'apply');
    assert.deepEqual(applied.categoriasEliminadas, [catSinTilde.documentId]);

    assert.equal(await app.documents(UID_CAT).findOne({ documentId: catSinTilde.documentId, status: 'published' }), null);
    const catHogarUpdated = await app.documents(UID_CAT).findOne({ documentId: catHogar.documentId, status: 'published' });
    assert.equal(catHogarUpdated.nombre, 'Coloración Capilar');

    const catFinalPub = await app.documents(UID_CAT).findOne({
      documentId: catConTilde.documentId,
      status: 'published',
      populate: { subcategorias: { populate: ['tipos'] } },
    });
    assert.deepEqual(catFinalPub.subcategorias.map(s => s.nombre).sort(), ['Coloración Permanente', 'Decoloración', 'Matizadores']);

    const p1Pub = await app.documents(UID_PROD).findOne({ documentId: p1.documentId, status: 'published', populate: ['categoria', 'clasificaciones'] });
    const p1DraftAfter = await app.documents(UID_PROD).findOne({ documentId: p1.documentId, status: 'draft', populate: ['categoria', 'clasificaciones'] });
    assert.equal(p1Pub.nombre, 'Tintura 1');
    assert.equal(p1Pub.categoria.documentId, catConTilde.documentId);
    assert.equal(p1Pub.clasificaciones[0].categoria, 'Coloración Capilar');
    assert.equal(p1DraftAfter.nombre, 'Tintura 1 (borrador)');
    assert.equal(p1DraftAfter.categoria.documentId, catConTilde.documentId);
    assert.equal(p1DraftAfter.clasificaciones[0].categoria, 'Coloración Capilar');

    const p2Pub = await app.documents(UID_PROD).findOne({ documentId: p2.documentId, status: 'published', populate: ['categoria', 'clasificaciones'] });
    assert.equal(p2Pub.categoria.documentId, capilares.documentId);
    assert.equal(p2Pub.clasificaciones.length, 2);
    assert.equal(p2Pub.clasificaciones[1].categoria, 'Coloración Capilar');

    const p3Pub = await app.documents(UID_PROD).findOne({ documentId: p3Draft.documentId, status: 'published' });
    const p3DraftAfter = await app.documents(UID_PROD).findOne({ documentId: p3Draft.documentId, status: 'draft', populate: ['categoria', 'clasificaciones'] });
    assert.equal(p3Pub, null);
    assert.equal(p3DraftAfter.categoria.documentId, catConTilde.documentId);
    assert.equal(p3DraftAfter.clasificaciones[0].categoria, 'Coloración Capilar');

    const orderAfter = await app.documents(UID_ORDER).findFirst({ populate: { categoriasPerfumeria: true } });
    assert.deepEqual(orderAfter.categoriasPerfumeria.map(c => c.documentId), [catConTilde.documentId]);
    assert.deepEqual(orderAfter.ordenVisual.perfumeria, ['ofertas', `categoria:${catConTilde.documentId}`]);

    const menuAfter = await app.documents(UID_MENU).findFirst({
      populate: {
        ofertas: { populate: { columnas_categorias: { populate: ['categorias'] }, productos_destacados: true } },
        lanzamientos: { populate: ['categorias', 'productos_destacados'] },
      },
    });
    assert.deepEqual(menuAfter.ofertas.columnas_categorias[0].categorias.map(c => c.documentId), [catConTilde.documentId, capilares.documentId]);
    assert.deepEqual(menuAfter.ofertas.productos_destacados.map(p => p.documentId), [p1.documentId]);
    assert.deepEqual(menuAfter.lanzamientos.categorias.map(c => c.documentId), [catConTilde.documentId]);
    assert.deepEqual(menuAfter.lanzamientos.productos_destacados.map(p => p.documentId), [p2.documentId]);

    const mainAfter = await app.documents(UID_MAIN).findFirst({
      populate: {
        destacada_perfumeria: { populate: ['categoria'] },
        categoria_especifica_perfumeria: { populate: ['categoria', 'icono'] },
      },
    });
    assert.equal(mainAfter.destacada_perfumeria.categoria.documentId, catConTilde.documentId);
    assert.equal(mainAfter.destacada_perfumeria.titulo, 'Color');
    assert.equal(mainAfter.categoria_especifica_perfumeria.categoria.documentId, catConTilde.documentId);
    assert.equal(mainAfter.categoria_especifica_perfumeria.icono.id, uploadedFile.id);
    assert.deepEqual(mainAfter.diseno_categorias.perfumeria.orden, [catConTilde.documentId, capilares.documentId]);

    // 3. Merge entre secciones opcional
    const mergedCross = await migrarCategoriaDuplicada(app, { apply: true, mergeSections: true, seccion: 'Perfumería' });
    assert.deepEqual(mergedCross.categoriasEliminadas, [catHogar.documentId]);
  } finally {
    process.chdir(origCwd);
    await app.destroy();
    for (const suffix of ['', '-shm', '-wal']) {
      if (fs.existsSync(dbPath + suffix)) fs.unlinkSync(dbPath + suffix);
    }
  }
});
