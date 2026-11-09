import React from 'react';
import styled from 'styled-components';
import { imageUrl } from '../../../../../utils/bannerDesign';
import { findTitleIcon } from '../../../../../utils/categoriaDestacadaIconos';
import PartButton from '../PartButton';
import {
  CATEGORIA_DESTACADA_MODULES,
  DENSIDAD_OPTIONS,
  ESPACIADO_OPTIONS,
  FONDO_OPTIONS,
  labelOf,
} from './categoriaDestacadaModel';

const GroupTitle = styled.p`
  margin: 18px 0 6px;
  color: #a08c93;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;

export default function CategoriaDestacadaPartsPanel({ moduleInfo = CATEGORIA_DESTACADA_MODULES['categoria-destacada-1'], data, categoryName, shown, selected, onSelect }) {
  const iconEntry = findTitleIcon(data.icono);
  const titleDetail = `${data.titulo || 'Sin título'}${iconEntry ? ` · ícono ${iconEntry.label.toLowerCase()}` : ''}`;
  const fondoLabel = labelOf(FONDO_OPTIONS, data.fondo || 'blanco');
  const espaciadoLabel = labelOf(ESPACIADO_OPTIONS, data.espaciado || 'original');
  const densidadLabel = labelOf(DENSIDAD_OPTIONS, data.densidad || 'original');
  return (
    <aside className="ba-sidebar ba-layers">
      <div className="ba-layers-heading"><div><p className="ba-eyebrow">{moduleInfo.eyebrow}</p><h2>Partes de la sección</h2></div><span>3</span></div>
      <p className="ba-scope-note">Esta configuración solo afecta a {moduleInfo.title}. {moduleInfo.otherTitle} es independiente.</p>
      <nav aria-label={`Partes de ${moduleInfo.title}`}>
        <GroupTitle>Contenido</GroupTitle>
        <ul className="ba-layer-list">
          <PartButton id="contenido" label="Categoría y título" detail={categoryName ? `${categoryName} · ${titleDetail}` : 'Sin categoría'} icon="T" selected={selected} onSelect={onSelect} />
        </ul>
        <GroupTitle>Productos</GroupTitle>
        <ul className="ba-layer-list">
          <PartButton id="productos" label="Productos de la sección" detail={data.productos.length ? `${data.productos.length} elegidos, en orden propio` : `Automático · ${shown.length} visibles`} image={imageUrl(shown[0]?.portada)} icon="▦" selected={selected} onSelect={onSelect} />
        </ul>
        <GroupTitle>Diseño</GroupTitle>
        <ul className="ba-layer-list">
          <PartButton id="diseno" label="Fondo, espaciado y tarjetas" detail={`${fondoLabel} · ${espaciadoLabel} · Densidad ${densidadLabel.toLowerCase()}`} icon="▭" selected={selected} onSelect={onSelect} />
        </ul>
      </nav>
    </aside>
  );
}
