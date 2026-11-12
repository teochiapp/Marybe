const { test } = require('node:test');
const assert = require('node:assert/strict');
const service = require('../src/api/admin-dashboard/services/admin-dashboard');

test('resume ventas activas, pedidos del mes y productos publicados de la semana', async () => {
  const orders = [
    { id: 1, createdAt: '2026-11-02T12:00:00Z', estado: 'Procesando', estado_pago: 'approved', total: '1000' },
    { id: 2, createdAt: '2026-11-03T12:00:00Z', estado: 'Pendiente de pago', estado_pago: 'not_started', total: '2000' },
    { id: 3, createdAt: '2026-11-04T12:00:00Z', estado: 'Cancelado', estado_pago: null, total: '3000' },
    { id: 4, createdAt: '2026-10-30T12:00:00Z', estado: 'Completado', estado_pago: null, total: '4000' },
  ];
  const requests = [];
  const strapi = {
    db: { query: () => ({ findMany: async () => orders }) },
    documents: () => ({ count: async input => { requests.push(input); return 7; } }),
  };
  const result = await service({ strapi }).overview(new Date('2026-11-12T12:00:00Z'));
  assert.equal(result.ventasTotales, 5000);
  assert.equal(result.pedidosMes, 2);
  assert.equal(result.pedidosPendientes, 1);
  assert.equal(result.productosSemana, 7);
  assert.equal(result.desdeMes, '2026-11-01T03:00:00.000Z');
  assert.equal(requests[0].status, 'published');
  assert.equal(requests[0].filters.createdAt.$gte, '2026-11-05T12:00:00.000Z');
});
