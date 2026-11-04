export const DELIVERY_KEY = 'marybe_checkout_delivery';

export function readDelivery() {
  try { return JSON.parse(sessionStorage.getItem(DELIVERY_KEY)) || null; }
  catch { return null; }
}

export function deliveryAddress(method, address, branch) {
  if (method === 'sucursal') {
    const billingSource = address?.facturacion || address;
    const billing = ['calle', 'numero', 'ciudad', 'provincia', 'cp'].every(field => billingSource?.[field])
      ? Object.fromEntries(['nombre', 'apellido', 'telefono', 'email', 'calle', 'numero', 'piso', 'departamento', 'ciudad', 'provincia', 'cp', 'dni', 'cuit'].filter(field => billingSource[field]).map(field => [field, billingSource[field]])) : null;
    return { ...(address?.nombre ? { nombre: address.nombre } : {}), ...(address?.telefono ? { telefono: address.telefono } : {}), ...(address?.email ? { email: address.email } : {}), metodo_envio: 'sucursal', sucursal: branch?.direccion || '', ...(branch?.ciudad ? { ciudad: branch.ciudad } : {}), provincia: branch?.provincia || '', telefono_sucursal: branch?.telefono || '', ...(billing ? { facturacion: billing } : {}) };
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
