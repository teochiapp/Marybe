import React, { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { NAV_COLUMNS } from './footerData';
import FooterBrand from './FooterBrand';
import FooterNavColumn from './FooterNavColumn';
import FooterContact from './FooterContact';

// ─── Styled Components ────────────────────────────────────────────────────────

const FooterWrapper = styled.footer`
  background-color: var(--color-marron-cuarto);
  color: var(--color-blanco);
  padding-top: var(--spacing-xxl);
  font-family: var(--font-family-secondary);
  padding-bottom: 30px;
  /* Reservar altura mínima para evitar CLS cuando el footer carga */
  min-height: 300px;
  content-visibility: auto;
  contain-intrinsic-size: 0 300px;
`;

const FooterInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 600px) {
    padding: 0 var(--spacing-md);
  }
`;

/* Layout principal: brand izquierda | nav+contacto derecha */
const FooterMain = styled.div`
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 80px;
  column-gap: 100px;
  padding-bottom: var(--spacing-lg);
  align-items: stretch;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-xl);
  }
`;

/* Columna derecha: nav columns arriba + contacto abajo */
const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--spacing-xxl);
`;

const NavColumns = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-xxl);
  column-gap: calc(var(--spacing-xxl) + 20px);

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 0;
  }
`;

const LegalLinks = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
  margin-left: auto;

  @media (max-width: 600px) {
    margin-left: 0;
    justify-content: center;
    gap: var(--spacing-lg);
    padding-top: var(--spacing-xs);
  }
`;

const BottomLink = styled(Link)`
  font-size: 0.85rem;
  color: var(--color-rosa-tercero);
  cursor: pointer;
  transition: var(--transition-fast);

  &:hover {
    color: var(--color-blanco);
  }
`;

// ─── Footer principal ────────────────────────────────────────────────────────

export default function Footer() {
  const [openSection, setOpenSection] = useState(null);

  const toggle = (title) =>
    setOpenSection((prev) => (prev === title ? null : title));

  const legalLinks = (
    <LegalLinks>
      <BottomLink to="/terminos-condiciones">Privacidad</BottomLink>
      <BottomLink to="/terminos-condiciones">Cookies</BottomLink>
    </LegalLinks>
  );

  return (
    <FooterWrapper>
      <FooterInner>
        <FooterMain>
          {/* Columna izquierda: brand + QR */}
          <FooterBrand />

          {/* Columna derecha: nav columns + contacto */}
          <RightColumn>
            <NavColumns>
              {NAV_COLUMNS.map((col) => (
                <FooterNavColumn
                  key={col.title}
                  title={col.title}
                  links={col.links}
                  isOpen={openSection === col.title}
                  onToggle={() => toggle(col.title)}
                />
              ))}
            </NavColumns>

            <FooterContact legalLinks={legalLinks} />
          </RightColumn>
        </FooterMain>
      </FooterInner>
    </FooterWrapper>
  );
}
