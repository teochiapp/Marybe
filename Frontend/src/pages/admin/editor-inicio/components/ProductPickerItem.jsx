import React from 'react';
import styled from 'styled-components';
import { imageUrl } from '../../../../utils/bannerDesign';
import { getProductPrice } from '../../../../utils/productPrice';

export const ProductPickerList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0 0 12px;
  padding: 0;
  list-style: none;
`;

const ProductRow = styled.li`
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) auto;
  align-items: center;
  gap: 9px;
  padding: 6px;
  border: 1px solid #eee5e3;
  border-radius: var(--radius-md);
  background: ${({ $selected }) => ($selected ? '#f7eeee' : 'var(--color-blanco)')};

  img, span[aria-hidden] {
    width: 40px;
    height: 40px;
    border-radius: 6px;
    background: #f6f2f0;
    object-fit: contain;
  }

  > span:last-child {
    display: flex;
    gap: 4px;
  }

  button {
    padding: 6px 9px !important;
    font-size: 11px !important;
    white-space: nowrap;
  }
`;

const ProductText = styled.div`
  min-width: 0;
  font-size: 11px;
  line-height: 1.35;

  small {
    display: block;
    color: #a08c93;
    font-size: 9px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  strong {
    display: block;
    overflow: hidden;
    color: var(--color-marron-cuarto);
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span { color: var(--color-bordo-secundario); font-weight: 600; }
`;

const formatPrice = value => `$${Number(value || 0).toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;

// Fila de producto para los selectores del Editor de Inicio (imagen, marca, nombre, precio y acción).
export default function ProductPickerItem({ product, selected, disabled, onToggle, actions }) {
  const image = product.portada ? imageUrl(product.portada) : '';
  const { price, offerPrice } = getProductPrice(product);
  return (
    <ProductRow $selected={selected}>
      {image ? <img src={image} alt="" loading="lazy" /> : <span aria-hidden="true" />}
      <ProductText><small>{product.marca || 'Sin marca'}</small><strong title={product.nombre}>{product.nombre}</strong><span>{formatPrice(offerPrice || price)}</span></ProductText>
      <span>
        {actions}
        <button type="button" aria-pressed={selected} disabled={disabled && !selected} aria-label={`${selected ? 'Quitar' : 'Agregar'} ${product.nombre}`} onClick={() => onToggle(product)}>{selected ? 'Quitar' : 'Agregar'}</button>
      </span>
    </ProductRow>
  );
}
