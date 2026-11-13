import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './ImportacionAdmin.css';
import { acquireDedupedRequest, isRequestCanceled } from '../../utils/requestDedup';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:1337';

export default function ExportacionProveedoresAdmin({ modoEliminar = false }) {
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
  const [busquedaProveedor, setBusquedaProveedor]     = useState('');
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
  const [varianteConfirmar, setVarianteConfirmar] = useState(null);
  const [variantesSeleccionadas, setVariantesSeleccionadas] = useState([]);
  const [confirmacionBorrado, setConfirmacionBorrado] = useState('');
  const [cargandoBorrado, setCargandoBorrado] = useState(false);
  const [errorBorrado, setErrorBorrado] = useState('');
  const [resultadoBorrado, setResultadoBorrado] = useState(null);
  const [resultadoModal, setResultadoModal] = useState(null);

  // ─── Cargar proveedores al autenticarse ─────────────────────────────────────
  const runCargaProveedores = useCallback((jwt, { bypass = false, isActive = () => true } = {}) => {
    setCargandoProveedores(true);
    setErrorProveedores('');
    const request = acquireDedupedRequest(
      `exportacion-proveedores:${jwt}`,
      signal => axios.get(`${API_URL}/api/exportacion-proveedores-admin/proveedores`, {
        headers: { Authorization: `Bearer ${jwt}` },
        signal,
      }),
      { bypass }
    );
    const promise = request.promise
      .then(res => {
        if (isActive()) setProveedores(res.data?.proveedores || []);
      })
      .catch(err => {
        if (!isActive() || isRequestCanceled(err)) return;
        if (err.response?.status === 401 || err.response?.status === 403) {
          handleLogout();
          setAuthError('Sesión expirada. Iniciá sesión nuevamente.');
        } else {
          setErrorProveedores('No se pudo cargar la lista de proveedores. Recargá la página.');
        }
      })
      .finally(() => {
        if (isActive()) setCargandoProveedores(false);
      });
    return { promise, release: request.release };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const cargarProveedores = useCallback(
    jwt => runCargaProveedores(jwt, { bypass: true }).promise,
    [runCargaProveedores]
  );

  useEffect(() => {
    if (!token) return undefined;
    let active = true;
    const task = runCargaProveedores(token, { isActive: () => active });
    return () => {
      active = false;
      task.release();
    };
  }, [token, runCargaProveedores]);

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
    setBusquedaProveedor('');
    setSeleccionados(new Set());
    setExportError('');
    setExportOk(null);
    setVistaBorrado(null);
    setProductosSeleccionados(new Set());
    setBusquedaBorrado('');
    setVariantesSeleccionadas([]);
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

  const normalizarBusqueda = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f'’]/g, '').toLocaleLowerCase().trim();
  const terminoProveedor = normalizarBusqueda(busquedaProveedor);
  const proveedoresFiltrados = terminoProveedor
    ? proveedores.filter(nombre => normalizarBusqueda(nombre).includes(terminoProveedor))
    : proveedores;
  const todosVisiblesSeleccionados = proveedoresFiltrados.length > 0 && proveedoresFiltrados.every(nombre => seleccionados.has(nombre));

  const seleccionarTodos = () => { setSeleccionados(prev => new Set([...prev, ...proveedoresFiltrados])); setExportOk(null); setVistaBorrado(null); setResultadoBorrado(null); setErrorBorrado(''); };
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
      setResultadoModal({ tipo: 'productos', eliminados: res.data.borrados || [], errores: res.data.errores || [] });
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

  const confirmarConjunto = async () => {
    if (confirmacionBorrado !== 'BORRAR') return;
    setCargandoBorrado(true);
    const eliminados = [], errores = [];
    const variantes = variantesSeleccionadas.filter(item => !productosSeleccionados.has(item.producto.documentId));
    let vista = vistaBorrado;
    const headers = { Authorization: `Bearer ${token}` };
    try {
      if (productosSeleccionados.size) {
        const res = await axios.post(`${API_URL}/api/exportacion-proveedores-admin/borrado/confirmar`, { proveedores: vista.proveedores, productos: [...productosSeleccionados], confirmacion: 'BORRAR', comprobante: vista.comprobante }, { headers });
        eliminados.push(...(res.data.borrados || []));
        errores.push(...(res.data.errores || []));
        if (errores.length) throw new Error('El proceso se detuvo antes de eliminar las variantes.');
        if (variantes.length) vista = (await axios.post(`${API_URL}/api/exportacion-proveedores-admin/borrado/vista-previa`, { proveedores: vista.proveedores }, { headers })).data;
      }
      for (let i = 0; i < variantes.length; i++) {
        const { producto, variante } = variantes[i];
        const actual = vista.productos.find(p => p.documentId === producto.documentId)?.variantes?.find(v => v.id === variante.id);
        if (!actual || JSON.stringify(actual) !== JSON.stringify(variante)) throw new Error(`La variante de ${producto.nombre} cambió; revisá nuevamente.`);
        await axios.post(`${API_URL}/api/exportacion-proveedores-admin/borrado/variante`, { proveedores: vista.proveedores, comprobante: vista.comprobante, producto: producto.documentId, variante: variante.id, confirmacion: 'BORRAR' }, { headers });
        eliminados.push({ nombre: `${producto.nombre} · ${variante.sku_ean || variante.id_original || 'Sin SKU'}` });
        if (i < variantes.length - 1) vista = (await axios.post(`${API_URL}/api/exportacion-proveedores-admin/borrado/vista-previa`, { proveedores: vista.proveedores }, { headers })).data;
      }
    } catch (err) { errores.push({ mensaje: err.response?.data?.error?.message || err.message || 'No se pudo completar el borrado.' }); }
    setResultadoModal({ tipo: 'elementos', eliminados, errores });
    setVistaBorrado(null); setConfirmandoBorrado(false); setVarianteConfirmar(null);
    setProductosSeleccionados(new Set()); setVariantesSeleccionadas([]); setConfirmacionBorrado(''); setCargandoBorrado(false);
    await cargarProveedores(token);
  };

  const borrarVariante = async () => {
    if (confirmacionBorrado !== 'BORRAR') return;
    setCargandoBorrado(true);
    setErrorBorrado('');
    let procesadas = 0;
    try {
      let vista = vistaBorrado;
      for (const { producto, variante } of variantesSeleccionadas) {
        const actual = vista.productos.find(p => p.documentId === producto.documentId)?.variantes?.find(v => v.id === variante.id);
        if (!actual || JSON.stringify(actual) !== JSON.stringify(variante)) throw new Error('La variante cambió desde la selección.');
        await axios.post(`${API_URL}/api/exportacion-proveedores-admin/borrado/variante`, {
          proveedores: vista.proveedores, comprobante: vista.comprobante,
          producto: producto.documentId, variante: variante.id, confirmacion: 'BORRAR',
        }, { headers: { Authorization: `Bearer ${token}` } });
        procesadas++;
        if (procesadas < variantesSeleccionadas.length) {
          const res = await axios.post(`${API_URL}/api/exportacion-proveedores-admin/borrado/vista-previa`, { proveedores: vista.proveedores }, { headers: { Authorization: `Bearer ${token}` } });
          vista = res.data;
        }
      }
      setVistaBorrado(null);
      setVarianteConfirmar(null);
      setVariantesSeleccionadas([]);
      setConfirmacionBorrado('');
      setResultadoModal({ tipo: 'variantes', eliminados: variantesSeleccionadas.map(({ producto, variante }) => ({ nombre: `${producto.nombre} · ${variante.sku_ean || variante.id_original || 'Sin SKU'}` })), errores: [] });
    } catch (err) {
      setVistaBorrado(null);
      setVarianteConfirmar(null);
      setVariantesSeleccionadas([]);
      setResultadoModal({ tipo: 'variantes', eliminados: variantesSeleccionadas.slice(0, procesadas).map(({ producto, variante }) => ({ nombre: `${producto.nombre} · ${variante.sku_ean || variante.id_original || 'Sin SKU'}` })), errores: [{ mensaje: `Se detuvo el proceso; ${variantesSeleccionadas.length - procesadas} variantes no fueron confirmadas. ${err.response?.data?.error?.message || err.message || 'No se pudo completar el borrado.'}` }] });
    } finally { setCargandoBorrado(false); }
  };

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
              <h1 className="ia-panel-title">{modoEliminar ? 'Eliminar Productos' : 'Precios por Proveedor'}</h1>
              <p className="ia-panel-sub">{modoEliminar ? 'Marybe · Seleccioná proveedores y revisá los productos antes de borrarlos' : 'Marybe · Exportar precios y stock filtrados por proveedor'}</p>
            </div>
          </div>
        </header>

        {/* Info */}
        <div className="ia-info-card">
          <div className="ia-info-icon" aria-hidden="true">
            <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg>
          </div>
          <div className="ia-info-text">
            <strong>¿Cómo funciona?</strong>
            <span>{modoEliminar ? 'Seleccioná proveedores, elegí los productos y revisá la confirmación antes de borrarlos. El borrado individual de variantes todavía no está disponible.' : <>
              Seleccioná uno o más proveedores y hacé clic en <strong>"Exportar"</strong>.
              El Excel incluye la hoja de precios con variantes indentadas (↳) y la hoja <strong>🔗 Variantes</strong>{' '}
              agrupada por producto para editar atributos (Volumen, Color, Envío, Stock, Precios) o agregar nuevas variantes. Para dar de alta un producto, agregá una fila con ID único, nombre y proveedor seleccionado; cargá sus variantes en la hoja Variantes.</>}
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
                  onClick={seleccionarTodos} disabled={cargandoBorrado || proveedoresFiltrados.length === 0 || todosVisiblesSeleccionados}>
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
            <>
              <div style={{ marginBottom: '10px' }}>
                <input
                  id="eprov-buscar-proveedor"
                  name="buscar_proveedor"
                  type="search"
                  aria-label="Buscar proveedor"
                  placeholder="Buscar proveedor..."
                  value={busquedaProveedor}
                  onChange={e => setBusquedaProveedor(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    background: '#ffffff',
                    color: '#1e1b4b',
                    fontSize: '13px',
                  }}
                />
              </div>
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
                {proveedoresFiltrados.length === 0 ? (
                  <p style={{ color: '#6b7280', fontSize: '13px', margin: 0, gridColumn: '1 / -1' }}>
                    Ningún proveedor coincide con la búsqueda.
                  </p>
                ) : proveedoresFiltrados.map(nombre => {
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
                      <input id={`prov-${nombre}`} name="proveedores" type="checkbox" checked={checked} disabled={cargandoBorrado}
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
            </>
          )}

          {!cargandoProveedores && proveedores.length === 0 && !errorProveedores && (
            <p style={{ color: '#6b7280', fontSize: '14px', padding: '12px 0' }}>
              No se encontraron proveedores en el catálogo.
            </p>
          )}
        </div>

        {/* Progreso */}
        {!modoEliminar && exporting && (
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

        {!modoEliminar && exportError && (
          <div className="ia-alert ia-alert--error" role="alert">
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
            {exportError}
          </div>
        )}

        {!modoEliminar && exportOk && (
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

        {modoEliminar && <button type="button" className="ia-btn ia-btn--yellow ia-btn--full"
          style={{ marginTop: '12px' }} onClick={prepararBorrado}
          disabled={exporting || cargandoBorrado || seleccionados.size === 0}>
          {cargandoBorrado && !vistaBorrado ? 'Cargando productos...' : 'Seleccionar productos para borrar'}
        </button>}
        {modoEliminar && seleccionados.size === 0 && <p className="ia-delete-hint">Seleccioná uno o más proveedores para buscar productos.</p>}

        {/* Botón principal */}
        {!modoEliminar && <button id="btn-exportar-proveedores" type="button"
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
        </button>}
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
      {resultadoModal && <div className="ia-delete-overlay" role="dialog" aria-modal="true" aria-labelledby="ia-delete-result-title" onKeyDown={e => { if (e.key === 'Escape') setResultadoModal(null); }}>
        <div className="ia-delete-dialog">
          <h2 id="ia-delete-result-title">{resultadoModal.errores.length ? 'Resultado del borrado' : 'Borrado completado'}</h2>
          <p>Se eliminaron <strong>{resultadoModal.eliminados.length} {resultadoModal.tipo}</strong>.</p>
          {resultadoModal.eliminados.length > 0 && <ul className="ia-delete-confirm-list">{resultadoModal.eliminados.map((item, i) => <li key={i}>{item.nombre || item.id_original || item.documentId}</li>)}</ul>}
          {resultadoModal.errores.length > 0 && <div className="ia-alert ia-alert--error" role="alert">{resultadoModal.errores.map((item, i) => <p key={i}>{item.nombre && `${item.nombre}: `}{item.mensaje}</p>)}</div>}
          <div className="ia-delete-actions"><button autoFocus type="button" className="ia-btn ia-btn--primary" onClick={() => setResultadoModal(null)}>Entendido</button></div>
        </div>
      </div>}
      {vistaBorrado && (
        <div className="ia-delete-overlay" role="dialog" aria-modal="true" aria-labelledby="ia-delete-title"
          onKeyDown={e => { if (e.key === 'Escape' && !cargandoBorrado) { if (varianteConfirmar) { setVarianteConfirmar(null); setConfirmacionBorrado(''); } else setVistaBorrado(null); } }}
          onClick={e => { if (e.target === e.currentTarget && !cargandoBorrado) { setVarianteConfirmar(null); setVistaBorrado(null); } }}>
          <div className="ia-delete-dialog">
            <h2 id="ia-delete-title">{varianteConfirmar ? 'Confirmar eliminación de variante' : confirmandoBorrado ? 'Confirmar borrado' : 'Seleccionar productos para borrar'}</h2>
            <p>Proveedores: <strong>{vistaBorrado.proveedores.join(', ')}</strong></p>
            {varianteConfirmar ? <>
              <p>Se eliminarán permanentemente <strong>{variantesSeleccionadas.length} variantes</strong>. Si ocurre un error, se informará cuántas se eliminaron.</p>
              <ul className="ia-delete-confirm-list">{variantesSeleccionadas.map(({ producto, variante }) => <li key={variante.id}>{producto.nombre} · {[variante.volumen, variante.color_nombre, variante.sku_ean || 'Sin SKU', variante.id_original || 'Sin ID'].filter(Boolean).join(' · ')}</li>)}</ul>
              <p>Si un pedido pendiente incluye esta variante, puede requerir revisión.</p>
              <label htmlFor="ia-variant-confirm">Escribí <strong>BORRAR</strong> para confirmar:</label>
              <input id="ia-variant-confirm" className="ia-delete-input" autoFocus value={confirmacionBorrado} disabled={cargandoBorrado} onChange={e => setConfirmacionBorrado(e.target.value)} />
              <div className="ia-delete-actions"><button type="button" className="ia-btn" disabled={cargandoBorrado} onClick={() => { setVarianteConfirmar(null); setConfirmacionBorrado(''); }}>Volver</button><button type="button" className="ia-btn ia-btn--yellow" disabled={cargandoBorrado || confirmacionBorrado !== 'BORRAR'} onClick={borrarVariante}>{cargandoBorrado ? 'Borrando...' : `Eliminar ${variantesSeleccionadas.length} variantes`}</button></div>
            </> : !confirmandoBorrado ? <>
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
                {productosFiltrados.map(p => <div className="ia-delete-card" key={p.documentId}><label className="ia-delete-product">
                  <input id={`del-prod-${p.documentId}`} name="productos_borrar" type="checkbox" checked={productosSeleccionados.has(p.documentId)} disabled={p.bloqueado}
                    onChange={() => toggleProductoBorrado(p.documentId)} />
                  <span><strong>{p.nombre}</strong><small>SKU: {p.sku || '—'} · ID: {p.id_original || p.documentId} · {p.proveedor}</small>
                    {p.skuVariantes?.length > 0 && <small>SKU de variantes: {p.skuVariantes.join(', ')}</small>}
                    {p.bloqueado && <small>El borrador tiene otro proveedor; revisalo en Strapi.</small>}
                  </span>
                </label>{p.variantes?.length > 0 && <details className="ia-delete-variants"><summary>Variantes <span>{p.variantes.length}</span></summary>{productosSeleccionados.has(p.documentId) && <p>Estas variantes se eliminarán junto con el producto.</p>}<div className="ia-delete-variants-list">{p.variantes.map(v => <label key={v.id} className="ia-delete-variant"><input id={`del-var-${p.documentId}-${v.id}`} name="variantes_borrar" type="checkbox" disabled={cargandoBorrado || p.bloqueado || productosSeleccionados.has(p.documentId)} checked={productosSeleccionados.has(p.documentId) || variantesSeleccionadas.some(item => item.variante.id === v.id)} onChange={e => setVariantesSeleccionadas(prev => e.target.checked ? [...prev, { producto: p, variante: v }] : prev.filter(item => item.variante.id !== v.id))} /><div className="ia-delete-variant-info"><strong>{[v.volumen, v.color_nombre].filter(Boolean).join(' · ') || 'Variante sin descripción'}</strong><small>SKU: {v.sku_ean || 'Sin SKU'}{v.id_original && ` · ID: ${v.id_original}`}{!v.publicado && ' · Oculta'}</small></div></label>)}</div></details>}</div>)}
              </div>
              <div className="ia-delete-actions">
                <button type="button" className="ia-btn" onClick={() => setVistaBorrado(null)}>Cancelar</button>
                <button type="button" className="ia-btn ia-btn--yellow" disabled={!productosSeleccionados.size && !variantesSeleccionadas.length}
                  onClick={() => { setConfirmacionBorrado(''); setConfirmandoBorrado(true); }}>Revisar selección ({productosSeleccionados.size + variantesSeleccionadas.filter(item => !productosSeleccionados.has(item.producto.documentId)).length})</button>
              </div>
            </> : <>
              <p>Se eliminarán permanentemente <strong>{productosElegidos.length} productos</strong>, que incluyen <strong>{productosElegidos.reduce((total, p) => total + (p.variantes?.length || 0), 0)} variantes</strong>, y <strong>{variantesSeleccionadas.filter(item => !productosSeleccionados.has(item.producto.documentId)).length} variantes individuales de otros productos</strong>.</p>
              <p>Los pedidos conservan sus datos. Si un pago pendiente se acredita después del borrado, el descuento de stock puede requerir revisión.</p>
              <ul className="ia-delete-confirm-list">{productosElegidos.map(p => <li key={p.documentId}>{p.nombre} · {p.sku || p.id_original || p.documentId} · {p.proveedor}</li>)}</ul>
              {productosElegidos.some(p => p.variantes?.length) && <details><summary>Ver variantes incluidas en los productos</summary><ul className="ia-delete-confirm-list">{productosElegidos.flatMap(p => (p.variantes || []).map(v => <li key={`${p.documentId}-${v.id}`}>{p.nombre} · {[v.volumen, v.color_nombre, v.sku_ean || 'Sin SKU', v.id_original].filter(Boolean).join(' · ')}</li>))}</ul></details>}
              <ul className="ia-delete-confirm-list">{variantesSeleccionadas.filter(item => !productosSeleccionados.has(item.producto.documentId)).map(({ producto, variante }) => <li key={variante.id}>{producto.nombre} · {[variante.volumen, variante.color_nombre, variante.sku_ean || 'Sin SKU', variante.id_original].filter(Boolean).join(' · ')}</li>)}</ul>
              <p>El borrado se realiza por etapas; si ocurre un error se informará lo ya eliminado.</p>
              <label htmlFor="ia-delete-confirm">Escribí <strong>BORRAR</strong> para confirmar:</label>
              <input id="ia-delete-confirm" className="ia-delete-input" autoFocus value={confirmacionBorrado}
                disabled={cargandoBorrado} onChange={e => setConfirmacionBorrado(e.target.value)} />
              <div className="ia-delete-actions">
                <button type="button" className="ia-btn" disabled={cargandoBorrado} onClick={() => setConfirmandoBorrado(false)}>Volver</button>
                <button type="button" className="ia-btn ia-btn--yellow" disabled={cargandoBorrado || confirmacionBorrado !== 'BORRAR' || (!productosSeleccionados.size && !variantesSeleccionadas.length)}
                  onClick={confirmarConjunto}>{cargandoBorrado ? 'Borrando...' : 'Confirmar borrado'}</button>
              </div>
            </>}
          </div>
        </div>
      )}
    </div>
  );
}
