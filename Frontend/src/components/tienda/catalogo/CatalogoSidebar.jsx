import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import PriceRangeSlider from './PriceRangeSlider';

const STRAPI_URL = process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337';

// ─── Icons ────────────────────────────────────────────────────────────────────
const ChevronIcon = () => (
  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block' }}>
    <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BackIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── Styled Components ────────────────────────────────────────────────────────

const Sidebar = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: sticky;
  top: 30px;
  max-height: calc(100vh - 60px);
  align-self: start;

  @media (max-width: 1024px) {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    max-height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    z-index: 9999;
    opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
    pointer-events: ${({ $isOpen }) => ($isOpen ? 'auto' : 'none')};
    transition: opacity 0.3s ease;
    justify-content: flex-end;
  }
`;

const FilterCard = styled.div`
  background-color: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  border: 1px solid #ece9e4;
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 100%;
  overflow: hidden;

  @media (max-width: 1024px) {
    border-radius: 20px 20px 0 0;
    height: 85vh;
    transform: translateY(${({ $isOpen }) => ($isOpen ? '0' : '100%')});
    transition: transform 0.3s ease;
    padding-bottom: 40px;
  }
`;

const SidebarTitle = styled.h3`
  font-family: var(--font-family-secondary);
  font-size: 1rem;
  font-weight: 400;
  color: var(--color-negro);
  margin-bottom: 20px;
  letter-spacing: 0%;
`;

const FilterCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-shrink: 0;

  ${SidebarTitle} {
    margin-bottom: 0;
  }
`;

const MobileCloseBtn = styled.button`
  display: none;
  font-size: 1.5rem;
  color: var(--color-negro);
  cursor: pointer;
  line-height: 1;

  @media (max-width: 1024px) {
    display: block;
  }
`;

const ScrollableFilters = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
  margin-right: -8px;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: var(--color-marron-principal); border-radius: 10px; }
  &::-webkit-scrollbar-thumb:hover { background: var(--color-marron-principal); }
`;

const ActiveFiltersWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
  flex-shrink: 0;
`;

const FilterTagsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 25px;
`;

const FilterTag = styled.span`
  background-color: #F2D4D4;
  color: #7C0405;
  padding: 6px 12px;
  border-radius: var(--radius-full);
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid rgba(124, 4, 5, 0.1);

  button {
    font-size: 0.9rem;
    font-weight: bold;
    color: var(--color-bordo-secundario);
    line-height: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    &:hover { color: var(--color-marron-principal); }
  }
`;

const ClearAllBtn = styled.button`
  font-size: 0.85rem;
  font-weight: 600;
  color: #535353;
  transition: color 0.15s;
  &:hover { color: var(--color-marron-principal); }
`;

const AccordionItem = styled.div`
  border-top: 1px solid #ece9e4;
  padding: 10px 0;
  &:last-child { padding-bottom: 0; }
`;

const AccordionHeader = styled.button`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.95rem;
  font-weight: 400;
  color: #160000;
  text-align: left;
  cursor: pointer;
`;

const AccordionChevron = styled.span`
  font-size: 0.8rem;
  transition: transform 0.2s;
  transform: ${({ $open }) => ($open ? 'rotate(180deg)' : 'rotate(0deg)')};
  opacity: 0.6;
`;

const AccordionContent = styled.div`
  margin-top: ${({ $open }) => ($open ? '14px' : '0')};
  display: flex;
  flex-direction: column;
  gap: 5px;
  max-height: ${({ $open }) => ($open ? '300px' : '0')};
  overflow-y: auto;
  transition: max-height 0.3s ease, margin-top 0.3s ease;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: var(--color-titulo-marybe); border-radius: 10px; }
  &::-webkit-scrollbar-thumb:hover { background: var(--color-marron-principal); }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  font-weight: 400;
  color: #535353;
  cursor: pointer;
  user-select: none;

  input {
    appearance: none;
    width: 18px;
    height: 18px;
    min-width: 18px;
    border: 1px solid #c4c4c4;
    border-radius: 4px;
    outline: none;
    cursor: pointer;
    position: relative;
    background-color: white;
    transition: all 0.2s ease;

    &:checked {
      background-color: var(--color-bordo-secundario);
      border-color: var(--color-bordo-secundario);
      &::after {
        content: '✓';
        position: absolute;
        color: white;
        font-size: 0.75rem;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-weight: bold;
      }
    }
    &:hover { border-color: var(--color-bordo-secundario); }
  }

  &:hover { color: black; }
