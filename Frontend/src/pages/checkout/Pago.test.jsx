import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Pago from './Pago';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { DELIVERY_KEY } from '../../utils/checkoutDelivery';

const mockNavigate = jest.fn();
const mockClearCart = jest.fn();
jest.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate, Link: ({ to, children }) => <a href={to}>{children}</a> }), { virtual: true });
jest.mock('../../hooks/useConfiguracionGeneral', () => ({ useConfiguracionGeneral: () => ({ config: {
  costo_envio: 6000, envio_gratis_desde: 50000,
  metodosPago: [{ id: 'efectivo', title: 'Efectivo', subtitle: 'Pago', right: 'Sin recargo' }],
} }) }));

const home = { metodo_envio: 'domicilio', calle: 'Mitre', numero: '123', ciudad: 'Ciudad', provincia: 'Provincia', cp: '1234' };
function mount(delivery) {
  if (delivery) sessionStorage.setItem(DELIVERY_KEY, JSON.stringify(delivery));
  return render(<AuthContext.Provider value={{ token: 'test', user: { email: 'test@example.com' } }}><CartContext.Provider value={{ cartItems: [{ cartId: '1', product: { id: 1, nombre: 'Shampoo' }, price: 1000, quantity: 1 }], cartTotal: 1000, clearCart: mockClearCart, setAppliedGiftCard: jest.fn() }}><Pago /></CartContext.Provider></AuthContext.Provider>);
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
  fireEvent.click(await screen.findByRole('button', { name: 'Hacer pedido' }));
  await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/order-success', expect.anything()));
  const payload = JSON.parse(global.fetch.mock.calls[0][1].body);
  expect(payload).toEqual(expect.objectContaining({ direccion_envio: delivery, metodo_envio: delivery.metodo_envio, envio: fee, total, metodo_pago: 'efectivo' }));
});
test('rechazo del servidor conserva carrito y no muestra éxito', async () => {
  global.fetch.mockResolvedValue({ ok: false });
  jest.spyOn(console, 'error').mockImplementation(() => {});
  mount(home);
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
