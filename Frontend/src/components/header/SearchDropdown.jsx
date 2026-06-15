import React, { useEffect, useState, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const STRAPI_URL = process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337';

// ─── Styled Components ────────────────────────────────────────────────────────

const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(22, 0, 0, 0.12);
  border: 1px solid #ece9e4;
  z-index: 9999;
  overflow: hidden;
  max-height: 420px;
  overflow-y: auto;

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
`;

const Section = styled.div``;

const SectionLabel = styled.div`
  font-family: var(--font-family-secondary);
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #9A8F87;
  padding: 12px 16px 6px;
`;

const ProductItem = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 16px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.15s;

  &:hover {
    background-color: var(--color-fondo-beneficio-tarjeta);
  }
`;

const ProductThumb = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: #f5f2ef;
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const ProductInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ProductName = styled.div`
  font-family: var(--font-family-secondary);
  font-size: 0.875rem;
  color: var(--color-marron-tercero);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ProductBrand = styled.div`
  font-family: var(--font-family-secondary);
  font-size: 0.75rem;
  color: #9A8F87;
  font-weight: 400;
`;

const CategoryItem = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 16px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.15s;

  &:hover {
    background-color: var(--color-fondo-beneficio-tarjeta);
  }
`;

const CategoryIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background-color: #F2D4D4;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 16px;
    height: 16px;
  }
`;

const CategoryName = styled.div`
  font-family: var(--font-family-secondary);
  font-size: 0.875rem;
  color: var(--color-marron-tercero);
  font-weight: 500;
`;

const CategorySub = styled.div`
  font-family: var(--font-family-secondary);
  font-size: 0.75rem;
  color: #9A8F87;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #ece9e4;
  margin: 0;
`;

const ViewAllBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--font-family-secondary);
  font-size: 0.85rem;
  color: var(--color-bordo-secundario);
  font-weight: 600;
  transition: background-color 0.15s;

  &:hover {
    background-color: #FAF0F0;
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const EmptyState = styled.div`
  padding: 24px 16px;
  text-align: center;
  font-family: var(--font-family-secondary);
  font-size: 0.875rem;
  color: #9A8F87;
`;

const LoadingState = styled.div`
  padding: 20px 16px;
  display: flex;
  justify-content: center;

  span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: var(--color-marron-principal);
    animation: bounce 1.2s infinite ease-in-out both;
    display: inline-block;
    margin: 0 3px;

    &:nth-child(1) { animation-delay: -0.32s; }
    &:nth-child(2) { animation-delay: -0.16s; }
  }

  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  }
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CategoryIconSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-bordo-secundario)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 6h16M4 10h16M4 14h16M4 18h16" />
  </svg>
);

const ArrowSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

// ─── Componente ───────────────────────────────────────────────────────────────

export default function SearchDropdown({ query, onClose, dropdownRef }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef(null);

  const fetchSuggestions = useCallback(async (q) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch(
          `${STRAPI_URL}/api/productos?filters[nombre][$containsi]=${encodeURIComponent(q)}&pagination[pageSize]=5&populate=*`,
          { signal: abortRef.current.signal }
        ),
        fetch(
          `${STRAPI_URL}/api/categorias?filters[nombre][$containsi]=${encodeURIComponent(q)}&pagination[pageSize]=4`,
          { signal: abortRef.current.signal }
        ),
      ]);

      const [prodJson, catJson] = await Promise.all([
        prodRes.json(),
        catRes.json(),
      ]);

      setProducts(prodJson.data || []);
      setCategories(catJson.data || []);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('SearchDropdown error:', err);
        setProducts([]);
        setCategories([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setProducts([]);
      setCategories([]);
      setLoading(false);
      return;
    }
    const timer = setTimeout(() => fetchSuggestions(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query, fetchSuggestions]);

  const handleProductClick = (product) => {
    const attrs = product.attributes || product;
    navigate(`/tienda?busqueda=${encodeURIComponent(attrs.nombre || '')}`);
    onClose();
  };

  const handleCategoryClick = (cat) => {
    const attrs = cat.attributes || cat;
    navigate(`/tienda?categoria=${encodeURIComponent(attrs.nombre || '')}`);
    onClose();
  };

  const handleViewAll = () => {
    navigate(`/tienda?busqueda=${encodeURIComponent(query.trim())}`);
    onClose();
  };

  const hasResults = products.length > 0 || categories.length > 0;
  const showEmpty = !loading && query.trim().length >= 2 && !hasResults;

  return (
    <Dropdown ref={dropdownRef} role="listbox" aria-label="Sugerencias de búsqueda">
      {loading && (
        <LoadingState>
          <span /><span /><span />
        </LoadingState>
      )}

      {!loading && (
        <>
          {/* Categorías */}
          {categories.length > 0 && (
            <Section>
              <SectionLabel>Categorías</SectionLabel>
              {categories.map((cat) => {
                const attrs = cat.attributes || cat;
                return (
                  <CategoryItem
                    key={cat.id || cat.documentId}
                    onClick={() => handleCategoryClick(cat)}
                    role="option"
                  >
                    <CategoryIcon>
                      <CategoryIconSvg />
                    </CategoryIcon>
                    <div>
                      <CategoryName>{attrs.nombre}</CategoryName>
                      <CategorySub>Ver todos los productos</CategorySub>
                    </div>
                  </CategoryItem>
                );
              })}
              {products.length > 0 && <Divider />}
            </Section>
          )}

          {/* Productos */}
          {products.length > 0 && (
            <Section>
              <SectionLabel>Productos</SectionLabel>
              {products.map((product) => {
                const attrs = product.attributes || product;
                let imgUrl = null;
                if (attrs.portada?.data?.attributes?.url) {
                  imgUrl = `${STRAPI_URL}${attrs.portada.data.attributes.url}`;
                } else if (attrs.portada?.url) {
                  imgUrl = `${STRAPI_URL}${attrs.portada.url}`;
                }
                return (
                  <ProductItem
                    key={product.id || product.documentId}
                    onClick={() => handleProductClick(product)}
                    role="option"
                  >
                    <ProductThumb>
                      {imgUrl ? (
                        <img src={imgUrl} alt={attrs.nombre} />
                      ) : (
                        <svg viewBox="0 0 24 24" fill="#ddd" style={{ width: 24, height: 24 }}>
                          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                        </svg>
                      )}
                    </ProductThumb>
                    <ProductInfo>
                      <ProductName>{attrs.nombre}</ProductName>
                      <ProductBrand>{attrs.marca || 'Marybe'}</ProductBrand>
                    </ProductInfo>
                  </ProductItem>
                );
              })}
            </Section>
          )}

          {/* Ver todos */}
          {hasResults && (
            <>
              <Divider />
              <ViewAllBtn onClick={handleViewAll}>
                Ver todos los resultados de "{query}"
                <ArrowSvg />
              </ViewAllBtn>
            </>
          )}

          {/* Estado vacío */}
          {showEmpty && (
            <EmptyState>
              No encontramos productos para "<strong>{query}</strong>"
            </EmptyState>
          )}
        </>
      )}
    </Dropdown>
  );
}
