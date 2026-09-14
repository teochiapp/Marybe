import { getVariantPrice, getProductPrice, variantesReales, getMainVariant, sortSizes } from './productPrice';

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

  // ─── PRUEBAS CON VARIANTES DE COLOR ──────────────────────────────────────────

  test('8. Variantes por color: una variante de color con oferta y otra sin oferta', () => {
    const product = {
      nombre: 'Tintura de Cabello Olia',
      precio: 3000,
      descuento: 15,
      variantes: [
        { id: 10, color_nombre: 'Rubio Ceniza', precio: 3000, precio_oferta: 2400, stock: 5 },
        { id: 11, color_nombre: 'Rojo Intenso', precio: 3200, precio_oferta: null, stock: 2 }
      ]
    };

    // Test variante Rubio Ceniza (3000 -> 2400 = 20% OFF)
    const resRubio = getVariantPrice(product.variantes[0], product);
    expect(resRubio.price).toBe(3000);
    expect(resRubio.offerPrice).toBe(2400);
    expect(resRubio.tieneOferta).toBe(true);
    expect(resRubio.calcDescuento).toBe(20);

    // Test variante Rojo Intenso (3200, sin oferta -> 0% OFF, no hereda de Rubio Ceniza ni del padre)
    const resRojo = getVariantPrice(product.variantes[1], product);
    expect(resRojo.price).toBe(3200);
    expect(resRojo.offerPrice).toBeNull();
    expect(resRojo.tieneOferta).toBe(false);
    expect(resRojo.calcDescuento).toBe(0);
  });

  test('9. Variantes combinando Color + Volumen', () => {
    const product = {
      nombre: 'Esmalte de Uñas Gel',
      precio: 1500,
      variantes: [
        { id: 1, color_nombre: 'Rosa', volumen: '10ml', precio: 1500, precio_oferta: 1050, stock: 10 },
        { id: 2, color_nombre: 'Rosa', volumen: '15ml', precio: 2000, precio_oferta: 1600, stock: 8 },
        { id: 3, color_nombre: 'Negro', volumen: '10ml', precio: 1500, precio_oferta: null, stock: 5 }
      ]
    };

    // Rosa 10ml -> (1500 -> 1050 = 30% OFF)
    const resRosa10 = getVariantPrice(product.variantes[0], product);
    expect(resRosa10.price).toBe(1500);
    expect(resRosa10.offerPrice).toBe(1050);
    expect(resRosa10.calcDescuento).toBe(30);

    // Rosa 15ml -> (2000 -> 1600 = 20% OFF)
    const resRosa15 = getVariantPrice(product.variantes[1], product);
    expect(resRosa15.price).toBe(2000);
    expect(resRosa15.offerPrice).toBe(1600);
    expect(resRosa15.calcDescuento).toBe(20);

    // Negro 10ml -> (1500, sin oferta -> 0% OFF)
    const resNegro10 = getVariantPrice(product.variantes[2], product);
    expect(resNegro10.price).toBe(1500);
    expect(resNegro10.offerPrice).toBeNull();
    expect(resNegro10.calcDescuento).toBe(0);
  });

  test('10. variantesReales y getMainVariant identifican correctamente variantes con solo color_nombre', () => {
    const product = {
      nombre: 'Labial Humectante',
      precio: 2500,
      variantes: [
        { id: 1, color_nombre: 'Fucsia', precio: 2500, precio_oferta: 2000, publicado: true, stock: 0 },
        { id: 2, color_nombre: 'Nude', precio: 2500, precio_oferta: 1750, publicado: true, stock: 10 }
      ]
    };

    const reales = variantesReales(product.variantes);
    expect(reales).toHaveLength(2);

    // getMainVariant debe priorizar la variante con stock > 0 ('Nude')
    const main = getMainVariant(product.variantes);
    expect(main.usarVariante).toBe(true);
    expect(main.variant.color_nombre).toBe('Nude');

    // getProductPrice debe mostrar el precio de la variante principal con stock ('Nude': 2500 -> 1750 = 30% OFF)
    const priceInfo = getProductPrice(product);
    expect(priceInfo.price).toBe(2500);
    expect(priceInfo.offerPrice).toBe(1750);
    expect(priceInfo.calcDescuento).toBe(30);
  });

  test('11. Variante de color sin precio propio hereda el precio base del padre pero mantiene su oferta propia', () => {
    const product = {
      nombre: 'Sombra de Ojos Individual',
      precio: 4000,
      variantes: [
        { id: 1, color_nombre: 'Dorado', precio: null, precio_oferta: 3200, stock: 4 }
      ]
    };

    const result = getVariantPrice(product.variantes[0], product);
    expect(result.price).toBe(4000); // Heredado del padre
    expect(result.offerPrice).toBe(3200);
    expect(result.tieneOferta).toBe(true);
    expect(result.calcDescuento).toBe(20); // (4000 - 3200)/4000 = 20% OFF
  });

  test('12. variantesReales y getMainVariant aceptan tanto Arrays como Objetos Producto (attrs/producto)', () => {
    const productObj = {
      nombre: 'Shampoo Nutritivo',
      variantes: [
        { id: 1, volumen: '250ml', stock: 10 }
      ]
    };

    const reales = variantesReales(productObj);
    expect(reales).toHaveLength(1);

    const main = getMainVariant(productObj);
    expect(main.usarVariante).toBe(true);
    expect(main.volumen).toBe('250ml');
    expect(main.variant.volumen).toBe('250ml');
  });

  test('13. sortSizes ordena correctamente etiquetas con números ("N° 10", "N° 10.13", "N° 20", "N° 121")', () => {
    const rawSizes = ['N° 20', 'N° 10', 'N° 10.13', 'N° 121', 'N° 28', 'N° 30', 'Único'];
    const sorted = sortSizes(rawSizes);
    expect(sorted).toEqual(['N° 10', 'N° 10.13', 'N° 20', 'N° 28', 'N° 30', 'N° 121', 'Único']);
  });

});
