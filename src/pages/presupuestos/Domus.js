import React from 'react';
import styled, { keyframes } from 'styled-components';
import { FiSettings, FiClock, FiServer } from 'react-icons/fi';
import GradientText from '../../components/GradientText';

import TresNochesHeader from './TresNochesHeader';
import ProfileCard from '../../components/extensions/ProfileCard';
import DarkVeil from '../../components/hero/extensions/DarkVeil';
import Footer from '../Footer';
import { translations } from '../../translations';
import LanguageContext from '../../contexts/LanguageContext';

const Domus = () => {
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

  // Handle hash navigation to sections
  React.useEffect(() => {
    const handleLinkClick = (e) => {
      const target = e.target.closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href || !href.startsWith('#')) return;

      const localSections = ['#hero', '#plans', '#notices', '#about'];

      if (localSections.includes(href)) {
        e.preventDefault();
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        e.preventDefault();
        window.location.href = `/${href}`;
      }
    };

    document.addEventListener('click', handleLinkClick);
    return () => document.removeEventListener('click', handleLinkClick);
  }, []);

  return (
    <DomusContainer>
      <RippleBackground>
        <DarkVeil
          hueShift={120} // Adjusted for a green/blue tint
          noiseIntensity={0.0}
          scanlineIntensity={0}
          speed={1.0}
          scanlineFrequency={0.5}
          warpAmount={0.1}
          resolutionScale={1}
        />
      </RippleBackground>

      <TresNochesHeader />

      <MainContent>
        {/* Hero Section */}
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
                animationSpeed={4}
                showBorder={false}
                className="custom-class"
              >
                Constructora Domus
              </GradientText>
            </Title>

            <JobTitle>Reestructuración Web e Integración Interactiva 3D</JobTitle>

            <DescriptionText>
              Reestructuramos la web actual para incorporar tecnología 3D arquitectónica de vanguardia. 
              Desarrollamos una plataforma diseñada para que los clientes puedan realizar recorridos interactivos completos, 
              visitando cada casa tanto en su diseño exterior como en su distribución interior en 360° con una experiencia fluida.
            </DescriptionText>

             <FeatureGrid>
              <Feature>
                Paso 1: Reestructuración Web + Cambios de Diseño</Feature>
              <Feature>
                Paso 2:Implementación de Diseños 3D Interactivos</Feature>
            </FeatureGrid>


          </LeftColumn>

          <RightColumn>
            <PhotoWrapper>
              <ProfileCard
                name="Constructora Domus"
                handle="constructoradomus"
                status="Proyectos Activos"
                contactText="Ver Web"
                avatarUrl="/presupuestos/domus.png"
                showUserInfo={false}
                enableTilt={true}
                className="full-cover-card domus-logo-card"
              />
            </PhotoWrapper>
          </RightColumn>
        </Hero>


        <PlansSection id="plans">
          <SectionTitle>Plan de Desarrollo Web</SectionTitle>
          <PlansGrid>
            {/* Plan 1 */}
            <PlanCard>
              <PlanHeader>
                <PlanTitle>Reestructuración Web + Cambios de Diseño</PlanTitle>
                <PlanPrice>$350.000</PlanPrice>
                <PlanDescription>
                  Rediseño y reestructuración del sitio web institucional para modernizarlo y sentar las bases de rendimiento necesarias, manteniendo y mejorando las funcionalidades actuales.
                </PlanDescription>
              </PlanHeader>
              
              <PlanFeatures>
                <PlanFeature>Diseño visual premium alineado a la paleta verde y azul de Constructora Domus</PlanFeature>
                <PlanFeature>Reestructuración completa del sitio web institucional con arquitectura moderna</PlanFeature>
                <PlanFeature>Portafolio dinámico de obras residenciales, comerciales e industriales</PlanFeature>
                <PlanFeature>Gestor de Contenidos (CMS) autoadministrable para la carga independiente de proyectos</PlanFeature>
                <PlanFeature>Optimización técnica avanzada de velocidad de carga para recursos gráficos</PlanFeature>
                <PlanFeature>SEO inicial optimizado y configuración de certificado de seguridad SSL</PlanFeature>
                <PlanFeature>Adaptabilidad fluida en dispositivos móviles, tablets y computadoras (Responsive)</PlanFeature>
                <PlanFeature>Etapa completa de revisiones y feedback para ajustes estéticos iniciales</PlanFeature>
              </PlanFeatures>

              <PlanFooter>
                <FiClock /> Tiempo estimado: 1 semana y media
              </PlanFooter>
            </PlanCard>

            {/* Plan 2 */}
            <PlanCard>
              <PlanHeader>
                <PlanTitle>Implementación de Diseños 3D Interactivos</PlanTitle>
                <PlanPrice>$600.000</PlanPrice>
                <PlanDescription>
                  Integración técnica de tecnología tridimensional para realizar visitas virtuales completas.
                </PlanDescription>
              </PlanHeader>
              
              <PlanFeatures>
                <PlanFeature>Implementación de visualizadores y renders 3D interactivos optimizados para web</PlanFeature>
                <PlanFeature>Visitas virtuales 360° interactivas por el interior y exterior de las viviendas</PlanFeature>
                <PlanFeature>Optimización del pipeline para que los Diseñadores 3D carguen sus modelos con fluidez</PlanFeature>
                <PlanFeature>Soporte para múltiples formatos 3D interactivos (glTF, OBJ, WebGL/Three.js)</PlanFeature>
                <PlanFeature>Compresión avanzada de assets para garantizar navegación fluida en celulares y tablets</PlanFeature>
                <PlanFeature>Fichas técnicas enriquecidas e interactivas para planos e integraciones 3D de cada obra</PlanFeature>
                <PlanFeature>Coordinación técnica uno a uno con el equipo de Diseñadores 3D para la puesta a punto base</PlanFeature>
                <PlanFeature>Pruebas de usabilidad y velocidad en dispositivos táctiles ante alta carga de procesamiento gráfico</PlanFeature>
              </PlanFeatures>

              <PlanFooter>
                <FiClock /> Tiempo estimado: 3 semanas
              </PlanFooter>
            </PlanCard>
          </PlansGrid>

          {/* Banners */}
          <MaintenanceBanner>
            <BannerContent>
              <BannerIcon><FiServer /></BannerIcon>
              <BannerText>
                <BannerTitle>Hosting Web Dedicado (Plan Anual)</BannerTitle>
                <BannerDescription>
                  Servidor dedicado y optimizado específicamente para procesar y renderizar modelos 3D y texturas pesadas a gran velocidad. 
                  Incluye certificado SSL seguro (HTTPS), backups periódicos de resguardo y soporte directo.
                </BannerDescription>
              </BannerText>
              <PriceContainer>
                <MonthlyBreakdown>$40.000/año</MonthlyBreakdown>
              </PriceContainer>
            </BannerContent>
          </MaintenanceBanner>

          <MaintenanceBanner>
            <BannerContent>
              <BannerIcon><FiSettings /></BannerIcon>
              <BannerText>
                <BannerTitle>Soporte Técnico & Mantenimiento Activo (Opcional)</BannerTitle>
                <BannerDescription>
                  Asistencia y colaboración técnica mensual destinada principalmente a los Diseñadores 3D, facilitando la integración de sus nuevos modelos 3D, optimización gráfica y mantenimiento preventivo.
                </BannerDescription>
              </BannerText>
              <PriceContainer>
                <MonthlyBreakdown>A acordar</MonthlyBreakdown>
              </PriceContainer>
            </BannerContent>
          </MaintenanceBanner>
        </PlansSection>

        {/* Section: Clarifications */}
        <ClarificationsSection id="notices">
          <SectionTitle>Información del Proyecto</SectionTitle>
          <ClarificationText>
            Queremos brindarte el mejor servicio posible, siendo totalmente transparentes con nuestro proceso de desarrollo.
            Los precios listados se enfocan en crear una plataforma robusta preparada para que el equipo de diseñadores 3D cargue sus modelos con total fluidez.
          </ClarificationText>
          <ClarificationText>
            El costo del desarrollo web no incluye el hosting, el cual tiene un valor anual de $40.000 para garantizar la infraestructura estable y rápida que requiere el procesamiento de renders y visitas interactivas 360°.
          </ClarificationText>
          
        </ClarificationsSection>
      </MainContent>


      <LanguageContext.Provider value={spanishContextValue}>
        <Footer />
      </LanguageContext.Provider>
    </DomusContainer>
  );
};

