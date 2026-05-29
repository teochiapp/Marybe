import React from 'react';
import styled, { keyframes } from 'styled-components';

const FooterLogo = () => {
  return <LogoImg src={process.env.PUBLIC_URL + '/logo.png'} alt="SurCodes Logo" />;
};

export default FooterLogo; 

const popIn = keyframes`
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
`;

const LogoImg = styled.img`
  height: 160px;
  width: auto;
  animation: ${popIn} 0.8s cubic-bezier(0.23, 1, 0.32, 1);
  transition: filter 0.3s, transform 0.3s;
  filter: drop-shadow(0 2px 10px #00e6d0aa);
  object-fit: contain;
  &:hover {
    filter: drop-shadow(0 4px 24px #00e6d0ff);
    transform: scale(1.08) rotate(-2deg);
  }
`;
