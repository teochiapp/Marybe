import React from 'react';
import styled from 'styled-components';
import SkillsMarquee from './extensions/SkillsMarquee';
import { skills as skillsData } from '../../data/skillsData';

function Skills() {
  return (
    <Container>
      <SkillsMarquee skills={skillsData} title="Skills" />
    </Container>
  );
}

export default Skills;

const Container = styled.div`
  padding: 20px 0;
`;
