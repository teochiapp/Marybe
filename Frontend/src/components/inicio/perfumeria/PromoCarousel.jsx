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

const SkeletonCard = styled.div`
  width: 100%;
  height: 480px;
  background: #f5f5f5;
  border-radius: 20px;
  animation: skeletonPulse 1.5s ease-in-out infinite;

  @keyframes skeletonPulse {
    0% { background-color: #f5f5f5; }
    50% { background-color: #e0e0e0; }
    100% { background-color: #f5f5f5; }
  }
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
  padding: 6px 10px 8px 0;
  cursor: grab;
  user-select: none;
  align-items: stretch; /* Obliga a que todas las tarjetas tengan el mismo alto */

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

  /* Banner unico full-width: altura fija para que perfumeria y hogar
     queden del mismo tamano sin importar la imagen */
  picture {
    height: 480px;
    max-height: 480px;
  }

  picture img {
    object-fit: cover;
  }

  @media (max-width: 768px) {
    picture {
      height: 250px;
      max-height: 250px;
    }
  }
`;

const Grid2Cols = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  width: 100%;
`;

const Grid4Cols = styled.div`
  display: flex;
  gap: 16px;
  width: 100%;
  
  /* En mobile se comporta como carrusel de a 2 items */
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding-bottom: 10px; /* Evita que se corte la sombra */

  &::-webkit-scrollbar {
    display: none;
  }

  > div {
    flex-shrink: 0;
    width: calc(50% - 8px); /* Muestra exactamente 2 en pantalla */
    scroll-snap-align: start;
  }

  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    overflow-x: visible;
    padding-bottom: 0;

    > div {
      width: auto;
    }
  }
`;

const GridPersonalizada = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center; /* Centra las tarjetas si no ocupan el 100% */
  align-items: stretch; /* Asegura que tengan la misma altura */
  gap: 16px;
  width: 100%;
`;

const BannerCard = styled.div`
  border-radius: 20px;
  overflow: hidden;
  background-color: #F5F2ED; /* Color de fondo solicitado */
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-4px);
  }

  /* Si está dentro de un carrusel, debe tener un ancho fijo */
  ${({ $isCarousel, $cols, $customWidth }) => $isCarousel && `
    flex-shrink: 0;
    scroll-snap-align: start;
    /* En mobile 1 slide al 100% */
    width: 100%;
    min-width: 100%;

    @media (min-width: 768px) {
      /* En desktop hacemos peek para 1 y 2 cols (85% y 42%). La fila 4 cols queda exacta (calc(25% - 24px)) */
      /* Si hay customWidth (Fila Personalizada), se respeta también en carrusel */
      width: ${$customWidth ? `calc(${$customWidth}% - 16px)` : ($cols === 1 ? '85%' : $cols === 2 ? '42%' : 'calc(25% - 24px)')};
      min-width: ${$customWidth ? `calc(${$customWidth}% - 16px)` : ($cols === 1 ? '85%' : $cols === 2 ? '42%' : 'calc(25% - 24px)')};
    }
  `}

  /* Si tiene ancho personalizado desde Strapi y NO es carrusel (modo grilla apilable) */
  ${({ $customWidth, $isCarousel }) => $customWidth && !$isCarousel && `
    width: 100%;
    @media (min-width: 768px) {
      width: calc(${$customWidth}% - 16px);
      flex: 0 0 calc(${$customWidth}% - 16px);
    }
  `}
`;

const ImgWrapper = styled.div`
  width: 100%;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledPicture = styled.picture`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%; /* Asegura que la imagen ocupe todo el espacio de la tarjeta */
  /* 👇 ACÁ PODÉS AJUSTAR LA ALTURA MÁXIMA EN COMPUTADORA 👇 */
  max-height: 480px; 

  @media (max-width: 768px) {
    /* 👇 ACÁ PODÉS AJUSTAR LA ALTURA MÁXIMA EN CELULARES 👇 */
    max-height: 250px; 
  }

  img {
    width: 100%;
    height: 100%;
    max-height: inherit;
    
    /* 
      Cambiado a 'contain' para que la imagen no se recorte y quede centrada.
      El fondo #FDFDFD rellenará los espacios vacíos.
    */
    object-fit: contain; 
    object-position: center;
    display: block;
    border-radius: 20px;
  }
