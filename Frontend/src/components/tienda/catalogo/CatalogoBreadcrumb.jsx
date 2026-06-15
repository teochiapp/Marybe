import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

// ─── Styled Components ────────────────────────────────────────────────────────

const BreadcrumbNav = styled.nav`
  max-width: 1400px;
  margin: 0 auto 28px auto;
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 1rem;
  font-family: var(--font-family-secondary);

  @media (max-width: 768px) {
    font-size: 0.85rem;
    margin-bottom: 20px;
    gap: 1px;
    flex-wrap: wrap;
  }
`;

const BackBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  color: var(--color-marron-cuarto);
  margin-right: 10px;
  flex-shrink: 0;
  transition: all 0.2s ease;

  &:hover {
    background: #FAF4EE;
    border-color: var(--color-bordo-secundario);
    color: var(--color-bordo-secundario);
    transform: translateX(-2px);
  }

  @media (max-width: 768px) {
    width: 26px;
    height: 26px;
    margin-right: 6px;
    
    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

const BreadItem = styled.button`
  color: #9A8F87;
  font-weight: 400;
  padding: 2px 4px;
  border-radius: 4px;
  transition: color 0.15s;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    color: var(--color-bordo-secundario);
  }
`;

const Separator = styled.span`
  color: #C8C0BB;
  margin: 0 4px;
  font-size: 0.78rem;
  user-select: none;

  @media (max-width: 768px) {
    font-size: 0.7rem;
    margin: 0 2px;
  }
`;

const CurrentItem = styled.span`
  color: var(--color-marron-cuarto);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
`;

// ─── Componente ───────────────────────────────────────────────────────────────

export default function CatalogoBreadcrumb({
  activeSeccion,
  activeBanner,
  activeDescuento,
  currentBannerTitle,
  onGoToSeccion,
}) {
  const navigate = useNavigate();

  // Tercer nivel: banner activo o filtro de descuento
  let thirdLabel = null;
  if (activeBanner && currentBannerTitle && currentBannerTitle !== activeSeccion) {
    thirdLabel = currentBannerTitle;
  } else if (activeDescuento && activeDescuento.length > 0) {
    thirdLabel = activeDescuento.includes('todas') ? 'Todas las ofertas' : `${activeDescuento.join(', ')}% OFF`;
  }

  const crumbs = [
    { label: 'Inicio', onClick: () => navigate('/inicio') },
    { label: activeSeccion || 'Tienda', onClick: onGoToSeccion },
    ...(thirdLabel ? [{ label: thirdLabel }] : []),
  ];

  return (
    <BreadcrumbNav aria-label="Breadcrumb de navegación">
      <BackBtn onClick={() => navigate(-1)} aria-label="Volver atrás" title="Volver atrás">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </BackBtn>

      {crumbs.map((crumb, idx) => {
        const isLast = idx === crumbs.length - 1;
        return (
          <React.Fragment key={idx}>
            {isLast ? (
              <CurrentItem>{crumb.label}</CurrentItem>
            ) : (
              <>
                <BreadItem onClick={crumb.onClick}>{crumb.label}</BreadItem>
                <Separator>/</Separator>
              </>
            )}
          </React.Fragment>
        );
      })}
    </BreadcrumbNav>
  );
}
