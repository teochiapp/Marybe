import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

// ─── Datos ────────────────────────────────────────────────────────────────────

const ALL_CATEGORIES = [
  'Ofertas', 'Lanzamientos', 'Dermocosmética', 'Fragancias',
  'Maquillaje', 'Cuidado personal', 'Niños y bebés',
  'Limpieza de hogar', 'Electro belleza',
];

const MOBILE_FEATURED = [
  { label: 'Perfumería', active: true },
  { label: 'Hogar',      active: false },
];

// Columnas placeholder — todas las categorías usan las mismas por ahora
const MEGA_COLUMNS = [
  { title: 'Cocina',                    items: ['Detergentes', 'Lava vajillas', 'Limpieza de superficies'] },
  { title: 'Baño',                      items: ['Desinfectantes', 'Pastillas de inodoro'] },
  { title: 'Pisos y muebles',           items: ['Lavandina', 'Desinfectantes', 'Aromatizantes', 'Lustramuebles', 'Ceras y autobrillos'] },
  { title: 'Insecticidas y repelentes', items: ['Aerosoles', 'Repelentes', 'Aparatos y cebos'] },
  { title: 'Ropa',                      items: ['Jabones líquidos', 'Suavizantes'] },
  { title: 'Calzado',                   items: ['Brillos limpiadores', 'Pomadas'] },
  { title: 'Desodorante de ambiente',   items: ['Aromatizantes', 'Desinfectantes'] },
  { title: 'Papeles',                   items: ['Pañuelos', 'Papel higiénico', 'Rollos de cocina', 'Servilletas'] },
  { title: 'Accesorios de limpieza',    items: ['Mopas', 'Escobas', 'Esponjas', 'Guantes', 'Palas y cabos', 'Trapos de pisos y paños multiuso'] },
];

// ─── Styled Components ────────────────────────────────────────────────────────

const NavWrapper = styled.div`
  position: relative;
  width: 100%;

  @media (max-width: 768px) {
    display: none;
  }
`;

const DesktopNav = styled.nav`
  width: 100%;
  background-color: var(--color-blanco);
  border-bottom: 1px solid var(--color-fondo-beneficio-tarjeta);
`;

const CategoryList = styled.ul`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  list-style: none;
  margin: 0;
  padding: 0 16px;
  white-space: nowrap;
  overflow-x: auto;

  &::-webkit-scrollbar { display: none; }
`;

const CategoryItem = styled.li`
  position: relative;
`;

const CategoryBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 12px 14px;
  background: none;
  border: none;
  border-bottom: 2px solid ${({ $active }) => ($active ? 'var(--color-bordo-secundario)' : 'transparent')};
  font-family: var(--font-family-secondary);
  font-size: 13px;
  font-weight: 500;
  color: ${({ $active }) => ($active ? 'var(--color-bordo-secundario)' : 'var(--color-marron-tercero)')};
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
  white-space: nowrap;

  &:hover {
    color: var(--color-bordo-secundario);
  }
`;

const ChevronRight = ({ active }) => (
  <svg
    width="10" height="10" viewBox="0 0 12 8" fill="none"
    style={{
      transform: active ? 'rotate(180deg)' : 'rotate(-90deg)',
      transition: 'transform 0.2s',
      opacity: 0.6,
    }}
  >
    <path d="M1 1L6 7L11 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H15V15H9V21H4C3.44772 21 3 20.5523 3 20V9.5Z" stroke="var(--color-bordo-secundario)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ─── Mega menu ────────────────────────────────────────────────────────────────

/* Contenedor absoluto común para ambos paneles */
const DropdownContainer = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 200;
`;

const MegaMenuWrapper = styled.div`
  background-color: var(--color-blanco);
  border-radius: var(--radius-lg);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  padding: 28px 48px 32px;
`;

/* Barra de acciones — contenedor separado debajo del mega menu */
const BottomActionBar = styled.div`
  background-color: var(--color-blanco);
  border-radius: var(--radius-full);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
  white-space: nowrap;
`;

const MegaTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
`;

const MegaTitleText = styled.h3`
  font-family: var(--font-family-primary);
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--color-bordo-secundario);
  margin: 0;
`;

const MegaGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 24px 40px;
`;

const MegaColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const MegaColumnTitle = styled.span`
  font-family: var(--font-family-secondary);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-bordo-secundario);
  margin-bottom: 2px;
`;

const MegaLink = styled.a`
  font-family: var(--font-family-secondary);
  font-size: 13px;
  color: var(--color-marron-secundario);
  text-decoration: none;
  cursor: pointer;
  transition: color 0.15s;
  line-height: 1.4;

  &:hover {
    color: var(--color-bordo-secundario);
  }
`;

const MegaActionBtn = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: var(--color-marron-principal);
  color: var(--color-blanco);
  border-radius: var(--radius-full);
  padding: 10px 20px;
  font-family: var(--font-family-secondary);
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: var(--transition-fast);

  &:hover {
    background-color: var(--color-bordo-secundario);
  }
`;

const MegaTextLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--color-marron-tercero);
  font-family: var(--font-family-secondary);
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  padding: 10px 16px;
  transition: color 0.15s;

  &:hover {
    color: var(--color-bordo-secundario);
  }
`;

const MegaSeparator = styled.div`
  flex: 1;
`;

// ─── Íconos barra inferior ────────────────────────────────────────────────────

const CalendarIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <path d="M8.08 14.67H3.33A1.33 1.33 0 0 1 2 13.33V4a1.33 1.33 0 0 1 1.33-1.33h9.34A1.33 1.33 0 0 1 14 4v3.42M10.67 1.33V4M2 6.67h12M5.33 1.33V4" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9.75 12.53c-.14-.15-.25-.32-.32-.51a1.6 1.6 0 0 1 .31-1.74 1.6 1.6 0 0 1 2.27 0 1.6 1.6 0 0 1 2.27 0 1.6 1.6 0 0 1 0 2.27l-1.75 1.9a.67.67 0 0 1-.98 0l-1.8-1.92Z" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const GiftIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="9" width="20" height="13" rx="1" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M12 9V22M2 13h20M12 9c0 0-3 0-3-2.5S12 4 12 6.5M12 9c0 0 3 0 3-2.5S12 4 12 6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const RocketIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <path d="M13.33 1.33V4M14.67 2.67H12M7.34 1.88a1 1 0 0 1 1.32 0l.65 3.71a2 2 0 0 0 1.46 1.46l3.71.65a1 1 0 0 1 0 1.32l-3.71.65A2 2 0 0 0 9.31 11l-.65 3.71a1 1 0 0 1-1.32 0L6.69 11a2 2 0 0 0-1.46-1.46L1.52 8.9a1 1 0 0 1 0-1.32l3.71-.65A2 2 0 0 0 6.69 5.6l.65-3.71ZM4 13.33a1.33 1.33 0 1 1-2.67 0 1.33 1.33 0 0 1 2.67 0Z" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PinIconSmall = () => (
  <svg width="14" height="14" viewBox="0 0 12 15" fill="none">
    <path d="M11.33 6c0 3.33-3.69 6.8-4.93 7.87a1 1 0 0 1-1.27 0C3.93 12.8.67 9.33.67 6a5.33 5.33 0 1 1 10.66 0Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BuildingIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M3 21h18M3 7l9-4 9 4M4 21V7M20 21V7M8 21v-4h3v4M13 21v-4h3v4M8 11h2v2H8zM14 11h2v2h-2zM8 15h2v2H8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChatIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ─── Mobile ───────────────────────────────────────────────────────────────────

const MobileNav = styled.nav`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    justify-content: center;
    padding: 12px 16px;
    background-color: var(--color-blanco);
    border-bottom: 1px solid var(--color-fondo-beneficio-tarjeta);
  }
`;

const SegmentedControl = styled.div`
  display: flex;
  background-color: var(--color-blanco);
  border-radius: 200px;
  padding: 4px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  width: calc(100% - 32px);
  max-width: 340px;
`;

const MobilePill = styled.a`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border-radius: 40px;
  font-family: var(--font-family-secondary);
  font-size: 0.95rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;

  background-color: ${({ $active }) => $active ? 'var(--color-marron-principal)' : 'transparent'};
  color: ${({ $active }) => $active ? 'var(--color-blanco)' : 'var(--color-marron-principal)'};

  &:hover {
    background-color: ${({ $active }) => $active ? 'var(--color-marron-principal)' : 'rgba(0,0,0,0.03)'};
  }
`;

// ─── Componente ───────────────────────────────────────────────────────────────

export default function CategoryNav() {
  const [activeCategory, setActiveCategory] = useState(null);
  const navRef = useRef(null);

  const handleCategoryClick = (cat) => {
    setActiveCategory((prev) => (prev === cat ? null : cat));
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setActiveCategory(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* Desktop */}
      <NavWrapper ref={navRef}>
        <DesktopNav>
          <CategoryList>
            {ALL_CATEGORIES.map((cat) => (
              <CategoryItem key={cat}>
                <CategoryBtn
                  $active={activeCategory === cat}
                  onClick={() => handleCategoryClick(cat)}
                >
                  {cat}
                  <ChevronRight active={activeCategory === cat} />
                </CategoryBtn>
              </CategoryItem>
            ))}
          </CategoryList>
        </DesktopNav>

        {activeCategory && (
          <DropdownContainer>
            {/* Panel 1: grid de subcategorías */}
            <MegaMenuWrapper>
              <MegaTitle>
                <HomeIcon />
                <MegaTitleText>{activeCategory}</MegaTitleText>
              </MegaTitle>

              <MegaGrid>
                {MEGA_COLUMNS.map((col) => (
                  <MegaColumn key={col.title}>
                    <MegaColumnTitle>{col.title}</MegaColumnTitle>
                    {col.items.map((item) => (
                      <MegaLink key={item} href="#">{item}</MegaLink>
                    ))}
                  </MegaColumn>
                ))}
              </MegaGrid>
            </MegaMenuWrapper>

            {/* Panel 2: barra de acciones */}
            <BottomActionBar>
              <MegaActionBtn href="#"><CalendarIcon /> Próximos eventos</MegaActionBtn>
              <MegaActionBtn href="#"><GiftIcon /> Gift cards</MegaActionBtn>
              <MegaActionBtn href="#"><RocketIcon /> Lanzamientos</MegaActionBtn>
              <MegaTextLink href="#"><PinIconSmall /> Nuestros Locales</MegaTextLink>
              <MegaTextLink href="#"><BuildingIcon /> Sobre Marybe</MegaTextLink>
              <MegaTextLink href="#"><ChatIcon /> Contacto</MegaTextLink>
            </BottomActionBar>
          </DropdownContainer>
        )}
      </NavWrapper>

      {/* Mobile */}
      <MobileNav>
        <SegmentedControl>
          {MOBILE_FEATURED.map(({ label, active }) => (
            <MobilePill key={label} href="#" $active={active}>
              {label}
            </MobilePill>
          ))}
        </SegmentedControl>
      </MobileNav>
    </>
  );
}
