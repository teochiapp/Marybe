import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FiChevronRight, FiExternalLink } from 'react-icons/fi';
import { EDITOR_INICIO_PATH } from '../editorInicioSections';

const LayoutWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(ellipse at 20% 10%, rgba(124, 4, 5, 0.35) 0%, transparent 55%),
    radial-gradient(ellipse at 80% 90%, rgba(62, 1, 2, 0.4) 0%, transparent 55%),
    radial-gradient(ellipse at 50% 50%, rgba(22, 0, 0, 0.6) 0%, transparent 80%),
    linear-gradient(135deg, #160000 0%, #1e0a00 50%, #160000 100%);
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
  background: rgba(25, 4, 5, 0.82);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(194, 161, 92, 0.22);

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
  padding: 6px 12px;
  border-radius: var(--radius-md);
  background: rgba(255, 248, 244, 0.94);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.28);

  img {
    width: 92px;
    height: auto;
    aspect-ratio: 629 / 168;
    object-fit: contain;
  }

  &:focus-visible { outline: 2px solid #c2a15c; outline-offset: 4px; }

  @media (min-width: 768px) {
    img { width: 112px; }
  }
`;

const Breadcrumb = styled.nav`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  padding-left: 14px;
  border-left: 1px solid rgba(255, 255, 255, 0.16);
  color: #f5ebe6;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;

  a {
    color: #f2dc8f;
    text-decoration: none;
  }

  a:hover { text-decoration: underline; }

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    color: rgba(245, 235, 230, 0.78);
    font-weight: 500;
  }

  svg { flex-shrink: 0; color: rgba(242, 220, 143, 0.65); }

  @media (max-width: 600px) {
    span, svg { display: none; }
  }
`;

const TopActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
`;

const ViewWebLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  min-height: 40px;
  padding: 8px 14px;
  border: 1px solid rgba(242, 220, 143, 0.55);
  border-radius: var(--radius-md);
  background: rgba(242, 220, 143, 0.14);
  color: #f2dc8f;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: var(--transition-fast);

  &:hover {
    border-color: #f2dc8f;
    background: rgba(242, 220, 143, 0.26);
    color: #ffffff;
  }
  &:focus-visible { outline: 2px solid #f2dc8f; outline-offset: 2px; }

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

export default function EditorInicioLayout({ currentSection, children }) {
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
        <TopActions>
          <ViewWebLink href="/" target="_blank" rel="noopener noreferrer" aria-label="Ver web">
            <FiExternalLink aria-hidden="true" /><span>Ver web</span>
          </ViewWebLink>
        </TopActions>
      </TopBar>
      <Content>{children}</Content>
    </LayoutWrapper>
  );
}
