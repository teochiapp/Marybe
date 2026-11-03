import { deliveryAddress, shippingCost, validDelivery, readDelivery, DELIVERY_KEY } from './checkoutDelivery';

const config = { costo_envio: 6000, envio_gratis_desde: 50000 };
test('retiro exige sucursal y conserva su dirección y teléfono sin mezclar el domicilio', () => {
  expect(validDelivery(deliveryAddress('sucursal', { calle: 'Casa' }, null))).toBe(false);
  const delivery = deliveryAddress('sucursal', { calle: 'Casa' }, { direccion: 'Maipú 164', provincia: 'Tucumán', telefono: '123' });
  expect(validDelivery(delivery)).toBe(true);
  expect(delivery).toEqual({ metodo_envio: 'sucursal', sucursal: 'Maipú 164', provincia: 'Tucumán', telefono_sucursal: '123' });
  expect(shippingCost('sucursal', 10000, config)).toBe(0);
});
test('domicilio exige dirección y cobra envío sin depender de cómo se paga', () => {
  expect(validDelivery({ metodo_envio: 'domicilio' })).toBe(false);
  expect(shippingCost('domicilio', 10000, config)).toBe(6000);
  expect(shippingCost('domicilio', 50000, config)).toBe(0);
  expect(shippingCost('domicilio', 0, config)).toBe(0);
});
test('recupera el retiro al recargar y tolera datos de sesión dañados', () => {
  sessionStorage.setItem(DELIVERY_KEY, JSON.stringify({ metodo_envio: 'sucursal', sucursal: 'Sucursal' }));
  expect(readDelivery().sucursal).toBe('Sucursal');
  sessionStorage.setItem(DELIVERY_KEY, 'invalid json');
  expect(readDelivery()).toBeNull();
  sessionStorage.clear();
});
