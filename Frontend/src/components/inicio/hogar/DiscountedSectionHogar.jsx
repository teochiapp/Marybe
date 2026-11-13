import React, { useRef, useCallback, useState, useEffect } from 'react';
import styled from 'styled-components';
import BannerSlot from '../../banners/BannerOverrides';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { generateProductUrl } from '../../../utils/productUrl';
import { getProductPrice } from '../../../utils/productPrice';
import AddToCartModal from '../../carrito/AddToCartModal';
import FavoriteButton from '../../shared/FavoriteButton';
import { staggerContainerVariants, staggerItemLeftVariants } from '../../animations/ScrollAnimations';
import { useConfiguracionGeneral } from '../../../hooks/useConfiguracionGeneral';
import { cmsColorStyle } from '../../../utils/cmsColor';
import { imageUrl } from '../../../utils/bannerDesign';
import { imageScaleCss, imageScaleProps } from '../../../utils/imageScale';
import { DESCUENTOS_DEFAULTS, botonDestino, descuentosDefaultUrl, entidadProductosUrl, imagenEstilo, isExternalUrl } from '../../../utils/descuentosBloque';
import useDescuentosBloque from '../../../hooks/useDescuentosBloque';
import { useSeccionPrincipalData } from '../../../context/SeccionPrincipalContext';
import { INICIO_CACHE_TTL_MS, fetchWithSWR, readCachedEntry } from '../../../utils/apiCache';

const SectionWrapper = styled.section`
  background-color: var(--color-hogar);
  border-radius: var(--radius-xl);
  padding-left: 60px;
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  gap: 0px;
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 30px 20px;
    padding-right: 0 !important;
    padding-left: 20px;
    gap: 30px;
  }
`;

const TopHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
  padding-top: 10px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 5px;
    padding: 0 20px;
  }
`;

const TextBlock = styled.div`
  max-width: 50%;
  padding-left: 60px;
  
  @media (max-width: 768px) {
    max-width: 100%;
    display: contents;
  }
`;

const DeliveryInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-blanco);
  font-size: 1rem;
  font-weight: 400;
  margin-bottom: 40px;
  margin-top: 40px;

  @media (max-width: 768px) {
    justify-content: center;
    margin-top: 10px;
    margin-bottom: 5px;
  }
`;

const Title = styled.h2`
  font-family: var(--font-family-primary);
  font-size: clamp(2.5rem, 4vw, 4rem);
  line-height: 0.95;
  font-weight: 600;
  margin-bottom: 25px;
  letter-spacing: -0.02em;

  .italic-text {
    color: var(--color-blanco);
    font-style: italic;
    display: block;
  }

  .regular-text {
    color: var(--color-blanco);
    font-weight: 400;
    display: block;
  }
  
  @media (max-width: 768px) {
    font-size: 3.3rem;
    order: 1;
  }

  @media (max-width: 400px) {
    font-size: 2.7rem;
  }
`;

const FeaturedPicture = styled.picture`
  width: 50%;
  max-height: 52vh;
  max-width: 100%;
  padding-right: 60px;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  position: relative;
  top: 30px;
  z-index: 2;
  margin-bottom: -80px;
  pointer-events: none;
  
  @media (max-width: 768px) {
    width: 100%;
    max-height: 50vh;
    order: 2;
    top: 0;
    padding: 0;
    margin-bottom: -60px;
  }

  img {
    width: auto;
    max-width: 100%;
    height: 100%;
    max-height: 50vh;
    object-fit: contain;
    filter: drop-shadow(0 15px 25px rgba(0,0,0,0.45));

    @media (max-width: 768px) {
      max-height: 50vh;
    }
  }

  ${imageScaleCss('center')}
`;

