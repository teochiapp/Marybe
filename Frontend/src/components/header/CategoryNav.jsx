import React from 'react';
import styled from 'styled-components';

const NavWrapper = styled.nav`
  width: 100%;
  background-color: var(--color-blanco);
  border-bottom: 1px solid var(--color-fondo-beneficio-tarjeta);
  overflow-x: auto;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const CategoryList = styled.ul`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  list-style: none;
  margin: 0;
  padding: 0;
  white-space: nowrap;
`;

const CategoryItem = styled.li`
  a {
    display: block;
    padding: 12px 18px;
    font-family: var(--font-family-secondary);
    font-size: 13px;
    font-weight: 500;
    color: var(--color-marron-tercero);
    text-decoration: none;
    transition: color 0.2s;

    &:hover {
      color: var(--color-bordo-secundario);
    }
  }
`;

const categories = [
  'Dermocosmética',
  'Fragancias',
  'Maquillaje',
  'Cuidado personal',
  'Ofertas',
  'Niños y bebes',
  'Limpieza del hogar',
  'Lanzamientos',
  'Electro belleza',
];

export default function CategoryNav() {
  return (
    <NavWrapper>
      <CategoryList>
        {categories.map((cat) => (
          <CategoryItem key={cat}>
            <a href="#">{cat}</a>
          </CategoryItem>
        ))}
      </CategoryList>
    </NavWrapper>
  );
}
