import React from 'react';
import styled from 'styled-components';
import { FiMail } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { DataFiscalQR } from './FooterIcons';
import { CONTACT_ITEMS } from './footerData';

const QRContactRow = styled.div`
  display: flex;
  align-items: stretch;
  gap: var(--spacing-xxl);
  padding-bottom: var(--spacing-xl);

  @media (max-width: 768px) {
    gap: var(--spacing-lg);
  }

  @media (max-width: 600px) {
    flex-direction: column;
    gap: var(--spacing-md);
    padding-top: var(--spacing-lg);
  }
`;

const QRCard = styled.div`
  background-color: var(--color-bordo-tercero);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  width: fit-content;
  gap: 20px;
  display: flex;
  flex-direction: column;

  @media (max-width: 600px) {
    flex-direction: row;
    align-items: center;
    width: 100%;
    gap: var(--spacing-md);
  }
`;

const CopyrightText = styled.p`
  font-size: 0.8rem;
  color: var(--color-rosa-tercero);
  margin: 0;
`;

const ContactSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const SectionTitle = styled.h4`
  font-family: var(--font-family-secondary);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-blanco);
  letter-spacing: 0.04em;
  margin: 0;
`;

const ContactBar = styled.div`
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-xxl);
  padding: var(--spacing-lg) 0;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: var(--spacing-lg);
  }

  @media (max-width: 600px) {
    flex-direction: column;
    gap: var(--spacing-md);
    padding: var(--spacing-sm) 0 var(--spacing-md);
  }
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
`;

const ContactIconWrap = styled.span`
  color: var(--color-rosa-tercero);
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;

const ContactText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ContactPhone = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-blanco);
`;

const ContactHours = styled.span`
  font-size: 0.75rem;
  color: var(--color-rosa-tercero);
`;

const EmailLink = styled.a`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: 0.9rem;
  color: var(--color-blanco);
  cursor: pointer;
  transition: var(--transition-fast);

  &:hover {
    color: var(--color-titulo-marybe);
  }
`;

const WhatsAppButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  background-color: var(--color-blanco);
  color: var(--color-marron-tercero);
  border-radius: var(--radius-full);
  padding: 12px var(--spacing-xl);
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-fast);
  text-decoration: none;

  &:hover {
    background-color: var(--color-rosa-tercero);
    color: var(--color-marron-tercero);
  }

  @media (max-width: 600px) {
    width: 100%;
    justify-content: center;
  }
`;

export default function FooterContact() {
  return (
    <QRContactRow>
      <QRCard>
        <DataFiscalQR />
        <CopyrightText>© 2026 Marybe. Todos los derechos reservados.</CopyrightText>
      </QRCard>

      <ContactSection>
        <SectionTitle>Contacto</SectionTitle>

        <ContactBar>
          {CONTACT_ITEMS.map((item) => (
            <ContactItem key={item.phone}>
              <ContactIconWrap>{item.icon}</ContactIconWrap>
              <ContactText>
                <ContactPhone>{item.phone}</ContactPhone>
                <ContactHours>{item.hours}</ContactHours>
              </ContactText>
            </ContactItem>
          ))}

          <EmailLink href="mailto:info@marybe.com.ar">
            <ContactIconWrap><FiMail size={16} /></ContactIconWrap>
            info@marybe.com.ar
          </EmailLink>
        </ContactBar>

        <WhatsAppButton href="https://wa.me/5493855551234" target="_blank" rel="noopener noreferrer">
          <FaWhatsapp size={20} />
          Unirme al canal de Whatsapp
        </WhatsAppButton>
      </ContactSection>
    </QRContactRow>
  );
}
