import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { FiSettings, FiExternalLink, FiClock } from 'react-icons/fi';
import GradientText from '../../components/GradientText';
import ErrorBoundary from '../../components/ErrorBoundary';
import PresupuestosHeader from '../PresupuestosHeader';
import ProfileCard from '../../components/extensions/ProfileCard';
import DarkVeil from '../../components/hero/extensions/DarkVeil';
import Footer from '../Footer';
import { translations } from '../../translations';
import LanguageContext from '../../contexts/LanguageContext';

const Agnes = () => {
  // Helper to force English context for Footer
  const englishContextValue = {
    currentLanguage: 'en',
    isEnglish: true,
    t: (key, fallback) => {
      const keys = key.split('.');
      let value = translations.en;
      for (const k of keys) {
        value = value?.[k];
        if (!value) return fallback;
      }
      return value || fallback;
    }
  };
  // Handle hash navigation to homepage
  React.useEffect(() => {
    const handleLinkClick = (e) => {
      const target = e.target.closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href || !href.startsWith('#')) return;

      // List of local section IDs for this page
      const localSections = ['#hero', '#plans', '#notices'];

      if (localSections.includes(href)) {
        // Local scroll
        e.preventDefault();
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        // External navigation
        e.preventDefault();
        window.location.href = `/${href}`;
      }
    };

    document.addEventListener('click', handleLinkClick);
    return () => document.removeEventListener('click', handleLinkClick);
  }, []);

  return (
    <AgnesContainer>
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

      <PresupuestosHeader />

      <MainContent>
        <Hero id="hero">
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
                Travelwise
              </GradientText>
            </Title>
            <JobTitle>Agnes</JobTitle>

            <Subtitle>
              Thank you for your interest in collaborating with us for <b>Travelwise</b>.
              We have prepared a tailored digital proposal that combines inspiration,
              functionality, and a captivating visual narrative for your team-building trips.
            </Subtitle>

            <FeatureGrid>
              <Feature>
                Immersive design that reflects the experience of travel and adventure.
              </Feature>
              <Feature>
                Scalable platform with integrated booking functionality ready from launch.
              </Feature>
            </FeatureGrid>
          </LeftColumn>

          <RightColumn>
            <PhotoWrapper>
              <ProfileCard
                name="Agnes"
                handle="travelwise"
                status="Online"
                contactText=""
                avatarUrl="/presupuestos/logo-agnes.jpg"
                showUserInfo={false}
                enableTilt={true}
                className="full-cover-card"
              />
            </PhotoWrapper>
          </RightColumn>
        </Hero>

        <PlansSection id="plans">
          <SectionTitle>Proposed Plans</SectionTitle>
          <PlansGrid>
            {/* Basic Plan */}
            <PlanCard>
              <PlanHeader>
                <PlanTitle>Web Development</PlanTitle>
                <PlanPrice>€980</PlanPrice>
                <PlanDescription>Full custom website to start selling trips for your clients.</PlanDescription>
              </PlanHeader>
              <PlanFeatures>
                <PlanFeature>Full site Development</PlanFeature>
                <PlanFeature>Custom Visual Interface</PlanFeature>
                <PlanFeature>WooCommerce Booking Management</PlanFeature>
                <PlanFeature>Dynamic Fields for easy content updates</PlanFeature>
                <PlanFeature>Full Responsive Design (Mobile/Tablet/Desktop)</PlanFeature>
                <PlanFeature>Multi-language Setup (EN/PL/NL/ES)</PlanFeature>
                <PlanFeature>Automated Email & Booking Notifications</PlanFeature>
                <PlanFeature>GDPR Compliance & SEO</PlanFeature>
                <PlanFeature>Payment Gateway Integration (Stripe/PayPal)</PlanFeature>
                <PlanFeature>CMS Training for Self-Management</PlanFeature>
              </PlanFeatures>
              <PlanFooter>
                <FiClock /> Time estimated: 3 weeks
              </PlanFooter>
            </PlanCard>

            {/* Premium Plan (Highlighted) */}
            <PlanCard $highlighted>
              <BestValueBadge>Recommended</BestValueBadge>
              <PlanHeader>
                <PlanTitle>Web Development + Premium Design</PlanTitle>
                <PlanPrice>€1200</PlanPrice>
                <PlanDescription>Collaboration with Mutanto team of 6 professional specialist to deliver a premium, exclusive design.</PlanDescription>
                <MutantoLink href="https://mutanto.com.ar/en/" target="_blank" rel="noopener noreferrer">
                  Visit Mutanto <FiExternalLink />
                </MutantoLink>
              </PlanHeader>
              <PlanFeatures>
                <PlanFeature>Everything in the first option, plus:</PlanFeature>
                <PlanFeature>Collaboration with a team of professional designers for refinement</PlanFeature>
                <PlanFeature>Custom Design tailored to your logo and website’s visual feel</PlanFeature>
                <PlanFeature>Harmonized color palette and typography for a cohesive look</PlanFeature>
                <PlanFeature>Custom illustrations, icons, and graphics</PlanFeature>
                <PlanFeature>UX/UI optimized layout for engagement and conversions</PlanFeature>
                <PlanFeature>Newsletter / Lead Capture CRM Integration</PlanFeature>
              </PlanFeatures>
              <PlanFooter>
                <FiClock /> Time estimated: 3 weeks developing + 1 week designing
              </PlanFooter>
            </PlanCard>
          </PlansGrid>

          <MaintenanceBanner>
            <BannerContent>
              <BannerIcon><FiSettings /></BannerIcon>
              <BannerText>
                <BannerTitle>Maintenance & Support</BannerTitle>
                <BannerDescription>
                  We look forward to continuously improving the website and watching your project grow.
                  Our maintenance service ensures your platform stays secure, updated, and fresh.
                  Includes visual and technical updates, backups, and priority support.
                </BannerDescription>
              </BannerText>
              <BannerPrice>+ €60<span>/month</span></BannerPrice>
            </BannerContent>
          </MaintenanceBanner>
        </PlansSection>

        <ClarificationsSection id="notices">
          <SectionTitle>Important Notices</SectionTitle>
          <ClarificationText>
            We want to provide you with the best possible service, and that includes being fully transparent about our process.
            The prices listed above are based on the scope discussed for this project. Everything is optional and can be adjusted to your needs.
          </ClarificationText>
          <ClarificationText>
            We highly recommend working with the design team. While we will do our best to create an aesthetically pleasing website, they are professionals specialized in visual design and user experience.
          </ClarificationText>
          <ClarificationText>
            We usually do not charge upfront, as we prefer to receive payment once the software is delivered to let our results speak for themselves and receive the payment only after the customer satisfaction is assured
            However, in this case, we work with a team of designers who require upfront payment for their services. Therefore, a 25% deposit of the total amount will be required to begin the project, so we can cover their work.
          </ClarificationText>
        </ClarificationsSection>

      </MainContent>


      <LanguageContext.Provider value={englishContextValue}>
        <Footer />
      </LanguageContext.Provider>
    </AgnesContainer>
  );
};