export default Domus;

// Animaciones
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

// Styled Components
const DomusContainer = styled.div`
  min-height: 100vh;
  width: 100%;
  background-color: #050811;
  color: #ffffff;
  position: relative;
  overflow-x: hidden;

  /* Custom Theme variables locally */
  --primary-color: #8de33b;
  --secondary-color: #4a75ff;
  --accent-color: #00c1ff;
  --text-color: #E6E6E6;

  .domus-logo-card .pc-card .pc-avatar-content .avatar {
    object-fit: contain !important;
    padding: 2.5rem;
    filter: drop-shadow(0 0 25px rgba(141, 227, 59, 0.3));
  }

  .domus-logo-card .pc-card {
    background-image: radial-gradient(circle at center, rgba(47, 80, 192, 0.15) 0%, transparent 70%), var(--behind-gradient) !important;
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
  grid-template-columns: 1.2fr 0.8fr;
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
  gap: 1.5rem;
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
  letter-spacing: 2px;

  @media (max-width: 768px) {
    font-size: 3rem;
  }

  @media (max-width: 480px) {
    font-size: 2.3rem;
    letter-spacing: 1px;
  }
`;

const JobTitle = styled.h2`
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--primary-color);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-family: var(--heading-font);

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const DescriptionText = styled.p`
  font-size: 1.1rem;
  font-weight: 400;
  color: var(--text-color);
  margin: 0;
  opacity: 0.85;
  line-height: 1.6;
  text-align: justify;

  @media (max-width: 768px) {
    font-size: 1rem;
    text-align: center;
  }
