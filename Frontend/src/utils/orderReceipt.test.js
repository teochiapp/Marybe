import { getReceiptDetails, RECEIPT_BUSINESS } from './orderReceipt';

test('incorpora contacto comercial y datos reales de facturación separados del retiro', () => {
  const receipt = getReceiptDetails({ attributes: { metodo_pago: 'efectivo', cliente_email: 'qa@example.test', direccion_envio: { metodo_envio: 'sucursal', sucursal: 'MAIPU 164', provincia: 'Tucumán', nombre: 'Cliente QA', telefono: '123' }, direccion_facturacion: { nombre: 'Cliente QA', telefono: '123', calle: 'Avenida de prueba', numero: '221', piso: 'D1', ciudad: 'San Miguel de Tucumán', provincia: 'Tucumán', cp: '4000' } } });
  expect(RECEIPT_BUSINESS).toEqual(expect.objectContaining({ email: 'ventas@marybe.com.ar', phone: '+54 385 4211687', address: 'Pellegrini 141, Santiago del Estero' }));
  expect(receipt.paymentLabel).toBe('Pago en la entrega');
  expect(receipt.billingLines).toEqual(expect.arrayContaining(['Cliente QA', '123', 'qa@example.test', 'Avenida de prueba 221, D1', 'San Miguel de Tucumán, Tucumán, CP 4000']));
  expect(receipt.deliveryLines).toEqual(expect.arrayContaining(['Retirá tu pedido por sucursal MAIPU 164.', 'Lunes a sábado de 9 a 21 hs.', 'No olvides llevar tu número de compra y DNI.']));
});

test('no copia horarios de Maipú a otras sucursales y usa los datos del pedido', () => {
  const receipt = getReceiptDetails({ direccion_envio: { metodo_envio: 'sucursal', sucursal: 'Pellegrini 141', provincia: 'Santiago del Estero', nombre: 'Otro cliente', horario_sucursal: 'De 10 a 18 hs.' } });
  expect(receipt.deliveryLines).toContain('De 10 a 18 hs.');
  expect(receipt.deliveryLines.join(' ')).not.toContain('9 a 21');
  expect(receipt.billingLines).toContain('Otro cliente');
  expect(receipt.billingLines.join(' ')).not.toContain('Florencia');
});

test('Mercado Pago aprobado no invita a pagar de nuevo y el envío a domicilio usa su dirección', () => {
  const receipt = getReceiptDetails({ metodo_pago: 'mercadopago (Pagado - ID: 123456)', direccion_envio: { metodo_envio: 'domicilio', calle: 'Mitre', numero: '123', ciudad: 'Ciudad', provincia: 'Provincia', cp: '4200', nota: 'Timbre B' } });
  expect(receipt.paymentLabel).toBe('Mercado Pago'); expect(receipt.paymentInstructions).toBe('');
  expect(receipt.deliveryLabel).toBe('Envío a domicilio'); expect(receipt.deliveryLines).toContain('Mitre 123');
  expect(receipt.deliveryLines.join(' ')).not.toContain('DNI'); expect(receipt.note).toBe('Timbre B');
});

test('subtotal, envío y descuento se muestran separados sin ocultar importes', () => {
  const receipt = getReceiptDetails({ productos: [
    { producto: 'Perfume', cantidad: 2, precio_unitario: 1000, sku: 'SKU-1' },
    { producto: 'Envío', cantidad: 1, precio_unitario: 6000, sku: 'ENVIO' },
    { producto: 'Descuento', cantidad: 1, precio_unitario: -500, sku: 'DESCUENTO-GC' },
  ] });
  expect(receipt.products).toHaveLength(1); expect(receipt.subtotal).toBe(2000); expect(receipt.shipping).toBe(6000); expect(receipt.discount).toBe(-500);
});
