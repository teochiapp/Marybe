import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { getColorHex } from '../../utils/colorMap';

// ─── Constantes ───────────────────────────────────────────────────────────────

const MAX_VISIBLE_SWATCHES = 6;

// ─── Styled Components — Colores ──────────────────────────────────────────────

const ColorsSection = styled.div`
  margin-bottom: 14px;
`;

const VariantLabel = styled.div`
  font-size: 0.88rem;
  font-weight: 700;
  color: #28180B;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-family-secondary);
`;

const SelectedColorName = styled.span`
  font-weight: 400;
  color: #5d666f;
  font-size: 0.82rem;
`;

const SwatchRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  align-items: center;
  position: relative;
`;

const SwatchButton = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid ${({ $active }) => ($active ? 'var(--color-bordo-secundario)' : 'transparent')};
  background-color: ${({ $color }) => $color};
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  position: relative;
  transition: transform 0.15s ease, border-color 0.15s ease;
  box-shadow: ${({ $isLight }) =>
    $isLight ? 'inset 0 0 0 1px rgba(0,0,0,0.15)' : 'none'};
  outline: none;

  /* Ring exterior cuando está activo */
  &::after {
    content: '';
    position: absolute;
    inset: -5px;
    border-radius: 50%;
    border: 2px solid ${({ $active }) =>
    $active ? 'var(--color-bordo-secundario)' : 'transparent'};
    transition: border-color 0.15s ease;
    pointer-events: none;
  }

  &:hover {
    transform: scale(1.12);
  }

  &:focus-visible {
    outline: 2px solid var(--color-bordo-secundario);
    outline-offset: 3px;
  }

  /* Colores sin stock: tachado */
  ${({ $unavailable }) =>
    $unavailable &&
    `
    opacity: 0.35;
    cursor: not-allowed;
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: repeating-linear-gradient(
        135deg,
        transparent,
        transparent 3px,
        rgba(0,0,0,0.4) 3px,
        rgba(0,0,0,0.4) 4px
      );
    }
  `}

  @media (max-width: 600px) {
    width: 32px;
    height: 32px;
  }
`;

const MoreButton = styled.button`
  width: ${({ $isSize }) => ($isSize ? 'auto' : '28px')};
  min-width: 28px;
  height: 28px;
  border-radius: ${({ $isSize }) => ($isSize ? '10px' : '50%')};
  padding: ${({ $isSize }) => ($isSize ? '0 10px' : '0')};
  border: 1.5px solid ${({ $hasActive }) => ($hasActive ? 'var(--color-bordo-secundario)' : '#c7ccd1')};
  background-color: ${({ $hasActive }) => ($hasActive ? '#FAF0F0' : '#fff')};
  color: ${({ $hasActive }) => ($hasActive ? 'var(--color-bordo-secundario)' : '#5d666f')};
  cursor: pointer;
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background-color 0.15s, border-color 0.15s, transform 0.15s;
  font-family: var(--font-family-secondary);
  outline: none;

  &:hover {
    background-color: #f5f0f0;
    border-color: var(--color-bordo-secundario);
    color: var(--color-bordo-secundario);
    transform: scale(1.08);
  }

  &:focus-visible {
    outline: 2px solid var(--color-bordo-secundario);
    outline-offset: 3px;
  }

  @media (max-width: 600px) {
    width: ${({ $isSize }) => ($isSize ? 'auto' : '32px')};
    height: 32px;
    font-size: 0.65rem;
  }
`;

// ─── Popover con los colores/talles restantes (Hacia Arriba) ─────────────────

const PopoverWrapper = styled.div`
  position: absolute;
  bottom: calc(100% + 8px);
  right: 0;
  z-index: 200;
  background: #fff;
  border: 1px solid #e3e6e8;
  border-radius: 10px;
  box-shadow: 0 -6px 20px rgba(0, 0, 0, 0.15);
  padding: 8px 6px;
  min-width: 180px;
  max-width: 260px;
  max-height: 220px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;

  /* Scrollbar custom */
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: #c7ccd1;
    border-radius: 4px;
  }
`;

