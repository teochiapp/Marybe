import React, { useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';
import ProductoRow from './ProductoRow';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:1337';

/**
 * SKUSearchBar — Buscador universal de productos por SKU / EAN (id_original).
 *
 * Funciona en cualquier estado del panel: antes y después de seleccionar proveedor.
 *
 * Props:
 *   token          : JWT admin
 *   pendingChanges : Map documentId → { precio?, precio_oferta?, stock? }
 *   onMarkDirty    : (documentId, campo, valor) => void
 *   lightboxSetter : (urlONull) => void
 */
export default function SKUSearchBar({ token, pendingChanges, onMarkDirty, lightboxSetter }) {
  const [query, setQuery]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [resultados, setResultados] = useState(null); // null = sin búsqueda, [] = vacío, [...] = con resultados
  const [error, setError]           = useState('');
  const [expandido, setExpandido]   = useState(false);

  const debounceRef = useRef(null);
  const inputRef    = useRef(null);

  // ── Búsqueda con debounce ─────────────────────────────────────────────────
  const buscar = useCallback(async (q) => {
    if (q.trim().length < 2) {
      setResultados(null);
      setError('');
      setExpandido(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_URL}/api/editor-admin/buscar`, {
        headers: { Authorization: `Bearer ${token}` },
        params:  { q: q.trim() },
      });
      const prods = res.data?.productos || [];
      setResultados(prods);
      setExpandido(true);
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || 'Error de búsqueda';
      setError(msg);
      setResultados([]);
      setExpandido(true);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);

    clearTimeout(debounceRef.current);
    if (val.trim().length < 2) {
      setResultados(null);
      setExpandido(false);
      setError('');
      return;
    }
    debounceRef.current = setTimeout(() => buscar(val), 420);
  };

  const handleClear = () => {
    setQuery('');
    setResultados(null);
    setExpandido(false);
    setError('');
    inputRef.current?.focus();
  };

  // Cerrar panel al hacer Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setExpandido(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const tieneResultados = Array.isArray(resultados) && resultados.length > 0;

  return (
    <div className="ea-sku-search">
      {/* ── Barra de búsqueda ────────────────────────────────────────── */}
      <div className={`ea-sku-input-wrap${expandido && tieneResultados ? ' ea-sku-input-wrap--open' : ''}`}>
        {/* Ícono lupa */}
        <span className="ea-sku-icon" aria-hidden="true">
          {loading
            ? <span className="ea-spinner" style={{ borderTopColor: '#f2dc8f', width: 15, height: 15 }} />
            : (
              <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            )
          }
        </span>

        <input
          ref={inputRef}
          id="ea-sku-search-input"
          type="text"
          className="ea-sku-input"
          placeholder="Buscar por SKU / EAN…"
          value={query}
          onChange={handleChange}
          autoComplete="off"
          spellCheck={false}
          aria-label="Buscar producto por SKU o EAN"
        />

        {/* Badge cantidad */}
        {tieneResultados && (
          <span className="ea-sku-badge">
            {resultados.length} {resultados.length === 1 ? 'resultado' : 'resultados'}
          </span>
        )}

        {/* Botón limpiar */}
        {query && (
          <button
            type="button"
            className="ea-sku-clear"
            onClick={handleClear}
            aria-label="Limpiar búsqueda"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}

        {/* Toggle colapsar/expandir (solo cuando hay resultados) */}
        {Array.isArray(resultados) && (
          <button
            type="button"
            className="ea-sku-toggle"
            onClick={() => setExpandido(v => !v)}
            aria-label={expandido ? 'Colapsar resultados' : 'Expandir resultados'}
          >
            <svg
              viewBox="0 0 20 20" fill="currentColor" width="14" height="14"
              style={{ transform: expandido ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Panel de resultados ──────────────────────────────────────── */}
      {expandido && (
        <div className="ea-sku-results">
          {error && (
            <div className="ea-alert ea-alert--error" style={{ margin: '0.5rem', fontSize: '0.8rem' }}>
              <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {!error && Array.isArray(resultados) && resultados.length === 0 && (
            <div className="ea-sku-empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width="32" height="32">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p>No se encontraron productos con "<strong>{query}</strong>".</p>
            </div>
          )}

          {tieneResultados && (
            <div className="ea-sku-table-wrap">
              <div className="ea-sku-results-header">
                <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13" aria-hidden="true">
                  <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h8a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                Resultados para <em>"{query}"</em> — {resultados.length} producto{resultados.length !== 1 ? 's' : ''} encontrado{resultados.length !== 1 ? 's' : ''}
              </div>

              <div className="ea-table-wrap" style={{ borderRadius: '0 0 10px 10px', borderTop: 'none' }}>
                <table className="ea-table">
                  <thead>
                    <tr>
                      <th className="ea-th--sticky">ID Original</th>
                      <th>EAN / SKU</th>
                      <th>Proveedor</th>
                      <th>Marca</th>
                      <th>Nombre</th>
                      <th className="ea-th--right">Precio</th>
                      <th className="ea-th--right">Precio Oferta</th>
                      <th className="ea-th--right">Stock</th>
                      <th className="ea-th--center">Portada</th>
                      <th>Galería</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultados.map(producto => (
                      <ProductoRow
                        key={producto.documentId}
                        producto={producto}
                        token={token}
                        pendingChanges={pendingChanges[producto.documentId] || null}
                        onMarkDirty={onMarkDirty}
                        lightboxSetter={lightboxSetter}
                        showProveedor
                        showSku
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