`;

// ─── Componente Auxiliar: Responsive Banner ──────────────────────────────────
const ResponsiveBanner = ({ banner, isCarousel, cols }) => {
  const navigate = useNavigate();
  if (!banner) return null;

  const desktop = banner.imagen_desktop?.url || banner.imagen_desktop?.data?.attributes?.url;
  if (!desktop) return null; // Fallback si no hay imagen principal

  const tablet = banner.imagen_tablet?.url || banner.imagen_tablet?.data?.attributes?.url || desktop;
  const mobile = banner.imagen_mobile?.url || banner.imagen_mobile?.data?.attributes?.url || tablet;

  const inner = (
    <ImgWrapper>
      <StyledPicture>
        <source media="(max-width: 768px)" srcSet={`${STRAPI_URL}${mobile}`} />
        <source media="(max-width: 1024px)" srcSet={`${STRAPI_URL}${tablet}`} />
        <img
          src={`${STRAPI_URL}${desktop}`}
          alt={banner.titulo || ''}
          draggable="false"
          fetchPriority="high"
          loading="eager"
        />
      </StyledPicture>
    </ImgWrapper>
  );

  const handleClick = (e) => {
    if (banner.enlace && banner.enlace.startsWith('/')) {
      e.preventDefault();
      navigate(banner.enlace);
    }
  };

  const customWidth = banner.ancho_porcentaje;

  return (
    <BannerCard $isCarousel={isCarousel} $cols={cols} $customWidth={customWidth}>
      {banner.enlace ? (
        <a href={banner.enlace} onClick={handleClick} title={banner.titulo} style={{ display: 'flex', flexDirection: 'column', flex: 1, textDecoration: 'none' }}>
          {inner}
        </a>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }} title={banner.titulo}>{inner}</div>
      )}
    </BannerCard>
  );
};

const ArrowBtn = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${({ $side }) => $side}: 8px;
  z-index: 3;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: none;
  background-color: rgba(255, 255, 255, 0.92);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  color: var(--color-marron-principal);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;

  &:hover {
    background-color: #fff;
    transform: translateY(-50%) scale(1.08);
  }

  svg {
    width: 20px;
    height: 20px;
    stroke: currentColor;
    stroke-width: 2.5;
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  @media (max-width: 600px) {
    width: 34px;
    height: 34px;
    ${({ $side }) => $side}: 6px;
    svg { width: 16px; height: 16px; }
  }
`;

const ChevronLeft = () => (
  <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
);
const ChevronRight = () => (
  <svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" /></svg>
);

