import '../../index.css';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import Card3D from './card3D';
import PersonSelector from './PersonSelector';
import GradientText from '../GradientText';

import {
  people,
  getTeamData,
  gradientColors,
  animationConfig,
  getTotalPeople
} from '../../data/teamData';
import { useLanguage } from '../../contexts/LanguageContext';

const Team = () => {
  const { t } = useLanguage();
  const teamData = getTeamData(t);
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalPeople = getTotalPeople();
  const timerRef = useRef();

  // Función para iniciar el autoplay con un delay custom
  const startAutoplay = useCallback((delay = 10000) => {
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
    }, 15000);
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

      <PersonSelector people={teamData} currentIndex={currentIndex} />

      <Container>
        {teamData.map((person, idx) => (
          <Card3D
            key={person.name}
            name={person.name}
            description={person.description}
            image={person.image}
            role={person.role}
            onClick={() => handleSelect(idx)}
          />
        ))}
      </Container>
    </TeamContainer>
  );
};

export default Team;



const TeamContainer = styled.section`
  padding: 5rem 0;
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

const Container = styled.div`
  display: flex;
  gap: 20px;

  @media (max-width: 1024px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    width: 50vw;
    justify-items: center;
    margin: 0 auto;
    justify-content: center;
    max-width: none;
  }
  @media (max-width: 600px) {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    width: 100%;
    align-items: center;
    max-width: 100vw;
  }
`;