`;


const BreadcrumbBack = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.82rem;
  color: var(--color-bordo-secundario);
  cursor: pointer;
  font-weight: 500;
  padding: 2px 0;
  &:hover { color: var(--color-marron-principal); }
`;

const CategoryIndent = styled.div`
  margin-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
  border-left: 2px solid #f0ebe4;
  padding-left: 12px;
`;

const SidebarSubmitBtn = styled.button`
  width: 100%;
  background-color: #7C0405;
  color: white;
  border-radius: 12px;
  padding: 14px;
  font-weight: 600;
  font-size: 0.95rem;
  margin-top: 20px;
  transition: background-color 0.2s;
  text-align: center;
  box-shadow: 0 4px 12px rgba(62, 1, 2, 0.1);
  flex-shrink: 0;

  &:hover { background-color: var(--color-marron-principal); }
`;

// ─── Componente ───────────────────────────────────────────────────────────────

export default function CatalogoSidebar({
  mobileOpen,
  onCloseMobile,
  availableBrands,
  availableSizes,
  availablePriceRange,
  activeBrands,
  activeSizes,
  activePrice,
  activePriceParam,
  activeSeccion,
  activeDescuento,
  // Jerarquía de categorías (params separados)
  activeCatParam,
  activeSubcatParam,
  activeTipoParam,
  // Handlers de categoría
  onSelectCategory,
  onSelectSubcategory,
  onSelectTipo,
  onClearCategory,
  // Handlers generales
  accordions,
  onToggleAccordion,
  onCheckboxToggle,
  onDescuentoChange,
  onPriceChange,
  onRemoveTag,
  onClearAll,
  onSubmit,
  total,
}) {
  // ── Estado de la jerarquía de categorías (fetched de Strapi) ────────────────
  const [categoryTree, setCategoryTree] = useState([]);

  useEffect(() => {
    fetch(
      `${STRAPI_URL}/api/categorias` +
      `?populate[subcategorias][populate][tipos]=*` +
      `&pagination[pageSize]=100` +
      `&publicationState=live`
    )
      .then(r => r.json())
      .then(json => {
        const treeMap = new Map();
        (json.data || []).forEach(entry => {
          const a = entry.attributes || entry;
          const catName = a.nombre;
          if (!catName) return;

          const subcategorias = (a.subcategorias || [])
            .map(sub => {
              const sName = sub.nombre || sub.attributes?.nombre;
              const tipos = (sub.tipos || sub.attributes?.tipos || [])
                .map(t => t.nombre || t.attributes?.nombre)
                .filter(Boolean);
              return { nombre: sName, tipos };
            })
            .filter(s => s.nombre);

          if (!treeMap.has(catName)) {
            treeMap.set(catName, { nombre: catName, secciones: [], subcategorias: [] });
          }
          const existing = treeMap.get(catName);
          if (a.seccion && !existing.secciones.includes(a.seccion)) {
            existing.secciones.push(a.seccion);
          }
          
          subcategorias.forEach(sub => {
            const extSub = existing.subcategorias.find(s => s.nombre === sub.nombre);
            if (extSub) {
              extSub.tipos = [...new Set([...extSub.tipos, ...sub.tipos])];
            } else {
              existing.subcategorias.push(sub);
            }
          });
        });
        setCategoryTree(Array.from(treeMap.values()));
      })
      .catch(err => console.warn('[CatalogoSidebar] Error fetching categories:', err));
  }, []);

  // ── Niveles activos ──────────────────────────────────────────────────────────
  const activeCat = activeCatParam ? activeCatParam.split(',')[0] : null;
  const activeSub = activeSubcatParam ? activeSubcatParam.split(',')[0] : null;
  const activeTipo = activeTipoParam ? activeTipoParam.split(',')[0] : null;

  // Nodo activo en el árbol (filtrado por sección para evitar duplicados como Fragancias en Hogar/Perfumería)
  const activeCatNode = activeCat
    ? categoryTree.find(c => {
        if (c.nombre !== activeCat) return false;
        if (activeSeccion && c.seccion) {
          const normalize = str => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
          return normalize(c.seccion) === normalize(activeSeccion);
        }
        return true;
      })
    : null;
  const activeSubNode = activeCatNode && activeSub
    ? activeCatNode.subcategorias.find(s => s.nombre === activeSub)
    : null;

  // ── ¿Hay filtros activos? ────────────────────────────────────────────────────
  const hasActiveFilters =
    activeDescuento.length > 0 ||
    activeBrands.length > 0 ||
    activeSizes.length > 0 ||
    activePriceParam ||
    activeCatParam ||
    activeSubcatParam ||
    activeTipoParam;

  // ── Tamaños ordenados ────────────────────────────────────────────────────────
  const sortedSizes = React.useMemo(() => {
    if (!availableSizes) return [];
    return [...availableSizes].sort((a, b) => {
      const numA = parseFloat(a.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
      const numB = parseFloat(b.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
      const unitA = a.replace(/[\d.,\s]/g, '').toLowerCase();
      const unitB = b.replace(/[\d.,\s]/g, '').toLowerCase();
      let valA = numA;
      let valB = numB;
      if (unitA === 'l' || unitA === 'lt') valA *= 1000;
      if (unitB === 'l' || unitB === 'lt') valB *= 1000;
      if (unitA === 'kg') valA *= 1000;
      if (unitB === 'kg') valB *= 1000;
      const isWeightA = unitA.includes('g') || unitA.includes('k');
      const isWeightB = unitB.includes('g') || unitB.includes('k');
      if (isWeightA !== isWeightB) return isWeightA ? 1 : -1;
      if (valA !== valB) return valA - valB;
      return a.localeCompare(b);
    });
  }, [availableSizes]);

  // ── Click en overlay (mobile) ────────────────────────────────────────────────
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && onCloseMobile) {
      onCloseMobile();
    }
  };

  // ── Render de la sección de Categorías (drill-down dinámico) ─────────────────
  const renderCategories = () => {
    // NIVEL 0: Sin categoría activa → mostrar todas las categorías
    if (!activeCat) {
      if (categoryTree.length === 0) {
        return <span style={{ fontSize: '0.85rem', color: '#9A8F87' }}>Cargando...</span>;
      }

      const filteredTree = activeSeccion 
        ? categoryTree.filter(cat => {
            if (!cat.secciones || cat.secciones.length === 0) return true;
            const normalize = str => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            const normalizedActive = normalize(activeSeccion);
            return cat.secciones.some(sec => normalize(sec) === normalizedActive);
          })
        : categoryTree;

      return filteredTree.map(cat => (
        <CheckboxLabel key={cat.nombre}>
          <input
            type="checkbox"
            checked={false}
            onChange={() => onSelectCategory(cat.nombre)}
          />
          {cat.nombre}
        </CheckboxLabel>
      ));
    }

    // NIVEL 1: Categoría activa, sin subcategoría → cat checked + sus subcats
    if (!activeSub) {
      return (
        <>
          <CheckboxLabel style={{ fontWeight: 600, color: '#160000' }}>
            <input
              type="checkbox"
              checked={true}
              onChange={() => onClearCategory()}
            />
            {activeCat}
          </CheckboxLabel>
          {activeCatNode && activeCatNode.subcategorias.length > 0 && (
            <CategoryIndent>
              {activeCatNode.subcategorias.map(sub => (
                <CheckboxLabel key={sub.nombre}>
                  <input
                    type="checkbox"
                    checked={false}
                    onChange={() => onSelectSubcategory(sub.nombre)}
                  />
                  {sub.nombre}
                </CheckboxLabel>
              ))}
            </CategoryIndent>
          )}
        </>
      );
    }

    // NIVEL 2: Categoría + subcategoría activas → mostrar tipos
    return (
      <>
        <BreadcrumbBack onClick={() => onClearCategory()}>
          <BackIcon /> Todas las categorías
        </BreadcrumbBack>
        <CheckboxLabel style={{ fontWeight: 600, color: '#160000', marginTop: '8px' }}>
          <input
            type="checkbox"
            checked={true}
            onChange={() => onClearCategory()}
          />
          {activeCat}
        </CheckboxLabel>
        <CategoryIndent>
          <CheckboxLabel style={{ fontWeight: 600, color: '#160000' }}>
            <input
              type="checkbox"
              checked={true}
              onChange={() => onRemoveTag('subcategoria', activeSub)}
            />
            {activeSub}
          </CheckboxLabel>
          {activeSubNode && activeSubNode.tipos.length > 0 && (
            <CategoryIndent>
              {activeSubNode.tipos.map(tipo => (
                <CheckboxLabel key={tipo}>
                  <input
                    type="checkbox"
                    checked={activeTipo === tipo}
                    onChange={() => {
                      if (activeTipo === tipo) {
                        onRemoveTag('tipo', tipo);
                      } else {
                        onSelectTipo(tipo);
                      }
                    }}
                  />
                  {tipo}
                </CheckboxLabel>
              ))}
            </CategoryIndent>
          )}
        </CategoryIndent>
      </>
    );
  };

  return (
    <Sidebar $isOpen={mobileOpen} onClick={handleOverlayClick}>
      <FilterCard $isOpen={mobileOpen}>
        <FilterCardHeader>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MobileCloseBtn onClick={onCloseMobile}>×</MobileCloseBtn>
            <SidebarTitle>Filtros aplicados</SidebarTitle>
          </div>
          {hasActiveFilters && (
            <ClearAllBtn id="btn-limpiar-filtros" onClick={onClearAll}>
              Limpiar
            </ClearAllBtn>
          )}
        </FilterCardHeader>

        {/* Tags activos — separados por nivel URL correcto */}
        <ActiveFiltersWrapper>
          <FilterTagsList>
            {activeSeccion && (
              <FilterTag>
                {activeSeccion}
                <button onClick={() => onRemoveTag('seccion', activeSeccion)}>×</button>
              </FilterTag>
            )}
            {activeDescuento.map((desc) => (
              <FilterTag key={desc}>
                {desc === 'todas' ? 'Ofertas' : `${desc}% OFF`}
                <button onClick={() => onRemoveTag('descuento', desc)}>×</button>
              </FilterTag>
            ))}
            {activeBrands.map((b) => (
              <FilterTag key={b}>
                {b}
                <button onClick={() => onRemoveTag('marca', b)}>×</button>
              </FilterTag>
            ))}
            {/* Categoría — cada nivel con su urlKey correcto */}
            {activeCatParam && activeCatParam.split(',').map(c => (
              <FilterTag key={`cat-${c}`}>
                {c}
                <button onClick={() => onClearCategory()}>×</button>
              </FilterTag>
            ))}
            {activeSubcatParam && activeSubcatParam.split(',').map(s => (
              <FilterTag key={`sub-${s}`}>
                {s}
                <button onClick={() => onRemoveTag('subcategoria', s)}>×</button>
              </FilterTag>
            ))}
            {activeTipoParam && activeTipoParam.split(',').map(t => (
              <FilterTag key={`tipo-${t}`}>
                {t}
                <button onClick={() => onRemoveTag('tipo', t)}>×</button>
              </FilterTag>
            ))}
            {activeSizes.map((sz) => (
              <FilterTag key={sz}>
                {sz}
                <button onClick={() => onRemoveTag('tamano', sz)}>×</button>
              </FilterTag>
            ))}
            {activePriceParam && (
              <FilterTag>
                {`$${activePrice[0].toLocaleString('es-AR')} - $${activePrice[1].toLocaleString('es-AR')}`}
                <button onClick={() => onRemoveTag('precio', null)}>×</button>
              </FilterTag>
            )}
          </FilterTagsList>
        </ActiveFiltersWrapper>

        <ScrollableFilters>

          {/* ── Marcas ────────────────────────────────────────────────────── */}
          {availableBrands && availableBrands.length > 0 && (
            <AccordionItem>
              <AccordionHeader onClick={() => onToggleAccordion('marca')}>
                Marca
                <AccordionChevron $open={accordions.marca}><ChevronIcon /></AccordionChevron>
              </AccordionHeader>
              <AccordionContent $open={accordions.marca}>
                {availableBrands.map((brand) => (
                  <CheckboxLabel key={brand}>
                    <input
                      type="checkbox"
                      checked={activeBrands.includes(brand)}
                      onChange={() => onCheckboxToggle(activeBrands, brand, 'marca')}
                    />
                    {brand}
                  </CheckboxLabel>
                ))}
              </AccordionContent>
            </AccordionItem>
          )}

          {/* ── Tamaños ───────────────────────────────────────────────────── */}
          {availableSizes && availableSizes.length > 0 && (
            <AccordionItem>
              <AccordionHeader onClick={() => onToggleAccordion('tamano')}>
                Tamaño
                <AccordionChevron $open={accordions.tamano}><ChevronIcon /></AccordionChevron>
              </AccordionHeader>
              <AccordionContent $open={accordions.tamano}>
                {sortedSizes.map((sz) => (
                  <CheckboxLabel key={sz}>
                    <input
                      type="checkbox"
                      checked={activeSizes.includes(sz)}
                      onChange={() => onCheckboxToggle(activeSizes, sz, 'tamano')}
                    />
                    {sz}
                  </CheckboxLabel>
                ))}
              </AccordionContent>
            </AccordionItem>
          )}

          {/* ── Categorías (drill-down dinámico) ─────────────────────────── */}
          <AccordionItem>
            <AccordionHeader onClick={() => onToggleAccordion('categoria')}>
              Categorías
              {activeCat && (
                <span style={{
                  backgroundColor: '#F2D4D4',
                  color: '#7C0405',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  marginLeft: '8px',
                }}>
                  {activeSub ? (activeTipo ? '3' : '2') : '1'}
                </span>
              )}
              <AccordionChevron $open={accordions.categoria}><ChevronIcon /></AccordionChevron>
            </AccordionHeader>
            <AccordionContent $open={accordions.categoria} style={{ maxHeight: accordions.categoria ? '400px' : '0' }}>
              {renderCategories()}
            </AccordionContent>
          </AccordionItem>

          {/* ── Ofertas ───────────────────────────────────────────────────── */}
          <AccordionItem>
            <AccordionHeader onClick={() => onToggleAccordion('ofertas')}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                Ofertas
                {activeDescuento.length > 0 && (
                  <span style={{
                    backgroundColor: '#F2D4D4',
                    color: '#7C0405',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    marginLeft: '8px',
                  }}>
                    {activeDescuento.length}
                  </span>
                )}
              </div>
              <AccordionChevron $open={accordions.ofertas}><ChevronIcon /></AccordionChevron>
            </AccordionHeader>
            <AccordionContent $open={accordions.ofertas}>
              {['todas', '60', '50', '40', '35', '30', '25', '20', '15', '10'].map((descValue) => (
                <CheckboxLabel key={descValue}>
                  <input
                    type="checkbox"
                    checked={activeDescuento.includes(descValue)}
                    onChange={() => onCheckboxToggle(activeDescuento, descValue, 'descuento')}
                  />
                  {descValue === 'todas' ? 'Todas las ofertas' : `${descValue}%`}
                </CheckboxLabel>
              ))}
            </AccordionContent>
          </AccordionItem>

          {/* ── Rango de precio ───────────────────────────────────────────── */}
          {availablePriceRange && availablePriceRange[0] !== availablePriceRange[1] && (
            <AccordionItem>
              <AccordionHeader onClick={() => onToggleAccordion('precio')}>
                Rango de precio
                <AccordionChevron $open={accordions.precio}><ChevronIcon /></AccordionChevron>
              </AccordionHeader>
              <AccordionContent $open={accordions.precio}>
                <PriceRangeSlider
                  min={availablePriceRange[0]}
                  max={availablePriceRange[1]}
                  value={activePrice}
                  onChange={() => {}}
                  onFinalChange={onPriceChange}
                />
              </AccordionContent>
            </AccordionItem>
          )}
        </ScrollableFilters>

        <SidebarSubmitBtn
          id="sidebar-submit"
          onClick={() => { onSubmit(); onCloseMobile?.(); }}
        >
          Mostrar resultados ({total})
        </SidebarSubmitBtn>
      </FilterCard>
    </Sidebar>
  );
}
