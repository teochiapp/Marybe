import React from 'react';
import styled from 'styled-components';
import { imageUrl } from '../../../../../utils/bannerDesign';
import { DEFAULT_GIFT_CARD_IMAGE } from '../../../../../utils/giftCardSection';
import PartButton from '../PartButton';
import {
  PART_APARIENCIA,
  PART_BOTON,
  PART_CONTENIDO,
  PART_IMAGEN,
} from './giftCardModel';

const GroupTitle = styled.p`
  margin: 18px 0 6px;
  color: #a08c93;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;

export default function GiftCardPartsPanel({ data, selected, onSelect }) {
  const titleSummary = `${data?.titulo_destacado || ''} ${data?.titulo_complementario || ''}`.trim();
  const imgUrl = imageUrl(data?.imagen) || DEFAULT_GIFT_CARD_IMAGE;

  return (
    <aside className="ba-sidebar ba-layers">
      <div className="ba-layers-heading">
        <div>
          <p className="ba-eyebrow">SECCIÓN GIFT CARD</p>
          <h2>Partes de la sección</h2>
        </div>
        <span>4</span>
      </div>
      <p className="ba-scope-note">
        Personalizá los textos, la imagen de la tarjeta, el color de fondo y el botón de acción.
      </p>
      <nav aria-label="Partes de la sección Gift Card">
        <GroupTitle>Contenido</GroupTitle>
        <ul className="ba-layer-list">
          <PartButton
            id={PART_CONTENIDO}
            label="Título y bloques descriptivos"
            detail={titleSummary || 'Regalá Marybe'}
            icon="✎"
            selected={selected}
            onSelect={onSelect}
          />
          <PartButton
            id={PART_BOTON}
            label="Botón «Conocer más»"
            detail={`${data?.boton_texto || 'Conocer más'} · ${data?.boton_enlace || '/gift-card'}`}
            icon="⬭"
            selected={selected}
            onSelect={onSelect}
          />
        </ul>

        <GroupTitle>Imagen y apariencia</GroupTitle>
        <ul className="ba-layer-list">
          <PartButton
            id={PART_IMAGEN}
            label="Imagen principal"
            detail={data?.imagen ? 'Imagen personalizada' : 'Tarjeta original Marybe'}
            image={imgUrl}
            icon="▧"
            selected={selected}
            onSelect={onSelect}
          />
          <PartButton
            id={PART_APARIENCIA}
            label="Color de fondo y contraste"
            detail={data?.color_fondo || '#6A0304'}
            icon="◉"
            selected={selected}
            onSelect={onSelect}
          />
        </ul>
      </nav>
    </aside>
  );
}
