import React from 'react';
import styled from 'styled-components';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const NavigationControls = ({ 
  onPrev, 
  onNext, 
  onProjectClick, 
  currentIndex, 
  totalProjects, 
  isAnimating 
}) => {
  return (
    <ControlsContainer>
      <NavButton onClick={onPrev} disabled={isAnimating}>
        <FaChevronLeft />
      </NavButton>
      
      <ProjectDots>
        {Array.from({ length: totalProjects }, (_, index) => (
          <Dot
            key={index}
            $isActive={index === currentIndex}
            onClick={() => onProjectClick(index)}
          />
        ))}
      </ProjectDots>
      
      <NavButton onClick={onNext} disabled={isAnimating}>
        <FaChevronRight />
      </NavButton>
    </ControlsContainer>
  );
};

export default NavigationControls;

// Styled Components
const ControlsContainer = styled.div`
  position: absolute;
  margin: 1rem 0;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 2rem;
  z-index: 10;

  @media (max-width: 768px) {
    bottom: -2rem;
    gap: 1rem;
  }
`;

const NavButton = styled.button`
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

  &:hover:not(:disabled) {
    background: rgba(13, 211, 250, 0.2);
    transform: scale(1.1);
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
  }
`;

const ProjectDots = styled.div`
  display: flex;
  gap: 0.8rem;
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