export default Agnes;

// Animaciones
const fadeIn = keyframes`
  0% { opacity: 0; transform: scale(0.9); }
  100% { opacity: 1; transform: scale(1); }
`;

// Styled Components
const PlansSection = styled.section`
  margin-top: 4rem;
  margin-bottom: 4rem;
  width: 100%;
`;

const SectionTitle = styled.h3`
  font-size: 2.5rem;
  color: var(--primary-color);
  text-align: center;
  margin-bottom: 3rem;
  font-family: var(--heading-font);
`;

const PlansGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1000px;
  margin: 0 auto;
`;

const PlanCard = styled.div`
  background: ${props => props.$highlighted ? 'rgba(102, 211, 250, 0.1)' : 'rgba(255, 255, 255, 0.03)'};
  border: 1px solid ${props => props.$highlighted ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 20px;
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: ${props => props.$highlighted ? '0 0 30px rgba(102, 211, 250, 0.15)' : 'none'};

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(102, 211, 250, 0.1);
  }

  ${props => props.$highlighted && `
    transform: scale(1.05);
    z-index: 2;
    @media (max-width: 768px) {
      transform: none;
    }
  `}
`;

const BestValueBadge = styled.div`
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--primary-color);
  color: var(--background-color);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const PlanHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 2rem;
`;

const PlanTitle = styled.h4`
  font-size: 1.5rem;
  color: var(--text-color);
  margin-bottom: 1rem;
`;

const PlanPrice = styled.div`
  font-size: 3rem;
  font-weight: 800;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
  font-family: var(--heading-font);
`;

const PlanDescription = styled.p`
  color: var(--text-color);
  opacity: 0.7;
  font-size: 0.95rem;
  margin: 0;
`;

const PlanFeatures = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
`;

const PlanFeature = styled.li`
  margin-bottom: 1rem;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  opacity: 0.9;

  &::before {
    content: '✓';
    color: var(--primary-color);
    font-weight: bold;
  }
`;

const PlanFooter = styled.div`
  margin-top: auto;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.9rem;
  color: var(--text-color);
  opacity: 0.8;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    color: var(--primary-color);
    font-size: 1.1rem;
  }
`;

const MaintenanceBanner = styled.div`
  max-width: 1000px;
  margin: 2rem auto 0;
  background: linear-gradient(135deg, rgba(255, 210, 111, 0.1), rgba(255, 210, 111, 0.05));
  border: 1px solid rgba(255, 210, 111, 0.2);
  border-radius: 20px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
`;

const BannerContent = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
`;

const BannerIcon = styled.div`
  font-size: 2.5rem;
`;

const BannerText = styled.div`
  flex: 1;
`;

const BannerTitle = styled.h4`
  color: var(--secondary-color);
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
`;

const BannerDescription = styled.p`
  color: var(--text-color);
  margin: 0;
  font-size: 0.95rem;
  opacity: 0.9;
  max-width: 100%;
`;

const BannerPrice = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: var(--secondary-color);
  font-family: var(--heading-font);
  white-space: nowrap;

  span {
    font-size: 1rem;
    opacity: 0.8;
    font-weight: 400;
  }
`;

const MutantoLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  color: var(--primary-color);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s ease;
  padding: 0.5rem 1rem;
  background: rgba(102, 211, 250, 0.1);
  border-radius: 20px;

  &:hover {
    background: rgba(102, 211, 250, 0.2);
    transform: translateY(-2px);
  }

  svg {
    font-size: 1rem;
  }
`;
// Styled Components

const AgnesContainer = styled.div`
  min-height: 100vh;
  width: 100%;
  background-color: #0a0a0a;
  color: #ffffff;
  position: relative;
  overflow-x: hidden;
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
    padding-top: 100px;
  }
`;

const Hero = styled.section`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  min-height: 80vh;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 3rem;
    min-height: auto;
    padding-bottom: 2rem;
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
  width: 100%;
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
    text-align: left;
  }
`;

const PhotoWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
`;

const ClarificationsSection = styled.section`
  margin-top: 4rem;
  margin-bottom: 2rem;
  padding-top: 2rem;
  padding-bottom: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const ClarificationText = styled.p`
  color: var(--text-color);
  opacity: 0.7;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  text-align: justify;

  @media (max-width: 768px) {
    text-align: left;
  }
`;
