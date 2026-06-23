import React, { useState, useRef, useEffect, useContext } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import UbicacionPopup from './UbicacionPopup';
import SearchDropdown from './SearchDropdown';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';

/* ── Animaciones ── */
const slideIn = keyframes`
  from { transform: translateX(-100%); }
  to   { transform: translateX(0); }
`;
const slideOut = keyframes`
  from { transform: translateX(0); }
  to   { transform: translateX(-100%); }
`;

/* ── NavBar ── */
const NavBarWrapper = styled.nav`
  background-color: var(--color-blanco);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 48px;
  gap: 80px;
  width: 100%;
  border-bottom: 1px solid var(--color-fondo-beneficio-tarjeta);

  @media (max-width: 768px) {
    padding: 12px 20px;
    gap: 0;
  }
`;

/* Desktop */
const Logo = styled.img`
  height: 30px;
  object-fit: contain;
  flex-shrink: 0;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }

  @media (max-width: 768px) {
    height: 24px;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);

    &:hover {
      transform: translateX(-50%) scale(1.1);
    }
  }
`;

const CenterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 25px;
  flex: 1;

  @media (max-width: 768px) {
    display: none;
  }
`;

const LocationSelector = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #f2d4d4;
  border: none;
  border-radius: 20px;
  padding: 12px 14px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  font-family: var(--font-family-secondary);
  font-size: 13px;
  color: var(--color-marron-tercero);
  transition: background-color 0.2s, transform 0.2s, box-shadow 0.2s;

  &:hover {
    background-color: #e8b8b8;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(62, 1, 2, 0.15);
  }

  &:active {
    transform: translateY(0);
    box-shadow: none;
  }
`;

const searchPulse = keyframes`
  0%   { transform: scale(1) rotate(0deg); }
  30%  { transform: scale(1.18) rotate(-12deg); }
  60%  { transform: scale(1.06) rotate(8deg); }
  100% { transform: scale(1) rotate(0deg); }
`;

const SearchBar = styled.label`
  display: flex;
  align-items: center;
  flex: 1;
  background-color: var(--color-fondo-beneficio-tarjeta);
  border-radius: 20px;
  padding: 12px 16px;
  gap: 8px;
  cursor: text;
  outline: none;
  position: relative; /* Para posicionar el dropdown */
  transition: box-shadow 0.25s ease, background-color 0.25s ease;

  svg {
    transition: transform 0.25s ease;
    transform-origin: 50% 50%;
  }

  &:hover svg {
    animation: ${searchPulse} 0.6s ease;
  }

  &:focus-within {
    outline: none;
    box-shadow: 0 0 0 2px rgba(124, 4, 5, 0.15);
  }

  &:focus-within svg {
    transform: scale(1.12) rotate(-6deg);
  }
`;

const SearchInput = styled.input`
  border: none;
  outline: none;
  flex: 1;
  font-family: var(--font-family-secondary);
  font-size: 13px;
  color: var(--color-marron-tercero);
  background: transparent;

  &:focus-visible {
    outline: none;
  }

  &::placeholder {
    color: var(--color-marron-tercero);
  }
`;

const DesktopIcons = styled.div`
  display: flex;
  align-items: center;
  gap: 25px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    display: none;
  }
`;

/* Mobile */
const MobileLeft = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
  }
`;

const MobileRight = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    gap: 16px;
  }
`;

const MobileLocationBar = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    background-color: var(--color-blanco);
    border-bottom: 1px solid var(--color-fondo-beneficio-tarjeta);
  }
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

const cartBounce = keyframes`
  0%   { transform: translateY(0) rotate(0deg); }
  20%  { transform: translateY(-3px) rotate(-9deg); }
  45%  { transform: translateY(0) rotate(0deg); }
  65%  { transform: translateY(-2px) rotate(7deg); }
  85%  { transform: translateY(0) rotate(-3deg); }
  100% { transform: translateY(0) rotate(0deg); }
`;

