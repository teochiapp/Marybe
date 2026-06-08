import React, { useState } from 'react';
import styled from 'styled-components';
import ToggleSelection from '../../components/inicio/perfumeria/ToggleSelection';
import PromoCarousel from '../../components/inicio/perfumeria/PromoCarousel';
import FeaturedSection from '../../components/inicio/perfumeria/FeaturedSection';
import DiscountedSection from '../../components/inicio/perfumeria/DiscountedSection';
import CategoriesSection from '../../components/inicio/perfumeria/CategoriesSection';
import GiftCard from '../../components/inicio/shared/GiftCard';
import OfertasSection from '../../components/inicio/perfumeria/OfertasSection';
import FeaturedCategorySection from '../../components/inicio/perfumeria/FeaturedCategorySection';
import SpecificCategorySection from '../../components/inicio/perfumeria/SpecificCategorySection';
import ProximosEventos from '../../components/inicio/perfumeria/ProximosEventos';
import DescubriMas from '../../components/inicio/perfumeria/DescubriMas';
import ScrollToTopButton from '../../components/ScrollToTopButton';
import FeaturedSectionHogar from '../../components/inicio/hogar/FeaturedSectionHogar';
import DiscountedSectionHogar from '../../components/inicio/hogar/DiscountedSectionHogar';

const PageWrapper = styled.div`
  min-height: 80vh;
  padding-top: 30px;
  background-color: var(--color-blanco);
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
          <PromoCarousel seccion={seccionActiva} />
          <FeaturedSection seccion={seccionActiva} />
          <CategoriesSection seccion={seccionActiva} />
          <FeaturedCategorySection seccion={seccionActiva} />
          <OfertasSection seccion={seccionActiva} />
          <DiscountedSection seccion={seccionActiva} />
          <SpecificCategorySection seccion={seccionActiva} />
          <GiftCardWrapper>
            <GiftCard />
          </GiftCardWrapper>
          <ProximosEventos />
          <DescubriMas />
        </>
      )}

      {seccionActiva === 'hogar' && (
        <>
          <PromoCarousel seccion={seccionActiva} />
          <OfertasSection seccion={seccionActiva} />
          <FeaturedSectionHogar />
          <CategoriesSection seccion={seccionActiva} />
          <FeaturedCategorySection seccion={seccionActiva} />
          <DiscountedSectionHogar />
          <SpecificCategorySection seccion={seccionActiva} />
          <GiftCardWrapper>
            <GiftCard />
          </GiftCardWrapper>
          <DescubriMas />
        </>
      )}

      <ScrollToTopButton />
    </PageWrapper>
  );
}
