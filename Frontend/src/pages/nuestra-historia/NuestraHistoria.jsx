import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FiChevronLeft } from 'react-icons/fi';
import HistoriaContent from '../../components/nuestra-historia/HistoriaContent';

const Page = styled.div`
  background-color: #F5F2ED;
  min-height: 80vh;
  font-family: var(--font-family-secondary);
`;

/* Barra superior a todo el ancho con fondo blanco, arriba de la seccion. */
const TopBar = styled.div`
  width: 100%;
  background-color: #FFFFFF;
`;

const BreadcrumbBar = styled.div`
  max-width: 1480px;
  margin: 0 auto;
  padding: var(--spacing-md) var(--spacing-xl);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: #3a322c;

  a {
    display: flex;
    align-items: center;
    color: #3a322c;
    opacity: 0.6;
    transition: var(--transition-fast);

    &:hover {
      opacity: 1;
      color: var(--color-bordo-secundario);
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

export default function NuestraHistoria() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <Page>
      <TopBar>
        <BreadcrumbBar>
          <Link to="/inicio" aria-label="Volver al inicio">
            <FiChevronLeft size={16} />
          </Link>
          <Link to="/inicio">Inicio</Link>
          <span>/</span>
          <Current>Nuestra Historia</Current>
        </BreadcrumbBar>
      </TopBar>

      <HistoriaContent />
    </Page>
  );
}
