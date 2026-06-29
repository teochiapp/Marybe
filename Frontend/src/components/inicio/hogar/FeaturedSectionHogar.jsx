import React, { useRef, useCallback, useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { generateProductUrl } from '../../../utils/productUrl';
import AddToCartModal from '../../carrito/AddToCartModal';
import FavoriteButton from '../../shared/FavoriteButton';
import { staggerContainerVariants, staggerItemLeftVariants } from '../../animations/ScrollAnimations';

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

const HaloLuz = styled.img`
  position: absolute;
  top: 0;
  /* Centrado sobre la imagen de Hogar destacado (mitad derecha de la sección) */
  left: 71%;
  right: auto;
  transform: translateX(-50%);
  height: 100%;
  width: auto;
  z-index: 0;
  pointer-events: none;
  opacity: 0.8;

  @media (max-width: 768px) {
    height: 100%;
    width: 100%;
    object-fit: cover;
    left: 50%;
    transform: translateX(-50%);
    top: 0;
    opacity: 0.5;
  }
`;

const TopHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 20px;
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

const Title = styled.h2`
  font-family: var(--font-family-primary);
  font-size: clamp(3.5rem, 5vw, 6rem);
  line-height: 0.95;
  font-weight: 600;
  margin-bottom: 15px;
  letter-spacing: -0.02em;

  .italic-text {
    color: var(--color-blanco);
    font-style: italic;
    display: block;
  }

  .gold-text {
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

const Subtitle = styled.p`
  font-size: 1.35rem;
  color: #FAF9F7;
  max-width: 350px;
  line-height: 1.35;
  letter-spacing: -1%;
  
  @media (max-width: 768px) {
    margin: 4px auto 0;
    order: 3;
    max-width: 80vw;
  }
`;

const FeaturedPicture = styled.picture`
  width: 50%;
  max-height: 40vh;
  max-width: 100%;
  padding-right: 60px;
  display: flex;
  justify-content: center;
  
  @media (max-width: 768px) {
    width: 100%;
    max-height: none;
    order: 2;
    padding: 0 5px;
    margin-bottom: 8px;
  }

  img {
    width: 100%;
    height: 100%;
    max-height: 92vh;
    object-fit: contain;
    filter: drop-shadow(0 20px 30px rgba(0,0,0,0.5));
  }
`;

const ProductsGrid = styled(motion.div)`
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  gap: 30px;
  position: relative;
  z-index: 1;
  cursor: grab;
  margin-left: 60px;
  padding-right: 60px;
  padding-bottom: 10px;

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
    gap: 30px;
    margin-left: 60px;
    padding-right: 40px;
  }

  @media (max-width: 770px) {
    margin-left: 0px;
    padding-right: 0px;
  }

  @media (max-width: 600px) {
    gap: 20px;
    margin-left: 0px;
    padding-right: 0px;
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
  
  width: calc((100% - (5 * 30px)) / 5.5);
  
  @media (max-width: 1440px) {
    width: calc((100% - (4 * 30px)) / 4.5);
  }

  @media (max-width: 1024px) {
    width: calc((100% - (2 * 24px)) / 2.5);
  }

  @media (max-width: 600px) {
    width: calc((100% - (1 * 20px)) / 1.5);
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

const HeartContainer = styled.div`
  position: absolute;
  bottom: 15px;
  right: 15px;
  z-index: 2;
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
  background-color: #7C0405;
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

const formatPrice = (price) => {
  if (!price) return '$0';
  return '$' + Number(price).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

export default function FeaturedSectionHogar() {
  const [productos, setProductos] = useState([]);
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const isDragging = useRef(false);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddClick = (product, e) => {
    e.stopPropagation();
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetch(`${process.env.REACT_APP_STRAPI_URL}/api/productos?filters[destacado][$eq]=true&filters[seccion][$eq]=Hogar&populate=*`)
      .then(res => res.json())
      .then(data => {
        if (data && data.data) {
          setProductos(data.data);
        }
      })
      .catch(err => console.error('Error fetching productos destacados de hogar:', err));
  }, []);

  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftVal = useRef(0);

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

  const handleProductClick = (id, nombre) => {
    if (!isDragging.current) {
      navigate(generateProductUrl(id, nombre));
    }
  };

  return (
    <SectionWrapper>
      <HaloLuz src="/inicio/haloHogar.png" alt="Efecto de luz" />
      <TopHeader>
        <TextBlock>
          <Title>
            <span className="italic-text">Lo nuevo </span>
            <span className="gold-text">en Marybe</span>
          </Title>
          <Subtitle>
            Intensidad, seducción y carácter en un solo lugar.
          </Subtitle>
        </TextBlock>
        <FeaturedPicture>
          <img src="/inicio/featuredSectionHogar.webp" alt="Hogar destacado" />
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
          let offerPrice = mainVariant.precio_oferta || null;

          if (!offerPrice && descuento > 0 && price > 0) {
            offerPrice = price - (price * (descuento / 100));
          }

          let imgUrl = null;
          if (attrs.portada?.data?.attributes?.url) {
            imgUrl = `${process.env.REACT_APP_STRAPI_URL}${attrs.portada.data.attributes.url}`;
          } else if (attrs.portada?.url) {
            imgUrl = `${process.env.REACT_APP_STRAPI_URL}${attrs.portada.url}`;
          }

          return (
            <ProductCard key={id}>
              <CardImageContainer onClick={() => handleProductClick(id, nombre)}>
                {imgUrl ? (
                  <img src={imgUrl} alt={nombre} style={{ width: '100%', height: '100%', objectFit: 'contain' }} draggable="false" />
                ) : (
                  <ImagePlaceholder />
                )}
                <HeartContainer>
                  <FavoriteButton product={item} />
                </HeartContainer>
              </CardImageContainer>

              <ProductName onClick={() => handleProductClick(id, nombre)}>{nombre}</ProductName>
              <ProductBrand>{marca}</ProductBrand>

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

              <AddButton onClick={(e) => handleAddClick(item, e)}>
                Agregar <CartIcon />
              </AddButton>
            </ProductCard>
          );
        })}
      </ProductsGrid>
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
