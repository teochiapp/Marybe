import '../../index.css';
import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaAward, FaUsers, FaGithub, FaLinkedin, FaInstagram } from 'react-icons/fa';
import GradientText from './../GradientText';
import { getSkillConfig } from '../../data/skillConfig';
import {
  getPersonStats,
  getPersonBio,
  getPersonSkills,
  getPersonSocial,
  getStatsConfig,
  gradientColors,
  animationConfig
} from '../../data/teamData';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';

// Animaciones para los bordes
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

const PersonSelector = ({ people, currentIndex }) => {
  const { t } = useLanguage();
  const statsConfig = getStatsConfig(t);
  const [prevIndex, setPrevIndex] = useState(currentIndex);
  const direction = currentIndex > prevIndex ? 1 : -1;

  useEffect(() => {
    setPrevIndex(currentIndex);
  }, [currentIndex]);

  const person = people[currentIndex];
  if (!person) return null;

  const personStats = getPersonStats(person);
  const personBio = getPersonBio(person);
  const personSkills = getPersonSkills(person);
  const personSocial = getPersonSocial(person);

  return (
    <SliderBg>
      <TopBorder />
      <BottomBorder />
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 60 * direction, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -60 * direction, scale: 0.98 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          style={{ width: "100%" }}
        >
          <SliderGrid>
            <LeftCol>
              <HeaderSection>
                <Title>
                  <GradientText
                    colors={gradientColors}
                    animationSpeed={animationConfig.speed}
                    showBorder={animationConfig.showBorder}
                  >
                    {person.name}
                  </GradientText>
                </Title>
              </HeaderSection>

              <DescriptionSection>
                <Subtitle>{person.description}</Subtitle>
                <BioText>
                  {personBio}
                </BioText>
              </DescriptionSection>

              {personSkills && personSkills.length > 0 && (
                <SkillsSection>
                  <SkillsTitle>
                    <FaUsers />
                    <span>{t('team.mainSkills', 'Habilidades Principales')}</span>
                  </SkillsTitle>
                  <SkillsGrid>
                    {personSkills.slice(0, 4).map((skill, index) => {
                      const skillConfig = getSkillConfig(skill);
                      const IconComponent = skillConfig ? skillConfig.icon : FaAward;

                      return (
                        <SkillItem key={index}>
                          <IconComponent style={{
                            color: skillConfig ? skillConfig.color : 'var(--primary-cyan)',
                            fontSize: '0.75rem'
                          }} />
                          <span>{skillConfig ? skillConfig.label : skill}</span>
                        </SkillItem>
                      );
                    })}
                  </SkillsGrid>
                </SkillsSection>
              )}

              <StatsSection>
                <StatItem>
                  <StatNumber>{personStats.experience}</StatNumber>
                  <StatLabel>{statsConfig.experience.label}</StatLabel>
                </StatItem>
                <StatItem>
                  <StatNumber>{personStats.projects}</StatNumber>
                  <StatLabel>{statsConfig.projects.label}</StatLabel>
                </StatItem>
              </StatsSection>
            </LeftCol>

            <RightCol>
              <ImageAndSocialContainer>
                <ImageContainer>
                  <ProfileImg src={person.fullImage || person.image} alt={person.name} />
                  <ImageOverlay />
                </ImageContainer>

                {personSocial && (personSocial.github || personSocial.linkedin || personSocial.instagram) && (
                  <SocialSection>
                    <SocialLinks>
                      {personSocial.github && personSocial.github.trim() !== '' && (
                        <SocialIcon href={personSocial.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                          <FaGithub />
                        </SocialIcon>
                      )}
                      {personSocial.linkedin && personSocial.linkedin.trim() !== '' && (
                        <SocialIcon href={personSocial.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                          <FaLinkedin />
                        </SocialIcon>
                      )}
                      {personSocial.instagram && personSocial.instagram.trim() !== '' && (
                        <SocialIcon href={personSocial.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                          <FaInstagram />
                        </SocialIcon>
                      )}
                    </SocialLinks>
                  </SocialSection>
                )}
              </ImageAndSocialContainer>


            </RightCol>
          </SliderGrid>
        </motion.div>
      </AnimatePresence>
    </SliderBg>
  );
};

export default PersonSelector;

// Componentes de borde animado
const TopBorder = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--primary-cyan), transparent);
  animation: ${topBorderAnimation} 2s linear infinite;
  z-index: 10;
`;

const BottomBorder = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--primary-cyan), transparent);
  animation: ${bottomBorderAnimation} 2s linear infinite;
  z-index: 10;
`;

const SliderBg = styled.div`
  width: 99vw;
  height: 450px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  z-index: 999;
  margin-bottom: 2.7rem;
  box-shadow: 0 8px 32px 0 rgba(13,211,250,0.10), 0 1.5px 8px 0 rgba(13, 211, 250, 0.08);
  border-radius: 20px;
  background: rgba(18, 26, 46, 0.3);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(13, 211, 250, 0.2);
  position: relative;

  @media (max-width: 900px) {
    height: auto;
    padding: 2rem 0;
  }
`;

const SliderGrid = styled.div`
  width: 100%;
  max-width: 1000px;
  display: flex;
  gap: 3rem;
  align-items: center;
  justify-content: space-between;
  margin: 0 auto;
  padding: 0 2rem;

  @media (max-width: 900px) {
    flex-direction: column;
    gap: 2rem;
    padding: 0 1rem;
  }
`;

const LeftCol = styled.div`
  flex: 1.5;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.8rem;
  color: var(--text-color);
  max-height: 100%;
  padding: 1rem 0;
`;

const HeaderSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  width: 100%;
  align-items: self-start;
`;

const Title = styled.h3`
  font-size: 2.2rem;
  font-family: var(--heading-font);
  font-weight: 700;
  color: var(--primary-color);
  margin: 0;
  letter-spacing: 1px;
  text-shadow: 0 2px 16px rgba(13,211,250,0.25), 0 1px 0 var(--background-color), 0 0 8px var(--primary-cyan);

  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const DescriptionSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  align-items: self-start;
`;

const Subtitle = styled.h4`
  font-size: 1.3rem;
  font-family: var(--text-font);
  font-weight: 600;
  color: var(--secondary-color);
  margin: 0;
`;

const BioText = styled.p`
  font-size: 0.9rem;
  font-family: var(--text-font);
  color: var(--text-color);
  margin: 0;
  opacity: 0.9;
  line-height: 1.4;
  max-width: 400px;
  text-align: left;
`;

const SkillsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const SkillsTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--primary-cyan);
  font-family: var(--text-font);

  svg {
    font-size: 0.75rem;
  }
`;

const SkillsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const SkillItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(13, 211, 250, 0.1);
  color: var(--primary-cyan);
  padding: 0.3rem 0.7rem;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: 500;
  border: 1px solid rgba(13, 211, 250, 0.2);
  transition: all 0.2s ease;

  svg {
    font-size: 0.75rem;
    min-width: 0.75rem;
  }

  &:hover {
    background: rgba(13, 211, 250, 0.2);
    border-color: var(--primary-cyan);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(13, 211, 250, 0.3);
  }
`;

const StatsSection = styled.div`
  display: flex;
  gap: 1.2rem;
  margin-top: 0.3rem;

  @media (max-width: 768px) {
    gap: 0.8rem;
  }
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--primary-cyan);
  font-family: var(--heading-font);
