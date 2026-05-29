import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { FaEnvelope, FaLinkedin, FaGithub, FaInstagram } from 'react-icons/fa';
import TeoHeader from './TeoHeader';
import GradientText from '../components/extensions/GradientText';
import Footer from './Footer';
import ProfileCard from '../components/extensions/ProfileCard';
import SkillsMarquee from '../components/skills/extensions/SkillsMarquee';
import DarkVeil from '../components/hero/extensions/DarkVeil';
import TeoPortfolio from '../components/portfolio/TeoPortfolio';
import { skillsTeo as skillsData } from '../data/skillsData';
import teoProjectsData from '../data/teoProjectsData';

function TeoChiappero() {

  return (
    <TeoChiapperoContainer>
      
      {/* Background DarkVeil fijo que cubre toda la página */}
      <RippleBackground>
        <DarkVeil 
          hueShift={37}
          noiseIntensity={0.0}
          scanlineIntensity={0}
          speed={1.2}
          scanlineFrequency={0.5}
          warpAmount={0.1}
          resolutionScale={1}
        />
      </RippleBackground>

      <TeoHeader />
      <MainContent>
        <Hero id="hero" data-section="inicio">
          <LeftColumn>
            <Title>
              <GradientText
                colors={[
                  "var(--secondary-color)", 
                  "var(--primary-color)", 
                  "var(--accent-color)", 
                  "var(--secondary-color)", 
                  "var(--text-color)", 
                  "var(--primary-color)", 
                ]}
                animationSpeed={3}
                showBorder={false}
                className="custom-class"
              >
                Teo Chiappero
              </GradientText>
            </Title>
            <JobTitle>Fullstack Developer</JobTitle>

            <Subtitle>
              Desarrollador fullstack apasionado por crear experiencias web 
              intuitivas y escalables. Desde trabajos freelance hasta proyectos de 
              pasantías, he entregado soluciones completas y accesibles adaptadas a 
              necesidades del mundo real, combinando habilidades técnicas sólidas 
              en frontend y backend con atención al detalle y al diseño.
            </Subtitle>

            <FeatureGrid>
              <Feature>
                Especializado en crear aplicaciones web completas con interfaces 
                responsivas, APIs robustas y código limpio y mantenible.
              </Feature>
              <Feature>
                He entregado exitosamente soluciones web personalizadas a clientes 
                de diversos sectores.
              </Feature>
            </FeatureGrid>
          </LeftColumn>

          <RightColumn>
            <PhotoWrapper>
              <ProfileCard
                name="Coder"
                handle="teochiappero"
                status="Online"
                contactText="Contact Me"
                avatarUrl="/team/TeoFull.jpg"
                showUserInfo={true}
                enableTilt={true}              
              />
            </PhotoWrapper>
          </RightColumn>
                </Hero>
        
      </MainContent>
      
      {/* SkillsMarquee fuera del contenedor para ocupar 100% de pantalla */}
      <FullWidthSkillsContainer>
        <SkillsMarquee skills={skillsData} title="Skills" />
      </FullWidthSkillsContainer>
      
      <MainContent>
        
        <Section data-section="experiencia">
          <SectionTitle>
            <GradientText
              colors={[
                "var(--secondary-color)", 
                "var(--primary-color)", 
                "var(--accent-color)", 
                "var(--secondary-color)", 
                "var(--text-color)", 
                "var(--primary-color)", 
              ]}
              animationSpeed={3}
              showBorder={false}
              className="custom-class"
            >
              Experiencia
            </GradientText>
          </SectionTitle>
          <ExperienceContainer>
            
            <ExperienceItem>
              <ExperienceIcon>  
                <LogoImage src="/portfolio-teo/logo_alianza.png" alt="Alianza Creativa Logo" />
              </ExperienceIcon>
              <ExperienceContent>
                <ExperienceHeader>
                  <ExperienceTitle>Alianza Creativa</ExperienceTitle>
                  <ExperiencePeriod>(2025 - Presente)</ExperiencePeriod>
                </ExperienceHeader>
                <ExperienceDescription>
                  Trabajando como desarrollador fullstack en Alianza Creativa de Mallorca (España), donde soy responsable de gestionar y desarrollar 
                  independientemente proyectos internos. Obtuve experiencia práctica trabajando con requisitos del mundo real y 
                  colaborando con un equipo profesional.
                </ExperienceDescription>
                <SkillsContainer>
                  <SkillTag $color="#61DAFB">PHP</SkillTag>
                  <SkillTag $color="#F7DF1E">Javascript</SkillTag>
                  <SkillTag $color="#1572B6">WordPress</SkillTag>
                  <SkillTag $color="#339933">React</SkillTag>
                </SkillsContainer>
              </ExperienceContent>
            </ExperienceItem>

            <ExperienceItem>
              <ExperienceIcon>
                <LogoImage src="/logo.png" alt="SurCodes Logo" />
              </ExperienceIcon>
              <ExperienceContent>
                <ExperienceHeader>
                  <ExperienceTitle>SurCodes</ExperienceTitle>
                  <ExperiencePeriod>(2024 - Presente)</ExperiencePeriod>
                </ExperienceHeader>
                <ExperienceDescription>
                  Trabajando en mi propia agencia con una variedad de clientes, creando sitios web adaptados a sus necesidades. 
                  Esta experiencia me ha ayudado a mejorar mis habilidades de comunicación, resolución de problemas y gestión 
                  de proyectos mientras entrego soluciones web responsivas y fáciles de usar.
                </ExperienceDescription>
                <SkillsContainer>
                  <SkillTag $color="#61DAFB">React</SkillTag>
                  <SkillTag $color="#F7DF1E">Javascript</SkillTag>
                  <SkillTag $color="#1572B6">Css</SkillTag>
                  <SkillTag $color="#339933">Node</SkillTag>
                </SkillsContainer>
              </ExperienceContent>
            </ExperienceItem>

            <ExperienceItem>
              <ExperienceIcon>
                <LogoImage src="/icons/estudio_rocha_asoc_logo.jpeg" alt="Estudio Rocha y Asoc Logo" />
              </ExperienceIcon>
              <ExperienceContent>
                <ExperienceHeader>
                  <ExperienceTitle>Estudio Rocha y Asoc.</ExperienceTitle>
                  <ExperiencePeriod>(2023 - 2024)</ExperiencePeriod>
                </ExperienceHeader>
                <ExperienceDescription>
                  Pasantía como desarrollador, donde fui responsable de gestionar y desarrollar independientemente 
                  proyectos internos. Obtuve experiencia práctica trabajando con requisitos del mundo real y 
                  colaborando con un equipo profesional.
                </ExperienceDescription>
                <SkillsContainer>
                  <SkillTag $color="#8993BE">PHP</SkillTag>
                  <SkillTag $color="#21759B">WordPress</SkillTag>
                  <SkillTag $color="#00758F">MySQL</SkillTag>
                  <SkillTag $color="#563D7C">CSS</SkillTag>
                  <SkillTag $color="#7952B3">Bootstrap</SkillTag>
                  <SkillTag $color="#F7DF1E">Javascript</SkillTag>
                </SkillsContainer>
              </ExperienceContent>
            </ExperienceItem>

            <ExperienceItem>
              <ExperienceIcon>
                <LogoImage src="/icons/utn.jpg" alt="UTN Logo" />
              </ExperienceIcon>
              <ExperienceContent>
                <ExperienceHeader>
                  <ExperienceTitle>UTN San Francisco</ExperienceTitle>
                  <ExperiencePeriod>(2020 - 2023)</ExperiencePeriod>
                </ExperienceHeader>
                <ExperienceDescription>
                  Obtuve mi título técnico en programación, construyendo una base sólida en desarrollo de software, 
                  lógica y resolución de problemas.
                </ExperienceDescription>
                <SkillsContainer>
                  <SkillTag $color="#239120">C#</SkillTag>
                  <SkillTag $color="#F7DF1E">Javascript</SkillTag>
                  <SkillTag $color="#4FC08D">Vue</SkillTag>
                  <SkillTag $color="#00758F">MySQL</SkillTag>
                  <SkillTag $color="#24292E">Github</SkillTag>
                </SkillsContainer>
              </ExperienceContent>
            </ExperienceItem>

          </ExperienceContainer>
        </Section>

        <Section>
          <SectionTitle>
            <GradientText
              colors={[
                "var(--secondary-color)", 
                "var(--primary-color)", 
                "var(--accent-color)", 
                "var(--secondary-color)", 
                "var(--text-color)", 
                "var(--primary-color)", 
              ]}
              animationSpeed={3}
              showBorder={false}
              className="custom-class"
            >
              Idiomas
            </GradientText>
          </SectionTitle>
          <LanguagesContainer>
            
            <LanguageItem>
              <LanguageFlag>
                <FlagImage src="/icons/argentina.png" alt="España" />
              </LanguageFlag>
              <LanguageInfo>
                <LanguageName>Español</LanguageName>
                <LanguageLevel>Nativo</LanguageLevel>
                <LanguageBar>
                  <LanguageProgress $width="100%" />
                </LanguageBar>
              </LanguageInfo>
            </LanguageItem>

            <LanguageItem>
              <LanguageFlag>
                <FlagImage src="/icons/brtn.png" alt="Reino Unido" />
              </LanguageFlag>
              <LanguageInfo>
                <LanguageName>Inglés</LanguageName>
                <LanguageLevel>Avanzado</LanguageLevel>
                <LanguageBar>
                  <LanguageProgress $width="85%" />
                </LanguageBar>
              </LanguageInfo>
            </LanguageItem>

            <LanguageItem>
              <LanguageFlag>
                <FlagImage src="/icons/brasil.png" alt="Brasil" />
              </LanguageFlag>
              <LanguageInfo>
                <LanguageName>Portugués</LanguageName>
                <LanguageLevel>Intermedio</LanguageLevel>
                <LanguageBar>
                  <LanguageProgress $width="60%" />
                </LanguageBar>
              </LanguageInfo>
            </LanguageItem>

          </LanguagesContainer>
        </Section>

        {/* Sección de Portfolio */}
        <PortfolioSection data-section="proyectos">
          <TeoPortfolio 
            projects={teoProjectsData} 
            title="Mis Proyectos"
            subtitle="Desarrollos personales que demuestran mi experiencia y pasión por la programación"
          />
        </PortfolioSection>

        {/* Sección de Hobbies */}
        <Section data-section="hobbies">
          <SectionTitle>
            <GradientText
              colors={[
                "var(--secondary-color)", 
                "var(--primary-color)", 
                "var(--accent-color)", 
                "var(--secondary-color)", 
                "var(--text-color)", 
                "var(--primary-color)", 
              ]}
              animationSpeed={3}
              showBorder={false}
              className="custom-class"
            >
              Mis Hobbies
            </GradientText>
          </SectionTitle>
          <HobbiesContainer>
            <HobbyCard $bgImage="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80">
              <HobbyTitle>Lectura</HobbyTitle>
            </HobbyCard>

            <HobbyCard $bgImage="/portfolio-teo/hobbies/guitar.png">
              <HobbyTitle>Guitarra</HobbyTitle>
            </HobbyCard>

            <HobbyCard $bgImage="/portfolio-teo/hobbies/piano.png">
              <HobbyTitle>Piano</HobbyTitle>
            </HobbyCard>

            <HobbyCard $bgImage="/portfolio-teo/hobbies/sing2.png">
              <HobbyTitle>Canto</HobbyTitle>
            </HobbyCard>

            <HobbyCard $bgImage="/portfolio-teo/hobbies/running.png">
              <HobbyTitle>Running</HobbyTitle>
            </HobbyCard>

            <HobbyCard $bgImage="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80">
              <HobbyTitle>Gym</HobbyTitle>
            </HobbyCard>
          </HobbiesContainer>
        </Section>
        
        <Section data-section="contacto">
          <SectionTitle>
            <GradientText
              colors={[
                "var(--secondary-color)", 
                "var(--primary-color)", 
                "var(--accent-color)", 
                "var(--secondary-color)", 
                "var(--text-color)", 
                "var(--primary-color)", 
              ]}
              animationSpeed={3}
              showBorder={false}
              className="custom-class"
            >
              Contacto
            </GradientText>
          </SectionTitle>
          <ContactGrid>
            <ContactCard href="mailto:teochiapps@gmail.com">
              <ContactIcon>
                <FaEnvelope />
              </ContactIcon>
              <ContactCardContent>
                <ContactCardTitle>Email</ContactCardTitle>
                <ContactCardValue>teochiapps@gmail.com</ContactCardValue>
              </ContactCardContent>
            </ContactCard>

            <ContactCard href="https://linkedin.com/in/teochiappero" target="_blank" rel="noopener noreferrer">
              <ContactIcon>
                <FaLinkedin />
              </ContactIcon>
              <ContactCardContent>
                <ContactCardTitle>LinkedIn</ContactCardTitle>
                <ContactCardValue>teochiappero</ContactCardValue>
              </ContactCardContent>
            </ContactCard>

            <ContactCard href="https://github.com/teochiappero" target="_blank" rel="noopener noreferrer">
              <ContactIcon>
                <FaGithub />
              </ContactIcon>
              <ContactCardContent>
                <ContactCardTitle>GitHub</ContactCardTitle>
                <ContactCardValue>teochiappero</ContactCardValue>
              </ContactCardContent>
            </ContactCard>

            <ContactCard href="https://instagram.com/teochiappero" target="_blank" rel="noopener noreferrer">
              <ContactIcon>
                <FaInstagram />
              </ContactIcon>
              <ContactCardContent>
                <ContactCardTitle>Instagram</ContactCardTitle>
                <ContactCardValue>@teochiappero</ContactCardValue>
              </ContactCardContent>
            </ContactCard>
          </ContactGrid>
        </Section>
      </MainContent>
           <Footer />
    </TeoChiapperoContainer>
  );
}

