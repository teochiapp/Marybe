import React, { useRef, useCallback, useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { generateProductUrl } from '../../../utils/productUrl';
import { getProductPrice } from '../../../utils/productPrice';
import AddToCartModal from '../../carrito/AddToCartModal';
import FavoriteButton from '../../shared/FavoriteButton';
import { staggerContainerVariants, staggerItemLeftVariants } from '../../animations/ScrollAnimations';
import { useConfiguracionGeneral } from '../../../hooks/useConfiguracionGeneral';
import { CategoriaDestacadaTitleIcon } from '../../../utils/categoriaDestacadaIconos';
import {
  CATEGORIA_DESTACADA_ESPACIADOS,
  CATEGORIA_DESTACADA_TAMANOS,
  SECCION_ALINEACIONES,
  SECCION_FONDOS,
  disenoCategoriaDestacada,
} from '../../../utils/disenoSeccion';
import { useSeccionPrincipalData } from '../../../context/SeccionPrincipalContext';
import { INICIO_CACHE_TTL_MS, fetchWithSWR, readCachedEntry } from '../../../utils/apiCache';

const SectionWrapper = styled.section`
  padding: ${({ $espaciado }) => (CATEGORIA_DESTACADA_ESPACIADOS[$espaciado] || CATEGORIA_DESTACADA_ESPACIADOS.original)[0]} 60px;
  padding-right: 0px;
  background-color: ${({ $fondo }) => SECCION_FONDOS[$fondo] || 'var(--color-blanco)'};
  display: flex;
  flex-direction: column;
  gap: 30px;

  @media (max-width: 1024px) {
    padding: ${({ $espaciado }) => (CATEGORIA_DESTACADA_ESPACIADOS[$espaciado] || CATEGORIA_DESTACADA_ESPACIADOS.original)[1]} 40px;
  }

  @media (max-width: 768px) {
    padding: ${({ $espaciado }) => (CATEGORIA_DESTACADA_ESPACIADOS[$espaciado] || CATEGORIA_DESTACADA_ESPACIADOS.original)[2]} 20px;
    gap: 20px;
  }
`;

const SectionTitle = styled.h2`
  font-family: var(--font-family-secondary);
  font-size: ${({ $tamano }) => (CATEGORIA_DESTACADA_TAMANOS[$tamano] || CATEGORIA_DESTACADA_TAMANOS.grande)[0]};
  color: var(--color-bordo-secundario);
  font-weight: 600;
  text-align: ${({ $alineacion }) => SECCION_ALINEACIONES[$alineacion] || 'left'};
  padding-right: ${({ $alineacion }) => ($alineacion && $alineacion !== 'izquierda' ? '60px' : '0')};
  margin: 0;

  @media (max-width: 1024px) {
    padding-right: ${({ $alineacion }) => ($alineacion && $alineacion !== 'izquierda' ? '40px' : '0')};
  }

  @media (max-width: 768px) {
    font-size: ${({ $tamano }) => (CATEGORIA_DESTACADA_TAMANOS[$tamano] || CATEGORIA_DESTACADA_TAMANOS.grande)[1]};
    padding-right: 0;
  }
`;

const ProductsGrid = styled(motion.div)`
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  gap: ${({ $metrics }) => $metrics?.desktop?.gap || '40px'};
  position: relative;
  z-index: 1;
  cursor: grab;
  padding-bottom: 20px;

  &:active {
    cursor: grabbing;
  }

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 1024px) {
    gap: ${({ $metrics }) => $metrics?.tablet?.gap || '30px'};
  }

  @media (max-width: 768px) {
    /* El carrusel sangra hasta el borde derecho de la pantalla
       (contrarresta el padding lateral de 20px de la seccion) */
    margin-right: -20px;
    padding-right: 20px;
  }

  @media (max-width: 600px) {
    gap: ${({ $metrics }) => $metrics?.mobile?.gap || '20px'};
  }
`;

const ProductCard = styled(motion.div)`
  background-color: var(--color-blanco);
  border-radius: ${({ $metrics }) => $metrics?.desktop?.cardRadius || '24px'};
  padding: ${({ $metrics }) => $metrics?.desktop?.cardPadding || '20px'};
  display: flex;
  flex-direction: column;
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  flex-shrink: 0;
  scroll-snap-align: start;
  user-select: none;
  -webkit-user-drag: none;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);

  /* Pantallas muy grandes (> 1600px): 5.5 tarjetas */
  width: ${({ $metrics }) => $metrics?.desktop?.cardWidth || '290px'};
  
  @media (max-width: 1600px) {
    /* Pantallas grandes (1401px - 1600px): 4.5 tarjetas */
    width: ${({ $metrics }) => $metrics?.desktop?.cardWidth || '290px'};
  }

  @media (max-width: 1400px) {
    /* Notebooks (998px - 1400px): 3.5 tarjetas */
    width: ${({ $metrics }) => $metrics?.desktop?.cardWidth || '290px'};
  }

  @media (max-width: 997px) {
    /* Tablets (601px - 997px): 2.5 tarjetas */
    width: ${({ $metrics }) => $metrics?.tablet?.cardWidth || '280px'};
    padding: ${({ $metrics }) => $metrics?.tablet?.cardPadding || '20px'};
    border-radius: ${({ $metrics }) => $metrics?.tablet?.cardRadius || '24px'};
  }

  @media (max-width: 600px) {
    /* Mobile (<= 600px): 1.5 tarjetas */
    width: ${({ $metrics }) => $metrics?.mobile?.cardWidth || '240px'};
    padding: ${({ $metrics }) => $metrics?.mobile?.cardPadding || '12px'};
    border-radius: ${({ $metrics }) => $metrics?.mobile?.cardRadius || '18px'};
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  }
`;

const CardImageContainer = styled.div`
  width: 100%;
  height: ${({ $metrics }) => $metrics?.desktop?.imageHeight || '250px'};
  background-color: #fff;
  border-radius: var(--radius-md);
  margin-bottom: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
  cursor: pointer;

  @media (max-width: 997px) {
    height: ${({ $metrics }) => $metrics?.tablet?.imageHeight || '250px'};
  }

  @media (max-width: 600px) {
    height: ${({ $metrics }) => $metrics?.mobile?.imageHeight || '160px'};
    margin-bottom: 10px;
  }

  img.product-img {
    width: 100%;
    height: 100%;
    object-fit: ${({ $fit }) => $fit?.desktop || 'contain'};

    @media (max-width: 997px) {
      object-fit: ${({ $fit }) => $fit?.tablet || 'contain'};
    }

    @media (max-width: 600px) {
      object-fit: ${({ $fit }) => $fit?.mobile || 'contain'};
    }
  }
`;

const StampOverlay = styled.img`
  position: absolute;
  top: 10px;
  left: 10px;
  width: 48px;
  height: 48px;
  object-fit: contain;
  z-index: 2;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));

  @media (max-width: 600px) {
    width: 38px;
    height: 38px;
    top: 5px;
    left: 5px;
  }
`;

const HeartContainer = styled.div`
  position: absolute;
  bottom: 15px;
  right: 15px;
  z-index: 2;
`;



const ProductBrand = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-marron-secundario);
  text-transform: uppercase;
  letter-spacing: 0.5px;
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
  height: 2.4em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
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

