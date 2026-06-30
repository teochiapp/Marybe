import React from 'react';
import styled from 'styled-components';
import PriceRangeSlider from './PriceRangeSlider';

// ─── Styled Components ────────────────────────────────────────────────────────

const ChevronIcon = () => (
  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block' }}>
    <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

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

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--color-marron-principal);
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: var(--color-marron-principal);
  }
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

    &:hover {
      color: var(--color-marron-principal);
    }
  }
`;

const ClearAllBtn = styled.button`
  font-size: 0.85rem;
  font-weight: 600;
  color: #535353;
  transition: color 0.15s;

  &:hover {
    color: var(--color-marron-principal);
  }
`;

const AccordionItem = styled.div`
  border-top: 1px solid #ece9e4;
  padding: 10px 0;

  &:last-child {
    padding-bottom: 0;
  }
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
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  max-height: ${({ $open }) => ($open ? '250px' : '0')};
  overflow-y: auto;
  transition: max-height 0.3s ease, margin-top 0.3s ease;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--color-titulo-marybe);
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: var(--color-marron-principal);
  }
`;


const NestedCategoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  .indent-1 {
    margin-left: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 12px;
    border-left: 1px solid #ece9e4;
    padding-left: 12px;
  }

  .indent-2 {
    margin-left: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 12px;
  }
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

    &:hover {
      border-color: var(--color-bordo-secundario);
    }
  }

  &:hover {
    color: black;
  }
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

  &:hover {
    background-color: var(--color-marron-principal);
  }
`;

// ─── Componente ───────────────────────────────────────────────────────────────

