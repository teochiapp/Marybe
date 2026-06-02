import React from 'react';
import styled from 'styled-components';
import { FiPhone, FiMail } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const PinIcon = () => (
  <svg width="14" height="17" viewBox="0 0 12 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M11.3334 6C11.3334 9.32867 7.64075 12.7953 6.40075 13.866C6.28523 13.9529 6.14461 13.9998 6.00008 13.9998C5.85555 13.9998 5.71493 13.9529 5.59941 13.866C4.35941 12.7953 0.666748 9.32867 0.666748 6C0.666748 4.58551 1.22865 3.22896 2.22885 2.22876C3.22904 1.22857 4.58559 0.666667 6.00008 0.666667C7.41457 0.666667 8.77112 1.22857 9.77132 2.22876C10.7715 3.22896 11.3334 4.58551 11.3334 6Z"
      stroke="var(--color-rosa-tercero)"
      strokeWidth="1.33"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 8C7.10457 8 8 7.10457 8 6C8 4.89543 7.10457 4 6 4C4.89543 4 4 4.89543 4 6C4 7.10457 4.89543 8 6 8Z"
      stroke="var(--color-rosa-tercero)"
      strokeWidth="1.33"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DataFiscalQR = () => (
  <svg width="72" height="72" viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
    <rect width="72" height="72" rx="6" fill="#1a6eb5" />
    <rect x="6" y="6" width="24" height="24" rx="2" fill="white" />
    <rect x="10" y="10" width="16" height="16" rx="1" fill="#1a6eb5" />
    <rect x="13" y="13" width="10" height="10" fill="white" />
    <rect x="42" y="6" width="24" height="24" rx="2" fill="white" />
    <rect x="46" y="10" width="16" height="16" rx="1" fill="#1a6eb5" />
    <rect x="49" y="13" width="10" height="10" fill="white" />
    <rect x="6" y="42" width="24" height="24" rx="2" fill="white" />
    <rect x="10" y="46" width="16" height="16" rx="1" fill="#1a6eb5" />
    <rect x="13" y="49" width="10" height="10" fill="white" />
    <rect x="34" y="34" width="4" height="4" fill="white" />
    <rect x="40" y="34" width="4" height="4" fill="white" />
    <rect x="46" y="34" width="4" height="4" fill="white" />
    <rect x="52" y="34" width="4" height="4" fill="white" />
    <rect x="58" y="34" width="8" height="4" fill="white" />
    <rect x="34" y="40" width="4" height="4" fill="white" />
    <rect x="40" y="40" width="8" height="4" fill="white" />
    <rect x="52" y="40" width="4" height="4" fill="white" />
    <rect x="34" y="46" width="8" height="4" fill="white" />
    <rect x="46" y="46" width="4" height="4" fill="white" />
    <rect x="54" y="46" width="4" height="4" fill="white" />
    <rect x="60" y="46" width="6" height="4" fill="white" />
    <rect x="34" y="52" width="4" height="4" fill="white" />
    <rect x="42" y="52" width="4" height="4" fill="white" />
    <rect x="50" y="52" width="4" height="4" fill="white" />
    <rect x="58" y="52" width="8" height="4" fill="white" />
    <rect x="34" y="58" width="8" height="8" fill="white" />
    <rect x="46" y="58" width="4" height="8" fill="white" />
    <rect x="54" y="58" width="12" height="8" fill="white" />
    <text x="36" y="71" fontFamily="Arial" fontSize="5" fill="white" textAnchor="middle">DATA FISCAL</text>
  </svg>
);

// ─── Datos del footer ─────────────────────────────────────────────────────────

const NAV_COLUMNS = [
  {
    title: 'Mis Pedidos',
    links: [
      { label: 'Mi cuenta', href: '#' },
      { label: 'Seguimiento de envío', href: '#' },
      { label: 'Canjear Gift card', href: '#' },
    ],
  },
  {
    title: 'Categorías',
    links: [
      { label: 'Perfumería', href: '#' },
      { label: 'Hogar', href: '#' },
      { label: 'Gift Cards', href: '#' },
      { label: 'Ofertas', href: '#' },
      { label: 'Nuevos lanzamientos', href: '#' },
      { label: 'Eventos', href: '#' },
      { label: 'Promociones bancarias', href: '#' },
    ],
  },
  {
    title: 'Ayuda',
    links: [
      { label: 'Preguntas Frecuentes', href: '#' },
      { label: 'Envíos', href: '#' },
      { label: 'Cambios y Devoluciones', href: '#' },
      { label: 'Términos y Condiciones', href: '#' },
      { label: 'Botón de arrepentimiento', href: '#' },
    ],
  },
];

const CONTACT_ITEMS = [
  {
    icon: <FiPhone size={16} />,
    phone: '0385 421-5678',
    hours: 'Lun a Vie 9 a 20 hs',
  },
  {
    icon: <FaWhatsapp size={16} />,
    phone: '+54 9 385 555-1234',
    hours: 'Lun a Vie 9 a 20 hs',
  },
];

// ─── Styled Components ────────────────────────────────────────────────────────

const FooterWrapper = styled.footer`
  background-color: var(--color-marron-cuarto);
  color: var(--color-blanco);
  padding-top: var(--spacing-xxl);
  font-family: var(--font-family-secondary);
`;

const FooterInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-xl);

  @media (max-width: 600px) {
    padding: 0 var(--spacing-md);
  }