export default TeoChiappero;

const TeoChiapperoContainer = styled.div`
  min-height: 100vh;
  background: var(--background-color);
  color: var(--text-color);
  position: relative;
`;

const RippleBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  pointer-events: none;
  height: 100vh;
  width: 100vw;
`;

const MainContent = styled.main`
  padding-top: 120px;
  max-width: 1200px;
  margin: 0 auto;
  padding-left: 2rem;
  padding-right: 2rem;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    padding-left: 1rem;
    padding-right: 1rem;
    padding-top: 20px;
  }
`;

const FullWidthSkillsContainer = styled.div`
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  margin-bottom: 2rem;
  background: transparent;
  overflow: hidden;
  z-index: 1;
  
  @media (max-width: 768px) {
    margin-bottom: 2rem;
  }
`;

const Hero = styled.section`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  margin-bottom: 2rem;
  padding: 2rem 0;
  min-height: 80vh;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 3rem;
    min-height: auto;
  }
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  justify-content: center;
  align-items: flex-start;

  @media (max-width: 768px) {
    align-items: center;
  }
`;

const RightColumn = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 3.5rem;
  font-weight: 900;
  margin: 0;
  font-family: "Megrim", system-ui, sans-serif;
  line-height: 1.1;
  color: var(--text-color);
  letter-spacing: 2px;

  @media (max-width: 768px) {
    font-size: 3rem;
    padding-top: 50px;
  }

  @media (max-width: 480px) {
    font-size: 2.5rem;
    letter-spacing: 1px;
  }
`;

const JobTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--secondary-color);
  margin: 0;
  font-family: var(--heading-font);
  text-transform: uppercase;
  letter-spacing: 1px;

  @media (max-width: 768px) {
    font-size: 1.3rem;
  }

  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  font-weight: 400;
  color: var(--text-color);
  margin: 0;
  opacity: 0.9;
  line-height: 1.6;
  max-width: 600px;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-top: 1rem;
`;

const Feature = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  font-size: 1rem;
  line-height: 1.6;
  color: var(--text-color);
  opacity: 0.9;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 211, 250, 0.1);
  }

  @media (max-width: 768px) {
    padding: 1rem;
    font-size: 0.95rem;
  }
`;

const PhotoWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
`;

const Section = styled.section`
  margin-bottom: 3rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);

  @media (max-width: 768px) {
    padding: 1.5rem;
    margin-bottom: 2rem;
  }
`;

const PortfolioSection = styled.section`
  margin-bottom: 4rem;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    margin-bottom: 2rem;
  }
`;

const SkillsSection = styled.section`
  margin-bottom: 3rem;
  padding: 2rem 0;
  overflow: hidden;
  
  @media (max-width: 768px) {
    margin-bottom: 2rem;
    padding: 1.5rem 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin: 0 0 1.5rem 0;
  font-family: var(--heading-font);

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const SectionContent = styled.div`
  p {
    font-size: 1rem;
    line-height: 1.6;
    color: var(--text-color);
    margin-bottom: 1rem;
    opacity: 0.9;
  }
`;



const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-top: 2rem;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.2rem;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const ContactCard = styled.a`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding: 1.8rem;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(102, 211, 250, 0.1), rgba(102, 211, 250, 0.05));
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-5px);
    border-color: var(--primary-color);
    box-shadow: 0 15px 35px rgba(102, 211, 250, 0.2);
  }

  &:hover::before {
    opacity: 1;
  }

  @media (max-width: 1200px) {
    padding: 1.6rem;
    gap: 1rem;
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
    gap: 1rem;
  }
`;

const ContactIcon = styled.div`
  font-size: 1.8rem;
  flex-shrink: 0;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  transition: all 0.3s ease;

  svg {
    width: 100%;
    height: 100%;
  }

  @media (max-width: 1200px) {
    font-size: 1.6rem;
    width: 38px;
    height: 38px;
  }

  @media (max-width: 768px) {
    font-size: 1.5rem;
    width: 35px;
    height: 35px;
  }
`;

const ContactCardContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ContactCardTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--primary-color);
  margin: 0 0 0.5rem 0;
  font-family: var(--heading-font);
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const ContactCardValue = styled.p`
  font-size: 1rem;
  color: var(--text-color);
  margin: 0;
  opacity: 0.9;
  word-break: break-word;
  font-family: var(--text-font);

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

// Experience Section Styles
const ExperienceContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const ExperienceItem = styled.div`
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: var(--primary-color);
    box-shadow: 0 10px 30px rgba(102, 211, 250, 0.15);
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
`;

const ExperienceIcon = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  padding-top: 0.5rem;
`;

