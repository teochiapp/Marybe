export const DELIVERY_KEY = 'marybe_checkout_delivery';

export function readDelivery() {
  try { return JSON.parse(sessionStorage.getItem(DELIVERY_KEY)) || null; }
  catch { return null; }
}

export function deliveryAddress(method, address, branch) {
  if (method === 'sucursal') {
    return { metodo_envio: 'sucursal', sucursal: branch?.direccion || '', provincia: branch?.provincia || '', telefono_sucursal: branch?.telefono || '' };
  }
  return { ...address, metodo_envio: 'domicilio' };
}

export function validDelivery(delivery) {
  return delivery?.metodo_envio === 'sucursal'
    ? Boolean(delivery.sucursal && delivery.provincia)
    : delivery?.metodo_envio === 'domicilio' && Boolean(delivery.calle && delivery.numero && delivery.ciudad && delivery.provincia && delivery.cp);
}

export function shippingCost(method, physicalTotal, config) {
  if (method === 'sucursal' || physicalTotal === 0 || (config?.envio_gratis_desde != null && physicalTotal >= Number(config.envio_gratis_desde))) return 0;
  return Number(config?.costo_envio ?? 0);
}
