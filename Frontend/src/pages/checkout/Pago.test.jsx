import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Pago from './Pago';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { DELIVERY_KEY } from '../../utils/checkoutDelivery';
import { GUEST_KEY } from '../../utils/guestCheckout';

const mockNavigate = jest.fn();
const mockClearCart = jest.fn();
jest.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate, Link: ({ to, children }) => <a href={to}>{children}</a> }), { virtual: true });
jest.mock('../../hooks/useConfiguracionGeneral', () => ({ useConfiguracionGeneral: () => ({ config: {
  costo_envio: 6000, envio_gratis_desde: 50000,
  metodosPago: [{ id: 'efectivo', title: 'Efectivo', subtitle: 'Pago', right: 'Sin recargo' }, { id: 'mercadopago', title: 'Mercado Pago', subtitle: 'Tarjetas', right: 'Sin recargo' }, { id: 'transferencia', title: 'Transferencia bancaria' }, { id: 'aconvenir', title: 'A convenir' }],
} }) }));

const home = { metodo_envio: 'domicilio', calle: 'Mitre', numero: '123', ciudad: 'Ciudad', provincia: 'Provincia', cp: '1234' };
function mount(delivery, items = [{ cartId: '1', product: { id: 1, nombre: 'Shampoo' }, price: 1000, quantity: 1 }], auth = { token: 'test', user: { email: 'test@example.com' } }) {
  if (delivery) sessionStorage.setItem(DELIVERY_KEY, JSON.stringify(delivery));
  return render(<AuthContext.Provider value={auth}><CartContext.Provider value={{ cartItems: items, cartTotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0), clearCart: mockClearCart, setAppliedGiftCard: jest.fn() }}><Pago /></CartContext.Provider></AuthContext.Provider>);
}
beforeEach(() => {
  sessionStorage.clear(); mockNavigate.mockClear(); mockClearCart.mockClear();
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ data: { numero_pedido: 'M-TEST' } }) });
  jest.spyOn(window, 'alert').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

test.each([
  ['domicilio', home, 6000, 7000],
  ['sucursal', { metodo_envio: 'sucursal', sucursal: 'Maipú 164', provincia: 'Tucumán' }, 0, 1000],
])('efectivo con %s conserva entrega y total correctos', async (_, delivery, fee, total) => {
  mount(delivery);
  fireEvent.click(screen.getByText('Efectivo'));
  fireEvent.click(await screen.findByRole('button', { name: 'Hacer pedido' }));
  await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/order-success', expect.anything()));
  const payload = JSON.parse(global.fetch.mock.calls[0][1].body);
  expect(payload).toEqual(expect.objectContaining({ direccion_envio: delivery, metodo_envio: delivery.metodo_envio, envio: fee, total, metodo_pago: 'efectivo' }));
});
test('rechazo del servidor conserva carrito y no muestra éxito', async () => {
  global.fetch.mockResolvedValue({ ok: false });
  jest.spyOn(console, 'error').mockImplementation(() => {});
  mount(home);
  fireEvent.click(screen.getByText('Efectivo'));
  fireEvent.click(await screen.findByRole('button', { name: 'Hacer pedido' }));
  await waitFor(() => expect(window.alert).toHaveBeenCalled());
  expect(mockClearCart).not.toHaveBeenCalled();
  expect(mockNavigate).not.toHaveBeenCalledWith('/order-success', expect.anything());
});
test('acceso directo a pago sin entrega válida vuelve al paso de envío', async () => {
  mount(null);
  await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/envio', { replace: true }));
  expect(global.fetch).not.toHaveBeenCalled();
});

test.each([false, true])('Mercado Pago conserva carrito y pedido pendiente; invitado=%s', async isGuest => {
  const location = window.location;
  delete window.location;
  window.location = { origin: 'http://localhost', href: 'http://localhost/pago' };
  const items = [
    { product: { id: 1, nombre: 'Perfume A' }, variant: { id: 11, volumen: '100 ml' }, price: 1000, quantity: 1, cartId: '1-11' },
    { product: { id: 1, nombre: 'Perfume A' }, variant: { id: 12, volumen: '200 ml' }, price: 1500, quantity: 2, cartId: '1-12' },
    { product: { id: 2, nombre: 'Perfume B' }, variant: { id: 21, volumen: '100 ml' }, price: 3000, quantity: 1, cartId: '2-21' },
    { product: { id: 2, nombre: 'Perfume B' }, variant: { id: 22, volumen: '200 ml' }, price: 4000, quantity: 1, cartId: '2-22' },
  ];
  global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { numero_pedido: 'M-MULTI' }, checkoutToken: 'qa-checkout-token' }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, init_point: 'https://example.test/checkout' }) });
  try {
    const guest = { nombre: 'Ana', apellido: 'Pérez', email: 'ana@example.com', telefono: '3851234567' };
    if (isGuest) sessionStorage.setItem(GUEST_KEY, JSON.stringify(guest));
    mount(home, items, isGuest ? { token: null, user: null } : undefined);
    fireEvent.click(screen.getByRole('button', { name: 'Pagar' }));
    await waitFor(() => expect(window.location.href).toBe('https://example.test/checkout'));
    const order = JSON.parse(global.fetch.mock.calls[0][1].body);
    const preference = JSON.parse(global.fetch.mock.calls[1][1].body);
    expect(order.productos).toEqual(items);
    expect(global.fetch.mock.calls[0][0]).toContain(isGuest ? '/api/pedidos-invitado' : '/api/mis-pedidos');
    if (isGuest) {
      expect(order.cliente).toEqual(guest);
      expect(global.fetch.mock.calls[0][1].headers.Authorization).toBeUndefined();
    }
    expect(preference).toEqual({ externalReference: 'M-MULTI', checkoutToken: 'qa-checkout-token' });
    expect(JSON.parse(sessionStorage.getItem('mp_pending_order'))).toEqual(expect.objectContaining({ cartItems: items, isGuest }));
    expect(mockClearCart).not.toHaveBeenCalled();
  } finally { window.location = location; }
});

