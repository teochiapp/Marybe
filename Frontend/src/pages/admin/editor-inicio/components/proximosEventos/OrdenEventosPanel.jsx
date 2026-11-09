import React from 'react';
import styled from 'styled-components';

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
  grid-template-columns: 22px minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  padding: 7px 8px;
  border: 1px solid #eee5e3;
  border-radius: var(--radius-md);
  background: var(--color-blanco);
  font-size: 11px;

  > b {
    color: #a08c93;
    font-size: 10px;
    text-align: center;
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

export default function OrdenEventosPanel({
  eventos,
  catalogOrder,
  onMove,
  onRestoreCatalogOrder,
}) {
  return (
    <>
      <p className="ba-inspector-help">
        Arrastrá las tarjetas en la franja «Orden» sobre la vista previa, o usá las flechas para definir el orden de aparición en Inicio.
      </p>
      <OrderList aria-label="Orden de los eventos">
        {eventos.map((ev, index) => (
          <OrderRow key={ev.documentId}>
            <b>{index + 1}</b>
            <span title={ev.titulo}>{ev.titulo}</span>
            <div>
              <button
                type="button"
                disabled={index === 0}
                aria-label={`Mover ${ev.titulo} antes`}
                onClick={() => onMove(ev.documentId, index - 1)}
              >
                ↑
              </button>
              <button
                type="button"
                disabled={index === eventos.length - 1}
                aria-label={`Mover ${ev.titulo} después`}
                onClick={() => onMove(ev.documentId, index + 1)}
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
