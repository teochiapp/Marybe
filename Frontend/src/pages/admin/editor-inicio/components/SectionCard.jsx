import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

const CardLink = styled(Link)`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  min-height: 188px;
  padding: 18px;
  border: 1px solid #ebe2dc;
  border-radius: 14px;
  background: var(--color-blanco);
  color: inherit;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;

  &:hover {
    transform: translateY(-3px);
    border-color: rgba(124, 4, 5, 0.45);
    box-shadow: 0 14px 30px -14px rgba(62, 1, 2, 0.35);
  }

  &:focus-visible {
    outline: 3px solid var(--color-bordo-secundario);
    outline-offset: 3px;
  }

  &:active { transform: translateY(-1px); }

  @media (max-width: 480px) {
    min-height: 0;
    padding: 16px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    &:hover, &:active { transform: none; }
  }
`;

const CardTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
`;

const IconTile = styled.span`
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: var(--radius-lg);
  background: var(--color-blanco-pero-no-tan-blanco);
  color: var(--color-bordo-secundario);
  transition: var(--transition-fast);

  ${CardLink}:hover &, ${CardLink}:focus-visible & {
    background: var(--color-bordo-secundario);
    color: var(--color-blanco);
  }
`;

const OrderNumber = styled.span`
  color: #b9aaa6;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  font-variant-numeric: tabular-nums;
`;

const CardTitle = styled.h3`
  margin: 0;
  color: var(--color-marron-principal);
  font-family: var(--font-family-secondary);
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.3;
`;

const CardDescription = styled.p`
  flex: 1;
  margin: 0;
  color: #6f6262;
  font-size: 0.84rem;
  line-height: 1.5;
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #f1ebe6;
`;

const StatusPill = styled.span`
  padding: 4px 9px;
  border-radius: var(--radius-full);
  background: ${({ $available }) => ($available ? 'rgba(124, 4, 5, 0.09)' : '#f1ede9')};
  color: ${({ $available }) => ($available ? 'var(--color-bordo-secundario)' : '#837674')};
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.02em;
`;

const ArrowCircle = styled.span`
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: var(--radius-full);
  border: 1px solid #e6dcd5;
  color: var(--color-marron-principal);
  transition: var(--transition-fast);

  ${CardLink}:hover &, ${CardLink}:focus-visible & {
    border-color: var(--color-bordo-secundario);
    background: var(--color-bordo-secundario);
    color: var(--color-blanco);
    transform: translateX(2px);
  }
`;

const VisuallyHidden = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
`;

export default function SectionCard({ section, order, to, available }) {
  const Icon = section.icon;
  return (
    <CardLink to={to} data-section-id={section.id} aria-label={section.title} aria-describedby={`${section.id}-card-description`}>
      <CardTop>
        <IconTile aria-hidden="true"><Icon size={22} strokeWidth={1.8} /></IconTile>
        <OrderNumber aria-hidden="true">{String(order).padStart(2, '0')}</OrderNumber>
      </CardTop>
      <CardTitle>{section.title}</CardTitle>
      <CardDescription id={`${section.id}-card-description`}>{section.description}{!available && <VisuallyHidden> Editor próximamente disponible.</VisuallyHidden>}</CardDescription>
      <CardFooter aria-hidden="true">
        <StatusPill $available={available}>{available ? 'Editar sección' : 'Próximamente'}</StatusPill>
        <ArrowCircle><FiArrowRight size={16} /></ArrowCircle>
      </CardFooter>
    </CardLink>
  );
}
