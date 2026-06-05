import React, { useState } from 'react';
import styled from 'styled-components';
import ToggleSelection from '../../components/inicio/perfumeria/ToggleSelection';
import PromoCarousel from '../../components/inicio/perfumeria/PromoCarousel';
import FeaturedSection from '../../components/inicio/perfumeria/FeaturedSection';
import CategoriesSection from '../../components/inicio/perfumeria/CategoriesSection';
import OfertasSection from '../../components/inicio/perfumeria/OfertasSection';
import FeaturedCategorySection from '../../components/inicio/perfumeria/FeaturedCategorySection';

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
          <FeaturedCategorySection />
          <OfertasSection />
        </>
      )}
    </PageWrapper>
  );
}
