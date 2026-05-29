import React from 'react'
import styled from 'styled-components'
import { motion, MotionConfig } from 'framer-motion'
import { useRef } from 'react'
import { useState, useEffect } from 'react'
import { useScrollOptimization, useOptimizedInView } from '../hooks/useScrollOptimization'
import Hero from '../components/hero/hero'
import Services from '../components/services/services.backup'
import Portfolio from '../components/portfolio/portfolio'
import Team from '../components/team/Team'
import TeamMobile from '../components/team/TeamMobile';
import Blog from '../components/blog/blog'
import Contact from '../components/contact/contact'
import Skills from '../components/skills/skills'
import Footer from './Footer';

const Home = () => {
  // Hook para optimizar scroll
  useScrollOptimization();

  // Refs para detectar cuando cada componente está en viewport
  const servicesRef = useRef(null)
  const teamRef = useRef(null)
  const blogRef = useRef(null)
  const portfolioRef = useRef(null)
  const contactRef = useRef(null)
  const skillsRef = useRef(null)
  const footerRef = useRef(null);

  // Hooks optimizados para detectar cuando cada componente está visible
  const isServicesInView = useOptimizedInView(servicesRef)
  const isTeamInView = useOptimizedInView(teamRef)
  const isBlogInView = useOptimizedInView(blogRef)
  const isPortfolioInView = useOptimizedInView(portfolioRef, { margin: "-150px" })
  const isContactInView = useOptimizedInView(contactRef)
  const isSkillsInView = useOptimizedInView(skillsRef)
  const isFooterInView = useOptimizedInView(footerRef);

  // Fallback: si el observer no dispara en móvil, forzar visibilidad
  const [forceShowPortfolio, setForceShowPortfolio] = useState(false);
  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 768px)').matches;

    if (isMobile) {
      // En móviles, ser más agresivo y mostrar después de poco tiempo
      const timeout = setTimeout(() => {
        setForceShowPortfolio(true);
      }, 800);
      return () => clearTimeout(timeout);
    }

    if (isPortfolioInView) {
      setForceShowPortfolio(false);
      return;
    }
  }, [isPortfolioInView]);

  // Handle initial hash scroll
  useEffect(() => {
    // Check if there is a hash in the URL
    if (window.location.hash) {
      // Small delay to ensure DOM is ready and animations don't interfere
      setTimeout(() => {
        const id = window.location.hash.substring(1);
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    }
  }, []);

  return (
    <MotionConfig
      transition={{
        type: "tween",
        ease: "easeOut",
        duration: 0.3
      }}
      reducedMotion="user"
    >
      <HomeContainer>
        <Hero />

        <motion.div
          ref={servicesRef}
          data-motion-section
          initial={{ opacity: 0, y: 20 }}
          animate={isServicesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          className={isServicesInView ? 'animation-complete' : ''}
        >
          <Services />
        </motion.div>

        <motion.div
          ref={portfolioRef}
          data-motion-section
          initial={{ opacity: 0, y: 20 }}
          animate={(isPortfolioInView || forceShowPortfolio) ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          className={(isPortfolioInView || forceShowPortfolio) ? 'animation-complete' : ''}
        >
          <Portfolio />
        </motion.div>

        <motion.div
          ref={skillsRef}
          data-motion-section
          initial={{ opacity: 0, y: 20 }}
          animate={isSkillsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          className={isSkillsInView ? 'animation-complete' : ''}
        >
          <Skills />
        </motion.div>

        <motion.div
          ref={teamRef}
          data-motion-section
          initial={{ opacity: 0, scale: 0.98 }}
          animate={isTeamInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.98 }}
          className={isTeamInView ? 'animation-complete' : ''}
        >
          <div className="team-mobile">
            <TeamMobile />
          </div>
          <div className="team-desktop">
            <Team />
          </div>
        </motion.div>

        <motion.div
          ref={blogRef}
          data-motion-section
          initial={{ opacity: 0, y: 20 }}
          animate={isBlogInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          className={isBlogInView ? 'animation-complete' : ''}
        >
          <Blog />
        </motion.div>

        <motion.div
          ref={contactRef}
          data-motion-section
          initial={{ opacity: 0, y: 20 }}
          animate={isContactInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          className={isContactInView ? 'animation-complete' : ''}
        >
          <Contact />
        </motion.div>

        <motion.div
          ref={footerRef}
          data-motion-section
          initial={{ opacity: 0 }}
          animate={isFooterInView ? { opacity: 1 } : { opacity: 0 }}
          className={isFooterInView ? 'animation-complete' : ''}
        >
          <Footer />
        </motion.div>
      </HomeContainer>
    </MotionConfig>
  );
};

export default Home

const HomeContainer = styled.main`
  min-height: 100vh;
  background-color: var(--background-color, #0A0A0A);
  color: var(--text-color, #E6E6E6);
  display: flex;
  flex-direction: column;
  width: 100%;

  .team-mobile {
    display: none;
    
    @media (max-width: 767px) {
      display: block;
    }
  }

  .team-desktop {
    display: block;
    
    @media (max-width: 767px) {
      display: none;
    }
  }
`;