// SVG Icons

const ChevronLeft = () => (
  <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
);
const ChevronRight = () => (
  <svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" /></svg>
);


const CartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 22C8.55228 22 9 21.5523 9 21C9 20.4477 8.55228 20 8 20C7.44772 20 7 20.4477 7 21C7 21.5523 7.44772 22 8 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19 22C19.5523 22 20 21.5523 20 21C20 20.4477 19.5523 20 19 20C18.4477 20 18 20.4477 18 21C18 21.5523 18.4477 22 19 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2.0498 2.05005H4.0498L6.7098 14.47C6.80738 14.9249 7.06048 15.3315 7.42552 15.6199C7.79056 15.9083 8.24471 16.0604 8.7098 16.05H18.4898C18.945 16.0493 19.3863 15.8933 19.7408 15.6079C20.0954 15.3224 20.3419 14.9246 20.4398 14.48L22.0898 7.05005H5.1198" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ImagePlaceholder = () => (
  <svg viewBox="0 0 24 24" fill="#ccc" style={{ width: '50px', height: '50px', opacity: 0.15 }}>
    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
  </svg>
);

export default function FeaturedCategorySection({ seccion = 'perfumeria', previewData }) {
  const { config: globalConfig } = useConfiguracionGeneral();
  const isPreview = Boolean(previewData);
  const fieldName = seccion === 'hogar' ? 'destacada_hogar' : 'destacada_perfumeria';
  const endpoint = `${process.env.REACT_APP_STRAPI_URL}/api/seccion-principal?populate[${fieldName}][populate]=*`;
  const { attrs: mainAttrs, loading: configLoading } = useSeccionPrincipalData(endpoint, { skip: isPreview });
  const configApi = isPreview ? null : mainAttrs?.[fieldName] || null;

  const cat = configApi?.categoria?.data || configApi?.categoria;
  const catDocId = cat?.documentId || cat?.id;
  const elegidos = Array.isArray(configApi?.productos_orden) ? configApi.productos_orden : [];
  const seleccion = elegidos.map((id, index) => `&filters[documentId][$in][${index}]=${encodeURIComponent(id)}`).join('');
  const productsUrl = !isPreview && catDocId
    ? `${process.env.REACT_APP_STRAPI_URL}/api/productos?filters[publicado][$eq]=true&filters[categoria][documentId][$eq]=${catDocId}${seleccion}&populate=*${elegidos.length ? '&pagination[pageSize]=100' : ''}`
    : '';
  const productsCacheKey = productsUrl ? `inicio:${fieldName}:${productsUrl}` : '';

  const [productosApi, setProductos] = useState(() => {
    if (!productsCacheKey) return [];
    const cached = readCachedEntry(productsCacheKey, { ttlMs: INICIO_CACHE_TTL_MS });
    if (!cached?.data?.data) return [];
    return elegidos.length
      ? elegidos.map(id => cached.data.data.find(item => item.documentId === id)).filter(Boolean)
      : cached.data.data;
  });
  const [productsLoading, setProductsLoading] = useState(false);

  // previewData (Editor de Inicio) reemplaza título, ícono y productos publicados sin consultar la API.
  const config = isPreview ? { titulo: previewData.titulo, icono_titulo: previewData.icono } : configApi;
  const diseno = disenoCategoriaDestacada(isPreview ? previewData : configApi);
  const productos = isPreview ? previewData.productos || [] : productosApi;
  const loading = isPreview ? false : (configLoading || productsLoading);
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddClick = (product, e) => {
    e.stopPropagation();
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // Obtener productos de la categoría seleccionada (cacheados en memoria por categoría y orden)
  useEffect(() => {
    if (!productsUrl) {
      setProductos([]);
      setProductsLoading(false);
      return undefined;
    }

    let active = true;
    const orderKey = elegidos.join(',');
    const orderIds = orderKey ? orderKey.split(',') : [];
    const applyData = (data) => {
      if (!active || !data?.data) return;
      setProductos(orderIds.length
        ? orderIds.map(id => data.data.find(item => item.documentId === id)).filter(Boolean)
        : data.data);
    };

    const cached = readCachedEntry(productsCacheKey, { ttlMs: INICIO_CACHE_TTL_MS });
    if (cached?.data) {
      applyData(cached.data);
      setProductsLoading(false);
    } else {
      setProductsLoading(true);
    }

    fetchWithSWR(productsCacheKey, productsUrl, {
      ttlMs: INICIO_CACHE_TTL_MS,
      onData: applyData,
    })
      .catch(err => console.error('Error fetching featured category products:', err))
      .finally(() => {
        if (active) setProductsLoading(false);
      });

    return () => { active = false; };
  }, [productsUrl, productsCacheKey, elegidos.join(',')]);

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
    const gap = 40;
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

  if (loading || !config || productos.length === 0) {
    return null;
  }

  const titulo = config.titulo || 'Sección Destacada';

  return (
    <SectionWrapper data-testid="categoria-destacada-seccion" data-editor-part="seccion" $fondo={diseno.fondo} $espaciado={diseno.espaciado} data-fondo={diseno.fondo} data-espaciado={diseno.espaciado}>
      <SectionTitle data-editor-part="titulo" $tamano={diseno.tamano} $alineacion={diseno.alineacion} data-tamano={diseno.tamano} data-alineacion={diseno.alineacion}>
        {titulo}
        <CategoriaDestacadaTitleIcon icono={config.icono_titulo} />
      </SectionTitle>

      <ScrollWrapper>
        <ArrowBtn $side="left" type="button" aria-label="Anterior" onClick={() => scrollByStep(-1)}>
          <ChevronLeft />
        </ArrowBtn>
        <ProductsGrid
          ref={scrollRef}
          data-testid="categoria-destacada-productos"
          data-editor-part="productos"
          $metrics={diseno.metrics}
          data-densidad-desktop={diseno.effectiveDensidad.desktop}
          data-densidad-tablet={diseno.effectiveDensidad.tablet}
          data-densidad-mobile={diseno.effectiveDensidad.mobile}
          data-encuadre-desktop={diseno.effectiveEncuadre.desktop}
          data-encuadre-tablet={diseno.effectiveEncuadre.tablet}
          data-encuadre-mobile={diseno.effectiveEncuadre.mobile}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
        >
          {productos.map(item => {
            const id = item.id || item.documentId;
            const attrs = item.attributes || item;

            const nombre = attrs.nombre;
            const marca = attrs.marca;

            // Precio correcto: ignora variantes fantasma (sin volumen ni color)
            const { price, offerPrice, calcDescuento: descuentoCalc } = getProductPrice(attrs);

            let imgUrl = null;
            if (attrs.portada?.data?.attributes?.url) {
              imgUrl = `${process.env.REACT_APP_STRAPI_URL}${attrs.portada.data.attributes.url}`;
            } else if (attrs.portada?.url) {
              imgUrl = `${process.env.REACT_APP_STRAPI_URL}${attrs.portada.url}`;
            }

            const stampVal = descuentoCalc > 0 ? getStampValue(descuentoCalc) : null;

            return (
              <ProductCard key={id} $metrics={diseno.metrics} variants={staggerItemLeftVariants}>
                <CardImageContainer $metrics={diseno.metrics} $fit={diseno.objectFit} onClick={() => handleProductClick(id, nombre)}>
                  {/* Badge en estampa del descuento */}
                  {descuentoCalc > 0 && stampVal && (
                    <StampOverlay src={`/ofertas/${stampVal}.png`} alt={`Hasta ${stampVal}% OFF`} />
                  )}

                  {imgUrl ? (
                    <img className="product-img" src={imgUrl} alt={nombre} draggable="false" />
                  ) : (
                    <ImagePlaceholder />
                  )}
                  <HeartContainer>
                    <FavoriteButton product={item} />
                  </HeartContainer>
                </CardImageContainer>

                <ProductBrand>{marca}</ProductBrand>
                <ProductName title={nombre} onClick={() => handleProductClick(id, nombre)}>{nombre}</ProductName>

                <PriceRow>
                  {offerPrice && <OldPrice>{formatPrice(price)}</OldPrice>}
                  <CurrentPrice>{formatPrice(offerPrice || price)}</CurrentPrice>
                  {descuentoCalc > 0 && <DiscountBadge>{descuentoCalc}% OFF</DiscountBadge>}
                </PriceRow>

                {globalConfig?.cuotas_activas && (
                  <Installments>
                    {globalConfig?.cuotas_texto_previo ? globalConfig.cuotas_texto_previo + ' ' : '3 cuotas sin interés de '}{formatPrice(Math.round((offerPrice || price) / (globalConfig?.cuotas_cantidad || 3)))}
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
