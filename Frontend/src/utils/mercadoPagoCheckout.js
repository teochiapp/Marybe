export const MP_PENDING_KEY = 'mp_pending_order';

export function readPendingCheckout() {
  try { return JSON.parse(sessionStorage.getItem(MP_PENDING_KEY)) || null; }
  catch { return null; }
}

export async function syncCheckout(pending, abort = false) {
  if (!pending?.externalReference || !pending?.checkoutToken) throw new Error('No se encontró la sesión de este pago. Consultá con Marybe indicando el número de pedido.');
  const response = await fetch(`${process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337'}/api/mercado-pago/consultar-pago`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ externalReference: pending.externalReference, checkoutToken: pending.checkoutToken, abort }),
  });
  if (!response.ok) throw new Error('No pudimos verificar el pago con Mercado Pago. Reintentá la consulta antes de volver a pagar.');
  const result = await response.json();
  if (result.reference !== pending.externalReference || typeof result.pagado !== 'boolean') throw new Error('La respuesta de pago no coincide con tu pedido.');
  return result;
}
