import React, { useState } from 'react';
import styled from 'styled-components';
import ToggleSelection from '../../components/inicio/perfumeria/ToggleSelection';
import PromoCarousel from '../../components/inicio/PromoCarousel';
import FeaturedSection from '../../components/inicio/perfumeria/FeaturedSection';
import CategoriesSection from '../../components/inicio/perfumeria/CategoriesSection';

const PageWrapper = styled.div`
  min-height: 80vh;
  background-color: var(--color-fondo-beneficio-tarjeta);
  font-family: var(--font-family-secondary);
`;

export default function Inicio() {
  const [seccionActiva, setSeccionActiva] = useState('perfumeria');

  return (
    <PageWrapper>
      <ToggleSelection
        seccionActiva={seccionActiva}
        onSeccionChange={setSeccionActiva}
      />

      {seccionActiva === 'perfumeria' && (
        <>
          <PromoCarousel />
          <FeaturedSection />
          <CategoriesSection />

        </>
      )}
    </PageWrapper>
  );
}
