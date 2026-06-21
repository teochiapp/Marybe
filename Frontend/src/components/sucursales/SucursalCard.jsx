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

/* Contenedor que recorta la franja inferior del iframe (tarjeta de lugar
   y controles de Google), que no se pueden quitar por ser cross-origin. */
const MapWrap = styled.div`
  width: 173px;
  height: 113px;
  flex-shrink: 0;
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  position: relative;

  @media (max-width: 600px) {
    width: 100%;
    height: 158px;
    border-radius: 24px;
  }
`;

const MapFrame = styled.iframe`
  display: block;
  border: 0;
  width: 100%;
  height: 100%;
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
      <MapWrap>
        <MapFrame
          src={mapa}
          title={`Mapa de ${direccion}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </MapWrap>
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