const PopoverItem = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px;
  border: none;
  background: ${({ $active }) => ($active ? '#FAF0F0' : 'transparent')};
  border-radius: 6px;
  cursor: pointer;
  text-align: left;
  font-family: var(--font-family-secondary);
  font-size: 0.82rem;
  color: ${({ $active }) => ($active ? 'var(--color-bordo-secundario)' : '#28180B')};
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  transition: background-color 0.12s;
  width: 100%;

  &:hover {
    background-color: #f5f0f0;
  }

  &:focus-visible {
    outline: 2px solid var(--color-bordo-secundario);
    outline-offset: 1px;
  }

  ${({ $unavailable }) =>
    $unavailable &&
    `
    opacity: 0.45;
    text-decoration: line-through;
    cursor: not-allowed;
  `}
`;

const PopoverSwatch = styled.span`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: ${({ $color }) => $color};
  flex-shrink: 0;
  border: 1px solid rgba(0, 0, 0, 0.12);
  display: inline-block;
`;

// ─── Styled Components — Talles ───────────────────────────────────────────────

const SizesSection = styled.div`
  margin-bottom: 14px;
`;

const SizesRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  position: relative;
`;

const SizeButton = styled.button`
  border: 1.5px solid ${({ $active }) => ($active ? 'var(--color-bordo-secundario)' : '#d8d2ca')};
  background-color: ${({ $active }) => ($active ? 'var(--color-bordo-secundario)' : '#fff')};
  color: ${({ $active }) => ($active ? '#fff' : '#28180B')};
  border-radius: 10px;
  padding: 5px 14px;
  min-height: 36px;
  font-size: 0.83rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s ease;
  font-family: var(--font-family-secondary);
  outline: none;

  &:hover:not([disabled]) {
    border-color: var(--color-bordo-secundario);
    color: ${({ $active }) => ($active ? '#fff' : 'var(--color-bordo-secundario)')};
  }

  &:focus-visible {
    outline: 2px solid var(--color-bordo-secundario);
    outline-offset: 2px;
  }

  /* Sin stock */
  ${({ $unavailable }) =>
    $unavailable &&
    `
    opacity: 0.38;
    cursor: not-allowed;
    text-decoration: line-through;
    border-style: dashed;
  `}

  @media (max-width: 600px) {
    min-height: 40px;
    padding: 6px 16px;
    font-size: 0.85rem;
  }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isLightColor(hex) {
  if (!hex || hex === 'transparent') return false;
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length < 6) return false;
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.85;
}

// ─── Componente principal ─────────────────────────────────────────────────────

/**
 * VariantSelector — Selector visual reutilizable de colores y talles
 *
 * Props:
 *  - coloresUnicos:      [[nombre, variante], ...]
 *  - selectedColor:      string | null
 *  - onColorSelect:      (nombre) => void
 *  - sizes:              string[]
 *  - selectedSize:       number (índice)
 *  - onSizeSelect:       (index) => void
 *  - tieneColores:       boolean
 *  - tieneVariantesTam:  boolean
 *  - variantes:          array completo (para verificar stock por talle)
 *  - compact:            boolean (para tarjetas vs página de producto)
 */
export default function VariantSelector({
  coloresUnicos = [],
  selectedColor,
  onColorSelect,
  sizes = [],
  selectedSize = 0,
  onSizeSelect,
  tieneColores = false,
  tieneVariantesTam = false,
  variantes = [],
  compact = false,
}) {
  const [colorPopoverOpen, setColorPopoverOpen] = useState(false);
  const [sizePopoverOpen, setSizePopoverOpen] = useState(false);

  const colorPopoverRef = useRef(null);
  const colorMoreBtnRef = useRef(null);
  const sizePopoverRef = useRef(null);
  const sizeMoreBtnRef = useRef(null);

  // Cierra los popovers al hacer click fuera
  useEffect(() => {
    function handleOutside(e) {
      if (
        colorPopoverOpen &&
        colorPopoverRef.current &&
        !colorPopoverRef.current.contains(e.target) &&
        colorMoreBtnRef.current &&
        !colorMoreBtnRef.current.contains(e.target)
      ) {
        setColorPopoverOpen(false);
      }
      if (
        sizePopoverOpen &&
        sizePopoverRef.current &&
        !sizePopoverRef.current.contains(e.target) &&
        sizeMoreBtnRef.current &&
        !sizeMoreBtnRef.current.contains(e.target)
      ) {
        setSizePopoverOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [colorPopoverOpen, sizePopoverOpen]);

  const currentSize = sizes[selectedSize] || sizes[0];

  // Handler inteligente para cambio de color (auto-sincroniza el talle si la combinación no existe)
  const handleColorClick = (colorNombre) => {
    let matchingVariants = variantes.filter((v) => v.color_nombre === colorNombre);
    const hasCurrentSize = matchingVariants.some(
      (v) => (v.volumen || 'Único') === currentSize
    );

    onColorSelect(colorNombre);

    if (!hasCurrentSize && matchingVariants.length > 0 && tieneVariantesTam) {
      const best = matchingVariants.find((v) => (v.stock ?? 0) > 0) || matchingVariants[0];
      const targetSize = best.volumen || 'Único';
      const targetIdx = sizes.indexOf(targetSize);
      if (targetIdx !== -1 && targetIdx !== selectedSize) {
        onSizeSelect(targetIdx);
      }
    }
  };

  // Handler inteligente para cambio de talle (auto-sincroniza el color si la combinación no existe)
  const handleSizeClick = (sizeIdx) => {
    const targetSize = sizes[sizeIdx];
    let matchingVariants = variantes.filter(
      (v) => (v.volumen || 'Único') === targetSize
    );
    const hasCurrentColor = matchingVariants.some(
      (v) => v.color_nombre === selectedColor
    );

    onSizeSelect(sizeIdx);

    if (!hasCurrentColor && matchingVariants.length > 0 && tieneColores) {
      const best = matchingVariants.find((v) => (v.stock ?? 0) > 0) || matchingVariants[0];
      const targetColor = best.color_nombre;
      if (targetColor && targetColor !== selectedColor) {
        onColorSelect(targetColor);
      }
    }
  };

  // Determina si un talle tiene stock en alguna variante
  function sizeHasStock(size) {
    const matching = variantes.filter(
      (v) => (v.volumen || 'Único') === size
    );
    if (matching.length === 0) return true; // si no hay info, asumir disponible
    return matching.some((v) => (v.stock ?? 0) > 0);
  }

  // Determina si un color tiene stock en alguna variante
  function colorHasStock(nombre) {
    const matching = variantes.filter((v) => v.color_nombre === nombre);
    if (matching.length === 0) return true;
    return matching.some((v) => (v.stock ?? 0) > 0);
  }

  // ── Lógica de límites para Colores ──
  const maxSwatches = compact ? 5 : 6;
  const showAllSwatches = coloresUnicos.length <= maxSwatches + 1;
  const visibleSwatches = showAllSwatches ? coloresUnicos : coloresUnicos.slice(0, maxSwatches);
  const hiddenSwatches = showAllSwatches ? [] : coloresUnicos.slice(maxSwatches);
  const hasMoreSwatches = hiddenSwatches.length > 0;
  const isColorInHidden = hiddenSwatches.some(([n]) => n === selectedColor);

  // ── Lógica de límites para Talles / Tamaños ──
  const maxSizes = compact ? 5 : 6;
  const showAllSizes = sizes.length <= maxSizes + 1;
  const visibleSizes = showAllSizes
    ? sizes.map((size, idx) => ({ size, originalIdx: idx }))
    : sizes.slice(0, maxSizes).map((size, idx) => ({ size, originalIdx: idx }));
  const hiddenSizes = showAllSizes
    ? []
    : sizes.slice(maxSizes).map((size, idx) => ({ size, originalIdx: maxSizes + idx }));
  const hasMoreSizes = hiddenSizes.length > 0;
  const isSizeInHidden = hiddenSizes.some(({ originalIdx }) => selectedSize === originalIdx);

  return (
    <>
      {/* ── Selector de Talles ───────────────────────────────────────────── */}
      {tieneVariantesTam && (
        <SizesSection>
          {!compact && <VariantLabel>Tamaño</VariantLabel>}
          <SizesRow role="radiogroup" aria-label="Seleccionar tamaño">
            {visibleSizes.map(({ size, originalIdx }) => {
              const available = sizeHasStock(size);
              const isSelected = selectedSize === originalIdx;
              return (
                <SizeButton
                  key={originalIdx}
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={`${size}${!available ? ' — sin stock' : ''}`}
                  $active={isSelected}
                  $unavailable={!available}
                  disabled={!available}
                  onClick={() => available && handleSizeClick(originalIdx)}
                  title={!available ? `${size} — Sin stock` : size}
                >
                  {size}
                </SizeButton>
              );
            })}

            {/* Botón "+" para tamaños adicionales */}
            {hasMoreSizes && (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <MoreButton
                  ref={sizeMoreBtnRef}
                  $isSize={true}
                  $hasActive={isSizeInHidden}
                  aria-expanded={sizePopoverOpen}
                  aria-label={`Ver ${hiddenSizes.length} tamaños más`}
                  onClick={() => setSizePopoverOpen((v) => !v)}
                  title={`Ver ${hiddenSizes.length} tamaños más`}
                >
                  +{hiddenSizes.length}
                </MoreButton>

                {sizePopoverOpen && (
                  <PopoverWrapper
                    ref={sizePopoverRef}
                    role="listbox"
                    aria-label="Tamaños adicionales"
                  >
                    {hiddenSizes.map(({ size, originalIdx }) => {
                      const available = sizeHasStock(size);
                      const isSelected = selectedSize === originalIdx;
                      return (
                        <PopoverItem
                          key={originalIdx}
                          role="option"
                          aria-selected={isSelected}
                          $active={isSelected}
                          $unavailable={!available}
                          onClick={() => {
                            if (available) {
                              handleSizeClick(originalIdx);
                              setSizePopoverOpen(false);
                            }
                          }}
                          title={!available ? `${size} — Sin stock` : size}
                        >
                          {size}
                        </PopoverItem>
                      );
                    })}
                  </PopoverWrapper>
                )}
              </div>
            )}
          </SizesRow>
        </SizesSection>
      )}

      {/* ── Selector de Colores ──────────────────────────────────────────── */}
      {tieneColores && (
        <ColorsSection>
          {!compact && (
            <VariantLabel>
              Color
              {selectedColor && (
                <SelectedColorName>— {selectedColor}</SelectedColorName>
              )}
            </VariantLabel>
          )}

          <SwatchRow role="radiogroup" aria-label="Seleccionar color">
            {visibleSwatches.map(([nombre]) => {
              const hex = getColorHex(nombre);
              const available = colorHasStock(nombre);
              const light = isLightColor(hex);
              return (
                <SwatchButton
                  key={nombre}
                  role="radio"
                  aria-checked={selectedColor === nombre}
                  aria-label={`${nombre}${!available ? ' — sin stock' : ''}`}
                  $color={hex}
                  $active={selectedColor === nombre}
                  $unavailable={!available}
                  $isLight={light}
                  onClick={() => available && handleColorClick(nombre)}
                  title={nombre}
                />
              );
            })}

            {/* Botón "+" para colores adicionales */}
            {hasMoreSwatches && (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <MoreButton
                  ref={colorMoreBtnRef}
                  $isSize={false}
                  $hasActive={isColorInHidden}
                  aria-expanded={colorPopoverOpen}
                  aria-label={`Ver ${hiddenSwatches.length} colores más`}
                  onClick={() => setColorPopoverOpen((v) => !v)}
                  title={`Ver ${hiddenSwatches.length} colores más`}
                >
                  +{hiddenSwatches.length}
                </MoreButton>

                {colorPopoverOpen && (
                  <PopoverWrapper
                    ref={colorPopoverRef}
                    role="listbox"
                    aria-label="Colores adicionales"
                  >
                    {hiddenSwatches.map(([nombre]) => {
                      const hex = getColorHex(nombre);
                      const available = colorHasStock(nombre);
                      return (
                        <PopoverItem
                          key={nombre}
                          role="option"
                          aria-selected={selectedColor === nombre}
                          $active={selectedColor === nombre}
                          $unavailable={!available}
                          onClick={() => {
                            if (available) {
                              handleColorClick(nombre);
                              setColorPopoverOpen(false);
                            }
                          }}
                          title={!available ? `${nombre} — Sin stock` : nombre}
                        >
                          <PopoverSwatch $color={hex} aria-hidden="true" />
                          {nombre}
                        </PopoverItem>
                      );
                    })}
                  </PopoverWrapper>
                )}
              </div>
            )}
          </SwatchRow>
        </ColorsSection>
      )}
    </>
  );
}

