import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Envio from './Envio';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { DELIVERY_KEY } from '../../utils/checkoutDelivery';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>,
}), { virtual: true });
jest.mock('../../hooks/useConfiguracionGeneral', () => ({ useConfiguracionGeneral: () => ({ config: { costo_envio: 6000, envio_gratis_desde: 50000 } }) }));
jest.mock('../../hooks/usePaginaSucursales', () => ({ usePaginaSucursales: () => ({ loading: false, sucursales: [{ provincia: 'Tucumán', locales: [{ direccion: 'Sucursal dinámica', telefono: '1234' }] }] }) }));

beforeEach(() => { sessionStorage.clear(); mockNavigate.mockClear(); });
test('bloquea retiro sin selección y transmite la sucursal dinámica al paso de pago', () => {
  render(<AuthContext.Provider value={{ token: null }}><CartContext.Provider value={{ cartItems: [{ cartId: '1', product: { nombre: 'Shampoo' }, price: 1000, quantity: 1 }], cartTotal: 1000 }}><Envio /></CartContext.Provider></AuthContext.Provider>);
  fireEvent.click(screen.getByText('Retiro por sucursal'));
  const proceed = screen.getByRole('button', { name: 'Ir a pagar' });
  expect(proceed.disabled).toBe(true);
  const selector = screen.getByLabelText('Elegí la sucursal de retiro');
  fireEvent.change(selector, { target: { value: JSON.stringify(['Tucumán', 'Sucursal dinámica']) } });
  expect(proceed.disabled).toBe(false);
  fireEvent.click(proceed);
  expect(mockNavigate).toHaveBeenCalledWith('/pago');
  expect(JSON.parse(sessionStorage.getItem(DELIVERY_KEY))).toEqual(expect.objectContaining({ metodo_envio: 'sucursal', sucursal: 'Sucursal dinámica', provincia: 'Tucumán' }));
  fireEvent.click(screen.getByText('Envío a domicilio'));
  expect(screen.queryByLabelText('Elegí la sucursal de retiro')).toBeNull();
  expect(proceed.disabled).toBe(true);
});
