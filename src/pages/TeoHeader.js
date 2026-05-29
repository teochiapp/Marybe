import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Link as RouterLink } from "react-router-dom";
import { FiMenu, FiX, FiGithub, FiInstagram, FiMail, FiMessageCircle } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

function TeoHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }

    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [isOpen]);

  // Verificar que todas las secciones estén disponibles
  useEffect(() => {
    const checkSections = () => {
      console.log('=== Verificación de secciones ===');
      const hero = document.querySelector('#hero');
      const experiencia = document.querySelector('[data-section="experiencia"]');
      const proyectos = document.querySelector('[data-section="proyectos"]');
      const hobbies = document.querySelector('[data-section="hobbies"]');
      const contacto = document.querySelector('[data-section="contacto"]');
      
      console.log('Hero (inicio):', hero);
      console.log('Experiencia:', experiencia);
      console.log('Proyectos:', proyectos);
      console.log('Hobbies:', hobbies);
      console.log('Contacto:', contacto);
      
      // Verificar posiciones
      if (hero) console.log('Hero position:', hero.offsetTop);
      if (experiencia) console.log('Experiencia position:', experiencia.offsetTop);
      if (proyectos) console.log('Proyectos position:', proyectos.offsetTop);
      if (hobbies) console.log('Hobbies position:', hobbies.offsetTop);
      if (contacto) console.log('Contacto position:', contacto.offsetTop);
      
      console.log('===============================');
    };

    // Verificar después de que la página se cargue completamente
    if (document.readyState === 'complete') {
      setTimeout(checkSections, 500); // Delay para asegurar que todo esté renderizado
    } else {
      window.addEventListener('load', () => setTimeout(checkSections, 500));
      return () => window.removeEventListener('load', () => setTimeout(checkSections, 500));
    }
  }, []);

  const socialLinks = [
    {
      icon: <FiInstagram />,
      name: "Instagram",
      link: "https://instagram.com/teochiappero",
    },
    {
      icon: <FiGithub />,
      name: "GitHub",
      link: "https://github.com/teochiappero",
    },
    {
      icon: <FiMail />,
      name: "Email",
      link: "mailto:teochiapps@gmail.com",
    },
  ];

  const navItems = [
    { name: "Inicio", href: "#inicio" },
    { name: "Experiencia", href: "#experiencia" },
    { name: "Proyectos", href: "#proyectos" },
    { name: "Hobbies", href: "#hobbies" },
    { name: "Contacto", href: "#contacto" },
  ];

  const scrollToSection = (element, sectionName) => {
    if (!element) {
      console.error(`❌ Elemento no encontrado para: ${sectionName}`);
      return false;
    }

    const headerHeight = 120;
    const elementPosition = element.offsetTop;
    const offsetPosition = Math.max(0, elementPosition - headerHeight);

    console.log(`🎯 Scroll a ${sectionName}:`);
    console.log(`   - Posición del elemento: ${elementPosition}px`);
    console.log(`   - Posición con offset: ${offsetPosition}px`);
    console.log(`   - Altura del header: ${headerHeight}px`);

    // Scroll suave a la sección
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });

    return true;
  };

  const handleNavClick = (href) => {
    setIsOpen(false);
    
    if (href.startsWith('#')) {
      const sectionId = href.substring(1); // Remover el #
      let element;
      
      // Buscar la sección correspondiente
      if (sectionId === 'inicio') {
        element = document.querySelector('#hero');
      } else {
        element = document.querySelector(`[data-section="${sectionId}"]`);
      }
      
      if (element) {
        console.log(`✅ Navegando a ${sectionId}, elemento encontrado:`, element);
        
        // Usar la función de scroll mejorada
        setTimeout(() => {
          scrollToSection(element, sectionId);
        }, 150); // Delay para asegurar que el menú móvil se cierre
      } else {
        console.error(`❌ No se pudo encontrar la sección: ${sectionId}`);
        console.log('🔍 Elementos disponibles:', document.querySelectorAll('[data-section]'));
        console.log('🏠 Elemento hero:', document.querySelector('#hero'));
        
        // Fallback para inicio
        if (sectionId === 'inicio') {
          console.log('🔄 Fallback: scroll a inicio');
          setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }, 150);
        }
      }
    }
  };

  return (
    <HeaderContainer $isScrolled={isScrolled}>
      <HeaderContent>
        {/* Logo - Link a Home de SurCodes */}
        <LogoContainer $isScrolled={isScrolled}>
          <RouterLink to="/">
            <Logo src="/logo.png" alt="SurCodes" />
          </RouterLink>
        </LogoContainer>

        {/* Navigation Desktop */}
        <Navigation>
          {navItems.map((item, index) => (
            <NavItem
              key={index}
              onClick={() => handleNavClick(item.href)}
            >
              {item.name}
            </NavItem>
          ))}
        </Navigation>

        {/* Social Links Desktop */}
        <SocialContainer>
          {socialLinks.map((social, index) => (
            <SocialLink
              key={index}
              href={social.link}
              target="_blank"
              rel="noopener noreferrer"
              title={social.name}
            >
              {social.icon}
            </SocialLink>
          ))}
        </SocialContainer>

        {/* WhatsApp Button */}
        <WhatsAppButton
          href="https://wa.me/5493564361590"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
          </svg>
          <span>WhatsApp</span>
        </WhatsAppButton>

        {/* Mobile Menu Button */}
        <MobileMenuButton $isScrolled={isScrolled} onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FiX /> : <FiMenu />}
        </MobileMenuButton>
      </HeaderContent>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <MobileMenuOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <MobileMenu
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
            >
              <MobileMenuHeader>
                <MobileMenuTitle>
                  <img src="/logo.png" alt="SurCodes" style={{ height: '80px', width: 'auto' }} />
                </MobileMenuTitle>
                <MobileCloseButton onClick={() => setIsOpen(false)}>
                  <FiX />
                </MobileCloseButton>
              </MobileMenuHeader>

              <MobileNavigation>
                {navItems.map((item, index) => (
                  <MobileNavItem
                    key={index}
                    onClick={() => handleNavClick(item.href)}
                  >
                    {item.name}
                  </MobileNavItem>
                ))}
              </MobileNavigation>

              <MobileSocialContainer>
                <MobileSocialTitle>Seguime en:</MobileSocialTitle>
                <MobileSocialLinks>
                  {socialLinks.map((social, index) => (
                    <MobileSocialLink
                      key={index}
                      href={social.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {social.icon}
                      <span>{social.name}</span>
                    </MobileSocialLink>
                  ))}
                </MobileSocialLinks>
                
                <MobileWhatsAppButton
                  href="https://wa.me/5493564361590"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  <span>WhatsApp</span>
                </MobileWhatsAppButton>
              </MobileSocialContainer>
            </MobileMenu>
          </MobileMenuOverlay>
        )}
      </AnimatePresence>
    </HeaderContainer>
  );
}

