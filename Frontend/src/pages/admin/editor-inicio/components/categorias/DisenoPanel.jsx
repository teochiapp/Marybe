import React from 'react';
import OptionTiles from '../OptionTiles';
import FormaSample from './FormaSample';
import BotonSample from './BotonSample';
import { BOTON_OPTIONS, ESTILO_BOTON_OPTIONS, FORMA_OPTIONS } from './categoriasModel';

// Forma de las tarjetas o estilo de los botones: se aplica a todas las categorías de la sección.
export default function DisenoPanel({ part, data, onChange }) {
  if (part === 'forma') {
    return (
      <>
        <p className="ba-inspector-help">La forma se aplica a todas las tarjetas de la sección. Las imágenes se recortan sin deformarse.</p>
        <OptionTiles label="Forma de las tarjetas" options={FORMA_OPTIONS} value={data.forma} onChange={value => onChange(next => { next.forma = value; })} renderSample={value => <FormaSample forma={value} />} />
      </>
    );
  }
  return (
    <>
      <p className="ba-inspector-help">Los botones mantienen la tipografía y los colores de la tienda. El cambio se aplica a todas las categorías.</p>
      <details open>
        <summary>Forma del botón</summary>
        <OptionTiles label="Forma del botón" options={BOTON_OPTIONS} value={data.boton} onChange={value => onChange(next => { next.boton = value; })} renderSample={value => <BotonSample boton={value} estilo={data.estiloBoton} />} />
      </details>
      <details open>
        <summary>Color del botón</summary>
        <OptionTiles label="Color del botón" options={ESTILO_BOTON_OPTIONS} value={data.estiloBoton} onChange={value => onChange(next => { next.estiloBoton = value; })} renderSample={value => <BotonSample boton={data.boton} estilo={value} />} />
      </details>
    </>
  );
}
