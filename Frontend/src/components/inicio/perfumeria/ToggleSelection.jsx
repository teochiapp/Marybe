import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

const ToggleContainer = styled.div`
  display: flex;
  background-color: var(--color-blanco);
  border-radius: 200px;
  padding: 5px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  width: fit-content;
  max-width: 100%;
  margin: 0 auto -5vh auto;
  position: relative;
  z-index: 10;

  @media (max-width: 768px) {
    position: ${({ $sticky }) => ($sticky ? 'fixed' : 'relative')};
    top: ${({ $sticky }) => ($sticky ? 'calc(var(--header-height, 70px) + 8px)' : 'auto')};
    left: ${({ $sticky }) => ($sticky ? '50%' : 'auto')};
    transform: ${({ $sticky, $visible }) =>
      $sticky
        ? `translateX(-50%) translateY(${$visible ? '0' : '-200px'})`
        : 'none'};
    width: ${({ $sticky }) => ($sticky ? 'calc(100% - 40px)' : '100%')};
    margin: ${({ $sticky }) => ($sticky ? '0' : '0 auto 20px auto')};
    z-index: ${({ $sticky }) => ($sticky ? 1000 : 10)};
    transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: ${({ $sticky }) =>
      $sticky ? '0 6px 24px rgba(0, 0, 0, 0.14)' : '0 4px 16px rgba(0, 0, 0, 0.08)'};
  }
`;

/* Indicador que se desliza por detrás de las opciones */
const Slider = styled.span`
  position: absolute;
  top: 5px;
  bottom: 5px;
  left: 5px;
  width: calc(50% - 5px);
  border-radius: 40px;
  background-color: ${({ $activeColor }) => $activeColor};
  transform: translateX(${({ $index }) => ($index === 1 ? '100%' : '0%')});
  transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1),
    background-color 0.35s ease;
  z-index: 1;
  pointer-events: none;
`;

const ToggleOption = styled.button`
  position: relative;
  z-index: 2;
  background-color: transparent;
  color: ${({ $active }) => ($active ? 'var(--color-blanco)' : 'var(--color-marron-principal)')};
  border: none;
  border-radius: 40px;
  padding: 12px 56px;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.3s ease, transform 0.2s ease;
  font-family: var(--font-family-secondary);
  flex: 1;
  white-space: nowrap;

  &:hover {
    color: ${({ $active }) => ($active ? 'var(--color-blanco)' : 'var(--color-bordo-secundario)')};
  }

  &:active {
    transform: scale(0.96);
  }

  @media (max-width: 480px) {
    padding: 8px 24px;
    font-size: 0.95rem;
  }
`;

export default function ToggleSelection({ seccionActiva, onSeccionChange }) {
  const [visible, setVisible] = useState(false);
  const [sticky, setSticky] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const isMobile = () => window.innerWidth <= 768;

    const handleScroll = () => {
      if (!isMobile()) return;

      const currentY = window.scrollY;
      const diff = currentY - lastScrollY.current;
      const threshold = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--header-height')
      ) || 70;

      if (currentY > threshold) {
        setSticky(true);
        if (diff < -5) setVisible(true);
        else if (diff > 5) setVisible(false);
      } else {
        setSticky(false);
        setVisible(false);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const index = seccionActiva === 'hogar' ? 1 : 0;
  const activeColor = seccionActiva === 'hogar' ? 'var(--color-hogar)' : 'var(--color-bordo-tercero)';

  return (
    <ToggleContainer $visible={visible} $sticky={sticky}>
      <Slider $index={index} $activeColor={activeColor} aria-hidden="true" />
      <ToggleOption
        $active={seccionActiva === 'perfumeria'}
        onClick={() => onSeccionChange('perfumeria')}
      >
        Perfumería
      </ToggleOption>
      <ToggleOption
        $active={seccionActiva === 'hogar'}
        onClick={() => onSeccionChange('hogar')}
      >
        Hogar
      </ToggleOption>
    </ToggleContainer>
  );
}
