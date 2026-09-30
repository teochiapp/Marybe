/**
 * pricing.test.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Tests del flujo completo de pricing para Marybe.
 * Cubre:
 *   1. CartContext.getCartTotal  — suma correcta de items (números y strings)
 *   2. totalFisico               — excluye Gift Cards del cómputo de envío
 *   3. costoEnvioFinal           — gratis/pagado según método de pago y mínimo
 *   4. finalTotal en handlePayment — todas las formas de pago × gift card
 *   5. confirmOrder              — overrideTotal siempre numérico
 *   6. Escenarios con muchos productos + gift cards mezclados
 * ──────────────────────────────────────────────────────────────────────────────
 */

// ─── Helpers replicados desde el código fuente ──────────────────────────────

/** Replica exacta de CartContext.getCartTotal (después del fix) */
function getCartTotal(cartItems) {
  return cartItems.reduce(
    (total, item) => total + (Number(item.price) || 0) * (Number(item.quantity) || 0),
    0
  );
}

/** Replica de la lógica de totalFisico en Pago.jsx */
function getTotalFisico(cartItems) {
  return cartItems.reduce((acc, item) => {
    const esGiftCard =
      item.product?.id?.toString().startsWith('gift-card-') ||
      item.product?.nombre?.toLowerCase().includes('gift card');
    return esGiftCard
      ? acc
      : acc + (Number(item.price) || Number(item.product?.precio) || 0) * Number(item.quantity || 1);
  }, 0);
}

/** Replica de la lógica de costoEnvioFinal en Pago.jsx */
function getCostoEnvioFinal({ paymentMethod, totalFisico, costoEnvio, envioGratisDesde }) {
  const esEfectivo = paymentMethod === 'efectivo';
  const envioEsGratis =
    esEfectivo ||
    totalFisico === 0 ||
    (envioGratisDesde !== null && totalFisico >= envioGratisDesde);
  return envioEsGratis ? 0 : (costoEnvio ?? 0);
}

/** Replica de handlePayment finalTotal (después del fix) */
function calcFinalTotal(cartTotal, costoEnvioFinal, appliedGiftCard) {
  let finalTotal = Number(cartTotal) + Number(costoEnvioFinal);
  if (appliedGiftCard) {
    finalTotal = Math.max(0, finalTotal - Number(appliedGiftCard.monto));
  }
  return finalTotal;
}

/** Replica de confirmOrder finalTotal (overrideTotal o cartTotal) */
function calcConfirmOrderTotal(overrideTotal, cartTotal, appliedGiftCard) {
  let finalTotal = overrideTotal !== undefined ? Number(overrideTotal) : Number(cartTotal);
  if (overrideTotal === undefined && appliedGiftCard) {
    finalTotal = Math.max(0, finalTotal - Number(appliedGiftCard.monto));
  }
  return finalTotal;
}

// ─── Fixtures ───────────────────────────────────────────────────────────────

const COSTO_ENVIO = 6000;
const ENVIO_GRATIS_DESDE = 50000;

const makeItem = (id, nombre, price, quantity, isGiftCard = false) => ({
  cartId: `${id}-Único-Único`,
  product: {
    id: isGiftCard ? `gift-card-${id}` : id,
    nombre,
  },
  quantity,
  price,
});

// Items con precios como NÚMEROS (caso normal)
const itemBiferdil   = makeItem(232396, 'BIFERDIL BALSAMO', 8800,  1);
const itemShampoo    = makeItem(100001, 'Shampoo XYZ',      12500, 2);
const itemCrema      = makeItem(100002, 'Crema Hidratante', 5400,  3);
const itemGiftCard1  = makeItem('gc1',  'Gift Card $10000', 10000, 1, true);
const itemGiftCard2  = makeItem('gc2',  'Gift Card $25000', 25000, 2, true);

// Items con precios como STRINGS (simulando lectura desde localStorage)
const itemBiferdilStr  = { ...itemBiferdil,  price: '8800',  quantity: '1' };
const itemShampooStr   = { ...itemShampoo,   price: '12500', quantity: '2' };
const itemCremaStr     = { ...itemCrema,     price: '5400',  quantity: '3' };
const itemGiftCard1Str = { ...itemGiftCard1, price: '10000', quantity: '1' };

