import React, { Suspense, useEffect } from 'react';
import { normalizarComposicion } from './composicionInicio';
import styled from 'styled-components';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { inicioTarget } from '../../utils/inicioNavigation';
import { FadeIn, FadeInLeft, FadeInUp } from '../../components/animations/ScrollAnimations';
import ToggleSelection from '../../components/inicio/perfumeria/ToggleSelection';
import { lazyWithRetry } from '../../utils/lazyWithRetry';
import LazyViewport from '../../components/LazyViewport';
import { SeccionPrincipalProvider, useSeccionPrincipal } from '../../context/SeccionPrincipalContext';

// ─── Above the fold: carga inmediata ──────────────────────────────────────────
import PromoCarousel from '../../components/inicio/perfumeria/PromoCarousel';
import FeaturedSection from '../../components/inicio/perfumeria/FeaturedSection';
import ScrollToTopButton from '../../components/ScrollToTopButton';
import { BannerOverridesProvider } from '../../components/banners/BannerOverrides';

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

const ScrollAnchor = styled.div`
  scroll-margin-top: calc(var(--header-height, 120px) + 16px);
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

function InicioContent({ compositionPreview, previewArea }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const seccionActiva = previewArea || searchParams.get('seccion') || 'perfumeria';
  const { attrs, ready } = useSeccionPrincipal();
  const textoPerf = attrs?.texto_toggle_perfumeria || 'Perfumería';
  const textoHogar = attrs?.texto_toggle_hogar || 'Hogar';
  const composicion = attrs?.composicion_inicio || {};
  const compositionReady = Boolean(compositionPreview) || ready;
  const layout = normalizarComposicion(compositionPreview || composicion[seccionActiva], seccionActiva);
  const hiddenBlocks = layout.ocultos.join(',');

  useEffect(() => {
    if (!compositionReady || compositionPreview || !location.hash) return;
    const target = inicioTarget(location.hash.slice(1), seccionActiva);
    if (!target) return;
    if (hiddenBlocks.split(',').includes(target.block)) { navigate(target.fallback, { replace: true }); return; }
    document.getElementById(target.anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [compositionReady, compositionPreview, location.hash, seccionActiva, navigate, hiddenBlocks]);

  const handleSeccionChange = (seccion) => {
    setSearchParams({ seccion });
  };

  return (
    <PageWrapper data-inicio-area={seccionActiva} data-inicio-ready={ready && !compositionPreview} data-inicio-hidden={layout.ocultos.join(',')}>
      <ToggleSelection
        seccionActiva={seccionActiva}
        onSeccionChange={handleSeccionChange}
        textoPerfumeria={textoPerf}
        textoHogar={textoHogar}
      />

      {!compositionReady && <SectionSkeleton $height="400px" />}
      {compositionReady && ['perfumeria', 'hogar'].includes(seccionActiva) && (() => {
        const area = seccionActiva;
        const { orden, ocultos } = normalizarComposicion(compositionPreview || composicion[area], area);
        const visible = orden.filter(id => !ocultos.includes(id));
        const sections = {
          banners: { content: <PromoCarousel seccion={area} />, height: '400px' },
          'seccion-destacada': { content: area === 'hogar' ? <FeaturedSectionHogar /> : <FeaturedSection seccion={area} />, height: '500px', anchor: area === 'perfumeria' ? 'seccion-destacados' : 'seccion-destacados-hogar' },
          categorias: { content: <CategoriesSection seccion={area} />, height: '400px' },
          'categoria-destacada-1': { content: <FeaturedCategorySection seccion={area} />, height: '500px' },
          ofertas: { content: <OfertasSection seccion={area} />, height: '350px' },
          descuentos: { content: area === 'hogar' ? <DiscountedSectionHogar /> : <DiscountedSection seccion={area} />, height: '500px' },
          'categoria-destacada-2': { content: <SpecificCategorySection seccion={area} />, height: '400px' },
          beneficios: { content: <TarjetasPromociones />, height: '300px' },
          'gift-card': { content: <GiftCardWrapper onClick={() => navigate('/gift-card')}><GiftCard seccion={area} /></GiftCardWrapper>, height: '280px', anchor: area === 'hogar' ? 'seccion-gift-card-hogar' : 'seccion-gift-card' },
          'proximos-eventos': { content: <ProximosEventos />, height: '300px', anchor: area === 'hogar' ? 'seccion-eventos-hogar' : 'seccion-eventos', animation: FadeInUp },
          'descubri-mas': { content: <DescubriMas />, height: '250px', animation: FadeInLeft },
        };
        return visible.map((id, index) => {
          const section = sections[id];
          const fallback = <SectionSkeleton $height={section.height} />;
          const Animation = section.animation || FadeIn;
          // El primer bloque visible se carga inmediatamente.
          const content = index === 0 || (area === 'perfumeria' && id === 'seccion-destacada' && index === 1 && visible[0] === 'banners')
            ? <Suspense fallback={fallback}>{section.content}</Suspense>
            : <LazyViewport fallback={fallback}><Animation>{section.content}</Animation></LazyViewport>;
          return <ScrollAnchor key={id} id={section.anchor} data-inicio-block={id}>{content}</ScrollAnchor>;
        });
      })()}

      <ScrollToTopButton />
    </PageWrapper>
  );
}

export default function Inicio({ compositionPreview, previewArea } = {}) {
  const disableStorage = Boolean(compositionPreview);
  return (
    <SeccionPrincipalProvider disableStorage={disableStorage}>
      <BannerOverridesProvider disableStorage={disableStorage}>
        <InicioContent compositionPreview={compositionPreview} previewArea={previewArea} />
      </BannerOverridesProvider>
    </SeccionPrincipalProvider>
  );
}
