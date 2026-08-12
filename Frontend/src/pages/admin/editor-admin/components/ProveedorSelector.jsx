import React from 'react';

/**
 * ProveedorSelector — Dropdown para elegir el proveedor a editar.
 * Muestra un spinner mientras carga y un mensaje de error si falla.
 */
export default function ProveedorSelector({ proveedores, seleccionado, onChange, cargando, error }) {
  return (
    <div className="ea-toolbar">
      <span className="ea-toolbar-label">Proveedor</span>

      {cargando ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(242,220,143,0.55)', fontSize: '0.82rem' }}>
          <span className="ea-spinner" style={{ borderTopColor: '#f2dc8f' }} />
          Cargando proveedores...
        </span>
      ) : error ? (
        <span style={{ color: '#fca5a5', fontSize: '0.82rem' }}>{error}</span>
      ) : (
        <select
          id="ea-select-proveedor"
          className="ea-select"
          value={seleccionado}
          onChange={e => onChange(e.target.value)}
        >
          <option value="">— Seleccioná un proveedor —</option>
          {proveedores.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      )}
    </div>
  );
}
