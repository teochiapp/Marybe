import React, { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import './ImportacionAdmin.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:1337';

// ─── Componente principal ──────────────────────────────────────────────────────
export default function ImportacionAdmin() {
  // Auth state
  const [token, setToken]       = useState(() => localStorage.getItem('admin_jwt') || '');
  const [authError, setAuthError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Login form
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  // Upload state
  const [archivo, setArchivo]         = useState(null);
  const [dragging, setDragging]       = useState(false);
  const [uploading, setUploading]     = useState(false);
  const [resultado, setResultado]     = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [progreso, setProgreso]       = useState(0);

  const fileInputRef = useRef(null);

  // ─── Autenticación ───────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setLoginLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/importacion-admin/login`, {
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
    setArchivo(null);
    setResultado(null);
    setUploadError('');
  };

  // ─── Drag & Drop ─────────────────────────────────────────────────────────────
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) validarYSetArchivo(dropped);
  }, []);

  const validarYSetArchivo = (file) => {
    setResultado(null);
    setUploadError('');
    if (!file.name.endsWith('.xlsx')) {
      setUploadError('Solo se aceptan archivos .xlsx (Plantilla_Marybe).');
      return;
    }
    setArchivo(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) validarYSetArchivo(file);
  };

  // ─── Importación ─────────────────────────────────────────────────────────────
  const handleImportar = async () => {
    if (!archivo) return;
    setUploading(true);
    setUploadError('');
    setResultado(null);
    setProgreso(0);

    const formData = new FormData();
    formData.append('archivo', archivo);

    try {
      const res = await axios.post(
        `${API_URL}/api/importacion-admin/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (evt) => {
            if (evt.total) {
              setProgreso(Math.round((evt.loaded / evt.total) * 100));
            }
          },
        }
      );

      setResultado(res.data);
      setArchivo(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || 'Error al importar';
      if (err.response?.status === 401 || err.response?.status === 403) {
        // Token vencido o sin permisos → cerrar sesión
        handleLogout();
        setAuthError(
          err.response?.status === 403
            ? 'Tu usuario no tiene permisos de importación. Contactá al desarrollador.'
            : 'Sesión expirada. Iniciá sesión nuevamente.'
        );
      } else {
        setUploadError(msg);
      }
    } finally {
      setUploading(false);
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
              <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
                <path d="M24 4L44 14V34L24 44L4 34V14L24 4Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M24 12L36 18V30L24 36L12 30V18L24 12Z" fill="currentColor" opacity="0.2"/>
                <path d="M24 20L30 23V29L24 32L18 29V23L24 20Z" fill="currentColor"/>
              </svg>
            </div>
            <h1 className="ia-brand-title">Marybe</h1>
            <p className="ia-brand-sub">Panel de Importación</p>
          </div>

          <form className="ia-login-form" onSubmit={handleLogin} noValidate>
            <div className="ia-field">
              <label htmlFor="admin-email" className="ia-label">Email administrador</label>
              <div className="ia-input-wrap">
                <span className="ia-input-icon" aria-hidden="true">
                  <svg viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg>
                </span>
                <input
                  id="admin-email"
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
              <label htmlFor="admin-password" className="ia-label">Contraseña</label>
              <div className="ia-input-wrap">
                <span className="ia-input-icon" aria-hidden="true">
                  <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a7 7 0 0114 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg>
                </span>
                <input
                  id="admin-password"
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
              id="btn-login-admin"
              type="submit"
              className="ia-btn ia-btn--primary"
              disabled={loginLoading || !email || !password}
            >
              {loginLoading
                ? <><span className="ia-spinner" aria-hidden="true"/> Iniciando sesión...</>
                : 'Iniciar sesión'}
            </button>
          </form>

          <p className="ia-login-hint">
            Acceso restringido · Solo administradores
          </p>
        </div>
      </div>
    );
  }

  // ─── Render: Panel de Importación ────────────────────────────────────────────
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
              <h1 className="ia-panel-title">Panel de Importación</h1>
              <p className="ia-panel-sub">Marybe · Administración de Catálogo</p>
            </div>
          </div>
          <button
            id="btn-logout-admin"
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
            <span>Subí la <code>Plantilla_Marybe.xlsx</code> completada. Los productos nuevos se agregarán y los existentes se actualizarán automáticamente sin borrar nada.</span>
          </div>
        </div>

        {/* Zona de carga */}
        <div
          id="dropzone-excel"
          className={`ia-dropzone ${dragging ? 'ia-dropzone--dragging' : ''} ${archivo ? 'ia-dropzone--has-file' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !archivo && fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Zona de carga de archivo Excel"
          onKeyDown={(e) => e.key === 'Enter' && !archivo && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            id="input-excel"
            type="file"
            accept=".xlsx"
            className="ia-file-input"
            onChange={handleFileChange}
            aria-label="Seleccionar archivo Excel"
          />

          {archivo ? (
            <div className="ia-file-preview">
              <div className="ia-file-icon" aria-hidden="true">
                <svg viewBox="0 0 48 48" fill="none">
                  <rect x="8" y="4" width="32" height="40" rx="4" fill="currentColor" opacity="0.15"/>
                  <rect x="8" y="4" width="32" height="40" rx="4" stroke="currentColor" strokeWidth="2"/>
                  <path d="M16 16h8M16 22h16M16 28h12M16 34h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M30 4v10h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="ia-file-info">
                <span className="ia-file-name">{archivo.name}</span>
                <span className="ia-file-size">{(archivo.size / 1024).toFixed(1)} KB</span>
              </div>
              <button
                id="btn-quitar-archivo"
                type="button"
                className="ia-btn-remove"
                onClick={(e) => { e.stopPropagation(); setArchivo(null); setUploadError(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                aria-label="Quitar archivo"
              >
                <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
              </button>
            </div>
          ) : (
            <div className="ia-dropzone-prompt">
              <div className="ia-drop-icon" aria-hidden="true">
                <svg viewBox="0 0 64 64" fill="none">
                  <path d="M32 8v32M20 28l12-20 12 20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 44v8a4 4 0 004 4h32a4 4 0 004-4v-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="ia-drop-title">
                {dragging ? '¡Soltá el archivo acá!' : 'Arrastrá tu Excel o hacé clic'}
              </p>
              <p className="ia-drop-sub">Solo archivos <strong>.xlsx</strong> · Plantilla_Marybe</p>
            </div>
          )}
        </div>

        {/* Barra de progreso */}
        {uploading && (
          <div className="ia-progress-wrap" role="status" aria-label="Subiendo archivo">
            <div className="ia-progress-label">
              <span>Procesando importación...</span>
              <span>{progreso}%</span>
            </div>
            <div className="ia-progress-bar">
              <div className="ia-progress-fill" style={{ width: `${progreso}%` }} />
            </div>
          </div>
        )}

        {/* Error de upload */}
        {uploadError && (
          <div className="ia-alert ia-alert--error" role="alert">
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
            {uploadError}
          </div>
        )}

        {/* Resultado */}
        {resultado && (
          <div className="ia-resultado" role="status">
            <div className="ia-resultado-header">
              <svg className="ia-resultado-icon ia-resultado-icon--ok" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
              <h2 className="ia-resultado-title">¡Importación exitosa!</h2>
            </div>

            <div className="ia-stats-grid">
              <div className="ia-stat">
                <span className="ia-stat-value">{resultado.datos?.totalProductos ?? '—'}</span>
                <span className="ia-stat-label">Total en Excel</span>
              </div>
              <div className="ia-stat ia-stat--success">
                <span className="ia-stat-value">{resultado.datos?.creados ?? '—'}</span>
                <span className="ia-stat-label">✅ Nuevos creados</span>
              </div>
              <div className="ia-stat ia-stat--info">
                <span className="ia-stat-value">{resultado.datos?.actualizados ?? '—'}</span>
                <span className="ia-stat-label">🔄 Actualizados</span>
              </div>
              <div className="ia-stat ia-stat--danger">
                <span className="ia-stat-value">{resultado.datos?.errores ?? '—'}</span>
                <span className="ia-stat-label">❌ Con error</span>
              </div>
            </div>

            <p className="ia-resultado-time">
              Tiempo total: <strong>{resultado.datos?.tiempoSegundos}s</strong>
            </p>

            {resultado.datos?.erroresList?.length > 0 && (
              <details className="ia-errores">
                <summary className="ia-errores-summary">Ver errores ({resultado.datos.erroresList.length})</summary>
                <ul className="ia-errores-list">
                  {resultado.datos.erroresList.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}

        {/* Botón principal */}
        <button
          id="btn-importar-excel"
          type="button"
          className="ia-btn ia-btn--primary ia-btn--full"
          onClick={handleImportar}
          disabled={!archivo || uploading}
        >
          {uploading
            ? <><span className="ia-spinner" aria-hidden="true"/> Importando productos...</>
            : <>
                <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                Importar Productos al Catálogo
              </>
          }
        </button>
      </div>
    </div>
  );
}