`;

const StatLabel = styled.div`
  font-size: 0.65rem;
  color: var(--text-color);
  opacity: 0.8;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const RightCol = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;

  @media (max-width: 900px) {
    justify-content: center;
  }
`;

const ImageAndSocialContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  width: 100%;
  margin-bottom: 1rem;
  flex-direction: column;
`;

const ImageContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProfileImg = styled.img`
    width: 30vh;
    height: 30vh;
    object-fit: cover;
    border-radius: 20px;
    border: 3px solid rgba(13, 211, 250, 0.3);
    transition: all 0.3s ease;
    animation: hrwkUX 3s ease-in-out infinite;

  @media (max-width: 900px) {
    width: 160px;
    height: 160px;
  }
`;

const ImageOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(13, 211, 250, 0.1), transparent);
  border-radius: 20px;
  pointer-events: none;
`;

const SocialSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SocialLinks = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.8rem;
  align-items: center;
`;

const SocialIcon = styled.a`
  color: var(--primary-color);
  font-size: 1.1rem;
  transition: all 0.3s ease;
  padding: 0.6rem;
  border-radius: 50%;
  background: rgba(13, 211, 250, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid rgba(13, 211, 250, 0.2);

  &:hover {
    color: var(--secondary-color);
    background: rgba(13, 211, 250, 0.1);
    transform: translateY(-3px);
    border-color: var(--primary-cyan);
    box-shadow: 0 4px 12px rgba(13, 211, 250, 0.3);
  }
`;

