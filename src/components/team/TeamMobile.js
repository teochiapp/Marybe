import '../../index.css';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import GradientText from '../GradientText';
import ImageComplete from './mobile/ImageComplete';
import PersonSelector from './mobile/PersonSelector';
import FullInformation from './mobile/FullInformation';
import { useLanguage } from '../../contexts/LanguageContext';

import {
  getTeamData,
  gradientColors,
  animationConfig,
  getTotalPeople
} from '../../data/teamData';

const Team = () => {
  const { t } = useLanguage();
  const teamData = getTeamData(t);
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalPeople = getTotalPeople();
  const timerRef = useRef();

  // Función para iniciar el autoplay con un delay custom
  const startAutoplay = useCallback((delay = 15000) => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrentIndex(idx => (idx + 1) % totalPeople);
    }, delay);
  }, [totalPeople]);

  // Autoplay inicial
  useEffect(() => {
    startAutoplay();
    return () => clearInterval(timerRef.current);
  }, [totalPeople, startAutoplay]);

  // Cuando se selecciona una card, mostrar esa persona y resetear timer a 15s
  const handleSelect = idx => {
    setCurrentIndex(idx);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrentIndex(current => (current + 1) % totalPeople);
    }, 25000);
  };

  return (
    <TeamContainer>
      <SectionTitle>
        <GradientText
          colors={gradientColors}
          animationSpeed={animationConfig.speed}
          showBorder={animationConfig.showBorder}
        >
          {t('team.title', 'Quienes Somos')}
        </GradientText>
      </SectionTitle>

      <SectionSubtitle>{t('team.subtitle', 'Conoce al equipo detrás de cada proyecto')}</SectionSubtitle>

      <TopSection>
        <ImageSection>
          <ImageComplete
            name={teamData[currentIndex].name}
            role={teamData[currentIndex].role}
            image={teamData[currentIndex].fullImage || teamData[currentIndex].image}
            surname={teamData[currentIndex].surname}
            onClick={() => handleSelect((currentIndex + 1) % totalPeople)}
          />
        </ImageSection>
        <SelectorSection>
          <PersonSelector
            people={teamData}
            currentIndex={currentIndex}
            onSelect={handleSelect}
          />
        </SelectorSection>
      </TopSection>

      <FullInformation people={teamData} currentIndex={currentIndex} />
    </TeamContainer>
  );
};

export default Team;



const TeamContainer = styled.section`
  padding: 5rem 10px;
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const SectionTitle = styled.h2`
  font-size: 2.6rem;
  margin-bottom: 1rem;
  text-align: center;
  z-index: 10;
  text-transform: uppercase;
  letter-spacing: 3px;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const SectionSubtitle = styled.p`
  font-size: 1.2rem;
  color: var(--text-color);
  opacity: 0.8;
  margin-bottom: 3rem;
  text-align: center;
  max-width: 600px;
`;

const TopSection = styled.div`
  display: flex;
  gap: 15px;
  width: 100%;
  height: 500px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    height: 320px;
    gap: 10px;
  }
`;

const ImageSection = styled.div`
  flex: 3;
  height: 100%;
  
  @media (max-width: 768px) {
    flex: 2;
    height: 100%;
  }
`;

const SelectorSection = styled.div`
  flex: 1;
  height: 100%;
  border-radius: 15px;
  backdrop-filter: blur(10px);
  align-items: center;
  display: flex;
  
  @media (max-width: 768px) {
    flex: 1;
    height: 100%;
  }
`;
