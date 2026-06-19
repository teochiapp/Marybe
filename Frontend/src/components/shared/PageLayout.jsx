import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
`;

const LayoutContainer = styled.div`
  min-height: 80vh;
  background-color: ${({ $bg }) => $bg || 'var(--color-fondo-beneficio-tarjeta)'};
  padding: var(--spacing-xxl) 0;
  font-family: var(--font-family-secondary);
  color: var(--color-marron-secundario);
`;

const ContentWrapper = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
  animation: ${fadeIn} 0.5s ease-out forwards;

  @media (max-width: 600px) {
    padding: 0 var(--spacing-md);
  }
`;

const Breadcrumbs = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--color-rosa-tercero);
  margin-bottom: var(--spacing-md);

  a {
    color: var(--color-marron-secundario);
    opacity: 0.7;
    transition: var(--transition-fast);

    &:hover {
      opacity: 1;
      color: var(--color-bordo-secundario);
    }
  }

  span {
    user-select: none;
  }

  .active {
    color: #5c0a0a;
    font-weight: 600;
    opacity: 1;
  }
`;

const PageHeader = styled.div`
  border-bottom: 1px solid rgba(62, 1, 2, 0.1);
  padding-bottom: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
`;

const PageTitle = styled.h1`
  font-family: var(--font-family-primary);
  font-size: clamp(2rem, 3.5vw, 3rem);
  color: var(--color-marron-principal);
  font-weight: 700;
  margin: 0 0 6px 0;
`;

const PageSubtitle = styled.p`
  font-size: 1rem;
  color: var(--color-marron-secundario);
  opacity: 0.7;
  margin: 0;
`;

export default function PageLayout({ title, subtitle, breadcrumbs = [], children, bgColor }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <LayoutContainer $bg={bgColor}>
      <ContentWrapper>
        <Breadcrumbs>
          <Link to="/inicio">Inicio</Link>
          {breadcrumbs.map((bc, idx) => (
            <React.Fragment key={idx}>
              <span>/</span>
              {bc.href ? <Link to={bc.href}>{bc.label}</Link> : <span className="active">{bc.label}</span>}
            </React.Fragment>
          ))}
        </Breadcrumbs>

        {title && (
          <PageHeader>
            <PageTitle>{title}</PageTitle>
            {subtitle && <PageSubtitle>{subtitle}</PageSubtitle>}
          </PageHeader>
        )}

        {children}
      </ContentWrapper>
    </LayoutContainer>
  );
}
