import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import TopBar from './TopBar';
import NavBar from './NavBar';
import CategoryNav from './CategoryNav';

/* ── Styled Components ── */

const HeaderWrapper = styled.header`
  position: relative;
  width: 100%;
  z-index: 500;
`;

const StickyShell = styled.div`
  position: ${({ $sticky }) => ($sticky ? 'fixed' : 'relative')};
  top: 0;
  left: 0;
  right: 0;
  z-index: 500;
  width: 100%;
  transition: box-shadow 0.3s ease;
  background-color: var(--color-blanco);
  box-shadow: ${({ $sticky }) =>
    $sticky ? '0 2px 20px rgba(22, 0, 0, 0.10)' : 'none'};
`;

const TopBarSlide = styled.div`
  overflow: hidden;
  max-height: ${({ $hidden }) => ($hidden ? '0px' : '60px')};
  opacity: ${({ $hidden }) => ($hidden ? 0 : 1)};
  transition: max-height 0.35s ease, opacity 0.25s ease;
`;

/* Placeholder que ocupa el espacio del header cuando es fixed para evitar layout shift */
const HeaderPlaceholder = styled.div`
  height: ${({ $height }) => $height}px;
  display: ${({ $active }) => ($active ? 'block' : 'none')};
`;

export default function Header() {
  const [isSticky, setIsSticky] = useState(false);
  const [topBarHidden, setTopBarHidden] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef(null);
  const topBarRef = useRef(null);
  const topBarHeightRef = useRef(44);

  useEffect(() => {
    const updateHeight = () => {
      if (headerRef.current) {
        const h = headerRef.current.offsetHeight;
        setHeaderHeight(h);
        document.documentElement.style.setProperty('--header-height', h + 'px');
      }
      if (topBarRef.current) {
        topBarHeightRef.current = topBarRef.current.offsetHeight;
      }
    };

    updateHeight();

    const handleScroll = () => {
      const topBarH = topBarHeightRef.current;
      const scrollY = window.scrollY;

      // Ocultar TopBar y activar sticky cuando se scrollea más de la altura del TopBar
      if (scrollY > topBarH) {
        setTopBarHidden(true);
        setIsSticky(true);
      } else {
        setTopBarHidden(false);
        setIsSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateHeight);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  // Recalcular la altura cuando cambia el estado de sticky
  useEffect(() => {
    if (headerRef.current) {
      const h = headerRef.current.offsetHeight;
      setHeaderHeight(h);
      document.documentElement.style.setProperty('--header-height', h + 'px');
    }
  }, [topBarHidden]);

  return (
    <>
      <HeaderWrapper>
        <StickyShell $sticky={isSticky} ref={headerRef}>
          <TopBarSlide $hidden={topBarHidden} ref={topBarRef}>
            <TopBar />
          </TopBarSlide>
          <NavBar />
          <CategoryNav />
        </StickyShell>
      </HeaderWrapper>
      <HeaderPlaceholder $active={isSticky} $height={headerHeight} />
    </>
  );
}