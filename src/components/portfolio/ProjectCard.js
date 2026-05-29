import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaExternalLinkAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';

const slideInFromRight = keyframes`
  0% { transform: translateX(100%) rotateY(-15deg); opacity: 0; }
  100% { transform: translateX(0) rotateY(0deg); opacity: 1; }
`;

const slideInFromLeft = keyframes`
  0% { transform: translateX(-100%) rotateY(15deg); opacity: 0; }
  100% { transform: translateX(0) rotateY(0deg); opacity: 1; }
`;

const ProjectCard = ({ project, direction, isAnimating, onPrev, onNext, currentIndex, totalProjects, onProjectClick }) => {
  const { t } = useLanguage();
  const [showHorizontal, setShowHorizontal] = useState(true);

  // Alternar animación cada 1 segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setShowHorizontal((prev) => !prev);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card $direction={direction} $isAnimating={isAnimating}>
      {/* Animación de lombriz */}
      {showHorizontal ? (
        <>
          <TopBorder />
          <BottomBorder />
        </>
      ) : (
        <>
          <LeftBorder />
          <RightBorder />
        </>
      )}

      <CardBackground>
        <BackgroundImage src={project.image} alt={project.title} />
        {project.icon && (
          <ProjectIcon src={project.icon} alt={`${project.title} icon`} />
        )}
        <Overlay />
      </CardBackground>

      <CardContent>
        <ProjectInfo>
          <ProjectTitle>{project.title}</ProjectTitle>
          <ProjectDescription>{project.description}</ProjectDescription>

          <TechStack>
            {project.techs && project.techs.map((tech, techIndex) => (
              <TechBadge key={techIndex}>
                {tech.icon}
                <span>{tech.name}</span>
              </TechBadge>
            ))}
          </TechStack>

          {project.url && (
            <VisitButton
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaExternalLinkAlt />
              {t('portfolio.visitProject', 'Visitar Proyecto')}
            </VisitButton>
          )}
        </ProjectInfo>
      </CardContent>

      {/* Puntos indicadores en la parte inferior */}
      <ProjectDots>
        {Array.from({ length: totalProjects }, (_, index) => (
          <Dot
            key={index}
            $isActive={index === currentIndex}
            onClick={() => onProjectClick(index)}
          />
        ))}
      </ProjectDots>

      {/* Controles de navegación en la parte inferior */}
      <NavButtonLeft onClick={onPrev} disabled={isAnimating}>
        <FaChevronLeft />
      </NavButtonLeft>

      <NavButtonRight onClick={onNext} disabled={isAnimating}>
        <FaChevronRight />
      </NavButtonRight>
    </Card>
  );
};

export default ProjectCard;

// Styled Components
const Card = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 25px;
  overflow: hidden;
  background: rgba(18, 26, 46, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(13, 211, 250, 0.2);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: ${props =>
    props.$direction === 'right' ? slideInFromRight : slideInFromLeft
  } 0.5s ease-out;
  animation-fill-mode: both;

  @media (max-width: 768px) {
    border-radius: 20px;
  }
`;

const CardBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
`;

const BackgroundImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.7) contrast(1.2);
`;

const ProjectIcon = styled.img`
  position: absolute;
  top: 2rem;
  right: 2rem;
  width: 60px;
  height: 60px;
  object-fit: contain;
  z-index: 3;
  filter: brightness(1.2) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
  
  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
    top: 1rem;
    right: 1rem;
  }
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(18, 26, 46, 0.8) 0%, rgba(18, 26, 46, 0.4) 100%);
`;

const CardContent = styled.div`
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 3rem;
  color: var(--primary-white);

  @media (max-width: 768px) {
    padding: 1rem;
  }

  /* Móviles muy pequeños: hasta 375px */
  @media (max-width: 375px) {
    padding: 0.8rem;
  }

  /* Móviles extra pequeños: hasta 325px */
  @media (max-width: 325px) {
    padding: 0.6rem;
  }
`;


const ProjectInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  max-width: 600px;
  width: 100%;
`;

