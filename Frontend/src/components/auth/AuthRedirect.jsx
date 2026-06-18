import React, { useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export default function AuthRedirect() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Strapi manda el token en la URL, ej: ?access_token=...
    const params = new URLSearchParams(location.search);
    const token = params.get('access_token');

    if (token) {
      // Si recibimos el token, necesitamos hacer una llamada a Strapi para obtener 
      // los detalles del usuario, o simplemente guardar el token.
      // Strapi devuelve el JWT, pero normalmente necesitamos el objeto User.
      // Strapi's auth/google/callback no siempre nos da el objeto User directo en el query
      // Por convención, validaremos el token:
      fetch(`${process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337'}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(user => {
        if (user && user.id) {
          login(token, user);
          navigate('/'); // Redirigir al inicio o a donde estaba
        } else {
          navigate('/login?error=auth_failed');
        }
      })
      .catch(err => {
        console.error("Error validando token de Google:", err);
        navigate('/login?error=auth_failed');
      });
    } else {
      navigate('/login?error=no_token');
    }
  }, [location, login, navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'var(--font-family-secondary)' }}>
      <h2>Autenticando con Google...</h2>
    </div>
  );
}
