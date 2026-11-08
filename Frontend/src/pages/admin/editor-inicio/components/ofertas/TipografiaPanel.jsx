import React from 'react';
import OptionTiles from '../OptionTiles';
import TipografiaSample from './TipografiaSample';
import { ALINEACION_OPTIONS, FUENTE_OPTIONS, PESO_OPTIONS, TAMANO_OPTIONS, TYPOGRAPHY_DEFAULTS } from './ofertasModel';

const GROUPS = [
  { name: 'fuente', label: 'Fuente', options: FUENTE_OPTIONS, columns: 2 },
  { name: 'tamano', label: 'Tamaño', options: TAMANO_OPTIONS, columns: 2 },
  { name: 'peso', label: 'Peso', options: PESO_OPTIONS, columns: 3 },
  { name: 'alineacion', label: 'Alineación', options: ALINEACION_OPTIONS, columns: 3 },
];

// Solo opciones predefinidas: las fuentes del proyecto y tamaños que se adaptan solos al celular.
export default function TipografiaPanel({ data, areaColor, onChange }) {
  const original = GROUPS.every(group => data[group.name] === TYPOGRAPHY_DEFAULTS[group.name]);
  return (
    <>
      <p className="ba-inspector-help">Elegí entre opciones pensadas para el diseño de la tienda. Cada tamaño tiene su versión para celular.</p>
      {GROUPS.map(group => (
        <details open key={group.name}>
          <summary>{group.label}</summary>
          <OptionTiles
            label={`${group.label} del título`}
            options={group.options}
            value={data[group.name]}
            columns={group.columns}
            onChange={value => onChange(next => { next[group.name] = value; })}
            renderSample={value => <TipografiaSample kind={group.name} value={value} diseno={data} areaColor={areaColor} />}
          />
        </details>
      ))}
      {!original && <button type="button" className="ba-reset-device" onClick={() => onChange(next => { Object.assign(next, TYPOGRAPHY_DEFAULTS); })}>Restablecer la tipografía original</button>}
    </>
  );
}
