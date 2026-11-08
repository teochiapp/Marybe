import React from 'react';
import styled from 'styled-components';
import { imageUrl } from '../../../../../utils/bannerDesign';
import PartButton from '../PartButton';

const GroupTitle = styled.p`
  margin: 18px 0 6px;
  color: #a08c93;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;

export default function CategoriaDestacadaPartsPanel({ data, categoryName, shown, selected, onSelect }) {
  return (
    <aside className="ba-sidebar ba-layers">
      <div className="ba-layers-heading"><div><p className="ba-eyebrow">CATEGORÍA DESTACADA (1)</p><h2>Partes de la sección</h2></div><span>2</span></div>
      <p className="ba-scope-note">Esta configuración solo afecta a Categoría Destacada (1). Categoría Destacada (2) es independiente.</p>
      <nav aria-label="Partes de Categoría Destacada">
        <GroupTitle>Contenido</GroupTitle>
        <ul className="ba-layer-list">
          <PartButton id="contenido" label="Categoría y título" detail={categoryName ? `${categoryName} · ${data.titulo || 'Sin título'}` : 'Sin categoría'} icon="T" selected={selected} onSelect={onSelect} />
        </ul>
        <GroupTitle>Productos</GroupTitle>
        <ul className="ba-layer-list">
          <PartButton id="productos" label="Productos de la sección" detail={data.productos.length ? `${data.productos.length} elegidos, en orden propio` : `Automático · ${shown.length} visibles`} image={imageUrl(shown[0]?.portada)} icon="▦" selected={selected} onSelect={onSelect} />
        </ul>
      </nav>
    </aside>
  );
}
