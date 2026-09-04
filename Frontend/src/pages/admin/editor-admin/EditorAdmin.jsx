import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import './EditorAdmin.css';
import '../ImportacionAdmin.css';
import ProveedorSelector from './components/ProveedorSelector';
import ProductosTable    from './components/ProductosTable';
import SKUSearchBar      from './components/SKUSearchBar';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:1337';

// ─── LoginForm (inline para no crear un archivo extra trivial) ─────────────────
function LoginForm({ onLogin }) {
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/editor-admin/login`, { identifier: email, password });
      const jwt = res.data?.jwt;
      if (!jwt) throw new Error('Respuesta inesperada del servidor.');
      localStorage.setItem('admin_jwt', jwt);
      onLogin(jwt);
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || 'Error de conexión';
      setError(msg === 'Invalid identifier or password' ? 'Email o contraseña incorrectos.' : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ia-wrapper">
      <div className="ia-bg-particles">
        {[...Array(12)].map((_, i) => <div key={i} className={`ia-particle ia-particle--${i + 1}`} />)}
      </div>

      <div className="ia-login-card">
        <div className="ia-login-brand">
          <div className="ia-brand-icon">
            <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
              <path d="M24 4L44 14V34L24 44L4 34V14L24 4Z" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M24 12L36 18V30L24 36L12 30V18L24 12Z" fill="currentColor" opacity="0.2" />
              <path d="M24 20L30 23V29L24 32L18 29V23L24 20Z" fill="currentColor" />
            </svg>
          </div>
          <h1 className="ia-brand-title">Marybe</h1>
          <p className="ia-brand-sub">Panel de Edición Rápida</p>
        </div>

        <form className="ia-login-form" onSubmit={handleSubmit} noValidate>
          <div className="ia-field">
            <label htmlFor="ea-email" className="ia-label">Email administrador</label>
            <div className="ia-input-wrap">
              <span className="ia-input-icon" aria-hidden="true">
                <svg viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
              </span>
              <input
                id="ea-email"
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
            <label htmlFor="ea-password" className="ia-label">Contraseña</label>
            <div className="ia-input-wrap">
              <span className="ia-input-icon" aria-hidden="true">
                <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a7 7 0 0114 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
              </span>
              <input
                id="ea-password"
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
                  ? <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                  : <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" /><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z" /></svg>
                }
              </button>
            </div>
          </div>

          {error && (
            <div className="ia-alert ia-alert--error" role="alert">
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              {error}
            </div>
          )}

          <button
            id="btn-login-editor"
            type="submit"
            className="ia-btn ia-btn--primary"
            disabled={loading || !email || !password}
          >
            {loading ? <><span className="ia-spinner" aria-hidden="true" /> Iniciando sesión...</> : 'Iniciar sesión'}
          </button>
        </form>

        <p className="ia-login-hint">Acceso restringido · Solo administradores</p>
      </div>
    </div>
  );
}

// ─── Componente Principal ──────────────────────────────────────────────────────
export default function EditorAdmin() {
  const [token, setToken]             = useState(() => localStorage.getItem('admin_jwt') || '');

  // Proveedores
  const [proveedores, setProveedores]   = useState([]);
  const [loadingProv, setLoadingProv]   = useState(false);
  const [errorProv, setErrorProv]       = useState('');

  // Proveedor seleccionado y productos
  const [proveedor, setProveedor]       = useState('');
  const [productos, setProductos]       = useState([]);
  const [loadingProd, setLoadingProd]   = useState(false);
  const [errorProd, setErrorProd]       = useState('');

  // Cambios pendientes: { [documentId]: { campo: valor, ... } }
  const [pendingChanges, setPendingChanges] = useState({});

  // Estado de guardado global
  const [saving, setSaving]             = useState(false);
  const [saveResult, setSaveResult]     = useState(null); // { ok, saved, errors }

  // Lightbox
  const [lightboxUrl, setLightboxUrl]   = useState(null);

  const saveResultTimer = useRef(null);

  // ── Cargar proveedores al autenticar ─────────────────────────────────────
  const cargarProveedores = useCallback(async (jwt) => {
    setLoadingProv(true);
    setErrorProv('');
    try {
      const res = await axios.get(`${API_URL}/api/editor-admin/proveedores`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setProveedores(res.data?.proveedores || []);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleLogout();
      } else {
        setErrorProv('No se pudo cargar la lista de proveedores.');
      }
    } finally {
      setLoadingProv(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (token) cargarProveedores(token);
  }, [token, cargarProveedores]);

  // ── Cargar productos al seleccionar proveedor ────────────────────────────
  useEffect(() => {
    if (!proveedor || !token) return;
    const cargar = async () => {
      setLoadingProd(true);
      setErrorProd('');
      setProductos([]);
      setPendingChanges({});
      setSaveResult(null);
      try {
        const res = await axios.get(`${API_URL}/api/editor-admin/productos`, {
          headers: { Authorization: `Bearer ${token}` },
          params:  { proveedor },
        });
        setProductos(res.data?.productos || []);
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          handleLogout();
        } else {
          setErrorProd('Error al cargar los productos. Intentá de nuevo.');
        }
      } finally {
        setLoadingProd(false);
      }
    };
    cargar();
  }, [proveedor, token]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Acumular cambios pendientes ───────────────────────────────────────────
  const handleMarkDirty = useCallback((documentId, campo, valor) => {
    setPendingChanges(prev => ({
      ...prev,
      [documentId]: { ...(prev[documentId] || {}), [campo]: valor },
    }));
    setSaveResult(null);
  }, []);

  // ── Contar cambios ────────────────────────────────────────────────────────
  const cantidadConCambios = Object.keys(pendingChanges).length;

  // ── Guardar todos los cambios ─────────────────────────────────────────────
  const handleGuardarTodo = async () => {
    if (!cantidadConCambios) return;
    setSaving(true);
    setSaveResult(null);

    const entries = Object.entries(pendingChanges);
    let saved     = 0;
    const errors  = [];

    await Promise.all(
      entries.map(async ([documentId, cambios]) => {
        try {
          await axios.patch(
            `${API_URL}/api/editor-admin/productos/${documentId}`,
            cambios,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          saved++;
        } catch (err) {
          const nombre = productos.find(p => p.documentId === documentId)?.nombre || documentId;
          errors.push({ nombre, msg: err.response?.data?.error?.message || err.message });
        }
      })
    );

    // Limpiar pendingChanges de los que se guardaron exitosamente
    if (errors.length < entries.length) {
      const errorIds = new Set(errors.map(e => e.documentId));
      
      // Actualizar el estado local de productos con los cambios guardados exitosamente
      setProductos(prevProductos => 
        prevProductos.map(prod => {
          if (pendingChanges[prod.documentId] && !errorIds.has(prod.documentId)) {
            return { ...prod, ...pendingChanges[prod.documentId] };
          }
          return prod;
        })
      );

      setPendingChanges(prev => {
        const next = { ...prev };
        entries.forEach(([id]) => { if (!errorIds.has(id)) delete next[id]; });
        return next;
      });
    }

    setSaving(false);
    setSaveResult({ ok: errors.length === 0, saved, errors });

    // Auto-dismiss del banner de éxito total
    if (errors.length === 0) {
      clearTimeout(saveResultTimer.current);
      saveResultTimer.current = setTimeout(() => setSaveResult(null), 4000);
    }
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem('admin_jwt');
    setToken('');
    setProveedores([]);
    setProveedor('');
    setProductos([]);
    setPendingChanges({});
    setSaveResult(null);
  };

  // ── Login ─────────────────────────────────────────────────────────────────
  if (!token) return <LoginForm onLogin={setToken} />;

  // ── Render principal ──────────────────────────────────────────────────────
  return (
    <>
      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="ea-lightbox-backdrop"
          onClick={() => setLightboxUrl(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Imagen ampliada"
        >
          <img src={lightboxUrl} alt="Ampliada" className="ea-lightbox-img" onClick={e => e.stopPropagation()} />
          <button className="ea-lightbox-close" onClick={() => setLightboxUrl(null)} aria-label="Cerrar">✕</button>
        </div>
      )}

      <div className="ea-wrapper">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <header className="ea-header">
          <div className="ea-header-brand">
            <svg className="ea-header-icon" viewBox="0 0 48 48" fill="none" aria-hidden="true">
              <path d="M24 4L44 14V34L24 44L4 34V14L24 4Z" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M24 20L30 23V29L24 32L18 29V23L24 20Z" fill="currentColor" />
            </svg>
            <div className="ea-header-titles">
              <h1>Panel de Edición Rápida</h1>
              <p>Marybe · Administración de Catálogo</p>
            </div>
          </div>

          <div className="ea-header-actions">
            {/* Badge de cambios pendientes */}
            {cantidadConCambios > 0 && (
              <span className="ea-pending-badge">
                <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                {cantidadConCambios} {cantidadConCambios === 1 ? 'producto con cambios' : 'productos con cambios'}
              </span>
            )}

            {/* Botón guardar global */}
            <button
              id="btn-guardar-editor"
              className="ea-btn ea-btn--success"
              onClick={handleGuardarTodo}
              disabled={saving || cantidadConCambios === 0}
            >
              {saving
                ? <><span className="ea-spinner" /> Guardando...</>
                : (
                  <>
                    <svg viewBox="0 0 20 20" fill="currentColor"><path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293z"/></svg>
                    Guardar todos los cambios
                  </>
                )
              }
            </button>

            {/* Logout */}
            <button className="ea-btn ea-btn--ghost" onClick={handleLogout}>
              <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>
              Cerrar sesión
            </button>
          </div>
        </header>

        {/* ── Cuerpo ────────────────────────────────────────────────────────── */}
        <main className="ea-body">
          {/* Buscador universal de SKU / EAN */}
          <SKUSearchBar
            token={token}
            pendingChanges={pendingChanges}
            onMarkDirty={handleMarkDirty}
            lightboxSetter={setLightboxUrl}
          />

          {/* Selector de proveedor */}
          <ProveedorSelector
            proveedores={proveedores}
            seleccionado={proveedor}
            onChange={setProveedor}
            cargando={loadingProv}
            error={errorProv}
          />

          {/* Resultado del guardado */}
          {saveResult && (
            <div className={`ea-alert ${saveResult.ok ? 'ea-alert--success' : 'ea-alert--error'}`} role="status">
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                {saveResult.ok
                  ? <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  : <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                }
              </svg>
              <span>
                {saveResult.ok
                  ? `✅ ${saveResult.saved} producto${saveResult.saved !== 1 ? 's' : ''} guardado${saveResult.saved !== 1 ? 's' : ''} correctamente.`
                  : (
                    <>
                      {saveResult.saved > 0 && `✅ ${saveResult.saved} guardados. `}
                      {`❌ ${saveResult.errors.length} error${saveResult.errors.length !== 1 ? 'es' : ''}: `}
                      {saveResult.errors.map(e => e.nombre).join(', ')}
                    </>
                  )
                }
              </span>
            </div>
          )}

          {/* Error de carga de productos */}
          {errorProd && (
            <div className="ea-alert ea-alert--error" role="alert">
              <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              {errorProd}
            </div>
          )}

          {/* Placeholder antes de elegir proveedor */}
          {!proveedor && !loadingProv && (
            <div className="ea-empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <p>Seleccioná un proveedor para cargar sus productos.</p>
            </div>
          )}

          {/* Tabla */}
          {proveedor && (
            <ProductosTable
              productos={productos}
              token={token}
              pendingChanges={pendingChanges}
              onMarkDirty={handleMarkDirty}
              lightboxSetter={setLightboxUrl}
              cargando={loadingProd}
            />
          )}

          {/* Resumen de productos cargados */}
          {proveedor && !loadingProd && productos.length > 0 && (
            <p style={{ fontSize: '0.75rem', color: 'rgba(242,220,143,0.35)', textAlign: 'right', margin: 0 }}>
              {productos.length} producto{productos.length !== 1 ? 's' : ''} · {proveedor}
            </p>
          )}
        </main>
      </div>
    </>
  );
}
