import React, { useRef, useCallback, useState, useEffect } from 'react';
import styled from 'styled-components';

const SectionWrapper = styled.section`
  padding: 40px 60px;
  background-color: var(--color-blanco);
  display: flex;
  flex-direction: column;
  gap: 30px;

  @media (max-width: 1024px) {
    padding: 30px 40px;
  }

  @media (max-width: 768px) {
    padding: 20px;
    gap: 20px;
  }
`;

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;

  @media (max-width: 768px) {
    gap: 10px;
  }
`;

const TitleIcon = styled.img`
  width: 40px;
  height: 40px;
  object-fit: contain;

  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
  }
`;

const SectionTitle = styled.h2`
  font-family: var(--font-family-secondary);
  font-size: 2.5rem;
  color: ${({ $seccion }) => ($seccion === 'hogar' ? 'var(--color-hogar)' : 'var(--color-bordo-secundario)')};
  font-weight: 600;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const ProductsGrid = styled.div`
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  gap: 40px;
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
    gap: 30px;
  }

  @media (max-width: 600px) {
    gap: 20px;
  }
`;

const ProductCard = styled.div`
  background-color: var(--color-blanco);
  border-radius: 24px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  flex-shrink: 0;
  scroll-snap-align: start;
  user-select: none;
  -webkit-user-drag: none;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);

  width: calc((100% - (4 * 40px)) / 4.5);

  @media (max-width: 1440px) {
    width: calc((100% - (3 * 40px)) / 3.5);
  }

  @media (max-width: 1024px) {
    width: calc((100% - (2 * 30px)) / 2.5);
  }

  @media (max-width: 600px) {
    width: calc((100% - (1 * 20px)) / 1.5);
    padding: 12px;
    border-radius: 18px;
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  }
`;

const CardImageContainer = styled.div`
  width: 100%;
  height: 250px;
  background-color: #fff;
  border-radius: var(--radius-md);
  margin-bottom: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;

  @media (max-width: 600px) {
    height: 160px;
    margin-bottom: 10px;
  }

  img.product-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
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
  height: 2.4em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;

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
  background-color: var(--color-marron-cuarto);
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

// SVG Icons
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
  <svg viewBox="0 0 24 24" fill="#ccc" style={{ width: '50px', height: '50px', opacity: 0.15 }}>
    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
  </svg>
);

export default function SpecificCategorySection({ seccion = 'perfumeria' }) {
  const [config, setConfig] = useState(null);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  const endpoint = seccion === 'hogar'
    ? `${process.env.REACT_APP_STRAPI_URL}/api/categoria-especifica-hogar?populate=*`
    : `${process.env.REACT_APP_STRAPI_URL}/api/categoria-especifica?populate=*`;

  // 1. Obtener configuración de Categoría Específica
  useEffect(() => {
    setConfig(null);
    setProductos([]);
    setLoading(true);
    fetch(endpoint)
      .then(res => res.json())
      .then(data => {
        if (data && data.data) {
          const attributes = data.data.attributes || data.data;
          setConfig(attributes);
        } else {
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Error fetching categoria-especifica config:', err);
        setLoading(false);
      });
  }, [endpoint]);

  // 2. Obtener productos de la categoría seleccionada
  useEffect(() => {
    if (!config) return;

    const cat = config.categoria?.data || config.categoria || config.Categoria?.data || config.Categoria;
    if (!cat) {
      setLoading(false);
      return;
    }

    const catDocId = cat.documentId || cat.id;
    if (!catDocId) {
      setLoading(false);
      return;
    }

    fetch(`${process.env.REACT_APP_STRAPI_URL}/api/productos?filters[categoria][documentId][$eq]=${catDocId}&populate=*`)
      .then(res => res.json())
      .then(data => {
        if (data && data.data) {
          setProductos(data.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching specific category products:', err);
        setLoading(false);
      });
  }, [config]);

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
    el.scrollLeft = scrollLeftVal.current - walk;
  }, []);

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

  if (loading || !config || productos.length === 0) {
    return null;
  }

  const titulo = config.titulo || config.Titulo || 'Categoría Específica';

  let iconUrl = null;
  const iconoObj = config.icono || config.Icono;
  if (iconoObj?.data?.attributes?.url) {
    iconUrl = `${process.env.REACT_APP_STRAPI_URL}${iconoObj.data.attributes.url}`;
  } else if (iconoObj?.url) {
    iconUrl = `${process.env.REACT_APP_STRAPI_URL}${iconoObj.url}`;
  }

  return (
    <SectionWrapper>
      <TitleWrapper>
        {iconUrl && <TitleIcon src={iconUrl} alt={titulo} />}
        <SectionTitle $seccion={seccion}>{titulo}</SectionTitle>
      </TitleWrapper>

      <ProductsGrid
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {productos.map(item => {
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
              <CardImageContainer>
                {descuento > 0 && stampVal && (
                  <StampOverlay src={`/ofertas/${stampVal}.png`} alt={`Hasta ${stampVal}% OFF`} />
                )}

                {imgUrl ? (
                  <img className="product-img" src={imgUrl} alt={nombre} />
                ) : (
                  <ImagePlaceholder />
                )}
                <HeartContainer>
                  <HeartIcon aria-label="Agregar a favoritos">
                    <HeartOutline />
                  </HeartIcon>
                </HeartContainer>
              </CardImageContainer>

              <ProductBrand>{marca}</ProductBrand>
              <ProductName title={nombre}>{nombre}</ProductName>

              <PriceRow>
                {offerPrice && <OldPrice>{formatPrice(price)}</OldPrice>}
                <CurrentPrice>{formatPrice(offerPrice || price)}</CurrentPrice>
                {descuento > 0 && <DiscountBadge>{descuento}% OFF</DiscountBadge>}
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
    </SectionWrapper>
  );
}
