const { test } = require('node:test');
const assert = require('node:assert/strict');
const serviceFactory = require('../src/api/gift-cards-admin/services/gift-cards-admin');

test('lista gift cards enriquecidas con pedido origen, usos y estadísticas', async () => {
  const futureDate = new Date(Date.now() + 30 * 86400 * 1000).toISOString();
  const pastDate = new Date(Date.now() - 10 * 86400 * 1000).toISOString();

  const cards = [
    { id: 1, documentId: 'gc-1', codigo: 'GC-ACTIVA', monto: 50000, activa: true, fecha_expiracion: futureDate, createdAt: '2026-11-01T10:00:00.000Z' },
    { id: 2, documentId: 'gc-2', codigo: 'GC-USADA', monto: 0, activa: false, fecha_expiracion: futureDate, createdAt: '2026-10-20T10:00:00.000Z' },
    { id: 3, documentId: 'gc-3', codigo: 'GC-EXPIRADA', monto: 25000, activa: true, fecha_expiracion: pastDate, createdAt: '2025-10-01T10:00:00.000Z' },
  ];

  const orders = [
    {
      id: 10,
      numero_pedido: 'M-AAA111',
      cliente_email: 'comprador@marybe.com',
      estado: 'Completado',
      createdAt: '2026-11-01T10:00:00.000Z',
      gift_cards_generadas: ['GC-ACTIVA', 'GC-USADA'],
      productos: [],
    },
    {
      id: 11,
      numero_pedido: 'M-BBB222',
      cliente_email: 'canje@marybe.com',
      estado: 'Procesando',
      createdAt: '2026-11-05T12:00:00.000Z',
      gift_cards_generadas: [],
      productos: [
        { sku: 'DESCUENTO-GC', producto: 'Descuento Gift Card (GC-USADA)', subtotal: -30000 },
      ],
    },
  ];

  const strapi = {
    entityService: {
      findMany: async (uid) => (uid === 'api::gift-card.gift-card' ? cards : orders),
    },
  };

  const service = serviceFactory({ strapi });
  const result = await service.list({});

  assert.equal(result.stats.total, 3);
  assert.equal(result.stats.activas, 1);
  assert.equal(result.stats.usadas, 1);
  assert.equal(result.stats.expiradas, 1);
  assert.equal(result.stats.saldo_activo_total, 50000);

  const active = result.items.find((i) => i.codigo === 'GC-ACTIVA');
  assert.equal(active.estado_actual, 'activa');
  assert.equal(active.pedido_origen.numero_pedido, 'M-AAA111');
  assert.equal(active.pedido_origen.cliente_email, 'comprador@marybe.com');

  const used = result.items.find((i) => i.codigo === 'GC-USADA');
  assert.equal(used.estado_actual, 'usada');
  assert.equal(used.usos.length, 1);
  assert.equal(used.usos[0].numero_pedido, 'M-BBB222');
  assert.equal(used.usos[0].monto_usado, 30000);
});

test('filtra gift cards por estado y texto de búsqueda', async () => {
  const futureDate = new Date(Date.now() + 30 * 86400 * 1000).toISOString();
  const strapi = {
    entityService: {
      findMany: async (uid) =>
        uid === 'api::gift-card.gift-card'
          ? [
              { id: 1, codigo: 'GC-UNO', monto: 10000, activa: true, fecha_expiracion: futureDate },
              { id: 2, codigo: 'GC-DOS', monto: 0, activa: false, fecha_expiracion: futureDate },
            ]
          : [],
    },
  };

  const service = serviceFactory({ strapi });
  const filtered = await service.list({ estado: 'activa', search: 'uno' });
  assert.equal(filtered.items.length, 1);
  assert.equal(filtered.items[0].codigo, 'GC-UNO');
  assert.equal(filtered.stats.total, 2);
});

test('crea gift card con código autogenerado y valida monto', async () => {
  let createdData = null;
  const strapi = {
    entityService: {
      findMany: async () => [],
      create: async (_uid, { data }) => {
        createdData = data;
        return { id: 99, ...data };
      },
    },
  };

  const service = serviceFactory({ strapi });
  await assert.rejects(() => service.create({ monto: 0 }), /mayor a 0/);

  const created = await service.create({ monto: 25000 });
  assert.match(created.codigo, /^GC-[A-F0-9]{24}$/);
  assert.equal(createdData.monto, 25000);
  assert.equal(createdData.activa, true);
  assert.ok(createdData.fecha_expiracion);
});

test('actualiza estado activa y monto de una gift card existente', async () => {
  let updatedCall = null;
  const strapi = {
    entityService: {
      findMany: async () => [{ id: 5, documentId: 'gc-5', codigo: 'GC-5', monto: 15000, activa: true }],
      update: async (_uid, id, { data }) => {
        updatedCall = { id, data };
        return { id, codigo: 'GC-5', monto: data.monto ?? 15000, activa: data.activa ?? true };
      },
    },
  };

  const service = serviceFactory({ strapi });
  const updated = await service.update(5, { activa: false, monto: 12000 });
  assert.equal(updatedCall.id, 5);
  assert.equal(updated.activa, false);
  assert.equal(updated.monto, 12000);
  assert.equal(updated.estado_actual, 'inactiva');
});
