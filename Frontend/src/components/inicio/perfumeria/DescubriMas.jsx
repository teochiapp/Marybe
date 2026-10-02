import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

// ─── Styled Components ────────────────────────────────────────────────────────

const Section = styled.section`
  background-color: #FDFDFC;
  padding: 56px 64px;
  width: 100%;
  overflow: hidden;

  @media (max-width: 992px) { padding: 48px 24px; }
  @media (max-width: 600px)  { padding: 32px 16px; }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 32px;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
    margin-bottom: 24px;
  }
`;

const Title = styled.h2`
  font-family: var(--font-family-primary);
  font-style: italic;
  font-weight: 600;
  font-size: 50px;
  color: var(--color-marron-tercero);
  margin: 0;
  line-height: 1.1;

  @media (max-width: 992px) { font-size: 40px; }
  @media (max-width: 600px)  { font-size: 32px; }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;

  @media (max-width: 600px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const InstagramBtn = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background-color: var(--color-boton-promo);
  color: var(--color-blanco);
  font-family: var(--font-family-secondary);
  font-size: 16px;
  font-weight: 500;
  padding: 16px 28px;
  border-radius: 12px;
  text-decoration: none;
  cursor: pointer;
  transition: var(--transition-fast);

  &:hover { transform: translateY(-1px); opacity: 0.92; }

  @media (max-width: 600px) { align-self: stretch; justify-content: center; }
`;

const NavContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const NavButton = styled.button`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--color-blanco);
  border: 1px solid #EAEAEA;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition-fast);
  color: var(--color-marron-tercero);

  &:hover {
    background-color: var(--color-boton-promo);
    color: var(--color-blanco);
    border-color: var(--color-boton-promo);
  }
`;

/* ─── Carousel ───────────────────────────────────────────────────────────── */

const CarouselWrapper = styled.div`
  width: calc(100% + 64px);
  margin-right: -64px;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  margin-bottom: 24px;
  padding-bottom: 8px;
  scrollbar-width: none;
  cursor: grab;

  &::-webkit-scrollbar { display: none; }
  &:active { cursor: grabbing; }

  @media (max-width: 992px) { width: calc(100% + 24px); margin-right: -24px; }
  @media (max-width: 600px)  { width: calc(100% + 16px); margin-right: -16px; }
`;

const CarouselTrack = styled.div`
  display: flex;
  gap: 20px;
  padding: 4px 0;
  width: max-content;
`;

/* ─── Card ───────────────────────────────────────────────────────────────── */

const Card = styled.div`
  flex: 0 0 290px;
  position: relative;
  height: 460px;
  border-radius: 16px;
  overflow: hidden;
  scroll-snap-align: start;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;

  &:hover { transform: translateY(-4px); }

  &:hover .play-icon {
    transform: translate(-50%, -50%) scale(1.1);
    background-color: rgba(255, 255, 255, 0.25);
  }

  @media (max-width: 992px) { flex: 0 0 260px; height: 420px; }
  @media (max-width: 600px)  { flex: 0 0 220px; height: 360px; }
`;

const CardImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const CardOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0) 100%);
`;

const CardTitle = styled.h3`
  position: absolute;
  top: 16px;
  left: 16px;
  right: 16px;
  margin: 0;
  font-family: var(--font-family-secondary);
  font-size: 15px;
  font-weight: 600;
  color: var(--color-blanco);
  z-index: 2;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const PlayIcon = styled.a`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(4px);
  border: 2px solid var(--color-blanco);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease, background-color 0.3s ease;
  z-index: 2;
  cursor: pointer;
  text-decoration: none;

  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
`;

/* ─── Banner ─────────────────────────────────────────────────────────────── */

const Banner = styled.div`
  background-color: #280201;
  border-radius: 16px;
  padding: 24px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  width: 100%;

  @media (max-width: 600px) { flex-direction: column; align-items: flex-start; padding: 20px; }
`;

const BannerText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const BannerTitle = styled.h3`
  font-family: var(--font-family-secondary);
  font-size: 20px;
  font-weight: 700;
  color: var(--color-blanco);
  margin: 0;
`;

