import React from 'react';
import styled from 'styled-components';
import { FiArrowRight, FiGift, FiHeart, FiShoppingBag, FiStar, FiTag } from 'react-icons/fi';
import { HiOutlineSparkles } from 'react-icons/hi2';

export const CATEGORIA_DESTACADA_ICONOS = [
  { value: '', label: 'Sin ícono', description: 'Solo el texto', Icon: null },
  { value: 'estrella', label: 'Estrella', description: 'Destacados', Icon: FiStar },
  { value: 'corazon', label: 'Corazón', description: 'Favoritos', Icon: FiHeart },
  { value: 'regalo', label: 'Regalo', description: 'Especiales', Icon: FiGift },
  { value: 'destellos', label: 'Destellos', description: 'Novedades', Icon: HiOutlineSparkles },
  { value: 'etiqueta', label: 'Etiqueta', description: 'Promociones', Icon: FiTag },
  { value: 'flecha', label: 'Flecha', description: 'Explorar', Icon: FiArrowRight },
  { value: 'bolsa', label: 'Bolsa de compras', description: 'Tienda', Icon: FiShoppingBag },
];

const TitleEndIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.3em;
  vertical-align: -0.1em;
  color: currentColor;
  line-height: 1;

  svg {
    width: 0.82em;
    height: 0.82em;
    stroke-width: 2.1;
    flex-shrink: 0;
  }
`;

export function findTitleIcon(value) {
  if (!value || typeof value !== 'string') return null;
  return CATEGORIA_DESTACADA_ICONOS.find(item => item.value === value && item.Icon) || null;
}

export function CategoriaDestacadaTitleIcon({ icono }) {
  const entry = findTitleIcon(icono);
  if (!entry) return null;
  const { Icon } = entry;
  return (
    <TitleEndIcon data-title-icon={entry.value} aria-hidden="true">
      <Icon />
    </TitleEndIcon>
  );
}
