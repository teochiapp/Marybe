import { getOrderAttributes, getOrderProduct } from './orderDetails';

export const RECEIPT_BUSINESS = {
  name: 'MARYBE SRL', email: 'ventas@marybe.com.ar', phone: '+54 385 4211687',
  address: 'Pellegrini 141, Santiago del Estero',
};

const text = value => typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '';
const join = (values, separator = ', ') => values.map(text).filter(Boolean).join(separator);

export function getReceiptDetails(order) {
  const p = getOrderAttributes(order);
  const address = p.direccion_envio || {};
  const customer = p.usuario?.data?.attributes || p.usuario || {};
  const method = text(p.metodo_pago);
  const normalized = method.toLowerCase();
  const pickup = ['sucursal', 'retiro_sucursal'].includes(address.metodo_envio) || Boolean(address.sucursal);
  const billing = p.direccion_facturacion || p.datos_facturacion || p.facturacion || address.facturacion || (pickup ? { nombre: address.nombre, telefono: address.telefono, email: address.email } : address);
  const billingLines = [
    join([billing.nombre || billing.razon_social || address.nombre || customer.nombre || customer.username, billing.apellido], ' '),
    billing.documento || billing.dni || billing.cuit ? `DNI / CUIT: ${billing.documento || billing.dni || billing.cuit}` : '',
    billing.telefono || address.telefono,
    p.cliente_email || billing.email || address.email || customer.email,
    join([join([billing.calle, billing.numero], ' '), billing.piso || billing.departamento]),
    join([billing.ciudad, billing.provincia, billing.cp ? `CP ${billing.cp}` : '']),
  ].map(text).filter(Boolean);
  let paymentLabel = method || 'No especificado';
  let paymentInstructions = '';
  if (normalized === 'efectivo' || normalized.includes('pago en la entrega')) {
    paymentLabel = 'Pago en la entrega';
    paymentInstructions = 'Pagá tu compra al momento de recibirla, en efectivo, débito o tarjeta de crédito en cuotas.';
  } else if (normalized.startsWith('mercadopago') || normalized === 'qr') paymentLabel = 'Mercado Pago';
  else if (normalized.includes('transferencia')) paymentLabel = 'Transferencia bancaria';
  else if (normalized === 'aconvenir') { paymentLabel = 'Pago a convenir'; paymentInstructions = 'Coordiná la forma de pago con Marybe.'; }
  const branch = text(address.sucursal);
  const normalizedBranch = branch.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const hours = text(address.horario_sucursal || address.sucursal_horario || address.horario)
    || (pickup && /maipu\s*164\b/.test(normalizedBranch) && /tucum[aá]n/i.test(address.provincia || '') ? 'Lunes a sábado de 9 a 21 hs.' : '');
  const deliveryLines = pickup ? [
    branch ? `Retirá tu pedido por sucursal ${branch}.` : 'Sucursal no informada.',
    join([address.ciudad, address.provincia]), hours,
    address.telefono_sucursal ? `Teléfono de sucursal: ${address.telefono_sucursal}` : '',
    'No olvides llevar tu número de compra y DNI.',
  ] : [
    join([join([address.calle, address.numero], ' '), address.piso || address.departamento]),
    join([address.ciudad, address.provincia, address.cp ? `CP ${address.cp}` : '']),
    address.nombre, address.telefono,
  ];
  const items = p.productos || [];
  const products = items.filter(item => !['ENVIO', 'DESCUENTO-GC'].includes(item.sku)).map(getOrderProduct);
  return {
    paymentLabel, paymentInstructions, billingLines: [...new Set(billingLines)],
    deliveryLabel: pickup ? `Retiro en sucursal${address.provincia ? ` - ${address.provincia}` : ''}` : 'Envío a domicilio',
    deliveryLines: deliveryLines.map(text).filter(Boolean),
    note: text(p.nota || p.notas || p.observaciones || address.nota || address.observaciones), products,
    subtotal: products.reduce((sum, item) => sum + item.subtotal, 0),
    shipping: items.filter(item => item.sku === 'ENVIO').reduce((sum, item) => sum + getOrderProduct(item).subtotal, 0),
    discount: items.filter(item => item.sku === 'DESCUENTO-GC').reduce((sum, item) => sum + getOrderProduct(item).subtotal, 0),
  };
}
