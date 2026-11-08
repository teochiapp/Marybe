import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FiChevronRight, FiLogOut } from 'react-icons/fi';
import { EDITOR_INICIO_PATH } from '../editorInicioSections';

const LayoutWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(ellipse at 12% 0%, rgba(124, 4, 5, 0.07) 0%, transparent 55%),
    radial-gradient(ellipse at 100% 100%, rgba(194, 161, 92, 0.12) 0%, transparent 50%),
    var(--color-fondo-tarjetas-promo);
  color: var(--color-marron-cuarto);
  font-family: var(--font-family-secondary);
`;

const TopBar = styled.header`
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  min-height: 64px;
  padding: 10px var(--spacing-md);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid #ebe3dc;

  @media (min-width: 768px) {
    min-height: 72px;
    padding: 12px var(--spacing-xl);
  }
`;

const BrandGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
`;

const BrandLink = styled(Link)`
  display: flex;
  flex-shrink: 0;
  border-radius: var(--radius-sm);

  img {
    width: 96px;
    height: auto;
    aspect-ratio: 629 / 168;
    object-fit: contain;
  }

  &:focus-visible { outline: 2px solid var(--color-bordo-secundario); outline-offset: 4px; }

  @media (min-width: 768px) {
    img { width: 118px; }
  }
`;

const Breadcrumb = styled.nav`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  padding-left: 14px;
  border-left: 1px solid #e6dcd5;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;

  a {
    color: var(--color-marron-principal);
    text-decoration: none;
  }

  a:hover { text-decoration: underline; }

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    color: #7a6a6a;
    font-weight: 500;
  }

  svg { flex-shrink: 0; color: #b3a4a4; }

  @media (max-width: 600px) {
    span, svg { display: none; }
  }
`;

const LogoutButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  min-height: 40px;
  padding: 8px 14px;
  border: 1px solid #e3d8d1;
  border-radius: var(--radius-md);
  background: var(--color-blanco);
  color: var(--color-marron-principal);
  font: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-fast);

  &:hover { border-color: var(--color-bordo-secundario); background: var(--color-blanco-pero-no-tan-blanco); }
  &:focus-visible { outline: 2px solid var(--color-bordo-secundario); outline-offset: 2px; }

  @media (max-width: 480px) {
    span { display: none; }
    padding: 8px 11px;
  }
`;

const Content = styled.main`
  flex: 1;
  display: flex;
  justify-content: center;
  padding: var(--spacing-lg) var(--spacing-md) var(--spacing-xxl);

  @media (min-width: 768px) {
    padding: var(--spacing-xxl) var(--spacing-xl);
  }
`;

export default function EditorInicioLayout({ currentSection, onLogout, children }) {
  return (
    <LayoutWrapper>
      <TopBar>
        <BrandGroup>
          <BrandLink to={EDITOR_INICIO_PATH} aria-label="Marybe · Editor de Inicio">
            <img src="/logo-marybe.png" alt="Marybe" width="629" height="168" />
          </BrandLink>
          <Breadcrumb aria-label="Ubicación">
            {currentSection ? <Link to={EDITOR_INICIO_PATH}>Editor de Inicio</Link> : <strong>Editor de Inicio</strong>}
            {currentSection && <><FiChevronRight aria-hidden="true" /><span aria-current="page">{currentSection.title}</span></>}
          </Breadcrumb>
        </BrandGroup>
        <LogoutButton type="button" onClick={onLogout} aria-label="Cerrar sesión">
          <FiLogOut aria-hidden="true" /><span>Cerrar sesión</span>
        </LogoutButton>
      </TopBar>
      <Content>{children}</Content>
    </LayoutWrapper>
  );
}
