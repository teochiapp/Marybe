import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
// Reusamos los estilos base de ImportacionAdmin (login, panel, botones, etc)
import './ImportacionAdmin.css';
// Agregamos estilos específicos para la tabla de pedidos
import './PedidosAdmin.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:1337';

export default function PedidosAdmin() {
  // Auth state
  const [token, setToken] = useState(() => localStorage.getItem('admin_jwt') || '');
  const [authError, setAuthError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  // Pedidos state
  const [pedidos, setPedidos] = useState([]);
  const [loadingPedidos, setLoadingPedidos] = useState(false);
  const [errorPedidos, setErrorPedidos] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);

  // Detalles Modal
  const [selectedPedido, setSelectedPedido] = useState(null);
  
  // Confirmar Eliminación Modal
  const [pedidoToDelete, setPedidoToDelete] = useState(null);

  // ─── Autenticación ───────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setLoginLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/auth/local`, {
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
    setPedidos([]);
  };

  // ─── Fetch Pedidos ───────────────────────────────────────────────────────────
  const fetchPedidos = async () => {
    if (!token) return;
    setLoadingPedidos(true);
    setErrorPedidos('');
    try {
      // Pedimos pedidos ordenados, limitados a 10 por página
      const res = await axios.get(`${API_URL}/api/pedidos?populate=usuario&sort=createdAt:desc&pagination[page]=${currentPage}&pagination[pageSize]=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPedidos(res.data.data || []);
      setPageCount(res.data.meta?.pagination?.pageCount || 1);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setAuthError('No tienes permisos para ver los pedidos. Verifica que tu rol tenga permisos en Strapi.');
        handleLogout();
      } else {
        setErrorPedidos('Hubo un error al cargar los pedidos.');
      }
    } finally {
      setLoadingPedidos(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPedidos();
    }
  }, [token, currentPage]);

  // ─── Cambiar Estado de Pedido ────────────────────────────────────────────────
  const handleUpdateEstado = async (id, nuevoEstado) => {
    try {
      await axios.put(`${API_URL}/api/pedidos/${id}`, {
        data: { estado: nuevoEstado }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Actualizamos el estado local para no recargar toda la tabla
      setPedidos(prev => prev.map(p => {
        if (p.documentId === id) {
          // Dependiendo del formato de Strapi, actualizamos attributes o directamente el objeto
          if (p.attributes) {
            return { ...p, attributes: { ...p.attributes, estado: nuevoEstado }, estado: nuevoEstado };
          }
          return { ...p, estado: nuevoEstado };
        }
        return p;
      }));
      setSuccessMsg('Cambiado correctamente');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error(error);
      alert('Error al actualizar el estado del pedido.');
    }
  };

  // ─── Eliminar Pedido ─────────────────────────────────────────────────────────
  const confirmDeletePedido = async () => {
    if (!pedidoToDelete) return;
    try {
      await axios.delete(`${API_URL}/api/pedidos/${pedidoToDelete}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPedidos(prev => prev.filter(p => p.documentId !== pedidoToDelete));
      setSuccessMsg('Pedido eliminado');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error(error);
      alert('Error al eliminar el pedido. Verifica tus permisos en Strapi.');
    } finally {
      setPedidoToDelete(null);
    }
  };

  // Helpers
  const formatPrice = (price) => '$ ' + Number(price).toLocaleString('es-AR', { minimumFractionDigits: 2 });
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('es-AR', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' });

  // ─── Render: Login (Reutilizado de ImportacionAdmin) ─────────────────────────
  if (!token) {
    return (
      <div className="ia-wrapper">
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
            <p className="ia-brand-sub">Panel de Pedidos</p>
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

            <button type="submit" className="ia-btn ia-btn--primary" disabled={loginLoading || !email || !password}>
              {loginLoading ? <><span className="ia-spinner" aria-hidden="true"/> Iniciando...</> : 'Iniciar sesión'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── Render: Admin Panel de Pedidos ──────────────────────────────────────────
  return (
    <div className="ia-wrapper" style={{ padding: '40px 20px', alignItems: 'flex-start', position: 'relative' }}>
      
      {/* Toast de Éxito */}
      <AnimatePresence>
        {successMsg && (
          <motion.div 
            className="pa-toast-success"
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
            {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="ia-bg-particles">
        {[...Array(12)].map((_, i) => (
          <div key={i} className={`ia-particle ia-particle--${i + 1}`} />
        ))}
      </div>

      <div className="pa-panel">
        <header className="pa-header">
          <div className="pa-title-wrap">
            <div className="ia-brand-icon ia-brand-icon--sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            </div>
            <div>
              <h1 className="pa-title">Gestión de Pedidos</h1>
              <p className="pa-subtitle">Administra los estados de las compras</p>
            </div>
          </div>
          <button className="ia-btn ia-btn--primary" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </header>

        {errorPedidos && (
          <div className="ia-alert ia-alert--error">{errorPedidos}</div>
        )}

        {loadingPedidos ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#666' }}>Cargando pedidos...</div>
        ) : (
          <div className="pa-table-container">
            <table className="pa-table">
              <thead>
                <tr>
                  <th>Nº Pedido</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Pago</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map(pedido => {
                  // Strapi v4: attributes are nested if fetched via REST API GET /api/pedidos
                  // But sometimes depending on controller it's flat. We handle both just in case.
                  const p = pedido.attributes || pedido; 
                  const clienteEmail = p.cliente_email || p.usuario?.data?.attributes?.email || p.usuario?.email || 'N/A';
                  const estado = p.estado || 'Procesando';

                  return (
                    <tr key={pedido.id}>
                      <td data-label="Nº Pedido" style={{ fontWeight: 600 }}>{p.numero_pedido}</td>
                      <td data-label="Fecha">{formatDate(p.createdAt)}</td>
                      <td data-label="Cliente">{clienteEmail}</td>
                      <td data-label="Total" style={{ fontWeight: 600 }}>{formatPrice(p.total)}</td>
                      <td data-label="Pago" style={{ textTransform: 'capitalize' }}>{p.metodo_pago}</td>
                      <td data-label="Estado">
                        <select 
                          className="pa-select" 
                          value={estado} 
                          onChange={(e) => handleUpdateEstado(pedido.documentId, e.target.value)}
                        >
                          <option value="Procesando">Procesando</option>
                          <option value="Enviado">Enviado</option>
                          <option value="Completado">Completado</option>
                          <option value="Cancelado">Cancelado</option>
                        </select>
                      </td>
                      <td data-label="Acciones">
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button className="pa-detail-btn" onClick={() => setSelectedPedido(p)}>Ver detalles</button>
                          <button className="pa-delete-btn" onClick={() => setPedidoToDelete(pedido.documentId)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {pedidos.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>No hay pedidos registrados todavía.</td>
                  </tr>
                )}
              </tbody>
            </table>

            {pageCount > 1 && (
              <div className="pa-pagination">
                <button 
                  className="ia-btn ia-btn--ghost" 
                  style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                  disabled={currentPage === 1} 
                  onClick={() => setCurrentPage(prev => prev - 1)}
                >
                  Anterior
                </button>
                <span className="pa-pagination-info">Página {currentPage} de {pageCount}</span>
                <button 
                  className="ia-btn ia-btn--ghost" 
                  style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                  disabled={currentPage === pageCount} 
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Detalles */}
      <AnimatePresence>
        {selectedPedido && (
          <div className="pa-modal-overlay" onClick={() => setSelectedPedido(null)}>
            <motion.div 
              className="pa-modal"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="pa-modal-close" onClick={() => setSelectedPedido(null)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
              </button>
              
              <h2 style={{ marginTop: 0, color: '#3E0102', fontFamily: 'var(--font-family-primary)' }}>Pedido {selectedPedido.numero_pedido}</h2>
              
              <div className="pa-order-info">
                <div>
                  <strong>Fecha:</strong> {formatDate(selectedPedido.createdAt)}
                </div>
                <div>
                  <strong>Estado:</strong> <span className={`pa-badge pa-badge--${selectedPedido.estado?.toLowerCase()}`}>{selectedPedido.estado}</span>
                </div>
                <div>
                  <strong>Pago:</strong> {selectedPedido.metodo_pago}
                </div>
                <div>
                  <strong>Total:</strong> {formatPrice(selectedPedido.total)}
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <strong>Dirección de Envío:</strong><br/>
                  {selectedPedido.direccion_envio?.calle ? (
                    `${selectedPedido.direccion_envio.calle} ${selectedPedido.direccion_envio.numero || ''}, ${selectedPedido.direccion_envio.ciudad || ''}, ${selectedPedido.direccion_envio.provincia || ''} (CP ${selectedPedido.direccion_envio.cp || ''})`
                  ) : 'No especificada'}
                </div>
              </div>

              <h3 className="pa-modal-section-title">Productos</h3>
              <div className="pa-products-list">
                {Array.isArray(selectedPedido.productos) && selectedPedido.productos.map((prod, idx) => (
                  <div className="pa-product-item" key={idx}>
                    <div className="pa-product-info">
                      <span className="pa-product-name">{prod.producto || prod.product?.nombre || 'Producto'}</span>
                      <span className="pa-product-meta">
                        Variante: {prod.variante || prod.size || prod.color || 'N/A'} | SKU: {prod.sku || 'N/A'}
                      </span>
                    </div>
                    <div className="pa-product-price">
                      {prod.cantidad || prod.quantity} x {formatPrice(prod.precio_unitario || prod.price)}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Confirmación de Borrado */}
      <AnimatePresence>
        {pedidoToDelete && (
          <div className="pa-modal-overlay" onClick={() => setPedidoToDelete(null)}>
            <motion.div 
              className="pa-modal"
              style={{ maxWidth: '400px', textAlign: 'center', padding: '40px 30px' }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ color: '#d9534f', marginBottom: '16px' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              </div>
              <h2 style={{ marginTop: 0, fontFamily: 'var(--font-family-primary)', color: '#333' }}>Eliminar Pedido</h2>
              <p style={{ color: '#666', marginBottom: '30px', fontSize: '0.95rem' }}>
                ¿Estás seguro de que deseas eliminar este pedido de forma permanente? Esta acción no se puede deshacer.
              </p>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button 
                  className="ia-btn" 
                  style={{ backgroundColor: '#f5f5f5', color: '#444', border: '1px solid #ddd' }} 
                  onClick={() => setPedidoToDelete(null)}
                >
                  Cancelar
                </button>
                <button className="ia-btn ia-btn--primary" style={{ backgroundColor: '#d9534f' }} onClick={confirmDeletePedido}>
                  Sí, eliminar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
