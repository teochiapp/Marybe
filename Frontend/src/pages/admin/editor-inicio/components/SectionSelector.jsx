import React from 'react';
import styled from 'styled-components';
import SectionCard from './SectionCard';
import { EDITOR_INICIO_SECTIONS, sectionPath } from '../editorInicioSections';
import { hasSectionEditor } from '../sectionEditors';

const SelectorPanel = styled.section`
  width: 100%;
  max-width: 1360px;
  padding: var(--spacing-lg) var(--spacing-md);
  border: 1px solid #ece4de;
  border-radius: var(--radius-xl);
  background: var(--color-blanco);
  box-shadow: 0 32px 72px -28px rgba(0, 0, 0, 0.65);

  @media (min-width: 768px) {
    padding: var(--spacing-xxl) var(--spacing-xl);
  }
`;

const PanelHeader = styled.header`
  max-width: 680px;
  margin: 0 auto var(--spacing-xl);
  text-align: center;

  @media (min-width: 768px) {
    margin-bottom: 42px;
  }
`;

const Eyebrow = styled.p`
  display: inline-block;
  margin: 0 0 12px;
  padding: 5px 14px;
  border: 1px solid rgba(124, 4, 5, 0.22);
  border-radius: var(--radius-full);
  background: rgba(124, 4, 5, 0.08);
  color: var(--color-bordo-secundario);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
`;

const PanelTitle = styled.h1`
  margin: 0 0 12px;
  color: var(--color-marron-principal);
  font-family: var(--font-family-primary);
  font-size: clamp(1.8rem, 4.2vw, 2.65rem);
  font-weight: 600;
  line-height: 1.15;
`;

const PanelSubtitle = styled.p`
  margin: 0;
  color: #6f6262;
  font-size: 0.96rem;
  line-height: 1.55;
`;

const SectionsGrid = styled.ol`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin: 0;
  padding: 0;
  list-style: none;

  @media (min-width: 540px) { grid-template-columns: repeat(2, 1fr); }
  @media (min-width: 900px) { grid-template-columns: repeat(3, 1fr); gap: 20px; }
  @media (min-width: 1240px) { grid-template-columns: repeat(4, 1fr); gap: 22px; }
`;

export default function SectionSelector() {
  return (
    <SelectorPanel aria-labelledby="editor-inicio-selector-title">
      <PanelHeader>
        <Eyebrow>Editor de Inicio</Eyebrow>
        <PanelTitle id="editor-inicio-selector-title">¿Qué querés modificar hoy?</PanelTitle>
        <PanelSubtitle>Elegí una sección de la página principal. Están ordenadas tal como aparecen en la tienda.</PanelSubtitle>
      </PanelHeader>
      <SectionsGrid aria-label="Secciones de la página de inicio">
        {EDITOR_INICIO_SECTIONS.map((section, index) => (
          <li key={section.id}>
            <SectionCard section={section} order={index} to={sectionPath(section.id)} available={hasSectionEditor(section.id)} />
          </li>
        ))}
      </SectionsGrid>
    </SelectorPanel>
  );
}
