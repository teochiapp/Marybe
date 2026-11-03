import { getAddressLines, getOrderAttributes, getOrderDebugData, getOrderProduct } from './orderDetails';

describe('orderDetails', () => {
  test('normaliza la respuesta de Strapi v4/v5 y conserva los datos de variante', () => {
    const order = { attributes: { numero_pedido: 'M-001' } };
    expect(getOrderAttributes(order).numero_pedido).toBe('M-001');

    expect(getOrderProduct({
      producto: 'Shampoo', cantidad: 2, precio_unitario: 1500, sku: 'SKU-1',
      variante: '250 ml', id_producto: 8, id_variante_original: 'V-8',
    })).toEqual(expect.objectContaining({
      name: 'Shampoo', quantity: 2, unitPrice: 1500, subtotal: 3000,
      sku: 'SKU-1', variant: '250 ml', productId: 8, variantId: 'V-8',
    }));
  });

  test('incluye todos los campos de direccion que tengan valor', () => {
    expect(getAddressLines({ calle: 'Rivadavia', numero: '123', cp: '4200', nota: 'Timbre B' }))
      .toEqual(expect.arrayContaining([
        { label: 'Calle', value: 'Rivadavia' },
        { label: 'Numero', value: '123' },
        { label: 'nota', value: 'Timbre B' },
      ]));
  });

  test('mantiene los campos adicionales guardados por Strapi para el comprobante', () => {
    const order = { numero_pedido: 'M-002', codigo_seguimiento: 'AR123', gift_cards_generadas: ['GC-01'] };
    expect(getOrderDebugData(order)).toEqual(expect.objectContaining({
      numero_pedido: 'M-002', codigo_seguimiento: 'AR123', gift_cards_generadas: ['GC-01'],
    }));
  });
});