const LogoImage = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
  }
`;

const ExperienceContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const ExperienceHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const ExperienceTitle = styled.h4`
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-color);
  margin: 0;
  font-family: var(--heading-font);

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const ExperiencePeriod = styled.span`
  font-size: 1rem;
  color: var(--primary-color);
  font-weight: 500;
  font-style: italic;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const ExperienceDescription = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: var(--text-color);
  opacity: 0.9;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
`;

const SkillsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const DEFAULT_SKILL_COLOR = '#66D3FA';

const sanitizeHex = (color = DEFAULT_SKILL_COLOR) => {
  if (typeof color !== 'string') return DEFAULT_SKILL_COLOR;
  if (!color.startsWith('#')) return DEFAULT_SKILL_COLOR;

  if (color.length === 4) {
    return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
  }

  if (color.length === 9) {
    return `#${color.slice(1, 7)}`;
  }

  return color.length === 7 ? color : DEFAULT_SKILL_COLOR;
};

const hexToRgb = (color) => {
  const hex = sanitizeHex(color).replace('#', '');
  const value = parseInt(hex, 16);

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
};

const alphaColor = (color, alpha) => {
  const { r, g, b } = hexToRgb(color || DEFAULT_SKILL_COLOR);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const SkillTag = styled.span`
  background: ${props => alphaColor(props.$color, 0.15)};
  color: #ffffff;
  border: 1px solid ${props => alphaColor(props.$color, 0.35)};
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px ${props => alphaColor(props.$color, 0.25)};
  }

  @media (max-width: 768px) {
    font-size: 0.75rem;
    padding: 0.2rem 0.6rem;
  }
`;

// Languages Section Styles
const LanguagesContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const LanguageItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: var(--secondary-color);
    box-shadow: 0 10px 20px rgba(255, 210, 111, 0.15);
  }

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const LanguageFlag = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 45px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 50px;
    height: 38px;
  }
