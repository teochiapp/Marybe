import React, { useEffect, useContext, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export default function AuthRedirect() {
  const { login, authRedirect, clearAuthRedirect } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const called = useRef(false);
  const [status, setStatus] = useState('Iniciando sesión con Google...');

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    if (location.search) {
      const apiUrl = process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337';
      const fullUrl = `${apiUrl}/api/auth/google/callback${location.search}`;
      
      fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(async res => {
          const data = await res.json();
          if (res.ok && data.jwt && data.user) {
            login(data.jwt, data.user);
            const target = authRedirect || sessionStorage.getItem('authRedirect');
            clearAuthRedirect();
            if (target) {
              navigate(target);
            } else {
              navigate('/'); // Redirigir al inicio
            }
          } else {
            setStatus('Falló la autenticación con Strapi. Por favor, intenta de nuevo.');
          }
        })
        .catch(() => {
          setStatus('Error de red al conectar con el servidor.');
        });
    } else {
      setStatus('Error: No se recibieron datos de autenticación.');
    }
  }, [location.search, login, navigate, authRedirect, clearAuthRedirect]);

  return (
    <div style={{ padding: '60px 40px', maxWidth: '500px', margin: '120px auto', textAlign: 'center', fontFamily: 'var(--font-family-secondary, sans-serif)', backgroundColor: '#ffffff', border: '1px solid #eee', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid #f0f0f0', borderTop: '3px solid #2b0b0a', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 24px' }} />
      <h2 style={{ color: '#2b0b0a', fontSize: '1.4rem', fontWeight: '600', marginBottom: '12px' }}>Autenticación en proceso</h2>
      <p style={{ fontSize: '1rem', color: '#666' }}>{status}</p>
    </div>
  );
}
