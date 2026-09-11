import { getVariantPrice, getProductPrice, variantesReales, getMainVariant } from './productPrice';

describe('productPrice.js - tests de cálculo de precios y % de descuento', () => {

  test('1. Variante con precio_oferta definido calcula el % de descuento real sobre la variante', () => {
    const product = {
      nombre: 'ALA DETERGENTE CONCENTRADO LIMON',
      precio: 1000,
      descuento: 20, // Descuento desactualizado en el padre
      variantes: [
        { id: 1, volumen: '300ml', precio: 1000, precio_oferta: 750 }
      ]
    };

    const variant300 = product.variantes[0];
    const result = getVariantPrice(variant300, product);

    expect(result.price).toBe(1000);
    expect(result.offerPrice).toBe(750);
    expect(result.tieneOferta).toBe(true);
    expect(result.calcDescuento).toBe(25); // (1000 - 750)/1000 = 25% OFF
  });

  test('2. Variante con precio_oferta nulo/vacío NO hereda descuento del padre ni variante hermana', () => {
    const product = {
      nombre: 'ALA DETERGENTE CONCENTRADO LIMON',
      precio: 1000,
      precio_oferta: 800,
      descuento: 20,
      variantes: [
        { id: 1, volumen: '300ml', precio: 1000, precio_oferta: 750 },
        { id: 2, volumen: '450ml', precio: 1500, precio_oferta: null }
      ]
    };

    const variant450 = product.variantes[1];
    const result = getVariantPrice(variant450, product);

    expect(result.price).toBe(1500);
    expect(result.offerPrice).toBeNull();
    expect(result.tieneOferta).toBe(false);
    expect(result.calcDescuento).toBe(0); // Sin descuento
  });

  test('3. Producto simple con precio_oferta', () => {
    const product = {
      nombre: 'Jabón Líquido Simple',
      precio: 2000,
      precio_oferta: 1500,
      variantes: []
    };

    const result = getProductPrice(product);

    expect(result.price).toBe(2000);
    expect(result.offerPrice).toBe(1500);
    expect(result.tieneOferta).toBe(true);
    expect(result.calcDescuento).toBe(25); // 25% OFF
  });

  test('4. Producto simple con porcentaje de descuento', () => {
    const product = {
      nombre: 'Champú Simple',
      precio: 2000,
      descuento: 10,
      variantes: []
    };

    const result = getProductPrice(product);

    expect(result.price).toBe(2000);
    expect(result.offerPrice).toBe(1800);
    expect(result.tieneOferta).toBe(true);
    expect(result.calcDescuento).toBe(10);
  });

  test('5. Variante con precio_oferta igual o mayor al precio normal no activa oferta', () => {
    const product = {
      nombre: 'Acondicionador',
      precio: 1000,
      variantes: [
        { id: 1, volumen: '250ml', precio: 1000, precio_oferta: 1000 }
      ]
    };

    const result = getVariantPrice(product.variantes[0], product);

    expect(result.price).toBe(1000);
    expect(result.offerPrice).toBeNull();
    expect(result.tieneOferta).toBe(false);
    expect(result.calcDescuento).toBe(0);
  });

  test('6. Ignora variantes fantasma sin volumen ni color', () => {
    const product = {
      nombre: 'Producto con variante fantasma',
      precio: 1000,
      descuento: 15,
      variantes: [
        { id: 99, volumen: '', color_nombre: '', precio: 500, precio_oferta: null }
      ]
    };

    expect(variantesReales(product.variantes)).toHaveLength(0);
    const main = getMainVariant(product.variantes);
    expect(main.usarVariante).toBe(false);

    const result = getProductPrice(product);
    expect(result.price).toBe(1000);
    expect(result.offerPrice).toBe(850);
    expect(result.tieneOferta).toBe(true);
    expect(result.calcDescuento).toBe(15);
  });

  test('7. Soporta números formateados como strings', () => {
    const product = {
      nombre: 'Crema Corporal',
      precio: '2000',
      variantes: [
        { id: 1, volumen: '200ml', precio: '2000', precio_oferta: '1500' }
      ]
    };

    const result = getVariantPrice(product.variantes[0], product);

    expect(result.price).toBe(2000);
    expect(result.offerPrice).toBe(1500);
    expect(result.tieneOferta).toBe(true);
    expect(result.calcDescuento).toBe(25);
  });

});
