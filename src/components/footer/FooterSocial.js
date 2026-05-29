import React from 'react';
import styled, { keyframes } from 'styled-components';
import { FiGithub, FiInstagram, FiMail } from 'react-icons/fi';

const socialLinks = [
  { href: '#', label: 'Instagram', icon: <FiInstagram /> },
  { href: '', label: 'GitHub', icon: <FiGithub /> },
  { href: 'mailto:surCodeAr@gmail.com', label: 'Email', icon: <FiMail /> },
];

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const SocialList = styled.ul`
  display: flex;
  gap: 1.7rem;
  list-style: none;
  padding: 0;
  margin: 0;
  z-index: 2;
  @media (max-width: 900px) {
    gap: 1rem;
  }
`;

const SocialItem = styled.li`
  animation: ${fadeIn} 0.7s cubic-bezier(0.23, 1, 0.32, 1);
`;

const SocialLink = styled.a`
  color: #fff;
  font-size: 1.2rem;
  transition: color 0.3s, transform 0.3s, box-shadow 0.3s, background 0.3s, filter 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(0,230,208,0.08);
  box-shadow: 0 2px 12px 0 rgba(0,230,208,0.08);
  border: 1.5px solid rgba(0,230,208,0.13);
  width: 48px;
  height: 48px;
  position: relative;
  overflow: hidden;
  &:hover {
    color: #00e6d0;
    background: rgba(0,230,208,0.18);
    box-shadow: 0 4px 24px #00e6d0cc, 0 0 0 4px rgba(0,230,208,0.08);
    transform: scale(1.18) rotate(-8deg);
    filter: brightness(1.2) drop-shadow(0 0 12px #00e6d0);
  }
`;

const FooterSocial = () => (
  <SocialList>
    {socialLinks.map(link => (
      <SocialItem key={link.href}>
        <SocialLink href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.label}>
          {link.icon}
        </SocialLink>
      </SocialItem>
    ))}
  </SocialList>
);

export default FooterSocial; 