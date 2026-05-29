import React from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { FiCode, FiDatabase, FiSettings, FiServer, FiTrendingUp, FiShield } from 'react-icons/fi'
import GradientText from '../GradientText'
import { useLanguage } from '../../contexts/LanguageContext';

function Services() {
  const { t } = useLanguage();

  const services = [
    {
      icon: <FiCode />,
      title: t('services.webDev.title', 'Desarrollo Web'),
      description: t('services.webDev.description', 'Creamos sitios web modernos y responsivos con las últimas tecnologías. Desde landing pages hasta aplicaciones web complejas.'),
      features: t('services.webDev.features', ["React", "Wordpress", "Diseño Responsivo", "CMS", "Diseño"])
    },
    {
      icon: <FiDatabase />,
      title: t('services.systems.title', 'Sistemas y Bases de Datos'),
      description: t('services.systems.description', 'Desarrollamos la lógica interna de tu aplicación y gestionamos toda la información de manera segura y eficiente.'),
      features: t('services.systems.features', ["Bases de Datos", "Sistemas", "APIs", "Integraciones"])
    },
    {
      icon: <FiShield />,
      title: t('services.audit.title', 'Auditoría de Sistemas'),
      description: t('services.audit.description', 'Revisamos tu sitio web o sistema para detectar vulnerabilidades y mejorar la seguridad antes de que puedan ser aprovechadas.'),
      features: t('services.audit.features', [
        "OWASP Top 10",
        "Análisis de Vulnerabilidades",
        "Hardening Web",
        "WordPress & APIs"
      ])
    },
    {
      icon: <FiSettings />,
      title: t('services.maintenance.title', 'Mantenimiento'),
      description: t('services.maintenance.description', 'Mantenemos y actualizamos tus aplicaciones web y móviles para garantizar su funcionamiento óptimo y seguridad continua.'),
      features: t('services.maintenance.features', ["Actualizaciones", "Backups", "Monitoreo", "Soporte Técnico"])
    },
    {
      icon: <FiTrendingUp />,
      title: t('services.optimization.title', 'Optimización'),
      description: t('services.optimization.description', 'Optimizamos el rendimiento de tus aplicaciones web para mejorar la velocidad, SEO y experiencia del usuario.'),
      features: t('services.optimization.features', ["Velocidad", "SEO", "Compresión de Imágenes", "Caching"])
    }, {
      icon: <FiServer />,
      title: t('services.hosting.title', 'Servicio de Hosting'),
      description: t('services.hosting.description', 'Ofrecemos hosting confiable y escalable para tus aplicaciones web con alta disponibilidad y soporte técnico especializado.'),
      features: t('services.hosting.features', ["Hosting Compartido", "VPS Dedicados", "SSL Gratuito", "Panel de Control"])
    }
  ];

  const colors = ["var(--primary-color)", "var(--secondary-color)", "var(--primary-color)"];

  return (
    <ServicesContainer id="services">
      <SectionTitle>
        <GradientText
          colors={["var(--text-color)", "var(--primary-color)", "var(--primary-cyan)", "var(--accent-color)", "var(--text-color)"]}
          animationSpeed={4}
          showBorder={false}
        >
          {t('services.title', 'Nuestros Servicios')}
        </GradientText>
      </SectionTitle>

      <SectionSubtitle>{t('services.subtitle', 'Soluciones tecnológicas integrales para hacer crecer tu negocio')}</SectionSubtitle>

      <CardContainer>
        {services.map((service, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <CardBox style={{ '--clr': colors[index % colors.length] }}>
              <CardData>
                <CardIcon>
                  {service.icon}
                </CardIcon>
                <CardContent>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <FeaturesList>
                    {service.features.map((feature, idx) => (
                      <FeatureItem key={idx}>{feature}</FeatureItem>
                    ))}
                  </FeaturesList>
                </CardContent>
              </CardData>
            </CardBox>
          </motion.div>
        ))}
      </CardContainer>
    </ServicesContainer>
  )
}

export default Services

const ServicesContainer = styled.section`
  padding: 5rem 2rem;
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 1024px) {
    padding: 3rem 1.2rem;
  }
  @media (max-width: 600px) {
    padding: 2rem 1rem;
    align-items: center;
  }
`

