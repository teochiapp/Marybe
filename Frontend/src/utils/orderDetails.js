export function getOrderAttributes(order = {}) {
  return order.attributes || order;
}

export function getPaymentStatusLabel(status) {
  return ({ not_started: 'Sin completar', pending: 'Pendiente', in_process: 'En revisión', authorized: 'Autorizado, pendiente de captura', in_mediation: 'En mediación', approved: 'Aprobado', rejected: 'Rechazado', cancelled: 'Cancelado en Mercado Pago', aborted: 'Abortado', expired: 'Intento vencido', refunded: 'Reembolsado — revisar', charged_back: 'Contracargo — revisar', requires_review: 'Pago recibido — revisar acreditación del pedido' })[status] || status || 'No informado';
}

export function getOrderProduct(item = {}) {
  const product = item.product || {};
  const quantity = Number(item.cantidad ?? item.quantity ?? 1) || 1;
  const unitPrice = Number(item.precio_unitario ?? item.price ?? 0) || 0;

  return {
    name: item.producto || product.nombre || 'Producto sin nombre',
    brand: item.marca || product.marca || '',
    variant: item.variante || item.variant?.volumen || item.variant?.color_nombre || 'Unica',
    sku: item.sku || item.variant?.sku_ean || product.sku || 'Sin SKU',
    quantity,
    unitPrice,
    subtotal: Number(item.subtotal ?? unitPrice * quantity) || 0,
    productId: item.id_producto || product.id || '',
    variantId: item.id_variante_original || item.id_variante || item.variant?.id_original || item.variant?.id || '',
  };
}

export function getAddressLines(address = {}) {
  if (!address || typeof address !== 'object') return [];
  const labels = {
    nombre: 'Nombre', telefono: 'Telefono', calle: 'Calle', numero: 'Numero',
    piso: 'Piso / depto.', ciudad: 'Ciudad', provincia: 'Provincia', cp: 'Codigo postal',
    pais: 'Pais', sucursal: 'Sucursal', retiro_sucursal: 'Retiro en sucursal',
    metodo_envio: 'Método de entrega', telefono_sucursal: 'Teléfono de sucursal',
  };
  return Object.entries(address)
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => ({ label: labels[key] || key.replace(/_/g, ' '), value: String(value) }));
}

export function getOrderDebugData(order = {}) {
  const attrs = getOrderAttributes(order);
  return Object.fromEntries(Object.entries(attrs).filter(([, value]) => value !== undefined));
}
