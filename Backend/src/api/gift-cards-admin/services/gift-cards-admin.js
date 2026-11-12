'use strict';

const crypto = require('crypto');

const GIFT_CARD_UID = 'api::gift-card.gift-card';
const PEDIDO_UID = 'api::pedido.pedido';

function generateGiftCardCode() {
  return `GC-${crypto.randomBytes(12).toString('hex').toUpperCase()}`;
}

function computeStatus(card, now = new Date()) {
  const monto = Number(card?.monto ?? 0);
  const activa = Boolean(card?.activa);
  if (!activa && monto <= 0) return 'usada';
  if (!activa) return 'inactiva';
  if (card?.fecha_expiracion) {
    const exp = new Date(card.fecha_expiracion);
    if (!Number.isNaN(exp.getTime()) && exp < now) return 'expirada';
  }
  return 'activa';
}

function extractDiscountCode(productoText = '') {
  const match = String(productoText || '').match(/\(([^)]+)\)/);
  return match ? match[1].trim() : '';
}

function buildOrderIndexes(orders = []) {
  const originByCode = new Map();
  const usageByCode = new Map();

  for (const order of Array.isArray(orders) ? orders : []) {
    const summary = {
      id: order.id || null,
      documentId: order.documentId || null,
      numero_pedido: order.numero_pedido || '',
      cliente_email: order.cliente_email || '',
      estado: order.estado || '',
      estado_pago: order.estado_pago || '',
      metodo_pago: order.metodo_pago || '',
      createdAt: order.createdAt || null,
    };

    const generated = Array.isArray(order.gift_cards_generadas) ? order.gift_cards_generadas : [];
    for (const rawCode of generated) {
      const code = String(rawCode || '').trim();
      if (code && !originByCode.has(code)) {
        originByCode.set(code, summary);
      }
    }

    const items = Array.isArray(order.productos) ? order.productos : [];
    for (const item of items) {
      if (item?.sku !== 'DESCUENTO-GC') continue;
      const code = extractDiscountCode(item.producto);
      if (!code) continue;
      const prev = usageByCode.get(code) || [];
      prev.push({
        ...summary,
        monto_usado: Math.abs(Number(item.subtotal ?? item.precio_unitario ?? 0)),
      });
      usageByCode.set(code, prev);
    }
  }

  return { originByCode, usageByCode };
}

function normalizeCard(card, originByCode, usageByCode, now = new Date()) {
  const codigo = String(card?.codigo || '').trim();
  const estadoActual = computeStatus(card, now);
  return {
    id: card.id,
    documentId: card.documentId || null,
    codigo,
    monto: Number(card.monto ?? 0),
    activa: Boolean(card.activa),
    fecha_expiracion: card.fecha_expiracion || null,
    createdAt: card.createdAt || null,
    updatedAt: card.updatedAt || null,
    estado_actual: estadoActual,
    pedido_origen: originByCode.get(codigo) || null,
    usos: usageByCode.get(codigo) || [],
  };
}

