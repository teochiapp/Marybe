import React from 'react';
import styled from 'styled-components';

const TilesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(${({ $columns }) => $columns}, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 16px;
`;

const Tile = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-height: 118px;
  padding: 12px 8px 10px !important;
  border: 1px solid ${({ $active }) => ($active ? 'var(--color-bordo-secundario)' : '#ebe5e5')} !important;
  border-radius: 10px !important;
  background: ${({ $active }) => ($active ? '#fbf3f3' : 'var(--color-blanco)')} !important;
  box-shadow: ${({ $active }) => ($active ? '0 0 0 2px rgba(124, 4, 5, 0.15)' : 'none')};
  text-align: center;

  strong {
    color: var(--color-marron-cuarto);
    font-size: 11px;
    line-height: 1.2;
  }

  small {
    color: #8a7d81;
    font-size: 9.5px;
    line-height: 1.25;
  }
`;

const Sample = styled.span`
  display: grid;
  place-items: center;
  height: 58px;
`;

// Selector visual de una opción (radio) con una muestra dibujada de cada variante.
export default function OptionTiles({ label, options, value, onChange, renderSample, columns = 2 }) {
  return (
    <TilesGrid role="radiogroup" aria-label={label} $columns={columns}>
      {options.map(option => (
        <Tile key={option.value} type="button" role="radio" aria-checked={value === option.value} $active={value === option.value} onClick={() => onChange(option.value)}>
          <Sample aria-hidden="true">{renderSample(option.value)}</Sample>
          <strong>{option.label}</strong>
          <small>{option.description}</small>
        </Tile>
      ))}
    </TilesGrid>
  );
}