`;

const PhotoWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  animation: ${float} 6s ease-in-out infinite;
`;

const SectionTitle = styled.h3`
  font-size: 2.5rem;
  color: var(--primary-color);
  text-align: center;
  margin-bottom: 3rem;
  font-family: var(--heading-font);
`;


// Plans Section
const PlansSection = styled.section`
  margin-top: 5rem;
  margin-bottom: 5rem;
  width: 100%;
`;

const PlansGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2.5rem;
  max-width: 1100px;
  margin: 2rem auto 0;
  width: 100%;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const PlanCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all 0.3s ease;
  backdrop-filter: blur(15px);
  width: 100%;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);

  &:hover {
    transform: translateY(-5px);
    border-color: var(--primary-color);
    box-shadow: 0 15px 40px rgba(121, 193, 67, 0.15);
  }

  @media (max-width: 768px) {
    padding: 2rem;
  }
`;

const BestValueBadge = styled.div`
  position: absolute;
  top: -14px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: #ffffff;
  padding: 0.6rem 1.5rem;
  border-radius: 30px;
  font-weight: 700;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 4px 15px rgba(47, 80, 192, 0.3);
`;

const PlanHeader = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const PlanTitle = styled.h4`
  font-size: 1.8rem;
  color: #ffffff;
  margin-bottom: 1.2rem;
  font-family: var(--heading-font);
  line-height: 1.3;
`;

const PlanPrice = styled.div`
  font-size: 4rem;
  font-weight: 800;
  color: var(--primary-color);
  margin-bottom: 0.8rem;
  font-family: var(--heading-font);
  letter-spacing: -1px;

  @media (max-width: 480px) {
    font-size: 3rem;
  }
`;

const PlanDescription = styled.p`
  color: var(--text-color);
  opacity: 0.8;
  font-size: 1.05rem;
  margin: 0 auto;
  max-width: 700px;
  text-align: center;
  line-height: 1.6;
`;

const PlanFeatures = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 2.5rem 0;
  flex-grow: 1;

  &.dual-column {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 2.5rem;
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 0;
    }
  }
`;

const PlanFeature = styled.li`
  margin-bottom: 1.2rem;
  color: var(--text-color);
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 1.05rem;
  opacity: 0.95;
  line-height: 1.4;

  &::before {
    content: '✓';
    color: var(--primary-color);
    font-weight: bold;
    font-size: 1.1rem;
    margin-top: 1px;
  }
`;

const PlanFooter = styled.div`
  margin-top: auto;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 1rem;
  color: var(--text-color);
  opacity: 0.85;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
  
  svg {
    color: var(--primary-color);
    font-size: 1.2rem;
  }
`;

const MaintenanceBanner = styled.div`
  max-width: 1000px;
  margin: 2rem auto 0;
  background: linear-gradient(135deg, rgba(47, 80, 192, 0.1), rgba(121, 193, 67, 0.05));
  border: 1px solid rgba(47, 80, 192, 0.2);
  border-radius: 20px;
  padding: 1.8rem;
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
  color: var(--primary-color);
  display: flex;
  align-items: center;
`;

const BannerText = styled.div`
  flex: 1;
`;

const BannerTitle = styled.h4`
  color: #ffffff;
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
  font-family: var(--heading-font);
`;

const BannerDescription = styled.p`
  color: var(--text-color);
  margin: 0;
  font-size: 0.95rem;
  opacity: 0.85;
  max-width: 100%;
  line-height: 1.6;
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

const MonthlyBreakdown = styled.div`
  font-size: 1.3rem;
  color: var(--primary-color);
  font-weight: 700;
  font-family: var(--heading-font);
`;

// Clarifications Section
const ClarificationsSection = styled.section`
  margin-top: 5rem;
  margin-bottom: 3rem;
  padding-top: 3rem;
  padding-bottom: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const ClarificationText = styled.p`
  color: var(--text-color);
  opacity: 0.75;
  font-size: 1.05rem;
  line-height: 1.7;
  margin-bottom: 1.5rem;
  max-width: 850px;
  margin-left: auto;
  margin-right: auto;
  text-align: justify;

  @media (max-width: 768px) {
    text-align: left;
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
