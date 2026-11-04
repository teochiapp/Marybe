'use strict';

const life = require('./checkout-lifecycle');

async function request(path, options = {}) {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) throw new Error('Mercado Pago Access Token no configurado en el backend');
  const response = await fetch(`https://api.mercadopago.com${path}`, {
    ...options, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`Mercado Pago no pudo verificar la operación (HTTP ${response.status}).`);
  return response.json();
}

module.exports = () => ({
  async crearPreferencia({ externalReference, checkoutToken }) {
    return life.withOrder(externalReference, async order => {
      life.authorize(order, checkoutToken);
      const meta = order.pago_mercadopago;
      if (life.isPaid(order) || ['Cancelado', 'Abortado'].includes(order.estado) || Date.parse(meta.expiresAt) <= Date.now()) throw new Error('El intento de pago ya finalizó. Iniciá uno nuevo.');
      if (meta.preferenceId) return request(`/checkout/preferences/${encodeURIComponent(meta.preferenceId)}`);
      const frontend = new URL(process.env.FRONTEND_URL || 'https://marybe.surcodes.com').origin;
      const backend = process.env.PUBLIC_URL || strapi.config.get('server.url');
      const reference = encodeURIComponent(order.numero_pedido);
      const items = order.productos.filter(item => item.sku !== 'DESCUENTO-GC').map(item => ({
        id: `${item.id_producto || item.sku}-${item.id_variante || 'unico'}`,
        currency_id: 'ARS', title: `${item.producto}${item.variante ? ` (${item.variante})` : ''}`.slice(0, 250),
        quantity: Number(item.cantidad), unit_price: Number(item.precio_unitario),
      }));
      const hasDiscount = order.productos.some(item => item.sku === 'DESCUENTO-GC');
      if (!Number.isFinite(Number(order.total)) || Number(order.total) <= 0) throw new Error('Total de pedido inválido.');
      if (!hasDiscount && Math.round(items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0) * 100) !== Math.round(Number(order.total) * 100)) throw new Error('Los productos no coinciden con el total del pedido.');
      const preference = await request('/checkout/preferences', { method: 'POST', body: JSON.stringify({
        items: hasDiscount ? [{ id: order.numero_pedido, currency_id: 'ARS', title: `Pedido Marybe ${order.numero_pedido} (con Gift Card)`, quantity: 1, unit_price: Number(order.total) }] : items,
        payer: { email: order.cliente_email }, external_reference: order.numero_pedido,
        metadata: { marybe_order: order.numero_pedido },
        back_urls: { success: `${frontend}/order-success?reference=${reference}`, pending: `${frontend}/order-success?reference=${reference}`, failure: `${frontend}/order-error?reference=${reference}` },
        ...(backend?.startsWith('https://') ? { notification_url: `${backend.replace(/\/$/, '')}/api/mercado-pago/webhook` } : {}),
        ...(frontend.startsWith('https://') ? { auto_return: 'approved' } : {}),
        expires: true, expiration_date_from: new Date(Date.now() - 60000).toISOString(), expiration_date_to: meta.expiresAt, binary_mode: true, statement_descriptor: 'MARYBE PERFUMERIA',
      }) });
      await strapi.entityService.update(life.UID, order.id, { data: { pago_mercadopago: { ...meta, preferenceId: preference.id } } });
      return preference;
    });
  },

  async pagos(reference) {
    const data = await request(`/v1/payments/search?external_reference=${encodeURIComponent(reference)}&sort=date_created&criteria=desc&limit=50`);
    if (!Array.isArray(data.results)) throw new Error('Respuesta de pagos inválida.');
    if (Number(data.paging?.total || 0) > data.results.length) throw new Error('El pedido requiere conciliación manual: demasiados intentos.');
    return data.results.filter(payment => payment.external_reference === reference);
  },

  async sincronizar({ externalReference, checkoutToken, abort = false, internal = false }) {
    const initial = await life.findOrder(externalReference);
    if (!internal) life.authorize(initial, checkoutToken);
    const payments = await this.pagos(externalReference);
    const approved = payments.find(p => p.status === 'approved');
    const active = payments.find(p => ['pending', 'in_process', 'authorized', 'in_mediation'].includes(p.status));
    const payment = approved || active || payments[0];
    let notify;
    const result = await life.withOrder(externalReference, async (order, trx) => {
      const meta = order.pago_mercadopago || {};
      if (life.isPaid(order)) {
        const recordedId = meta.paymentId || order.metodo_pago.match(/Pagado - ID:\s*(\d+)/)?.[1];
        const reversal = payments.find(p => String(p.id) === String(recordedId) && ['refunded', 'charged_back'].includes(p.status));
        if (reversal) {
          await strapi.entityService.update(life.UID, order.id, { data: { estado_pago: reversal.status, pago_mercadopago: { ...meta, status: reversal.status, checkedAt: new Date().toISOString() } } });
          strapi.log.error(`Pago ${order.numero_pedido}: ${reversal.status}. Requiere revisión manual; no se modifica stock ni entrega automáticamente.`);
          return life.publicStatus({ ...order, pago_mercadopago: { ...meta, status: reversal.status } });
        }
        return life.publicStatus(order);
      }
      if (payment && !life.validPayment(order, payment)) throw new Error('El importe, moneda o referencia del pago no coincide con el pedido. Revisión requerida.');
      let status = payment?.status || (order.estado === 'Abortado' ? meta.status || 'aborted' : 'not_started');
      let estado = order.estado;
      let codes;
      if (status === 'approved') {
        if (!['Pendiente de pago', 'Abortado', 'Procesando'].includes(estado)) throw new Error('Pago recibido para pedido cerrado. Revisión manual requerida.');
        codes = await life.fulfill(order, trx);
        estado = 'Procesando';
      } else if (['pending', 'in_process', 'authorized', 'in_mediation'].includes(status)) {
        if (['Pendiente de pago', 'Abortado', 'Procesando'].includes(estado)) estado = 'Pendiente de pago';
      } else if (['rejected', 'cancelled'].includes(status) || (!payment && (abort || Date.parse(meta.expiresAt || new Date(Date.parse(order.createdAt) + 3600000).toISOString()) <= Date.now()))) {
        // Close an unfinished preference before allowing the customer to start another checkout.
        if (abort && !payment && meta.preferenceId && Date.parse(meta.expiresAt) > Date.now()) {
          await request(`/checkout/preferences/${encodeURIComponent(meta.preferenceId)}`, { method: 'PUT', body: JSON.stringify({ expires: true, expiration_date_from: new Date(Date.now() - 86400000).toISOString(), expiration_date_to: new Date(Date.now() - 1000).toISOString() }) });
        }
        if (['Pendiente de pago', 'Procesando'].includes(estado)) estado = 'Abortado';
        if (!payment) status = abort ? 'aborted' : 'expired';
      } else if (['refunded', 'charged_back'].includes(status)) {
        throw new Error('Reembolso o contracargo requiere revisión manual.');
      }
      const data = { estado, estado_pago: status, pago_mercadopago: { ...meta, status, paymentId: payment?.id || meta.paymentId, checkedAt: new Date().toISOString(), ...(status === 'approved' ? { processedAt: new Date().toISOString() } : {}) },
        ...(status === 'approved' ? { metodo_pago: `mercadopago (Pagado - ID: ${payment.id})`, ...(codes?.length ? { gift_cards_generadas: codes } : {}) } : {}) };
      await strapi.entityService.update(life.UID, order.id, { data });
      if (status === 'approved') notify = { ...order, ...data };
      return life.publicStatus({ ...order, ...data });
    }).catch(async error => {
      if (approved) {
        const current = await life.findOrder(externalReference);
        if (!life.isPaid(current)) {
          await strapi.entityService.update(life.UID, current.id, { data: { estado_pago: 'requires_review' } });
          strapi.log.error(`Pago aprobado ${externalReference} requiere revisión: ${error.message}`);
        }
      }
      throw error;
    });
    if (notify) {
      const name = notify.direccion_envio?.nombre || notify.usuario?.username || 'Cliente';
      const correo = strapi.service('api::correo.correo');
      for (const send of [() => correo.enviarConfirmacionPedido(notify.cliente_email, name, notify), () => correo.enviarAlertaNuevoPedidoAdmin(notify, name)]) {
        try { await send(); } catch (error) { strapi.log.error(`Correo de pago ${notify.numero_pedido}: ${error.message}`); }
      }
    }
    return result;
  },

  async consultarPago({ externalReference, checkoutToken }) {
    return this.sincronizar({ externalReference, checkoutToken });
  },

  async procesarWebhookDePago(paymentId) {
    if (!/^\d+$/.test(String(paymentId))) throw new Error('ID de pago inválido.');
    const payment = await request(`/v1/payments/${encodeURIComponent(paymentId)}`);
    return this.sincronizar({ externalReference: payment.external_reference, internal: true });
  },

  async reconciliarPendientes() {
    let lastId = 0;
    while (true) {
      const orders = await strapi.entityService.findMany(life.UID, { filters: { $and: [{ $or: [{ estado: 'Pendiente de pago' }, { estado: 'Procesando', metodo_pago: 'mercadopago' }] }, { id: { $gt: lastId } }] }, sort: { id: 'asc' }, limit: 100 });
      if (!orders.length) break;
      // Snapshot pages before changes: use an ID cursor rather than a shifting offset.
      for (const order of orders) {
        try { await this.sincronizar({ externalReference: order.numero_pedido, internal: true }); }
        catch (error) { strapi.log.error(`Conciliación MP ${order.numero_pedido}: ${error.message}`); }
      }
      if (orders.length < 100) break;
      lastId = orders[orders.length - 1].id;
    }
  },
});
