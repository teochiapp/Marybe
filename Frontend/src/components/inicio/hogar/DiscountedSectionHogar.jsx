import React, { useRef, useCallback, useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

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
    padding: 30px 0;
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
`;

const ProductsGrid = styled.div`
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

const ProductCard = styled.div`
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
  
  width: calc((100% - (6 * 15px)) / 6.5);
  
  @media (max-width: 1700px) {
    width: calc((100% - (5 * 15px)) / 5.5);
  }

  @media (max-width: 1440px) {
    width: calc((100% - (4 * 15px)) / 4.5);
  }

  @media (max-width: 1200px) {
    width: calc((100% - (3 * 15px)) / 3.5);
  }

  @media (max-width: 900px) {
    width: calc((100% - (2 * 15px)) / 2.5);
  }

  @media (max-width: 600px) {
    width: calc((100% - (1 * 15px)) / 1.5);
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

const HeartIcon = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-bordo-secundario);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;

  svg {
    width: 22px;
    height: 22px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;

    @media (max-width: 600px) {
      width: 20px;
      height: 20px;
    }
  }
`;

const ProductBrand = styled.div`
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--color-marron-secundario);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  letter-spacing: 10%;
  margin-bottom: 15px;

  @media (max-width: 600px) {
    margin-bottom: 10px;
  }
`;

const ProductName = styled.h3`
  font-size: 16px;
  color: black;
  font-family: var(--font-family-secondary);
  font-weight: 400;
  margin-bottom: 4px;
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
  background-color: var(--color-marron-cuarto);
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
    background-color: var(--color-marron-principal);
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

// Helper SVG Icons
const HeartOutline = () => (
  <svg viewBox="0 0 24 24">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

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

export default function DiscountedSectionHogar() {
  const [productos, setProductos] = useState([]);
  const [tituloCursiva, setTituloCursiva] = useState('Descuentos');
  const [tituloNormal, setTituloNormal] = useState('de Hogar');
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  const singleTypeEndpoint = `${process.env.REACT_APP_STRAPI_URL}/api/seccion-descuento-hogar?populate[productos][populate]=*`;

  const fetchFallbackProducts = useCallback(() => {
    fetch(`${process.env.REACT_APP_STRAPI_URL}/api/productos?filters[descuento][$gt]=0&filters[seccion][$eq]=Hogar&populate=*`)
      .then(res => res.json())
      .then(data => {
        if (data && data.data) {
          setProductos(data.data);
        }
      })
      .catch(err => console.error('Error fetching fallback discounted productos para hogar:', err));
  }, []);

  useEffect(() => {
    setProductos([]);
    setTituloCursiva('Descuentos');
    setTituloNormal('de Hogar');

    fetch(singleTypeEndpoint)
      .then(res => {
        if (!res.ok) {
          throw new Error('Endpoint seccion-descuento-hogar not configured or failed');
        }
        return res.json();
      })
      .then(data => {
        const item = data && data.data;
        if (item) {
          const attrs = item.attributes || item;
          if (attrs.titulo_cursiva) setTituloCursiva(attrs.titulo_cursiva);
          if (attrs.titulo_normal) setTituloNormal(attrs.titulo_normal);

          let prods = [];
          if (attrs.productos) {
            prods = attrs.productos.data || attrs.productos;
          }

          if (Array.isArray(prods) && prods.length > 0) {
            setProductos(prods);
          } else {
            fetchFallbackProducts();
          }
        } else {
          fetchFallbackProducts();
        }
      })
      .catch(err => {
        console.warn('Using fallback for discounted products (Hogar):', err);
        fetchFallbackProducts();
      });
  }, [singleTypeEndpoint, fetchFallbackProducts]);

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

  const handleProductClick = (id) => {
    if (!isDragging.current) {
      navigate(`/producto/${id}`);
    }
  };

  const formatPrice = (price) => {
    if (!price) return '$0';
    return '$' + Number(price).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const getStampValue = (descuento) => {
    if (descuento <= 20) return 20;
    if (descuento <= 30) return 30;
    if (descuento <= 35) return 35;
    if (descuento <= 40) return 40;
    return 50;
  };

  return (
    <SectionWrapper>
      <TopHeader>
        <TextBlock>
          <DeliveryInfo>
            <TruckIcon /> Envíos a todo el país
          </DeliveryInfo>
          <Title>
            <span className="italic-text">{tituloCursiva}</span>
            <span className="regular-text">{tituloNormal}</span>
          </Title>
        </TextBlock>
        <FeaturedPicture>
          <img src="/inicio/discountedSectionHogar.png" alt="Descuentos de Hogar" />
        </FeaturedPicture>
      </TopHeader>

      <ProductsGrid
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {productos.map((item) => {
          const id = item.id || item.documentId;
          const attrs = item.attributes || item;

          const nombre = attrs.nombre;
          const marca = attrs.marca;
          const descuento = attrs.descuento || 0;

          const variantes = attrs.variantes || [];
          const mainVariant = variantes[0] || {};
          const price = mainVariant.precio || 0;
          const offerPrice = mainVariant.precio_oferta || null;

          let imgUrl = null;
          if (attrs.portada?.data?.attributes?.url) {
            imgUrl = `${process.env.REACT_APP_STRAPI_URL}${attrs.portada.data.attributes.url}`;
          } else if (attrs.portada?.url) {
            imgUrl = `${process.env.REACT_APP_STRAPI_URL}${attrs.portada.url}`;
          }

          const stampVal = descuento > 0 ? getStampValue(descuento) : null;

          return (
            <ProductCard key={id}>
              <CardImageContainer onClick={() => handleProductClick(id)}>
                {descuento > 0 && stampVal && (
                  <StampOverlay src={`/ofertas/${stampVal}.png`} alt={`Hasta ${stampVal}% OFF`} />
                )}
                {imgUrl ? (
                  <img src={imgUrl} alt={nombre} style={{ width: '100%', height: '100%', objectFit: 'contain' }} draggable="false" />
                ) : (
                  <ImagePlaceholder />
                )}
                <HeartContainer>
                  <HeartIcon aria-label="Agregar a favoritos" onClick={(e) => { e.stopPropagation(); }}>
                    <HeartOutline />
                  </HeartIcon>
                </HeartContainer>
              </CardImageContainer>

              <ProductName onClick={() => handleProductClick(id)}>{nombre}</ProductName>
              <ProductBrand>{marca}</ProductBrand>

              <PriceRow>
                {offerPrice && <OldPrice>{formatPrice(price)}</OldPrice>}
                <CurrentPrice>{formatPrice(offerPrice || price)}</CurrentPrice>
                {descuento > 0 && <DiscountBadge>{descuento}%</DiscountBadge>}
              </PriceRow>

              <Installments>
                3 cuotas sin interés de {formatPrice(Math.round((offerPrice || price) / 3))}
              </Installments>
              <LegalText>
                Precio sin impuestos nacionales {formatPrice(Math.round((offerPrice || price) * 0.79))}
              </LegalText>

              <AddButton>
                Agregar <CartIcon />
              </AddButton>
            </ProductCard>
          );
        })}
      </ProductsGrid>

      <BottomLink onClick={() => navigate(`/tienda?descuento=todas&seccion=Hogar`)}>
        Conocer más <ChevronRightIcon />
      </BottomLink>
    </SectionWrapper>
  );
}