const ProductsGrid = styled(motion.div)`
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  gap: 15px;
  position: relative;
  z-index: 1;
  cursor: grab;
  margin-left: 60px;

  &:active {
    cursor: grabbing;
  }

  &::-webkit-scrollbar {
    display: none;
  }

  @media (min-width: 1250px) and (max-width: 1524px) {
    margin-top: -5vh;
  }

  @media (max-width: 1024px) {
    margin-left: 40px;
  }

  @media (max-width: 600px) {
    margin-left: 20px;
  }
`;

const ProductCard = styled(motion.div)`
  background-color: var(--color-blanco);
  border-radius: 20px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: transform 0.3s ease;
  flex-shrink: 0;
  scroll-snap-align: start;
  user-select: none;
  -webkit-user-drag: none;
  
  /* Pantallas muy grandes (> 1600px): 5.5 tarjetas */
  width: 290px;
  
  @media (max-width: 1600px) {
    /* Pantallas grandes (1401px - 1600px): 4.5 tarjetas */
    width: 290px;
  }

  @media (max-width: 1400px) {
    /* Notebooks (998px - 1400px): 3.5 tarjetas */
    width: 290px;
  }

  @media (max-width: 997px) {
    /* Tablets (601px - 997px): 2.5 tarjetas */
    width: 280px;
  }

  @media (max-width: 600px) {
    /* Mobile (<= 600px): 1.5 tarjetas */
    width: 240px;
    padding: 12px;
  }
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const CardImageContainer = styled.div`
  width: 100%;
  height: 200px;
  background-color: #fff;
  border-radius: var(--radius-md);
  margin-bottom: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
  cursor: pointer;

  @media (max-width: 600px) {
    height: 140px;
    margin-bottom: 10px;
  }
  
  > svg {
    width: 60px;
    height: 60px;
    opacity: 0.1;
  }
`;

const StampOverlay = styled.img`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 48px;
  height: 48px;
  object-fit: contain;
  z-index: 2;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));

  @media (max-width: 600px) {
    width: 38px;
    height: 38px;
    top: 5px;
    right: 5px;
  }
`;

const HeartContainer = styled.div`
  position: absolute;
  bottom: 15px;
  right: 15px;
  z-index: 2;
`;



const ProductBrand = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-marron-secundario);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  letter-spacing: 10%;
  margin-bottom: 4px;

  @media (max-width: 600px) {
    margin-bottom: 4px;
  }
`;

const ProductName = styled.h3`
  font-size: 16px;
  color: black;
  font-family: var(--font-family-secondary);
  font-weight: 400;
  margin-bottom: 15px;
  line-height: 1.2;
  letter-spacing: 0%;
  cursor: pointer;

  @media (max-width: 600px) {
    font-size: 14px;
  }
`;

const PriceRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  column-gap: 10px;
  row-gap: 4px;
  margin-bottom: 6px;

  @media (max-width: 1024px) {
    column-gap: 6px;
  }
`;

const OldPrice = styled.span`
  font-size: 0.85rem;
  color: #a0a0a0;
  text-decoration: line-through;
`;

const CurrentPrice = styled.span`
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-bordo-secundario);

  @media (max-width: 600px) {
    font-size: 1.1rem;
  }
`;

const DiscountBadge = styled.span`
  background-color: var(--color-bordo-secundario);
  color: white;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
`;

const Installments = styled.div`
  font-size: 0.85rem;
  color: #535353;
  margin-bottom: 6px;
  font-weight: 600;

  @media (max-width: 600px) {
    font-size: 0.75rem;
  }
`;

const LegalText = styled.div`
  font-size: 0.7rem;
  color: #b0b0b0;
  margin-bottom: 20px;
  font-weight: 400;

  @media (max-width: 600px) {
    margin-bottom: 12px;
    font-size: 0.65rem;
  }
