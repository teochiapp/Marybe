import React from 'react';
import { MAX_TITLE } from './ofertasModel';

export default function TituloPanel({ data, defaultTitle, onChange }) {
  return (
    <>
      <p className="ba-inspector-help">Texto principal de la sección. Las insignias de descuento y sus enlaces a la tienda no cambian.</p>
      <details open>
        <summary>Título principal</summary>
        <label htmlFor="ofertas-titulo">Título<input id="ofertas-titulo" name="titulo" value={data.titulo} maxLength={MAX_TITLE} placeholder={defaultTitle} onChange={event => onChange(next => { next.titulo = event.target.value; })} /></label>
        <small className="ba-hint">{data.titulo.length} de {MAX_TITLE} caracteres. En celulares el título se achica automáticamente.</small>
        {data.titulo.trim() !== defaultTitle && <button type="button" className="ba-reset-device" onClick={() => onChange(next => { next.titulo = defaultTitle; })}>Usar el título original</button>}
      </details>
    </>
  );
}
