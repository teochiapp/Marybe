import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './ImportacionAdmin.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:1337';

export default function ExportacionProveedoresAdmin() {
  // Auth
  const [token, setToken]               = useState(() => localStorage.getItem('admin_jwt') || '');
  const [authError, setAuthError]       = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Login form
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  // Proveedores
  const [proveedores, setProveedores]                 = useState([]);
  const [seleccionados, setSeleccionados]             = useState(new Set());
  const [cargandoProveedores, setCargandoProveedores] = useState(false);
  const [errorProveedores, setErrorProveedores]       = useState('');

  // Export
  const [exporting, setExporting]     = useState(false);
  const [exportError, setExportError] = useState('');
  const [exportOk, setExportOk]       = useState(null);
  const [vistaBorrado, setVistaBorrado] = useState(null);
  const [productosSeleccionados, setProductosSeleccionados] = useState(new Set());
  const [busquedaBorrado, setBusquedaBorrado] = useState('');
  const [confirmandoBorrado, setConfirmandoBorrado] = useState(false);
  const [confirmacionBorrado, setConfirmacionBorrado] = useState('');
  const [cargandoBorrado, setCargandoBorrado] = useState(false);
  const [errorBorrado, setErrorBorrado] = useState('');
  const [resultadoBorrado, setResultadoBorrado] = useState(null);

  // ─── Cargar proveedores al autenticarse ─────────────────────────────────────
  const cargarProveedores = useCallback(async (jwt) => {
    setCargandoProveedores(true);
    setErrorProveedores('');
    try {
      const res = await axios.get(`${API_URL}/api/exportacion-proveedores-admin/proveedores`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setProveedores(res.data?.proveedores || []);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleLogout();
        setAuthError('Sesión expirada. Iniciá sesión nuevamente.');
      } else {
        setErrorProveedores('No se pudo cargar la lista de proveedores. Recargá la página.');
      }
    } finally {
      setCargandoProveedores(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (token) cargarProveedores(token);
  }, [token, cargarProveedores]);

  // ─── Auth ────────────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setLoginLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/exportacion-proveedores-admin/login`, {
        identifier: email,
        password,
      });
      const jwt = res.data?.jwt;
      if (!jwt) throw new Error('Respuesta inesperada del servidor.');
      localStorage.setItem('admin_jwt', jwt);
      setToken(jwt);
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || 'Error de conexión';
      setAuthError(msg === 'Invalid identifier or password' ? 'Email o contraseña incorrectos.' : msg);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_jwt');
    setToken('');
    setProveedores([]);
    setSeleccionados(new Set());
    setExportError('');
    setExportOk(null);
    setVistaBorrado(null);
    setProductosSeleccionados(new Set());
    setBusquedaBorrado('');
    setConfirmandoBorrado(false);
    setConfirmacionBorrado('');
    setResultadoBorrado(null);
    setErrorBorrado('');
  };

  // ─── Selección ───────────────────────────────────────────────────────────────
  const toggleProveedor = (nombre) => {
    setSeleccionados(prev => {
      const next = new Set(prev);
      next.has(nombre) ? next.delete(nombre) : next.add(nombre);
      return next;
    });
    setExportOk(null);
    setExportError('');
    setVistaBorrado(null);
    setResultadoBorrado(null);
    setErrorBorrado('');
  };

  const seleccionarTodos = () => { setSeleccionados(new Set(proveedores)); setExportOk(null); setVistaBorrado(null); setResultadoBorrado(null); setErrorBorrado(''); };
  const limpiarSeleccion = () => { setSeleccionados(new Set()); setExportOk(null); setVistaBorrado(null); setResultadoBorrado(null); setErrorBorrado(''); };

  const prepararBorrado = async () => {
    if (seleccionados.size === 0) return;
    setCargandoBorrado(true);
    setErrorBorrado('');
    setResultadoBorrado(null);
    setConfirmacionBorrado('');
    setProductosSeleccionados(new Set());
    setBusquedaBorrado('');
    setConfirmandoBorrado(false);
    try {
      const proveedores = [...seleccionados];
      const res = await axios.post(`${API_URL}/api/exportacion-proveedores-admin/borrado/vista-previa`, { proveedores }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVistaBorrado(res.data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleLogout();
        setAuthError('Sesión expirada. Iniciá sesión nuevamente.');
      } else setErrorBorrado(err.response?.data?.error?.message || 'No se pudo obtener la vista previa.');
    } finally {
      setCargandoBorrado(false);
    }
  };

  const confirmarBorrado = async () => {
    if (!vistaBorrado || !productosSeleccionados.size || confirmacionBorrado !== 'BORRAR') return;
    setCargandoBorrado(true);
    setErrorBorrado('');
    try {
      const res = await axios.post(`${API_URL}/api/exportacion-proveedores-admin/borrado/confirmar`, {
        proveedores: vistaBorrado.proveedores, productos: [...productosSeleccionados], confirmacion: confirmacionBorrado, comprobante: vistaBorrado.comprobante,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setResultadoBorrado(res.data);
      setVistaBorrado(null);
      setConfirmacionBorrado('');
      setProductosSeleccionados(new Set());
      setConfirmandoBorrado(false);
      setSeleccionados(new Set());
      await cargarProveedores(token);
    } catch (err) {
      setVistaBorrado(null);
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleLogout();
        setAuthError('Sesión expirada. Iniciá sesión nuevamente.');
      } else setErrorBorrado(err.response?.data?.error?.message || 'No se pudo completar el borrado. Revisá el catálogo antes de intentar de nuevo.');
    } finally {
      setCargandoBorrado(false);
    }
  };

  const normalizarBusqueda = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().trim();
  const productosFiltrados = (vistaBorrado?.productos || []).filter(p => {
    const term = normalizarBusqueda(busquedaBorrado);
    return !term || [p.nombre, p.sku, p.id_original, ...(p.skuVariantes || [])].some(value => normalizarBusqueda(value).includes(term));
  });
  const productosElegidos = (vistaBorrado?.productos || []).filter(p => productosSeleccionados.has(p.documentId));
  const toggleProductoBorrado = id => setProductosSeleccionados(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  // ─── Exportar ────────────────────────────────────────────────────────────────
  const handleExportar = async () => {
    if (seleccionados.size === 0) return;
    setExporting(true);
    setExportError('');
    setExportOk(null);

    try {
      const queryParam = [...seleccionados].map(p => `proveedores=${encodeURIComponent(p)}`).join('&');
      const res = await axios.get(
        `${API_URL}/api/exportacion-proveedores-admin/exportar?${queryParam}`,
        { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' }
      );

      const disposition    = res.headers['content-disposition'] || '';
      const match          = disposition.match(/filename="?([^"]+)"?/);
      const fecha          = new Date().toISOString().slice(0, 10);
      const filename       = match ? match[1] : `Precios_Proveedores_${fecha}.xlsx`;
      const totalProductos = parseInt(res.headers['x-total-productos'] || '0');
      const totalVariantes = parseInt(res.headers['x-total-variantes'] || '0');

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
        setExportError(err.response?.data?.error?.message || err.message || 'Error al exportar');
      }
    } finally {
      setExporting(false);
    }
  };

  // ─── Render: Login ────────────────────────────────────────────────────────────
  if (!token) {
    return (
      <div className="ia-wrapper">
        <div className="ia-bg-particles">
          {[...Array(12)].map((_, i) => <div key={i} className={`ia-particle ia-particle--${i + 1}`} />)}
        </div>
        <div className="ia-login-card">
          <div className="ia-login-brand">
            <div className="ia-brand-icon">
              <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
                <path d="M24 4L44 14V34L24 44L4 34V14L24 4Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M4 14L24 24L44 14" stroke="currentColor" strokeWidth="2"/>
                <path d="M24 24V44" stroke="currentColor" strokeWidth="2"/>
                <path d="M14 9L34 19" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2"/>
              </svg>
            </div>
            <h1 className="ia-brand-title">Marybe</h1>
            <p className="ia-brand-sub">Precios por Proveedor</p>
          </div>

          <form className="ia-login-form" onSubmit={handleLogin} noValidate>
            <div className="ia-field">
              <label htmlFor="eprov-email" className="ia-label">Email administrador</label>
              <div className="ia-input-wrap">
                <span className="ia-input-icon" aria-hidden="true">
                  <svg viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg>
                </span>
                <input id="eprov-email" type="email" className="ia-input" placeholder="admin@marybe.com"
                  value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
              </div>
            </div>

            <div className="ia-field">
              <label htmlFor="eprov-password" className="ia-label">Contraseña</label>
              <div className="ia-input-wrap">
                <span className="ia-input-icon" aria-hidden="true">
                  <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a7 7 0 0114 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg>
                </span>
                <input id="eprov-password" type={showPass ? 'text' : 'password'} className="ia-input"
                  placeholder="••••••••••••" value={password} onChange={e => setPassword(e.target.value)}
                  required autoComplete="current-password" />
                <button type="button" className="ia-show-pass" onClick={() => setShowPass(p => !p)}
                  aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
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

            <button id="btn-login-exportacion-proveedores" type="submit" className="ia-btn ia-btn--primary"
              disabled={loginLoading || !email || !password}>
              {loginLoading ? <><span className="ia-spinner" aria-hidden="true"/> Iniciando sesión...</> : 'Iniciar sesión'}
            </button>
          </form>
          <p className="ia-login-hint">Acceso restringido · Solo administradores</p>
        </div>
      </div>
    );
  }

  // ─── Render: Panel ────────────────────────────────────────────────────────────
  return (
    <div className="ia-wrapper">
      <div className="ia-bg-particles">
        {[...Array(12)].map((_, i) => <div key={i} className={`ia-particle ia-particle--${i + 1}`} />)}
      </div>

      <div className="ia-panel" style={{ maxWidth: '760px' }}>
        {/* Header */}
        <header className="ia-panel-header">
          <div className="ia-panel-brand">
            <div className="ia-brand-icon ia-brand-icon--sm">
              <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
                <path d="M24 4L44 14V34L24 44L4 34V14L24 4Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M4 14L24 24L44 14" stroke="currentColor" strokeWidth="2"/>
                <path d="M24 24V44" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div>
              <h1 className="ia-panel-title">Precios por Proveedor</h1>
              <p className="ia-panel-sub">Marybe · Exportar precios y stock filtrados por proveedor</p>
            </div>
          </div>
          <button id="btn-logout-exportacion-proveedores" className="ia-btn ia-btn--ghost" onClick={handleLogout}>
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/></svg>
            Cerrar sesión
          </button>
        </header>

        {/* Info */}
        <div className="ia-info-card">
          <div className="ia-info-icon" aria-hidden="true">
            <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg>
          </div>
          <div className="ia-info-text">
            <strong>¿Cómo funciona?</strong>
            <span>
              Seleccioná uno o más proveedores y hacé clic en <strong>"Exportar"</strong>.
              El Excel incluye la hoja de precios con variantes indentadas (↳) y la hoja <strong>🔗 Variantes</strong>{' '}
              agrupada por producto para editar atributos (Volumen, Color, Envío, Stock, Precios) o agregar nuevas variantes. Para dar de alta un producto, agregá una fila con ID único, nombre y proveedor seleccionado; cargá sus variantes en la hoja Variantes.
            </span>
          </div>
        </div>

        {/* Selector de proveedores */}
        <div className="ia-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span className="ia-label" style={{ fontSize: '14px', fontWeight: 600 }}>
              Seleccionar proveedores
              {proveedores.length > 0 && (
                <span style={{ marginLeft: '8px', fontWeight: 400, opacity: 0.65 }}>
                  ({seleccionados.size} de {proveedores.length} seleccionados)
                </span>
              )}
            </span>
            {proveedores.length > 0 && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button id="btn-seleccionar-todos" type="button" className="ia-btn ia-btn--ghost"
                  style={{ padding: '4px 12px', fontSize: '12px' }}
                  onClick={seleccionarTodos} disabled={cargandoBorrado || seleccionados.size === proveedores.length}>
                  Todos
                </button>
                <button id="btn-limpiar-seleccion" type="button" className="ia-btn ia-btn--ghost"
                  style={{ padding: '4px 12px', fontSize: '12px' }}
                  onClick={limpiarSeleccion} disabled={cargandoBorrado || seleccionados.size === 0}>
                  Limpiar
                </button>
              </div>
            )}
          </div>

          {cargandoProveedores && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 0', color: '#6b7280' }}>
              <span className="ia-spinner" aria-hidden="true" style={{ display: 'inline-block' }} />
              <span>Cargando proveedores...</span>
            </div>
          )}

          {errorProveedores && (
            <div className="ia-alert ia-alert--error" role="alert">
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
              {errorProveedores}
            </div>
          )}

          {!cargandoProveedores && proveedores.length > 0 && (
            <div role="group" aria-label="Lista de proveedores" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '8px',
              maxHeight: '320px',
              overflowY: 'auto',
              padding: '12px',
              background: '#f9fafb',
              borderRadius: '10px',
              border: '1px solid #e5e7eb',
            }}>
              {proveedores.map(nombre => {
                const checked = seleccionados.has(nombre);
                return (
                  <label key={nombre} htmlFor={`prov-${nombre}`} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background:  checked ? '#ede9fe' : 'transparent',
                    border:      `1.5px solid ${checked ? '#7c6af7' : 'transparent'}`,
                    transition:  'background 0.15s, border-color 0.15s',
                    userSelect:  'none',
                  }}>
                    <input id={`prov-${nombre}`} type="checkbox" checked={checked} disabled={cargandoBorrado}
                      onChange={() => toggleProveedor(nombre)}
                      style={{ accentColor: '#7c6af7', width: '16px', height: '16px', cursor: 'pointer' }} />
                    <span style={{
                      fontSize:     '13px',
                      fontWeight:   checked ? 600 : 400,
                      color:        checked ? '#4c1d95' : '#1e1b4b',
                      overflow:     'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace:   'nowrap',
                    }}>
                      {nombre}
                    </span>
                  </label>
                );
              })}
            </div>
          )}

          {!cargandoProveedores && proveedores.length === 0 && !errorProveedores && (
            <p style={{ color: '#6b7280', fontSize: '14px', padding: '12px 0' }}>
              No se encontraron proveedores en el catálogo.
            </p>
          )}
        </div>

        {/* Progreso */}
        {exporting && (
          <div className="ia-progress-wrap" role="status" aria-label="Generando exportación">
            <div className="ia-progress-label">
              <span>Generando Excel para {seleccionados.size} proveedor{seleccionados.size !== 1 ? 'es' : ''}...</span>
              <span className="ia-spinner" aria-hidden="true" style={{ display: 'inline-block' }} />
            </div>
            <div className="ia-progress-bar">
              <div className="ia-progress-fill" style={{ width: '100%', animation: 'pulse 1.5s ease-in-out infinite' }} />
            </div>
          </div>
        )}

        {exportError && (
          <div className="ia-alert ia-alert--error" role="alert">
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
            {exportError}
          </div>
        )}

        {exportOk && (
          <div className="ia-resultado" role="status">
            <div className="ia-resultado-header">
              <svg className="ia-resultado-icon ia-resultado-icon--ok" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
              <h2 className="ia-resultado-title">¡Exportación completada!</h2>
            </div>
            <p className="ia-resultado-time">Archivo: <strong>{exportOk.filename}</strong></p>
            <p className="ia-resultado-time" style={{ marginTop: '4px' }}>
              {exportOk.totalProductos} producto{exportOk.totalProductos !== 1 ? 's' : ''} ·{' '}
              {exportOk.totalVariantes} variante{exportOk.totalVariantes !== 1 ? 's' : ''} exportados
            </p>
          </div>
        )}

        <button type="button" className="ia-btn ia-btn--yellow ia-btn--full"
          style={{ marginTop: '12px' }} onClick={prepararBorrado}
          disabled={exporting || cargandoBorrado || seleccionados.size === 0}>
          {cargandoBorrado && !vistaBorrado ? 'Cargando productos...' : 'Seleccionar productos para borrar'}
        </button>
        {seleccionados.size === 0 && <p className="ia-delete-hint">Seleccioná uno o más proveedores para buscar productos.</p>}

        {/* Botón principal */}
        <button id="btn-exportar-proveedores" type="button"
          className="ia-btn ia-btn--primary ia-btn--full"
          onClick={handleExportar}
          disabled={exporting || cargandoBorrado || seleccionados.size === 0}
          style={{ marginTop: '8px' }}>
          {exporting
            ? <><span className="ia-spinner" aria-hidden="true"/> Generando exportación...</>
            : <>
                <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
                {seleccionados.size === 0
                  ? 'Seleccioná al menos un proveedor'
                  : `Exportar ${seleccionados.size} proveedor${seleccionados.size !== 1 ? 'es' : ''} a Excel`
                }
              </>
          }
        </button>
        {errorBorrado && <div className="ia-alert ia-alert--error" role="alert">{errorBorrado}</div>}
        {resultadoBorrado && (
          <div className="ia-resultado" role="status">
            <h2 className="ia-resultado-title">Resultado del borrado</h2>
            <p>{resultadoBorrado.borrados.length} productos borrados · {resultadoBorrado.errores.length} errores</p>
            {resultadoBorrado.borrados.length > 0 && <details><summary>Ver productos borrados</summary><ul>{resultadoBorrado.borrados.map((item, i) => (
              <li key={`${item.documentId || item.id_original}-${i}`}>{item.id_original || item.documentId} · {item.nombre}</li>
            ))}</ul></details>}
            {resultadoBorrado.errores.length > 0 && <ul>{resultadoBorrado.errores.map((item, i) => (
              <li key={`${item.documentId || item.id_original}-${i}`}>{item.id_original || item.documentId} · {item.nombre}: {item.mensaje}</li>
            ))}</ul>}
          </div>
        )}
      </div>
      {vistaBorrado && (
        <div className="ia-delete-overlay" role="dialog" aria-modal="true" aria-labelledby="ia-delete-title"
          onKeyDown={e => { if (e.key === 'Escape' && !cargandoBorrado) setVistaBorrado(null); }}
          onClick={e => { if (e.target === e.currentTarget && !cargandoBorrado) setVistaBorrado(null); }}>
          <div className="ia-delete-dialog">
            <h2 id="ia-delete-title">{confirmandoBorrado ? 'Confirmar borrado' : 'Seleccionar productos para borrar'}</h2>
            <p>Proveedores: <strong>{vistaBorrado.proveedores.join(', ')}</strong></p>
            {!confirmandoBorrado ? <>
              <label htmlFor="ia-delete-search">Buscar por SKU o nombre</label>
              <input id="ia-delete-search" className="ia-delete-input" autoFocus value={busquedaBorrado}
                placeholder="Nombre, SKU o ID" onChange={e => setBusquedaBorrado(e.target.value)} />
              <div className="ia-delete-toolbar">
                <span>{productosSeleccionados.size} seleccionados · {productosFiltrados.length} visibles</span>
                <button type="button" className="ia-delete-link" onClick={() => setProductosSeleccionados(prev => new Set([...prev, ...productosFiltrados.filter(p => !p.bloqueado).map(p => p.documentId)]))}>Seleccionar visibles</button>
                <button type="button" className="ia-delete-link" onClick={() => setProductosSeleccionados(new Set())}>Limpiar selección</button>
              </div>
              <div className="ia-delete-list" role="group" aria-label="Productos para borrar">
                {productosFiltrados.length === 0 && <p>No se encontraron productos.</p>}
                {productosFiltrados.map(p => <label className="ia-delete-product" key={p.documentId}>
                  <input type="checkbox" checked={productosSeleccionados.has(p.documentId)} disabled={p.bloqueado}
                    onChange={() => toggleProductoBorrado(p.documentId)} />
                  <span><strong>{p.nombre}</strong><small>SKU: {p.sku || '—'} · ID: {p.id_original || p.documentId} · {p.proveedor}</small>
                    {p.skuVariantes?.length > 0 && <small>SKU de variantes: {p.skuVariantes.join(', ')}</small>}
                    {p.bloqueado && <small>El borrador tiene otro proveedor; revisalo en Strapi.</small>}
                  </span>
                </label>)}
              </div>
              <div className="ia-delete-actions">
                <button type="button" className="ia-btn" onClick={() => setVistaBorrado(null)}>Cancelar</button>
                <button type="button" className="ia-btn ia-btn--yellow" disabled={!productosSeleccionados.size}
                  onClick={() => { setConfirmacionBorrado(''); setConfirmandoBorrado(true); }}>Revisar selección ({productosSeleccionados.size})</button>
              </div>
            </> : <>
              <p>Se eliminarán permanentemente <strong>{productosElegidos.length} productos seleccionados</strong> y sus variantes de Strapi.</p>
              <p>Los pedidos conservan sus datos. Si un pago pendiente se acredita después del borrado, el descuento de stock puede requerir revisión.</p>
              <ul className="ia-delete-confirm-list">{productosElegidos.map(p => <li key={p.documentId}>{p.nombre} · {p.sku || p.id_original || p.documentId} · {p.proveedor}</li>)}</ul>
              <label htmlFor="ia-delete-confirm">Escribí <strong>BORRAR</strong> para confirmar:</label>
              <input id="ia-delete-confirm" className="ia-delete-input" autoFocus value={confirmacionBorrado}
                disabled={cargandoBorrado} onChange={e => setConfirmacionBorrado(e.target.value)} />
              <div className="ia-delete-actions">
                <button type="button" className="ia-btn" disabled={cargandoBorrado} onClick={() => setConfirmandoBorrado(false)}>Volver</button>
                <button type="button" className="ia-btn ia-btn--yellow" disabled={cargandoBorrado || confirmacionBorrado !== 'BORRAR' || !productosSeleccionados.size}
                  onClick={confirmarBorrado}>{cargandoBorrado ? 'Borrando...' : `Borrar ${productosElegidos.length} producto${productosElegidos.length === 1 ? '' : 's'}`}</button>
              </div>
            </>}
          </div>
        </div>
      )}
    </div>
  );
}
