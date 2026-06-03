import React from 'react';
import styled from 'styled-components';
import { ChevronIcon } from './FooterIcons';

const NavColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);

  @media (max-width: 600px) {
    gap: 0;
  }
`;

const DesktopTitle = styled.h4`
  font-family: var(--font-family-secondary);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-blanco);
  letter-spacing: 0.04em;
  margin: 0;

  @media (max-width: 600px) {
    display: none;
  }
`;

const AccordionHeader = styled.button`
  display: none;

  @media (max-width: 600px) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    background: none;
    border: none;
    border-bottom: 3px solid var(--color-blanco);
    padding: var(--spacing-md) 0;
    cursor: pointer;
    color: var(--color-blanco);
    font-family: var(--font-family-secondary);
    font-size: 0.9rem;
    font-weight: 600;
    text-align: left;
  }
`;

const NavList = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: 0;
  margin: 0;

  @media (max-width: 600px) {
    overflow: hidden;
    max-height: ${({ $open }) => ($open ? '300px' : '0')};
    transition: max-height 0.28s ease;
    gap: 0;
    padding: ${({ $open }) => ($open ? 'var(--spacing-sm) 0 var(--spacing-md)' : '0')};
  }
`;

const NavLink = styled.a`
  font-size: 0.875rem;
  color: var(--color-rosa-tercero);
  transition: var(--transition-fast);
  cursor: pointer;
  display: block;

  @media (max-width: 600px) {
    padding: 6px 0;
  }

  &:hover {
    color: var(--color-blanco);
  }
`;

export default function FooterNavColumn({ title, links, isOpen, onToggle }) {
  return (
    <NavColumn>
      <DesktopTitle>{title}</DesktopTitle>

      <AccordionHeader onClick={onToggle} aria-expanded={isOpen}>
        {title}
        <ChevronIcon open={isOpen} />
      </AccordionHeader>

      <NavList $open={isOpen}>
        {links.map((link) => (
          <li key={link.label}>
            <NavLink href={link.href}>{link.label}</NavLink>
          </li>
        ))}
      </NavList>
    </NavColumn>
  );
}
