import React, { useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import { imageUrl } from '../../../../utils/bannerDesign';

const GAP = 8;

const StripSection = styled.section`
  padding: 12px 18px 14px;
  border-bottom: 1px solid #ebe5e5;
  background: #fcfafa;
`;

const StripHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 4px 12px;
  margin-bottom: 10px;

  h2 {
    margin: 0;
    color: var(--color-marron-cuarto);
    font-size: 12px;
    font-weight: 700;
  }

  p {
    margin: 0;
    color: #8a7d81;
    font-size: 10.5px;
  }
`;

const StripList = styled.ol`
  position: relative;
  display: flex;
  gap: ${GAP}px;
  margin: 0;
  padding: 2px 2px 8px;
  overflow-x: auto;
  list-style: none;
  scrollbar-width: thin;
`;

const StripItem = styled.li`
  position: relative;
  flex: 0 0 112px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 6px;
  border: 1px solid ${({ $selected }) => ($selected ? 'var(--color-bordo-secundario)' : '#e7dfdd')};
  border-radius: 10px;
  background: var(--color-blanco);
  cursor: grab;
  touch-action: none;
  user-select: none;
  transition: transform 0.18s ease, box-shadow 0.18s ease;

  &:focus-visible {
    outline: 2px solid var(--color-bordo-secundario);
    outline-offset: 2px;
  }

  ${({ $dragging }) => $dragging && css`
    z-index: 2;
    cursor: grabbing;
    transition: none;
    border-color: var(--color-bordo-secundario);
    box-shadow: 0 12px 24px -8px rgba(62, 1, 2, 0.45);
  `}
`;

const Thumb = styled.span`
  display: block;
  height: 58px;
  border-radius: 6px;
  background: #f2eeeb center / cover no-repeat;
  background-image: ${({ $image }) => ($image ? `url("${$image}")` : 'none')};
  pointer-events: none;
`;

const ItemName = styled.span`
  overflow: hidden;
  color: var(--color-marron-cuarto);
  font-size: 10.5px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Position = styled.b`
  position: absolute;
  top: 10px;
  left: 10px;
  min-width: 18px;
  padding: 1px 5px;
  border-radius: 999px;
  background: rgba(40, 1, 1, 0.75);
  color: var(--color-blanco);
  font-size: 9px;
  text-align: center;
`;

const MoveButtons = styled.span`
  display: flex;
  justify-content: space-between;

  button {
    padding: 1px 8px !important;
    font-size: 11px !important;
    line-height: 1.3;
  }
`;

// Hueco donde va a quedar la tarjeta que se arrastra.
const DropSlot = styled.li`
  position: absolute;
  top: 2px;
  bottom: 8px;
  border: 2px dashed var(--color-bordo-secundario);
  border-radius: 10px;
  background: #fbf3f3;
  pointer-events: none;
`;

// Franja horizontal para reordenar arrastrando (mouse o pantalla táctil), con flechas como alternativa accesible.
export default function OrderStrip({ items, selectedId, disabled, onReorder, onSelect, title, hint, listLabel, itemNoun = 'Elemento' }) {
  const list = useRef(null);
  const drag = useRef(null);
  const [state, setState] = useState(null);
  const [announcement, setAnnouncement] = useState('');

  const reorder = (id, to) => {
    const item = items.find(entry => entry.documentId === id);
    onReorder(id, to);
    setAnnouncement(`${item?.nombre || itemNoun} quedó en el lugar ${to + 1} de ${items.length}.`);
  };

  const start = (event, index, id) => {
    if (disabled || event.button > 0 || event.target.closest('button')) return;
    const container = list.current;
    const bounds = container.getBoundingClientRect();
    const rects = [...container.querySelectorAll('[data-order-item]')].map(element => {
      const rect = element.getBoundingClientRect();
      return { left: rect.left - bounds.left + container.scrollLeft, width: rect.width };
    });
    drag.current = { id, from: index, pointerId: event.pointerId, startX: event.clientX, startScroll: container.scrollLeft, rects, moved: false, to: index };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const move = event => {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const dx = event.clientX - current.startX;
    if (!current.moved && Math.abs(dx) < 5) return;
    current.moved = true;
    const container = list.current;
    const bounds = container.getBoundingClientRect();
    if (event.clientX < bounds.left + 40) container.scrollLeft -= 14;
    if (event.clientX > bounds.right - 40) container.scrollLeft += 14;
    const offset = dx + container.scrollLeft - current.startScroll;
    const origin = current.rects[current.from];
    const center = origin.left + origin.width / 2 + offset;
    current.to = current.rects.filter((rect, index) => index !== current.from && rect.left + rect.width / 2 < center).length;
    setState({ id: current.id, from: current.from, to: current.to, offset, width: origin.width, slotLeft: current.rects[current.to].left });
  };

  const end = event => {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    drag.current = null;
    setState(null);
    if (!current.moved) onSelect(current.id);
    else if (current.to !== current.from) reorder(current.id, current.to);
  };

  const cancel = () => { drag.current = null; setState(null); };

  const shiftFor = index => {
    if (!state || index === state.from) return 0;
    if (state.from < state.to && index > state.from && index <= state.to) return -(state.width + GAP);
    if (state.from > state.to && index >= state.to && index < state.from) return state.width + GAP;
    return 0;
  };

  return (
    <StripSection aria-labelledby="orden-strip-title">
      <StripHeader>
        <h2 id="orden-strip-title">{title}</h2>
        <p>{hint}</p>
      </StripHeader>
      <StripList ref={list} aria-label={listLabel}>
        {state && <DropSlot aria-hidden="true" style={{ left: state.slotLeft, width: state.width }} />}
        {items.map((item, index) => {
          const dragging = state?.id === item.documentId;
          const translate = dragging ? state.offset : shiftFor(index);
          return (
            <StripItem
              key={item.documentId}
              data-order-item=""
              tabIndex={0}
              aria-label={`${index + 1}. ${item.nombre}`}
              aria-current={selectedId === item.documentId ? 'true' : undefined}
              $selected={selectedId === item.documentId}
              $dragging={dragging}
              style={translate ? { transform: `translateX(${translate}px)${dragging ? ' scale(1.03)' : ''}` } : undefined}
              onPointerDown={event => start(event, index, item.documentId)}
              onPointerMove={move}
              onPointerUp={end}
              onPointerCancel={cancel}
              onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(item.documentId); } }}
            >
              <Thumb $image={imageUrl(item.portada)} />
              <Position aria-hidden="true">{index + 1}</Position>
              <ItemName title={item.nombre}>{item.nombre}</ItemName>
              <MoveButtons>
                <button type="button" disabled={disabled || index === 0} aria-label={`Mover ${item.nombre} a la izquierda`} onClick={() => reorder(item.documentId, index - 1)}>←</button>
                <button type="button" disabled={disabled || index === items.length - 1} aria-label={`Mover ${item.nombre} a la derecha`} onClick={() => reorder(item.documentId, index + 1)}>→</button>
              </MoveButtons>
            </StripItem>
          );
        })}
      </StripList>
      <span role="status" aria-live="polite" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>{announcement}</span>
    </StripSection>
  );
}
