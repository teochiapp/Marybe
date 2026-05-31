import React from 'react';
import styled, { keyframes } from 'styled-components';

const marquee = keyframes`
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

const TopBarWrapper = styled.div`
  background-color: var(--color-marron-principal);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 60px;
  padding: 10px 24px;
  width: 100%;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 10px 0;
    gap: 0;
  }
`;

const DesktopItems = styled.div`
  display: contents;

  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileTrack = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    gap: 40px;
    animation: ${marquee} 18s linear infinite;
  }
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-blanco);
  font-family: var(--font-family-secondary);
  font-size: 13px;
  font-weight: 400;
  white-space: nowrap;
  flex-shrink: 0;

  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const StarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M0.5 6.5C4.67867 6.5 6.5 4.742 6.5 0.5C6.5 4.742 8.30867 6.5 12.5 6.5C8.30867 6.5 6.5 8.30867 6.5 12.5C6.5 8.30867 4.67867 6.5 0.5 6.5Z"
      stroke="#F2D4D4"
      strokeLinejoin="round"
    />
  </svg>
);

const PinIcon = () => (
  <svg width="12" height="15" viewBox="0 0 12 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M11.3334 6C11.3334 9.32867 7.64075 12.7953 6.40075 13.866C6.28523 13.9529 6.14461 13.9998 6.00008 13.9998C5.85555 13.9998 5.71493 13.9529 5.59941 13.866C4.35941 12.7953 0.666748 9.32867 0.666748 6C0.666748 4.58551 1.22865 3.22896 2.22885 2.22876C3.22904 1.22857 4.58559 0.666667 6.00008 0.666667C7.41457 0.666667 8.77112 1.22857 9.77132 2.22876C10.7715 3.22896 11.3334 4.58551 11.3334 6Z"
      stroke="white"
      strokeWidth="1.33333"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 8C7.10457 8 8 7.10457 8 6C8 4.89543 7.10457 4 6 4C4.89543 4 4 4.89543 4 6C4 7.10457 4.89543 8 6 8Z"
      stroke="white"
      strokeWidth="1.33333"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const items = [
  { icon: <StarIcon />, text: "Retirá gratis en tu sucursal" },
  { icon: <StarIcon />, text: "Hasta 9 cuotas sin interés" },
  { icon: <StarIcon />, text: "Envíos Gratis" },
  { icon: <PinIcon />,  text: "Sucursales Marybe" },
];

export default function TopBar() {
  return (
    <TopBarWrapper>
      <DesktopItems>
        {items.map((item, i) => (
          <Item key={i}>
            {item.icon}
            <span>{item.text}</span>
          </Item>
        ))}
      </DesktopItems>

      <MobileTrack>
        {[...items, ...items].map((item, i) => (
          <Item key={i}>
            {item.icon}
            <span>{item.text}</span>
          </Item>
        ))}
      </MobileTrack>
    </TopBarWrapper>
  );
}
