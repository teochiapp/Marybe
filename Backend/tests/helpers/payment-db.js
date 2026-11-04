'use strict';
const knex = require('knex');
const { AsyncLocalStorage } = require('node:async_hooks');
const life = require('../../src/api/mercado-pago/services/checkout-lifecycle');

// Real SQLite transactions exercise rollback and concurrent webhook serialization.
module.exports = async function paymentDB(overrides = {}) {
  const db = knex({ client: 'better-sqlite3', connection: { filename: ':memory:' }, useNullAsDefault: true, pool: { min: 1, max: 1 } });
  const context = new AsyncLocalStorage();
  const connection = () => context.getStore() || db;
  for (const table of ['orders', 'products', 'cards']) await db.schema.createTable(table, t => { t.increments('id'); t.text('data'); });
  const tableFor = uid => uid.includes('pedido') ? 'orders' : uid.includes('gift-card') ? 'cards' : 'products';
  const read = async (table, id) => { const row = await connection()(table).where({ id }).first(); return row ? { id: row.id, ...JSON.parse(row.data) } : null; };
  const checkout = life.newCheckout();
  const order = { numero_pedido: 'M-ABC123', estado: 'Pendiente de pago', metodo_pago: 'mercadopago', total: 2000, cliente_email: 'qa@example.test', createdAt: new Date().toISOString(), direccion_envio: { nombre: 'QA' }, productos: [{ producto: 'Perfume', id_producto: 1, cantidad: 2, precio_unitario: 1000, subtotal: 2000, sku: 'QA' }], pago_mercadopago: checkout.metadata, ...overrides };
  await db('orders').insert({ id: 1, data: JSON.stringify(order) });
  await db('products').insert({ id: 1, data: JSON.stringify({ nombre: 'Perfume', precio: 1000, stock: 10, variantes: [] }) });
  const events = { emails: [], errors: [], failStock: false };
  const api = {
    config: { get: () => 'https://cms.example.test' },
    log: { error: message => events.errors.push(message) },
    db: {
      metadata: { get: uid => ({ tableName: tableFor(uid) }) },
      transaction: fn => db.transaction(trx => context.run(trx, () => fn({ trx }))),
      query: uid => ({
        findOne: ({ where }) => read(tableFor(uid), where.id),
        update: async ({ where, data }) => {
          const product = await read('products', 1);
          const variants = product.variantes.map(v => v.id === where.id ? { ...v, ...data } : v);
          await connection()('products').where({ id: 1 }).update({ data: JSON.stringify({ ...product, variantes: variants }) });
        },
      }),
    },
    entityService: {
      findMany: async (uid, options = {}) => {
        if (uid.includes('configuracion-general')) return { costo_envio: 6000 };
        const rows = await connection()(tableFor(uid)).orderBy('id');
        return rows.map(row => ({ id: row.id, ...JSON.parse(row.data) })).filter(item => {
          if (options.filters?.numero_pedido) return item.numero_pedido === options.filters.numero_pedido;
          if (options.filters?.codigo) return item.codigo === options.filters.codigo;
          return true;
        });
      },
      update: async (uid, id, { data }) => {
        if (uid.includes('producto') && events.failStock) throw new Error('stock database failure');
        const table = tableFor(uid);
        const previous = await read(table, id);
        const result = { ...previous, ...data };
        await connection()(table).where({ id }).update({ data: JSON.stringify(result) });
        return result;
      },
      create: async (uid, { data }) => {
        const [id] = await connection()(tableFor(uid)).insert({ data: JSON.stringify(data) });
        return { id, ...data };
      },
    },
    service: () => ({
      enviarConfirmacionPedido: async (...args) => events.emails.push(['client', ...args]),
      enviarAlertaNuevoPedidoAdmin: async (...args) => events.emails.push(['admin', ...args]),
    }),
  };
  return { api, db, events, checkout, read, close: () => db.destroy() };
};
