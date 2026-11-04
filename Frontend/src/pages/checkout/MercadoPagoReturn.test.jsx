import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import OrderSuccess from './OrderSuccess';
import OrderError from './OrderError';
import { CartContext } from '../../context/CartContext';

let mockLocation;
jest.mock('react-router-dom', () => ({
  useLocation: () => mockLocation,
  Link: ({ to, children }) => <a href={to}>{children}</a>,
  Navigate: ({ to }) => <div>Redirect {to}</div>,
}), { virtual: true });
const clearCart = jest.fn();
const setAppliedGiftCard = jest.fn();
const pending = { externalReference: 'M-ABC123', checkoutToken: 'q'.repeat(64), paymentMethod: 'mercadopago', cartItems: [{ product: { nombre: 'Perfume' }, quantity: 2, price: 1000 }], cartTotal: 2000, email: 'qa@example.test', savedAddress: { metodo_envio: 'sucursal', sucursal: 'Local QA', provincia: 'QA' } };
function mount(path = '/order-success', query = '?reference=M-ABC123') {
  mockLocation = { pathname: path, search: query, state: null };
  return render(<CartContext.Provider value={{ clearCart, setAppliedGiftCard }}>{path === '/order-error' ? <OrderError /> : <OrderSuccess />}</CartContext.Provider>);
}
function response(status, estado, pagado = false) {
  return { ok: true, json: async () => ({ reference: pending.externalReference, status, estado, pagado }) };
}
beforeEach(() => {
  sessionStorage.clear(); sessionStorage.setItem('mp_pending_order', JSON.stringify(pending));
  clearCart.mockClear(); setAppliedGiftCard.mockClear();
  global.fetch = jest.fn().mockResolvedValue(response('approved', 'Procesando', true));
});
afterEach(() => { jest.useRealTimers(); jest.restoreAllMocks(); });

test('retorno aprobado consulta backend antes de confirmar y limpiar carrito; recarga no repite limpieza', async () => {
  const view = mount();
  expect(screen.getByText('Verificando pago con Mercado Pago…')).toBeTruthy(); expect(clearCart).not.toHaveBeenCalled();
  await screen.findByText('Pedido confirmado! M-ABC123'); expect(clearCart).toHaveBeenCalledTimes(1);
  expect(JSON.parse(global.fetch.mock.calls[0][1].body)).toEqual({ externalReference: 'M-ABC123', checkoutToken: pending.checkoutToken, abort: false });
  view.unmount(); mount(); await screen.findByText('Pedido confirmado! M-ABC123'); expect(clearCart).toHaveBeenCalledTimes(1);
});
test.each(['', '?reference=M-ABC123', '?status=rejected&payment_id=null&external_reference=M-ABC123'])('aborto por order-error funciona sin payment_id válido: %s', async query => {
  global.fetch.mockResolvedValue(response('aborted', 'Abortado'));
  mount('/order-error', query); await screen.findByText('Pago abortado');
  expect(JSON.parse(global.fetch.mock.calls[0][1].body).abort).toBe(true); expect(clearCart).not.toHaveBeenCalled();
  expect(screen.getByRole('link', { name: 'Reintentar el pago' }).getAttribute('href')).toBe('/pago');
});
test('status=approved falsificado en URL no muestra éxito si backend responde Abortado', async () => {
  global.fetch.mockResolvedValue(response('cancelled', 'Abortado'));
  mount('/order-success', '?status=approved&payment_id=123&external_reference=M-ABC123');
  await screen.findByText('Pago abortado'); expect(screen.queryByText(/Pedido confirmado!/)).toBeNull(); expect(clearCart).not.toHaveBeenCalled();
});
test.each(['pending', 'in_process', 'authorized'])('retorno %s muestra pendiente y conserva carrito', async status => {
  global.fetch.mockResolvedValue(response(status, 'Pendiente de pago'));
  mount(); await screen.findByText('Pago pendiente de confirmación'); expect(clearCart).not.toHaveBeenCalled(); expect(screen.queryByText(/Confirmación enviada/)).toBeNull();
});
test('pendiente consulta otra vez y puede pasar a aprobado sin recargar', async () => {
  jest.useFakeTimers();
  global.fetch.mockResolvedValueOnce(response('pending', 'Pendiente de pago')).mockResolvedValue(response('approved', 'Procesando', true));
  mount(); await act(async () => {}); expect(screen.getByText('Pago pendiente de confirmación')).toBeTruthy();
  await act(async () => { jest.advanceTimersByTime(5000); });
  expect(screen.getByText('Pedido confirmado! M-ABC123')).toBeTruthy(); expect(clearCart).toHaveBeenCalledTimes(1);
});
test('fallo de red no confirma ni aborta; permite consultar otra vez', async () => {
  global.fetch.mockRejectedValueOnce(new Error('offline'));
  mount(); await screen.findByText('No pudimos verificar el pago'); expect(clearCart).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Volver a consultar' }));
  await screen.findByText('Pedido confirmado! M-ABC123');
});
test('referencia ajena no consulta el pedido guardado ni limpia carrito', async () => {
  mount('/order-success', '?reference=M-OTHER1');
  await screen.findByText('No pudimos verificar el pago'); expect(global.fetch).not.toHaveBeenCalled(); expect(clearCart).not.toHaveBeenCalled();
});
test('sessionStorage corrupto muestra recuperación sin confirmar ni romper la página', async () => {
  sessionStorage.setItem('mp_pending_order', '{broken'); mount();
  await screen.findByText('No pudimos verificar el pago'); expect(clearCart).not.toHaveBeenCalled();
});
test('un aprobado recibido por la URL de failure se muestra pagado y no se aborta desde el cliente', async () => {
  mount('/order-error'); await screen.findByText('Pago confirmado'); expect(clearCart).toHaveBeenCalledTimes(1);
});
test('la confirmación de efectivo mantiene el flujo normal sin consultar Mercado Pago', async () => {
  mockLocation = { pathname: '/order-success', search: '', state: { ...pending, paymentMethod: 'efectivo', orderNumber: 'M-CASH01' } };
  render(<CartContext.Provider value={{ clearCart, setAppliedGiftCard }}><OrderSuccess /></CartContext.Provider>);
  await screen.findByText('Pedido confirmado! M-CASH01'); expect(global.fetch).not.toHaveBeenCalled();
});
