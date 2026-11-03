import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Envio from './Envio';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { DELIVERY_KEY } from '../../utils/checkoutDelivery';
import { GUEST_KEY } from '../../utils/guestCheckout';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>,
}), { virtual: true });
jest.mock('../../hooks/useConfiguracionGeneral', () => ({ useConfiguracionGeneral: () => ({ config: { costo_envio: 6000, envio_gratis_desde: 50000 } }) }));
jest.mock('../../hooks/usePaginaSucursales', () => ({ usePaginaSucursales: () => ({ loading: false, sucursales: [{ provincia: 'Tucumán', locales: [{ direccion: 'Sucursal dinámica', ciudad: 'San Miguel de Tucumán', telefono: '1234' }] }] }) }));

beforeEach(() => { sessionStorage.clear(); mockNavigate.mockClear(); sessionStorage.setItem(GUEST_KEY, JSON.stringify({ nombre: 'Ana', apellido: 'Pérez', email: 'ana@example.com', telefono: '3851234567' })); });
test('bloquea retiro sin selección y transmite la sucursal dinámica al paso de pago', () => {
  render(<AuthContext.Provider value={{ token: null }}><CartContext.Provider value={{ cartItems: [{ cartId: '1', product: { nombre: 'Shampoo' }, price: 1000, quantity: 1 }], cartTotal: 1000 }}><Envio /></CartContext.Provider></AuthContext.Provider>);
  fireEvent.click(screen.getByText('Retiro por sucursal'));
  const proceed = screen.getByRole('button', { name: 'Ir a pagar' });
  expect(proceed.disabled).toBe(true);
  const selector = screen.getByLabelText('Elegí la sucursal de retiro');
  expect(screen.getByRole('option', { name: 'Sucursal dinámica - San Miguel de Tucumán' })).toBeTruthy();
  fireEvent.change(selector, { target: { value: JSON.stringify(['Tucumán', 'Sucursal dinámica']) } });
  expect(proceed.disabled).toBe(false);
  fireEvent.click(proceed);
  expect(mockNavigate).toHaveBeenCalledWith('/pago');
  expect(JSON.parse(sessionStorage.getItem(DELIVERY_KEY))).toEqual(expect.objectContaining({ metodo_envio: 'sucursal', sucursal: 'Sucursal dinámica', ciudad: 'San Miguel de Tucumán', provincia: 'Tucumán' }));
  expect(JSON.parse(sessionStorage.getItem(DELIVERY_KEY))).toEqual(expect.objectContaining({ nombre: 'Ana Pérez', email: 'ana@example.com', telefono: '3851234567' }));
  fireEvent.click(screen.getByText('Envío a domicilio'));
  expect(screen.queryByLabelText('Elegí la sucursal de retiro')).toBeNull();
  expect(proceed.disabled).toBe(true);
  for (const [label, value] of [['Calle', 'Mitre'], ['Número / Depto', '123'], ['Código postal', '4200'], ['Ciudad', 'Ciudad'], ['Provincia', 'Provincia']]) fireEvent.change(screen.getByLabelText(label), { target: { value } });
  expect(proceed.disabled).toBe(false);
  fireEvent.click(proceed);
  expect(JSON.parse(sessionStorage.getItem(DELIVERY_KEY))).toEqual(expect.objectContaining({ metodo_envio: 'domicilio', calle: 'Mitre', numero: '123', email: 'ana@example.com' }));
});
