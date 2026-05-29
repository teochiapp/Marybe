import React from 'react'
import styled from 'styled-components'
import { FiHeart } from 'react-icons/fi'
import FooterLogo from '../components/footer/FooterLogo'
import FooterNav from '../components/footer/FooterNav'
import FooterSocial from '../components/footer/FooterSocial'
import FooterContact from '../components/footer/FooterContact'

import { useLanguage } from '../contexts/LanguageContext'

const Footer = () => {
  const { t } = useLanguage()
  const currentYear = new Date().getFullYear()



  return (
    <FooterContainer>
      <FooterContent>
        {/* Sección Principal */}
        <MainSection>
          <BrandSection>
            <FooterLogo />
            <BrandDescription>
              {t('footer.brandDescription', 'Transformamos ideas en experiencias digitales excepcionales. Especialistas en desarrollo web, móvil y soluciones tecnológicas.')}
            </BrandDescription>
          </BrandSection>

          <LinksSection>
            <LinksColumn>
              <ColumnTitle>{t('footer.menu', 'Menú')}</ColumnTitle>
              <FooterNav column={true} gap="0.3rem" />
            </LinksColumn>

            <LinksColumn>
              <FooterContact />
            </LinksColumn>

            <LinksColumn>
              <ColumnTitle>{t('footer.followUs', 'Síguenos')}</ColumnTitle>
              <FooterSocial />
            </LinksColumn>
          </LinksSection>
        </MainSection>

        {/* Línea divisoria */}
        <Divider />

        {/* Sección inferior */}
        <BottomSection>
          <Copyright>
            © {currentYear} SurCodes. {t('footer.rights', 'Todos los derechos reservados.')}
          </Copyright>
          <MadeWith>
            {t('footer.madeWith', 'Hecho con')} <HeartIcon><FiHeart /></HeartIcon> {t('footer.in', 'en')} Argentina
          </MadeWith>
        </BottomSection>
      </FooterContent>
    </FooterContainer>
  )
}

export default Footer

const FooterContainer = styled.footer`
  background-color: var(--background-color);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  width: 100%;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--primary-color), var(--secondary-color), transparent);
    background-size: 200% 100%;
    animation: gradientMove 3s ease-in-out infinite;
  }

  @keyframes gradientMove {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
`

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem 2rem;
`

const MainSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 4rem;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`

const BrandSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: self-start;
`



const BrandDescription = styled.p`
  color: var(--text-color);
  opacity: 0.8;
  line-height: 1.6;
  margin: 0;
`

const LinksSection = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`

const LinksColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: self-start;
`

const ColumnTitle = styled.h4`  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 1.5rem;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -0.5rem;
    left: 0;
    width: 2rem;
    height: 2px;
    background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
    border-radius: 1px;
  }
`



const Divider = styled.div`
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  margin: 2rem 0;
`

const BottomSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`

const Copyright = styled.p`
  color: var(--text-color);
  opacity: 0.7;
  font-size: 0.9rem;
  margin: 0;
`

const MadeWith = styled.p`
  color: var(--text-color);
  opacity: 0.7;
  font-size: 0.9rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const HeartIcon = styled.span`
  color: var(--secondary-color);
  animation: heartbeat 2s ease-in-out infinite;

  @keyframes heartbeat {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
`

