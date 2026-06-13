import React from 'react';
import styled from 'styled-components';
import { FaFacebookSquare, FaInstagram } from 'react-icons/fa';

const Banner = styled.section`
  background-color: var(--color-bordo-secundario);
  border-radius: var(--radius-xl);
  padding: var(--spacing-lg) var(--spacing-xxl);
  display: flex;
  align-items: center;
  gap: var(--spacing-xxl);
  flex-wrap: wrap;
  box-shadow: var(--shadow-sm);

  @media (max-width: 700px) {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-lg);
    padding: var(--spacing-xl);
  }
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  text-decoration: none;
  color: var(--color-blanco);
  transition: var(--transition-fast);

  &:hover {
    opacity: 0.85;
  }
`;

const SocialIconWrap = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-blanco);

  svg {
    width: 26px;
    height: 26px;
  }
`;

const SocialText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const SocialLabel = styled.span`
  font-family: var(--font-family-secondary);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-blanco);
  opacity: 0.85;
`;

const SocialHandle = styled.span`
  font-family: var(--font-family-secondary);
  font-size: 1.15rem;
  font-weight: 500;
  color: var(--color-blanco);
`;

const SucursalesButton = styled.a`
  margin-left: auto;
  background-color: var(--color-blanco);
  color: var(--color-marron-principal);
  font-family: var(--font-family-secondary);
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: var(--radius-md);
  padding: 12px var(--spacing-lg);
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  transition: var(--transition-fast);

  &:hover {
    background-color: var(--color-rosa-tercero);
  }

  @media (max-width: 700px) {
    margin-left: 0;
    width: 100%;
    text-align: center;
  }
`;

const SOCIAL_LINKS = [
  {
    label: 'Facebook',
    handle: '/marybeperfumeria',
    href: 'https://www.facebook.com/marybeperfumeria',
    icon: <FaFacebookSquare />,
  },
  {
    label: 'Instagram',
    handle: 'perfumeriasmarybe',
    href: 'https://www.instagram.com/perfumeriasmarybe',
    icon: <FaInstagram />,
  },
];

export default function SocialBanner() {
  return (
    <Banner>
      {SOCIAL_LINKS.map((social) => (
        <SocialLink
          key={social.label}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          <SocialIconWrap>{social.icon}</SocialIconWrap>
          <SocialText>
            <SocialLabel>{social.label}</SocialLabel>
            <SocialHandle>{social.handle}</SocialHandle>
          </SocialText>
        </SocialLink>
      ))}

      <SucursalesButton href="#">
        Conocé todas nuestras sucursales
      </SucursalesButton>
    </Banner>
  );
}