test.each(['efectivo', 'transferencia'])('invitado registra pedido con %s sin token ni cuenta', async method => {
  const guest = { nombre: 'Ana', apellido: 'Pérez', email: 'ana@example.com', telefono: '3851234567' };
  sessionStorage.setItem(GUEST_KEY, JSON.stringify(guest));
  mount({ metodo_envio: 'sucursal', sucursal: 'Maipú 164', provincia: 'Tucumán', nombre: 'Ana Pérez', telefono: guest.telefono }, undefined, { token: null, user: null });
  fireEvent.click(screen.getByText(method === 'efectivo' ? 'Efectivo' : 'Transferencia bancaria'));
  fireEvent.click(screen.getByRole('button', { name: 'Hacer pedido' }));
  if (method === 'transferencia') fireEvent.click(screen.getByRole('button', { name: 'Ya transferí, confirmar pedido' }));
  await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/order-success', expect.anything()));
  expect(global.fetch.mock.calls[0][0]).toContain('/api/pedidos-invitado');
  expect(global.fetch.mock.calls[0][1].headers.Authorization).toBeUndefined();
  expect(JSON.parse(global.fetch.mock.calls[0][1].body)).toEqual(expect.objectContaining({ cliente: guest, metodo_pago: method, total: 1000 }));
  expect(mockNavigate).toHaveBeenCalledWith('/order-success', expect.objectContaining({ state: expect.objectContaining({ isGuest: true, email: guest.email }) }));
});

test('invitado a convenir registra el pedido antes de abrir WhatsApp con su referencia', async () => {
  const guest = { nombre: 'Ana', apellido: 'Pérez', email: 'ana@example.com', telefono: '3851234567' };
  sessionStorage.setItem(GUEST_KEY, JSON.stringify(guest));
  const popup = { location: { href: '' }, close: jest.fn() };
  jest.spyOn(window, 'open').mockReturnValue(popup);
  mount(home, undefined, { token: null, user: null });
  fireEvent.click(screen.getByText('A convenir'));
  fireEvent.click(screen.getByRole('button', { name: 'Contactar por WhatsApp' }));
  await waitFor(() => expect(popup.location.href).toContain('M-TEST'));
  expect(JSON.parse(global.fetch.mock.calls[0][1].body)).toEqual(expect.objectContaining({ cliente: guest, metodo_pago: 'aconvenir' }));
  expect(global.fetch.mock.calls[0][0]).toContain('/api/pedidos-invitado');
});

test('espera a restaurar la sesión de un cliente registrado antes de redirigir o permitir pagar', () => {
  mount(home, undefined, { token: null, user: null, isLoading: true });
  expect(mockNavigate).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Pagar' }).disabled).toBe(true);
});

test('volver atrás desde MP concilia el intento sin completar antes de permitir otro pago', async () => {
  sessionStorage.setItem('mp_pending_order', JSON.stringify({ externalReference: 'M-ABC123', checkoutToken: 'qa-token' }));
  global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ reference: 'M-ABC123', pagado: false, estado: 'Abortado', status: 'aborted' }) });
  mount(home);
  expect(screen.getByRole('button', { name: 'Pagar' }).disabled).toBe(true);
  await waitFor(() => expect(screen.getByRole('button', { name: 'Pagar' }).disabled).toBe(false));
  expect(JSON.parse(global.fetch.mock.calls[0][1].body).abort).toBe(true);
  expect(sessionStorage.getItem('mp_pending_order')).toBeNull(); expect(mockClearCart).not.toHaveBeenCalled();
});

test.each([false, true])('volver a Pago con intento pendiente o aprobado evita otro pago; pagado=%s', async pagado => {
  sessionStorage.setItem('mp_pending_order', JSON.stringify({ externalReference: 'M-ABC123', checkoutToken: 'qa-token' }));
  global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ reference: 'M-ABC123', pagado, estado: pagado ? 'Procesando' : 'Pendiente de pago' }) });
  mount(home);
  await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/order-success?reference=M-ABC123', { replace: true }));
  expect(screen.getByRole('button', { name: 'Pagar' }).disabled).toBe(true);
});

test('error al crear preferencia concilia como Abortado y conserva carrito', async () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { numero_pedido: 'M-ABC123' }, checkoutToken: 'qa-token' }) })
    .mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'MP down' }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ reference: 'M-ABC123', pagado: false, estado: 'Abortado', status: 'aborted' }) });
  mount(home); fireEvent.click(screen.getByRole('button', { name: 'Pagar' }));
  await waitFor(() => expect(window.alert).toHaveBeenCalled());
  expect(global.fetch.mock.calls[2][0]).toContain('/consultar-pago'); expect(mockClearCart).not.toHaveBeenCalled();
  expect(sessionStorage.getItem('mp_pending_order')).toBeNull();
});
