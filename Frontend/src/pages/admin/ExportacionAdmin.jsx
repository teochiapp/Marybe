import React, { useState } from 'react';
import axios from 'axios';
import './ImportacionAdmin.css'; // Reutiliza el mismo CSS

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:1337';

// ─── Componente principal ──────────────────────────────────────────────────────
export default function ExportacionAdmin() {
  // Auth state
  const [token, setToken]         = useState(() => localStorage.getItem('admin_jwt') || '');
  const [authError, setAuthError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Login form
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  // Export state
  const [exporting, setExporting]   = useState(false);
  const [exportError, setExportError] = useState('');
  const [exportOk, setExportOk]     = useState(null); // { totalProductos, totalVariantes, filename }

  // ─── Autenticación ───────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setLoginLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/exportacion-admin/login`, {
        identifier: email,
        password,
      });

      const jwt = res.data?.jwt;
      if (!jwt) throw new Error('Respuesta inesperada del servidor.');

      localStorage.setItem('admin_jwt', jwt);
      setToken(jwt);
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || 'Error de conexión';
      setAuthError(msg === 'Invalid identifier or password'
        ? 'Email o contraseña incorrectos.'
        : msg);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_jwt');
    setToken('');
    setExportError('');
    setExportOk(null);
  };

  // ─── Exportación ─────────────────────────────────────────────────────────────
  const handleExportar = async () => {
    setExporting(true);
    setExportError('');
    setExportOk(null);

    try {
      const res = await axios.get(`${API_URL}/api/exportacion-admin/exportar`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob', // ← recibir como binario
      });

      // Extraer nombre del archivo del header Content-Disposition
      const disposition = res.headers['content-disposition'] || '';
      const match = disposition.match(/filename="?([^"]+)"?/);
      const fecha = new Date().toISOString().slice(0, 10);
      const filename = match ? match[1] : `Exportacion_Marybe_${fecha}.xlsx`;

      // Totales desde headers custom
      const totalProductos = parseInt(res.headers['x-total-productos'] || '0');
      const totalVariantes = parseInt(res.headers['x-total-variantes'] || '0');

      // Forzar descarga en el navegador
      const url  = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href  = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setExportOk({ totalProductos, totalVariantes, filename });
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleLogout();
        setAuthError('Sesión expirada. Iniciá sesión nuevamente.');
      } else {
        const msg = err.response?.data?.error?.message || err.message || 'Error al exportar';
        setExportError(msg);
      }
    } finally {
      setExporting(false);
    }
  };

  // ─── Render: Login ────────────────────────────────────────────────────────────
  if (!token) {
    return (
      <div className="ia-wrapper">
        {/* Partículas de fondo */}
        <div className="ia-bg-particles">
          {[...Array(12)].map((_, i) => (
            <div key={i} className={`ia-particle ia-particle--${i + 1}`} />
          ))}
        </div>

        <div className="ia-login-card">
          <div className="ia-login-brand">
            <div className="ia-brand-icon">
              {/* Ícono de descarga */}
              <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
                <path d="M24 4L44 14V34L24 44L4 34V14L24 4Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M24 12L36 18V30L24 36L12 30V18L24 12Z" fill="currentColor" opacity="0.2"/>
                <path d="M24 20L30 23V29L24 32L18 29V23L24 20Z" fill="currentColor"/>
              </svg>
            </div>
            <h1 className="ia-brand-title">Marybe</h1>
            <p className="ia-brand-sub">Panel de Exportación</p>
          </div>

          <form className="ia-login-form" onSubmit={handleLogin} noValidate>
            <div className="ia-field">
              <label htmlFor="export-email" className="ia-label">Email administrador</label>
              <div className="ia-input-wrap">
                <span className="ia-input-icon" aria-hidden="true">
                  <svg viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg>
                </span>
                <input
                  id="export-email"
                  type="email"
                  className="ia-input"
                  placeholder="admin@marybe.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="ia-field">
              <label htmlFor="export-password" className="ia-label">Contraseña</label>
              <div className="ia-input-wrap">
                <span className="ia-input-icon" aria-hidden="true">
                  <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a7 7 0 0114 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg>
                </span>
                <input
                  id="export-password"
                  type={showPass ? 'text' : 'password'}
                  className="ia-input"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="ia-show-pass"
                  onClick={() => setShowPass(p => !p)}
                  aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPass
                    ? <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/></svg>
                    : <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd"/><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/></svg>
                  }
                </button>
              </div>
            </div>

            {authError && (
              <div className="ia-alert ia-alert--error" role="alert">
                <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                {authError}
              </div>
            )}

            <button
              id="btn-login-export"
              type="submit"
              className="ia-btn ia-btn--primary"
              disabled={loginLoading || !email || !password}
            >
              {loginLoading
                ? <><span className="ia-spinner" aria-hidden="true"/> Iniciando sesión...</>
                : 'Iniciar sesión'}
            </button>
          </form>

          <p className="ia-login-hint">Acceso restringido · Solo administradores</p>
        </div>
      </div>
    );
  }

  // ─── Render: Panel de Exportación ────────────────────────────────────────────
  return (
    <div className="ia-wrapper">
      <div className="ia-bg-particles">
        {[...Array(12)].map((_, i) => (
          <div key={i} className={`ia-particle ia-particle--${i + 1}`} />
        ))}
      </div>

      <div className="ia-panel">
        {/* Header */}
        <header className="ia-panel-header">
          <div className="ia-panel-brand">
            <div className="ia-brand-icon ia-brand-icon--sm">
              <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
                <path d="M24 4L44 14V34L24 44L4 34V14L24 4Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M24 20L30 23V29L24 32L18 29V23L24 20Z" fill="currentColor"/>
              </svg>
            </div>
            <div>
              <h1 className="ia-panel-title">Panel de Exportación</h1>
              <p className="ia-panel-sub">Marybe · Administración de Catálogo</p>
            </div>
          </div>
          <button
            id="btn-logout-export"
            className="ia-btn ia-btn--ghost"
            onClick={handleLogout}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/></svg>
            Cerrar sesión
          </button>
        </header>

        {/* Info card */}
        <div className="ia-info-card">
          <div className="ia-info-icon" aria-hidden="true">
            <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg>
          </div>
          <div className="ia-info-text">
            <strong>¿Cómo funciona?</strong>
            <span>
              Hacé clic en <strong>"Exportar Catálogo"</strong> para descargar todos los productos actuales
              en formato <code>.xlsx</code> compatible con la Plantilla de Importación Marybe.
              El archivo refleja el estado actual del catálogo, incluyendo productos editados desde el panel de Strapi.
            </span>
          </div>
        </div>

        {/* Estado de la exportación */}
        {exporting && (
          <div className="ia-progress-wrap" role="status" aria-label="Generando exportación">
            <div className="ia-progress-label">
              <span>Generando Excel con todos los productos...</span>
              <span className="ia-spinner" aria-hidden="true" style={{ display: 'inline-block' }} />
            </div>
            <div className="ia-progress-bar">
              <div className="ia-progress-fill" style={{ width: '100%', animation: 'pulse 1.5s ease-in-out infinite' }} />
            </div>
          </div>
        )}

        {/* Error */}
        {exportError && (
          <div className="ia-alert ia-alert--error" role="alert">
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
            {exportError}
          </div>
        )}

        {/* Resultado exitoso */}
        {exportOk && (
          <div className="ia-resultado" role="status">
            <div className="ia-resultado-header">
              <svg className="ia-resultado-icon ia-resultado-icon--ok" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
              <h2 className="ia-resultado-title">¡Exportación completada!</h2>
            </div>

            <div className="ia-stats-grid">
              <div className="ia-stat ia-stat--success">
                <span className="ia-stat-value">{exportOk.totalProductos}</span>
                <span className="ia-stat-label">📦 Productos exportados</span>
              </div>
              <div className="ia-stat ia-stat--info">
                <span className="ia-stat-value">{exportOk.totalVariantes}</span>
                <span className="ia-stat-label">🔗 Variantes exportadas</span>
              </div>
            </div>

            <p className="ia-resultado-time">
              Archivo descargado: <strong>{exportOk.filename}</strong>
            </p>
          </div>
        )}

        {/* Botón principal */}
        <button
          id="btn-exportar-excel"
          type="button"
          className="ia-btn ia-btn--primary ia-btn--full"
          onClick={handleExportar}
          disabled={exporting}
        >
          {exporting
            ? <><span className="ia-spinner" aria-hidden="true"/> Generando exportación...</>
            : <>
                <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
                Exportar Catálogo a Excel
              </>
          }
        </button>
      </div>
    </div>
  );
}
