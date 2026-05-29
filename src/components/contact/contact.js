import React, { useState } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { FiMail, FiPhone, FiMapPin, FiSend, FiCheck, FiGithub, FiLinkedin, FiInstagram } from 'react-icons/fi'
import GradientText from '../GradientText'
import EmailService from './EmailService'
import { useLanguage } from '../../contexts/LanguageContext';

function Contact() {
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      const emailService = new EmailService();

      const result = await emailService.sendEmail(formData);

      if (result.success) {
        setIsSubmitted(true);
        // Resetear formulario después de 3 segundos
        setTimeout(() => {
          setIsSubmitted(false);
          setFormData({ name: '', email: '', subject: '', message: '' });
        }, 3000);
      } else {
        // Mostrar error si falla el envío
        alert(result.message);
      }
    } catch (error) {
      alert('Error al enviar el mensaje. Por favor, intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: <FiMail />,
      title: t('contact.info.email', 'Email'),
      info: "SurCodeAr@gmail.com",
      link: "mailto:surcodeAr@gmail.com"
    },
    {
      icon: <FiPhone />,
      title: t('contact.info.phone', 'Teléfono'),
      info: "+54 11 5814 8683",
      link: "tel:+541158148683"
    },
    {
      icon: <FiMapPin />,
      title: t('contact.info.location', 'Ubicación'),
      info: "Buenos Aires, Argentina"
    },
    {
      icon: <FiMapPin />,
      title: t('contact.info.location', 'Ubicación'),
      info: "Córdoba, Argentina"
    }
  ];

  const socialLinks = [
    {
      icon: <FiGithub />,
      name: "GitHub",
      link: "https://github.com/surcode",
      color: "#333"
    },
    {
      icon: <FiLinkedin />,
      name: "LinkedIn",
      link: "https://linkedin.com/company/surcode",
      color: "#0077B5"
    },
    {
      icon: <FiInstagram />,
      name: "Instagram",
      link: "https://instagram.com/surcode",
      color: "#1DA1F2"
    }
  ];

  return (
    <ContactContainer id="contact">
      <SectionTitle>
        <GradientText
          colors={["var(--text-color)", "var(--primary-color)", "var(--primary-cyan)", "var(--accent-color)", "var(--text-color)"]}
          animationSpeed={4}
          showBorder={false}
        >
          {t('contact.title', 'CONTACTANOS')}
        </GradientText>
      </SectionTitle>
      <SectionSubtitle>{t('contact.subtitle', '¿Tenés un proyecto en mente? ¡Conversemos!')}</SectionSubtitle>

      <ContactContent>
        <ContactInfo>
          <InfoTitle>{t('contact.infoTitle', 'Información de Contacto')}</InfoTitle>
          <InfoDescription>
            {t('contact.infoDescription', 'Estamos aquí para ayudarte a hacer realidad tu proyecto. No dudes en contactarnos para discutir tus ideas.')}
          </InfoDescription>

          <InfoList>
            {contactInfo.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2, ease: "backOut" }}
                viewport={{ once: true }}
              >
                <InfoItem href={item.link} target="_blank" rel="noopener noreferrer">
                  <InfoIcon>{item.icon}</InfoIcon>
                  <InfoContent>
                    <InfoItemTitle>{item.title}</InfoItemTitle>
                    <InfoItemText>{item.info}</InfoItemText>
                  </InfoContent>
                </InfoItem>
              </motion.div>
            ))}
          </InfoList>

          <SocialSection>
            <SocialTitle>{t('footer.followUs', 'Síguenos')}</SocialTitle>
            <SocialLinks>
              {socialLinks.map((social, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8, rotateX: 15 }}
                  whileInView={{ opacity: 1, scale: 1, rotateX: 0 }}
                  transition={{ duration: 0.7, delay: index * 0.15, ease: "easeOut" }}
                  viewport={{ once: true }}
                >
                  <SocialLink href={social.link} target="_blank" rel="noopener noreferrer">
                    <SocialIcon>{social.icon}</SocialIcon>
                    <SocialName>{social.name}</SocialName>
                  </SocialLink>
                </motion.div>
              ))}
            </SocialLinks>
          </SocialSection>
        </ContactInfo>

        <ContactForm>
          <FormTitle>{t('contact.formTitle', 'Envíanos un Mensaje')}</FormTitle>

          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, y: 30, rotateZ: -5 }}
              animate={{ opacity: 1, y: 0, rotateZ: 0 }}
              transition={{ duration: 0.6, ease: "backOut" }}
            >
              <SuccessMessage>
                <SuccessIcon>
                  <FiCheck />
                </SuccessIcon>
                <SuccessTitle>{t('contact.form.successTitle', '¡Mensaje Enviado!')}</SuccessTitle>
                <SuccessText>
                  {t('contact.form.successText', 'Gracias por contactarnos. Te responderemos en breve.')}
                </SuccessText>
              </SuccessMessage>
            </motion.div>
          ) : (
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <FormInput
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder={t('contact.form.namePlaceholder', 'Tu nombre completo')}
                />
              </FormGroup>

              <FormGroup>
                <FormInput
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder={t('contact.form.emailPlaceholder', 'tu@email.com')}
                />
              </FormGroup>

              <FormGroup>
                <FormInput
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder={t('contact.form.subjectPlaceholder', '¿En qué podemos ayudarte?')}
                />
              </FormGroup>

              <FormGroup>
                <FormTextarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder={t('contact.form.messagePlaceholder', 'Cuéntanos sobre tu proyecto...')}
                  rows="5"
                />
              </FormGroup>

              <SubmitButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <LoadingSpinner />
                    {t('contact.form.sending', 'Enviando...')}
                  </>
                ) : (
                  <>
                    {t('contact.form.send', 'ENVIAR')}
                    <FiSend />
                  </>
                )}
              </SubmitButton>
            </Form>
          )}
        </ContactForm>
      </ContactContent>
    </ContactContainer>
  )
}

