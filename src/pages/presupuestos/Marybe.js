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

const VillaMarAlimentos = () => {
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
    <VillaMarAlimentosContainer>
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
                Perfumería Marybe
              </GradientText>
            </Title>

            <JobTitle>Desarrollo de E-commerce</JobTitle>

            <Subtitle>
              Desarrollamos una plataforma de e-commerce completa, elegante y moderna para potenciar las ventas online de Marybe, con catálogo amplio, múltiples categorías y una experiencia de compra profesional.
            </Subtitle>

            <FeatureGrid>

              <Feature>
                Alto impacto visual para exhibir sus productos y experiencia de usuario optimizada para dispositivos móviles (responsive) y carrito de compras integrado, facilitando las ventas desde cualquier lugar.
              </Feature>
              <Feature>
                Panel de administración intuitivo para gestionar productos, precios, stock e imágenes sin conocimientos técnicos.
              </Feature>
            </FeatureGrid>

          </LeftColumn>

          <RightColumn>
            <PhotoWrapper>
              <ProfileCard
                name="Perfumería Marybe"
                handle="PerfumeriaMarybe"
                status="Online"
                contactText=""
                avatarUrl="/presupuestos/Marybee.png"
                showUserInfo={false}
                enableTilt={true}
                className="full-cover-card marybe-logo-card"
              />
            </PhotoWrapper>
          </RightColumn>
        </Hero>

        <PlansSection id="plans">
          <SectionTitle>Planes Propuestos</SectionTitle>
          <PlansGrid>
            <PlanCard>
              <PlanHeader>
                <PlanTitle>E-Commerce Institucional — Perfumería Marybe</PlanTitle>
                <PlanPrice>$750.000</PlanPrice>
                <PlanDescription>Plataforma de venta online completa para una perfumería multi-categoría con catálogo amplio, múltiples secciones y experiencia de compra profesional.</PlanDescription>
              </PlanHeader>
              <PlanFeatures>
                <PlanFeature>Desarrollo en base a diseño creado por Mutanto — identidad acorde a la marca Marybe (elegante, femenino/masculino, moderno)</PlanFeature>
                <PlanFeature>Configuración e arquitectura inicial — estructura pensada para perfumería con alto volumen de productos</PlanFeature>
                <PlanFeature>Home / Landing Page + Header & Footer — banners, destacados, ofertas y novedades</PlanFeature>
                <PlanFeature>Catálogo con Categorías — Fragancias Mujer, Fragancias Hombre, Maquillaje, Skincare, Capilar, Bebé, Higiene, Limpieza del Hogar</PlanFeature>
                <PlanFeature>Filtros y búsqueda de productos — por categoría, marca, precio y género</PlanFeature>
                <PlanFeature>Página individual de cada Producto — fotos, descripción, precio, stock y botón de compra</PlanFeature>
                <PlanFeature>Carrito de compras y Checkout — proceso de pago integrado (MercadoPago / WhatsApp / Transferencia)</PlanFeature>
                <PlanFeature>Página de Tienda Online, Quienes Somos, Sucursales, Contacto</PlanFeature>
                <PlanFeature>Desarrollo Responsive — adaptado a Mobile, Tablet y Desktop</PlanFeature>
                <PlanFeature>Panel de administración — carga y edición de productos, precios, stock e imágenes sin conocimientos técnicos</PlanFeature>
                <PlanFeature>Optimización SEO y Seguridad — posicionamiento en Google, HTTPS, protección básica</PlanFeature>
                <PlanFeature>Integración con redes sociales — Instagram, Facebook, WhatsApp</PlanFeature>
                <PlanFeature>Subida a Hosting e implementación web</PlanFeature>
              </PlanFeatures>
              <PlanFooter>
                <FiClock /> Tiempo estimado: 2 semanas y media
              </PlanFooter>
            </PlanCard>

            <PlanCard>
              <BestValueBadge>Recomendado</BestValueBadge>
              <PlanHeader>
                <PlanTitle>E-Commerce Institucional — Perfumería Marybe + Carga de Productos</PlanTitle>
                <PlanPrice>$890.000</PlanPrice>
                <PlanDescription>Plataforma de venta online completa para una perfumería multi-categoría con catálogo amplio, múltiples secciones y experiencia de compra profesional.</PlanDescription>
              </PlanHeader>
              <PlanFeatures>
                <PlanFeature>Carga de hasta 5000 productos iniciales </PlanFeature>
                <PlanFeature>Primer mes de Soporte y Mantenimiento Integral bonificado</PlanFeature>
                <PlanFeature>Desarrollo en base a diseño creado por Mutanto — identidad acorde a la marca Marybe (elegante, femenino/masculino, moderno)</PlanFeature>
                <PlanFeature>Configuración e arquitectura inicial — estructura pensada para perfumería con alto volumen de productos</PlanFeature>
                <PlanFeature>Home / Landing Page + Header & Footer — banners, destacados, ofertas y novedades</PlanFeature>
                <PlanFeature>Catálogo con Categorías — Fragancias Mujer, Fragancias Hombre, Maquillaje, Skincare, Capilar, Bebé, Higiene, Limpieza del Hogar</PlanFeature>
                <PlanFeature>Filtros y búsqueda de productos — por categoría, marca, precio y género</PlanFeature>
                <PlanFeature>Página individual de cada Producto — fotos, descripción, precio, stock y botón de compra</PlanFeature>
                <PlanFeature>Carrito de compras y Checkout — proceso de pago integrado (MercadoPago / WhatsApp / Transferencia)</PlanFeature>
                <PlanFeature>Página de Tienda Online, Quienes Somos, Sucursales, Contacto</PlanFeature>
                <PlanFeature>Desarrollo Responsive — adaptado a Mobile, Tablet y Desktop</PlanFeature>
                <PlanFeature>Panel de administración — carga y edición de productos, precios, stock e imágenes sin conocimientos técnicos</PlanFeature>
                <PlanFeature>Optimización SEO y Seguridad — posicionamiento en Google, HTTPS, protección básica</PlanFeature>
                <PlanFeature>Integración con redes sociales — Instagram, Facebook, WhatsApp</PlanFeature>
                <PlanFeature>Subida a Hosting e implementación web</PlanFeature>

              </PlanFeatures>
              <PlanFooter>
                <FiClock /> Tiempo estimado: 2 semanas y media
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
                <AnnualPrice>$2.500<span>/mes</span></AnnualPrice>
                <MonthlyBreakdown>$30.000/año</MonthlyBreakdown>
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
                  Incluye actualizaciones visuales y técnicas, y soporte prioritario ante cualquier duda.
                </BannerDescription>
              </BannerText>
              <PriceContainer>
                <MonthlyBreakdown>$30.000/mes</MonthlyBreakdown>
              </PriceContainer>
            </BannerContent>
          </MaintenanceBanner>
        </PlansSection>

        <ClarificationsSection id="notices">
          <SectionTitle>Información Extra</SectionTitle>
          <ClarificationText>
            Queremos brindarte el mejor servicio posible, siendo totalmente transparentes con nuestro proceso.
            Los precios listados se basan en el material proporcionado. Todo es opcional y ajustable a tus necesidades.
          </ClarificationText>
        </ClarificationsSection>

      </MainContent>


      <LanguageContext.Provider value={spanishContextValue}>
        <Footer />
      </LanguageContext.Provider>
    </VillaMarAlimentosContainer>
  );
};

export default VillaMarAlimentos;

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

const SingleCardWrapper = styled.div`
  max-width: 780px;
  margin: 0 auto;
  width: 100%;
`;


const PlanCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(102, 211, 250, 0.1);
  }
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

const HighlightedPlanFeature = styled.li`
  margin-top: 1rem;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 1.05rem;
  font-weight: 600;
  background: rgba(102, 211, 250, 0.1);
  border: 1px solid var(--primary-color);
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 4px 15px rgba(102, 211, 250, 0.15);
  margin-bottom: 1rem;
  &::before {
    content: '⭐';
    font-size: 1.2rem;
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
  color: var(--text-color);
  opacity: 0.7;
  margin-top: 0.5rem;
  font-weight: 500;
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

const VillaMarAlimentosContainer = styled.div`
  min-height: 100vh;
  width: 100%;
  background-color: #0a0a0a;
  color: #ffffff;
  position: relative;
  overflow-x: hidden;

  .marybe-logo-card .pc-card .pc-avatar-content .avatar {
    object-fit: contain !important;
    padding: 3rem;
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
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
  text-align: justify;

  @media (max-width: 768px) {
    text-align: left;
  }
`;