const ProjectTitle = styled.h3`
  font-size: 2.5rem;
  font-family: var(--heading-font);
  color: var(--primary-cyan);
  margin-bottom: 1rem;
  font-weight: 700;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 1.8rem;
  }

  /* Móviles muy pequeños: hasta 375px */
  @media (max-width: 375px) {
    font-size: 1.5rem;
    margin-bottom: 0.8rem;
  }

  /* Móviles extra pequeños: hasta 325px */
  @media (max-width: 325px) {
    font-size: 1.3rem;
    margin-bottom: 0.6rem;
  }
`;

const ProjectDescription = styled.p`
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  opacity: 0.9;
  font-family: var(--text-font);
  text-align: center;

  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }

  /* Móviles muy pequeños: hasta 375px */
  @media (max-width: 375px) {
    font-size: 0.9rem;
    line-height: 1.5;
    margin-bottom: 1.2rem;
  }

  /* Móviles extra pequeños: hasta 325px */
  @media (max-width: 325px) {
    font-size: 0.8rem;
    line-height: 1.4;
    margin-bottom: 1rem;
  }
`;

const TechStack = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-bottom: 0.5rem;
  justify-content: center;
  align-items: center;

  /* Móviles muy pequeños: hasta 375px */
  @media (max-width: 375px) {
    gap: 0.6rem;
    margin-bottom: 0.4rem;
  }

  /* Móviles extra pequeños: hasta 325px */
  @media (max-width: 325px) {
    gap: 0.4rem;
    margin-bottom: 0.3rem;
  }
`;

const TechBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(13, 211, 250, 0.15);
  color: var(--primary-cyan);
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 600;
  border: 1px solid rgba(13, 211, 250, 0.3);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(13, 211, 250, 0.25);
    transform: translateY(-2px);
  }

  /* Móviles muy pequeños: hasta 375px */
  @media (max-width: 375px) {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
    gap: 0.4rem;
  }

  /* Móviles extra pequeños: hasta 325px */
  @media (max-width: 325px) {
    padding: 0.3rem 0.6rem;
    font-size: 0.7rem;
    gap: 0.3rem;
  }
`;

const VisitButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  background: linear-gradient(135deg, var(--primary-cyan), var(--accent-color));
  color: var(--primary-white);
  padding: 1.2rem 2.5rem;
  border-radius: 50px;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 700;
  font-family: var(--heading-font);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 
    0 8px 25px rgba(13, 211, 250, 0.3),
    0 0 0 1px rgba(13, 211, 250, 0.2);
  position: relative;
  overflow: hidden;
  letter-spacing: 0.5px;
  text-transform: uppercase;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
  }

  &:hover {
    transform: translateY(-4px) scale(1.02);
    color: var(--primary-white);
    box-shadow: 
      0 12px 35px rgba(13, 211, 250, 0.4),
      0 0 0 2px rgba(13, 211, 250, 0.3);
    background: linear-gradient(135deg, var(--accent-color), var(--primary-cyan));
  }

  &:hover::before {
    left: 100%;
  }

  &:active {
    transform: translateY(-2px) scale(0.98);
  }

  @media (max-width: 768px) {
    padding: 0.8rem 1rem;
    margin-top: 3px;
    font-size: 0.9rem;
    gap: 0.6rem;
  }

  /* Móviles muy pequeños: hasta 375px */
  @media (max-width: 375px) {
    padding: 0.6rem 0.8rem;
    font-size: 0.8rem;
    gap: 0.4rem;
  }

  /* Móviles extra pequeños: hasta 325px */
  @media (max-width: 325px) {
    padding: 0.5rem 0.6rem;
    font-size: 0.7rem;
    gap: 0.3rem;
  }