export default Contact

const ContactContainer = styled.section`
  padding: 5rem 2rem;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
`

const SectionTitle = styled.h2`
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`

const SectionSubtitle = styled.p`
  font-size: 1.2rem;
  color: var(--text-color);
  opacity: 0.8;
  margin-bottom: 3rem;
  text-align: center;
  max-width: 600px;
`

const ContactContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  max-width: 1200px;
  width: 100%;
  position: relative;
  z-index: 5;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`

const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 8;
`

const InfoTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 1rem;
`

const InfoDescription = styled.p`
  color: var(--text-color);
  opacity: 0.8;
  line-height: 1.6;
  margin-bottom: 2rem;
`

const InfoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
`

const InfoItem = styled.a`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:hover {
    border-color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(102, 211, 250, 0.2);
  }
`

const InfoIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: var(--primary-color);
  padding: 0.75rem;
  background: rgba(102, 211, 250, 0.1);
  border-radius: 50%;
  min-width: 3rem;
  height: 3rem;
  flex-shrink: 0;
`

const InfoContent = styled.div`
  flex: 1;
`

const InfoItemTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: var(--primary-color);
  margin: 0 0 0.25rem 0;
`

const InfoItemText = styled.p`
  color: var(--text-color);
  opacity: 0.8;
  margin: 0;
`

const SocialSection = styled.div`
  margin-top: 2rem;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  position: relative;
  z-index: 10;
`

const SocialTitle = styled.h4`
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 1.5rem;
  text-align: left;
`

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  position: relative;
  z-index: 15;
`

const SocialIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: var(--primary-color);
  transition: color 0.3s ease;
`

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: rgba(102, 211, 250, 0.05);
  border: 2px solid rgba(102, 211, 250, 0.1);
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.3s ease;
  color: var(--primary-color);
  font-weight: 600;
  position: relative;
  z-index: 20;

  &:hover {
    background: rgba(255, 210, 111, 0.15);
    border-color: var(--secondary-color);
    color: var(--secondary-color);
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(255, 210, 111, 0.3);
    z-index: 25;

    ${SocialIcon} {
      color: var(--secondary-color);
    }
  }
`

const SocialName = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
`

const ContactForm = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  backdrop-filter: blur(10px);
`

const FormTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 2rem;
  text-align: left;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`

const FormInput = styled.input`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  color: var(--text-color);
  font-size: 1rem;
  font-family: var(--text-font);
  transition: all 0.3s ease;

  &::placeholder {
    color: var(--text-color);
    opacity: 0.5;
    font-family: var(--text-font);
  }

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(102, 211, 250, 0.1);
  }
`

const FormTextarea = styled.textarea`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  color: var(--text-color);
  font-size: 1rem;
  font-family: var(--text-font);
  resize: vertical;
  transition: all 0.3s ease;

  &::placeholder {
    color: var(--text-color);
    opacity: 0.5;
    font-family: var(--text-font);
  }

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(102, 211, 250, 0.1);
  }
`

const SubmitButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: var(--background-color);
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  font-family: var(--text-font);
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(102, 211, 250, 0.3);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`

const SuccessMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem;
  color: var(--text-color);
`

const SuccessIcon = styled.div`
  font-size: 3rem;
  color: var(--secondary-color);
  margin-bottom: 1rem;
`

const SuccessTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 1rem 0 0.5rem 0;
  color: var(--secondary-color);
`

const SuccessText = styled.p`
  color: var(--text-color);
  opacity: 0.8;
  line-height: 1.6;
`