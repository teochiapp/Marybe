import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const LogoBubbles = ({ onProjectClick }) => {
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const containerRef = useRef(null);

  const logos = [
    { src: '/portfolio/vinoLogo.png', alt: 'Vinotipia', projectIndex: 0 },
    { src: '/portfolio/marinochoa.png', alt: 'Marin Ochoa', projectIndex: 1 },
    { src: '/portfolio/inmove-logo.png', alt: 'Inmove', projectIndex: 2 },
    { src: '/portfolio/comber-logo.png', alt: 'Comber', projectIndex: 3 },
    { src: '/portfolio/tresnoches-logo.png', alt: 'Tres Noches', projectIndex: 4 },
    { src: '/portfolio/JoyLogo.png', alt: 'Joycof', projectIndex: 5 },
    { src: '/portfolio/NhLogo.png', alt: 'NH', projectIndex: 6 },
    { src: '/portfolio/LogoSADA.svg', alt: 'SADA', projectIndex: 7 },
    { src: '/portfolio/logounavidamejor.png', alt: 'Una Vida Mejor', projectIndex: 8 }
  ];

  const checkScrollPosition = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;

      // Mostrar flecha izquierda si hay scroll hacia la izquierda
      setShowLeftArrow(scrollLeft > 10);

      // Mostrar flecha derecha si hay scroll hacia la derecha
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scrollContainer = (direction) => {
    if (containerRef.current) {
      const scrollAmount = 200; // Adjustment for scroll amount
      const targetScroll = containerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      containerRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    checkScrollPosition();

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      window.addEventListener('resize', checkScrollPosition);

      return () => {
        container.removeEventListener('scroll', checkScrollPosition);
        window.removeEventListener('resize', checkScrollPosition);
      };
    }
  }, []);

  return (
    <ContainerWrapper>
      <ChevronLeft $show={showLeftArrow} onClick={() => scrollContainer('left')}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </ChevronLeft>

      <BubblesContainer ref={containerRef}>
        {logos.map((logo, index) => (
          <Bubble
            key={index}
            $delay={index * 0.2}
            onClick={() => onProjectClick(logo.projectIndex)}
          >
            <LogoImage
              src={logo.src}
              alt={logo.alt}
              $isSada={logo.alt === 'SADA'}
              $isJoycof={logo.alt.toLowerCase().includes('joycof')}
            />
          </Bubble>
        ))}
      </BubblesContainer>

      <ChevronRight $show={showRightArrow} onClick={() => scrollContainer('right')}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </ChevronRight>
    </ContainerWrapper>
  );
};

export default LogoBubbles;

// Animaciones
const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const fadeInScale = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
`;

// Styled Components
const ContainerWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 100%;
`;
const BubblesContainer = styled.div`
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  max-width: 100%;
  margin: 3rem auto 0;
  padding: 1.5rem 1rem 1rem;
  width: 100%;
  overflow-x: auto;
  overflow-y: visible;
  scroll-behavior: smooth;
  
  /* Ocultar scrollbar en mobile */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }

  /* Móvil pequeño: hasta 480px */
  @media (max-width: 480px) {
    gap: 0.8rem;
    margin-top: 2rem;
    padding: 1.2rem 0.5rem 1rem;
  }

  /* Móvil mediano: 481px - 600px */
  @media (min-width: 481px) and (max-width: 600px) {
    gap: 1rem;
    padding: 1.5rem 1rem 1rem;
  }

  /* Tablet: 601px - 768px */
  @media (min-width: 601px) and (max-width: 768px) {
    gap: 1.2rem;
    padding: 1.5rem 1rem 1rem;
  }

  /* Desktop: 769px - 991px */
  @media (min-width: 769px) and (max-width: 991px) {
    gap: 1.5rem;
    margin-top: 4rem;
    padding: 1.5rem 1rem 1rem;
  }

  /* A partir de 992px: permitir wrap */
  @media (min-width: 992px) {
    flex-wrap: wrap;
    gap: 2rem;
    margin-top: 4rem;
    max-width: 1200px;
    overflow-x: visible;
    overflow-y: visible;
    padding: 2rem 1rem 1rem;
  }

  /* Desktop grande: 1200px+ */
  @media (min-width: 1200px) {
    gap: 2.5rem;
    max-width: 100%;
    padding: 2rem 1rem 1rem;
  }
`;

const ChevronLeft = styled.div`
  position: absolute;
  left: 0;
  top: 50%;
  -webkit-transform: translateY(-50%);
  transform: translateY(-50%);
  z-index: 10;
  color: var(--primary-cyan);
  background: rgba(0, 0, 0, 0.5);
  /* Prefijos vendor para backdrop-filter */
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  border-radius: 0 8px 8px 0;
  padding: 0.5rem 0.3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: ${props => props.$show ? 'auto' : 'none'};
  cursor: pointer;
  opacity: ${props => props.$show ? 1 : 0};
  transition: opacity 0.3s ease;
  -webkit-animation: ${pulse} 2s ease-in-out infinite;
  animation: ${pulse} 2s ease-in-out infinite;
  
  svg {
    display: block;
  }

  /* Ocultar en desktop donde no hay scroll horizontal */
  @media (min-width: 992px) {
    display: none;
  }
`;

