import React from 'react';
import styled from 'styled-components';
import { imageUrl } from '../../../../../utils/bannerDesign';
import PartButton from '../PartButton';
import { BOTON_OPTIONS, ESTILO_BOTON_OPTIONS, FORMA_OPTIONS, categoryPart, orderedCategories } from './categoriasModel';

const GroupTitle = styled.p`
  margin: 18px 0 6px;
  color: #a08c93;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;

const labelOf = (options, value) => options.find(option => option.value === value)?.label || '';

export default function CategoriasPartsPanel({ data, categories, published, selected, onSelect }) {
  const ordered = orderedCategories(data, categories);
  return (
    <aside className="ba-sidebar ba-layers">
      <div className="ba-layers-heading"><div><p className="ba-eyebrow">SECCIÓN CATEGORÍAS</p><h2>Partes de la sección</h2></div><span>{ordered.length}</span></div>
      <p className="ba-scope-note">Elegí una categoría para cambiar su imagen, o el orden y el diseño de la sección.</p>
      <nav aria-label="Partes de la sección Categorías">
        <GroupTitle>Contenido</GroupTitle>
        {!ordered.length && <p className="ba-layer-empty">No hay categorías publicadas en esta área.</p>}
        <ul className="ba-layer-list">
          {ordered.map(category => (
            <PartButton
              key={category.documentId}
              id={categoryPart(category.documentId)}
              label={category.nombre}
              detail={(category.portada?.id ?? null) !== (published.portadas[category.documentId]?.id ?? null) ? 'Imagen nueva sin publicar' : category.portada ? 'Imagen de portada' : 'Sin imagen'}
              image={imageUrl(category.portada)}
              icon="▧"
              selected={selected}
              onSelect={onSelect}
            />
          ))}
        </ul>
        <GroupTitle>Organización</GroupTitle>
        <ul className="ba-layer-list">
          <PartButton id="orden" label="Orden de las categorías" detail="Arrastrá o usá las flechas" icon="⇄" selected={selected} onSelect={onSelect} />
        </ul>
        <GroupTitle>Diseño</GroupTitle>
        <ul className="ba-layer-list">
          <PartButton id="forma" label="Forma de las tarjetas" detail={labelOf(FORMA_OPTIONS, data.forma)} icon="▢" selected={selected} onSelect={onSelect} />
          <PartButton id="botones" label="Estilo de los botones" detail={`${labelOf(BOTON_OPTIONS, data.boton)} · ${labelOf(ESTILO_BOTON_OPTIONS, data.estiloBoton)}`} icon="⬭" selected={selected} onSelect={onSelect} />
        </ul>
      </nav>
    </aside>
  );
}