export default function CatalogoSidebar({
  mobileOpen,
  onCloseMobile,
  availableCategories,
  availableBrands,
  availableSizes,
  availablePriceRange,
  activeCategories,
  activeBrands,
  activeSizes,
  activePrice,
  activePriceParam,
  activeSeccion,
  activeDescuento,
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
  const hasActiveFilters =
    activeDescuento.length > 0 || activeBrands.length > 0 || activeCategories.length > 0 || activeSizes.length > 0 || activePriceParam;

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

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && onCloseMobile) {
      onCloseMobile();
    }
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

        {/* Tags activos (Fijos arriba) */}
        <ActiveFiltersWrapper>
          <FilterTagsList>
            {activeSeccion && (
              <FilterTag>
                {activeSeccion}
                <button onClick={() => onRemoveTag('seccion', activeSeccion)} aria-label="Quitar filtro de sección">×</button>
              </FilterTag>
            )}
            {activeDescuento.map((desc) => (
              <FilterTag key={desc}>
                {desc === 'todas' ? 'Ofertas' : `${desc}% OFF`}
                <button onClick={() => onRemoveTag('descuento', desc)} aria-label="Quitar filtro de descuento">×</button>
              </FilterTag>
            ))}
            {activeBrands.map((b) => (
              <FilterTag key={b}>
                {b}
                <button onClick={() => onRemoveTag('marca', b)} aria-label={`Quitar filtro de marca ${b}`}>×</button>
              </FilterTag>
            ))}
            {activeCategories.map((c) => (
              <FilterTag key={c}>
                {c}
                <button onClick={() => onRemoveTag('categoria', c)} aria-label={`Quitar filtro de categoría ${c}`}>×</button>
              </FilterTag>
            ))}
            {activeSizes.map((sz) => (
              <FilterTag key={sz}>
                {sz}
                <button onClick={() => onRemoveTag('tamano', sz)} aria-label={`Quitar filtro de tamaño ${sz}`}>×</button>
              </FilterTag>
            ))}
            {activePriceParam && (
              <FilterTag>
                {`$${activePrice[0].toLocaleString('es-AR')} - $${activePrice[1].toLocaleString('es-AR')}`}
                <button onClick={() => onRemoveTag('precio', null)} aria-label="Quitar filtro de precio">×</button>
              </FilterTag>
            )}
          </FilterTagsList>
        </ActiveFiltersWrapper>

        <ScrollableFilters>

          {/* Marcas */}
          {availableBrands.length > 0 && (
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

          {/* Tamaños */}
          {availableSizes.length > 0 && (
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

          {/* Categorías */}
          {availableCategories.length > 0 && (
            <AccordionItem>
              <AccordionHeader onClick={() => onToggleAccordion('categoria')}>
                Categorías
                <AccordionChevron $open={accordions.categoria}><ChevronIcon /></AccordionChevron>
              </AccordionHeader>
              <AccordionContent $open={accordions.categoria}>
                <NestedCategoryList>
                  <CheckboxLabel>
                    <input type="checkbox" checked={activeCategories.includes('Dermocosmética')} onChange={() => onCheckboxToggle(activeCategories, 'Dermocosmética', 'categoria')} />
                    Dermocosmética
                  </CheckboxLabel>

                  <CheckboxLabel>
                    <input type="checkbox" checked={activeCategories.includes('Fragancias')} onChange={() => onCheckboxToggle(activeCategories, 'Fragancias', 'categoria')} />
                    Fragancias
                  </CheckboxLabel>

                  <div className="indent-1">
                    <CheckboxLabel>
                      <input type="checkbox" checked={activeCategories.includes('Femeninas')} onChange={() => onCheckboxToggle(activeCategories, 'Femeninas', 'categoria')} />
                      Femeninas
                    </CheckboxLabel>

                    <div className="indent-2">
                      <CheckboxLabel>
                        <input type="checkbox" checked={activeCategories.includes('Premium Femenina')} onChange={() => onCheckboxToggle(activeCategories, 'Premium Femenina', 'categoria')} />
                        Premium
                      </CheckboxLabel>
                      <CheckboxLabel>
                        <input type="checkbox" checked={activeCategories.includes('Sets Femeninos')} onChange={() => onCheckboxToggle(activeCategories, 'Sets Femeninos', 'categoria')} />
                        Sets
                      </CheckboxLabel>
                      <CheckboxLabel>
                        <input type="checkbox" checked={activeCategories.includes('Nacionales Femeninas')} onChange={() => onCheckboxToggle(activeCategories, 'Nacionales Femeninas', 'categoria')} />
                        Nacionales
                      </CheckboxLabel>
                      <CheckboxLabel>
                        <input type="checkbox" checked={activeCategories.includes('Body splash Femeninas')} onChange={() => onCheckboxToggle(activeCategories, 'Body splash Femeninas', 'categoria')} />
                        Body splash y colonias
                      </CheckboxLabel>
                    </div>

                    <CheckboxLabel style={{ marginTop: '12px' }}>
                      <input type="checkbox" checked={activeCategories.includes('Masculinas')} onChange={() => onCheckboxToggle(activeCategories, 'Masculinas', 'categoria')} />
                      Masculinas
                    </CheckboxLabel>

                    <div className="indent-2">
                      <CheckboxLabel>
                        <input type="checkbox" checked={activeCategories.includes('Premium Masculina')} onChange={() => onCheckboxToggle(activeCategories, 'Premium Masculina', 'categoria')} />
                        Premium
                      </CheckboxLabel>
                      <CheckboxLabel>
                        <input type="checkbox" checked={activeCategories.includes('Sets Masculinos')} onChange={() => onCheckboxToggle(activeCategories, 'Sets Masculinos', 'categoria')} />
                        Sets
                      </CheckboxLabel>
                      <CheckboxLabel>
                        <input type="checkbox" checked={activeCategories.includes('Nacionales Masculinas')} onChange={() => onCheckboxToggle(activeCategories, 'Nacionales Masculinas', 'categoria')} />
                        Nacionales
                      </CheckboxLabel>
                      <CheckboxLabel>
                        <input type="checkbox" checked={activeCategories.includes('Body splash Masculinos')} onChange={() => onCheckboxToggle(activeCategories, 'Body splash Masculinos', 'categoria')} />
                        Body splash y colonias
                      </CheckboxLabel>
                    </div>
                  </div>

                  {/* Demás categorías */}
                  {availableCategories.filter(c => !['Dermocosmética', 'Fragancias', 'Femeninas', 'Masculinas'].includes(c)).map((cat) => (
                    <CheckboxLabel key={cat}>
                      <input
                        type="checkbox"
                        checked={activeCategories.includes(cat)}
                        onChange={() => onCheckboxToggle(activeCategories, cat, 'categoria')}
                      />
                      {cat}
                    </CheckboxLabel>
                  ))}
                </NestedCategoryList>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Ofertas */}
          <AccordionItem>
            <AccordionHeader onClick={() => onToggleAccordion('ofertas')}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                Ofertas 
                {activeDescuento.length > 0 && <span style={{ backgroundColor: '#F2D4D4', color: '#7C0405', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', marginLeft: '8px' }}>{activeDescuento.length}</span>}
              </div>
              <AccordionChevron $open={accordions.ofertas}><ChevronIcon /></AccordionChevron>
            </AccordionHeader>
            <AccordionContent $open={accordions.ofertas}>
              {['todas', '50', '40', '35', '30', '20', '10'].map((descValue) => (
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

          {/* Rango de precio */}
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
                  onChange={() => { }}
                  onFinalChange={onPriceChange}
                />
              </AccordionContent>
            </AccordionItem>
          )}
        </ScrollableFilters>

        <SidebarSubmitBtn id="sidebar-submit" onClick={() => { onSubmit(); onCloseMobile?.(); }}>
          Mostrar resultados ({total})
        </SidebarSubmitBtn>
      </FilterCard>
    </Sidebar>
  );
}