export default TeoHeader;

// Styled Components
const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  transition: all 0.3s ease;
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem;
  font-family: var(--heading-font);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
    gap: 1rem;
  }
`;

const LogoContainer = styled.div`
  flex-shrink: 0;
  backdrop-filter: ${props => props.$isScrolled ? 'blur(15px)' : 'none'};
  -webkit-backdrop-filter: ${props => props.$isScrolled ? 'blur(15px)' : 'none'};
  border-radius: 20px;
  padding: 0.25rem;
  transition: all 0.3s ease;
  background: ${props => props.$isScrolled ? 'rgba(255, 255, 255, 0.05)' : 'transparent'};
  border: ${props => props.$isScrolled ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid transparent'};
  
  a {
    display: block;
    transition: all 0.3s ease;
    
    &:hover {
      transform: scale(1.05);
    }
  }
`;

const Logo = styled.img`
  height: 70px;
  width: auto;
  filter: brightness(1.1);

  @media (max-width: 768px) {
    height: 70px;
  }
`;

const Navigation = styled.nav`
  display: flex;
  align-items: center;
  gap: 2rem;
  flex: 1;
  justify-content: center;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavItem = styled.button`
  background: none;
  border: none;
  color: var(--text-color);
  font-family: var(--heading-font);
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    color: var(--secondary-color);
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 50%;
    width: 0;
    height: 2px;
    background: var(--primary-color);
    transition: all 0.3s ease;
    transform: translateX(-50%);
  }

  &:hover::after {
    width: 80%;
  }
`;

const SocialContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: var(--text-color);
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);

  &:hover {
    color: var(--primary-color);
    background: rgba(102, 211, 250, 0.2);
    border-color: var(--primary-color);
    transform: translateY(-2px);
  }

  svg {
    font-size: 1.1rem;
  }
