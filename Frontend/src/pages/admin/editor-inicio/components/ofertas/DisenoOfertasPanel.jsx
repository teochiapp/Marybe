import React from 'react';
import OptionTiles from '../OptionTiles';
import TipografiaSample from './TipografiaSample';
import { COLOR_OPTIONS, ESPACIADO_OPTIONS, FONDO_OPTIONS } from './ofertasModel';

// Color del título (paleta de la tienda) o fondo y espaciado de la sección.
export default function DisenoOfertasPanel({ part, data, areaColor, onChange }) {
  const tiles = (name, label, options, columns) => (
    <OptionTiles
      label={label}
      options={options}
      value={data[name]}
      columns={columns}
      onChange={value => onChange(next => { next[name] = value; })}
      renderSample={value => <TipografiaSample kind={name} value={value} diseno={data} areaColor={areaColor} />}
    />
  );
  if (part === 'color') {
    return (
      <>
        <p className="ba-inspector-help">Colores de la paleta de la tienda, con buen contraste sobre los fondos disponibles. «Original» usa el color propio de cada área.</p>
        {tiles('color', 'Color del título', COLOR_OPTIONS, 3)}
      </>
    );
  }
  return (
    <>
      <p className="ba-inspector-help">Las insignias tienen fondo transparente, así que se ven bien sobre cualquiera de estos fondos.</p>
      <details open>
        <summary>Fondo de la sección</summary>
        {tiles('fondo', 'Fondo de la sección', FONDO_OPTIONS, 3)}
      </details>
      <details open>
        <summary>Espaciado superior e inferior</summary>
        {tiles('espaciado', 'Espaciado superior e inferior', ESPACIADO_OPTIONS, 3)}
      </details>
    </>
  );
}
