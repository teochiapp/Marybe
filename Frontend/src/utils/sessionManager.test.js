import {
  SESSION_EXPIRED_EVENT,
  authenticatedFetch,
  getTokenExpiration,
  isTokenExpired
} from './sessionManager';

const tokenWithExpiration = (exp) => {
  const encode = value => btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${encode({ alg: 'none' })}.${encode({ exp })}.signature`;
};

afterEach(() => {
  localStorage.clear();
  jest.restoreAllMocks();
});

test('lee exp y detecta un JWT vencido', () => {
  const token = tokenWithExpiration(100);
  expect(getTokenExpiration(token)).toBe(100000);
  expect(isTokenExpired(token, 100001)).toBe(true);
  expect(isTokenExpired(token, 99999)).toBe(false);
});

test('un 401 invalida solo la sesión autenticada y emite el evento global', async () => {
  const token = tokenWithExpiration(9999999999);
  localStorage.setItem('jwt', token);
  localStorage.setItem('user', '{"id":1}');
  global.fetch = jest.fn().mockResolvedValue({ status: 401 });
  const listener = jest.fn();
  window.addEventListener(SESSION_EXPIRED_EVENT, listener);

  await authenticatedFetch('/api/mi-perfil', {}, token);

  expect(localStorage.getItem('jwt')).toBeNull();
  expect(localStorage.getItem('user')).toBeNull();
  expect(listener.mock.calls[0][0].detail.scope).toBe('customer');
  window.removeEventListener(SESSION_EXPIRED_EVENT, listener);
});

test('un 403 no se interpreta como sesión expirada', async () => {
  const token = tokenWithExpiration(9999999999);
  localStorage.setItem('jwt', token);
  global.fetch = jest.fn().mockResolvedValue({ status: 403 });
  const listener = jest.fn();
  window.addEventListener(SESSION_EXPIRED_EVENT, listener);

  await authenticatedFetch('/api/restringida', {}, token);

  expect(localStorage.getItem('jwt')).toBe(token);
  expect(listener).not.toHaveBeenCalled();
  window.removeEventListener(SESSION_EXPIRED_EVENT, listener);
});
