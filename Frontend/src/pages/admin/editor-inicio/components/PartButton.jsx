import React from 'react';

// Elemento de la lista de partes, con el mismo estilo que el árbol del editor de banners.
export default function PartButton({ id, label, detail, image, icon, selected, onSelect }) {
  const active = selected === id;
  return (
    <li className={`ba-layer-banner ${active ? 'is-active' : ''}`} data-selected={active}>
      <button className="ba-layer-banner-select" aria-label={`Editar ${label}`} aria-pressed={active} onClick={() => onSelect(id)}>
        <span className="ba-thumbnail" aria-hidden="true">{image ? <img src={image} alt="" /> : icon}</span>
        <span>{label}<small>{detail}</small></span>
      </button>
    </li>
  );
}
