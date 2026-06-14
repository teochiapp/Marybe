import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FiChevronLeft } from 'react-icons/fi';
import SucursalesContent from '../../components/sucursales/SucursalesContent';

const Page = styled.div`
  background-color: #560203;
  min-height: 80vh;
  font-family: var(--font-family-secondary);
`;

const BreadcrumbBar = styled.div`
  max-width: 1300px;
  margin: 0 auto;
  padding: var(--spacing-md) var(--spacing-xl);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--color-blanco-pero-no-tan-blanco);

  a {
    display: flex;
    align-items: center;
    color: var(--color-blanco-pero-no-tan-blanco);
    opacity: 0.6;
    transition: var(--transition-fast);

    &:hover {
      opacity: 1;
      color: var(--color-rosa-tercero);
    }
  }

  span {
    user-select: none;
  }

  @media (max-width: 600px) {
    padding: var(--spacing-md);
  }
`;

const Current = styled.span`
  font-weight: 600;
`;

export default function Sucursales() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <Page>
      <BreadcrumbBar>
        <Link to="/inicio" aria-label="Volver al inicio">
          <FiChevronLeft size={16} />
        </Link>
        <Link to="/inicio">Inicio</Link>
        <span>/</span>
        <Current>Sucursales</Current>
      </BreadcrumbBar>

      <SucursalesContent />
    </Page>
  );
}
