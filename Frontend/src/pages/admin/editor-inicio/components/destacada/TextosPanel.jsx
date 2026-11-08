import React from 'react';
import ColorField from '../ColorField';
import { areaInfo } from './destacadaModel';

export default function TextosPanel({ areaKey, data, onChange }) {
  const { defaults } = areaInfo(areaKey);
  return (
    <>
      <p className="ba-inspector-help">El título se muestra en dos partes: la primera en cursiva y la segunda resaltada.</p>
      <details open>
        <summary>Título</summary>
        <label>Primera parte (cursiva)<input id="dd-titulo-cursiva" value={data.titulo_cursiva} maxLength={120} placeholder={defaults.cursiva} onChange={event => onChange(draft => { draft.titulo_cursiva = event.target.value; })} /></label>
        <label>Segunda parte<input value={data.titulo_normal} maxLength={120} placeholder={defaults.normal} onChange={event => onChange(draft => { draft.titulo_normal = event.target.value; })} /></label>
        <ColorField label="Color de la primera parte" value={data.color_titulo_cursiva} fallback={defaults.colorCursiva} onChange={value => onChange(draft => { draft.color_titulo_cursiva = value; })} />
        <ColorField label="Color de la segunda parte" value={data.color_titulo_normal} fallback={defaults.colorNormal} onChange={value => onChange(draft => { draft.color_titulo_normal = value; })} />
      </details>
      <details open>
        <summary>Subtítulo</summary>
        <label>Texto debajo del título<textarea rows={3} maxLength={500} value={data.subtitulo} placeholder={defaults.subtitulo} onChange={event => onChange(draft => { draft.subtitulo = event.target.value; })} /></label>
        <small className="ba-hint">Si lo dejás vacío se muestra el texto predeterminado.</small>
      </details>
    </>
  );
}
