import React, { useState, useEffect, useCallback } from 'react';
import './ApiProductos.css';

const STRAPI_URL = 'http://localhost:1337';
const PAGE_SIZE = 24;

// ─── Helper: obtener precio/stock/oferta de variantes ────────────────────────
function getPrecioInfo(variantes = []) {
  if (!variantes.length) return { precio: null, oferta: null, stock: 0, moneda: 'ARS' };
  const publicadas = variantes.filter(v => v.publicado !== false);
  if (!publicadas.length) return { precio: null, oferta: null, stock: 0, moneda: 'ARS' };

  // Precio mínimo entre variantes publicadas
  const precioMin = Math.min(...publicadas.map(v => v.precio || Infinity));
  // Oferta mínima (si existe)
  const ofertaMin = publicadas.some(v => v.precio_oferta)
    ? Math.min(...publicadas.filter(v => v.precio_oferta).map(v => v.precio_oferta))
    : null;
  // Stock total
  const stockTotal = publicadas.reduce((acc, v) => acc + (v.stock || 0), 0);
  const moneda = publicadas[0].moneda || 'ARS';

  return { precio: precioMin === Infinity ? null : precioMin, oferta: ofertaMin, stock: stockTotal, moneda };
}

// ─── Componente tarjeta de producto ─────────────────────────────────────────
function ProductCard({ producto }) {
  const { nombre, sku, marca, categoria, proveedor, publicado, variantes = [] } = producto;
  const { precio, oferta, stock, moneda } = getPrecioInfo(variantes);

  const tieneOferta = oferta && oferta > 0 && precio && oferta < precio;
  const descuento   = tieneOferta ? Math.round((1 - oferta / precio) * 100) : null;
  const cantVariantes = variantes.length;

  return (
    <div className={`ap-card ${stock === 0 ? 'ap-card--sin-stock' : ''}`}>
      {tieneOferta && (
        <span className="ap-badge ap-badge--oferta">-{descuento}%</span>
      )}
      {!publicado && (
        <span className="ap-badge ap-badge--oculto">Oculto</span>
      )}
      {stock === 0 && (
        <span className="ap-badge ap-badge--sin-stock">Sin stock</span>
      )}

      <div className="ap-card__icon">
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="48" height="48" rx="12" fill="currentColor" fillOpacity="0.08"/>
          <path d="M14 16h20l-2 14H16L14 16z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
          <path d="M14 16l-2-6H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="19" cy="34" r="2" fill="currentColor"/>
          <circle cx="31" cy="34" r="2" fill="currentColor"/>
        </svg>
      </div>

      <div className="ap-card__body">
        <div className="ap-card__meta">
          {categoria && <span className="ap-tag">{categoria}</span>}
          {marca     && <span className="ap-tag ap-tag--marca">{marca}</span>}
        </div>
        <p className="ap-card__ean">{sku || '—'}</p>
        <h3 className="ap-card__nombre">{nombre}</h3>
        <p className="ap-card__proveedor">{proveedor}</p>
      </div>

      <div className="ap-card__footer">
        <div className="ap-card__precios">
          {precio != null ? (
            tieneOferta ? (
              <>
                <span className="ap-precio--original">{moneda} {precio.toLocaleString('es-AR')}</span>
                <span className="ap-precio--oferta">{moneda} {oferta.toLocaleString('es-AR')}</span>
              </>
            ) : (
              <span className="ap-precio">{moneda} {precio.toLocaleString('es-AR')}</span>
            )
          ) : (
            <span className="ap-precio ap-precio--sin">Sin precio</span>
          )}
        </div>
        <div className="ap-card__footer-bottom">
          <div className="ap-card__stock">
            <span className={`ap-stock-dot ${stock > 0 ? 'ap-stock-dot--ok' : 'ap-stock-dot--empty'}`} />
            {stock > 0 ? `${stock} en stock` : 'Sin stock'}
          </div>
          {cantVariantes > 1 && (
            <span className="ap-variantes-badge">{cantVariantes} variantes</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton card para loading ──────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="ap-card ap-card--skeleton">
      <div className="ap-skeleton ap-skeleton--icon" />
      <div className="ap-skeleton ap-skeleton--line ap-skeleton--short" />
      <div className="ap-skeleton ap-skeleton--line" />
      <div className="ap-skeleton ap-skeleton--line ap-skeleton--medium" />
      <div className="ap-skeleton ap-skeleton--footer" />
    </div>
  );
}

// ─── Página principal ────────────────────────────────────────────────────────
export default function ApiProductos() {
  const [productos, setProductos]     = useState([]);
  const [total, setTotal]             = useState(0);
  const [pagina, setPagina]           = useState(1);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [busqueda, setBusqueda]       = useState('');
  const [debouncedBusqueda, setDebouncedBusqueda] = useState('');
  const [orden, setOrden]             = useState('nombre:asc');

  // Debounce búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedBusqueda(busqueda);
      setPagina(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [busqueda]);

  const fetchProductos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('pagination[page]', pagina);
      params.set('pagination[pageSize]', PAGE_SIZE);
      params.set('populate[variantes]', '*');

      // Orden por campo del producto
      const [campo, dir] = orden.split(':');
      params.set('sort[0]', `${campo}:${dir}`);

      // Búsqueda sobre campos del producto padre
      if (debouncedBusqueda.trim()) {
        params.set('filters[$or][0][nombre][$containsi]', debouncedBusqueda);
        params.set('filters[$or][1][proveedor][$containsi]', debouncedBusqueda);
        params.set('filters[$or][2][marca][$containsi]',    debouncedBusqueda);
        params.set('filters[$or][3][sku][$containsi]',      debouncedBusqueda);
      }

      const res = await fetch(`${STRAPI_URL}/api/productos?${params.toString()}`);

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Error ${res.status}: ${res.statusText}${body ? ` — ${body.substring(0, 120)}` : ''}`);
      }

      const json = await res.json();
      setProductos(json.data || []);
      setTotal(json.meta?.pagination?.total || 0);
    } catch (err) {
      setError(err.message);
      setProductos([]);
    } finally {
      setLoading(false);
    }
  }, [pagina, debouncedBusqueda, orden]);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  const totalPaginas = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="ap-root">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="ap-header">
        <div className="ap-header__content">
          <div className="ap-header__title">
            <div className="ap-header__icon">🛍️</div>
            <div>
              <h1>Catálogo de Productos</h1>
              <p className="ap-header__sub">
                {loading ? 'Cargando...' : `${total.toLocaleString('es-AR')} productos desde Strapi`}
              </p>
            </div>
          </div>

          {/* Buscador */}
          <div className="ap-searchbar">
            <span className="ap-searchbar__icon">🔍</span>
            <input
              id="ap-busqueda"
              type="text"
              className="ap-searchbar__input"
              placeholder="Buscar por nombre, marca, proveedor, SKU..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            {busqueda && (
              <button className="ap-searchbar__clear" onClick={() => setBusqueda('')} title="Limpiar">✕</button>
            )}
          </div>
        </div>

        {/* ── Controles ──────────────────────────────────────────────────── */}
        <div className="ap-controles">
          <div className="ap-orden">
            <label htmlFor="ap-orden-select">Ordenar:</label>
            <select
              id="ap-orden-select"
              className="ap-select"
              value={orden}
              onChange={(e) => { setOrden(e.target.value); setPagina(1); }}
            >
              <option value="nombre:asc">Nombre A→Z</option>
              <option value="nombre:desc">Nombre Z→A</option>
              <option value="marca:asc">Marca A→Z</option>
              <option value="categoria:asc">Categoría A→Z</option>
              <option value="proveedor:asc">Proveedor A→Z</option>
            </select>
          </div>
        </div>
      </header>

      {/* ── Aviso de permisos si hay error 403/401 ─────────────────────── */}
      {error && error.includes('403') && (
        <div className="ap-notice">
          <strong>⚙️ Configurar permisos en Strapi Admin:</strong>
          <ol>
            <li>Ir a <code>http://localhost:1337/admin</code></li>
            <li>Settings → Roles → <strong>Public</strong></li>
            <li>Producto → habilitar <strong>find</strong> y <strong>findOne</strong></li>
            <li>Guardar y recargar esta página</li>
          </ol>
        </div>
      )}

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <main className="ap-main">
        {error && (
          <div className="ap-error">
            <span className="ap-error__icon">⚠️</span>
            <div>
              <strong>No se pudo conectar al Backend</strong>
              <p>{error}</p>
              <p className="ap-error__hint">
                Asegurate de que Strapi esté corriendo en <code>{STRAPI_URL}</code>
                {error.includes('403') && ' y que los permisos del rol Public estén habilitados (ver arriba)'}
                {error.includes('400') && ' — puede haber un campo incorrecto en los filtros'}
              </p>
            </div>
            <button className="ap-btn ap-btn--ghost" onClick={fetchProductos}>Reintentar</button>
          </div>
        )}

        {!error && (
          <div className="ap-grid">
            {loading
              ? Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)
              : productos.length === 0
              ? (
                <div className="ap-empty">
                  <span className="ap-empty__icon">📭</span>
                  <h3>Sin resultados</h3>
                  <p>No se encontraron productos{busqueda ? ` para "${busqueda}"` : ''}.</p>
                  <button className="ap-btn ap-btn--primary" onClick={() => setBusqueda('')}>
                    Limpiar búsqueda
                  </button>
                </div>
              )
              : productos.map((p) => (
                <ProductCard key={p.documentId || p.id} producto={p} />
              ))
            }
          </div>
        )}
      </main>

      {/* ── Paginación ─────────────────────────────────────────────────────── */}
      {!loading && !error && totalPaginas > 1 && (
        <nav className="ap-paginacion" aria-label="Paginación">
          <button
            id="ap-pag-anterior"
            className="ap-pag-btn"
            disabled={pagina === 1}
            onClick={() => setPagina((p) => p - 1)}
          >← Anterior</button>

          <div className="ap-pag-pages">
            {Array.from({ length: Math.min(totalPaginas, 7) }, (_, i) => {
              let page;
              if (totalPaginas <= 7)          page = i + 1;
              else if (pagina <= 4)           page = i + 1;
              else if (pagina >= totalPaginas - 3) page = totalPaginas - 6 + i;
              else                            page = pagina - 3 + i;
              return (
                <button
                  key={page}
                  className={`ap-pag-num ${pagina === page ? 'ap-pag-num--active' : ''}`}
                  onClick={() => setPagina(page)}
                >{page}</button>
              );
            })}
          </div>

          <button
            id="ap-pag-siguiente"
            className="ap-pag-btn"
            disabled={pagina === totalPaginas}
            onClick={() => setPagina((p) => p + 1)}
          >Siguiente →</button>

          <span className="ap-pag-info">Página {pagina} de {totalPaginas}</span>
        </nav>
      )}
    </div>
  );
}