const badgePop = keyframes`
  0%   { transform: scale(1); }
  40%  { transform: scale(1.4); }
  70%  { transform: scale(0.92); }
  100% { transform: scale(1); }
`;

const CartButton = styled(IconButton)`
  svg {
    transition: transform 0.25s ease;
    transform-origin: 50% 60%;
  }

  &:hover svg {
    animation: ${cartBounce} 0.65s ease;
  }

  &:hover ${CartBadge} {
    animation: ${badgePop} 0.45s ease;
  }
`;

const SearchButton = styled(IconButton)`
  svg {
    transition: transform 0.25s ease;
    transform-origin: 50% 50%;
  }

  &:hover svg {
    animation: ${searchPulse} 0.6s ease;
  }
`;

const userPop = keyframes`
  0%   { transform: scale(1) translateY(0) rotate(0deg); }
  30%  { transform: scale(1.16) translateY(-2px) rotate(-6deg); }
  60%  { transform: scale(1.05) translateY(0) rotate(5deg); }
  100% { transform: scale(1) translateY(0) rotate(0deg); }
`;

const UserButton = styled(IconButton)`
  svg {
    transition: transform 0.25s ease;
    transform-origin: 50% 60%;
  }

  &:hover svg {
    animation: ${userPop} 0.55s ease;
  }
`;

/* ── Drawer ── */
const Overlay = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: ${({ $open }) => ($open ? 'block' : 'none')};
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    z-index: 100;
  }
`;

const Drawer = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    left: 0;
    width: 80vw;
    max-width: 320px;
    height: 100vh;
    background: var(--color-blanco);
    z-index: 101;
    overflow-y: auto;
    animation: ${({ $open }) =>
    $open
      ? css`${slideIn} 0.28s ease forwards`
      : css`${slideOut} 0.28s ease forwards`};
  }
`;

const DrawerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-fondo-beneficio-tarjeta);
`;

const DrawerLogo = styled.img`
  height: 22px;
  object-fit: contain;
  cursor: pointer;
`;

const DrawerBody = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px 0 32px;
`;

const DrawerItem = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: none;
  border: none;
  border-bottom: 1px solid var(--color-fondo-beneficio-tarjeta);
  cursor: pointer;
  padding: 14px 24px;
  font-family: var(--font-family-secondary);
  font-size: 15px;
  color: var(--color-marron-tercero);
  text-align: left;
  width: 100%;

  &:hover {
    background-color: var(--color-fondo-beneficio-tarjeta);
  }
`;

const DrawerSubItem = styled.a`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 24px 11px 36px;
  font-family: var(--font-family-secondary);
  font-size: 14px;
  color: var(--color-marron-tercero);
  text-decoration: none;
  cursor: pointer;
  border-bottom: 1px solid var(--color-fondo-beneficio-tarjeta);

  &:hover {
    background-color: var(--color-fondo-beneficio-tarjeta);
  }
`;

const SubList = styled.div`
  overflow: hidden;
  max-height: ${({ $open }) => ($open ? '300px' : '0')};
  transition: max-height 0.25s ease;
`;

const OfertasSection = styled.div`
  padding: 8px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const OfertaBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: var(--color-marron-principal);
  color: var(--color-blanco);
  border: none;
  border-radius: 10px;
  padding: 14px 18px;
  font-family: var(--font-family-secondary);
  font-size: 14px;
  cursor: pointer;
  width: 100%;
  text-align: left;
