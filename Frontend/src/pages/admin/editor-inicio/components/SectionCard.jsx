import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

const CardLink = styled(Link)`
  position: relative;
   isolation: isolate;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 14px;
  height: 100%;
  min-height: 248px;
  padding: 18px;
  border: 1px solid rgba(242, 220, 143, 0.24);
  border-radius: 16px;
  background: #1a0405;
  color: #faf2ec;
  text-decoration: none;
  box-shadow: 0 14px 32px -12px rgba(0, 0, 0, 0.65);
  transition: transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease;

  &:hover {
    transform: translateY(-4px);
    border-color: rgba(242, 220, 143, 0.72);
    box-shadow:
      0 20px 38px -12px rgba(0, 0, 0, 0.8),
      0 0 24px rgba(124, 4, 5, 0.55);
  }

  &:focus-visible {
    outline: 3px solid #f2dc8f;
    outline-offset: 3px;
  }

  &:active { transform: translateY(-1px); }

  @media (max-width: 480px) {
    min-height: 215px;
    padding: 16px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    &:hover, &:active { transform: none; }
  }
`;

const PreviewBackdrop = styled.div`
  position: absolute;
  inset: 0;
  z-index: -2;
  background-image: ${({ $bgImage }) => ($bgImage ? `url(${$bgImage})` : 'none')};
  background-size: cover;
  background-position: top center;
  background-repeat: no-repeat;
  opacity: 0.48;
  filter: saturate(1.08) contrast(1.04);
  transform: scale(1.01);
  transition: opacity 0.28s ease, transform 0.35s ease, filter 0.28s ease;

  ${CardLink}:hover &, ${CardLink}:focus-visible & {
    opacity: 0.72;
    filter: saturate(1.15) contrast(1.08);
    transform: scale(1.05);
  }
`;

const PreviewScrim = styled.div`
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(
    180deg,
    rgba(22, 1, 2, 0.32) 0%,
    rgba(28, 2, 4, 0.52) 38%,
    rgba(20, 1, 3, 0.9) 74%,
    rgba(16, 1, 2, 0.97) 100%
  );
  transition: background 0.28s ease;

  ${CardLink}:hover &, ${CardLink}:focus-visible & {
    background: linear-gradient(
      180deg,
      rgba(22, 1, 2, 0.16) 0%,
      rgba(28, 2, 4, 0.42) 38%,
      rgba(20, 1, 3, 0.88) 74%,
      rgba(16, 1, 2, 0.96) 100%
    );
  }
`;

const CardTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const IconTile = styled.span`
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 1px solid rgba(242, 220, 143, 0.35);
  border-radius: var(--radius-lg);
  background: rgba(24, 2, 4, 0.76);
  backdrop-filter: blur(8px);
  color: #f2dc8f;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
  transition: var(--transition-fast);

  ${CardLink}:hover &, ${CardLink}:focus-visible & {
    border-color: #f2dc8f;
    background: var(--color-bordo-secundario);
    color: var(--color-blanco);
  }
`;

const OrderNumber = styled.span`
  padding: 5px 10px;
  border: 1px solid rgba(242, 220, 143, 0.32);
  border-radius: var(--radius-full);
  background: rgba(20, 1, 3, 0.78);
  backdrop-filter: blur(8px);
  color: #f2dc8f;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  font-variant-numeric: tabular-nums;
`;

const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: auto;
`;

const CardTitle = styled.h3`
  margin: 0;
  color: #ffffff;
  font-family: var(--font-family-secondary);
  font-size: 1.06rem;
  font-weight: 700;
  line-height: 1.28;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.8);
`;

const CardDescription = styled.p`
  margin: 0;
  color: rgba(247, 236, 228, 0.86);
  font-size: 0.84rem;
  line-height: 1.48;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.75);
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid rgba(242, 220, 143, 0.18);
`;

const StatusPill = styled.span`
  padding: 5px 11px;
  border-radius: var(--radius-full);
  border: 1px solid ${({ $available }) => ($available ? 'rgba(242, 220, 143, 0.55)' : 'rgba(255, 255, 255, 0.16)')};
  background: ${({ $available }) => ($available ? 'rgba(124, 4, 5, 0.82)' : 'rgba(38, 22, 24, 0.82)')};
  color: ${({ $available }) => ($available ? '#f7e6a9' : 'rgba(245, 235, 230, 0.68)')};
  font-size: 0.71rem;
  font-weight: 700;
  letter-spacing: 0.03em;
`;

const ArrowCircle = styled.span`
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  border: 1px solid rgba(242, 220, 143, 0.35);
  background: rgba(24, 2, 4, 0.7);
  color: #f2dc8f;
  transition: var(--transition-fast);

  ${CardLink}:hover &, ${CardLink}:focus-visible & {
    border-color: #f2dc8f;
    background: #f2dc8f;
    color: #2b0203;
    transform: translateX(3px);
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
      <PreviewBackdrop $bgImage={section.previewImage} data-preview-image={section.previewImage} aria-hidden="true" />
      <PreviewScrim aria-hidden="true" />
      <CardTop>
        <IconTile aria-hidden="true"><Icon size={21} strokeWidth={1.9} /></IconTile>
        <OrderNumber aria-hidden="true">{String(order).padStart(2, '0')}</OrderNumber>
      </CardTop>
      <CardBody>
        <CardTitle>{section.title}</CardTitle>
        <CardDescription id={`${section.id}-card-description`}>{section.description}{!available && <VisuallyHidden> Editor próximamente disponible.</VisuallyHidden>}</CardDescription>
      </CardBody>
      <CardFooter aria-hidden="true">
        <StatusPill $available={available}>{available ? 'Editar sección' : 'Próximamente'}</StatusPill>
        <ArrowCircle><FiArrowRight size={16} /></ArrowCircle>
      </CardFooter>
    </CardLink>
  );
}