const SectionTitle = styled.h2`
    font-size: 2.6rem;
    margin-bottom: 1rem;
    text-align: center;
    z-index: 10;
    text-transform: uppercase;
    letter-spacing: 3px;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
  @media (max-width: 600px) {
    font-size: 1.4rem;
  }
`

const SectionSubtitle = styled.p`
  font-size: 1.2rem;
  color: var(--text-color);
  opacity: 0.8;
  margin-bottom: 3rem;
  text-align: center;
  max-width: 600px;
  padding: 0 1rem;

  @media (max-width: 600px) {
    font-size: 1rem;
    margin-bottom: 2rem;
  }
`

const CardContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 40px;
  justify-content: center;
  justify-items: center;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 0;
  box-sizing: border-box;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 24px;
    padding: 30px 0;
    width: 100%;
  }
`

const CardBox = styled.div`
  --dark-color: #2e2e2e;
  --dark-alt-color: #777777;
  --white-color: #ffffff;
  --button-color: #333333;
  --transition: 0.6s cubic-bezier(0.23, 1, 0.32, 1);

  font-family: inherit;
  height: 450px;
  width: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border: 1.5px solid var(--clr);
  border-radius: 12px;
  transition: var(--transition);
  box-sizing: border-box;
  box-shadow: 
    0 0 15px rgba(0, 0, 0, 0.3),
    0 0 20px var(--clr),
    inset 0 0 60px rgba(0, 0, 0, 0.2);

  /* Subtle static glow behind */
  &::before {
    content: "";
    position: absolute;
    inset: 0px;
    background: var(--clr);
    border-radius: 12px;
    z-index: -1;
    opacity: 0.1;
    filter: blur(20px);
    transition: var(--transition);
  }

  &:hover {
    transform: translateY(-5px);
    border-width: 3px;
    box-shadow: 
      0 10px 40px rgba(0, 0, 0, 0.4),
      0 0 30px var(--clr),
      0 0 60px var(--clr),
      inset 0 0 80px rgba(0, 0, 0, 0.3);
  }

  &:hover::before {
    opacity: 0.3;
    inset: -10px;
    filter: blur(30px);
  }

  &:hover .card__data h3 {
    color: #ffffff;
    text-shadow: 0 0 5px var(--clr);
  }

  &:hover .card__data p {
    color: #ffffff;
  }

  @media (max-width: 600px) {
    width: 100%;
    height: auto;
    min-height: 380px;
    margin: 0 auto;
  }
`

const CardData = styled.div.attrs({ className: 'card__data' })`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 20px;
  text-align: center;
  padding: 0 20px;
  height: 100%;
  width: 100%;
  overflow: hidden;
`

const CardIcon = styled.div`
  height: 80px;
  width: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 3rem;
  color: #ffffff;
  background-color: transparent;
  transition: 0.5s ease-in-out;
  box-shadow: 0 0 0 4px transparent, 0 0 0 6px var(--clr);
  border-radius: 50%;

  ${CardBox}:hover & {
    color: var(--dark-color);
    background-color: var(--clr);
    box-shadow: 0 0 0 4px var(--dark-color), 0 0 0 1000px var(--clr);
  }
`

const CardContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 10px;
  z-index: 10; /* Ensure content is above the expanding circle */

  h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #ffffff;
    transition: 0.5s ease-in-out;
  }

  p {
    font-size: 0.9rem;
    color: #ffffff;
    opacity: 0.9;
    transition: 0.5s ease-in-out;
  }
`

const FeaturesList = styled.ul`
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 10px;
`

const FeatureItem = styled.li`
  /* Default state (dark background) */
  background: rgba(255, 255, 255, 0.15); 
  color: #ffffff;
  padding: 0.3rem 0.7rem;
  border-radius: 20px;
  font-size: 0.88rem;
  font-weight: 600;
  border: 1px solid var(--clr);
  transition: 0.5s ease-in-out;

  /* Hover state (when background becomes the color) */
  ${CardBox}:hover & {
    background: rgba(0, 0, 0, 0.2);
    color: var(--dark-color);
    border-color: var(--dark-color);
  }
`