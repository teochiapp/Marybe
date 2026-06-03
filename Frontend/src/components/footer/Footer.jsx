import React, { useState } from 'react';
import styled from 'styled-components';
import { PinIcon } from './FooterIcons';
import { NAV_COLUMNS } from './footerData';
import FooterBrand from './FooterBrand';
import FooterNavColumn from './FooterNavColumn';
import FooterContact from './FooterContact';

// ─── Styled Components ────────────────────────────────────────────────────────

const FooterWrapper = styled.footer`
  background-color: var(--color-marron-tercero);
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
    display: flex;
    flex-direction: column;
    gap: 0;
    padding-bottom: 0;
  }
`;

/* Ubicación visible solo en mobile, debajo de los acordeones */
const MobileLocation = styled.div`
  display: none;

  @media (max-width: 600px) {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: var(--spacing-lg) 0;
  }
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

// ─── Footer principal ────────────────────────────────────────────────────────

export default function Footer() {
  const [openSection, setOpenSection] = useState(null);

  const toggle = (title) =>
    setOpenSection((prev) => (prev === title ? null : title));

  return (
    <FooterWrapper>
      <FooterInner>
        <FooterTop>
          <FooterBrand />

          {NAV_COLUMNS.map((col) => (
            <FooterNavColumn
              key={col.title}
              title={col.title}
              links={col.links}
              isOpen={openSection === col.title}
              onToggle={() => toggle(col.title)}
            />
          ))}
        </FooterTop>

        {/* Ubicación mobile — debajo de los acordeones */}
        <MobileLocation>
          <LocationLine>
            <PinIcon />
            <span>Santiago del Estero | Tucumán</span>
          </LocationLine>
          <BranchLink href="#">Encontrá tu sucursal más cercana</BranchLink>
        </MobileLocation>

        <FooterContact />
      </FooterInner>

      <FooterBottom>
        <BottomInner>
          <BottomLink href="#">Privacidad</BottomLink>
          <BottomLink href="#">Cookies</BottomLink>
        </BottomInner>
      </FooterBottom>
    </FooterWrapper>
  );
}
