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
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  animation: ${({ $closing }) => css`${$closing ? fadeOut : fadeIn} 0.22s ease forwards`};
`;

// ─── Modal ────────────────────────────────────────────────────────────────────

const Modal = styled.div`
  background: var(--color-blanco);
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
  left: 20px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: var(--color-marron-tercero);
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
  font-family: var(--font-family-primary);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-marron-tercero);
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
  align-items: center;
  gap: 12px;
`;

const InputLabel = styled.span`
  font-family: var(--font-family-secondary);
  font-size: 14px;
  font-weight: 500;
  color: var(--color-marron-tercero);
  flex-shrink: 0;
`;

const CPInput = styled.input`
  flex: 1;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  padding: 12px 16px;
  font-family: var(--font-family-secondary);
  font-size: 14px;
  color: var(--color-marron-tercero);
  outline: none;
  transition: border-color 0.2s;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    border-color: var(--color-marron-principal);
  }

  &:focus-visible {
    outline: none;
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
`;

const ToggleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ToggleLabel = styled.span`
  font-family: var(--font-family-secondary);
  font-size: 14px;
  color: var(--color-marron-tercero);
`;

const ToggleTrack = styled.button`
  width: 48px;
  height: 28px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  background-color: ${({ $on }) => ($on ? 'var(--color-marron-principal)' : '#d1d5db')};
  position: relative;
  transition: background-color 0.2s;
  flex-shrink: 0;

  &:focus-visible {
    outline: none;
  }
`;

const ToggleThumb = styled.span`
  position: absolute;
  top: 3px;
  left: ${({ $on }) => ($on ? '23px' : '3px')};
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--color-blanco);
  transition: left 0.2s;
`;

const ContinuarBtn = styled.button`
  width: 100%;
  padding: 16px;
  background-color: var(--color-marron-principal);
  color: var(--color-blanco);
  border: none;
  border-radius: 14px;
  font-family: var(--font-family-secondary);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--color-marron-secundario);
  }

  &:focus-visible {
    outline: none;
  }
`;

// ─── Íconos ───────────────────────────────────────────────────────────────────

const PinIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"
      fill="var(--color-marron-tercero)" />
  </svg>
);

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M1 1L17 17M17 1L1 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// ─── Componente ───────────────────────────────────────────────────────────────

export default function UbicacionPopup({ onClose }) {
  const [cp, setCp] = useState('');
  const [recordar, setRecordar] = useState(true);
  const [closing, setClosing] = useState(false);

  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, 210);
  };

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) handleClose();
  };

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
          <NoSeLink href="#">No sé mi código postal</NoSeLink>
        </div>

        <ToggleRow>
          <ToggleLabel>Recordar mis datos</ToggleLabel>
          <ToggleTrack $on={recordar} onClick={() => setRecordar((v) => !v)} aria-label="Recordar datos">
            <ToggleThumb $on={recordar} />
          </ToggleTrack>
        </ToggleRow>

        <ContinuarBtn onClick={handleClose}>Continuar</ContinuarBtn>
      </Modal>
    </Overlay>
  );
}