`;

const ChevronIcon = ({ open }) => (
  <svg
    width="12" height="8" viewBox="0 0 12 8" fill="none"
    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}
  >
    <path d="M1 1L6 7L11 1" stroke="var(--color-marron-tercero)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowRight = () => (
  <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
    <path d="M1 1L6 6L1 11" stroke="var(--color-marron-tercero)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PinIcon = () => (
  <svg width="12" height="14" viewBox="0 0 12 15" fill="none">
    <path d="M11.3334 6C11.3334 9.32867 7.64075 12.7953 6.40075 13.866C6.28523 13.9529 6.14461 13.9998 6.00008 13.9998C5.85555 13.9998 5.71493 13.9529 5.59941 13.866C4.35941 12.7953 0.666748 9.32867 0.666748 6C0.666748 4.58551 1.22865 3.22896 2.22885 2.22876C3.22904 1.22857 4.58559 0.666667 6.00008 0.666667C7.41457 0.666667 8.77112 1.22857 9.77132 2.22876C10.7715 3.22896 11.3334 4.58551 11.3334 6Z" stroke="var(--color-marron-tercero)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 8C7.10457 8 8 7.10457 8 6C8 4.89543 7.10457 4 6 4C4.89543 4 4 4.89543 4 6C4 7.10457 4.89543 8 6 8Z" stroke="var(--color-marron-tercero)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SearchIconSvg = () => (
  <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
    <path d="M7 13C10.3137 13 13 10.3137 13 7C13 3.68629 10.3137 1 7 1C3.68629 1 1 3.68629 1 7C1 10.3137 3.68629 13 7 13Z" stroke="var(--color-marron-tercero)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15 15L11.1 11.1" stroke="var(--color-marron-tercero)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const UserIcon = () => (
  <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
    <path d="M16.7071 18.2071C16.5196 18.3946 16.2652 18.5 16 18.5H2C1.73478 18.5 1.48043 18.3946 1.29289 18.2071C1.10536 18.0196 1 17.7652 1 17.5V16.254C1 13.448 4.974 11.25 9 11.25C13.026 11.25 17.004 13.448 17 16.254V17.5C17 17.7652 16.8946 18.0196 16.7071 18.2071Z" stroke="#160000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12.3297 5.98319C12.5108 5.54593 12.604 5.07728 12.604 4.604C12.604 3.64816 12.2243 2.73147 11.5484 2.05559C10.8725 1.37971 9.95584 1 9 1C8.04416 1 7.12747 1.37971 6.45159 2.05559C5.77571 2.73147 5.396 3.64816 5.396 4.604C5.396 5.07728 5.48922 5.54593 5.67034 5.98319C5.85146 6.42045 6.11692 6.81775 6.45159 7.15241C6.78625 7.48707 7.18355 7.75254 7.62081 7.93366C8.05807 8.11478 8.52672 8.208 9 8.208C9.47328 8.208 9.94193 8.11478 10.3792 7.93366C10.8164 7.75254 11.2138 7.48707 11.5484 7.15241C11.8831 6.81775 12.1485 6.42045 12.3297 5.98319Z" stroke="#160000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CartIconSvg = () => (
  <svg width="27" height="27" viewBox="0 0 30 28" fill="none">
    <path d="M8 25.6667C8.55228 25.6667 9 25.219 9 24.6667C9 24.1144 8.55228 23.6667 8 23.6667C7.44772 23.6667 7 24.1144 7 24.6667C7 25.219 7.44772 25.6667 8 25.6667Z" stroke="#160000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19.0005 25.6667C19.5528 25.6667 20.0005 25.219 20.0005 24.6667C20.0005 24.1144 19.5528 23.6667 19.0005 23.6667C18.4482 23.6667 18.0005 24.1144 18.0005 24.6667C18.0005 25.219 18.4482 25.6667 19.0005 25.6667Z" stroke="#160000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2.05005 5.7167H4.05005L6.71005 18.1367C6.80763 18.5916 7.06072 18.9982 7.42576 19.2866C7.7908 19.5749 8.24496 19.727 8.71005 19.7167H18.4901C18.9452 19.716 19.3865 19.56 19.7411 19.2745C20.0956 18.9891 20.3422 18.5912 20.4401 18.1467L22.0901 10.7167H5.12005" stroke="#160000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const HamburgerIcon = () => (
  <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
    <path d="M1 1H21" stroke="var(--color-marron-tercero)" strokeWidth="2" strokeLinecap="round" />
    <path d="M1 8H21" stroke="var(--color-marron-tercero)" strokeWidth="2" strokeLinecap="round" />
    <path d="M1 15H21" stroke="var(--color-marron-tercero)" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M1 1L17 17M17 1L1 17" stroke="var(--color-marron-tercero)" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const UserMenuIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 20" fill="none">
    <path d="M16.7071 18.2071C16.5196 18.3946 16.2652 18.5 16 18.5H2C1.73478 18.5 1.48043 18.3946 1.29289 18.2071C1.10536 18.0196 1 17.7652 1 17.5V16.254C1 13.448 4.974 11.25 9 11.25C13.026 11.25 17.004 13.448 17 16.254V17.5C17 17.7652 16.8946 18.0196 16.7071 18.2071Z" stroke="var(--color-marron-tercero)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12.3297 5.98319C12.5108 5.54593 12.604 5.07728 12.604 4.604C12.604 3.64816 12.2243 2.73147 11.5484 2.05559C10.8725 1.37971 9.95584 1 9 1C8.04416 1 7.12747 1.37971 6.45159 2.05559C5.77571 2.73147 5.396 3.64816 5.396 4.604C5.396 5.07728 5.48922 5.54593 5.67034 5.98319C5.85146 6.42045 6.11692 6.81775 6.45159 7.15241C6.78625 7.48707 7.18355 7.75254 7.62081 7.93366C8.05807 8.11478 8.52672 8.208 9 8.208C9.47328 8.208 9.94193 8.11478 10.3792 7.93366C10.8164 7.75254 11.2138 7.48707 11.5484 7.15241C11.8831 6.81775 12.1485 6.42045 12.3297 5.98319Z" stroke="var(--color-marron-tercero)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.08467 14.6666H3.33333C2.97971 14.6666 2.64057 14.5262 2.39052 14.2761C2.14048 14.0261 2 13.6869 2 13.3333V3.99998C2 3.64636 2.14048 3.30722 2.39052 3.05717C2.64057 2.80712 2.97971 2.66665 3.33333 2.66665H12.6667C13.0203 2.66665 13.3594 2.80712 13.6095 3.05717C13.8595 3.30722 14 3.64636 14 3.99998V7.41665M10.6667 1.33331V3.99998M2 6.66665H14M5.33333 1.33331V3.99998M9.74667 12.5333C9.60641 12.3871 9.49724 12.214 9.42573 12.0244C9.35422 11.8348 9.32187 11.6327 9.33061 11.4303C9.33935 11.2278 9.38902 11.0293 9.4766 10.8466C9.56419 10.6639 9.68789 10.5008 9.84023 10.3672C9.99257 10.2336 10.1704 10.1323 10.363 10.0693C10.5556 10.0063 10.7589 9.98301 10.9607 10.0008C11.1626 10.0185 11.3587 10.077 11.5373 10.1727C11.716 10.2683 11.8733 10.3992 12 10.5573C12.1273 10.4008 12.2848 10.2716 12.4632 10.1774C12.6415 10.0832 12.8371 10.0259 13.0381 10.009C13.2391 9.9921 13.4414 10.0159 13.633 10.079C13.8246 10.1421 14.0015 10.2432 14.1531 10.3763C14.3047 10.5093 14.4279 10.6716 14.5154 10.8533C14.6029 11.0351 14.6528 11.2326 14.6621 11.4341C14.6715 11.6356 14.6401 11.837 14.5699 12.0261C14.4996 12.2151 14.392 12.3881 14.2533 12.5346L12.5027 14.4386C12.4402 14.5106 12.363 14.5682 12.2764 14.6077C12.1897 14.6473 12.0956 14.6677 12.0003 14.6677C11.9051 14.6677 11.8109 14.6473 11.7243 14.6077C11.6376 14.5682 11.5605 14.5106 11.498 14.4386L9.74667 12.5333Z" stroke="white" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const GiftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="9" width="20" height="13" rx="1" stroke="var(--color-blanco)" strokeWidth="1.8" />
    <path d="M12 9V22" stroke="var(--color-blanco)" strokeWidth="1.8" />
    <path d="M2 13H22" stroke="var(--color-blanco)" strokeWidth="1.8" />
    <path d="M12 9C12 9 9 9 9 6.5C9 4 12 4 12 6.5" stroke="var(--color-blanco)" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M12 9C12 9 15 9 15 6.5C15 4 12 4 12 6.5" stroke="var(--color-blanco)" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const RocketIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.3334 1.33332V3.99999M14.6667 2.66666H12M7.34472 1.87599C7.37328 1.72306 7.45443 1.58493 7.57412 1.48553C7.6938 1.38614 7.84447 1.33173 8.00005 1.33173C8.15563 1.33173 8.3063 1.38614 8.42599 1.48553C8.54567 1.58493 8.62682 1.72306 8.65538 1.87599L9.35605 5.58132C9.40581 5.84475 9.53383 6.08707 9.7234 6.27664C9.91297 6.46621 10.1553 6.59423 10.4187 6.64399L14.1241 7.34466C14.277 7.37322 14.4151 7.45437 14.5145 7.57405C14.6139 7.69374 14.6683 7.84441 14.6683 7.99999C14.6683 8.15557 14.6139 8.30624 14.5145 8.42592C14.4151 8.54561 14.277 8.62676 14.1241 8.65532L10.4187 9.35599C10.1553 9.40575 9.91297 9.53377 9.7234 9.72334C9.53383 9.91291 9.40581 10.1552 9.35605 10.4187L8.65538 14.124C8.62682 14.2769 8.54567 14.415 8.42599 14.5144C8.3063 14.6138 8.15563 14.6683 8.00005 14.6683C7.84447 14.6683 7.6938 14.6138 7.57412 14.5144C7.45443 14.415 7.37328 14.2769 7.34472 14.124L6.64405 10.4187C6.59429 10.1552 6.46627 9.91291 6.2767 9.72334C6.08713 9.53377 5.84482 9.40575 5.58138 9.35599L1.87605 8.65532C1.72312 8.62676 1.58499 8.54561 1.4856 8.42592C1.3862 8.30624 1.33179 8.15557 1.33179 7.99999C1.33179 7.84441 1.3862 7.69374 1.4856 7.57405C1.58499 7.45437 1.72312 7.37322 1.87605 7.34466L5.58138 6.64399C5.84482 6.59423 6.08713 6.46621 6.2767 6.27664C6.46627 6.08707 6.59429 5.84475 6.64405 5.58132L7.34472 1.87599ZM4.00005 13.3333C4.00005 14.0697 3.4031 14.6667 2.66672 14.6667C1.93034 14.6667 1.33338 14.0697 1.33338 13.3333C1.33338 12.5969 1.93034 12 2.66672 12C3.4031 12 4.00005 12.5969 4.00005 13.3333Z" stroke="white" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const menu = [
  {
    label: 'Perfumería',
    sub: ['Dermocosmética', 'Fragancias', 'Maquillaje', 'Cuidado personal'],
  },
  { label: 'Hogar', sub: [] },
  { label: 'Electro belleza', sub: [] },
];

export default function NavBar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMounted, setDrawerMounted] = useState(false);
  const [openSection, setOpenSection] = useState(null);
  const [ubicacionOpen, setUbicacionOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileSearchFocused, setMobileSearchFocused] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const searchContainerRef = useRef(null);
  const mobileSearchContainerRef = useRef(null);
  const { itemCount } = useContext(CartContext);
  const { isAuthenticated, openAuthModal } = useContext(AuthContext);

  const goToAccount = () => {
    if (isAuthenticated) {
      navigate('/mi-cuenta');
    } else {
      openAuthModal('/mi-cuenta');
    }
  };

  // Sync input with current search param on mount or URL change
  useEffect(() => {
    const q = searchParams.get('busqueda') || '';
    setSearchQuery(q);
  }, [searchParams, location]);

  // Click outside listener para desktop
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Click outside listener para mobile
  useEffect(() => {
    const handleClickOutsideMobile = (event) => {
      if (mobileSearchContainerRef.current && !mobileSearchContainerRef.current.contains(event.target)) {
        setMobileSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutsideMobile);
    return () => document.removeEventListener('mousedown', handleClickOutsideMobile);
  }, []);

  // Bloquear scroll de la página cuando el menú móvil está abierto
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      const q = searchQuery.trim();
      if (q) {
        navigate(`/tienda?busqueda=${encodeURIComponent(q)}`);
      }
      setSearchFocused(false);
      setMobileSearchFocused(false);
      setMobileSearchOpen(false);
    }
  };

  const openDrawer = () => { setDrawerMounted(true); setDrawerOpen(true); };
  const closeDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setDrawerMounted(false), 300);
  };

  const handleLogoClick = () => {
    navigate('/inicio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (drawerOpen) {
      closeDrawer();
    }
  };

  const toggleSection = (label) =>
    setOpenSection((prev) => (prev === label ? null : label));

  return (
    <>
      {/* Mobile: ubicación centrada */}
      <MobileLocationBar>
        <LocationSelector
          onClick={() => setUbicacionOpen(true)}
          style={{ width: '100%', borderRadius: 0, justifyContent: 'center', padding: '10px 16px' }}
        >
          <PinIcon />
          Ubicación seleccionada
        </LocationSelector>
      </MobileLocationBar>

      <NavBarWrapper>
        {/* Mobile: hamburguesa */}
        <MobileLeft>
          <IconButton onClick={openDrawer} aria-label="Menú">
            <HamburgerIcon />
          </IconButton>
        </MobileLeft>

        {/* Logo */}
        <Logo src="/logo-marybe.png" alt="Marybe" onClick={handleLogoClick} width="200" height="40" />

        {/* Desktop: centro */}
        <CenterGroup>
          <LocationSelector onClick={() => setUbicacionOpen(true)}>
            <PinIcon />
            Ubicación seleccionada
          </LocationSelector>
          <SearchBar ref={searchContainerRef}>
            <SearchIconSvg />
            <SearchInput
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              onFocus={() => setSearchFocused(true)}
              aria-label="Buscar en la tienda"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                aria-label="Limpiar búsqueda"
                style={{ color: 'var(--color-marron-tercero)', fontSize: '1rem', lineHeight: 1 }}
              >×</button>
            )}
            {searchFocused && searchQuery.trim().length >= 2 && (
              <SearchDropdown
                query={searchQuery}
                onClose={() => setSearchFocused(false)}
              />
            )}
          </SearchBar>
        </CenterGroup>

        {/* Desktop: iconos */}
        <DesktopIcons>
          <UserButton aria-label="Mi cuenta" onClick={goToAccount}><UserIcon /></UserButton>
          <CartButton aria-label="Carrito" onClick={() => navigate('/carrito')}>
            <CartIconSvg />
            {itemCount > 0 && <CartBadge>{itemCount}</CartBadge>}
          </CartButton>
        </DesktopIcons>

        {/* Mobile: búsqueda + carrito */}
        <MobileRight>
          <SearchButton aria-label="Buscar" onClick={() => setMobileSearchOpen(prev => !prev)}>
            <SearchIconSvg />
          </SearchButton>
          <CartButton aria-label="Carrito" onClick={() => navigate('/carrito')}>
            <CartIconSvg />
            {itemCount > 0 && <CartBadge>{itemCount}</CartBadge>}
          </CartButton>
        </MobileRight>
      </NavBarWrapper>

      {/* Barra de búsqueda mobile expandible */}
      {mobileSearchOpen && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', backgroundColor: 'var(--color-blanco)', borderBottom: '1px solid var(--color-fondo-beneficio-tarjeta)' }}>
          <SearchBar ref={mobileSearchContainerRef} style={{ flex: 1, margin: 0 }}>
            <SearchIconSvg />
            <SearchInput
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              onFocus={() => setMobileSearchFocused(true)}
              autoFocus
              aria-label="Buscar en la tienda"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ color: 'var(--color-marron-tercero)', fontSize: '1rem', lineHeight: 1 }}>×</button>
            )}
            {mobileSearchFocused && searchQuery.trim().length >= 2 && (
              <SearchDropdown
                query={searchQuery}
                onClose={() => {
                  setMobileSearchFocused(false);
                  setMobileSearchOpen(false);
                }}
              />
            )}
          </SearchBar>
          <button
            onClick={handleSearch}
            style={{ backgroundColor: 'var(--color-marron-cuarto)', color: 'white', padding: '10px 16px', borderRadius: 20, fontFamily: 'var(--font-family-secondary)', fontSize: '0.85rem', flexShrink: 0 }}
          >
            Buscar
          </button>
        </div>
      )}

      {/* Popup ubicación */}
      {ubicacionOpen && <UbicacionPopup onClose={() => setUbicacionOpen(false)} />}

      {/* Drawer mobile */}
      {drawerMounted && (
        <>
          <Overlay $open={drawerOpen} onClick={closeDrawer} />
          <Drawer $open={drawerOpen}>
            <DrawerHeader>
              <IconButton onClick={closeDrawer} aria-label="Cerrar">
                <CloseIcon />
              </IconButton>
              <DrawerLogo src="/logo-marybe.png" alt="Marybe" onClick={handleLogoClick} width="200" height="40" />
              <CartButton aria-label="Carrito" onClick={() => { closeDrawer(); navigate('/carrito'); }}>
                <CartIconSvg />
                {itemCount > 0 && <CartBadge>{itemCount}</CartBadge>}
              </CartButton>
            </DrawerHeader>

            <DrawerBody>
              <DrawerItem onClick={() => { goToAccount(); closeDrawer(); }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <UserMenuIcon /> Mi Perfil
                </span>
              </DrawerItem>

              {menu.map(({ label, sub }) => (
                <div key={label}>
                  <DrawerItem onClick={() => sub.length ? toggleSection(label) : closeDrawer()}>
                    <span style={{ fontWeight: 500 }}>{label}</span>
                    {sub.length > 0 && <ChevronIcon open={openSection === label} />}
                  </DrawerItem>
                  {sub.length > 0 && (
                    <SubList $open={openSection === label}>
                      {sub.map((s) => (
                        <DrawerSubItem key={s} onClick={() => closeDrawer()}>
                          {s} <ArrowRight />
                        </DrawerSubItem>
                      ))}
                    </SubList>
                  )}
                </div>
              ))}

              <DrawerItem style={{ borderTop: '1px solid var(--color-fondo-beneficio-tarjeta)', marginTop: 8, paddingTop: 16 }} onClick={() => { navigate('/ofertas'); closeDrawer(); }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>Ofertas</span>
              </DrawerItem>

              <OfertasSection>
                <OfertaBtn onClick={() => { navigate('/eventos'); closeDrawer(); }}><CalendarIcon /> Próximos eventos</OfertaBtn>
                <OfertaBtn onClick={() => { navigate('/canjear-gift-card'); closeDrawer(); }}><GiftIcon /> Gift cards</OfertaBtn>
                <OfertaBtn onClick={() => { navigate('/lanzamientos'); closeDrawer(); }}><RocketIcon /> Lanzamientos</OfertaBtn>
              </OfertasSection>

              <DrawerItem onClick={() => { navigate('/sucursales'); closeDrawer(); }}>Nuestros locales</DrawerItem>
              <DrawerItem onClick={() => { navigate('/nuestra-historia'); closeDrawer(); }}>Sobre Marybe</DrawerItem>
            </DrawerBody>
          </Drawer>
        </>
      )}
    </>
  );
}
