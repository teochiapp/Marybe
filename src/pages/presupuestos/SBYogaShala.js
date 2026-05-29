import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { FiSettings, FiExternalLink, FiClock, FiServer, FiLock, FiLayers, FiFileText, FiDatabase } from 'react-icons/fi';
import GradientText from '../../components/GradientText';
import ErrorBoundary from '../../components/ErrorBoundary';
import TresNochesHeader from './TresNochesHeader';
import ProfileCard from '../../components/extensions/ProfileCard';
import DarkVeil from '../../components/hero/extensions/DarkVeil';
import Footer from '../Footer';
import { translations } from '../../translations';
import LanguageContext from '../../contexts/LanguageContext';

const SBYogaShala = () => {
    // Helper to force Spanish context for Footer
    const spanishContextValue = {
        currentLanguage: 'es',
        isEnglish: false,
        t: (key, fallback) => {
            const keys = key.split('.');
            let value = translations.es;
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
        <SBYogaShalaContainer>
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

            <TresNochesHeader />

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
                                SB Yoga Shala
                            </GradientText>
                        </Title>
                        <JobTitle>Plataforma de Gestión de Clases</JobTitle>


                        <Subtitle>
                            Desarrollaremos una herramienta técnica diseñada específicamente para que los profesores Yoga puedan estructurar, guardar y compartir sus secuencias de manera visual e intuitiva.
                        </Subtitle>

                        <FeatureGrid>
                            <Feature>
                                Gestión centralizada de posturas y frases. El administrador puede actualizar el catálogo global para todos los docentes.
                            </Feature>
                            <Feature>
                                Creación de clases mediante módulos dinámicos y biblioteca visual de posturas y "fraseos" predefinidos.
                            </Feature>
                        </FeatureGrid>
                    </LeftColumn>

                    <RightColumn>
                        <PhotoWrapper>
                            <ProfileCard
                                name="SB Yoga Shala"
                                handle="sbyogashala"
                                status="Online"
                                contactText=""
                                avatarUrl="/presupuestos/sbyogashala-white.svg"
                                showUserInfo={false}
                                enableTilt={true}
                                className="full-cover-card yoga-logo-card"
                            />
                        </PhotoWrapper>
                    </RightColumn>
                </Hero>

                <PlansSection id="plans">
                    <SectionTitle>Propuesta de Desarrollo Integral</SectionTitle>
                    <SinglePlanWrapper>
                        <PlanCard>
                            <PlanHeader>
                                <PlanTitle>Plataforma SB Yoga Shala</PlanTitle>
                                <PlanPrice>$390.000</PlanPrice>
                                <PlanDescription>Desarrollo integral de la plataforma de secuenciación, incluyendo el constructor de clases, biblioteca gestionable y sistema de comunidad.</PlanDescription>
                            </PlanHeader>
                            <PlanFeatures>
                                <PlanFeature>Autenticación segura OTP sin contraseña (vía Email)</PlanFeature>
                                <PlanFeature>Sistema de Roles: Administrador y Profesores</PlanFeature>
                                <PlanFeature>Constructor Modular de clases (Drag & Drop)</PlanFeature>
                                <PlanFeature>Biblioteca de Posturas y Fraseos (Catálogo Visual)</PlanFeature>
                                <PlanFeature>Panel Admin: Gestión total de contenidos (Altas/Bajas de poses)</PlanFeature>
                                <PlanFeature>Exportación profesional a PDF de las secuencias</PlanFeature>
                                <PlanFeature>Biblioteca Pública para compartir contenido entre docentes</PlanFeature>
                                <PlanFeature>Perfil personalizado y gestión de clases privadas</PlanFeature>
                            </PlanFeatures>
                            <PlanFooter>
                                <FiClock /> Tiempo estimado: 8 a 10 semanas
                            </PlanFooter>
                        </PlanCard>
                    </SinglePlanWrapper>

                    <MaintenanceBanner>
                        <BannerContent>
                            <FiServer style={{ fontSize: '2.5rem' }} />
                            <BannerText>
                                <BannerTitle>Infraestructura y Base de Datos (Cloud) (Plan Anual)</BannerTitle>
                                <BannerDescription>
                                    Hosting de alta disponibilidad optimizado para aplicaciones web.
                                    Incluye base de datos PostgreSQL, almacenamiento de imágenes de posturas, certificado SSL y backups automáticos.
                                </BannerDescription>
                            </BannerText>
                            <PriceContainer>
                                <AnnualPrice>$3.750<span>/mes</span></AnnualPrice>
                                <MonthlyBreakdown>$45.000/año</MonthlyBreakdown>
                            </PriceContainer>
                        </BannerContent>
                    </MaintenanceBanner>

                    <MaintenanceBanner>
                        <BannerContent>
                            <FiSettings style={{ fontSize: '2.5rem' }} />
                            <BannerText>
                                <BannerTitle>Soporte Técnico, Mantenimiento y Mejora Continua</BannerTitle>
                                <BannerDescription>
                                    Nos encargamos de que la plataforma siempre funcione.
                                    Incluye actualizaciones de seguridad, corrección de bugs y ajustes menores en la biblioteca de posturas según sea necesario.
                                </BannerDescription>
                            </BannerText>
                            <PriceContainer>
                                <MonthlyBreakdown>A acordar</MonthlyBreakdown>
                            </PriceContainer>
                        </BannerContent>
                    </MaintenanceBanner>
                </PlansSection>

                <ClarificationsSection id="notices">
                    <SectionTitle>Información del Proyecto</SectionTitle>
                    <ClarificationText>
                        Queremos brindarte el mejor servicio posible, siendo totalmente transparentes con nuestro proceso.
                        Los precios listados se basan en el material proporcionado. Todo es opcional y ajustable a tus necesidades.
                    </ClarificationText>
                    <ClarificationText>
                        Todo esto cubriría lo necesario para tener una plataforma funcional y fácil de utilizar. Para el Dominio usaríamos el ya existente y necesitaríamos crear un subdominio para manejar todo desde allí.
                    </ClarificationText>
                    <ClarificationText>
                        En cuanto a los pagos, no cobramos el 100% por adelantado. Generalmente trabajamos con un pago inicial
                        para comenzar el proyecto y cubrir los gastos iniciales.
                        Una vez el cliente quede satisfecho con el resultado final, se realiza el pago restante.
                    </ClarificationText>
                </ClarificationsSection>

            </MainContent>


            <LanguageContext.Provider value={spanishContextValue}>
                <Footer />
            </LanguageContext.Provider>
        </SBYogaShalaContainer>
    );
};

export default SBYogaShala;

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

const SinglePlanWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
`;

const PlanCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:hover {
    transform: translateY(-5px);
    border-color: var(--primary-color);
    box-shadow: 0 10px 30px rgba(102, 211, 250, 0.1);
  }
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
  max-width: 1100px;
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

  svg {
      color: var(--secondary-color);
  }
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

const PriceContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;

  @media (max-width: 768px) {
    align-items: center;
    margin-top: 1rem;
    width: 100%;
  }
`;

const AnnualPrice = styled.div`
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--secondary-color);
  font-family: var(--heading-font);
  line-height: 1;

  span {
    font-size: 1rem;
    opacity: 0.8;
    font-weight: 400;
  }
`;

const MonthlyBreakdown = styled.div`
  font-size: 1rem;
  color: var(--secondary-color);
  opacity: 1;
  margin-top: 0.5rem;
  font-weight: 600;
`;

const SBYogaShalaContainer = styled.div`
  min-height: 100vh;
  width: 100%;
  background-color: #0a0a0a;
  color: #ffffff;
  position: relative;
  overflow-x: hidden;
  .yoga-logo-card .pc-card .pc-avatar-content .avatar {
    object-fit: contain !important;
    padding: 2.5rem;
    filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.2));
  }

  .yoga-logo-card .pc-card {
    background-image: radial-gradient(circle at center, rgba(117, 112, 71, 0.15) 0%, transparent 70%), var(--inner-gradient) !important;
  }
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
  font-size: 3.2rem;
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
