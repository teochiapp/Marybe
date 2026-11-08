import React from 'react';
import styled from 'styled-components';
import { imageUrl } from '../../../../../utils/bannerDesign';

const OrderList = styled.ol`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0 0 14px;
  padding: 0;
  list-style: none;
`;

const OrderRow = styled.li`
  display: grid;
  grid-template-columns: 22px 34px minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  padding: 5px 6px;
  border: 1px solid #eee5e3;
  border-radius: var(--radius-md);
  background: var(--color-blanco);
  font-size: 11px;

  > b {
    color: #a08c93;
    font-size: 10px;
    text-align: center;
  }

  img, i {
    width: 34px;
    height: 28px;
    border-radius: 4px;
    background: #f2eeeb;
    object-fit: cover;
  }

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  div {
    display: flex;
    gap: 4px;
  }

  button {
    padding: 3px 7px !important;
    font-size: 12px !important;
    line-height: 1;
  }
`;

// Alternativa accesible al arrastre: mover cada categoría con botones.
export default function OrdenPanel({ categories, onMove, onRestoreCatalogOrder, catalogOrder }) {
  return (
    <>
      <p className="ba-inspector-help">Arrastrá las tarjetas en la franja «Orden» sobre la vista previa, o usá las flechas. El orden solo afecta a esta sección de Inicio.</p>
      <OrderList aria-label="Orden de las categorías">
        {categories.map((category, index) => (
          <OrderRow key={category.documentId}>
            <b>{index + 1}</b>
            {imageUrl(category.portada) ? <img src={imageUrl(category.portada)} alt="" /> : <i aria-hidden="true" />}
            <span title={category.nombre}>{category.nombre}</span>
            <div>
              <button disabled={index === 0} aria-label={`Subir ${category.nombre}`} onClick={() => onMove(category.documentId, index - 1)}>↑</button>
              <button disabled={index === categories.length - 1} aria-label={`Bajar ${category.nombre}`} onClick={() => onMove(category.documentId, index + 1)}>↓</button>
            </div>
          </OrderRow>
        ))}
      </OrderList>
      <button className="ba-reset-device" disabled={catalogOrder} onClick={onRestoreCatalogOrder}>Usar el orden del catálogo</button>
    </>
  );
}
