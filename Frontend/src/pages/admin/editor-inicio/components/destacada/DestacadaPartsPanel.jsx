import React from 'react';
import { imageUrl } from '../../../../../utils/bannerDesign';
import { MAX_BOTTOM_BANNERS, areaInfo, destacadaParts } from './destacadaModel';

function partSummary(part, data, area) {
  if (part.id === 'textos') return `${data.titulo_cursiva || area.defaults.cursiva} ${data.titulo_normal || area.defaults.normal}`;
  if (part.id === 'imagen') return data.imagen_desktop ? (data.imagen_mobile ? 'Computadora y celular' : 'Computadora') : 'Sin imagen';
  if (part.id === 'productos') return `${data.productos.length} ${data.productos.length === 1 ? 'producto' : 'productos'}`;
  return data.banners[part.index]?.titulo || 'Sin título';
}

function partThumbnail(part, data) {
  if (part.id === 'imagen') return imageUrl(data.imagen_desktop);
  if (part.index != null) return imageUrl(data.banners[part.index]?.imagen);
  return '';
}

const ICONS = { textos: 'T', productos: '▦', imagen: '▧' };

export default function DestacadaPartsPanel({ areaKey, data, selected, busy, onSelect, onAddBanner }) {
  const area = areaInfo(areaKey);
  const parts = destacadaParts(areaKey, data);
  return (
    <aside className="ba-sidebar ba-layers">
      <div className="ba-layers-heading"><div><p className="ba-eyebrow">LO NUEVO EN MARYBE</p><h2>Partes de la sección</h2></div><span>{parts.length}</span></div>
      <p className="ba-scope-note">Elegí una parte o hacé clic sobre ella en la vista previa para editarla.</p>
      <nav aria-label="Partes de la Sección Destacada">
        <ul className="ba-layer-list">
          {parts.map(part => {
            const active = selected === part.id;
            const image = partThumbnail(part, data);
            return (
              <li key={part.id} className={`ba-layer-banner ${active ? 'is-active' : ''}`} data-selected={active}>
                <button className="ba-layer-banner-select" aria-label={`Editar ${part.label}`} aria-pressed={active} onClick={() => onSelect(part.id)}>
                  <span className="ba-thumbnail" aria-hidden="true">{image ? <img src={image} alt="" /> : ICONS[part.id] || '▭'}</span>
                  <span>{part.label}<small>{partSummary(part, data, area)}</small></span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      {area.banners && data.banners.length < MAX_BOTTOM_BANNERS && <button className="ba-add-section" disabled={busy} onClick={onAddBanner}>＋ Agregar banner inferior</button>}
      {!area.banners && <p className="ba-scope-note">En Hogar esta sección no muestra banners inferiores.</p>}
    </aside>
  );
}
