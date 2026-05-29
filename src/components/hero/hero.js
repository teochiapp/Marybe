import React from 'react'
import styled from 'styled-components';
import { motion } from 'framer-motion'
import DarkVeil from './extensions/DarkVeil'
import AnimatedButton from './extensions/AnimatedButton';
import GradientText from '../GradientText';
import ScrollAnimatedIllustration from './extensions/ScrollAnimatedIllustration';
import { useLanguage } from '../../contexts/LanguageContext';

function Hero() {
  const { t } = useLanguage();

  return (
    <HeroWrapper id="home">

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

      <HeroContent>
        <HeroText>
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <CustomDevTag>{t('hero.tag', 'DESARROLLOS A MEDIDA')}</CustomDevTag>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Title>
              <GradientText
                colors={["var(--text-color), var(--primary-color)", "var(--primary-cyan)", "var(--accent-color)", "var(--text-color)"]}
                animationSpeed={6}
                showBorder={false}
              >
                {t('hero.title', 'Soluciones tecnológicas para impulsar tu crecimiento online')}
              </GradientText>
            </Title>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Subtitle>
              {t('hero.subtitle', 'Te acompañamos en cada etapa: desde la idea hasta su implementación, evolución y mantenimiento online.')}
            </Subtitle>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <AnimatedButton to="#contact">{t('hero.cta', 'Empecemos!')}</AnimatedButton>

          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
          </motion.div>
        </HeroText>

        <HeroIllustration>
          <ScrollAnimatedIllustration />
        </HeroIllustration>
      </HeroContent>


    </HeroWrapper>
  )
}

export default Hero

const HeroWrapper = styled.section`
  width: 100%;
  height: 95vh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 2rem;

  /* Tablet */
  @media (min-width: 768px) and (max-width: 1023px) {
    height: 90vh;
    padding: 2.5rem;
  }

  /* Mobile */
  @media (max-width: 767px) {
    min-height: 100vh;
    height: auto;
    padding: 1rem;
  }

  /* Desktop Large */
  @media (min-width: 1024px) {
    padding: 2rem;
  }
`

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 2fr 1fr;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 1200px;
  gap: 2rem;

  /* Tablet */
  @media (min-width: 768px) and (max-width: 1023px) {
    grid-template-columns: 1.8fr 1fr;
    gap: 1.5rem;
    max-width: 900px;
  }

  /* Mobile */
  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    text-align: center;
    grid-template-rows: auto auto;
    gap: 1rem;
    display: flex;
    flex-direction: column-reverse;
    padding: 120px 0 30px 0;
  }
`

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
  overflow: hidden;

  @media (max-width: 767px) {
    /* Mantener el mismo comportamiento que desktop */
    position: fixed;
    height: 100vh;
    width: 100vw;
  }
`

const HeroText = styled.div`
  flex: 1;
  color: white;
  z-index: 1;
  text-align: left;
  width: 100%;

  /* Mobile */
  @media (max-width: 767px) {
    order: 2;
    display: flex;
    justify-content: flex-start;
    flex-direction: column;
    align-items: flex-start;
    padding: 0 20px;
  }
`

const CustomDevTag = styled.span`
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-color);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0 0 0 0;
  /* Prefijos vendor para backdrop-filter */
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  border: 1px solid transparent;
  background-clip: padding-box;
  position: relative;
  z-index: 1;
  display: inline-block;
  /* Aceleración GPU para mejor rendimiento en mobile */
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  
  /* Tablet */
  @media (min-width: 768px) and (max-width: 1023px) {
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 20px;
    padding: 2px;
    background: linear-gradient(45deg, var(--secondary-color), var(--primary-color), var(--accent-color), var(--secondary-color));
    background-size: 300% 300%;
    animation: gradientShift 3s ease-in-out infinite;
    -webkit-animation: gradientShift 3s ease-in-out infinite;
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: exclude;
    -webkit-mask-composite: xor;
    z-index: -2;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    right: 2px;
    bottom: 2px;
    background: var(--secondary-color);
    border-radius: 18px;
    opacity: 0.1;
    z-index: -1;
  }
  
  @keyframes gradientShift {
    0%, 100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }
  
  @-webkit-keyframes gradientShift {
    0%, 100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }
`

const Title = styled.h3`
  font-family: var(--text-font, 'Red Hat Display', sans-serif);
  font-size: 3rem;
  font-weight: 700;
  line-height: 1.2;
  margin: 10px 0 15px;
  padding: 0 !important;
  text-align: left;
  width: 100%;

  /* Desktop Large */
  @media (min-width: 1024px) {
    font-size: 3.2rem;
  }

  /* Desktop */
  @media (min-width: 769px) and (max-width: 1023px) {
    font-size: 2.4rem;
  }

  /* Tablet */
  @media (min-width: 768px) and (max-width: 1023px) {
    font-size: 2.8rem;
    line-height: 1.1;
  }

  /* Mobile Large */
  @media (max-width: 767px) and (min-width: 480px) {
    font-size: 2.5rem;
    text-align: left;
  }

  /* Mobile */
  @media (max-width: 479px) {
    font-size: 1.8rem;
    text-align: left;
  }
`

const Subtitle = styled.p`
  font-family: var(--text-font, 'Inter', sans-serif);
  font-size: 1.25rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 2rem;
  max-width: 600px;

  /* Tablet */
  @media (min-width: 768px) and (max-width: 1023px) {
    font-size: 1.1rem;
    line-height: 1.5;
    max-width: 500px;
    margin-bottom: 1.5rem;
  }

  /* Mobile Large */
  @media (max-width: 767px) and (min-width: 480px) {
    font-size: 1.125rem;
    text-align: left;
    max-width: 100%;
  }

  /* Mobile */
  @media (max-width: 479px) {
    font-size: 1rem;
    text-align: left;
    max-width: 100%;
  }
`

const HeroIllustration = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  
  /* Tablet */
  @media (min-width: 768px) and (max-width: 1023px) {
    height: 400px;
    width: 100%;
  }
  
  /* Mobile */
  @media (max-width: 767px) {
    order: 1;
    margin-bottom: 1rem;
    height: auto;
    min-height: 200px;
  }
`