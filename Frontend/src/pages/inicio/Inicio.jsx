import React, { useState } from 'react';
import styled from 'styled-components';
import ToggleSelection from '../../components/inicio/perfumeria/ToggleSelection';
import PromoCarousel from '../../components/inicio/perfumeria/PromoCarousel';
import FeaturedSection from '../../components/inicio/perfumeria/FeaturedSection';
import CategoriesSection from '../../components/inicio/perfumeria/CategoriesSection';
import GiftCard from '../../components/inicio/GiftCard';
import OfertasSection from '../../components/inicio/perfumeria/OfertasSection';
import FeaturedCategorySection from '../../components/inicio/perfumeria/FeaturedCategorySection';
import TarjetasPromociones from '../../components/inicio/perfumeria/TarjetasPromociones';
import ProximosEventos from '../../components/inicio/perfumeria/ProximosEventos';
import DescubriMas from '../../components/inicio/perfumeria/DescubriMas';
import ScrollToTopButton from '../../components/ScrollToTopButton';

const PageWrapper = styled.div`
  min-height: 80vh;
  background-color: var(--color-fondo-beneficio-tarjeta);
  font-family: var(--font-family-secondary);
`;

const GiftCardWrapper = styled.div`
  width: 100%;
  background-color: var(--color-fondo-tarjetas-promo);

  @media (max-width: 768px) {
    padding: 24px 0;
  }
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
          <TarjetasPromociones />
          <GiftCardWrapper>
            <GiftCard />
          </GiftCardWrapper>

          <FeaturedCategorySection />
          <OfertasSection />
          <ProximosEventos />
          <DescubriMas />
        </>
      )}

      <ScrollToTopButton />
    </PageWrapper>
  );
}
