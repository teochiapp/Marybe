import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const Banner = styled.section`
  background-color: var(--color-fondo-info-promo);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl) var(--spacing-xxl);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-xl);
  flex-wrap: wrap;

  @media (max-width: 700px) {
    flex-direction: column;
    align-items: flex-start;
    padding: var(--spacing-xl);
  }
`;

const TextBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Title = styled.h3`
  font-family: var(--font-family-secondary);
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-marron-secundario);
  margin: 0;
`;

const Description = styled.p`
  font-family: var(--font-family-secondary);
  font-size: 0.85rem;
  color: var(--color-marron-secundario);
  opacity: 0.75;
  margin: 0;
`;

const ActionButton = styled(Link)`
  background-color: var(--color-boton-promo);
  color: var(--color-blanco);
  font-family: var(--font-family-secondary);
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: var(--radius-md);
  padding: 14px var(--spacing-xl);
  text-decoration: none;
  white-space: nowrap;
  transition: var(--transition-fast);

  &:hover {
    background-color: var(--color-bordo-secundario);
  }

  @media (max-width: 700px) {
    width: 100%;
    text-align: center;
  }
`;

export default function ArrepentimientoBanner() {
  return (
    <Banner>
      <TextBlock>
        <Title>¿Te arrepentiste de tu compra?</Title>
        <Description>
          Conocé cómo solicitar la devolución o cancelación de tu compra de forma simple.
        </Description>
      </TextBlock>

      <ActionButton to="/boton-arrepentimiento">
        Solicitar arrepentimiento
      </ActionButton>
    </Banner>
  );
}