const ChevronRight = styled.div`
  position: absolute;
  right: 0;
  top: 50%;
  -webkit-transform: translateY(-50%);
  transform: translateY(-50%);
  z-index: 10;
  color: var(--primary-cyan);
  background: rgba(0, 0, 0, 0.5);
  /* Prefijos vendor para backdrop-filter */
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  border-radius: 8px 0 0 8px;
  padding: 0.5rem 0.3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: ${props => props.$show ? 'auto' : 'none'};
  cursor: pointer;
  opacity: ${props => props.$show ? 1 : 0};
  transition: opacity 0.3s ease;
  -webkit-animation: ${pulse} 2s ease-in-out infinite;
  animation: ${pulse} 2s ease-in-out infinite;
  
  svg {
    display: block;
  }

  /* Ocultar en desktop donde no hay scroll horizontal */
  @media (min-width: 992px) {
    display: none;
  }
`;

const Bubble = styled.div`
  width: 80px;
  height: 80px;
  padding: 4px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid var(--primary-cyan);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Prefijos vendor para backdrop-filter */
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  box-shadow: 
    0 8px 20px rgba(13, 211, 250, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  animation: 
    ${fadeInScale} 0.6s ease-out ${props => props.$delay}s both,
    ${float} 3s ease-in-out infinite ${props => props.$delay + 1}s;
  transition: all 0.3s ease;
  cursor: pointer;
  flex-shrink: 0;

  /* Móvil pequeño: hasta 480px */
  @media (max-width: 480px) {
    width: 70px;
    height: 70px;
    padding: 3px;
  }

  /* Móvil mediano: 481px - 600px */
  @media (min-width: 481px) and (max-width: 600px) {
    width: 85px;
    height: 85px;
    padding: 4px;
  }

  /* Tablet: 601px - 768px */
  @media (min-width: 601px) and (max-width: 768px) {
    width: 95px;
    height: 95px;
    padding: 5px;
  }

  /* Desktop: 769px+ */
  @media (min-width: 769px) {
    width: 110px;
    height: 110px;
    padding: 6px;
  }

  /* Desktop grande: 1200px+ */
  @media (min-width: 1200px) {
    width: 120px;
    height: 120px;
    padding: 8px;
  }
  
  /* Solo aplicar hover en dispositivos no táctiles */
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: translateY(-8px);
      box-shadow: 
        0 16px 35px rgba(13, 211, 250, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.3);
      border-color: var(--accent-color);
    }
  }



  /* Remover cualquier estado de selección en móvil */
  @media (max-width: 767px) {
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    
    &:focus {
      outline: none;
    }
    
    &:active {
      transform: translateY(2px);
      transition: transform 0.1s ease;
      box-shadow: 
        0 4px 15px rgba(13, 211, 250, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
    }
  }

  &:nth-child(2) {
    animation-delay: 0.2s;
  }
  
  &:nth-child(3) {
    animation-delay: 0.4s;
  }
  
  &:nth-child(4) {
    animation-delay: 0.6s;
  }
  
  &:nth-child(5) {
    animation-delay: 0.8s;
  }
  
  &:nth-child(6) {
    animation-delay: 1s;
  }
`;

const LogoImage = styled.img`
  width: ${props => props.$isSada ? '85%' : '70%'};
  height: ${props => props.$isSada ? '85%' : '70%'};
  object-fit: contain;
  filter: brightness(1.1);
  transition: filter 0.3s ease;
  max-width: 100%;
  max-height: 100%;

  /* Móvil pequeño: hasta 480px */
  @media (max-width: 480px) {
    width: ${props => props.$isSada ? '80%' : '65%'};
    height: ${props => props.$isSada ? '80%' : '65%'};
  }

  /* Móvil mediano: 481px - 600px */
  @media (min-width: 481px) and (max-width: 600px) {
    width: ${props => props.$isSada ? '82%' : '68%'};
    height: ${props => props.$isSada ? '82%' : '68%'};
  }

  /* Tablet: 601px - 768px */
  @media (min-width: 601px) and (max-width: 768px) {
    width: ${props => props.$isSada ? '85%' : '70%'};
    height: ${props => props.$isSada ? '85%' : '70%'};
  }

  /* Desktop: 769px+ */
  @media (min-width: 769px) {
    width: ${props => props.$isSada ? '88%' : '75%'};
    height: ${props => props.$isSada ? '88%' : '75%'};
  }

  /* Desktop grande: 1200px+ */
  @media (min-width: 1200px) {
    width: ${props => props.$isSada ? '90%' : '78%'};
    height: ${props => props.$isSada ? '90%' : '78%'};
  }

  /* Solo aplicar hover en dispositivos no táctiles */
  @media (hover: hover) and (pointer: fine) {
    ${Bubble}:hover & {
      filter: brightness(1.3);
    }
  }

  /* Filtro blanco para Joycof en todas las pantallas */
  filter: ${props => props.$isJoycof
    ? 'brightness(1.1) invert(1) brightness(2)'
    : 'brightness(1.1)'
  };
  
  /* Hover effects para Joycof */
  ${Bubble}:hover & {
    filter: ${props => props.$isJoycof
    ? 'brightness(1.3) invert(1) brightness(2)'
    : 'brightness(1.3)'
  };
  }
  
  /* Efecto de tap/active para Joycof */
  ${Bubble}:active & {
    filter: ${props => props.$isJoycof
    ? 'brightness(1.2) invert(1) brightness(2)'
    : 'brightness(1.2)'
  };
    transition: filter 0.1s ease;
  }
`; 