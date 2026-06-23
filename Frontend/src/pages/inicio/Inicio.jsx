import React from 'react';
import styled from 'styled-components';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FadeIn, FadeInLeft, FadeInUp } from '../../components/animations/ScrollAnimations';
import ToggleSelection from '../../components/inicio/perfumeria/ToggleSelection';
import PromoCarousel from '../../components/inicio/perfumeria/PromoCarousel';
import FeaturedSection from '../../components/inicio/perfumeria/FeaturedSection';
import DiscountedSection from '../../components/inicio/perfumeria/DiscountedSection';
import CategoriesSection from '../../components/inicio/perfumeria/CategoriesSection';
import GiftCard from '../../components/inicio/shared/GiftCard';
import TarjetasPromociones from '../../components/inicio/perfumeria/TarjetasPromociones';
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
  cursor: pointer;

  @media (max-width: 768px) {
    padding: 24px 0;
  }
`;

export default function Inicio() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const seccionActiva = searchParams.get('seccion') || 'perfumeria';

  const handleSeccionChange = (seccion) => {
    setSearchParams({ seccion });
  };

  return (
    <PageWrapper>
      <ToggleSelection
        seccionActiva={seccionActiva}
        onSeccionChange={handleSeccionChange}
      />

      {seccionActiva === 'perfumeria' && (
        <>
          <FadeIn delay={0.1} duration={0.4}>
            <PromoCarousel seccion={seccionActiva} />
          </FadeIn>
          <FadeIn>
            <FeaturedSection seccion={seccionActiva} />
          </FadeIn>
          <FadeIn>
            <CategoriesSection seccion={seccionActiva} />
          </FadeIn>
          <FadeIn>
            <FeaturedCategorySection seccion={seccionActiva} />
          </FadeIn>
          <FadeIn>
            <OfertasSection seccion={seccionActiva} />
          </FadeIn>
          <FadeIn>
            <DiscountedSection seccion={seccionActiva} />
          </FadeIn>
          <FadeIn>
            <SpecificCategorySection seccion={seccionActiva} />
          </FadeIn>
          <FadeIn>
            <TarjetasPromociones />
          </FadeIn>
          <FadeIn>
            <GiftCardWrapper onClick={() => navigate('/gift-card')}>
              <GiftCard seccion={seccionActiva} />
            </GiftCardWrapper>
          </FadeIn>
          <FadeInUp>
            <ProximosEventos />
          </FadeInUp>
          <FadeInLeft>
            <DescubriMas />
          </FadeInLeft>
        </>
      )}

      {seccionActiva === 'hogar' && (
        <>
          <FadeIn delay={0.1} duration={0.4}>
            <PromoCarousel seccion={seccionActiva} />
          </FadeIn>
          <FadeIn>
            <OfertasSection seccion={seccionActiva} />
          </FadeIn>
          <FadeIn>
            <FeaturedSectionHogar />
          </FadeIn>
          <FadeIn>
            <CategoriesSection seccion={seccionActiva} />
          </FadeIn>
          <FadeIn>
            <FeaturedCategorySection seccion={seccionActiva} />
          </FadeIn>
          <FadeIn>
            <DiscountedSectionHogar />
          </FadeIn>
          <FadeIn>
            <SpecificCategorySection seccion={seccionActiva} />
          </FadeIn>
          <FadeIn>
            <TarjetasPromociones />
          </FadeIn>
          <FadeIn>
            <GiftCardWrapper onClick={() => navigate('/gift-card')}>
              <GiftCard seccion={seccionActiva} />
            </GiftCardWrapper>
          </FadeIn>
          <FadeInUp>
            <ProximosEventos />
          </FadeInUp>
          <FadeInLeft>
            <DescubriMas />
          </FadeInLeft>
        </>
      )}

      <ScrollToTopButton />
    </PageWrapper>
  );
}
