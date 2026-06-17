import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';

// ─── Animaciones ──────────────────────────────────────────────────────────────

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to   { opacity: 0; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(24px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
`;

const slideDown = keyframes`
  from { opacity: 1; transform: translateY(0) scale(1); }
  to   { opacity: 0; transform: translateY(24px) scale(0.97); }
`;

// ─── Overlay ──────────────────────────────────────────────────────────────────

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  animation: ${({ $closing }) => css`${$closing ? fadeOut : fadeIn} 0.22s ease forwards`};
`;

// ─── Modal ────────────────────────────────────────────────────────────────────

const Modal = styled.div`
  background: var(--color-blanco, #fff);
  border-radius: 20px;
  padding: 28px 28px 32px;
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  animation: ${({ $closing }) => css`${$closing ? slideDown : slideUp} 0.22s ease forwards`};
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: var(--color-marron-tercero, #333);
  display: flex;
  align-items: center;
  justify-content: center;

  &:focus-visible {
    outline: none;
  }
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 28px;
`;

const Title = styled.h2`
  font-family: var(--font-family-secondary);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-marron-cuarto, #4a2c16);
  margin: 0;
`;

const Subtitle = styled.p`
  font-family: var(--font-family-secondary);
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
`;

const InputRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InputLabel = styled.span`
  font-family: var(--font-family-secondary);
  font-size: 14px;
  font-weight: 700;
  color: var(--color-marron-tercero, #28180B);
  flex-shrink: 0;
`;

const CPInput = styled.input`
  flex: 1;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px 14px;
  font-family: var(--font-family-secondary);
  font-size: 14px;
  color: var(--color-marron-tercero, #28180B);
  outline: none;
  transition: border-color 0.2s;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    border-color: var(--color-marron-principal, #7C0405);
  }
`;

const NoSeLink = styled.a`
  font-family: var(--font-family-secondary);
  font-size: 13px;
  color: #3b82f6;
  text-decoration: underline;
  cursor: pointer;
  text-align: right;
  display: block;
  margin-top: 6px;
`;

const StoreOption = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-top: 10px;
`;

const StoreText = styled.div`
  font-family: var(--font-family-secondary);
  font-size: 13px;
  color: #555;
  display: flex;
  flex-direction: column;
  gap: 4px;

  a {
    color: var(--color-marron-principal, #7C0405);
    text-decoration: underline;
    cursor: pointer;
    font-weight: 500;
  }
`;

const ResultsBox = styled.div`
  background-color: #F3F3F3;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 10px;
`;

const ResultsTitle = styled.h3`
  font-family: var(--font-family-primary);
  font-size: 1.4rem;
  font-weight: 700;
  color: #280101;
  margin: 0 0 4px 0;
`;

const ResultItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: var(--font-family-secondary);
  font-size: 14px;
  color: #111;
`;

// ─── Íconos ───────────────────────────────────────────────────────────────────

const PinIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const StoreIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const BusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="11" rx="2" ry="2" />
    <path d="M2 13h20" />
    <path d="M6 18v2" />
    <path d="M18 18v2" />
    <circle cx="8" cy="13" r="1" />
    <circle cx="16" cy="13" r="1" />
    <path d="M8 7v6" />
    <path d="M16 7v6" />
  </svg>
);

const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ShippingModal({ isOpen, onClose }) {
  const [cp, setCp] = useState('');
  const [closing, setClosing] = useState(false);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 210);
  };

  useEffect(() => {
    if (!isOpen) {
      setCp('');
      setClosing(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape' && isOpen) handleClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) handleClose();
  };

  if (!isOpen && !closing) return null;

  return (
    <Overlay $closing={closing} onClick={handleOverlayClick}>
      <Modal $closing={closing}>
        <CloseBtn onClick={handleClose} aria-label="Cerrar">
          <CloseIcon />
        </CloseBtn>

        <TitleRow>
          <PinIcon />
          <Title>Elegí tu ubicación</Title>
        </TitleRow>

        <Subtitle>
          Ingresá tu código postal para ver disponibilidad y opciones de entrega.
        </Subtitle>

        <div>
          <InputRow>
            <InputLabel>CP</InputLabel>
            <CPInput
              type="text"
              placeholder="Ej: 5000"
              value={cp}
              onChange={(e) => setCp(e.target.value)}
              maxLength={8}
            />
          </InputRow>
          <NoSeLink href="https://www.correoargentino.com.ar/formularios/cpa" target="_blank" rel="noopener noreferrer">No sé mi código postal</NoSeLink>
        </div>

        <StoreOption>
          <StoreIcon />
          <StoreText>
            Retira gratis en nuestras sucursales
            <a href="/sucursales">Ver sucursales</a>
          </StoreText>
        </StoreOption>

        {cp.length >= 4 && (
          <ResultsBox>
            <ResultsTitle>Resultados</ResultsTitle>
            <ResultItem>
              <BusIcon />
              Envío mediante CORREO ARGENTINO
            </ResultItem>
            <ResultItem>
              <ClockIcon />
              En hasta 8 días hábiles
            </ResultItem>
            <ResultItem>
              <ClockIcon />
              Costo de envío: GRATIS
            </ResultItem>
          </ResultsBox>
        )}
      </Modal>
    </Overlay>
  );
}
