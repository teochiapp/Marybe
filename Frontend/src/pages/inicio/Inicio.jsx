import React, { useState } from 'react';
import styled from 'styled-components';
import ToggleSelection from '../../components/inicio/ToggleSelection';
import PromoCarousel from '../../components/inicio/PromoCarousel';

const PageWrapper = styled.div`
  min-height: 80vh;
  background-color: var(--color-fondo-beneficio-tarjeta);
  padding: 20px 20px;
  font-family: var(--font-family-secondary);
`;

const ContentSection = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
`;

const SectionTitle = styled.h2`
  font-family: var(--font-family-primary);
  color: var(--color-marron-principal);
  font-size: 2.8rem;
  margin-bottom: 20px;
`;

const PlaceholderGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
  margin-top: 40px;
`;

const PlaceholderCard = styled.div`
  background: var(--color-blanco);
  border-radius: 12px;
  height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  color: var(--color-marron-secundario);
  font-size: 1.1rem;
  border: 2px dashed var(--color-rosa-tercero);
`;

export default function Inicio() {
  const [seccionActiva, setSeccionActiva] = useState('perfumeria');

  return (
    <PageWrapper>
      <ToggleSelection
        seccionActiva={seccionActiva}
        onSeccionChange={setSeccionActiva}
      />

      {seccionActiva === 'perfumeria' && <PromoCarousel />}
    </PageWrapper>
  );
}