`;

const FooterTop = styled.div`
  display: grid;
  grid-template-columns: 260px 1fr 1fr 1fr;
  gap: var(--spacing-xxl);
  padding-bottom: var(--spacing-xl);

  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-xl);
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
`;

/* ── Brand column ── */
const BrandColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const FooterLogo = styled.img`
  height: 36px;
  object-fit: contain;
  align-self: flex-start;
`;

const Tagline = styled.p`
  font-size: 0.85rem;
  color: var(--color-rosa-tercero);
  line-height: 1.6;
  margin: 0;

  strong {
    color: var(--color-blanco);
    font-weight: 600;
  }
`;

const LocationBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const LocationLine = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  font-size: 0.85rem;
  color: var(--color-rosa-tercero);
`;

const BranchLink = styled.a`
  font-size: 0.85rem;
  color: var(--color-blanco);
  text-decoration: underline;
  cursor: pointer;
  transition: var(--transition-fast);

  &:hover {
    color: var(--color-titulo-marybe);
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
`;

const CopyrightText = styled.p`
  font-size: 0.8rem;
  color: var(--color-rosa-tercero);
  margin: 0;
`;

/* ── Nav column ── */
const NavColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const ColumnTitle = styled.h4`
  font-family: var(--font-family-secondary);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-blanco);
  letter-spacing: 0.04em;
  margin: 0;
`;

const NavList = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: 0;
  margin: 0;
`;

const NavLink = styled.a`
  font-size: 0.875rem;
  color: var(--color-rosa-tercero);
  transition: var(--transition-fast);
  cursor: pointer;

  &:hover {
    color: var(--color-blanco);
  }
`;

/* ── QR + Contact row ── */
const QRContactRow = styled.div`
  display: flex;
  align-items: stretch;
  gap: var(--spacing-xxl);
  padding-bottom: var(--spacing-xl);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: var(--spacing-lg);
  }
`;

const ContactSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

/* ── Contact bar ── */
const ContactBar = styled.div`
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-xxl);
  padding: var(--spacing-lg) 0;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: var(--spacing-lg);
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

/* ── WhatsApp CTA ── */
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

/* ── Bottom bar ── */
const FooterBottom = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const BottomInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-md) var(--spacing-xl);
  display: flex;
  justify-content: center;
  gap: var(--spacing-xl);

  @media (max-width: 600px) {
    padding: var(--spacing-md);
    gap: var(--spacing-md);
  }
`;

const BottomLink = styled.a`
  font-size: 0.85rem;
  color: var(--color-rosa-tercero);
  cursor: pointer;
  transition: var(--transition-fast);

  &:hover {
    color: var(--color-blanco);
  }
`;

// ─── Componente reutilizable: columna de navegación ───────────────────────────

function FooterNavColumn({ title, links }) {
  return (
    <NavColumn>
      <ColumnTitle>{title}</ColumnTitle>
      <NavList>
        {links.map((link) => (
          <li key={link.label}>
            <NavLink href={link.href}>{link.label}</NavLink>
          </li>
        ))}
      </NavList>
    </NavColumn>
  );
}

// ─── Footer principal ────────────────────────────────────────────────────────

export default function Footer() {
  return (
    <FooterWrapper>
      <FooterInner>
        {/* ── Fila principal ── */}
        <FooterTop>
          {/* Columna marca */}
          <BrandColumn>
            <FooterLogo src="/logo-marybe.jpeg" alt="Marybe" />

            <Tagline>
              Tu farmacia y perfumería de confianza desde hace <strong>más de 50 años.</strong>
            </Tagline>

            <LocationBlock>
              <LocationLine>
                <PinIcon />
                <span>Santiago del Estero | Tucumán</span>
              </LocationLine>
              <BranchLink href="#">Encontrá tu sucursal más cercana</BranchLink>
            </LocationBlock>

          </BrandColumn>

          {/* Columnas de navegación */}
          {NAV_COLUMNS.map((col) => (
            <FooterNavColumn key={col.title} title={col.title} links={col.links} />
          ))}
        </FooterTop>

        {/* ── QR + Contacto (mismo nivel) ── */}
        <QRContactRow>
          <QRCard>
            <DataFiscalQR />
            <CopyrightText>© 2026 Marybe. Todos los derechos reservados.</CopyrightText>
          </QRCard>

          <ContactSection>
            <ColumnTitle>Contacto</ColumnTitle>
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
      </FooterInner>

      {/* ── Barra inferior ── */}
      <FooterBottom>
        <BottomInner>
          <BottomLink href="#">Privacidad</BottomLink>
          <BottomLink href="#">Cookies</BottomLink>
        </BottomInner>
      </FooterBottom>
    </FooterWrapper>
  );
}
