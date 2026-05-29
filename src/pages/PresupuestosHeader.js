import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FiMenu, FiX, FiMail } from "react-icons/fi"; // Removed Instagram/Github icons
import { motion, AnimatePresence } from "framer-motion";

function PresupuestosHeader() {
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

  // Prevent scroll when menu is open
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

  return (
    <HeaderContainer $isScrolled={isScrolled}>
      <HeaderContent>
        {/* Logo - Link to Home */}
        <LogoContainer $isScrolled={isScrolled}>
          <a href="/#home">
            <Logo src="/logo.png" alt="SurCodes" />
          </a>
        </LogoContainer>



        {/* Navigation Links (Desktop) */}
        <NavLinks>
          <NavLink href="#hero">Intro</NavLink>
          <NavLink href="#plans">Plans</NavLink>
          <NavLink href="#notices">Notices</NavLink>
        </NavLinks>

        {/* WhatsApp Button */}
        <WhatsAppButton
          href="https://wa.me/5493564361590"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
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



              <MobileNavLinks>
                <MobileNavLink href="#hero" onClick={() => setIsOpen(false)}>Intro</MobileNavLink>
                <MobileNavLink href="#plans" onClick={() => setIsOpen(false)}>Plans</MobileNavLink>
                <MobileNavLink href="#notices" onClick={() => setIsOpen(false)}>Notices</MobileNavLink>
              </MobileNavLinks>

              <MobileSocialContainer>
                <MobileWhatsAppButton
                  href="https://wa.me/5493564361590"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                  </svg>
                  <span>WhatsApp</span>
                </MobileWhatsAppButton>
              </MobileSocialContainer>
            </MobileMenu>
          </MobileMenuOverlay >
        )
        }
      </AnimatePresence >
    </HeaderContainer >
  );
}

export default PresupuestosHeader;

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

const MobileSocialContainer = styled.div`
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
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

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled.a`
  color: var(--text-color);
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  opacity: 0.8;

  &:hover {
    color: var(--primary-color);
    opacity: 1;
    transform: translateY(-1px);
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 0;
    height: 2px;
    background: var(--primary-color);
    transition: width 0.3s ease;
  }

  &:hover::after {
    width: 100%;
  }
`;

const MobileNavLinks = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem 0;
`;

const MobileNavLink = styled.a`
  padding: 1rem 1.5rem;
  color: var(--text-color);
  text-decoration: none;
  font-size: 1.1rem;
  font-weight: 500;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: var(--primary-color);
    border-left-color: var(--primary-color);
    padding-left: 2rem;
  }
`;
