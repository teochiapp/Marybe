import React from 'react';
import styled from 'styled-components';
import { imageUrl } from '../../../../../utils/bannerDesign';
import { formatCuotas } from '../../../../../utils/beneficiosSection';
import PartButton from '../PartButton';
import {
  PART_CONTENIDO,
  PART_ORDEN,
  cardPart,
  isCardModified,
  orderedPromociones,
} from './beneficiosModel';

const GroupTitle = styled.p`
  margin: 18px 0 6px;
  color: #a08c93;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;

export default function BeneficiosPartsPanel({
  data,
  promociones,
  published,
  selected,
  onSelect,
}) {
  const ordered = orderedPromociones(data, promociones);

  return (
    <aside className="ba-sidebar ba-layers">
      <div className="ba-layers-heading">
        <div>
          <p className="ba-eyebrow">SECCIÓN BENEFICIOS</p>
          <h2>Partes de la sección</h2>
        </div>
        <span>{ordered.length}</span>
      </div>
      <p className="ba-scope-note">
        Elegí una tarjeta para modificar sus textos y logo, o ajustá el orden y el bloque inferior.
      </p>
      <nav aria-label="Partes de la sección Beneficios">
        <GroupTitle>Sección general</GroupTitle>
        <ul className="ba-layer-list">
          <PartButton
            id={PART_CONTENIDO}
            label="Textos y botón inferior"
            detail={data.titulo || 'Beneficios para vos'}
            icon="✎"
            selected={selected}
            onSelect={onSelect}
          />
          <PartButton
            id={PART_ORDEN}
            label="Orden de beneficios"
            detail="Arrastrá o usá las flechas"
            icon="⇄"
            selected={selected}
            onSelect={onSelect}
          />
        </ul>

        <GroupTitle>Tarjetas de beneficios</GroupTitle>
        {!ordered.length && (
          <p className="ba-layer-empty">No hay beneficios activos publicados en Strapi.</p>
        )}
        <ul className="ba-layer-list">
          {ordered.map((promo, index) => {
            const modified = isCardModified(promo.documentId, data, published);
            const cuotas = formatCuotas(promo.cuotas_cantidad);
            const detail = modified
              ? 'Cambios sin publicar'
              : cuotas
                ? `Hasta ${cuotas} ${promo.cuotas_descripcion || ''}`.trim()
                : promo.cuotas_descripcion || 'Sin descripción';

            return (
              <PartButton
                key={promo.documentId}
                id={cardPart(promo.documentId)}
                label={`${index + 1}. ${promo.nombre}`}
                detail={detail}
                image={imageUrl(promo.logo)}
                icon="▧"
                selected={selected}
                onSelect={onSelect}
              />
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
