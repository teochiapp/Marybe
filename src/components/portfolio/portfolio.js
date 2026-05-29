import React, { useRef, useEffect, useState, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import GradientText from '../GradientText';
import ProjectCard from './ProjectCard';
import ProjectGrid from './ProjectGrid';
import LogoBubbles from './LogoBubbles';
import ErrorBoundary from '../ErrorBoundary';
import useScrollTrigger from '../../hooks/useScrollTrigger';
import cardsPortfolio, { getProjectsData } from '../../data/projectsData';
import { useLanguage } from '../../contexts/LanguageContext';

// Registrar ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Animaciones
const fadeIn = keyframes`
  0% { opacity: 0; transform: scale(0.9); }
  100% { opacity: 1; transform: scale(1); }
`;

function Portfolio({ projects, title, subtitle }) {
  const { t } = useLanguage();
  const translatedProjects = projects || getProjectsData(t);
  const portfolioTitle = title || t('portfolio.title', 'Nuestros Proyectos');
  const portfolioSubtitle = subtitle || t('portfolio.subtitle', 'Soluciones digitales que transforman ideas en experiencias únicas');
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
    setCurrentIndex((prev) => (prev + 1) % translatedProjects.length);
    setTimeout(() => setIsAnimating(false), 600);
  }, [isAnimating, translatedProjects.length]);

  const prevProject = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection('left');
    setCurrentIndex((prev) => (prev - 1 + translatedProjects.length) % translatedProjects.length);
    setTimeout(() => setIsAnimating(false), 600);
  }, [isAnimating, translatedProjects.length]);

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
    ...translatedProjects[currentIndex],
    index: currentIndex
  };

  // Touch swipe support
  const touchStart = useRef(null);
  const touchEnd = useRef(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    touchEnd.current = null;
    touchStart.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    const distance = touchStart.current - touchEnd.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextProject();
    } else if (isRightSwipe) {
      prevProject();
    }
  };

  return (
    <ErrorBoundary>
      <PortfolioContainer ref={containerRef} id="portfolio">
        <HeaderSection>
          <ErrorBoundary>
            <GradientText
              colors={["var(--text-color)", "var(--primary-color)", "var(--primary-cyan)", "var(--accent-color)", "var(--text-color)"]}
              animationSpeed={3}
              showBorder={false}
            >
              <MainTitle>{portfolioTitle}</MainTitle>
            </GradientText>
          </ErrorBoundary>
          <Subtitle>{portfolioSubtitle}</Subtitle>
        </HeaderSection>

        <CarouselContainer>
          <CarouselWrapper
            ref={carouselRef}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <ErrorBoundary>
              <ProjectCard
                key={`project-${currentIndex}-${direction}`}
                project={currentProject}
                direction={direction}
                isAnimating={isAnimating}
                onPrev={prevProject}
                onNext={nextProject}
                onProjectClick={goToProject}
                currentIndex={currentIndex}
                totalProjects={translatedProjects.length}
              />
            </ErrorBoundary>
          </CarouselWrapper>
        </CarouselContainer>

        {/* ProjectGrid oculto - ahora siempre usamos LogoBubbles */}
        <DesktopProjectGrid style={{ display: 'none' }}>
          <ErrorBoundary>
            <ProjectGrid
              projects={translatedProjects}
              currentIndex={currentIndex}
              onProjectClick={goToProject}
            />
          </ErrorBoundary>
        </DesktopProjectGrid>

        <ErrorBoundary>
          <LogoBubbles onProjectClick={goToProject} />
        </ErrorBoundary>
      </PortfolioContainer>
    </ErrorBoundary>
  );
}

export default Portfolio;

// Styled Components
const PortfolioContainer = styled.section`
  min-height: 100vh;
  padding: 4rem 2rem;
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 3rem 1rem;
  }

  /* Móviles muy pequeños: hasta 375px */
  @media (max-width: 375px) {
    padding: 2rem 0.8rem;
  }

  /* Móviles extra pequeños: hasta 325px */
  @media (max-width: 325px) {
    padding: 1.5rem 0.5rem;
  }
`;

const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: 4rem;
  animation: ${fadeIn} 1s ease-out;

  /* Móviles muy pequeños: hasta 375px */
  @media (max-width: 375px) {
    margin-bottom: 2.5rem;
  }

  /* Móviles extra pequeños: hasta 325px */
  @media (max-width: 325px) {
    margin-bottom: 2rem;
  }
`;

const MainTitle = styled.h2`
  font-size: 3.5rem;
  font-family: var(--heading-font);
  margin-bottom: 1rem;
  background: linear-gradient(135deg, var(--primary-cyan), var(--accent-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }

  /* Móviles muy pequeños: hasta 375px */
  @media (max-width: 375px) {
    font-size: 2rem;
    margin-bottom: 0.8rem;
  }

  /* Móviles extra pequeños: hasta 325px */
  @media (max-width: 325px) {
    font-size: 1.8rem;
    margin-bottom: 0.6rem;
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

  /* Móviles muy pequeños: hasta 375px */
  @media (max-width: 375px) {
    font-size: 0.9rem;
  }

  /* Móviles extra pequeños: hasta 325px */
  @media (max-width: 325px) {
    font-size: 0.8rem;
  }
`;

const CarouselContainer = styled.div`
  position: relative;
  max-width: 1200px;
  margin: 0 auto 4rem auto;
  height: 600px;
  perspective: 1000px;

  @media (max-width: 768px) {
    height: 450px;
    margin-bottom: 3rem;
  }

  /* Móviles muy pequeños: hasta 375px */
  @media (max-width: 375px) {
    height: 500px;
    margin-bottom: 2rem;
  }

  /* Móviles extra pequeños: hasta 325px */
  @media (max-width: 325px) {
    height: 550px;
    margin-bottom: 1.5rem;
  }
`;

const CarouselWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
`;

const DesktopProjectGrid = styled.div`
  @media (max-width: 768px) {
    display: none;
  }
`;