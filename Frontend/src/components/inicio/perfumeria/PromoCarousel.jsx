import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import VisualBanners from '../../banners/VisualBanners';
import BannerCarousel from '../../banners/BannerCarousel';
import { isVideoMedia } from '../../../utils/bannerDesign';
import { INICIO_CACHE_TTL_MS, fetchWithSWR, readCachedEntry } from '../../../utils/apiCache';
import { isRequestCanceled } from '../../../utils/requestDedup';

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
      height: 280px;
      max-height: 280px;
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
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-4px);
  }

  /* Si está dentro de un carrusel, debe tener un ancho fijo */
  ${({ $isCarousel, $cols, $customWidth, $peek }) => $isCarousel && `
    flex-shrink: 0;
    scroll-snap-align: start;
    /* En mobile 1 slide al 100% */
    width: ${$peek ? '88%' : '100%'};
    min-width: ${$peek ? '88%' : '100%'};

    @media (min-width: 768px) {
      width: ${$customWidth ? `calc((${$customWidth}% - 16px) * ${$peek ? '.88' : '1'})` : `calc((100% - ${($cols - 1) * 16}px) / ${$cols} * ${$peek ? '.88' : '1'})`};
      min-width: ${$customWidth ? `calc((${$customWidth}% - 16px) * ${$peek ? '.88' : '1'})` : `calc((100% - ${($cols - 1) * 16}px) / ${$cols} * ${$peek ? '.88' : '1'})`};
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
const ResponsiveBanner = ({ banner, isCarousel, cols, peek }) => {
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
    <BannerCard $isCarousel={isCarousel} $cols={cols} $customWidth={customWidth} $peek={peek}>
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

const CarouselTrack = ({ children, settings }) => <BannerCarousel Track={ScrollRow} settings={settings}>{children}</BannerCarousel>;

const extractPromoFilas = (json) =>
  json && Array.isArray(json.data) && json.data.length > 0
    ? json.data.flatMap((entry) => entry.Filas || entry.attributes?.Filas || [])
    : [];

const preloadFirstPromoImage = (fetchedFilas) => {
  if (typeof document === 'undefined' || fetchedFilas.length === 0) return;
  const primeraFila = fetchedFilas[0];
  const banners = primeraFila.banners || (primeraFila.banner ? [primeraFila.banner] : []);
  if (banners.length > 0 && banners[0]) {
    const b = banners[0];
    const desktopUrl = b.imagen_desktop?.url || b.imagen_desktop?.data?.attributes?.url;
    if (desktopUrl && !isVideoMedia(b.imagen_desktop)) {
      const fullUrl = desktopUrl.startsWith('http') ? desktopUrl : `${STRAPI_URL}${desktopUrl}`;
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
};

export default function PromoCarousel({ seccion = 'perfumeria' }) {
  const seccionNameRaw = seccion === 'hogar' ? 'Hogar' : 'Perfumer\u00eda';
  const cacheKey = `inicio:promociones:${seccionNameRaw}`;

  const [filas, setFilas] = useState(() => {
    const cached = readCachedEntry(cacheKey, { ttlMs: INICIO_CACHE_TTL_MS });
    return cached ? extractPromoFilas(cached.data) : [];
  });
  const [loading, setLoading] = useState(
    () => !readCachedEntry(cacheKey, { ttlMs: INICIO_CACHE_TTL_MS })
  );

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const cached = readCachedEntry(cacheKey, { ttlMs: INICIO_CACHE_TTL_MS });

    if (cached) {
      const cachedFilas = extractPromoFilas(cached.data);
      setFilas(cachedFilas);
      preloadFirstPromoImage(cachedFilas);
      setLoading(false);
    } else {
      setFilas([]);
      setLoading(true);
    }

    const queryParams = new URLSearchParams();
    queryParams.append('filters[seccion][$eq]', seccionNameRaw);
    queryParams.append('status', 'published');
    queryParams.append('sort[0]', 'createdAt:asc');
    queryParams.append('pagination[pageSize]', '100');

    // Populemos las imágenes de los banners internos usando sintaxis de fragmentos (on)
    queryParams.append('populate[Filas][on][layout.fila-1-columna][populate][banners][populate]', '*');
    queryParams.append('populate[Filas][on][layout.fila-2-columnas][populate][banners][populate]', '*');
    queryParams.append('populate[Filas][on][layout.fila-4-columnas][populate][banners][populate]', '*');
    queryParams.append('populate[Filas][on][layout.fila-mixta][populate][banners][populate]', '*');

    const url = `${STRAPI_URL}/api/promociones-inicios?${queryParams.toString()}`;

    fetchWithSWR(cacheKey, url, {
      ttlMs: INICIO_CACHE_TTL_MS,
      signal: controller.signal,
      passSignal: true,
      fallbackToStaleOnError: true,
      onData: (json) => {
        if (!active) return;
        const fetchedFilas = extractPromoFilas(json);
        setFilas(fetchedFilas);
        preloadFirstPromoImage(fetchedFilas);
        setLoading(false);
      },
    })
      .catch((err) => {
        if (active && !isRequestCanceled(err)) {
          console.error('[PromoModules] Error al cargar promociones:', err.message);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [cacheKey, seccionNameRaw]);

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
  if (filas.some(row => Object.keys(row.diseno || {}).length || row.banners?.some(banner => Object.keys(banner.diseno || {}).length || banner.mostrar_texto || banner.activo === false || ['imagen_desktop', 'imagen_tablet', 'imagen_mobile'].some(key => isVideoMedia(banner[key]))))) return <VisualBanners rows={filas} />;

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
              <CarouselTrack key={index} settings={fila.config_carrusel}>
                {banners.map((b, i) => <ResponsiveBanner key={i} banner={b} isCarousel={true} cols={1} peek={fila.config_carrusel?.vistaParcial} />)}
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
              <CarouselTrack key={index} settings={fila.config_carrusel}>
                {banners.map((b, i) => <ResponsiveBanner key={i} banner={b} isCarousel={true} cols={2} peek={fila.config_carrusel?.vistaParcial} />)}
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
              <CarouselTrack key={index} settings={fila.config_carrusel}>
                {banners.map((b, i) => <ResponsiveBanner key={i} banner={b} isCarousel={true} cols={4} peek={fila.config_carrusel?.vistaParcial} />)}
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
              <CarouselTrack key={index} settings={fila.config_carrusel}>
                {banners.map((b, i) => <ResponsiveBanner key={i} banner={b} isCarousel={true} cols={3} peek={fila.config_carrusel?.vistaParcial} />)}
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
