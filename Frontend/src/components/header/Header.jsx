import React from 'react';
import TopBar from './TopBar';
import NavBar from './NavBar';
import CategoryNav from './CategoryNav';

export default function Header() {
  return (
    <header>
      <TopBar />
      <NavBar />
      <CategoryNav />
    </header>
  );
}