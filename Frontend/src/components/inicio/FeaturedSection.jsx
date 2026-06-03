import React, { useRef, useCallback } from 'react';
import styled from 'styled-components';

const SectionWrapper = styled.section`
  background-color: var(--color-marron-tercero);
  border-radius: var(--radius-xl);
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  gap: 0px;
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 30px 20px;
    gap: 30px;
  }
`;

const HaloLuz = styled.img`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 1000px;
  z-index: 0;
  pointer-events: none;
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
  font-size: clamp(3.5rem, 5vw, 6.5rem);
  line-height: 0.9;
  font-weight: 600;
  margin-bottom: 20px;
  letter-spacing: -2%;

  .italic-text {
    color: var(--color-blanco);
    font-style: italic;
    display: block;
  }

  .gold-text {
    color: var(--color-titulo-marybe);
    font-weight: 400;
    display: block;
  }
  
  @media (max-width: 768px) {
    font-size: 2.8rem;
    order: 1;
  }
`;

const Subtitle = styled.p`
  font-size: 1.3rem;
  color: var(--color-fondo-beneficio-tarjeta);
  max-width: 25vw;
  line-height: 1.3;
  letter-spacing: -1%;
  
  @media (max-width: 768px) {
    margin: 0 auto;
    order: 3;
    max-width: 80vw;
  }
`;

const FeaturedPicture = styled.picture`
  width: 50%;
  max-height: 60vh;
  max-width: 100%;
  padding-right: 60px;
  display: flex;
  justify-content: center;
  
  @media (max-width: 768px) {
    width: 100%;
    order: 2;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: drop-shadow(0 20px 30px rgba(0,0,0,0.5));
  }
`;

const ProductsGrid = styled.div`
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
  padding-bottom: 40px;

  &:active {
    cursor: grabbing;
  }

  &::-webkit-scrollbar {
    display: none;
  }

  @media (min-width: 1250px) and (max-width: 1524px) {
    margin-top: -5vh;
  }
`;

const ProductCard = styled.div`
  background-color: var(--color-blanco);
  border-radius: var(--radius-lg);
  max-width: 20vw;
  border-radius: 24px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: transform 0.3s ease;
  flex-shrink: 0;
  scroll-snap-align: start;
  user-select: none;
  -webkit-user-drag: none;
  
  width: 23%;
  min-width: 260px;
  
  @media (max-width: 1024px) {
    width: 40%;
  }

  @media (max-width: 600px) {
    width: 75%;
  }
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const CardImageContainer = styled.div`
  width: 100%;
  height: 220px;
  background-color: #fff;
  border-radius: var(--radius-md);
  margin-bottom: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  
  svg {
    width: 60px;
    height: 60px;
    opacity: 0.1;
  }
`;

const HeartIcon = styled.button`
  position: absolute;
  top: 25px;
  right: 25px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-bordo-secundario);
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 22px;
    height: 22px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
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
`;

const ProductName = styled.h3`
  font-size: 16px;
  color: black;
  font-family: var(--font-family-secondary);
  font-weight: 400;
  margin-bottom: 4px;
  line-height: 1.2;
  letter-spacing: 0%;
`;

const PriceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
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
`;

const LegalText = styled.div`
  font-size: 0.7rem;
  color: #b0b0b0;
  margin-bottom: 20px;
  font-weight: 400;
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

  &:hover {
    background-color: var(--color-marron-principal);
  }
  
  svg {
    width: 20px;
    height: 20px;
    fill: none;
    stroke: currentColor;
  }
`;

const BannersRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  position: relative;
  z-index: 1;
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const BottomBanner = styled.div`
  background-color: var(--color-marron-principal);
  background: linear-gradient(180deg, var(--color-marron-cuarto) 0%, var(--color-marron-principal) 100%);
  border-radius: var(--radius-xl);
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  overflow: hidden;
  min-height: 280px;
  justify-content: flex-start;
  box-shadow: inset 0 0 50px rgba(0,0,0,0.5);
`;

const BannerTitle = styled.h3`
  font-family: var(--font-family-primary);
  font-size: 2.2rem;
  color: var(--color-blanco);
  font-style: italic;
  font-weight: 500;
  margin-bottom: auto;
  z-index: 2;
  
  @media (max-width: 1024px) {
    font-size: 1.8rem;
  }
`;

const BannerButton = styled.button`
  background-color: var(--color-blanco);
  color: var(--color-marron-secundario);
  border: none;
  padding: 12px 28px;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.95rem;
  z-index: 2;
  transition: transform 0.2s, background-color 0.2s;
  margin-top: 20px;
  
  &:hover {
    transform: translateY(-2px);
    background-color: var(--color-blanco-pero-no-tan-blanco);
  }
`;

const BannerPlaceholderImage = styled.div`
  width: 100%;
  height: 180px;
  position: absolute;
  bottom: -20px;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  opacity: 0.3;
  z-index: 1;
  
  svg {
    width: 150px;
    height: 150px;
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

export default function FeaturedSection() {
    const dummyProducts = [1, 2, 3, 4, 5];
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

    return (
        <SectionWrapper>
            <HaloLuz src="/inicio/halo-luz.png" alt="Efecto de luz" />
            <TopHeader>
                <TextBlock>
                    <Title>
                        <span className="italic-text">Lo nuevo</span>
                        <span className="gold-text">en Marybe</span>
                    </Title>
                    <Subtitle>
                        Intensidad, seducción y carácter <br />en un solo lugar.
                    </Subtitle>
                </TextBlock>
                <FeaturedPicture>
                    <source media="(max-width: 768px)" srcSet="/inicio/fragancias-mobile.png" />
                    <img src="/inicio/featured.img" alt="Fragancias destacadas" />
                </FeaturedPicture>
            </TopHeader>

            <ProductsGrid
                ref={scrollRef}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
            >
                {dummyProducts.map((item) => (
                    <ProductCard key={item}>
                        <CardImageContainer>
                            <ImagePlaceholder />
                        </CardImageContainer>
                        <HeartIcon aria-label="Agregar a favoritos">
                            <HeartOutline />
                        </HeartIcon>

                        <ProductName>WANTED FOREVER ABSOLU</ProductName>
                        <ProductBrand>AZZARO</ProductBrand>

                        <PriceRow>
                            <OldPrice>$194.600</OldPrice>
                            <CurrentPrice>$116.760</CurrentPrice>
                            <DiscountBadge>10%</DiscountBadge>
                        </PriceRow>

                        <Installments>3 cuotas sin interés de $4.333</Installments>
                        <LegalText>Precio sin impuestos nacionales $200.000</LegalText>

                        <AddButton>
                            Agregar <CartIcon />
                        </AddButton>
                    </ProductCard>
                ))}
            </ProductsGrid>

            <BannersRow>
                <BottomBanner>
                    <BannerTitle>El poder del elixir</BannerTitle>
                    <BannerPlaceholderImage>
                        <ImagePlaceholder />
                    </BannerPlaceholderImage>
                    <BannerButton>Conocer más</BannerButton>
                </BottomBanner>

                <BottomBanner>
                    <BannerTitle>Toda la línea de Azzaro</BannerTitle>
                    <BannerPlaceholderImage>
                        <ImagePlaceholder />
                    </BannerPlaceholderImage>
                    <BannerButton>Conocer más</BannerButton>
                </BottomBanner>
            </BannersRow>
        </SectionWrapper>
    );
}