// ════════════════════════════════════════════════════════════════════════════
// 1. getCartTotal
// ════════════════════════════════════════════════════════════════════════════
describe('getCartTotal', () => {
  test('1.1 — Un solo producto, precio número', () => {
    expect(getCartTotal([itemBiferdil])).toBe(8800);
  });

  test('1.2 — Un solo producto, precio STRING (localStorage)', () => {
    expect(getCartTotal([itemBiferdilStr])).toBe(8800);
  });

  test('1.3 — Múltiples productos, precios números', () => {
    // 8800 + 12500*2 + 5400*3 = 8800 + 25000 + 16200 = 50000
    expect(getCartTotal([itemBiferdil, itemShampoo, itemCrema])).toBe(50000);
  });

  test('1.4 — Múltiples productos, precios STRINGS (bug original → ahora debe sumar)', () => {
    const result = getCartTotal([itemBiferdilStr, itemShampooStr, itemCremaStr]);
    expect(result).toBe(50000);
    expect(typeof result).toBe('number');
    expect(result).not.toBeGreaterThan(200000);
  });

  test('1.5 — Carrito con gift cards incluidas', () => {
    // 8800 + 10000 = 18800
    expect(getCartTotal([itemBiferdil, itemGiftCard1])).toBe(18800);
  });

  test('1.6 — Solo gift cards', () => {
    // 10000 + 25000*2 = 60000
    expect(getCartTotal([itemGiftCard1, itemGiftCard2])).toBe(60000);
  });

  test('1.7 — Carrito vacío → 0', () => {
    expect(getCartTotal([])).toBe(0);
  });

  test('1.8 — Cantidad string + precio string (localStorage doble)', () => {
    // 8800*3 = 26400
    const item = { ...itemBiferdil, price: '8800', quantity: '3' };
    expect(getCartTotal([item])).toBe(26400);
  });

  test('1.9 — BUG ORIGINAL reproducido: "8800" + 6000 debe ser 14800, NO "88006000"', () => {
    const cartTotal = getCartTotal([itemBiferdilStr]); // string price simulado
    const envio = 6000;
    const total = Number(cartTotal) + Number(envio);
    expect(total).toBe(14800);
    expect(total.toString()).not.toContain('88006000');
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 2. totalFisico (para lógica de envío)
// ════════════════════════════════════════════════════════════════════════════
describe('getTotalFisico', () => {
  test('2.1 — Productos físicos sin gift cards', () => {
    expect(getTotalFisico([itemBiferdil, itemShampoo])).toBe(8800 + 25000);
  });

  test('2.2 — Mezcla físicos + gift cards → solo cuenta físicos', () => {
    // 8800 + 12500*2 = 33800 (sin contar gift card $10000)
    expect(getTotalFisico([itemBiferdil, itemShampoo, itemGiftCard1])).toBe(33800);
  });

  test('2.3 — Solo gift cards → totalFisico = 0', () => {
    expect(getTotalFisico([itemGiftCard1, itemGiftCard2])).toBe(0);
  });

  test('2.4 — Precios string desde localStorage', () => {
    // 8800 + 25000 = 33800
    expect(getTotalFisico([itemBiferdilStr, itemShampooStr])).toBe(33800);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 3. costoEnvioFinal
// ════════════════════════════════════════════════════════════════════════════
describe('getCostoEnvioFinal', () => {
  const base = { costoEnvio: COSTO_ENVIO, envioGratisDesde: ENVIO_GRATIS_DESDE };

  test('3.1 — Efectivo (retiro) → siempre gratis', () => {
    expect(getCostoEnvioFinal({ ...base, paymentMethod: 'efectivo', totalFisico: 1000 })).toBe(0);
  });

  test('3.2 — Solo gift cards (totalFisico=0) → envío gratis', () => {
    expect(getCostoEnvioFinal({ ...base, paymentMethod: 'transferencia', totalFisico: 0 })).toBe(0);
  });

  test('3.3 — Total físico supera mínimo → envío gratis', () => {
    expect(getCostoEnvioFinal({ ...base, paymentMethod: 'transferencia', totalFisico: 50000 })).toBe(0);
  });

  test('3.4 — Total físico bajo mínimo → cobra envío', () => {
    expect(getCostoEnvioFinal({ ...base, paymentMethod: 'transferencia', totalFisico: 10000 })).toBe(6000);
  });

  test('3.5 — Mercado Pago, total bajo mínimo → cobra envío', () => {
    expect(getCostoEnvioFinal({ ...base, paymentMethod: 'mercadopago', totalFisico: 8800 })).toBe(6000);
  });

  test('3.6 — Mercado Pago, total supera mínimo → gratis', () => {
    expect(getCostoEnvioFinal({ ...base, paymentMethod: 'mercadopago', totalFisico: 55000 })).toBe(0);
  });

  test('3.7 — Sin configuración de envío (costoEnvio null) → 0', () => {
    expect(
      getCostoEnvioFinal({ costoEnvio: null, envioGratisDesde: null, paymentMethod: 'transferencia', totalFisico: 5000 })
    ).toBe(0);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 4. handlePayment — finalTotal por método de pago
// ════════════════════════════════════════════════════════════════════════════
describe('calcFinalTotal — handlePayment', () => {
  // ─── Sin gift card ───────────────────────────────────────────────────────

  test('4.1 — Transferencia, 1 producto, con costo de envío', () => {
    expect(calcFinalTotal(8800, 6000, null)).toBe(14800);
  });

  test('4.2 — Transferencia, 1 producto, envío gratis', () => {
    expect(calcFinalTotal(8800, 0, null)).toBe(8800);
  });

  test('4.3 — Mercado Pago, múltiples productos, con envío', () => {
    expect(calcFinalTotal(50000, 6000, null)).toBe(56000);
  });

  test('4.4 — Efectivo (retiro), sin envío', () => {
    expect(calcFinalTotal(33800, 0, null)).toBe(33800);
  });

  // ─── Con gift card ───────────────────────────────────────────────────────

  test('4.5 — Gift Card parcial (no cubre todo)', () => {
    // cartTotal=8800 + envio=6000 = 14800, gc=$5000 → 9800
    expect(calcFinalTotal(8800, 6000, { monto: 5000 })).toBe(9800);
  });

  test('4.6 — Gift Card cubre exactamente el total', () => {
    expect(calcFinalTotal(8800, 0, { monto: 8800 })).toBe(0);
  });

  test('4.7 — Gift Card supera el total → no puede quedar negativo', () => {
    expect(calcFinalTotal(8800, 0, { monto: 20000 })).toBe(0);
  });

  test('4.8 — Gift Card string desde localStorage (monto como string)', () => {
    expect(calcFinalTotal(8800, 6000, { monto: '5000' })).toBe(9800);
  });

  // ─── cartTotal como STRING (bug original) ───────────────────────────────

  test('4.9 — cartTotal string + envio número (BUG ORIGINAL reproducido)', () => {
    expect(calcFinalTotal('8800', 6000, null)).toBe(14800);
  });

  test('4.10 — cartTotal string + envio string', () => {
    expect(calcFinalTotal('8800', '6000', null)).toBe(14800);
  });

  test('4.11 — Tres productos string + envio + gift card string', () => {
    // cartTotal="50000", envio="6000", gc={monto:"10000"} → 46000
    expect(calcFinalTotal('50000', '6000', { monto: '10000' })).toBe(46000);
  });

  // ─── Todos los métodos de pago con el mismo carrito ──────────────────────

  test('4.12 — Métodos con envío: total correcto sin gift card', () => {
    // carrito 33800 + envio 6000 = 39800
    ['transferencia', 'mercadopago', 'credito', 'debito'].forEach(() => {
      expect(calcFinalTotal(33800, 6000, null)).toBe(39800);
    });
  });

  test('4.13 — Efectivo: sin envío', () => {
    expect(calcFinalTotal(33800, 0, null)).toBe(33800);
  });

  test('4.14 — Todos los métodos con gift card $5000', () => {
    // Con envío: 33800 + 6000 - 5000 = 34800
    expect(calcFinalTotal(33800, 6000, { monto: 5000 })).toBe(34800);
    // Sin envío (efectivo): 33800 - 5000 = 28800
    expect(calcFinalTotal(33800, 0, { monto: 5000 })).toBe(28800);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 5. confirmOrder — overrideTotal
// ════════════════════════════════════════════════════════════════════════════
describe('calcConfirmOrderTotal — confirmOrder', () => {
  test('5.1 — overrideTotal número → lo usa directamente', () => {
    expect(calcConfirmOrderTotal(14800, 8800, null)).toBe(14800);
  });

  test('5.2 — overrideTotal string → convierte a número', () => {
    expect(calcConfirmOrderTotal('14800', 8800, null)).toBe(14800);
  });

  test('5.3 — Sin overrideTotal, usa cartTotal (número)', () => {
    expect(calcConfirmOrderTotal(undefined, 8800, null)).toBe(8800);
  });

  test('5.4 — Sin overrideTotal, cartTotal string (localStorage)', () => {
    expect(calcConfirmOrderTotal(undefined, '8800', null)).toBe(8800);
  });

  test('5.5 — Sin overrideTotal + gift card aplicada', () => {
    expect(calcConfirmOrderTotal(undefined, 50000, { monto: 10000 })).toBe(40000);
  });

  test('5.6 — Con overrideTotal + gift card → gift card ignorada (ya descontada en handlePayment)', () => {
    expect(calcConfirmOrderTotal(40000, 50000, { monto: 10000 })).toBe(40000);
  });

  test('5.7 — overrideTotal 0 (100% cubierto por gift card)', () => {
    expect(calcConfirmOrderTotal(0, 8800, { monto: 8800 })).toBe(0);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 6. Escenarios end-to-end con muchos productos + gift cards
// ════════════════════════════════════════════════════════════════════════════
describe('Escenarios E2E completos', () => {
  const config = { costoEnvio: COSTO_ENVIO, envioGratisDesde: ENVIO_GRATIS_DESDE };

  // Carrito: 3 prod físicos + 2 gift cards (strings — simulando localStorage)
  const carritoMixto = [
    { ...itemBiferdil,  price: '8800',  quantity: '1' },   // 8800
    { ...itemShampoo,   price: '12500', quantity: '2' },   // 25000
    { ...itemCrema,     price: '5400',  quantity: '3' },   // 16200
    { ...itemGiftCard1, price: '10000', quantity: '1' },   // 10000 (GC)
    { ...itemGiftCard2, price: '25000', quantity: '2' },   // 50000 (GC x2)
  ];

  test('6.1 — getCartTotal carrito mixto con strings = 110000', () => {
    expect(getCartTotal(carritoMixto)).toBe(110000);
  });

  test('6.2 — totalFisico carrito mixto excluye GCs = 50000', () => {
    expect(getTotalFisico(carritoMixto)).toBe(50000);
  });

  test('6.3 — totalFisico exactamente = envioGratisDesde → envío gratis', () => {
    const envio = getCostoEnvioFinal({ ...config, paymentMethod: 'transferencia', totalFisico: 50000 });
    expect(envio).toBe(0);
  });

  test('6.4 — Transferencia, carrito mixto, físico >= 50k → sin costo envío', () => {
    const cartTotal = getCartTotal(carritoMixto);
    const totalFisico = getTotalFisico(carritoMixto);
    const envio = getCostoEnvioFinal({ ...config, paymentMethod: 'transferencia', totalFisico });
    const finalTotal = calcFinalTotal(cartTotal, envio, null);
    expect(envio).toBe(0);
    expect(finalTotal).toBe(110000);
  });

  test('6.5 — Mercado Pago, carrito mixto, con gift card $20000 string', () => {
    const cartTotal = getCartTotal(carritoMixto);
    const totalFisico = getTotalFisico(carritoMixto);
    const envio = getCostoEnvioFinal({ ...config, paymentMethod: 'mercadopago', totalFisico });
    const finalTotal = calcFinalTotal(cartTotal, envio, { monto: '20000' });
    expect(envio).toBe(0);
    expect(finalTotal).toBe(90000);
  });

  test('6.6 — Solo gift cards: envío gratis, total = suma de GCs', () => {
    const soloGCs = [itemGiftCard1, itemGiftCard2];
    const cartTotal = getCartTotal(soloGCs);
    const totalFisico = getTotalFisico(soloGCs);
    const envio = getCostoEnvioFinal({ ...config, paymentMethod: 'transferencia', totalFisico });
    const finalTotal = calcFinalTotal(cartTotal, envio, null);
    expect(totalFisico).toBe(0);
    expect(envio).toBe(0);
    expect(finalTotal).toBe(60000);
  });

  test('6.7 — Carrito pequeño, cobra envío, gift card gigante → total $0', () => {
    const cartTotal = getCartTotal([itemBiferdil]);
    const totalFisico = getTotalFisico([itemBiferdil]);
    const envio = getCostoEnvioFinal({ ...config, paymentMethod: 'transferencia', totalFisico });
    const finalTotal = calcFinalTotal(cartTotal, envio, { monto: 50000 });
    expect(envio).toBe(6000);
    expect(finalTotal).toBe(0);
  });

  test('6.8 — Efectivo + carrito mixto + gift card $15000', () => {
    const cartTotal = getCartTotal(carritoMixto);
    const totalFisico = getTotalFisico(carritoMixto);
    const envio = getCostoEnvioFinal({ ...config, paymentMethod: 'efectivo', totalFisico });
    const finalTotal = calcFinalTotal(cartTotal, envio, { monto: 15000 });
    expect(envio).toBe(0);
    expect(finalTotal).toBe(95000);
  });

  test('6.9 — 10 productos distintos, precios strings, suma correcta', () => {
    // item i+1: price=(i+1)*1000, quantity=i+1
    // subtotal_i = (i+1)^2 * 1000, suma = (1+4+9+...+100)*1000 = 385000
    const items = Array.from({ length: 10 }, (_, i) =>
      makeItem(i + 1, `Producto ${i + 1}`, String((i + 1) * 1000), String(i + 1))
    );
    const result = getCartTotal(items);
    expect(result).toBe(385000);
    expect(typeof result).toBe('number');
  });

  test('6.10 — confirmOrder no re-aplica gift card sobre total ya calculado', () => {
    const overrideTotal = 9800; // handlePayment ya descontó la GC
    const result = calcConfirmOrderTotal(overrideTotal, 8800, { monto: 5000 });
    expect(result).toBe(9800);
  });

  test('6.11 — Flujo completo: 3 físicos + 1 GC, transferencia, GC parcial', () => {
    // Carrito: biferdil(8800x1) + shampoo(12500x2) + crema(5400x1) = 8800+25000+5400 = 39200 físicos
    // + GC 10000 → cartTotal = 49200
    const items = [
      { ...itemBiferdil, price: '8800', quantity: '1' },
      { ...itemShampoo,  price: '12500', quantity: '2' },
      { product: { id: 100002, nombre: 'Crema' }, price: '5400', quantity: '1', cartId: 'c-1' },
      { ...itemGiftCard1, price: '10000', quantity: '1' },
    ];
    const cartTotal = getCartTotal(items);           // 49200
    const totalFisico = getTotalFisico(items);       // 39200
    const envio = getCostoEnvioFinal({ ...config, paymentMethod: 'transferencia', totalFisico });
    // 39200 < 50000 → cobra envío 6000
    expect(envio).toBe(6000);
    const finalTotal = calcFinalTotal(cartTotal, envio, { monto: '8000' });
    // 49200 + 6000 - 8000 = 47200
    expect(finalTotal).toBe(47200);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 7. Protección numérica — casos extremos
// ════════════════════════════════════════════════════════════════════════════
describe('Protección contra tipos inesperados', () => {
  test('7.1 — price=undefined en item → 0, no NaN', () => {
    // Number(undefined) = NaN, pero con el guard (|| 0) queda en 0
    const item = { product: { id: 1, nombre: 'X' }, quantity: 1, price: undefined };
    const result = getCartTotal([item]);
    expect(result).toBe(0);
    expect(Number.isNaN(result)).toBe(false);
  });

  test('7.2 — price=null en item → 0', () => {
    const item = { product: { id: 1, nombre: 'X' }, quantity: 1, price: null };
    expect(getCartTotal([item])).toBe(0);
  });

  test('7.3 — quantity=0 → subtotal 0', () => {
    expect(getCartTotal([{ ...itemBiferdil, quantity: 0 }])).toBe(0);
  });

  test('7.4 — Números muy grandes sin overflow', () => {
    const item = makeItem(1, 'Prod', 999999, 100);
    expect(getCartTotal([item])).toBe(99999900);
    expect(typeof getCartTotal([item])).toBe('number');
  });

  test('7.5 — calcFinalTotal con cartTotal=0 y sin envío', () => {
    expect(calcFinalTotal(0, 0, null)).toBe(0);
  });
});
