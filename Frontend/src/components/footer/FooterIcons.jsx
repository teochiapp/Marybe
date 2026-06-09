import React from 'react';

export const PinIcon = () => (
  <svg width="14" height="17" viewBox="0 0 12 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.3334 6C11.3334 9.32867 7.64075 12.7953 6.40075 13.866C6.28523 13.9529 6.14461 13.9998 6.00008 13.9998C5.85555 13.9998 5.71493 13.9529 5.59941 13.866C4.35941 12.7953 0.666748 9.32867 0.666748 6C0.666748 4.58551 1.22865 3.22896 2.22885 2.22876C3.22904 1.22857 4.58559 0.666667 6.00008 0.666667C7.41457 0.666667 8.77112 1.22857 9.77132 2.22876C10.7715 3.22896 11.3334 4.58551 11.3334 6Z" stroke="var(--color-rosa-tercero)" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 8C7.10457 8 8 7.10457 8 6C8 4.89543 7.10457 4 6 4C4.89543 4 4 4.89543 4 6C4 7.10457 4.89543 8 6 8Z" stroke="var(--color-rosa-tercero)" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ChevronIcon = ({ open }) => (
  <svg
    width="12" height="8" viewBox="0 0 12 8" fill="none"
    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease', flexShrink: 0 }}
  >
    <path d="M1 1L6 7L11 1" stroke="var(--color-rosa-tercero)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const DataFiscalQR = () => (
  <svg width="72" height="72" viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
    <rect width="72" height="72" rx="6" fill="#1a6eb5" />
    <rect x="6" y="6" width="24" height="24" rx="2" fill="white" />
    <rect x="10" y="10" width="16" height="16" rx="1" fill="#1a6eb5" />
    <rect x="13" y="13" width="10" height="10" fill="white" />
    <rect x="42" y="6" width="24" height="24" rx="2" fill="white" />
    <rect x="46" y="10" width="16" height="16" rx="1" fill="#1a6eb5" />
    <rect x="49" y="13" width="10" height="10" fill="white" />
    <rect x="6" y="42" width="24" height="24" rx="2" fill="white" />
    <rect x="10" y="46" width="16" height="16" rx="1" fill="#1a6eb5" />
    <rect x="13" y="49" width="10" height="10" fill="white" />
    <rect x="34" y="34" width="4" height="4" fill="white" />
    <rect x="40" y="34" width="4" height="4" fill="white" />
    <rect x="46" y="34" width="4" height="4" fill="white" />
    <rect x="52" y="34" width="4" height="4" fill="white" />
    <rect x="58" y="34" width="8" height="4" fill="white" />
    <rect x="34" y="40" width="4" height="4" fill="white" />
    <rect x="40" y="40" width="8" height="4" fill="white" />
    <rect x="52" y="40" width="4" height="4" fill="white" />
    <rect x="34" y="46" width="8" height="4" fill="white" />
    <rect x="46" y="46" width="4" height="4" fill="white" />
    <rect x="54" y="46" width="4" height="4" fill="white" />
    <rect x="60" y="46" width="6" height="4" fill="white" />
    <rect x="34" y="52" width="4" height="4" fill="white" />
    <rect x="42" y="52" width="4" height="4" fill="white" />
    <rect x="50" y="52" width="4" height="4" fill="white" />
    <rect x="58" y="52" width="8" height="4" fill="white" />
    <rect x="34" y="58" width="8" height="8" fill="white" />
    <rect x="46" y="58" width="4" height="8" fill="white" />
    <rect x="54" y="58" width="12" height="8" fill="white" />
    <text x="36" y="71" fontFamily="Arial" fontSize="5" fill="white" textAnchor="middle">DATA FISCAL</text>
  </svg>
);
