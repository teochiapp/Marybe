import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiClock } from 'react-icons/fi';
import { EDITOR_INICIO_PATH } from '../editorInicioSections';

const PlaceholderPanel = styled.section`
  align-self: flex-start;
  width: 100%;
  max-width: 620px;
  margin-top: var(--spacing-md);
  padding: var(--spacing-xl) var(--spacing-lg);
  border: 1px solid #ece4de;
  border-radius: var(--radius-xl);
  background: var(--color-blanco);
  box-shadow: 0 30px 70px -40px rgba(62, 1, 2, 0.35);
  text-align: center;

  @media (min-width: 768px) {
    margin-top: var(--spacing-xl);
    padding: 56px var(--spacing-xxl);
  }
`;

const IconTile = styled.div`
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  margin: 0 auto var(--spacing-lg);
  border-radius: 18px;
  background: var(--color-blanco-pero-no-tan-blanco);
  color: var(--color-bordo-secundario);
`;

const SectionTitle = styled.h1`
  margin: 0 0 10px;
  color: var(--color-marron-principal);
  font-family: var(--font-family-primary);
  font-size: clamp(1.6rem, 4vw, 2.2rem);
  font-weight: 600;
  line-height: 1.2;
`;

const SectionDescription = styled.p`
  margin: 0 0 var(--spacing-lg);
  color: #6f6262;
  font-size: 0.95rem;
  line-height: 1.55;
`;

const ComingSoonBadge = styled.p`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 var(--spacing-xl);
  padding: 9px 16px;
  border-radius: var(--radius-full);
  background: #f4efea;
  color: var(--color-marron-principal);
  font-size: 0.88rem;
  font-weight: 600;
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 46px;
  padding: 11px 20px;
  border-radius: var(--radius-md);
  background: var(--color-marron-principal);
  color: var(--color-blanco);
  font-size: 0.9rem;
  font-weight: 700;
  text-decoration: none;
  transition: var(--transition-fast);

  &:hover { background: var(--color-bordo-secundario); }
  &:focus-visible { outline: 3px solid var(--color-bordo-secundario); outline-offset: 3px; }

  @media (max-width: 480px) {
    width: 100%;
  }
`;

export default function SectionPlaceholder({ section }) {
  const Icon = section.icon;
  return (
    <PlaceholderPanel aria-labelledby="editor-inicio-section-title" data-section-id={section.id}>
      <IconTile aria-hidden="true"><Icon size={30} strokeWidth={1.7} /></IconTile>
      <SectionTitle id="editor-inicio-section-title">{section.title}</SectionTitle>
      <SectionDescription>{section.description}</SectionDescription>
      <ComingSoonBadge role="status"><FiClock aria-hidden="true" /> Editor próximamente disponible</ComingSoonBadge>
      <div>
        <BackLink to={EDITOR_INICIO_PATH}><FiArrowLeft aria-hidden="true" /> Volver al selector</BackLink>
      </div>
    </PlaceholderPanel>
  );
}