`;

// Controles de navegación
const NavButtonLeft = styled.button`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(13, 211, 250, 0.1);
  border: 2px solid rgba(13, 211, 250, 0.3);
  color: var(--primary-cyan);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  z-index: 10;

  &:hover:not(:disabled) {
    background: rgba(13, 211, 250, 0.2);
    transform: translateY(-50%) scale(1.1);
    box-shadow: 0 5px 15px rgba(13, 211, 250, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    font-size: 1rem;
    left: 1rem;
    bottom: 0.5rem;
    top: auto;
    transform: none;
    
    &:hover:not(:disabled) {
      transform: scale(1.1);
    }
  }

  /* Móviles muy pequeños: hasta 375px */
  @media (max-width: 375px) {
    width: 35px;
    height: 35px;
    font-size: 0.9rem;
    left: 0.8rem;
    bottom: 0.4rem;
  }

  /* Móviles extra pequeños: hasta 325px */
  @media (max-width: 325px) {
    width: 30px;
    height: 30px;
    font-size: 0.8rem;
    left: 0.6rem;
    bottom: 0.3rem;
  }
`;

const NavButtonRight = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(13, 211, 250, 0.1);
  border: 2px solid rgba(13, 211, 250, 0.3);
  color: var(--primary-cyan);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  z-index: 10;

  &:hover:not(:disabled) {
    background: rgba(13, 211, 250, 0.2);
    transform: translateY(-50%) scale(1.1);
    box-shadow: 0 5px 15px rgba(13, 211, 250, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    font-size: 1rem;
    right: 1rem;
    bottom: 0.5rem;
    top: auto;
    transform: none;
    
    &:hover:not(:disabled) {
      transform: scale(1.1);
    }
  }

  /* Móviles muy pequeños: hasta 375px */
  @media (max-width: 375px) {
    width: 35px;
    height: 35px;
    font-size: 0.9rem;
    right: 0.8rem;
    bottom: 0.4rem;
  }

  /* Móviles extra pequeños: hasta 325px */
  @media (max-width: 325px) {
    width: 30px;
    height: 30px;
    font-size: 0.8rem;
    right: 0.6rem;
    bottom: 0.3rem;
  }
`;

const ProjectDots = styled.div`
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.8rem;
  z-index: 10;

  @media (max-width: 768px) {
    bottom: 1rem;
    gap: 0.6rem;
  }

  /* Móviles muy pequeños: hasta 375px */
  @media (max-width: 375px) {
    bottom: 0.8rem;
    gap: 0.5rem;
  }

  /* Móviles extra pequeños: hasta 325px */
  @media (max-width: 325px) {
    bottom: 0.6rem;
    gap: 0.4rem;
  }
`;

const Dot = styled.button`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.$isActive ? 'var(--primary-cyan)' : 'rgba(13, 211, 250, 0.3)'};
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: var(--primary-cyan);
    transform: scale(1.2);
  }

  @media (max-width: 768px) {
    width: 10px;
    height: 10px;
  }

  /* Móviles muy pequeños: hasta 375px */
  @media (max-width: 375px) {
    width: 8px;
    height: 8px;
  }

  /* Móviles extra pequeños: hasta 325px */
  @media (max-width: 325px) {
    width: 6px;
    height: 6px;
  }
`;

// Animaciones de lombriz para los bordes
const topBorderAnimation = keyframes`
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
`;

const bottomBorderAnimation = keyframes`
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(-100%);
  }
`;

const leftBorderAnimation = keyframes`
  0% {
    transform: translateY(100%);
  }
  100% {
    transform: translateY(-100%);
  }
`;

const rightBorderAnimation = keyframes`
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(100%);
  }
`;

const TopBorder = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--primary-cyan), transparent);
  animation: ${topBorderAnimation} 1s linear infinite;
  z-index: 10;
`;

const BottomBorder = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--primary-cyan), transparent);
  animation: ${bottomBorderAnimation} 1s linear infinite;
  z-index: 10;
`;

const LeftBorder = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 2px;
  background: linear-gradient(180deg, transparent, var(--primary-cyan), transparent);
  animation: ${leftBorderAnimation} 1s linear infinite;
  z-index: 10;
`;

const RightBorder = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  width: 2px;
  background: linear-gradient(180deg, transparent, var(--primary-cyan), transparent);
  animation: ${rightBorderAnimation} 1s linear infinite;
  z-index: 10;
`; 