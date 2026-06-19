import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const STRAPI_URL = process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337';

// ─── Styled Components ───────────────────────────────────────────────────────

const Wrapper = styled.div`
  width: 100%;
  max-width: 90%;
  margin: 0 auto 40px auto;
  display: flex;
  flex-direction: column;
  gap: 30px;
  overflow: visible;
`;

const TrackOuter = styled.div`
  width: 100%;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 60px;
    height: 100%;
    background: linear-gradient(to right, transparent, rgba(255,255,255,0.85));
    pointer-events: none;
    z-index: 2;
    border-radius: 0 16px 16px 0;
    transition: opacity 0.3s;
  }
`;

const ScrollRow = styled.div`
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding: 6px 20px 8px 0;
  cursor: grab;
  user-select: none;

  &:active {
    cursor: grabbing;
  }
  &::-webkit-scrollbar {
    display: none;
  }
`;

const Grid1Col = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  width: 100%;
`;

const Grid2Cols = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  width: 100%;
`;

const Grid4Cols = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  width: 100%;

  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const GridMixta = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;

  @media (min-width: 768px) {
    grid-template-columns: 2fr 1fr;
    grid-template-rows: 1fr 1fr;
  }
`;

const MixtaPrincipal = styled.div`
  @media (min-width: 768px) {
    grid-row: 1 / span 2;
  }
`;

const MixtaSecundario = styled.div`
  width: 100%;
`;

const BannerCard = styled.div`
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.01);
  background-color: #F5F2ED;
  transition: transform 0.3s ease;
  height: 100%;

  &:hover {
    transform: translateY(-4px);
  }

  /* Si está dentro de un carrusel, debe tener un ancho fijo */
  ${({ $isCarousel, $cols }) => $isCarousel && `
    flex-shrink: 0;
    scroll-snap-align: start;
    width: ${$cols === 1 ? '85%' : $cols === 2 ? '45%' : '35%'};
    min-width: ${$cols === 1 ? '85%' : $cols === 2 ? '45%' : '35%'};

    @media (min-width: 768px) {
      width: ${$cols === 1 ? 'calc(100% - 24px)' : $cols === 2 ? 'calc(50% - 24px)' : 'calc(25% - 24px)'};
      min-width: ${$cols === 1 ? 'calc(100% - 24px)' : $cols === 2 ? 'calc(50% - 24px)' : 'calc(25% - 24px)'};
    }
  `}
`;

const ImgWrapper = styled.div`
  width: 100%;
  height: 100%;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    border-radius: 20px;
  }
