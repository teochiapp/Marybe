import React from 'react';
import styled, { keyframes } from 'styled-components';

const TeoLogoBubbles = ({ onProjectClick, projects = [] }) => {
  // Usar los proyectos de Teo directamente
  const logos = projects.map((project, index) => ({
    src: project.logo,
    alt: project.title,
    projectIndex: index
  }));

  return (
    <BubblesContainer>
      {logos.map((logo, index) => (
        <Bubble 
          key={index} 
          $delay={index * 0.15}
          onClick={() => onProjectClick(logo.projectIndex)}
        >
          <LogoImage 
            src={logo.src} 
            alt={logo.alt} 
            $isJoycof={logo.alt.toLowerCase().includes('joycof')}
          />
        </Bubble>
      ))}
    </BubblesContainer>
  );
};

export default TeoLogoBubbles;

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

// Styled Components
const BubblesContainer = styled.div`
  /* Desktop: diseño principal para Teo */
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  max-width: 1000px;
  gap: 2rem;
  margin: 4rem auto 0;
  padding: 0 2rem;

  /* Tablet: reducir gap y tamaño */
  @media (max-width: 768px) {
    gap: 1.5rem;
    margin: 3rem auto 0;
    padding: 0 1rem;
  }

  /* Móvil: grid compacto */
  @media (max-width: 480px) {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    max-width: 300px;
  }
`;

const Bubble = styled.div`
  width: 120px;
  height: 120px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 3px solid var(--primary-cyan);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  box-shadow: 
    0 8px 20px rgba(13, 211, 250, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  animation: 
    ${fadeInScale} 0.6s ease-out ${props => props.$delay}s both,
    ${float} 3s ease-in-out infinite ${props => props.$delay + 1}s;
  transition: all 0.3s ease;
  cursor: pointer;
  
  /* Efectos hover para desktop */
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: translateY(-8px) scale(1.05);
      box-shadow: 
        0 16px 35px rgba(13, 211, 250, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.3);
      border-color: var(--accent-color);
    }
  }

  /* Tablet: tamaño medio */
  @media (max-width: 768px) {
    width: 100px;
    height: 100px;
    padding: 6px;
    border: 2px solid var(--primary-cyan);
  }

  /* Móvil: tamaño compacto */
  @media (max-width: 480px) {
    width: 80px;
    height: 80px;
    padding: 5px;
    border: 2px solid var(--primary-cyan);
  }

  /* Remover highlights en móvil */
  @media (max-width: 767px) {
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
`;

const LogoImage = styled.img`
  width: 100%;
  height: 100%;
  padding: 20px;
  object-fit: contain;
  object-position: center;
  border-radius: 50%;
  transition: all 0.3s ease;
  
  /* Ajuste especial para Joycof */
  ${props => props.$isJoycof && `
    filter: brightness(1.1) contrast(1.1);
  `}

  ${Bubble}:hover & {
    transform: scale(1.1);
    filter: brightness(1.2) contrast(1.1);
  }

    @media (max-width: 768px) {
    padding: 10px;
  }
`;
