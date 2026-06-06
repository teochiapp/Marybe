import React, { useEffect, useState } from 'react';
import styled, { keyframes, css } from 'styled-components';

// ─── Animaciones ───────────────────────────────────────────────────────────────

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translate(-50%, 30px) scale(0.85);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0) scale(1);
  }
`;

const fadeOutDown = keyframes`
  from {
    opacity: 1;
    transform: translate(-50%, 0) scale(1);
  }
  to {
    opacity: 0;
    transform: translate(-50%, 30px) scale(0.85);
  }
`;

const bounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
`;

// ─── Styled Components ────────────────────────────────────────────────────────

const Button = styled.button`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 999;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background-color: var(--color-boton-promo);
    color: var(--color-blanco);
    align-items: center;
    justify-content: center;
    box-shadow: 0 6px 18px rgba(40, 1, 1, 0.35);
    cursor: pointer;
    border: none;
    pointer-events: ${({ $visible }) => ($visible ? 'auto' : 'none')};

    animation: ${({ $visible }) =>
      $visible
        ? css`
            ${fadeInUp} 0.35s ease forwards
          `
        : css`
            ${fadeOutDown} 0.3s ease forwards
          `};

    &:hover svg {
      animation: ${bounce} 0.8s ease infinite;
    }

    &:active {
      transform: translate(-50%, 2px) scale(0.95);
    }

    svg {
      transition: transform 0.2s ease;
    }
  }
`;

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ScrollToTopButton({ threshold = 300 }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Button
      type="button"
      onClick={scrollToTop}
      aria-label="Volver arriba"
      $visible={visible}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 19V5M5 12L12 5L19 12"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Button>
  );
}