const BannerDesc = styled.p`
  font-family: var(--font-family-secondary);
  font-size: 14px;
  color: rgba(255, 255, 255, 0.75);
  margin: 0;
`;

const UnirmeBtn = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background-color: var(--color-blanco);
  color: var(--color-marron-tercero);
  font-family: var(--font-family-secondary);
  font-size: 16px;
  font-weight: 600;
  padding: 14px 28px;
  border-radius: 10px;
  text-decoration: none;
  cursor: pointer;
  white-space: nowrap;
  transition: var(--transition-fast);

  &:hover { transform: translateY(-1px); background-color: var(--color-blanco-pero-no-tan-blanco); }

  @media (max-width: 600px) { align-self: stretch; justify-content: center; }
`;

// ─── Íconos ───────────────────────────────────────────────────────────────────

const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
    <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
  </svg>
);

const PlayArrow = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 5V19L19 12L8 5Z" fill="white" />
  </svg>
);

const WhatsAppIconDark = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 2.91C16.0831 1.98 14.991 1.25 13.7875 0.75C12.584 0.25 11.2931 0 9.99 0C4.53 0 0.08 4.45 0.08 9.91C0.08 11.66 0.54 13.36 1.4 14.86L0 20L5.25 18.62C6.7 19.41 8.33 19.83 9.99 19.83C15.45 19.83 19.9 15.38 19.9 9.92C19.9 7.27 18.87 4.78 17 2.91ZM9.99 18.15C8.51 18.15 7.06 17.75 5.79 17L5.49 16.82L2.37 17.64L3.2 14.6L3 14.29C2.18 12.98 1.74 11.46 1.74 9.91C1.74 5.37 5.44 1.67 9.98 1.67C12.18 1.67 14.25 2.53 15.8 4.09C16.57 4.85 17.18 5.76 17.59 6.76C18 7.76 18.21 8.84 18.21 9.92C18.23 14.46 14.53 18.15 9.99 18.15ZM14.51 11.99C14.26 11.87 13.04 11.27 12.82 11.18C12.59 11.1 12.43 11.06 12.26 11.3C12.09 11.55 11.62 12.11 11.48 12.27C11.34 12.44 11.19 12.46 10.94 12.33C10.69 12.21 9.89 11.94 8.95 11.1C8.21 10.44 7.72 9.63 7.57 9.38C7.43 9.13 7.55 9 7.68 8.87C7.79 8.76 7.93 8.58 8.05 8.44C8.17 8.3 8.22 8.19 8.3 8.03C8.38 7.86 8.34 7.72 8.28 7.6C8.22 7.48 7.72 6.26 7.52 5.76C7.32 5.28 7.11 5.34 6.96 5.33H6.48C6.31 5.33 6.05 5.39 5.82 5.64C5.6 5.89 4.96 6.49 4.96 7.71C4.96 8.93 5.85 10.11 5.97 10.27C6.09 10.44 7.72 12.94 10.2 14.01C10.79 14.27 11.25 14.42 11.61 14.53C12.2 14.72 12.74 14.69 13.17 14.63C13.65 14.56 14.64 14.03 14.84 13.45C15.05 12.87 15.05 12.38 14.98 12.27C14.91 12.16 14.76 12.11 14.51 11.99Z" fill="currentColor" />
  </svg>
);

const ChevronLeft = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRight = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

// ─── Config API ───────────────────────────────────────────────────────────────
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:1337';
const CACHE_KEY   = 'marybe_ig_feed';
const CACHE_TTL   = 1000 * 60 * 60 * 24; // 24 horas

// ─── Componente ───────────────────────────────────────────────────────────────

export default function DescubriMas() {
  const [videos, setVideos]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const isFetching                  = useRef(false); // guard anti-doble llamada (React Strict Mode)

  // Drag to Scroll
  const [isDown, setIsDown]         = useState(false);
  const [startX, setStartX]         = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const carouselRef                 = useRef(null);

  useEffect(() => {
    const fetchInstagramFeed = async () => {
      // ── Guard: evita doble fetch en React Strict Mode (dev) ───────────────
      if (isFetching.current) return;
      isFetching.current = true;

      try {
        // ── 1. Revisar caché ───────────────────────────────────────────────
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data: cachedData, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp <= CACHE_TTL && cachedData.length > 0) {
            setVideos(cachedData);
            setLoading(false);
            return;
          }
        }

        // ── 2. Llamar a la API del Backend (Strapi proxy) ───────────────────
        const response = await fetch(`${BACKEND_URL}/api/instagram/feed`, {
          method: 'GET',
        });

        if (!response.ok) return; // falla silenciosa

        const postsFormateados = await response.json();
        if (!Array.isArray(postsFormateados) || postsFormateados.length === 0) return;

        // ── 3. Guardar en caché ────────────────────────────────────────────
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: postsFormateados,
          timestamp: Date.now(),
        }));

        setVideos(postsFormateados);
      } catch (_) {
        // Falla silenciosa — el carousel simplemente no aparece
      } finally {
        setLoading(false);
      }
    };

    fetchInstagramFeed();
  }, []);

  // ─── Grab to Scroll ──────────────────────────────────────────────────────────
  const handleMouseDown = (e) => {
    setIsDown(true);
    setIsDragging(false);
    if (carouselRef.current) {
      carouselRef.current.style.scrollSnapType = 'none';
      setStartX(e.pageX - carouselRef.current.offsetLeft);
      setScrollLeft(carouselRef.current.scrollLeft);
    }
  };
  const handleMouseLeave = () => {
    setIsDown(false);
    if (carouselRef.current) carouselRef.current.style.scrollSnapType = 'x mandatory';
  };
  const handleMouseUp = () => {
    setIsDown(false);
    if (carouselRef.current) carouselRef.current.style.scrollSnapType = 'x mandatory';
    setTimeout(() => setIsDragging(false), 50);
  };
  const handleMouseMove = (e) => {
    if (!isDown) return;
    e.preventDefault();
    if (carouselRef.current) {
      const x    = e.pageX - carouselRef.current.offsetLeft;
      const walk = (x - startX) * 2;
      if (Math.abs(walk) > 10) setIsDragging(true);
      carouselRef.current.scrollLeft = scrollLeft - walk;
    }
  };
  const scrollByAmount = (amount) => {
    if (carouselRef.current) carouselRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  return (
    <Section>
      <Header>
        <Title>Descubrí más</Title>
        <HeaderActions>
          <InstagramBtn
            href="https://www.instagram.com/perfumeriasmarybe/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Seguinos en Instagram
            <InstagramIcon />
          </InstagramBtn>

          <NavContainer>
            <NavButton onClick={() => scrollByAmount(-310)} aria-label="Anterior">
              <ChevronLeft />
            </NavButton>
            <NavButton onClick={() => scrollByAmount(310)} aria-label="Siguiente">
              <ChevronRight />
            </NavButton>
          </NavContainer>
        </HeaderActions>
      </Header>

      {/* Carousel: solo visible cuando hay posts en caché o API disponible */}
      {!loading && videos.length > 0 && (
        <CarouselWrapper
          ref={carouselRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          <CarouselTrack>
            {videos.map((v) => (
              <Card key={v.id}>
                <CardImg src={v.img} alt={v.titulo} />
                <CardOverlay />
                <CardTitle>{v.titulo}</CardTitle>
                <PlayIcon
                  href={v.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="play-icon"
                  onClick={(e) => { if (isDragging) e.preventDefault(); }}
                >
                  <PlayArrow />
                </PlayIcon>
              </Card>
            ))}
          </CarouselTrack>
        </CarouselWrapper>
      )}

      <Banner>
        <BannerText>
          <BannerTitle>Sumate a nuestro canal de WhatsApp!</BannerTitle>
          <BannerDesc>
            Te vas a enterar de todos los descuentos y los últimos lanzamientos antes que nadie.
          </BannerDesc>
        </BannerText>
        <UnirmeBtn href="#" target="_blank" rel="noopener noreferrer">
          Unirme
          <WhatsAppIconDark />
        </UnirmeBtn>
      </Banner>
    </Section>
  );
}
