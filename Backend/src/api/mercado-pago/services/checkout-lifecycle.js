'use strict';

const crypto = require('crypto');
const UID = 'api::pedido.pedido';
const hash = token => crypto.createHash('sha256').update(token).digest('hex');
const isMP = order => /^(mercadopago|qr)(\s|$)/i.test(order.metodo_pago || '');
const isPaid = order => Boolean(order.pago_mercadopago?.processedAt || order.metodo_pago?.includes('Pagado - ID:'));

function newCheckout() {
  const token = crypto.randomBytes(32).toString('hex');
  const minutes = Number(process.env.MP_CHECKOUT_TTL_MINUTES || 60);
  if (!Number.isFinite(minutes) || minutes < 5 || minutes > 10080) throw new Error('MP_CHECKOUT_TTL_MINUTES inválido.');
  return { token, metadata: { tokenHash: hash(token), status: 'not_started', expiresAt: new Date(Date.now() + minutes * 60000).toISOString() } };
}

async function findOrder(reference) {
  if (typeof reference !== 'string' || !/^M-[A-Z0-9]{6}$/.test(reference)) throw new Error('Referencia de pedido inválida.');
  const orders = await strapi.entityService.findMany(UID, { filters: { numero_pedido: reference }, populate: ['usuario'], limit: 1 });
  if (!orders?.[0] || !isMP(orders[0])) throw new Error('Pedido de Mercado Pago no encontrado.');
  return orders[0];
}

function authorize(order, token) {
  const expected = order.pago_mercadopago?.tokenHash;
  if (typeof token !== 'string' || token.length !== 64 || typeof expected !== 'string' || expected.length !== 64 || !crypto.timingSafeEqual(Buffer.from(hash(token)), Buffer.from(expected))) {
    throw new Error('No tenés acceso a este intento de pago.');
  }
}

async function lockRow(trx, uid, id) {
  const table = strapi.db.metadata.get(uid).tableName;
  const schema = strapi.db.getSchemaName?.();
  const query = schema ? trx(table).withSchema(schema) : trx(table);
  await query.where({ id }).forUpdate().first();
}

async function withOrder(reference, callback) {
  const initial = await findOrder(reference);
  return strapi.db.transaction(async ({ trx }) => {
    await lockRow(trx, UID, initial.id);
    return callback(await findOrder(reference), trx);
  });
}

function validPayment(order, payment) {
  return payment.external_reference === order.numero_pedido && payment.currency_id === 'ARS'
    && Number.isFinite(Number(payment.transaction_amount))
    && Math.round(Number(payment.transaction_amount) * 100) === Math.round(Number(order.total) * 100);
}

async function fulfill(order, trx) {
  const items = order.productos || [];
  const stockItems = items.filter(item => item.id_producto && item.sku !== 'ENVIO' && item.sku !== 'DESCUENTO-GC' && !String(item.id_producto).startsWith('gift-card-'));
  stockItems.sort((a, b) => String(a.id_producto).localeCompare(String(b.id_producto)));
  for (const item of stockItems) {
    const where = isNaN(Number(item.id_producto)) ? { documentId: item.id_producto } : { id: item.id_producto };
    let product = await strapi.db.query('api::producto.producto').findOne({ where, populate: ['variantes'] });
    if (!product) throw new Error(`Producto no encontrado al acreditar ${order.numero_pedido}.`);
    await lockRow(trx, 'api::producto.producto', product.id);
    product = await strapi.db.query('api::producto.producto').findOne({ where, populate: ['variantes'] });
    const quantity = Number(item.cantidad);
    if (!Number.isInteger(quantity) || quantity < 1) throw new Error('Cantidad inválida en pedido.');
    if (item.id_variante || item.id_variante_original) {
      const variant = product.variantes?.find(v => item.id_variante ? String(v.id) === String(item.id_variante) : String(v.id_original) === String(item.id_variante_original));
      if (!variant || Number(variant.stock) < quantity) throw new Error(`Stock insuficiente al acreditar ${order.numero_pedido}. Revisar pago recibido.`);
      await strapi.db.query('producto.variante').update({ where: { id: variant.id }, data: { stock: Number(variant.stock) - quantity } });
    } else {
      if (Number(product.stock) < quantity) throw new Error(`Stock insuficiente al acreditar ${order.numero_pedido}. Revisar pago recibido.`);
      await strapi.entityService.update('api::producto.producto', product.id, { data: { stock: Number(product.stock) - quantity } });
    }
  }
  const discount = items.find(item => item.sku === 'DESCUENTO-GC');
  if (discount) {
    const code = discount.producto.match(/\(([^)]+)\)/)?.[1];
    if (!code) throw new Error('Código de gift card ausente.');
    const cards = await strapi.entityService.findMany('api::gift-card.gift-card', { filters: { codigo: code }, limit: 1 });
    if (!cards?.[0]) throw new Error('Gift card no encontrada al acreditar pago.');
    await lockRow(trx, 'api::gift-card.gift-card', cards[0].id);
    const [card] = await strapi.entityService.findMany('api::gift-card.gift-card', { filters: { codigo: code }, limit: 1 });
    if (!card.activa || Number(card.monto) < -Number(discount.subtotal)) throw new Error('Gift card ya utilizada o insuficiente. Revisar pago recibido.');
    await strapi.entityService.update('api::gift-card.gift-card', card.id, { data: { activa: false } });
  }
  const codes = [];
  for (const item of items.filter(i => String(i.id_producto).startsWith('gift-card-'))) {
    for (let i = 0; i < item.cantidad; i++) {
      const codigo = 'GC-' + crypto.randomBytes(12).toString('hex').toUpperCase();
      const expiration = new Date(); expiration.setFullYear(expiration.getFullYear() + 1);
      await strapi.entityService.create('api::gift-card.gift-card', { data: { codigo, monto: item.precio_unitario, activa: true, fecha_expiracion: expiration.toISOString() } });
      codes.push(codigo);
    }
  }
  return codes;
}

function publicStatus(order) {
  const status = order.pago_mercadopago?.status || (isPaid(order) ? 'approved' : 'unknown');
  return { reference: order.numero_pedido, estado: order.estado, status, pagado: isPaid(order) && !['refunded', 'charged_back'].includes(status) };
}

module.exports = { UID, newCheckout, findOrder, authorize, withOrder, validPayment, fulfill, publicStatus, isPaid };
