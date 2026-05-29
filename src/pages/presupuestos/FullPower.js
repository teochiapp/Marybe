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

const FullPower = () => {
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
                                FullPower
                            </GradientText>
                        </Title>
                        <JobTitle>Plataforma E-commerce para Dylan</JobTitle>

                        <Subtitle>
                            Desarrollaremos una tienda online optimizada para vender suplementos deportivos de forma profesional. Esto incluye dos propuestas para decidir en base a los requerime
                        </Subtitle>

                        <FeatureGrid>
                            <Feature>
                                Gestión centralizada de productos, categorías y stock para administrar proteínas, creatinas y suplementos desde un panel simple.
                            </Feature>

                            <Feature>
                                Sistema de compra optimizado con carrito, pagos online y envíos integrados para facilitar las ventas online.
                            </Feature>
                        </FeatureGrid>
                    </LeftColumn>

                    <RightColumn>
                        <PhotoWrapper>
                            <ProfileCard
                                name="Full Power"
                                handle="fullpower"
                                status="Online"
                                contactText=""
                                avatarUrl="/presupuestos/fullpower.webp"
                                showUserInfo={false}
                                enableTilt={true}
                                className="full-cover-card yoga-logo-card"
                            />
                        </PhotoWrapper>
                    </RightColumn>
                </Hero>

                <PlansSection id="plans">
                    <SectionTitle>Planes Propuestos</SectionTitle>
                    <PlansGrid>
                        {/* Basic Plan */}
                        <PlanCard>
                            <PlanHeader>
                                <PlanTitle>Web Institucional (Pedidos vía WhatsApp + pago por Mercado Pago)</PlanTitle>
                                <PlanPrice>$490.000</PlanPrice>
                                <PlanDescription>Plataforma para presentar el negocio y los productos y recibir pedidos a través de WhatsApp.</PlanDescription>
                            </PlanHeader>
                            <PlanFeatures>
                                <PlanFeature>Diseño web profesional personalizado</PlanFeature>
                                <PlanFeature>Landing page de presentación del negocio</PlanFeature>
                                <PlanFeature>Catálogo de productos organizado por categorías</PlanFeature>
                                <PlanFeature>Página individual de cada suplemento con descripción y beneficios</PlanFeature>
                                <PlanFeature>Botón de compra rápida que envía el pedido por WhatsApp</PlanFeature>
                                <PlanFeature>Carrito de productos con envío automático al WhatsApp del negocio</PlanFeature>
                                <PlanFeature>Páginas institucionales: Nosotros, Contacto y Preguntas Frecuentes</PlanFeature>
                                <PlanFeature>Optimización para celulares y tablets</PlanFeature>
                                <PlanFeature>Panel simple para agregar o modificar productos</PlanFeature>
                                <PlanFeature>Integración con Google Maps y redes sociales</PlanFeature>
                                <PlanFeature>Optimización SEO básica para Google</PlanFeature>
                            </PlanFeatures>
                            <PlanFooter>
                                <FiClock /> Tiempo estimado: 2 semanas
                            </PlanFooter>
                        </PlanCard>

                        {/* Premium Plan */}
                        <PlanCard>
                            <BestValueBadge>Recomendado</BestValueBadge>
                            <PlanHeader>
                                <PlanTitle>Web + E-commerce</PlanTitle>
                                <PlanPrice>$690.000</PlanPrice>
                                <PlanDescription>Elaboración de una tienda online completa para la venta de productos con carrito de compras y pasarela de pago incluida.</PlanDescription>
                            </PlanHeader>
                            <PlanFeatures>
                                <PlanFeature>Todo lo incluido en el plan Web Catálogo</PlanFeature>
                                <PlanFeature>Tienda online completa con carrito de compras</PlanFeature>
                                <PlanFeature>Integración de pagos con tarjetas débito y crédito</PlanFeature>
                                <PlanFeature>Integración con Mercado Pago y otros medios de pago</PlanFeature>
                                <PlanFeature>Gestión de stock de productos</PlanFeature>
                                <PlanFeature>Panel administrativo para gestionar pedidos</PlanFeature>
                                <PlanFeature>Emails automáticos de confirmación de compra</PlanFeature>
                                <PlanFeature>Sistema de descuentos, cupones y promociones</PlanFeature>
                                <PlanFeature>Panel para gestión de clientes</PlanFeature>
                                <PlanFeature>Panel de estadísticas de ventas</PlanFeature>
                                <PlanFeature>Optimización SEO avanzada para posicionamiento en Google</PlanFeature>
                                <PlanFeature>Preparado para escalar a tienda grande</PlanFeature>
                            </PlanFeatures>

                            <PlanFooter>
                                <FiClock /> Tiempo estimado: 3 semanas
                            </PlanFooter>
                        </PlanCard>
                    </PlansGrid>

                    <MaintenanceBanner>
                        <BannerContent>
                            <BannerIcon><FiServer /></BannerIcon>
                            <BannerText>
                                <BannerTitle>Hosting Web (Plan Anual) (Opcional)</BannerTitle>
                                <BannerDescription>
                                    Hosting web de alto rendimiento administrado por nosotros.
                                    Incluye certificado SSL (HTTPS), copias de seguridad y soporte técnico directo ante cualquier eventualidad.
                                </BannerDescription>
                            </BannerText>
                            <PriceContainer>
                                <AnnualPrice>$3.000<span>/mes</span></AnnualPrice>
                                <MonthlyBreakdown>$36.000/año</MonthlyBreakdown>
                            </PriceContainer>
                        </BannerContent>
                    </MaintenanceBanner>

                    <MaintenanceBanner>
                        <BannerContent>
                            <BannerIcon><FiSettings /></BannerIcon>
                            <BannerText>
                                <BannerTitle>Mantenimiento Mensual (Opcional)</BannerTitle>
                                <BannerDescription>
                                    Nos encanta ver crecer los proyectos y acompañarlos en su evolución.
                                    Nuestro servicio de mantenimiento asegura que tu plataforma se mantenga fresca y con contenidos actualizados.
                                    Incluye actualizaciones visuales y técnicas, y soporte prioritario.
                                </BannerDescription>
                            </BannerText>
                            <PriceContainer>
                                <MonthlyBreakdown>$35.000/mes</MonthlyBreakdown>
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
                        Todo esto cubriría lo necesario para tener una plataforma funcional y fácil de utilizar. Con excepción del dominio que se vaya a usar (ejemplo: fullpower.com.ar o fullpower.com) que se debe comprar en cualquier registrador online.
                    </ClarificationText>
                    <ClarificationText>
                        En cuanto a los pagos, no cobramos el 100% por adelantado. Generalmente trabajamos con un pago inicial del 20%
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

export default FullPower;

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

const BestValueBadge = styled.div`
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--primary-color);
  color: var(--background-color, #0a0a0a);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  z-index: 2;
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
  display: flex;
  flex-direction: column;
  align-items: center;
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
  margin: 0 auto;
  max-width: 600px;
  text-align: center;
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

const PlansGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  max-width: 1100px;
  margin: 2rem auto 0;
  width: 100%;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;
const BannerIcon = styled.div`
  font-size: 2rem;
  color: var(--secondary-color);
  margin-bottom: 1rem;
`;