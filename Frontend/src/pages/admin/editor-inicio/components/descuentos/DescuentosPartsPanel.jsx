import React from 'react';
import styled from 'styled-components';
import { imageUrl } from '../../../../../utils/bannerDesign';
import PartButton from '../PartButton';
import { BLOQUE_INFO, DESCUENTOS_AREAS, entityStatus, tipoInfo } from './descuentosModel';

const GroupTitle = styled.p`
  margin: 18px 0 6px;
  color: #a08c93;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;

export default function DescuentosPartsPanel({ areaKey, data, entities, selected, onSelect }) {
  const info = BLOQUE_INFO[areaKey];
  const area = DESCUENTOS_AREAS.find(item => item.key === areaKey);
  const status = entityStatus(data, entities);
  const contenido = data.entidad_tipo
    ? `${tipoInfo(data.entidad_tipo)?.label}: ${data.entidad_nombre || data.entidad_id}${status === 'inexistente' ? ' · no disponible' : ''}`
    : 'Sin contenido elegido';
  const imagenDetalle = [
    data.imagen ? 'Imagen propia del bloque' : 'Imagen original',
    data.imagen_mobile ? 'celular propia' : null,
    data.escala_imagen_desktop ? `${data.escala_imagen_desktop}%` : null,
  ].filter(Boolean).join(' · ');
  return (
    <aside className="ba-sidebar ba-layers">
      <div className="ba-layers-heading"><div><p className="ba-eyebrow">DESCUENTOS</p><h2>Partes del bloque</h2></div><span>4</span></div>
      <p className="ba-scope-note">{area.label} se muestra en {info.donde}. Su configuración es independiente del otro bloque.</p>
      <nav aria-label="Partes de Descuentos">
        <GroupTitle>Contenido</GroupTitle>
        <ul className="ba-layer-list">
          <PartButton id="contenido" label="Contenido promocionado" detail={contenido} icon="◎" selected={selected} onSelect={onSelect} />
          <PartButton id="texto" label="Textos del bloque" detail={`${data.titulo_cursiva || ''} ${data.titulo_normal || ''}`.trim() || 'Sin título'} icon="T" selected={selected} onSelect={onSelect} />
        </ul>
        <GroupTitle>Diseño</GroupTitle>
        <ul className="ba-layer-list">
          <PartButton id="imagen" label="Imagen promocional" detail={imagenDetalle} image={imageUrl(data.imagen) || info.imagenOriginal} icon="▣" selected={selected} onSelect={onSelect} />
          <PartButton id="boton" label="Botón" detail={`${data.boton_texto || 'Conocer más'} · ${data.boton_modo === 'personalizado' ? 'enlace personalizado' : 'enlace automático'}`} icon="↗" selected={selected} onSelect={onSelect} />
        </ul>
      </nav>
    </aside>
  );
}
