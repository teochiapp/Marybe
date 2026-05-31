import React from 'react';
import TopBar from './componentes-header/TopBar';
import NavBar from './componentes-header/NavBar';
import CategoryNav from './componentes-header/CategoryNav';

export default function Header() {
  return (
    <header>
      <TopBar />
      <NavBar />
      <CategoryNav />
    </header>
  );
}