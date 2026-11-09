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
  grid-template-columns: 22px 38px minmax(0, 1fr) auto;
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

  img,
  i {
    width: 38px;
    height: 28px;
    border-radius: 4px;
    background: #f2eeeb;
    object-fit: contain;
    padding: 2px;
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

export default function OrdenBeneficiosPanel({
  promociones,
  catalogOrder,
  onMove,
  onRestoreCatalogOrder,
}) {
  return (
    <>
      <p className="ba-inspector-help">
        Arrastrá las tarjetas en la franja «Orden» sobre la vista previa, o usá las flechas para cambiar el orden de aparición en Inicio.
      </p>
      <OrderList aria-label="Orden de los beneficios">
        {promociones.map((promo, index) => (
          <OrderRow key={promo.documentId}>
            <b>{index + 1}</b>
            {imageUrl(promo.logo) ? (
              <img src={imageUrl(promo.logo)} alt="" />
            ) : (
              <i aria-hidden="true" />
            )}
            <span title={promo.nombre}>{promo.nombre}</span>
            <div>
              <button
                type="button"
                disabled={index === 0}
                aria-label={`Mover ${promo.nombre} antes`}
                onClick={() => onMove(promo.documentId, index - 1)}
              >
                ↑
              </button>
              <button
                type="button"
                disabled={index === promociones.length - 1}
                aria-label={`Mover ${promo.nombre} después`}
                onClick={() => onMove(promo.documentId, index + 1)}
              >
                ↓
              </button>
            </div>
          </OrderRow>
        ))}
      </OrderList>
      <button
        type="button"
        className="ba-reset-device"
        disabled={catalogOrder}
        onClick={onRestoreCatalogOrder}
      >
        Usar el orden predeterminado
      </button>
    </>
  );
}
