import React, { Suspense } from 'react';
import styled from 'styled-components';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FadeIn, FadeInLeft, FadeInUp } from '../../components/animations/ScrollAnimations';
import ToggleSelection from '../../components/inicio/perfumeria/ToggleSelection';
import { lazyWithRetry } from '../../utils/lazyWithRetry';
import LazyViewport from '../../components/LazyViewport';

// ─── Above the fold: carga inmediata ──────────────────────────────────────────
import PromoCarousel from '../../components/inicio/perfumeria/PromoCarousel';
import FeaturedSection from '../../components/inicio/perfumeria/FeaturedSection';
import ScrollToTopButton from '../../components/ScrollToTopButton';

// ─── Below the fold: lazy load con reintentos para evitar ChunkLoadError ─────
const CategoriesSection       = lazyWithRetry(() => import('../../components/inicio/perfumeria/CategoriesSection'), 'CategoriesSection');
const FeaturedCategorySection = lazyWithRetry(() => import('../../components/inicio/perfumeria/FeaturedCategorySection'), 'FeaturedCategorySection');
const OfertasSection          = lazyWithRetry(() => import('../../components/inicio/perfumeria/OfertasSection'), 'OfertasSection');
const DiscountedSection       = lazyWithRetry(() => import('../../components/inicio/perfumeria/DiscountedSection'), 'DiscountedSection');
const SpecificCategorySection = lazyWithRetry(() => import('../../components/inicio/perfumeria/SpecificCategorySection'), 'SpecificCategorySection');
const TarjetasPromociones     = lazyWithRetry(() => import('../../components/inicio/perfumeria/TarjetasPromociones'), 'TarjetasPromociones');
const GiftCard                = lazyWithRetry(() => import('../../components/inicio/shared/GiftCard'), 'GiftCard');
const ProximosEventos         = lazyWithRetry(() => import('../../components/inicio/perfumeria/ProximosEventos'), 'ProximosEventos');
const DescubriMas             = lazyWithRetry(() => import('../../components/inicio/perfumeria/DescubriMas'), 'DescubriMas');
const FeaturedSectionHogar    = lazyWithRetry(() => import('../../components/inicio/hogar/FeaturedSectionHogar'), 'FeaturedSectionHogar');
const DiscountedSectionHogar  = lazyWithRetry(() => import('../../components/inicio/hogar/DiscountedSectionHogar'), 'DiscountedSectionHogar');


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
          {/* Above the fold: carga inmediata sin animación FadeIn para optimizar LCP */}
          <PromoCarousel seccion={seccionActiva} />
          <FeaturedSection seccion={seccionActiva} />

          {/* Below the fold: LazyViewport (IntersectionObserver) para eliminar Long Tasks */}
          <LazyViewport fallback={<SectionSkeleton $height="400px" />}>
            <FadeIn>
              <CategoriesSection seccion={seccionActiva} />
            </FadeIn>
          </LazyViewport>
          <LazyViewport fallback={<SectionSkeleton $height="500px" />}>
            <FadeIn>
              <FeaturedCategorySection seccion={seccionActiva} />
            </FadeIn>
          </LazyViewport>
          <LazyViewport fallback={<SectionSkeleton $height="350px" />}>
            <FadeIn>
              <OfertasSection seccion={seccionActiva} />
            </FadeIn>
          </LazyViewport>
          <LazyViewport fallback={<SectionSkeleton $height="500px" />}>
            <FadeIn>
              <DiscountedSection seccion={seccionActiva} />
            </FadeIn>
          </LazyViewport>
          <LazyViewport fallback={<SectionSkeleton $height="400px" />}>
            <FadeIn>
              <SpecificCategorySection seccion={seccionActiva} />
            </FadeIn>
          </LazyViewport>
          <LazyViewport fallback={<SectionSkeleton $height="300px" />}>
            <FadeIn>
              <TarjetasPromociones />
            </FadeIn>
          </LazyViewport>
          <LazyViewport fallback={<SectionSkeleton $height="280px" />}>
            <FadeIn>
              <GiftCardWrapper onClick={() => navigate('/gift-card')}>
                <GiftCard seccion={seccionActiva} />
              </GiftCardWrapper>
            </FadeIn>
          </LazyViewport>
          <LazyViewport fallback={<SectionSkeleton $height="300px" />}>
            <FadeInUp>
              <ProximosEventos />
            </FadeInUp>
          </LazyViewport>
          <LazyViewport fallback={<SectionSkeleton $height="250px" />}>
            <FadeInLeft>
              <DescubriMas />
            </FadeInLeft>
          </LazyViewport>
        </>
      )}

      {seccionActiva === 'hogar' && (
        <>
          {/* Above the fold: carga inmediata sin animación FadeIn para optimizar LCP */}
          <PromoCarousel seccion={seccionActiva} />

          {/* Below the fold: LazyViewport */}
          <LazyViewport fallback={<SectionSkeleton $height="350px" />}>
            <FadeIn>
              <OfertasSection seccion={seccionActiva} />
            </FadeIn>
          </LazyViewport>
          <LazyViewport fallback={<SectionSkeleton $height="500px" />}>
            <FadeIn>
              <FeaturedSectionHogar />
            </FadeIn>
          </LazyViewport>
          <LazyViewport fallback={<SectionSkeleton $height="400px" />}>
            <FadeIn>
              <CategoriesSection seccion={seccionActiva} />
            </FadeIn>
          </LazyViewport>
          <LazyViewport fallback={<SectionSkeleton $height="500px" />}>
            <FadeIn>
              <FeaturedCategorySection seccion={seccionActiva} />
            </FadeIn>
          </LazyViewport>
          <LazyViewport fallback={<SectionSkeleton $height="500px" />}>
            <FadeIn>
              <DiscountedSectionHogar />
            </FadeIn>
          </LazyViewport>
          <LazyViewport fallback={<SectionSkeleton $height="400px" />}>
            <FadeIn>
              <SpecificCategorySection seccion={seccionActiva} />
            </FadeIn>
          </LazyViewport>
          <LazyViewport fallback={<SectionSkeleton $height="300px" />}>
            <FadeIn>
              <TarjetasPromociones />
            </FadeIn>
          </LazyViewport>
          <LazyViewport fallback={<SectionSkeleton $height="280px" />}>
            <FadeIn>
              <GiftCardWrapper onClick={() => navigate('/gift-card')}>
                <GiftCard seccion={seccionActiva} />
              </GiftCardWrapper>
            </FadeIn>
          </LazyViewport>
          <LazyViewport fallback={<SectionSkeleton $height="300px" />}>
            <FadeInUp>
              <ProximosEventos />
            </FadeInUp>
          </LazyViewport>
          <LazyViewport fallback={<SectionSkeleton $height="250px" />}>
            <FadeInLeft>
              <DescubriMas />
            </FadeInLeft>
          </LazyViewport>
        </>
      )}

      <ScrollToTopButton />
    </PageWrapper>
  );
}
