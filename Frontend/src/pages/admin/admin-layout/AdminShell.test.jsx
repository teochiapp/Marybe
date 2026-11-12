import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import AdminShell from './AdminShell';
import useAdminSession from '../../../hooks/useAdminSession';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  NavLink: ({ to, children, className, onClickCapture, end, ...props }) => <a href={to} className={typeof className === 'function' ? className({ isActive: false }) : className} onClickCapture={onClickCapture} onClick={event => { const blocked = event.defaultPrevented; event.preventDefault(); if (!blocked) mockNavigate(to); }} {...props}>{children}</a>,
  Outlet: () => <h1>Panel general</h1>,
  useLocation: () => ({ pathname: '/admin' }),
}), { virtual: true });
jest.mock('../../../hooks/useAdminSession');

test('permite navegar y respeta cambios pendientes', () => {
  useAdminSession.mockReturnValue({ token: 'test', signIn: jest.fn(), signOut: jest.fn(), sync: jest.fn() });
  render(<AdminShell />);
  const pending = event => event.preventDefault();
  window.addEventListener('beforeunload', pending);
  const confirm = jest.spyOn(window, 'confirm').mockReturnValue(false);
  fireEvent.click(screen.getByRole('link', { name: 'Pedidos' }));
  expect(mockNavigate).not.toHaveBeenCalled();
  confirm.mockReturnValue(true);
  fireEvent.click(screen.getByRole('link', { name: 'Pedidos' }));
  expect(mockNavigate).toHaveBeenCalledWith('/pedidos-admin');
  window.removeEventListener('beforeunload', pending);
  confirm.mockRestore();
});
