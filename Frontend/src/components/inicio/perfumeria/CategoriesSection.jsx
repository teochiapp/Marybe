import React, { useRef, useCallback, useState, useEffect } from 'react';
import styled from 'styled-components';

const SectionWrapper = styled.section`
  padding: 40px 60px;
  
  @media (max-width: 1024px) {
    padding: 30px 40px;
  }
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const SectionTitle = styled.h2`
  font-family: var(--font-family-primary);
  font-size: 2.5rem;
  color: var(--color-bordo-secundario);
  margin-bottom: 30px;
  font-weight: 600;
  
  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 20px;
  }
`;

const CarouselContainer = styled.div`
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  gap: 20px;
  cursor: grab;
  padding-bottom: 20px;

  &:active {
    cursor: grabbing;
  }

  &::-webkit-scrollbar {
    display: none;
  }
`;

const CategoryCard = styled.div`
  position: relative;
  flex-shrink: 0;
  scroll-snap-align: start;
  user-select: none;
  -webkit-user-drag: none;
  border-radius: 20px;
  overflow: hidden;
  background-color: #f5f5f5;
  height: 250px;
  
  /* Desktop: 5.5 cards */
  width: calc((100% - (5 * 20px)) / 5.5);
  
  @media (max-width: 1440px) {
    width: calc((100% - (4 * 20px)) / 4.5);
  }

  @media (max-width: 1024px) {
    width: calc((100% - (3 * 20px)) / 3.5);
  }

  @media (max-width: 768px) {
    width: calc((100% - (2 * 20px)) / 2.5);
  }

  @media (max-width: 500px) {
    width: calc((100% - (1 * 20px)) / 1.5);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  
  &:hover img {
    transform: scale(1.05);
  }
`;

const CategoryLabel = styled.div`
  position: absolute;
  bottom: 15px;
  left: 15px;
  right: 15px;
  background-color: var(--color-bordo-secundario);
  color: white;
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.95rem;
  font-weight: 500;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  
  svg {
    width: 16px;
    height: 16px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  
  @media (max-width: 600px) {
    padding: 10px 12px;
    font-size: 0.85rem;
    bottom: 10px;
    left: 10px;
    right: 10px;
  }
`;

const ArrowRightIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

const ImagePlaceholder = () => (
  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eaeaea' }}>
    <svg viewBox="0 0 24 24" fill="#ccc" style={{ width: '50px', height: '50px' }}>
      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
    </svg>
  </div>
);

export default function CategoriesSection() {
  const [categorias, setCategorias] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_STRAPI_URL}/api/categorias?populate=*`)
      .then(res => res.json())
      .then(data => {
        if (data && data.data) {
          setCategorias(data.data);
        }
      })
      .catch(err => console.error('Error fetching categorias:', err));
  }, []);

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

  // Fallback dummy just to see the structure if strapi is empty during dev
  const dummyCategorias = [
    { id: 'd1', attributes: { nombre: 'Ofertas' } },
    { id: 'd2', attributes: { nombre: 'Electro Belleza' } },
    { id: 'd3', attributes: { nombre: 'Fragancias' } },
    { id: 'd4', attributes: { nombre: 'Maquillaje' } },
    { id: 'd5', attributes: { nombre: 'Dermocosmética' } },
    { id: 'd6', attributes: { nombre: 'Lanzamientos' } },
  ];

  const renderItems = categorias.length > 0 ? categorias : dummyCategorias;

  return (
    <SectionWrapper>
      <SectionTitle>Categorías</SectionTitle>
      
      <CarouselContainer
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {renderItems.map((item) => {
          const id = item.id || item.documentId || Math.random();
          const attrs = item.attributes || item;
          const nombre = attrs.nombre || 'Categoría';
          
          let imgUrl = null;
          if (attrs.portada?.data?.attributes?.url) {
            imgUrl = `${process.env.REACT_APP_STRAPI_URL}${attrs.portada.data.attributes.url}`;
          } else if (attrs.portada?.url) {
            imgUrl = `${process.env.REACT_APP_STRAPI_URL}${attrs.portada.url}`;
          }

          return (
            <CategoryCard key={id}>
              {imgUrl ? (
                <img src={imgUrl} alt={nombre} draggable="false" />
              ) : (
                <ImagePlaceholder />
              )}
              <CategoryLabel>
                {nombre}
                <ArrowRightIcon />
              </CategoryLabel>
            </CategoryCard>
          );
        })}
      </CarouselContainer>
    </SectionWrapper>
  );
}
