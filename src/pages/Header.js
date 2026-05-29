import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Link as ScrollLink } from "react-scroll";
import { useNavigate } from "react-router-dom";
import { FiMenu, FiX, FiGithub, FiInstagram, FiMail } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedButton from "../components/hero/extensions/AnimatedButton";
import { useLanguage } from "../contexts/LanguageContext";
import { AR } from 'country-flag-icons/react/3x2';
import { GB } from 'country-flag-icons/react/3x2';

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevenir scroll cuando el menú está abierto
  useEffect(() => {
    if (isOpen) {
      // Usar clases CSS en lugar de manipular estilos directamente
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }

    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [isOpen]);

  // Funciones para cambiar idioma
  const handleSpanishClick = () => {
    navigate('/');
  };

  const handleEnglishClick = () => {
    navigate('/eng');
  };

  const socialLinks = [
    {
      icon: <FiInstagram />,
      name: "Instagram",
      link: "#",
    },
    {
      icon: <FiGithub />,
      name: "GitHub",
      link: "https://github.com/surcode",
    },
    {
      icon: <FiMail />,
      name: "Email",
      link: "mailto:info@surcode.com",
    },
  ];

  return (
    <HeaderContainer $isScrolled={isScrolled}>
      {/* Sección 1: Logo */}
      <LogoSection $isScrolled={isScrolled}>
        <LogoLink to="home" smooth={true} duration={500}>
          <LogoImg src="/logo.png" alt="Logo" $isScrolled={isScrolled} />
        </LogoLink>
      </LogoSection>

      {/* Sección 2: Menú de Navegación */}
      <NavSection $isScrolled={isScrolled}>
        <Nav>
          <StyledLink
            to="home"
            smooth={true}
            duration={300}
            onClick={() => setIsOpen(false)}
          >
            {t('header.home', 'Inicio')}
          </StyledLink>
          <StyledLink
            to="services"
            smooth={true}
            duration={300}
            onClick={() => setIsOpen(false)}
          >
            {t('header.services', 'Servicios')}
          </StyledLink>
          <StyledLink
            to="team"
            smooth={true}
            duration={300}
            onClick={() => setIsOpen(false)}
          >
            {t('header.team', 'Equipo')}
          </StyledLink>
          <StyledLink
            to="portfolio"
            smooth={true}
            duration={300}
            onClick={() => setIsOpen(false)}
          >
            {t('header.projects', 'Proyectos')}
          </StyledLink>
          <StyledLink
            to="contact"
            smooth={true}
            duration={300}
            onClick={() => setIsOpen(false)}
          >
            {t('header.contact', 'Contacto')}
          </StyledLink>
        </Nav>
      </NavSection>

      <LanguageFlags $isScrolled={isScrolled}>
        <SpanishFlag onClick={handleSpanishClick}>
          <AR title="Español" />
        </SpanishFlag>
        <EnglishFlag onClick={handleEnglishClick}>
          <GB title="English" />
        </EnglishFlag>
      </LanguageFlags>

      {/* Sección 3: Botón de Contacto */}
      <ContactSection>
        <AnimatedButton to="#contact">{t('header.contactButton', 'Contactanos!')}</AnimatedButton>
      </ContactSection>

      {/* Menú móvil */}
      <MobileMenuIcon $isScrolled={isScrolled} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FiX /> : <FiMenu />}
      </MobileMenuIcon>

      {/* Overlay y Sidebar Mobile */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <MobileOverlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Sidebar */}
            <MobileSidebar
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {/* Botón de cerrar */}
              <SidebarCloseButton onClick={() => setIsOpen(false)}>
                <FiX />
              </SidebarCloseButton>

              {/* Logo en el sidebar */}
              <SidebarLogo>
                <SidebarLogoDiv onClick={() => {
                  setIsOpen(false);
                  setTimeout(() => {
                    const element = document.getElementById('home');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }, 300);
                }}>
                  <SidebarLogoImg src="/logo.png" alt="Logo" />
                </SidebarLogoDiv>
              </SidebarLogo>

              {/* Menú de navegación */}
              <SidebarNav>
                <SidebarLink
                  to="home"
                  smooth={true}
                  duration={500}
                  onClick={() => setTimeout(() => setIsOpen(false), 100)}
                >
                  {t('header.home', 'Inicio')}
                </SidebarLink>
                <SidebarLink
                  to="services"
                  smooth={true}
                  duration={500}
                  onClick={() => setTimeout(() => setIsOpen(false), 100)}
                >
                  {t('header.services', 'Servicios')}
                </SidebarLink>
                <SidebarLink
                  to="team"
                  smooth={true}
                  duration={500}
                  onClick={() => setTimeout(() => setIsOpen(false), 100)}
                >
                  {t('header.team', 'Equipo')}
                </SidebarLink>
                <SidebarLink
                  to="portfolio"
                  smooth={true}
                  duration={500}
                  onClick={() => setTimeout(() => setIsOpen(false), 100)}
                >
                  {t('header.projects', 'Proyectos')}
                </SidebarLink>
                <SidebarLink
                  to="contact"
                  smooth={true}
                  duration={500}
                  onClick={() => setTimeout(() => setIsOpen(false), 100)}
                >
                  {t('header.contact', 'Contacto')}
                </SidebarLink>
              </SidebarNav>

              <SidebarContact>
                <AnimatedButton to="#contact" onClick={() => setTimeout(() => setIsOpen(false), 100)}>
                  {t('header.contactButton', 'Contactanos!')}
                </AnimatedButton>
              </SidebarContact>

              {/* Redes sociales */}
              <SidebarSocial>
                <SocialTitle>{t('footer.followUs', 'Síguenos')}</SocialTitle>
                <SocialLinks>
                  {socialLinks.map((social, index) => (
                    <SocialLink
                      key={index}
                      href={social.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.name}
                    >
                      {social.icon}
                    </SocialLink>
                  ))}
                </SocialLinks>
              </SidebarSocial>
            </MobileSidebar>
          </>
        )}
      </AnimatePresence>
    </HeaderContainer>
  );
}

