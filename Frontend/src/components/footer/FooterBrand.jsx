import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { PinIcon, DataFiscalQR } from './FooterIcons';

const BrandColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  justify-content: space-between;

  @media (max-width: 600px) {
    gap: var(--spacing-sm);
    padding-bottom: var(--spacing-lg);
  }
`;

const FooterLogo = styled.img`
  height: 36px;
  object-fit: contain;
  align-self: flex-start;
  filter: brightness(0) invert(1);
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

/* Visible solo en desktop */
const DesktopLocation = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  @media (max-width: 600px) {
    display: none;
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

const BranchLink = styled(Link)`
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
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: fit-content;
`;

const CopyrightText = styled.p`
  font-size: 0.8rem;
  color: var(--color-rosa-tercero);
  margin: 0;
`;

export default function FooterBrand() {
  return (
    <BrandColumn>
      <FooterLogo src="/logo-marybe.png" alt="Marybe" />

      <Tagline>
        Tu farmacia y perfumería de confianza desde hace <strong>más de 50 años.</strong>
      </Tagline>

      <DesktopLocation>
        <LocationLine>
          <PinIcon />
          <span>Santiago del Estero | Tucumán</span>
        </LocationLine>
        <BranchLink to="/sucursales">Encontrá tu sucursal más cercana</BranchLink>
      </DesktopLocation>

      <QRCard>
        <DataFiscalQR />
        <CopyrightText>© 2026 Marybe. Todos los derechos reservados.</CopyrightText>
      </QRCard>
    </BrandColumn>
  );
}
