// components/AnimatedButton.js
import React from 'react';
import styled from 'styled-components';
import { Link as ScrollLink } from 'react-scroll';

const AnimatedButton = ({ children = "Contáctanos", to, ...props }) => {
  // Limpiar el ID para react-scroll (quitar # si existe)
  const targetId = to ? to.replace('#', '') : 'contact';

  return (
    <StyledScrollLink
      to={targetId}
      smooth={true}
      duration={500}
      offset={-80} // Compensar por el header fijo
      {...props}
    >
      <svg viewBox="0 0 24 24" className="arr-2" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
      </svg>
      <span className="text">{children}</span>
      <span className="circle"></span>
      <svg viewBox="0 0 24 24" className="arr-1" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
      </svg>
    </StyledScrollLink>
  );
};

export default AnimatedButton;

const StyledScrollLink = styled(ScrollLink)`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 16px 36px;
  font-size: 16px;
  font-weight: 600;
  border: 4px solid transparent;
  background-color: transparent;
  border-radius: 100px;
  color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-color);
  cursor: pointer;
  overflow: hidden;
  transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  font-family: var(--heading-font);
  text-decoration: none;

  /* Tablet */
  @media (min-width: 768px) and (max-width: 1023px) {
    padding: 12px 36px;
    font-size: 14px;
    gap: 4px;
  }

  /* Mobile */
  @media (max-width: 767px) {
    padding: 10px 24px;
    font-size: 13px;
    gap: 4px;
  }

  svg {
    position: absolute;
    width: 24px;
    fill: var(--primary-color);
    z-index: 2;
    transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);

    /* Tablet */
    @media (min-width: 768px) and (max-width: 1023px) {
      width: 20px;
    }

    /* Mobile */
    @media (max-width: 767px) {
      width: 18px;
    }
  }

  .arr-1 {
    right: 16px;

    /* Tablet */
    @media (min-width: 768px) and (max-width: 1023px) {
      right: 12px;
    }

    /* Mobile */
    @media (max-width: 767px) {
      right: 10px;
    }
  }

  .arr-2 {
    left: -25%;
  }

  .circle {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 20px;
    background-color: var(--primary-color);
    border-radius: 50%;
    opacity: 0;
    transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
    z-index: 1;
  }

  .text {
    position: relative;
    z-index: 2;
    transform: translateX(-12px);
    transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);

    /* Tablet */
    @media (min-width: 768px) and (max-width: 1023px) {
      transform: translateX(-10px);
    }

    /* Mobile */
    @media (max-width: 767px) {
      transform: translateX(-8px);
    }
  }

  &:hover {
    box-shadow: 0 0 0 12px transparent;
    color: var(--background-color);
    border-radius: 12px;

    .arr-1 {
      right: -25%;
    }

    .arr-2 {
      left: 16px;

      /* Tablet */
      @media (min-width: 768px) and (max-width: 1023px) {
        left: 12px;
      }

      /* Mobile */
      @media (max-width: 767px) {
        left: 10px;
      }
    }

    .text {
      transform: translateX(12px);

      /* Tablet */
      @media (min-width: 768px) and (max-width: 1023px) {
        transform: translateX(10px);
      }

      /* Mobile */
      @media (max-width: 767px) {
        transform: translateX(8px);
      }
    }

    svg {
      fill: var(--background-color);
    }

    .circle {
      width: 220px;
      height: 220px;
      opacity: 1;
      background-color: var(--secondary-color);

      /* Tablet */
      @media (min-width: 768px) and (max-width: 1023px) {
        width: 180px;
        height: 180px;
      }

      /* Mobile */
      @media (max-width: 767px) {
        width: 150px;
        height: 150px;
      }
    }
  }

  &:active {
    transform: scale(0.95);
    box-shadow: 0 0 0 4px var(--primary-color);
  }
`;
