'use strict';

const ORDER = 'api::pedido.pedido';
const PRODUCT = 'api::producto.producto';
const SALES_STATES = new Set(['Procesando', 'Enviado', 'Completado']);
const pageSize = 500;

function isSale(order) {
  if (!SALES_STATES.has(order.estado)) return false;
  if (order.estado_pago) return order.estado_pago === 'approved';
  return true;
}

module.exports = ({ strapi }) => ({
  async overview(now = new Date()) {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit' }).formatToParts(now).map(part => [part.type, part.value]));
    const monthStart = new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, 1, 3));
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const orders = [];
    for (let offset = 0; ; offset += pageSize) {
      const page = await strapi.db.query(ORDER).findMany({ select: ['id', 'createdAt', 'estado', 'estado_pago', 'total'], orderBy: { id: 'asc' }, limit: pageSize, offset });
      orders.push(...page);
      if (page.length < pageSize) break;
    }
    const sales = orders.filter(isSale);
    const productsThisWeek = await strapi.documents(PRODUCT).count({ status: 'published', filters: { createdAt: { $gte: weekStart.toISOString() } } });
    return {
      ventasTotales: Math.round(sales.reduce((sum, order) => sum + Number(order.total || 0), 0) * 100) / 100,
      pedidosMes: orders.filter(order => new Date(order.createdAt) >= monthStart && !['Abortado', 'Cancelado'].includes(order.estado)).length,
      productosSemana: productsThisWeek,
      pedidosPendientes: orders.filter(order => order.estado === 'Pendiente de pago').length,
      desdeMes: monthStart.toISOString(),
      desdeSemana: weekStart.toISOString(),
    };
  },
});

module.exports.isSale = isSale;
