import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaExternalLinkAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const slideInFromRight = keyframes`
  0% { transform: translateX(100%) rotateY(-15deg); opacity: 0; }
  100% { transform: translateX(0) rotateY(0deg); opacity: 1; }
`;

const slideInFromLeft = keyframes`
  0% { transform: translateX(-100%) rotateY(15deg); opacity: 0; }
  100% { transform: translateX(0) rotateY(0deg); opacity: 1; }
`;

const TeoProjectCard = ({ project, direction, isAnimating, onPrev, onNext, currentIndex, totalProjects, onProjectClick, projects = [] }) => {
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
              Visitar Proyecto
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

export default TeoProjectCard;

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
`;

const ProjectDescription = styled.p`
  font-size: 1.1rem;
  line-height: 1.6;
  color: var(--primary-white);
  margin-bottom: 2rem;
  opacity: 0.9;
  text-align: center;
  max-width: 500px;

  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }
`;

const TechStack = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
  max-width: 400px;

  @media (max-width: 768px) {
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }
`;

const TechBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(13, 211, 250, 0.15);
  border: 1px solid rgba(13, 211, 250, 0.3);
  border-radius: 25px;
  color: var(--primary-cyan);
  font-size: 0.9rem;
  font-weight: 500;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(13, 211, 250, 0.25);
    transform: translateY(-2px);
  }

  svg {
    font-size: 1rem;
  }

  @media (max-width: 768px) {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
    
    svg {
      font-size: 0.9rem;
    }
  }
`;

const VisitButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 2rem;
  background: linear-gradient(135deg, var(--primary-cyan), var(--accent-color));
  color: var(--background-color);
  text-decoration: none;
  border-radius: 30px;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(13, 211, 250, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(13, 211, 250, 0.4);
    background: linear-gradient(135deg, var(--accent-color), var(--primary-cyan));
  }

  @media (max-width: 768px) {
    padding: 0.7rem 1.5rem;
    font-size: 0.9rem;
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
`;

const NavButtonLeft = styled.button`
  position: absolute;
  left: 2rem;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid rgba(13, 211, 250, 0.5);
  background: rgba(18, 26, 46, 0.8);
  color: var(--primary-cyan);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  z-index: 10;

  &:hover:not(:disabled) {
    background: rgba(13, 211, 250, 0.2);
    border-color: var(--primary-cyan);
    transform: translateY(-50%) scale(1.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    left: 1rem;
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
`;

const NavButtonRight = styled.button`
  position: absolute;
  right: 2rem;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid rgba(13, 211, 250, 0.5);
  background: rgba(18, 26, 46, 0.8);
  color: var(--primary-cyan);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  z-index: 10;

  &:hover:not(:disabled) {
    background: rgba(13, 211, 250, 0.2);
    border-color: var(--primary-cyan);
    transform: translateY(-50%) scale(1.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    right: 1rem;
    width: 40px;
    height: 40px;
    font-size: 1rem;
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