export default Header;

const HeaderContainer = styled.header`
  display: grid;
  grid-template-columns: ${props => props.$isScrolled ? '1fr 1fr' : '1fr 2fr 1fr'};
  align-items: center;
  height: 80px;
  padding: 1rem 2rem;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1500;
  background-color: transparent;
  transition: all 0.3s ease;

  /* Tablet */
  @media (min-width: 768px) and (max-width: 1023px) {
    grid-template-columns: ${props => props.$isScrolled ? '1fr 1fr' : '1fr 1.5fr 1fr'};
    height: 70px;
    padding: 0.8rem 1.5rem;
  }

  /* Mobile */
  @media (max-width: 767px) {
    grid-template-columns: 1fr auto;
    justify-content: space-between;
    padding: 0rem 2rem;
  }
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0.5rem;
  border-radius: 12px;
  transition: all 0.3s ease;
`;

const LogoLink = styled(ScrollLink)`
  display: flex;
  align-items: center;
  text-decoration: none;
  transition: transform 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: scale(1.05);
  }

  /* Tablet */
  @media (min-width: 768px) and (max-width: 1023px) {
    &:hover {
      transform: scale(1.03);
    }
  }

  /* Mobile */
  @media (max-width: 767px) {
    &:hover {
      transform: scale(1.02);
    }
  }
`;

/* Logo específico para el Header principal */
const LogoImg = styled.img`
  height: 100px;
  width: 100px;
  object-fit: contain;
  border-radius: 50%;
  padding: 0.5rem;
  backdrop-filter: ${props => props.$isScrolled ? 'blur(15px)' : 'none'};
  -webkit-backdrop-filter: ${props => props.$isScrolled ? 'blur(15px)' : 'none'};
  transition: all 0.3s ease;
  display: block;

  /* Tablet */
  @media (min-width: 768px) and (max-width: 1023px) {
    height: 80px;
    width: 80px;
  }

  /* Mobile */
  @media (max-width: 767px) {
    height: 90px;
    width: 90px;
  }
`;

const NavSection = styled.div`
  display: ${props => props.$isScrolled ? 'none' : 'flex'};
  justify-content: center;
  align-items: center;
  transition: opacity 0.3s ease;

  /* Tablet */
  @media (min-width: 768px) and (max-width: 1023px) {
    display: ${props => props.$isScrolled ? 'none' : 'flex'};
  }

  /* Mobile */
  @media (max-width: 767px) {
    display: none;
  }
`;

const Nav = styled.nav`
  display: flex;
  gap: 2rem;
  align-items: center;

  /* Tablet */
  @media (min-width: 768px) and (max-width: 1023px) {
    gap: 1.2rem;
  }
`;

const ContactSection = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;

  /* Tablet */
  @media (min-width: 768px) and (max-width: 1023px) {
    display: flex;
  }

  /* Mobile */
  @media (max-width: 767px) {
    display: none;
  }
`;

const MobileMenuIcon = styled.div`
  display: none;
  font-size: 1.8rem;
  cursor: pointer;
  color: white;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  backdrop-filter: ${props => props.$isScrolled ? 'blur(15px)' : 'none'};
  -webkit-backdrop-filter: ${props => props.$isScrolled ? 'blur(15px)' : 'none'};
  transition: all 0.3s ease;
  align-items: center;
  justify-content: center;

  /* Mobile */
  @media (max-width: 767px) {
    display: flex;
  }
`;

const MobileOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 80vw;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1600;
`;

