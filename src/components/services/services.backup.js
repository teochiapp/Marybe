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
      features: t('services.webDev.features', ["React & Next.js", "Diseño Responsivo", "Gestores de Contenido", "Performance"])
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

      <ServicesGrid>
        {services.map((service, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <ServiceCard>
              <ServiceIcon>{service.icon}</ServiceIcon>
              <ServiceTitle>{service.title}</ServiceTitle>
              <ServiceDescription>{service.description}</ServiceDescription>
              <FeaturesList>
                {service.features.map((feature, featureIndex) => (
                  <FeatureItem key={featureIndex}>{feature}</FeatureItem>
                ))}
              </FeaturesList>
            </ServiceCard>
          </motion.div>
        ))}
      </ServicesGrid>
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

  @media (max-width: 1024px) {
    padding: 3rem 1.2rem;
  }
  @media (max-width: 600px) {
    padding: 2rem 0.5rem;
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

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  width: 100%;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`

const ServiceCard = styled.div`
  background: rgba(18, 26, 46, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  min-height: 420px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  &:hover {
    transform: translateY(-8px);
    border-color: var(--primary-color);
    box-shadow: 0 20px 40px rgba(102, 211, 250, 0.2);
  }

  @media (max-width: 1024px) {
    padding: 1.2rem;
    min-height: 340px;
  }
  @media (max-width: 600px) {
    padding: 1rem 1.5rem;
    margin: 0 20px;
    min-height: 260px;
  }
`

const ServiceIcon = styled.div`
  font-size: 3rem;
  color: var(--primary-color);
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;

  @media (max-width: 600px) {
    font-size: 2.2rem;
    margin-bottom: 1rem;
  }
`

const ServiceTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 1rem;

  @media (max-width: 600px) {
    font-size: 1.1rem;
    margin-bottom: 0.7rem;
  }
`

const ServiceDescription = styled.p`
  color: var(--text-color);
  opacity: 0.8;
  line-height: 1.6;
  margin-bottom: 1.5rem;

  @media (max-width: 600px) {
    font-size: 0.95rem;
    margin-bottom: 1rem;
  }
`

const FeaturesList = styled.ul`
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;

  @media (max-width: 600px) {
    gap: 0.3rem;
  }
`

const FeatureItem = styled.li`
  background: rgba(102, 211, 250, 0.1);
  color: var(--primary-color);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid rgba(102, 211, 250, 0.3);

  @media (max-width: 600px) {
    font-size: 0.8rem;
    padding: 0.18rem 0.5rem;
  }
`