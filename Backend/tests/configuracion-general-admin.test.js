const { test } = require('node:test');
const assert = require('node:assert/strict');
const serviceFactory = require('../src/api/configuracion-general-admin/services/configuracion-general-admin');

test('obtiene la configuración general con valores por defecto cuando no existe registro', async () => {
  const strapi = {
    documents: () => ({
      findFirst: async () => null,
    }),
  };
  const service = serviceFactory({ strapi });
  const config = await service.get();
  assert.equal(config.cuotas_activas, true);
  assert.equal(config.cuotas_cantidad, 3);
  assert.equal(config.mp_habilitado, true);
  assert.equal(config.mp_titulo, 'Mercado Pago');
  assert.equal(config.costo_envio, null);
});

test('obtiene la configuración existente fusionada con los valores por defecto', async () => {
  const existing = {
    documentId: 'cfg-1',
    cuotas_cantidad: 6,
    costo_envio: 5500,
    whatsapp_numero: '5491199998888',
  };
  const strapi = {
    documents: () => ({
      findFirst: async () => existing,
    }),
  };
  const service = serviceFactory({ strapi });
  const config = await service.get();
  assert.equal(config.cuotas_cantidad, 6);
  assert.equal(config.costo_envio, 5500);
  assert.equal(config.whatsapp_numero, '5491199998888');
  assert.equal(config.mp_habilitado, true);
});

test('sanitiza y actualiza la configuración general existente', async () => {
  let updatedPayload = null;
  const existing = {
    documentId: 'cfg-1',
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
  const result = await service.update({
    cuotas_activas: false,
    cuotas_cantidad: 12,
    costo_envio: '4500',
    envio_gratis_desde: '50000',
    whatsapp_numero: ' 5491155554444 ',
    mp_titulo: ' Mercado Pago Marybe ',
  });

  assert.equal(result.cuotas_activas, false);
  assert.equal(result.cuotas_cantidad, 12);
  assert.equal(result.costo_envio, 4500);
  assert.equal(result.envio_gratis_desde, 50000);
  assert.equal(result.whatsapp_numero, '5491155554444');
  assert.equal(result.mp_titulo, 'Mercado Pago Marybe');
  assert.equal(updatedPayload.documentId, 'cfg-1');
});
