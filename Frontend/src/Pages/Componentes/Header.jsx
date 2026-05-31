import React from 'react';
import TopBar from './componentes-header/TopBar';
import NavBar from './componentes-header/NavBar';

export default function Header() {
  return (
    <header>
      <TopBar />
      <NavBar />
    </header>
  );
}