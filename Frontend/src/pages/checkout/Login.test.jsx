import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Login from './Login';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { GUEST_KEY } from '../../utils/guestCheckout';

const mockNavigate = jest.fn();
const mockOpenAuth = jest.fn();
jest.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate, useLocation: () => ({ search: '' }), Link: ({ children }) => <span>{children}</span> }), { virtual: true });
beforeEach(() => { sessionStorage.clear(); jest.clearAllMocks(); });
test('identificación ofrece cuenta e invitado; guarda contacto y continúa sin iniciar sesión', () => {
  render(<AuthContext.Provider value={{ token: null, user: null, openAuthModal: mockOpenAuth }}><CartContext.Provider value={{ cartItems: [], cartTotal: 1000 }}><Login /></CartContext.Provider></AuthContext.Provider>);
  fireEvent.click(screen.getByRole('button', { name: 'Iniciar Sesión / Registrarse' }));
  expect(mockOpenAuth).toHaveBeenCalledWith('/envio');
  for (const [label, value] of [['Nombre', 'Ana'], ['Apellido', 'Pérez'], ['Email', 'ANA@example.com'], ['Teléfono', '3851234567']]) fireEvent.change(screen.getByLabelText(label), { target: { value } });
  fireEvent.click(screen.getByRole('button', { name: 'Continuar como invitado' }));
  expect(mockNavigate).toHaveBeenCalledWith('/envio');
  expect(JSON.parse(sessionStorage.getItem(GUEST_KEY))).toEqual({ nombre: 'Ana', apellido: 'Pérez', email: 'ana@example.com', telefono: '3851234567' });
});
test('datos de invitado inválidos no habilitan avance', () => {
  render(<AuthContext.Provider value={{ token: null, user: null }}><CartContext.Provider value={{ cartItems: [], cartTotal: 0 }}><Login /></CartContext.Provider></AuthContext.Provider>);
  fireEvent.submit(screen.getByRole('button', { name: 'Continuar como invitado' }).closest('form'));
  expect(screen.getByRole('alert').textContent).toMatch(/Completá/);
  expect(mockNavigate).not.toHaveBeenCalled();
  expect(sessionStorage.getItem(GUEST_KEY)).toBeNull();
});
