import React from 'react';
import ProductoRow from './ProductoRow';

/**
 * ProductosTable — Renderiza la tabla de productos editables.
 *
 * Props:
 *   productos      : array de productos
 *   token          : JWT admin
 *   pendingChanges : Map documentId → { precio?, precio_oferta?, stock? }
 *   onMarkDirty    : (documentId, campo, valor) => void
 *   lightboxSetter : (urlONull) => void
 *   cargando       : bool
 */
export default function ProductosTable({ productos, token, pendingChanges, onMarkDirty, lightboxSetter, cargando }) {
  if (cargando) {
    return (
      <div className="ea-empty">
        <span className="ea-spinner" style={{ width: 36, height: 36, border: '3px solid rgba(242,220,143,0.2)', borderTopColor: '#f2dc8f' }} />
        <p>Cargando productos...</p>
      </div>
    );
  }

  if (!productos || productos.length === 0) {
    return (
      <div className="ea-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <p>No hay productos para este proveedor.</p>
      </div>
    );
  }

  return (
    <div className="ea-table-wrap">
      <table className="ea-table">
        <thead>
          <tr>
            <th className="ea-th--sticky">ID Original</th>
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
          {productos.map(producto => (
            <ProductoRow
              key={producto.documentId}
              producto={producto}
              token={token}
              pendingChanges={pendingChanges[producto.documentId] || null}
              onMarkDirty={onMarkDirty}
              lightboxSetter={lightboxSetter}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