`;

const FlagImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  border-radius: 8px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.05);
  padding: 2px;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    background: rgba(255, 255, 255, 0.1);
  }
`;

const LanguageInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const LanguageName = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const LanguageLevel = styled.span`
  font-size: 0.9rem;
  color: var(--secondary-color);
  font-weight: 500;

  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

const LanguageBar = styled.div`
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
`;

const LanguageProgress = styled.div`
  width: ${props => props.$width || '0%'};
  height: 100%;
  background: linear-gradient(135deg, var(--secondary-color), var(--primary-color));
  border-radius: 3px;
  transition: width 0.8s ease;
`;

// Estilos para la sección de Hobbies
const HobbiesContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  @media (max-width: 480px) {
    gap: 1rem;
  }
`;

const HobbyCard = styled.div`
  position: relative;
  height: 300px;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s ease;
  border: 2px solid rgba(255, 255, 255, 0.1);

  /* Imagen de fondo */
  background-image: url(${props => props.$bgImage});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  /* Overlay oscuro */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4));
    transition: all 0.4s ease;
    z-index: 1;
  }

  &:hover {
    transform: translateY(-10px) scale(1.02);
    border-color: var(--primary-color);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }

  &:hover::before {
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5));
  }

  @media (max-width: 768px) {
    height: 250px;
  }

  @media (max-width: 480px) {
    height: 200px;
  }
`;

const HobbyTitle = styled.h4`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  font-size: 2rem;
  font-weight: 900;
  color: white;
  margin: 0;
  font-family: var(--heading-font);
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 
    2px 2px 4px rgba(0, 0, 0, 0.8),
    0 0 10px rgba(0, 0, 0, 0.6),
    0 0 20px rgba(0, 0, 0, 0.4);
  transition: all 0.4s ease;

  ${HobbyCard}:hover & {
    transform: translate(-50%, -50%) scale(1.1);
    text-shadow: 
      3px 3px 6px rgba(0, 0, 0, 0.9),
      0 0 15px rgba(102, 211, 250, 0.5),
      0 0 30px rgba(102, 211, 250, 0.3);
    color: var(--primary-color);
  }

  @media (max-width: 768px) {
    font-size: 2rem;
    letter-spacing: 1px;
  }

  @media (max-width: 480px) {
    font-size: 1.5rem;
    letter-spacing: 0.5px;
  }
`;
