import React, { Suspense, lazy } from 'react';
import styled from 'styled-components';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FadeIn, FadeInLeft, FadeInUp } from '../../components/animations/ScrollAnimations';
import ToggleSelection from '../../components/inicio/perfumeria/ToggleSelection';

// ─── Above the fold: carga inmediata ──────────────────────────────────────────
import PromoCarousel from '../../components/inicio/perfumeria/PromoCarousel';
import FeaturedSection from '../../components/inicio/perfumeria/FeaturedSection';

// ─── Below the fold: lazy load (code splitting real) ─────────────────────────
const CategoriesSection       = lazy(() => import('../../components/inicio/perfumeria/CategoriesSection'));
const FeaturedCategorySection = lazy(() => import('../../components/inicio/perfumeria/FeaturedCategorySection'));
const OfertasSection          = lazy(() => import('../../components/inicio/perfumeria/OfertasSection'));
const DiscountedSection       = lazy(() => import('../../components/inicio/perfumeria/DiscountedSection'));
const SpecificCategorySection = lazy(() => import('../../components/inicio/perfumeria/SpecificCategorySection'));
const TarjetasPromociones     = lazy(() => import('../../components/inicio/perfumeria/TarjetasPromociones'));
const GiftCard                = lazy(() => import('../../components/inicio/shared/GiftCard'));
const ProximosEventos         = lazy(() => import('../../components/inicio/perfumeria/ProximosEventos'));
const DescubriMas             = lazy(() => import('../../components/inicio/perfumeria/DescubriMas'));
const FeaturedSectionHogar    = lazy(() => import('../../components/inicio/hogar/FeaturedSectionHogar'));
const DiscountedSectionHogar  = lazy(() => import('../../components/inicio/hogar/DiscountedSectionHogar'));

import ScrollToTopButton from '../../components/ScrollToTopButton';

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
`;

/* Skeleton con altura fija: reserva el espacio antes de que cargue el componente lazy,
   evitando layout shifts (CLS). La animación de pulso da feedback visual al usuario. */
const SectionSkeleton = styled.div`
  width: 100%;
  min-height: ${({ $height }) => $height || '300px'};
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
  border-radius: 16px;
  margin: 16px 0;

  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
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
          {/* Above the fold: carga inmediata */}
          <FadeIn delay={0.1} duration={0.4}>
            <PromoCarousel seccion={seccionActiva} />
          </FadeIn>
          <FadeIn>
            <FeaturedSection seccion={seccionActiva} />
          </FadeIn>

          {/* Below the fold: lazy + Suspense con skeleton para evitar CLS */}
          <Suspense fallback={<SectionSkeleton $height="400px" />}>
            <FadeIn>
              <CategoriesSection seccion={seccionActiva} />
            </FadeIn>
          </Suspense>
          <Suspense fallback={<SectionSkeleton $height="500px" />}>
            <FadeIn>
              <FeaturedCategorySection seccion={seccionActiva} />
            </FadeIn>
          </Suspense>
          <Suspense fallback={<SectionSkeleton $height="350px" />}>
            <FadeIn>
              <OfertasSection seccion={seccionActiva} />
            </FadeIn>
          </Suspense>
          <Suspense fallback={<SectionSkeleton $height="500px" />}>
            <FadeIn>
              <DiscountedSection seccion={seccionActiva} />
            </FadeIn>
          </Suspense>
          <Suspense fallback={<SectionSkeleton $height="400px" />}>
            <FadeIn>
              <SpecificCategorySection seccion={seccionActiva} />
            </FadeIn>
          </Suspense>
          <Suspense fallback={<SectionSkeleton $height="300px" />}>
            <FadeIn>
              <TarjetasPromociones />
            </FadeIn>
          </Suspense>
          <Suspense fallback={<SectionSkeleton $height="280px" />}>
            <FadeIn>
              <GiftCardWrapper onClick={() => navigate('/gift-card')}>
                <GiftCard seccion={seccionActiva} />
              </GiftCardWrapper>
            </FadeIn>
          </Suspense>
          <Suspense fallback={<SectionSkeleton $height="300px" />}>
            <FadeInUp>
              <ProximosEventos />
            </FadeInUp>
          </Suspense>
          <Suspense fallback={<SectionSkeleton $height="250px" />}>
            <FadeInLeft>
              <DescubriMas />
            </FadeInLeft>
          </Suspense>
        </>
      )}

      {seccionActiva === 'hogar' && (
        <>
          {/* Above the fold: carga inmediata */}
          <FadeIn delay={0.1} duration={0.4}>
            <PromoCarousel seccion={seccionActiva} />
          </FadeIn>

          {/* Below the fold: lazy + Suspense */}
          <Suspense fallback={<SectionSkeleton $height="350px" />}>
            <FadeIn>
              <OfertasSection seccion={seccionActiva} />
            </FadeIn>
          </Suspense>
          <Suspense fallback={<SectionSkeleton $height="500px" />}>
            <FadeIn>
              <FeaturedSectionHogar />
            </FadeIn>
          </Suspense>
          <Suspense fallback={<SectionSkeleton $height="400px" />}>
            <FadeIn>
              <CategoriesSection seccion={seccionActiva} />
            </FadeIn>
          </Suspense>
          <Suspense fallback={<SectionSkeleton $height="500px" />}>
            <FadeIn>
              <FeaturedCategorySection seccion={seccionActiva} />
            </FadeIn>
          </Suspense>
          <Suspense fallback={<SectionSkeleton $height="500px" />}>
            <FadeIn>
              <DiscountedSectionHogar />
            </FadeIn>
          </Suspense>
          <Suspense fallback={<SectionSkeleton $height="400px" />}>
            <FadeIn>
              <SpecificCategorySection seccion={seccionActiva} />
            </FadeIn>
          </Suspense>
          <Suspense fallback={<SectionSkeleton $height="300px" />}>
            <FadeIn>
              <TarjetasPromociones />
            </FadeIn>
          </Suspense>
          <Suspense fallback={<SectionSkeleton $height="280px" />}>
            <FadeIn>
              <GiftCardWrapper onClick={() => navigate('/gift-card')}>
                <GiftCard seccion={seccionActiva} />
              </GiftCardWrapper>
            </FadeIn>
          </Suspense>
          <Suspense fallback={<SectionSkeleton $height="300px" />}>
            <FadeInUp>
              <ProximosEventos />
            </FadeInUp>
          </Suspense>
          <Suspense fallback={<SectionSkeleton $height="250px" />}>
            <FadeInLeft>
              <DescubriMas />
            </FadeInLeft>
          </Suspense>
        </>
      )}

      <ScrollToTopButton />
    </PageWrapper>
  );
}
