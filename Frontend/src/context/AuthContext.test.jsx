import React, { useContext } from 'react';
import { act, render, screen } from '@testing-library/react';
import { AuthContext, AuthProvider } from './AuthContext';
import { SESSION_EXPIRED_EVENT } from '../utils/sessionManager';

const tokenWithExpiration = (exp) => {
  const encode = value => btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${encode({ alg: 'none' })}.${encode({ exp })}.signature`;
};

function State() {
  const auth = useContext(AuthContext);
  return <div>{JSON.stringify({ authenticated: auth.isAuthenticated, blocked: auth.isSessionBlocked, scope: auth.expiredSessionScope })}</div>;
}

afterEach(() => localStorage.clear());

test('no restaura un JWT vencido y bloquea la sesión', () => {
  localStorage.setItem('jwt', tokenWithExpiration(Math.floor(Date.now() / 1000) - 10));
  localStorage.setItem('user', JSON.stringify({ id: 1 }));

  render(<AuthProvider><State /></AuthProvider>);

  expect(screen.getByText(/"authenticated":false/).textContent).toContain('"blocked":true');
  expect(screen.getByText(/"authenticated":false/).textContent).toContain('"scope":"customer"');
  expect(localStorage.getItem('jwt')).toBeNull();
});

test('un evento 401 sincroniza inmediatamente el estado visual', () => {
  localStorage.setItem('jwt', tokenWithExpiration(Math.floor(Date.now() / 1000) + 3600));
  localStorage.setItem('user', JSON.stringify({ id: 1 }));
  render(<AuthProvider><State /></AuthProvider>);
  expect(screen.getByText(/"authenticated":true/)).toBeTruthy();

  act(() => window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT, { detail: { scope: 'customer' } })));

  expect(screen.getByText(/"authenticated":false/).textContent).toContain('"blocked":true');
});
