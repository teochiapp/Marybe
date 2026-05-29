import React, { useRef, useEffect, useState, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import GradientText from '../GradientText';
import TeoProjectCard from './TeoProjectCard';

import TeoLogoBubbles from './TeoLogoBubbles';
import ErrorBoundary from '../ErrorBoundary';
import useScrollTrigger from '../../hooks/useScrollTrigger';

// Registrar ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Animaciones
const fadeIn = keyframes`
  0% { opacity: 0; transform: scale(0.9); }
  100% { opacity: 1; transform: scale(1); }
`;

function TeoPortfolio({ projects = [], title = "Mis Proyectos", subtitle = "Desarrollos personales que demuestran mi experiencia y pasión por la programación" }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState('right');
  const containerRef = useRef(null);
  const carouselRef = useRef(null);
  const { createScrollTrigger } = useScrollTrigger();

  useEffect(() => {
    // Solo crear ScrollTrigger en desktop, en móvil dejamos que Framer Motion maneje todo
    const isMobile = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
    
    if (isMobile) {
      // En móvil, asegurar que el contenedor sea visible
      if (containerRef.current) {
        gsap.set(containerRef.current, { opacity: 1, y: 0 });
      }
      return;
    }

    // Usar setTimeout para asegurar que el DOM esté completamente listo
    const timer = setTimeout(() => {
      // Crear animación solo si el elemento existe y no es móvil
      if (containerRef.current) {
        // Animación de entrada del contenedor
        createScrollTrigger({
          trigger: containerRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
          onToggle: self => {
            if (self.isActive && containerRef.current) {
              gsap.fromTo(containerRef.current,
                { opacity: 0, y: 50 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 1,
                  ease: "power2.out"
                }
              );
            }
          }
        }).then(trigger => {
          if (trigger) {
            console.log('ScrollTrigger created successfully');
          }
        }).catch(error => {
          console.error('Failed to create ScrollTrigger:', error);
        });
      }
    }, 100); // Dar tiempo al DOM para estabilizarse

    return () => {
      clearTimeout(timer);
    };
  }, [createScrollTrigger]);

  const nextProject = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection('right');
    setCurrentIndex((prev) => (prev + 1) % projects.length);
    setTimeout(() => setIsAnimating(false), 600);
  }, [isAnimating, projects.length]);

  const prevProject = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection('left');
    setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length);
    setTimeout(() => setIsAnimating(false), 600);
  }, [isAnimating, projects.length]);

  const goToProject = useCallback((index) => {
    if (isAnimating || index === currentIndex) return;
    setIsAnimating(true);
    setDirection(index > currentIndex ? 'right' : 'left');
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 600);
  }, [isAnimating, currentIndex]);

  // Auto-play con pausa en hover
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isAnimating) {
        nextProject();
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [isAnimating, nextProject]);

  const currentProject = {
    ...projects[currentIndex],
    index: currentIndex
  };

  return (
    <ErrorBoundary>
      <PortfolioContainer ref={containerRef} id="portfolio">
        <HeaderSection>
          <ErrorBoundary>
          <MainTitle>
            <GradientText
              colors={[
                "var(--secondary-color)", 
                "var(--primary-color)", 
                "var(--accent-color)", 
                "var(--secondary-color)", 
                "var(--text-color)", 
                "var(--primary-color)", 
              ]}
              animationSpeed={3}
              showBorder={false}
              className="custom-class"
            >
              {title}
            </GradientText>
            </MainTitle>
          </ErrorBoundary>
          <Subtitle>{subtitle}</Subtitle>
        </HeaderSection>

        <CarouselContainer>
          <CarouselWrapper ref={carouselRef}>
            <ErrorBoundary>
              <TeoProjectCard
                key={`project-${currentIndex}-${direction}`}
                project={currentProject}
                projects={projects}
                direction={direction}
                isAnimating={isAnimating}
                onPrev={prevProject}
                onNext={nextProject}
                onProjectClick={goToProject}
                currentIndex={currentIndex}
                totalProjects={projects.length}
              />
            </ErrorBoundary>
          </CarouselWrapper>
        </CarouselContainer>

        <ErrorBoundary>
          <TeoLogoBubbles projects={projects} onProjectClick={goToProject} />
        </ErrorBoundary>
      </PortfolioContainer>
    </ErrorBoundary>
  );
}

export default TeoPortfolio;

// Styled Components
const PortfolioContainer = styled.section`
  min-height: 100vh;
  padding: 4rem 2rem;
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);

  @media (max-width: 768px) {
    padding: 3rem 1rem;
  }
`;

const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: 4rem;
  animation: ${fadeIn} 1s ease-out;
`;

const MainTitle = styled.h3`
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin: 0 0 1.5rem 0;
  font-family: var(--heading-font);

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: var(--text-color);
  opacity: 0.8;
  margin: 0 auto;
  width: 100%;
  font-family: var(--text-font);

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const CarouselContainer = styled.div`
  position: relative;
  max-width: 1200px;
  margin: 0 auto 4rem auto;
  height: 600px;
  perspective: 1000px;

  @media (max-width: 768px) {
    height: 400px;
    margin-bottom: 3rem;
  }
`;

const CarouselWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
`;




