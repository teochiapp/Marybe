import React, { useRef, useCallback, useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { staggerContainerVariants, staggerItemFadeVariants } from '../../animations/ScrollAnimations';
import { useNavigate } from 'react-router-dom';

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
  font-family: var(--font-family-secondary);
  font-size: 2.5rem;
  color: var(--color-bordo-secundario);
  margin-bottom: 30px;
  font-weight: 600;
  
  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 20px;
  }
`;

const CarouselContainer = styled(motion.div)`
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

  @media (max-width: 768px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    overflow: visible;
    padding-bottom: 10px;
  }
`;

const CategoryCard = styled(motion.div)`
  position: relative;
  flex-shrink: 0;
  scroll-snap-align: start;
  user-select: none;
  -webkit-user-drag: none;
  border-radius: 20px;
  overflow: hidden;
  background-color: #f5f5f5;
  height: 250px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s ease;
  cursor: pointer;

  /* Desktop: 5.5 tarjetas por defecto, 4.5 en modo compact (con sidebar) */
  width: ${({ $compact }) =>
    $compact
      ? 'calc((100% - (4 * 20px)) / 4.5)'
      : 'calc((100% - (5 * 20px)) / 5.5)'};

  @media (max-width: 1024px) {
    /* Tablet: 3.5 tarjetas */
    width: calc((100% - (3 * 20px)) / 3.5);
    height: 220px;
  }

  @media (max-width: 768px) {
    width: 100%;
    height: 200px;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  
  &:hover {
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
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
  border-radius: 255px;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  
  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
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

const LabelText = styled.span`
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

const ViewMoreContainer = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 15px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    color: black;
    gap: 8px;
    
    svg {
      width: 20px;
      height: 20px;
      transition: transform 0.3s ease;
      transform: ${({ $isOpen }) => ($isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
    }
  }
`;

const ChevronIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

export default function CategoriesSection({ seccion = 'perfumeria', compact = false }) {
  const [categorias, setCategorias] = useState([]);
  const [showAllMobile, setShowAllMobile] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const isDragging = useRef(false);

  const seccionName = seccion === 'hogar' ? 'Hogar' : 'Perfumería';

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_STRAPI_URL}/api/categorias?filters[seccion][$eq]=${seccionName}&populate=*`)
      .then(res => res.json())
      .then(data => {
        if (data && data.data) {
          setCategorias(data.data);
        }
      })
      .catch(err => console.error('Error fetching categorias:', err));
  }, [seccionName]);

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

  const handleCategoryClick = (nombre) => {
    if (!isDragging.current) {
      navigate(`/tienda?categoria=${encodeURIComponent(nombre)}&seccion=${encodeURIComponent(seccionName)}`);
    }
  };

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
  const itemsToShow = (isMobile && !showAllMobile) ? renderItems.slice(0, 4) : renderItems;

  return (
    <SectionWrapper>
      <SectionTitle>Categorías</SectionTitle>

      <CarouselContainer
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        variants={staggerContainerVariants}
        initial="hidden"
        animate={renderItems.length > 0 ? 'show' : 'hidden'}
      >
        {itemsToShow.map((item) => {
          const id = item.id || item.documentId || Math.random();
          const attrs = item.attributes || item;
          const nombre = attrs.nombre || 'Categoría';

          let imgUrl = null;
          const getFullUrl = (url) => url?.startsWith('http') ? url : `${process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337'}${url}`;
          if (attrs.portada?.data?.attributes?.url) {
            imgUrl = getFullUrl(attrs.portada.data.attributes.url);
          } else if (attrs.portada?.url) {
            imgUrl = getFullUrl(attrs.portada.url);
          }

          return (
            <CategoryCard 
              key={id} 
              $compact={compact}
              onClick={() => handleCategoryClick(nombre)}
              variants={staggerItemFadeVariants}
            >
              {imgUrl ? (
                <img src={imgUrl} alt={nombre} draggable="false" />
              ) : (
                <ImagePlaceholder />
              )}
              <CategoryLabel>
                <LabelText>{nombre}</LabelText>
                <ArrowRightIcon />
              </CategoryLabel>
            </CategoryCard>
          );
        })}
      </CarouselContainer>
      
      {isMobile && renderItems.length > 0 && (
        <ViewMoreContainer 
          $isOpen={showAllMobile} 
          onClick={() => setShowAllMobile(!showAllMobile)}
        >
          {showAllMobile ? 'Ver menos' : 'Ver más categorías'}
          <ChevronIcon />
        </ViewMoreContainer>
      )}
    </SectionWrapper>
  );
}
