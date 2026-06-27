import React, { useEffect, useContext, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export default function AuthRedirect() {
  const { login, authRedirect, clearAuthRedirect } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    if (location.search) {
      const apiUrl = process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337';

      // Llamamos al endpoint oficial de Strapi que procesa el access_token de Google
      // y nos devuelve el JWT y el User de Strapi
      fetch(`${apiUrl}/api/auth/google/callback${location.search}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(res => res.json())
        .then(data => {
          if (data.jwt && data.user) {
            login(data.jwt, data.user);
            if (authRedirect) {
              const target = authRedirect;
              clearAuthRedirect();
              navigate(target);
            } else {
              navigate('/'); // Redirigir al inicio
            }
          } else {
            console.error("Error en respuesta de Strapi:", data);
            navigate('/login?error=auth_failed');
          }
        })
        .catch(err => {
          console.error("Error autenticando con Strapi:", err);
          navigate('/login?error=auth_failed');
        });
    } else {
      navigate('/login?error=no_token');
    }
  }, [location.search, login, navigate, authRedirect, clearAuthRedirect]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'var(--font-family-secondary)' }}>
      <h2>Autenticando con Google...</h2>
    </div>
  );
}
