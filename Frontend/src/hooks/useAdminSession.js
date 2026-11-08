import { useState, useEffect, useCallback } from 'react';
import { SESSION_EXPIRED_EVENT, clearCredentials, isTokenExpired } from '../utils/sessionManager';

const ADMIN_TOKEN_KEY = 'admin_jwt';

const readStoredToken = () => {
  const stored = localStorage.getItem(ADMIN_TOKEN_KEY) || '';
  if (stored && isTokenExpired(stored)) {
    clearCredentials('admin');
    return '';
  }
  return stored;
};

// Sesión administrativa compartida con los paneles existentes (/banners-admin, /pedidos-admin…):
// mismo JWT en localStorage.admin_jwt, emitido por /api/importacion-admin/login.
export default function useAdminSession() {
  const [token, setToken] = useState(readStoredToken);

  const sync = useCallback(() => setToken(readStoredToken()), []);

  const signIn = useCallback((jwt) => {
    localStorage.setItem(ADMIN_TOKEN_KEY, jwt);
    setToken(jwt);
  }, []);

  const signOut = useCallback(() => {
    clearCredentials('admin');
    setToken('');
  }, []);

  useEffect(() => {
    const handleExpired = ({ detail }) => { if (detail?.scope === 'admin') setToken(''); };
    const handleStorage = (event) => { if (event.key === null || event.key === ADMIN_TOKEN_KEY) sync(); };
    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpired);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpired);
      window.removeEventListener('storage', handleStorage);
    };
  }, [sync]);

  return { token, isAuthenticated: Boolean(token), signIn, signOut, sync };
}