module.exports = ({ strapi }) => ({
  async list(query = {}) {
    const now = new Date();
    const [cards, orders] = await Promise.all([
      strapi.entityService.findMany(GIFT_CARD_UID, {
        sort: { createdAt: 'desc' },
        limit: 1000,
      }),
      strapi.entityService.findMany(PEDIDO_UID, {
        fields: [
          'id',
          'documentId',
          'numero_pedido',
          'cliente_email',
          'estado',
          'estado_pago',
          'metodo_pago',
          'createdAt',
          'gift_cards_generadas',
          'productos',
        ],
        sort: { createdAt: 'desc' },
        limit: 500,
      }),
    ]);

    const { originByCode, usageByCode } = buildOrderIndexes(orders);
    const allItems = (Array.isArray(cards) ? cards : []).map((card) =>
      normalizeCard(card, originByCode, usageByCode, now)
    );

    const stats = {
      total: allItems.length,
      activas: 0,
      usadas: 0,
      expiradas: 0,
      inactivas: 0,
      saldo_activo_total: 0,
    };

    for (const item of allItems) {
      if (item.estado_actual === 'activa') {
        stats.activas += 1;
        stats.saldo_activo_total += Number(item.monto || 0);
      } else if (item.estado_actual === 'usada') {
        stats.usadas += 1;
      } else if (item.estado_actual === 'expirada') {
        stats.expiradas += 1;
      } else {
        stats.inactivas += 1;
      }
    }

    const search = String(query.search || '').trim().toLowerCase();
    const estadoFilter = String(query.estado || 'todos').trim().toLowerCase();

    const filtered = allItems.filter((item) => {
      if (estadoFilter && estadoFilter !== 'todos' && item.estado_actual !== estadoFilter) {
        return false;
      }
      if (!search) return true;
      const haystack = [
        item.codigo,
        item.pedido_origen?.numero_pedido,
        item.pedido_origen?.cliente_email,
        ...item.usos.map((u) => `${u.numero_pedido} ${u.cliente_email}`),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(search);
    });

    return { items: filtered, stats };
  },

  async create(payload = {}) {
    const monto = Math.round(Number(payload.monto));
    if (!Number.isFinite(monto) || monto <= 0) {
      const err = new Error('El monto debe ser un número mayor a 0.');
      err.status = 400;
      throw err;
    }

    const codigo = String(payload.codigo || '').trim().toUpperCase() || generateGiftCardCode();
    const existing = await strapi.entityService.findMany(GIFT_CARD_UID, {
      filters: { codigo },
      limit: 1,
    });
    if (Array.isArray(existing) && existing.length > 0) {
      const err = new Error(`Ya existe una Gift Card con el código ${codigo}.`);
      err.status = 409;
      throw err;
    }

    let fechaExpiracion = null;
    if (payload.fecha_expiracion === null || payload.fecha_expiracion === '') {
      fechaExpiracion = null;
    } else if (payload.fecha_expiracion) {
      const parsed = new Date(payload.fecha_expiracion);
      if (Number.isNaN(parsed.getTime())) {
        const err = new Error('La fecha de expiración no es válida.');
        err.status = 400;
        throw err;
      }
      fechaExpiracion = parsed.toISOString();
    } else {
      const defaultExp = new Date();
      defaultExp.setFullYear(defaultExp.getFullYear() + 1);
      fechaExpiracion = defaultExp.toISOString();
    }

    const created = await strapi.entityService.create(GIFT_CARD_UID, {
      data: {
        codigo,
        monto,
        activa: payload.activa !== undefined ? Boolean(payload.activa) : true,
        fecha_expiracion: fechaExpiracion,
      },
    });

    return normalizeCard(created, new Map(), new Map());
  },

  async update(idOrDocumentId, payload = {}) {
    const cards = await strapi.entityService.findMany(GIFT_CARD_UID, {
      filters: Number.isInteger(Number(idOrDocumentId)) && String(Number(idOrDocumentId)) === String(idOrDocumentId)
        ? { id: Number(idOrDocumentId) }
        : { documentId: String(idOrDocumentId) },
      limit: 1,
    });

    const existing = Array.isArray(cards) ? cards[0] : null;
    if (!existing) {
      const err = new Error('Gift Card no encontrada.');
      err.status = 404;
      throw err;
    }

    const data = {};
    if (payload.activa !== undefined) {
      data.activa = Boolean(payload.activa);
    }
    if (payload.monto !== undefined) {
      const monto = Math.round(Number(payload.monto));
      if (!Number.isFinite(monto) || monto < 0) {
        const err = new Error('El monto debe ser un número mayor o igual a 0.');
        err.status = 400;
        throw err;
      }
      data.monto = monto;
    }
    if (payload.fecha_expiracion !== undefined) {
      if (payload.fecha_expiracion === null || payload.fecha_expiracion === '') {
        data.fecha_expiracion = null;
      } else {
        const parsed = new Date(payload.fecha_expiracion);
        if (Number.isNaN(parsed.getTime())) {
          const err = new Error('La fecha de expiración no es válida.');
          err.status = 400;
          throw err;
        }
        data.fecha_expiracion = parsed.toISOString();
      }
    }

    const updated = await strapi.entityService.update(GIFT_CARD_UID, existing.id, { data });
    return normalizeCard(updated, new Map(), new Map());
  },
});
