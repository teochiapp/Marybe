import React from 'react';
import styled from 'styled-components';

const ToggleContainer = styled.div`
  display: flex;
  background-color: var(--color-blanco);
  border-radius: 200px;
  padding: 4px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  width: fit-content;
  margin: 0 auto -5vh auto;
  position: relative;
  z-index: 10;

  @media (max-width: 768px) {
    display: none;
  }
`;

const ToggleOption = styled.button`
  background-color: ${({ $active }) => ($active ? 'var(--color-marron-principal)' : 'transparent')};
  color: ${({ $active }) => ($active ? 'var(--color-blanco)' : 'var(--color-marron-principal)')};
  border: none;
  border-radius: 40px;
  padding: 8px 52px;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: var(--font-family-secondary);

  &:hover {
    background-color: ${({ $active }) => ($active ? 'var(--color-marron-principal)' : 'rgba(0,0,0,0.03)')};
  }
`;

export default function ToggleSelection({ seccionActiva, onSeccionChange }) {
  return (
    <ToggleContainer>
      <ToggleOption
        $active={seccionActiva === 'perfumeria'}
        onClick={() => onSeccionChange('perfumeria')}
      >
        Perfumería
      </ToggleOption>
      <ToggleOption
        $active={seccionActiva === 'hogar'}
        onClick={() => onSeccionChange('hogar')}
      >
        Hogar
      </ToggleOption>
    </ToggleContainer>
  );
}
