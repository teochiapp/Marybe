import React from 'react';
import styled from 'styled-components';
import { FaBolt } from 'react-icons/fa';
import { getSkillConfig } from '../../../data/skillConfig';

const SkillsMarquee = ({ skills, title }) => {
  if (!skills || skills.length === 0) return null;
  
  const renderSkillPill = (skill, key) => {
    const config = getSkillConfig(skill);
    
    if (!config) {
      return (
        <SkillPill key={key}>
          <FaBolt style={{ marginRight: 6, color: 'var(--accent-color)' }} />
          {skill}
        </SkillPill>
      );
    }
    
    const IconComponent = config.icon;
    
    return (
      <SkillPill key={key}>
        <IconComponent style={{ marginRight: 6, color: config.color }} />
        {config.label}
      </SkillPill>
    );
  };
  
  return (
    <MarqueeBg>
      <MarqueeContainer>
        <SkillsTrack>
          {skills.map((skill, idx) => renderSkillPill(skill, `skill-${idx}`))}
        </SkillsTrack>
        <SkillsTrack aria-hidden="true">
          {skills.map((skill, idx) => renderSkillPill(skill, `skill-duplicate-${idx}`))}
        </SkillsTrack>
      </MarqueeContainer>
    </MarqueeBg>
  );
};

export default SkillsMarquee;

const MarqueeBg = styled.div`
  overflow: hidden;
  max-width: 99vw;
  background: transparent;
  height: 100px;
  display: flex;
  align-items: center;
`;

const MarqueeContainer = styled.div`
  display: flex;
  width: 100vw;
`;

const SkillsTrack = styled.div`
  display: flex;
  gap: 3rem;
  animation: marquee 20s linear infinite;
  white-space: nowrap;

  // Agregamos margen izquierdo al primer SkillPill para compensar
  span:first-child {
    margin-left: 3rem;
  }

  /* Mobile hasta 768px */
  @media (max-width: 768px) {
    gap: 1rem;
    
    span:first-child {
      margin-left: 1rem;
    }
  }

  @keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
`;


const SkillPill = styled.span`
  display: flex;
  align-items: center;
  color: var(--secondary-color);
  font-weight: 700;
  gap: 7px;
  letter-spacing: 1px;
  font-size: 25px;
  padding: 0.2rem 1.1rem 0.2rem 0.7rem;
  margin: 0 0.2rem;
  transition: background 0.2s, color 0.2s;

  svg {
    font-size: 1.4em;
  }
`;
