import React from 'react';
import ColorField from '../ColorField';

export default function TextosPanel({ data, defaults, onChange }) {
  return (
    <>
      <p className="ba-inspector-help">Los textos de este bloque son independientes del nombre de la entidad elegida. El título se muestra en dos partes: la primera en cursiva y la segunda normal.</p>
      <details open>
        <summary>Texto superior</summary>
        <label>Texto sobre el título<input id="dc-texto-superior" value={data.texto_superior} maxLength={120} placeholder={defaults.texto_superior} onChange={event => onChange(draft => { draft.texto_superior = event.target.value; })} /></label>
        <small className="ba-hint">Si lo dejás vacío, no se muestra texto sobre el título.</small>
      </details>
      <details open>
        <summary>Título principal</summary>
        <label>Primera parte (cursiva)<input id="dc-titulo-cursiva" value={data.titulo_cursiva} maxLength={120} onChange={event => onChange(draft => { draft.titulo_cursiva = event.target.value; })} /></label>
        <label>Segunda parte<input id="dc-titulo-normal" value={data.titulo_normal} maxLength={120} onChange={event => onChange(draft => { draft.titulo_normal = event.target.value; })} /></label>
        <ColorField label="Color de la primera parte" value={data.color_titulo_cursiva} fallback="#FFFFFF" onChange={value => onChange(draft => { draft.color_titulo_cursiva = value; })} />
        <ColorField label="Color de la segunda parte" value={data.color_titulo_normal} fallback="#FFFFFF" onChange={value => onChange(draft => { draft.color_titulo_normal = value; })} />
      </details>
    </>
  );
}