`;

// ─── Componente Auxiliar: Responsive Banner ──────────────────────────────────
const ResponsiveBanner = ({ banner, isCarousel, cols }) => {
  const navigate = useNavigate();
  if (!banner) return null;

  const desktop = banner.imagen_desktop?.data?.attributes?.url;
  if (!desktop) return null; // Fallback si no hay imagen principal

  const tablet = banner.imagen_tablet?.data?.attributes?.url || desktop;
  const mobile = banner.imagen_mobile?.data?.attributes?.url || tablet;

  const inner = (
    <ImgWrapper>
      <picture>
        <source media="(max-width: 768px)" srcSet={`${STRAPI_URL}${mobile}`} />
        <source media="(max-width: 1024px)" srcSet={`${STRAPI_URL}${tablet}`} />
        <img src={`${STRAPI_URL}${desktop}`} alt={banner.titulo || ''} draggable="false" />
      </picture>
    </ImgWrapper>
  );

  const handleClick = (e) => {
    if (banner.enlace && banner.enlace.startsWith('/')) {
      e.preventDefault();
      navigate(banner.enlace);
    }
  };

  return (
    <BannerCard $isCarousel={isCarousel} $cols={cols}>
      {banner.enlace ? (
        <a href={banner.enlace} onClick={handleClick} title={banner.titulo} style={{ display: 'block', height: '100%', textDecoration: 'none' }}>
          {inner}
        </a>
      ) : (
        <div style={{ height: '100%' }} title={banner.titulo}>{inner}</div>
      )}
    </BannerCard>
  );
};

// ─── Componente Auxiliar: Carousel Track ─────────────────────────────────────
const CarouselTrack = ({ children }) => {
  const scrollRef = useRef(null);

  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftVal = useRef(0);

  const handleMouseDown = useCallback((e) => {
    const el = scrollRef.current;
    if (!el) return;
    isDown.current = true;
    el.style.scrollSnapType = 'none';
    el.style.scrollBehavior = 'auto';
    startX.current = e.pageX - el.offsetLeft;
    scrollLeftVal.current = el.scrollLeft;
  }, []);

  const handleMouseLeaveOrUp = useCallback(() => {
    if (!isDown.current) return;
    isDown.current = false;
    const el = scrollRef.current;
    if (el) {
      el.style.scrollSnapType = 'x mandatory';
      el.style.scrollBehavior = '';
    }
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDown.current) return;
    e.preventDefault();
    const el = scrollRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    el.scrollLeft = scrollLeftVal.current - walk;
  }, []);

  return (
    <TrackOuter>
      <ScrollRow
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeaveOrUp}
        onMouseUp={handleMouseLeaveOrUp}
        onMouseMove={handleMouseMove}
      >
        {children}
      </ScrollRow>
    </TrackOuter>
  );
};


// ─── Componente Principal ────────────────────────────────────────────────────
export default function PromoCarousel({ seccion = 'perfumeria' }) {
  const [filas, setFilas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    async function fetchPromociones() {
      try {
        const seccionNameRaw = seccion === 'hogar' ? 'Hogar' : 'Perfumer\u00eda';
        const encodedSeccion = encodeURIComponent(seccionNameRaw);
        
        // Construir la query con qs si estuviera disponible, o de forma robusta a mano:
        // Strapi permite populeo profundo genérico con populate[Filas][populate]=*
        // o si eso falla, usamos el objeto exacto de populate on fragments.
        const queryParams = new URLSearchParams();
        queryParams.append('filters[seccion][$eq]', seccionNameRaw);
        
        // Populemos las imágenes de los banners internos usando sintaxis de fragmentos (on)
        queryParams.append('populate[Filas][on][layout.fila-1-columna][populate][banner][populate]', '*');
        queryParams.append('populate[Filas][on][layout.fila-2-columnas][populate][banners][populate]', '*');
        queryParams.append('populate[Filas][on][layout.fila-4-columnas][populate][banners][populate]', '*');
        queryParams.append('populate[Filas][on][layout.fila-mixta][populate][banner_principal][populate]', '*');
        queryParams.append('populate[Filas][on][layout.fila-mixta][populate][banner_secundario_1][populate]', '*');
        queryParams.append('populate[Filas][on][layout.fila-mixta][populate][banner_secundario_2][populate]', '*');

        const res = await fetch(`${STRAPI_URL}/api/promociones-inicios?${queryParams.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        // Si es collectionType, json.data es un array. Tomamos el primero que coincida.
        if (json && json.data && json.data.length > 0) {
          const entry = json.data[0];
          setFilas(entry.attributes?.Filas || []);
        } else {
          setFilas([]);
        }
      } catch (err) {
        console.error('[PromoModules] Error al cargar promociones:', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPromociones();
  }, [seccion]);

  if (loading || filas.length === 0) return null;

  return (
    <Wrapper>
      {filas.map((fila, index) => {
        const type = fila.__component;
        
        if (type === 'layout.fila-1-columna') {
          if (fila.es_carrusel) {
            return (
              <CarouselTrack key={index}>
                <ResponsiveBanner banner={fila.banner} isCarousel={true} cols={1} />
              </CarouselTrack>
            );
          }
          return (
            <Grid1Col key={index}>
              <ResponsiveBanner banner={fila.banner} isCarousel={false} />
            </Grid1Col>
          );
        }

        if (type === 'layout.fila-2-columnas') {
          const banners = fila.banners || [];
          if (fila.es_carrusel) {
            return (
              <CarouselTrack key={index}>
                {banners.map((b, i) => <ResponsiveBanner key={i} banner={b} isCarousel={true} cols={2} />)}
              </CarouselTrack>
            );
          }
          return (
            <Grid2Cols key={index}>
              {banners.map((b, i) => <ResponsiveBanner key={i} banner={b} isCarousel={false} />)}
            </Grid2Cols>
          );
        }

        if (type === 'layout.fila-4-columnas') {
          const banners = fila.banners || [];
          if (fila.es_carrusel) {
            return (
              <CarouselTrack key={index}>
                {banners.map((b, i) => <ResponsiveBanner key={i} banner={b} isCarousel={true} cols={4} />)}
              </CarouselTrack>
            );
          }
          return (
            <Grid4Cols key={index}>
              {banners.map((b, i) => <ResponsiveBanner key={i} banner={b} isCarousel={false} />)}
            </Grid4Cols>
          );
        }

        if (type === 'layout.fila-mixta') {
          return (
            <GridMixta key={index}>
              <MixtaPrincipal>
                <ResponsiveBanner banner={fila.banner_principal} isCarousel={false} />
              </MixtaPrincipal>
              <MixtaSecundario style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ flex: 1 }}><ResponsiveBanner banner={fila.banner_secundario_1} isCarousel={false} /></div>
                <div style={{ flex: 1 }}><ResponsiveBanner banner={fila.banner_secundario_2} isCarousel={false} /></div>
              </MixtaSecundario>
            </GridMixta>
          );
        }

        return null;
      })}
    </Wrapper>
  );
}
