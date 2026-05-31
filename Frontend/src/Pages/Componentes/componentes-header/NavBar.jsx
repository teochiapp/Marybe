import React from 'react';
import styled from 'styled-components';

const NavBarWrapper = styled.nav`
  background-color: var(--color-blanco);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 48px;
  gap: 20px;
  width: 100%;
  border-bottom: 1px solid var(--color-fondo-beneficio-tarjeta);

  @media (max-width: 768px) {
    flex-wrap: wrap;
    padding: 12px 20px;
    gap: 10px;
  }
`;

const Logo = styled.img`
  height: 30px;
  object-fit: contain;
  flex-shrink: 0;

  @media (max-width: 768px) {
    height: 24px;
  }
`;

const CenterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;

  @media (max-width: 768px) {
    order: 3;
    width: 100%;
    flex: unset;
  }
`;

const LocationSelector = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: var(--color-rosa-principal);
  border: none;
  border-radius: 20px;
  padding: 8px 14px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  font-family: var(--font-family-secondary);
  font-size: 13px;
  color: var(--color-marron-tercero);

  @media (max-width: 768px) {
    font-size: 12px;
    padding: 7px 12px;
  }
`;

const SearchBar = styled.label`
  display: flex;
  align-items: center;
  flex: 1;
  background-color: var(--color-fondo-beneficio-tarjeta);
  border-radius: 20px;
  padding: 8px 16px;
  gap: 8px;
  cursor: text;
`;

const SearchInput = styled.input`
  border: none;
  outline: none;
  flex: 1;
  font-family: var(--font-family-secondary);
  font-size: 13px;
  color: var(--color-marron-tercero);
  background: transparent;

  &::placeholder {
    color: var(--color-rosa-tercero);
  }
`;

const Icons = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
  flex-shrink: 0;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const CartBadge = styled.span`
  position: absolute;
  top: -6px;
  right: -6px;
  background-color: var(--color-bordo-secundario);
  color: var(--color-blanco);
  font-family: var(--font-family-secondary);
  font-size: 9px;
  font-weight: 600;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PinIcon = () => (
  <svg width="12" height="14" viewBox="0 0 12 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M11.3334 6C11.3334 9.32867 7.64075 12.7953 6.40075 13.866C6.28523 13.9529 6.14461 13.9998 6.00008 13.9998C5.85555 13.9998 5.71493 13.9529 5.59941 13.866C4.35941 12.7953 0.666748 9.32867 0.666748 6C0.666748 4.58551 1.22865 3.22896 2.22885 2.22876C3.22904 1.22857 4.58559 0.666667 6.00008 0.666667C7.41457 0.666667 8.77112 1.22857 9.77132 2.22876C10.7715 3.22896 11.3334 4.58551 11.3334 6Z"
      stroke="var(--color-marron-tercero)"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 8C7.10457 8 8 7.10457 8 6C8 4.89543 7.10457 4 6 4C4.89543 4 4 4.89543 4 6C4 7.10457 4.89543 8 6 8Z"
      stroke="var(--color-marron-tercero)"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M7 13C10.3137 13 13 10.3137 13 7C13 3.68629 10.3137 1 7 1C3.68629 1 1 3.68629 1 7C1 10.3137 3.68629 13 7 13Z"
      stroke="var(--color-rosa-tercero)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15 15L11.1 11.1"
      stroke="var(--color-rosa-tercero)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const UserIcon = () => (
  <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M16.7071 18.2071C16.5196 18.3946 16.2652 18.5 16 18.5H2C1.73478 18.5 1.48043 18.3946 1.29289 18.2071C1.10536 18.0196 1 17.7652 1 17.5V16.254C1 13.448 4.974 11.25 9 11.25C13.026 11.25 17.004 13.448 17 16.254V17.5C17 17.7652 16.8946 18.0196 16.7071 18.2071Z"
      stroke="#160000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    />
    <path
      d="M12.3297 5.98319C12.5108 5.54593 12.604 5.07728 12.604 4.604C12.604 3.64816 12.2243 2.73147 11.5484 2.05559C10.8725 1.37971 9.95584 1 9 1C8.04416 1 7.12747 1.37971 6.45159 2.05559C5.77571 2.73147 5.396 3.64816 5.396 4.604C5.396 5.07728 5.48922 5.54593 5.67034 5.98319C5.85146 6.42045 6.11692 6.81775 6.45159 7.15241C6.78625 7.48707 7.18355 7.75254 7.62081 7.93366C8.05807 8.11478 8.52672 8.208 9 8.208C9.47328 8.208 9.94193 8.11478 10.3792 7.93366C10.8164 7.75254 11.2138 7.48707 11.5484 7.15241C11.8831 6.81775 12.1485 6.42045 12.3297 5.98319Z"
      stroke="#160000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    />
  </svg>
);

const CartIcon = () => (
  <svg width="22" height="22" viewBox="0 0 30 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M8 25.6667C8.55228 25.6667 9 25.219 9 24.6667C9 24.1144 8.55228 23.6667 8 23.6667C7.44772 23.6667 7 24.1144 7 24.6667C7 25.219 7.44772 25.6667 8 25.6667Z"
      stroke="#160000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    />
    <path
      d="M19.0005 25.6667C19.5528 25.6667 20.0005 25.219 20.0005 24.6667C20.0005 24.1144 19.5528 23.6667 19.0005 23.6667C18.4482 23.6667 18.0005 24.1144 18.0005 24.6667C18.0005 25.219 18.4482 25.6667 19.0005 25.6667Z"
      stroke="#160000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    />
    <path
      d="M2.05005 5.7167H4.05005L6.71005 18.1367C6.80763 18.5916 7.06072 18.9982 7.42576 19.2866C7.7908 19.5749 8.24496 19.727 8.71005 19.7167H18.4901C18.9452 19.716 19.3865 19.56 19.7411 19.2745C20.0956 18.9891 20.3422 18.5912 20.4401 18.1467L22.0901 10.7167H5.12005"
      stroke="#160000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    />
  </svg>
);

export default function NavBar() {
  return (
    <NavBarWrapper>
      <Logo src="/logo-marybe.jpeg" alt="Marybe" />

      <CenterGroup>
        <LocationSelector>
          <PinIcon />
          Ubicación seleccionada
        </LocationSelector>

        <SearchBar>
          <SearchIcon />
          <SearchInput placeholder="Buscar" />
        </SearchBar>
      </CenterGroup>

      <Icons>
        <IconButton aria-label="Mi cuenta">
          <UserIcon />
        </IconButton>
        <IconButton aria-label="Carrito">
          <CartIcon />
          <CartBadge>0</CartBadge>
        </IconButton>
      </Icons>
    </NavBarWrapper>
  );
}
