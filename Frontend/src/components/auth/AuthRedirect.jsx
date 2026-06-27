import React, { useEffect, useContext, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export default function AuthRedirect() {
  const { login, authRedirect, clearAuthRedirect } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const called = useRef(false);

  // Estados para diagnóstico en pantalla
  const [status, setStatus] = useState('Autenticando con Google...');
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    console.log("🟢 [Google Auth Debug] Componente AuthRedirect montado.");
    console.log("🟢 [Google Auth Debug] location.search recibido:", location.search);

    if (location.search) {
      const apiUrl = process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337';
      const fullUrl = `${apiUrl}/api/auth/google/callback${location.search}`;
      
      console.log("🟢 [Google Auth Debug] URL de Strapi a consultar:", fullUrl);
      setStatus(`Llamando a Strapi en: ${apiUrl}/api/auth/google/callback...`);

      fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(async res => {
          console.log("🟢 [Google Auth Debug] Estado de la respuesta HTTP de Strapi:", res.status, res.statusText);
          const data = await res.json();
          console.log("🟢 [Google Auth Debug] Payload devuelto por Strapi:", data);

          if (res.ok && data.jwt && data.user) {
            console.log("🟢 [Google Auth Debug] Autenticación exitosa. Redirigiendo...");
            setStatus('¡Autenticación exitosa! Redirigiendo...');
            login(data.jwt, data.user);
            if (authRedirect) {
              const target = authRedirect;
              clearAuthRedirect();
              navigate(target);
            } else {
              navigate('/'); // Redirigir al inicio
            }
          } else {
            console.error("🔴 [Google Auth Debug] Error en la validación de Strapi:", data);
            setStatus('Falló la autenticación con Strapi.');
            setDebugInfo({
              httpStatus: res.status,
              httpStatusText: res.statusText,
              apiUrl,
              searchParams: location.search,
              responseData: data,
            });
          }
        })
        .catch(err => {
          console.error("🔴 [Google Auth Debug] Error de red o fetch al contactar a Strapi:", err);
          setStatus('Error de red al conectar con Strapi.');
          setDebugInfo({
            errorMessage: err.message,
            stack: err.stack,
            apiUrl,
            searchParams: location.search,
          });
        });
    } else {
      console.warn("🟡 [Google Auth Debug] No se encontraron parámetros (location.search vacío).");
      setStatus('Error: No se recibió ningún token o parámetro de Google.');
      setDebugInfo({
        errorMessage: 'location.search está vacío. Google no envió tokens o la redirección falló antes de llegar aquí.',
        currentHref: window.location.href,
      });
    }
  }, [location.search, login, navigate, authRedirect, clearAuthRedirect]);

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '100px auto', fontFamily: 'var(--font-family-secondary, sans-serif)', backgroundColor: '#fffafb', border: '1px solid #ddd', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
      <h2 style={{ color: '#2b0b0a', marginBottom: '20px' }}>Diagnóstico de Google Auth</h2>
      <p style={{ fontSize: '1.1rem', fontWeight: '600', color: debugInfo ? '#b91c1c' : '#333' }}>{status}</p>

      {debugInfo && (
        <div style={{ marginTop: '30px', backgroundColor: '#1a1a1a', color: '#00ffcc', padding: '20px', borderRadius: '8px', overflowX: 'auto', fontSize: '0.9rem', fontFamily: 'monospace' }}>
          <h4 style={{ color: '#ff5555', marginTop: 0, marginBottom: '10px', fontSize: '1rem' }}>Detalles técnicos del error (Captura o copia esto):</h4>
          <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          <div style={{ marginTop: '20px' }}>
            <button onClick={() => navigate('/login')} style={{ padding: '10px 20px', backgroundColor: '#2b0b0a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              Volver al Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
