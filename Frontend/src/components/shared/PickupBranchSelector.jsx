import React from 'react';
import { usePaginaSucursales } from '../../hooks/usePaginaSucursales';
import './PickupBranchSelector.css';

export default function PickupBranchSelector({ selected, onSelect }) {
  const { sucursales, loading } = usePaginaSucursales();
  const branches = sucursales.flatMap(group => group.locales.filter(local => local.direccion).map(local => ({ ...local, provincia: group.provincia })));
  const key = branch => JSON.stringify([branch.provincia, branch.direccion]);
  const label = branch => [branch.direccion, branch.ciudad].filter(Boolean).join(' - ');
  return (
    <div style={{ padding: 20, border: '1px solid #e5d4cc', borderRadius: 12, background: '#fffaf7', marginBottom: 24 }}>
      <label htmlFor="pickup-branch" style={{ display: 'block', fontWeight: 700, marginBottom: 10, color: '#560203' }}>Elegí la sucursal de retiro</label>
      <select className="pickup-branch-select" id="pickup-branch" disabled={loading} value={selected ? key(selected) : ''} onChange={e => onSelect(branches.find(branch => key(branch) === e.target.value) || null)}>
        <option value="">{loading ? 'Cargando sucursales...' : 'Seleccioná una sucursal'}</option>
        {sucursales.map(group => <optgroup key={group.provincia} label={group.provincia}>{branches.filter(branch => branch.provincia === group.provincia).map(branch => <option key={key(branch)} value={key(branch)}>{label(branch)}</option>)}</optgroup>)}
      </select>
      {selected && <p style={{ margin: '12px 0 0', color: '#535353' }}>{selected.direccion}, {selected.provincia}{selected.telefono ? ` · ${selected.telefono}` : ''}</p>}
      <p style={{ fontSize: '.85rem', marginBottom: 0 }}>Retiro sin cargo. La forma de pago se elige en el siguiente paso.</p>
    </div>
  );
}