const MobileSidebar = styled(motion.div)`
  position: fixed;
  top: 0;
  right: 0;
  width: 65vw;
  height: 100%;
  background: var(--background-color);
  z-index: 1700;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  box-shadow: -2px 0 20px rgba(0, 0, 0, 0.3);
  overflow-y: auto;
  
  /* Ocultar scrollbars del sidebar */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
  -webkit-overflow-scrolling: touch; /* Smooth scrolling en iOS */
  
  &::-webkit-scrollbar {
    display: none; /* Webkit browsers */
  }
`;

const SidebarCloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: var(--text-color);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 1701;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--primary-color);
    transform: rotate(90deg);
  }

  &:active {
    transform: scale(0.95) rotate(90deg);
  }
`;

const SidebarLogo = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
`;

const SidebarLogoDiv = styled.div`
  display: flex;
  align-items: center;
  text-decoration: none;
  transition: transform 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: scale(1.05);
  }
`;

const SidebarLogoLink = styled(ScrollLink)`
  display: flex;
  align-items: center;
  text-decoration: none;
  transition: transform 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: scale(1.05);
  }
`;

const SidebarLogoImg = styled.img`
  height: 120px;
  object-fit: contain;

  /* Tablet */
  @media (min-width: 768px) and (max-width: 1023px) {
    height: 140px;
  }

  /* Mobile */
  @media (max-width: 767px) {
    height: 130px;
  }
`;

const SidebarNav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 3rem;
  flex: 1;
`;

const SidebarLink = styled(ScrollLink)`
  text-decoration: none;
  color: var(--text-color);
  font-size: 1.2rem;
  font-weight: 600;
  padding: 0.3rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
  font-family: var(--heading-font);

  &:hover {
    color: var(--primary-color);
    padding-left: 1rem;
  }
`;

const SidebarContact = styled.div`
  margin-bottom: 3rem;
  display: flex;
  justify-content: center;
`;

const SidebarSocial = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SocialTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 1rem;
  text-align: center;
`;

const SocialLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 1.5rem;
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  background: rgba(102, 211, 250, 0.1);
  border: 1px solid rgba(102, 211, 250, 0.2);
  border-radius: 50%;
  color: var(--primary-color);
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 1.2rem;

  &:hover {
    background: rgba(102, 211, 250, 0.2);
    border-color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 211, 250, 0.3);
  }
`;

const StyledLink = styled(ScrollLink)`
  text-decoration: none;
  position: relative;
  overflow: hidden;
  z-index: 2;
  font-size: 1rem;
  font-weight: 700;
  line-height: 1rem;
  text-transform: uppercase;
  color: inherit;
  font-family: var(--heading-font);
  cursor: pointer;

  /* Tablet */
  @media (min-width: 768px) and (max-width: 1023px) {
    font-size: 0.9rem;
    font-weight: 600;
    line-height: 0.9rem;
  }

  &::before,
  &::after {
    content: "";
    position: absolute;
    bottom: -0.5rem;
    height: 0.25rem;
    border-radius: 0.625rem;
    background: linear-gradient(137deg, #1edd8e 10%, #53c0d2 62%);
    will-change: transform;
    opacity: 1;
    transform: translateX(-3.125rem);
    transition: opacity 0.35s, transform 0.35s;
    left: 0;
    right: 0;

    /* Tablet */
    @media (min-width: 768px) and (max-width: 1023px) {
      bottom: -0.4rem;
    }
  }
`;

// Componentes para banderas de idioma
const LanguageFlags = styled.div`
  position: fixed;
  right: 2rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  z-index: 1400;
  opacity: ${props => props.$isScrolled ? 0 : 1};
  pointer-events: ${props => props.$isScrolled ? 'none' : 'auto'};
  transition: opacity 0.3s ease;
  
  /* Tablet */
  @media (min-width: 768px) and (max-width: 1023px) {
    right: 1.5rem;
    gap: 0.7rem;
  }
  
  /* Mobile */
  @media (max-width: 767px) {
    right: 1rem;
    gap: 0.6rem;
  }
`;

const FlagButton = styled.button`
  background: var(--background-color);
  border: 2px solid rgba(102, 211, 250, 0.4);
  border-radius: 4px;
  padding: 0;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 31px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  
  svg {
    width: 100%;
    height: 100%;
    display: block;
  }
  
  &:hover {
    border-color: var(--primary-color);
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(102, 211, 250, 0.5);
  }
  
  &:active {
    transform: scale(0.98);
  }
  
  /* Tablet */
  @media (min-width: 768px) and (max-width: 1023px) {
    width: 45px;
    height: 34px;
  }
  
  /* Mobile */
  @media (max-width: 767px) {
    width: 40px;
    height: 30px;
  }
`;

const SpanishFlag = styled(FlagButton)`
  /* Bandera de Argentina 🇦🇷 */
`;

const EnglishFlag = styled(FlagButton)`
  /* Bandera del Reino Unido 🇬🇧 */
`;

