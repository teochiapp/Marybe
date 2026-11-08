import React from 'react';
import styled from 'styled-components';
import PartButton from '../PartButton';
import { COLOR_OPTIONS, ESPACIADO_OPTIONS, FONDO_OPTIONS, FUENTE_OPTIONS, PESO_OPTIONS, TAMANO_OPTIONS, labelOf } from './ofertasModel';

const GroupTitle = styled.p`
  margin: 18px 0 6px;
  color: #a08c93;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;

export default function OfertasPartsPanel({ data, selected, onSelect }) {
  return (
    <aside className="ba-sidebar ba-layers">
      <div className="ba-layers-heading"><div><p className="ba-eyebrow">SECCIÓN OFERTAS</p><h2>Partes de la sección</h2></div><span>4</span></div>
      <p className="ba-scope-note">Las insignias de descuento, sus porcentajes y los filtros de la tienda no se modifican desde acá.</p>
      <nav aria-label="Partes de la sección Ofertas">
        <GroupTitle>Contenido</GroupTitle>
        <ul className="ba-layer-list">
          <PartButton id="titulo" label="Título principal" detail={data.titulo || 'Sin título'} icon="T" selected={selected} onSelect={onSelect} />
        </ul>
        <GroupTitle>Tipografía</GroupTitle>
        <ul className="ba-layer-list">
          <PartButton id="tipografia" label="Tipografía del título" detail={`${labelOf(FUENTE_OPTIONS, data.fuente)} · ${labelOf(TAMANO_OPTIONS, data.tamano)} · ${labelOf(PESO_OPTIONS, data.peso)}`} icon="Aa" selected={selected} onSelect={onSelect} />
        </ul>
        <GroupTitle>Diseño</GroupTitle>
        <ul className="ba-layer-list">
          <PartButton id="color" label="Color del título" detail={labelOf(COLOR_OPTIONS, data.color)} icon="A" selected={selected} onSelect={onSelect} />
          <PartButton id="fondo" label="Fondo y espaciado" detail={`${labelOf(FONDO_OPTIONS, data.fondo)} · ${labelOf(ESPACIADO_OPTIONS, data.espaciado)}`} icon="▭" selected={selected} onSelect={onSelect} />
        </ul>
      </nav>
    </aside>
  );
}
