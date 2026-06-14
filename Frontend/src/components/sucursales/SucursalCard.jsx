import React from 'react';
import styled from 'styled-components';
import { FiMapPin, FiMessageCircle, FiPhone } from 'react-icons/fi';

const Card = styled.article`
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-md);
  }
`;

const Thumb = styled.img`
  width: 120px;
  height: 78px;
  object-fit: cover;
  border-radius: var(--radius-md);
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
  transition: transform 0.25s ease;
  cursor: pointer;

  &:hover {
    transform: scale(1.1);
  }

  @media (max-width: 600px) {
    width: 100%;
    height: 110px;
    border-radius: 24px;
  }
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  color: var(--color-blanco-pero-no-tan-blanco);
`;

const InfoRow = styled.span`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-family: var(--font-family-secondary);
  font-size: 0.95rem;

  svg {
    flex-shrink: 0;
    color: var(--color-blanco);
  }

  @media (max-width: 480px) {
    font-size: 0.85rem;
  }
`;

export default function SucursalCard({ direccion, telefono, telefonoFijo, mapa }) {
  return (
    <Card>
      <Thumb src={mapa} alt={`Ubicación de ${direccion}`} loading="lazy" />
      <Info>
        <InfoRow>
          <FiMapPin size={18} />
          {direccion}
        </InfoRow>
        <InfoRow>
          <FiMessageCircle size={18} />
          {telefono}
        </InfoRow>
        {telefonoFijo && (
          <InfoRow>
            <FiPhone size={18} />
            {telefonoFijo}
          </InfoRow>
        )}
      </Info>
    </Card>
  );
}
