import React from 'react';
import styled from 'styled-components';
import { FaGithub, FaLinkedin, FaInstagram, FaClock, FaProjectDiagram } from 'react-icons/fa';
import { useLanguage } from '../../../contexts/LanguageContext';

const FullInformation = ({ people, currentIndex }) => {
  const person = people[currentIndex];
  const { t } = useLanguage();

  if (!person) return null;

  return (
    <InfoContainer>
      <InfoHeader>
        <InfoTitle>{person.name}</InfoTitle>
        <InfoRole>{person.description}</InfoRole>
      </InfoHeader>

      <InfoBio>{person.bio}</InfoBio>

      <StatsSection>
        <StatItem>
          <StatIcon>
            <FaClock />
          </StatIcon>
          <StatContent>
            <StatValue>{person.stats?.experience || '3+'}</StatValue>
            <StatLabel>{t('team.stats.experience', 'Años de Experiencia')}</StatLabel>
          </StatContent>
        </StatItem>

        <StatItem>
          <StatIcon>
            <FaProjectDiagram />
          </StatIcon>
          <StatContent>
            <StatValue>{person.stats?.projects || '50+'}</StatValue>
            <StatLabel>{t('team.stats.projects', 'Proyectos Completados')}</StatLabel>
          </StatContent>
        </StatItem>
      </StatsSection>

      <SkillsSection>
        <SkillsTitle>{t('team.mainSkills', 'Habilidades')}</SkillsTitle>
        <SkillsGrid>
          {person.skills?.map((skill, index) => (
            <SkillTag key={index}>{skill}</SkillTag>
          ))}
        </SkillsGrid>
      </SkillsSection>

      {person.social && (person.social.github || person.social.linkedin || person.social.instagram) && (
        <SocialSection>
          <SocialTitle>{t('footer.followUs', 'Redes Sociales')}</SocialTitle>
          <SocialGrid>
            {person.social.github && person.social.github.trim() !== '' && (
              <SocialLink href={person.social.github} target="_blank" rel="noopener noreferrer">
                <FaGithub />
              </SocialLink>
            )}
            {person.social.linkedin && person.social.linkedin.trim() !== '' && (
              <SocialLink href={person.social.linkedin} target="_blank" rel="noopener noreferrer">
                <FaLinkedin />
              </SocialLink>
            )}
            {person.social.instagram && person.social.instagram.trim() !== '' && (
              <SocialLink href={person.social.instagram} target="_blank" rel="noopener noreferrer">
                <FaInstagram />
              </SocialLink>
            )}
          </SocialGrid>
        </SocialSection>
      )}
    </InfoContainer>
  );
};

const InfoContainer = styled.div`
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 20px;
`;

const InfoHeader = styled.div`
  margin-bottom: 20px;
`;

const InfoTitle = styled.h3`
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 5px 0;
  color: var(--primary-color);
`;

const InfoRole = styled.p`
  font-size: 1.1rem;
  margin: 0;
  color: var(--text-color);
  font-weight: 500;
`;

const InfoBio = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: var(--text-color);
  opacity: 0.9;
  margin-bottom: 25px;
`;

const StatsSection = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 25px;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

const StatIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 2px;
`;

const StatLabel = styled.div`
  font-size: 0.8rem;
  color: var(--text-color);
  opacity: 0.7;
`;

const SkillsSection = styled.div`
  margin-bottom: 25px;
`;

const SkillsTitle = styled.h4`
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 15px 0;
  color: var(--text-color);
`;

const SkillsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const SkillTag = styled.span`
  background: var(--primary-dark);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
`;

const SocialSection = styled.div`
  margin-bottom: 15px;
`;

const SocialTitle = styled.h4`
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 15px 0;
  color: var(--text-color);
`;

const SocialGrid = styled.div`
  display: flex;
  gap: 15px;
`;

const SocialLink = styled.a`
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: var(--primary-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  text-decoration: none;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }
`;

export default FullInformation; 