`;

const AddButton = styled.button`
  background-color: var(--color-marron-principal);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px 24px;
  font-weight: 500;
  font-size: 1rem;
  letter-spacing: 2%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  transition: background-color 0.2s;
  margin-top: auto;

  @media (max-width: 600px) {
    padding: 12px 16px;
    font-size: 0.9rem;
    border-radius: 10px;
  }

  &:hover {
    background-color: var(--color-bordo-secundario);
  }
  
  svg {
    width: 20px;
    height: 20px;
    fill: none;
    stroke: currentColor;

    @media (max-width: 600px) {
      width: 18px;
      height: 18px;
    }
  }
`;

const BottomLink = styled.button`
  background: none;
  border: none;
  color: var(--color-blanco);
  font-size: 1.1rem;
  font-weight: 400;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: color 0.2s;
  padding: 40px 0;

  &:hover {
    color: white;
  }

  @media (max-width: 767px) {
    padding: 8px 0;
  }
`;

const ScrollWrapper = styled.div`
  position: relative;
`;

const ArrowBtn = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${({ $side }) => $side}: 10px;
  z-index: 10;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: none;
  background-color: rgba(255, 255, 255, 0.92);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
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
    width: 16px;
    height: 16px;
    stroke: currentColor;
    stroke-width: 2.5;
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

// Helper SVG Icons


const CartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 22C8.55228 22 9 21.5523 9 21C9 20.4477 8.55228 20 8 20C7.44772 20 7 20.4477 7 21C7 21.5523 7.44772 22 8 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19 22C19.5523 22 20 21.5523 20 21C20 20.4477 19.5523 20 19 20C18.4477 20 18 20.4477 18 21C18 21.5523 18.4477 22 19 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2.0498 2.05005H4.0498L6.7098 14.47C6.80738 14.9249 7.06048 15.3315 7.42552 15.6199C7.79056 15.9083 8.24471 16.0604 8.7098 16.05H18.4898C18.945 16.0493 19.3863 15.8933 19.7408 15.6079C20.0954 15.3224 20.3419 14.9246 20.4398 14.48L22.0898 7.05005H5.1198" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ImagePlaceholder = () => (
  <svg viewBox="0 0 24 24" fill="#ccc">
    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
  </svg>
);

const TruckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px', display: 'inline-block' }}>
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block' }}>
    <path d="M4.5 9L7.5 6L4.5 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronLeft = () => (
  <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
);
const ChevronRight = () => (
  <svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" /></svg>
);

export default function DiscountedSectionHogar({ previewData }) {
  const { config } = useConfiguracionGeneral();
  const { config: bloque, entidadActual, loading: bloqueLoading } = useDescuentosBloque('hogar', previewData);
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddClick = (product, e) => {
    e.stopPropagation();
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const singleTypeEndpoint = `${process.env.REACT_APP_STRAPI_URL}/api/seccion-principal?populate[descuento_hogar][populate]=*`;
  const { attrs: mainAttrs, loading: seccionLoading } = useSeccionPrincipalData(singleTypeEndpoint, {
    skip: bloqueLoading,
  });

  const attrs = mainAttrs?.descuento_hogar || null;
  const coloresTitulo = attrs || null;
  const tituloCursiva = attrs?.titulo_cursiva || 'Descuentos';
  const tituloNormal = attrs?.titulo_normal || 'de Hogar';

  const rawMediaUrl = attrs?.imagen_destacada?.data?.attributes?.url || attrs?.imagen_destacada?.url || null;
  const imagenUrl = rawMediaUrl
    ? rawMediaUrl.startsWith('http')
      ? rawMediaUrl
      : `${process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337'}${rawMediaUrl}`
    : null;

  const entidadEndpoint = entidadProductosUrl(bloque);
  const fallbackEndpoint = `${process.env.REACT_APP_STRAPI_URL}/api/productos?filters[publicado][$eq]=true&filters[descuento][$gt]=0&filters[seccion][$eq]=Hogar&populate=*`;
  const fallbackCacheKey = 'inicio:descuentos-fallback:Hogar';
  const entidadCacheKey = entidadEndpoint ? `inicio:descuentos-entidad:${entidadEndpoint}` : '';

  const [productos, setProductos] = useState(() => {
    if (entidadCacheKey) {
      const cachedEnt = readCachedEntry(entidadCacheKey, { ttlMs: INICIO_CACHE_TTL_MS });
      if (Array.isArray(cachedEnt?.data?.data) && cachedEnt.data.data.length > 0) {
        return cachedEnt.data.data;
      }
    } else {
      const attrsProds = attrs?.productos?.data || attrs?.productos;
      if (Array.isArray(attrsProds) && attrsProds.length > 0) {
        return attrsProds;
      }
    }
    const cachedFallback = readCachedEntry(fallbackCacheKey, { ttlMs: INICIO_CACHE_TTL_MS });
    return Array.isArray(cachedFallback?.data?.data) ? cachedFallback.data.data : [];
  });

  const fetchFallbackProducts = useCallback(
    (isActive = () => true) => {
      const cachedFallback = readCachedEntry(fallbackCacheKey, { ttlMs: INICIO_CACHE_TTL_MS });
      if (isActive() && Array.isArray(cachedFallback?.data?.data)) {
        setProductos(cachedFallback.data.data);
      }
      fetchWithSWR(fallbackCacheKey, fallbackEndpoint, {
        ttlMs: INICIO_CACHE_TTL_MS,
        passSignal: false,
        fallbackToStaleOnError: true,
        onData: (data) => {
          if (isActive() && Array.isArray(data?.data)) {
            setProductos(data.data);
          }
        },
      }).catch((err) => console.error('Error fetching fallback discounted productos para hogar:', err));
    },
    [fallbackCacheKey, fallbackEndpoint]
  );

  useEffect(() => {
    if (bloqueLoading || entidadEndpoint) return undefined;
    let active = true;
    const isActive = () => active;

    if (seccionLoading) {
      setProductos([]);
      return () => {
        active = false;
      };
    }

    const attrsProds = attrs?.productos?.data || attrs?.productos || [];
    if (Array.isArray(attrsProds) && attrsProds.length > 0) {
      setProductos(attrsProds);
    } else {
      fetchFallbackProducts(isActive);
    }

    return () => {
      active = false;
    };
  }, [bloqueLoading, seccionLoading, entidadEndpoint, attrs, fetchFallbackProducts]);

  // Si el bloque promociona una categoría, marca o proveedor específico, mostrar sus productos publicados.
  useEffect(() => {
    if (!entidadEndpoint) return undefined;
    let active = true;
    const isActive = () => active;

    const cached = readCachedEntry(entidadCacheKey, { ttlMs: INICIO_CACHE_TTL_MS });
    if (Array.isArray(cached?.data?.data) && cached.data.data.length > 0) {
      setProductos(cached.data.data);
    }

    fetchWithSWR(entidadCacheKey, entidadEndpoint, {
      ttlMs: INICIO_CACHE_TTL_MS,
      passSignal: false,
      fallbackToStaleOnError: true,
      onData: (data) => {
        if (!active) return;
        const prods = data?.data || [];
        if (Array.isArray(prods) && prods.length > 0) {
          setProductos(prods);
        } else {
          fetchFallbackProducts(isActive);
        }
      },
    }).catch(() => {
      if (active) fetchFallbackProducts(isActive);
    });

    return () => {
      active = false;
    };
  }, [entidadEndpoint, entidadCacheKey, fetchFallbackProducts]);

  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftVal = useRef(0);
  const isDragging = useRef(false);

  const handleMouseDown = useCallback((e) => {
    const el = scrollRef.current;
    if (!el) return;
    isDown.current = true;
    isDragging.current = false;
    el.style.scrollSnapType = 'none';
    el.style.scrollBehavior = 'auto';
    startX.current = e.pageX - el.offsetLeft;
    scrollLeftVal.current = el.scrollLeft;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!isDown.current) return;
    isDown.current = false;
    const el = scrollRef.current;
    if (el) {
      el.style.scrollSnapType = 'x mandatory';
      el.style.scrollBehavior = '';
    }
  }, []);

  const handleMouseUp = useCallback(() => {
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
    if (Math.abs(walk) > 5) {
      isDragging.current = true;
    }
    el.scrollLeft = scrollLeftVal.current - walk;
  }, []);

  const scrollByStep = useCallback((dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const first = el.children[0];
    const gap = 30;
    const step = first ? first.getBoundingClientRect().width + gap : el.clientWidth;
    el.scrollTo({ left: el.scrollLeft + dir * step, behavior: 'smooth' });
  }, []);

  const handleProductClick = (id, nombre) => {
    if (!isDragging.current) {
      navigate(generateProductUrl(id, nombre));
    }
  };

  const formatPrice = (price) => {
    if (!price) return '$0';
    return '$' + Number(price).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const getStampValue = (descuento) => {
    if (descuento <= 10) return 10;
    if (descuento <= 15) return 15;
    if (descuento <= 20) return 20;
    if (descuento <= 25) return 25;
    if (descuento <= 30) return 30;
    if (descuento <= 35) return 35;
    if (descuento <= 40) return 40;
    if (descuento <= 50) return 50;
    return 60;
  };

  // Evita mostrar los textos o imagen predeterminados mientras se consulta la configuración del backend.
  const configLoading = bloqueLoading || (!bloque && seccionLoading);
  const textoSuperior = configLoading ? '' : (bloque ? bloque.texto_superior : DESCUENTOS_DEFAULTS.texto_superior);
  const cursivaMostrada = configLoading ? '' : (bloque?.titulo_cursiva || tituloCursiva);
  const normalMostrada = configLoading ? '' : (bloque?.titulo_normal || tituloNormal);
  const coloresMostrados = bloque ? { color_titulo_cursiva: bloque.color_titulo_cursiva, color_titulo_normal: bloque.color_titulo_normal } : coloresTitulo;
  const imagenMostrada = configLoading ? '' : ((bloque && imageUrl(bloque.imagen)) || imagenUrl || '/inicio/discountedSectionHogar.webp');
  const imagenMobileMostrada = !configLoading && bloque ? imageUrl(bloque.imagen_mobile) : '';
  const estiloImagen = imagenEstilo(bloque);
  const botonTexto = configLoading ? '' : (bloque?.boton_texto || DESCUENTOS_DEFAULTS.boton_texto);
  const destinoBoton = botonDestino(bloque, descuentosDefaultUrl('hogar'), entidadActual);

  const handleBottomLink = () => {
    if (isExternalUrl(destinoBoton)) {
      window.location.assign(destinoBoton);
      return;
    }
    navigate(destinoBoton);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const pictureElement = (
    <FeaturedPicture data-editor-part="imagen" {...imageScaleProps(bloque)}>
      {imagenMobileMostrada && <source media="(max-width: 768px)" srcSet={imagenMobileMostrada} />}
      {imagenMostrada && (
        <img
          src={imagenMostrada}
          alt={`${cursivaMostrada} ${normalMostrada}`}
          style={estiloImagen}
          onError={event => { if (!event.currentTarget.src.endsWith('/inicio/discountedSectionHogar.webp')) event.currentTarget.src = '/inicio/discountedSectionHogar.webp'; }}
        />
      )}
    </FeaturedPicture>
  );

  return (
    <SectionWrapper>
      <TopHeader>
        <TextBlock>
          <DeliveryInfo data-editor-part="texto" style={configLoading ? { visibility: 'hidden' } : undefined}>
            <TruckIcon /> {textoSuperior}
          </DeliveryInfo>
          <Title data-editor-part="texto">
            <span className="italic-text" style={cmsColorStyle(coloresMostrados?.color_titulo_cursiva)}>{cursivaMostrada}</span>
            <span className="regular-text" style={cmsColorStyle(coloresMostrados?.color_titulo_normal)}>{normalMostrada}</span>
          </Title>
        </TextBlock>
        {bloque ? pictureElement : <BannerSlot name="descuento_hogar" side>{pictureElement}</BannerSlot>}
      </TopHeader>

      <ScrollWrapper>
        <ArrowBtn $side="left" type="button" aria-label="Anterior" onClick={() => scrollByStep(-1)}>
          <ChevronLeft />
        </ArrowBtn>
        <ProductsGrid
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          variants={staggerContainerVariants}
          initial="hidden"
          animate={productos.length ? 'show' : 'hidden'}
        >
          {productos.map((item) => {
            const id = item.id || item.documentId;
            const attrs = item.attributes || item;

            const nombre = attrs.nombre;
            const marca = attrs.marca;
            const { price, offerPrice, calcDescuento: descuentoCalc } = getProductPrice(attrs);

            let imgUrl = null;
            const getFullUrl = (url) => url?.startsWith('http') ? url : `${process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337'}${url}`;
            if (attrs.portada?.data?.attributes?.url) {
              imgUrl = getFullUrl(attrs.portada.data.attributes.url);
            } else if (attrs.portada?.url) {
              imgUrl = getFullUrl(attrs.portada.url);
            }

            const stampVal = descuentoCalc > 0 ? getStampValue(descuentoCalc) : null;

            return (
              <ProductCard key={id} variants={staggerItemLeftVariants}>
                <CardImageContainer onClick={() => handleProductClick(id, nombre)}>
                  {descuentoCalc > 0 && stampVal && (
                    <StampOverlay src={`/ofertas/${stampVal}.png`} alt={`Hasta ${stampVal}% OFF`} />
                  )}
                  {imgUrl ? (
                    <img src={imgUrl} alt={nombre} style={{ width: '100%', height: '100%', objectFit: 'contain' }} draggable="false" />
                  ) : (
                    <ImagePlaceholder />
                  )}
                  <HeartContainer>
                    <FavoriteButton product={item} />
                  </HeartContainer>
                </CardImageContainer>

                <ProductBrand>{marca}</ProductBrand>
                <ProductName onClick={() => handleProductClick(id, nombre)}>{nombre}</ProductName>

                <PriceRow>
                  {offerPrice && <OldPrice>{formatPrice(price)}</OldPrice>}
                  <CurrentPrice>{formatPrice(offerPrice || price)}</CurrentPrice>
                  {descuentoCalc > 0 && <DiscountBadge>{descuentoCalc}%</DiscountBadge>}
                </PriceRow>

                {config?.cuotas_activas && (
                  <Installments>
                    {config?.cuotas_texto_previo ? config.cuotas_texto_previo + ' ' : '3 cuotas sin interés de '}{formatPrice(Math.round((offerPrice || price) / (config?.cuotas_cantidad || 3)))}
                  </Installments>
                )}
                <LegalText>
                  Precio sin impuestos nacionales {formatPrice(Math.round((offerPrice || price) * 0.79))}
                </LegalText>

                <AddButton onClick={(e) => handleAddClick(item, e)}>
                  Agregar <CartIcon />
                </AddButton>
              </ProductCard>
            );
          })}
        </ProductsGrid>
        <ArrowBtn $side="right" type="button" aria-label="Siguiente" onClick={() => scrollByStep(1)}>
          <ChevronRight />
        </ArrowBtn>
      </ScrollWrapper>

      <BottomLink data-editor-part="boton" onClick={handleBottomLink} style={configLoading ? { visibility: 'hidden' } : undefined}>
        {botonTexto} <ChevronRightIcon />
      </BottomLink>

      {selectedProduct && (
        <AddToCartModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          product={selectedProduct}
          initialMode="select"
        />
      )}
    </SectionWrapper>
  );
}