`;

const WhatsAppButton = styled.a`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #25D366, #128C7E);
  color: white;
  text-decoration: none;
  border-radius: 25px;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  border: none;
  box-shadow: 0 4px 15px rgba(37, 211, 102, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(37, 211, 102, 0.4);
    background: linear-gradient(135deg, #128C7E, #25D366);
  }

  svg {
    font-size: 1.1rem;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: var(--text-color);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  transition: all 0.3s ease;
  backdrop-filter: ${props => props.$isScrolled ? 'blur(15px)' : 'none'};
  -webkit-backdrop-filter: ${props => props.$isScrolled ? 'blur(15px)' : 'none'};
  border-radius: 20px;
  padding: 0.5rem;
  background: ${props => props.$isScrolled ? 'rgba(255, 255, 255, 0.05)' : 'transparent'};
  border: ${props => props.$isScrolled ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid transparent'};
  align-items: center;
  justify-content: center;

  &:hover {
    color: var(--primary-color);
    background: ${props => props.$isScrolled ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)'};
    border-color: rgba(255, 255, 255, 0.2);
  }

  @media (max-width: 768px) {
    display: flex;
  }
`;

const MobileMenuOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: none;

  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileMenu = styled(motion.div)`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 300px;
  background: var(--background-color);
  backdrop-filter: blur(20px);
  border-left: 1px solid rgba(102, 211, 250, 0.3);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const MobileMenuHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const MobileMenuTitle = styled.h3`
  color: var(--primary-color);
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
`;

const MobileCloseButton = styled.button`
  background: none;
  border: none;
  color: var(--text-color);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
`;

const MobileNavigation = styled.nav`
  flex: 1;
  padding: 1rem 0;
`;

const MobileNavItem = styled.button`
  width: 100%;
  background: none;
  border: none;
  color: var(--text-color);
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  padding: 1rem 1.5rem;
  text-align: left;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;

  &:hover {
    color: var(--primary-color);
    background: rgba(102, 211, 250, 0.1);
    border-left-color: var(--primary-color);
  }
`;

const MobileSocialContainer = styled.div`
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const MobileSocialTitle = styled.h4`
  color: var(--primary-color);
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
`;

const MobileSocialLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const MobileSocialLink = styled.a`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-color);
  text-decoration: none;
  padding: 0.75rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);

  &:hover {
    color: var(--primary-color);
    background: rgba(102, 211, 250, 0.1);
    border-color: var(--primary-color);
  }

  svg {
    font-size: 1.2rem;
  }

  span {
    font-weight: 500;
  }
`;

const MobileWhatsAppButton = styled.a`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: linear-gradient(135deg, #25D366, #128C7E);
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
  text-align: center;
  justify-content: center;

  &:hover {
    background: linear-gradient(135deg, #128C7E, #25D366);
    transform: translateY(-2px);
  }

  svg {
    font-size: 1.2rem;
  }
`;
