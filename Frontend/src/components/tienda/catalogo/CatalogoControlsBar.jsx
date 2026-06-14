import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

// ─── Styled Components ────────────────────────────────────────────────────────

const ControlsBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;

  @media (max-width: 1024px) {
    /* En mobile, agrupar botones juntos */
    .mobile-controls {
      display: flex;
      width: 100%;
      justify-content: space-between;
      gap: 10px;
    }
    .desktop-title {
      display: none;
    }
  }

  h1 {
    font-size: 1.8rem;
    color: var(--color-marron-principal);
    margin: 0;
    font-weight: 700;
  }

  p {
    font-size: 0.9rem;
    color: #7a7a7a;
    margin: 0;
  }
`;

const MobileFiltersBtn = styled.button`
  display: none;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #535353;
  cursor: pointer;

  svg {
    width: 16px;
    height: 16px;
  }

  @media (max-width: 1024px) {
    display: flex;
  }
`;

const SortDropdown = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #C8C0BB;
  border-radius: 20px;
  padding: 8px 16px;
  background-color: white;
  cursor: pointer;

  span {
    font-size: 0.9rem;
    font-weight: 500;
    color: #606062;
    margin-right: 4px;
    user-select: none;
  }
`;

const SortMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: white;
  border: 1px solid #C8C0BB;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 8px 0;
  min-width: 200px;
  z-index: 100;
  display: flex;
  flex-direction: column;
`;

const SortOption = styled.button`
  background: none;
  border: none;
  padding: 10px 16px;
  text-align: left;
  font-size: 0.9rem;
  font-weight: 500;
  color: ${({ $active }) => ($active ? 'var(--color-bordo-secundario)' : '#606062')};
  background-color: ${({ $active }) => ($active ? '#fff6f6' : 'transparent')};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #f5f5f5;
  }
`;

// ─── Componente ───────────────────────────────────────────────────────────────

export default function CatalogoControlsBar({ activeSeccion, loading, total, activeSort, onSortChange, onToggleMobileFilters }) {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSortSelect = (value, e) => {
    e.stopPropagation();
    onSortChange(value);
    setIsSortOpen(false);
  };
  return (
    <ControlsBar>
      <div className="desktop-title">
        <h1>{activeSeccion || 'Tienda'}</h1>
        <p>
          {loading ? 'Cargando catálogo...' : `${total.toLocaleString('es-AR')} resultados`}
        </p>
      </div>

      <div className="mobile-controls">
        <MobileFiltersBtn onClick={onToggleMobileFilters}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          Filtros
        </MobileFiltersBtn>

        <SortDropdown ref={sortRef} onClick={() => setIsSortOpen((prev) => !prev)}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.33333 5.33335L4.66667 2.66669L2 5.33335M4.66667 2.66669V13.3334M7.33333 8.00002H10M7.33333 10.6667H12M7.33333 13.3334H14" stroke="#606062" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>
            {activeSort === 'nombre:asc' ? 'Nombre A→Z' :
             activeSort === 'nombre:desc' ? 'Nombre Z→A' :
             activeSort === 'precio:asc' ? 'Precio Menor a Mayor' :
             activeSort === 'precio:desc' ? 'Precio Mayor a Menor' :
             activeSort === 'createdAt:desc' ? 'Lanzamientos' : 'Más relevante'}
          </span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#606062" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isSortOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>

          {isSortOpen && (
            <SortMenu>
              <SortOption $active={activeSort === 'nombre:asc'} onClick={(e) => handleSortSelect('nombre:asc', e)}>Nombre A→Z</SortOption>
              <SortOption $active={activeSort === 'nombre:desc'} onClick={(e) => handleSortSelect('nombre:desc', e)}>Nombre Z→A</SortOption>
              <SortOption $active={activeSort === 'precio:asc'} onClick={(e) => handleSortSelect('precio:asc', e)}>Precio Menor a Mayor</SortOption>
              <SortOption $active={activeSort === 'precio:desc'} onClick={(e) => handleSortSelect('precio:desc', e)}>Precio Mayor a Menor</SortOption>
              <SortOption $active={activeSort === 'createdAt:desc'} onClick={(e) => handleSortSelect('createdAt:desc', e)}>Lanzamientos</SortOption>
            </SortMenu>
          )}
        </SortDropdown>
      </div>
    </ControlsBar>
  );
}
