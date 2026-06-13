import React, { useRef, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const SectionWrapper = styled.section`
  padding: 40px 60px;
  background-color: var(--color-blanco);
  display: flex;
  flex-direction: column;
  gap: 30px;
  align-items: flex-start;

  @media (max-width: 1024px) {
    padding: 30px 40px;
  }

  @media (max-width: 768px) {
    padding: 20px;
    gap: 20px;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
`;

const SectionTitle = styled.h2`
  font-family: var(--font-family-secondary);
  font-size: 2.5rem;
  color: ${({ $seccion }) => ($seccion === 'hogar' ? 'var(--color-hogar)' : 'var(--color-bordo-secundario)')};
  font-weight: 600;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1.4rem;
  }

    @media (max-width: 400px) {
    font-size: 1.2rem;
  }
`;

const BadgesContainer = styled.div`
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  gap: 25px;
  align-items: center;
  position: relative;
  z-index: 1;
  cursor: grab;
  width: 100%;
  padding-bottom: 15px;

  &:active {
    cursor: grabbing;
  }

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 768px) {
    gap: 15px;
    padding-bottom: 10px;
  }
`;

const BadgeButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: transform 0.2s ease, filter 0.2s ease;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  outline: none;
  flex-shrink: 0;
  scroll-snap-align: start;
  user-select: none;
  -webkit-user-drag: none;

  width: 150px;
  height: 150px;

  @media (max-width: 768px) {
    width: 65px;
    height: 65px;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    transition: filter 0.2s ease;
    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.15)) grayscale(10%);
    pointer-events: none;
  }

  &:hover {
    transform: scale(1.08);
    img {
      filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.22)) grayscale(0%);
    }
  }
`;

export default function OfertasSection({ seccion }) {
  const navigate = useNavigate();
  const discountValores = [50, 40, 35, 30, 20];
  const scrollRef = useRef(null);

  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftVal = useRef(0);
  const hasDragged = useRef(false);

  const handleMouseDown = useCallback((e) => {
    const el = scrollRef.current;
    if (!el) return;
    isDown.current = true;
    hasDragged.current = false;
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
      hasDragged.current = true;
    }
    el.scrollLeft = scrollLeftVal.current - walk;
  }, []);

  const handleSelectFilter = (val) => {
    if (hasDragged.current) return;
    navigate(`/tienda?descuento=${val}`);
  };

  return (
    <SectionWrapper>
      <SectionHeader>
        <SectionTitle $seccion={seccion}>Disfrutá de las mejores ofertas</SectionTitle>
        <BadgesContainer
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          {discountValores.map(val => (
            <BadgeButton
              key={val}
              onClick={() => handleSelectFilter(val)}
              aria-label={`Filtrar ofertas hasta ${val}%`}
            >
              <img src={`/ofertas/${val}.png`} alt={`Hasta ${val}%`} />
            </BadgeButton>
          ))}
        </BadgesContainer>
      </SectionHeader>
    </SectionWrapper>
  );
}