// ─── Componente Auxiliar: Carousel Track ─────────────────────────────────────
const CarouselTrack = ({ children }) => {
  const scrollRef = useRef(null);

  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftVal = useRef(0);
  const offsetLeftVal = useRef(0);
  const stepRef = useRef(0);
  const maxScrollRef = useRef(0);

  const handleMouseDown = useCallback((e) => {
    const el = scrollRef.current;
    if (!el) return;
    isDown.current = true;
    el.style.scrollSnapType = 'none';
    el.style.scrollBehavior = 'auto';
    offsetLeftVal.current = el.offsetLeft;
    startX.current = e.pageX - offsetLeftVal.current;
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
    const x = e.pageX - offsetLeftVal.current;
    const walk = (x - startX.current) * 1.5;
    el.scrollLeft = scrollLeftVal.current - walk;
  }, []);

  const count = React.Children.count(children);

  const scrollByDir = useCallback((dir) => {
    const el = scrollRef.current;
    if (!el) return;

    // Solo recalcular propiedades geométricas pesadas si no están cacheadas o cambió el tamaño
    if (!stepRef.current || !maxScrollRef.current) {
      const first = el.children[0];
      const gap = 16; // Propiedad constante de diseño (16px en CSS)
      stepRef.current = first ? first.getBoundingClientRect().width + gap : el.clientWidth;
      maxScrollRef.current = el.scrollWidth - el.clientWidth;
    }

    const step = stepRef.current;
    const maxScroll = maxScrollRef.current;
    let target = el.scrollLeft + dir * step;
    if (dir > 0 && el.scrollLeft >= maxScroll - 5) target = 0;
    else if (dir < 0 && el.scrollLeft <= 5) target = maxScroll;
    el.scrollTo({ left: target, behavior: 'smooth' });
  }, []);

  // Limpiar caché en caso de redimensionamiento de pantalla
  useEffect(() => {
    const handleResize = () => {
      stepRef.current = 0;
      maxScrollRef.current = 0;
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Autoplay cada 7s (solo si hay mas de 1 banner = carrusel real)
  useEffect(() => {
    if (count <= 1) return undefined;
    const id = setInterval(() => scrollByDir(1), 7000);
    return () => clearInterval(id);
  }, [count, scrollByDir]);

  return (
    <TrackOuter>
      {count > 1 && (
        <ArrowBtn $side="left" type="button" aria-label="Anterior" onClick={() => scrollByDir(-1)}>
          <ChevronLeft />
        </ArrowBtn>
      )}
      <ScrollRow
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeaveOrUp}
        onMouseUp={handleMouseLeaveOrUp}
        onMouseMove={handleMouseMove}
      >
        {children}
      </ScrollRow>
      {count > 1 && (
        <ArrowBtn $side="right" type="button" aria-label="Siguiente" onClick={() => scrollByDir(1)}>
          <ChevronRight />
        </ArrowBtn>
      )}
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

        // Construir la query con qs si estuviera disponible, o de forma robusta a mano:
        // Strapi permite populeo profundo genérico con populate[Filas][populate]=*
        // o si eso falla, usamos el objeto exacto de populate on fragments.
        const queryParams = new URLSearchParams();
        queryParams.append('filters[seccion][$eq]', seccionNameRaw);

        // Populemos las imágenes de los banners internos usando sintaxis de fragmentos (on)
        queryParams.append('populate[Filas][on][layout.fila-1-columna][populate][banners][populate]', '*');
        queryParams.append('populate[Filas][on][layout.fila-2-columnas][populate][banners][populate]', '*');
        queryParams.append('populate[Filas][on][layout.fila-4-columnas][populate][banners][populate]', '*');
        queryParams.append('populate[Filas][on][layout.fila-mixta][populate][banners][populate]', '*');

        const res = await fetch(`${STRAPI_URL}/api/promociones-inicios?${queryParams.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        // Si es collectionType, json.data es un array. Tomamos el primero que coincida.
        if (json && json.data && json.data.length > 0) {
          const entry = json.data[0];
          const fetchedFilas = entry.Filas || entry.attributes?.Filas || [];
          setFilas(fetchedFilas);

          // Optimización de LCP: Inyectar dinámicamente un preload en el <head> para el primer banner
          if (fetchedFilas.length > 0) {
            const primeraFila = fetchedFilas[0];
            const banners = primeraFila.banners || (primeraFila.banner ? [primeraFila.banner] : []);
            if (banners.length > 0 && banners[0]) {
              const b = banners[0];
              const desktopUrl = b.imagen_desktop?.url || b.imagen_desktop?.data?.attributes?.url;
              if (desktopUrl) {
                const fullUrl = `${STRAPI_URL}${desktopUrl}`;
                if (!document.querySelector(`link[href="${fullUrl}"]`)) {
                  const link = document.createElement('link');
                  link.rel = 'preload';
                  link.as = 'image';
                  link.href = fullUrl;
                  link.setAttribute('fetchpriority', 'high');
                  document.head.appendChild(link);
                }
              }
            }
          }
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

  if (loading) {
    return (
      <Wrapper>
        <div style={{ display: 'flex', gap: '16px', overflow: 'hidden', padding: '6px 10px 8px 0' }}>
          <SkeletonCard style={{ flex: '0 0 calc(50% - 8px)' }} />
          <SkeletonCard style={{ flex: '0 0 calc(50% - 8px)' }} />
        </div>
      </Wrapper>
    );
  }

  if (filas.length === 0) return null;

  return (
    <Wrapper>
      {filas.map((fila, index) => {
        const type = fila.__component;

        if (type === 'layout.fila-1-columna') {
          const banners = fila.banners || [];
          // Soporte legacy por si quedo algun dato guardado como banner
          if (!banners.length && fila.banner) banners.push(fila.banner);

          if (fila.es_carrusel) {
            return (
              <CarouselTrack key={index}>
                {banners.map((b, i) => <ResponsiveBanner key={i} banner={b} isCarousel={true} cols={1} />)}
              </CarouselTrack>
            );
          }
          return (
            <Grid1Col key={index}>
              {banners.slice(0, 1).map((b, i) => <ResponsiveBanner key={i} banner={b} isCarousel={false} />)}
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
              {banners.slice(0, 2).map((b, i) => <ResponsiveBanner key={i} banner={b} isCarousel={false} />)}
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
              {banners.slice(0, 4).map((b, i) => <ResponsiveBanner key={i} banner={b} isCarousel={false} />)}
            </Grid4Cols>
          );
        }

        if (type === 'layout.fila-mixta') {
          const banners = fila.banners || [];
          if (fila.es_carrusel) {
            return (
              <CarouselTrack key={index}>
                {banners.map((b, i) => <ResponsiveBanner key={i} banner={b} isCarousel={true} cols={3} />)}
              </CarouselTrack>
            );
          }

          // Si NO es carrusel, solo mostramos los que entren en el 100% de la fila
          let currentSum = 0;
          const visibleBanners = [];
          for (const b of banners) {
            const width = b.ancho_porcentaje || 100;
            // Damos un margen de 2% por posibles redondeos (ej: 33 + 33 + 33 = 99)
            if (currentSum + width <= 102) {
              visibleBanners.push(b);
              currentSum += width;
            } else {
              break; // El resto se considera "sobrante"
            }
          }

          return (
            <GridPersonalizada key={index}>
              {visibleBanners.map((b, i) => <ResponsiveBanner key={i} banner={b} isCarousel={false} />)}
            </GridPersonalizada>
          );
        }

        return null;
      })}
    </Wrapper>
  );
}
