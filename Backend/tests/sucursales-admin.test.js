const { test } = require('node:test');
const assert = require('node:assert/strict');
const serviceFactory = require('../src/api/sucursales-admin/services/sucursales-admin');

test('obtiene la información de sucursales con valores por defecto cuando no existe registro', async () => {
  const strapi = {
    documents: () => ({
      findFirst: async () => null,
    }),
  };
  const service = serviceFactory({ strapi });
  const result = await service.get();
  assert.equal(result.titulo, 'Nuestras Sucursales');
  assert.deepEqual(result.sucursales, []);
});

test('obtiene las sucursales existentes correctamente', async () => {
  const existing = {
    documentId: 'ps-1',
    titulo: 'Locales Oficiales Marybe',
    sucursales: [
      {
        id: 1,
        provincia: 'Santiago del Estero',
        ciudad: 'Capital',
        calle: 'Absalón Rojas 55',
        numero_celular: '+5493854735731',
        numero_fijo: '(0385) 4214890',
        embed_google_maps: 'https://maps.app.goo.gl/example',
      },
    ],
  };
  const strapi = {
    documents: () => ({
      findFirst: async () => existing,
    }),
  };
  const service = serviceFactory({ strapi });
  const result = await service.get();
  assert.equal(result.titulo, 'Locales Oficiales Marybe');
  assert.equal(result.sucursales.length, 1);
  assert.equal(result.sucursales[0].calle, 'Absalón Rojas 55');
  assert.equal(result.sucursales[0].provincia, 'Santiago del Estero');
});

test('sanitiza y actualiza la lista de sucursales existente', async () => {
  let updatedPayload = null;
  const existing = {
    documentId: 'ps-1',
  };
  const strapi = {
    documents: () => ({
      findFirst: async () => existing,
      update: async ({ documentId, data }) => {
        updatedPayload = { documentId, data };
        return { documentId, ...data };
      },
    }),
  };
  const service = serviceFactory({ strapi });
  const payload = {
    titulo: ' Nuestras Tiendas ',
    sucursales: [
      {
        provincia: ' Tucumán ',
        ciudad: ' San Miguel de Tucumán ',
        calle: ' 25 de Mayo 256 ',
        numero_celular: ' +54 9 381 401-1551 ',
        numero_fijo: ' (0381) 4310500 ',
        embed_google_maps: ' https://maps.app.goo.gl/tucuman ',
      },
    ],
  };

  const saved = await service.update(payload);
  assert.equal(updatedPayload.documentId, 'ps-1');
  assert.equal(saved.titulo, 'Nuestras Tiendas');
  assert.equal(saved.sucursales[0].provincia, 'Tucumán');
  assert.equal(saved.sucursales[0].calle, '25 de Mayo 256');
  assert.equal(saved.sucursales[0].numero_celular, '+54 9 381 401-1551');
});

test('valida que cada sucursal posea calle y provincia obligatoriamente', async () => {
  const strapi = {
    documents: () => ({
      findFirst: async () => ({ documentId: 'ps-1' }),
    }),
  };
  const service = serviceFactory({ strapi });

  await assert.rejects(
    async () => {
      await service.update({
        titulo: 'Tiendas',
        sucursales: [{ provincia: 'Santiago del Estero', calle: '' }],
      });
    },
    { message: /requiere una calle/i }
  );

  await assert.rejects(
    async () => {
      await service.update({
        titulo: 'Tiendas',
        sucursales: [{ provincia: '', calle: 'Pellegrini 141' }],
      });
    },
    { message: /requiere una provincia/i }
  );
});
