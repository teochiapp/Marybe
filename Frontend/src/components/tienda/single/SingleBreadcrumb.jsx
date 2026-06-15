import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const BreadcrumbContainer = styled.nav`
  font-size: 0.85rem;
  color: #8E8E8E;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-family: var(--font-family-secondary);
`;

const BreadcrumbLink = styled(Link)`
  color: #8E8E8E;
  text-decoration: none;
  transition: color 0.2s;

  &:hover {
    color: var(--color-titulo-marybe);
  }
`;

const BreadcrumbCurrent = styled.span`
  color: #28180B;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Separator = styled.span`
  color: #8E8E8E;
`;

export default function SingleBreadcrumb({ seccion, categoria, nombre }) {
  return (
    <BreadcrumbContainer>
      <BreadcrumbLink to="/">Inicio</BreadcrumbLink>
      
      {seccion && (
        <>
          <Separator>/</Separator>
          <BreadcrumbLink to={`/tienda?seccion=${encodeURIComponent(seccion)}`}>
            {seccion}
          </BreadcrumbLink>
        </>
      )}

      {categoria && (
        <>
          <Separator>/</Separator>
          <BreadcrumbLink to={`/tienda?categoria=${encodeURIComponent(categoria)}`}>
            {categoria}
          </BreadcrumbLink>
        </>
      )}

      {nombre && (
        <>
          <Separator>/</Separator>
          <BreadcrumbCurrent>{nombre}</BreadcrumbCurrent>
        </>
      )}
    </BreadcrumbContainer>
  );
}
