import React from 'react';

const SECTION_ORDER = ['Perfumería', 'Hogar', ''];

export default function ContenidoPanel({ data, categories, defaultTitle, onChange, onCategoryChange }) {
  const current = categories.find(category => category.documentId === data.categoria);
  const groups = SECTION_ORDER.map(seccion => ({ seccion, items: categories.filter(category => (category.seccion || '') === seccion) })).filter(group => group.items.length);
  return (
    <>
      <p className="ba-inspector-help">Elegí qué categoría de la tienda se muestra en esta sección y el título que la acompaña.</p>
      <details open>
        <summary>Categoría</summary>
        <label>Categoría de la tienda
          <select value={data.categoria || ''} onChange={event => onCategoryChange(event.target.value || null)}>
            <option value="">Elegí una categoría…</option>
            {groups.map(group => (
              <optgroup key={group.seccion || 'otras'} label={group.seccion || 'Sin área'}>
                {group.items.map(category => <option key={category.documentId} value={category.documentId}>{category.nombre} ({category.productos} {category.productos === 1 ? 'producto' : 'productos'})</option>)}
              </optgroup>
            ))}
          </select>
        </label>
        {data.categoria && !current && <small className="ba-hint" role="alert">La categoría guardada ya no existe o no está publicada. Elegí otra.</small>}
        {current && current.productos === 0 && <small className="ba-hint" role="alert">Esta categoría no tiene productos publicados: la sección no se muestra en la tienda.</small>}
        {!current && !data.categoria && <small className="ba-hint">Sin categoría, la sección no se muestra en la tienda.</small>}
      </details>
      <details open>
        <summary>Título principal</summary>
        <label>Título<input id="cd-titulo" value={data.titulo} maxLength={120} placeholder={defaultTitle} onChange={event => onChange(next => { next.titulo = event.target.value; })} /></label>
        <small className="ba-hint">Se muestra con la tipografía y el estilo actuales de la sección.</small>
      </details>
    </>
  );
}
