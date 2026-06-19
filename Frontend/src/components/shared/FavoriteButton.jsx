import React, { useContext } from 'react';
import styled from 'styled-components';
import { FavoritesContext } from '../../context/FavoritesContext';

const HeartOutline = () => (
  <svg viewBox="0 0 24 24">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const HeartIconBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ $fav }) => ($fav ? 'var(--color-bordo-secundario)' : '#bdbdbd')};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: transform 0.2s ease;

  svg {
    width: ${({ $size }) => $size || '22px'};
    height: ${({ $size }) => $size || '22px'};
    fill: ${({ $fav }) => ($fav ? 'var(--color-bordo-secundario)' : 'none')};
    stroke: var(--color-bordo-secundario);
    stroke-width: 2;

    @media (max-width: 600px) {
      width: ${({ $mobileSize }) => $mobileSize || '20px'};
      height: ${({ $mobileSize }) => $mobileSize || '20px'};
    }
  }

  &:hover {
    color: currentColor;
    transform: scale(1.1);
  }
`;

export default function FavoriteButton({ product, className, size, mobileSize }) {
  const { isFavorite, toggleFavorite } = useContext(FavoritesContext);
  
  if (!product) return null;
  
  const id = product.documentId || product.id;
  if (!id) return null;
  
  const fav = isFavorite(id);

  return (
    <HeartIconBtn
      className={className}
      $fav={fav}
      $size={size}
      $mobileSize={mobileSize}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(product);
      }}
      aria-label={fav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      title={fav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
    >
      <HeartOutline />
    </HeartIconBtn>
  );
}
