import React from 'react';
import styled from 'styled-components';
import CatalogoProductCard from './CatalogoProductCard';
import CategoriesSection from '../../inicio/perfumeria/CategoriesSection';

// ─── Styled Components ────────────────────────────────────────────────────────

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;

  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
`;

const SkeletonCard = styled.div`
  background-color: white;
  border-radius: 24px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border: 1px solid #ece9e4;
`;

const SkeletonBox = styled.div`
  background: linear-gradient(90deg, #f2f0eb 25%, #eae7e0 50%, #f2f0eb 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: ${({ $radius }) => $radius || '4px'};
  width: ${({ $width }) => $width || '100%'};
  height: ${({ $height }) => $height || '20px'};

  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

const EmptyState = styled.div`
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  background-color: white;
  border-radius: 24px;
  border: 1px dashed #ece9e4;
  color: #7a7a7a;

  h3 {
    font-size: 1.4rem;
    color: var(--color-marron-principal);
    margin-bottom: 8px;
  }

  p {
    margin-bottom: 20px;
  }
`;

const ActionPill = styled.button`
  background-color: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.12);
  color: white;
  padding: 10px 24px;
  border-radius: var(--radius-full);
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s ease;
`;

const SearchEmptyWrapper = styled.div`
  grid-column: 1 / -1;
`;

const SearchEmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 20px;
  padding: 60px 20px 40px;
`;

const SearchEmptyIcon = styled.div`
  flex-shrink: 0;

  svg {
    display: block;
  }

  @media (max-width: 768px) {
    svg {
      width: 48px;
      height: 48px;
    }
  }
`;

const SearchEmptyText = styled.div`
  h2 {
    font-family: var(--font-family-primary);
    font-size: 2rem;
    color: var(--color-marron-tercero);
    font-weight: 500;
    line-height: 1.25;
    margin-bottom: 8px;

    strong {
      font-style: italic;
    }

    @media (max-width: 768px) {
      font-size: 1.4rem;
    }
  }

  p {
    font-family: var(--font-family-secondary);
    font-size: 1.1rem;
    color: #280101;
    margin-bottom: 0;
    line-height: 1.5;
    max-width: 420px;
    margin: 0 auto;

    @media (max-width: 768px) {
      font-size: 0.875rem;
      max-width: 200px;
    }
  }
`;

const LoadMoreContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 50px;
  margin-bottom: 20px;
  width: 100%;
`;

const LoadMoreBtn = styled.button`
  background-color: transparent;
  color: var(--color-marron-principal);
  border: 2px solid var(--color-marron-principal);
  padding: 14px 40px;
  border-radius: var(--radius-full);
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover:not(:disabled) {
    background-color: var(--color-marron-principal);
    color: white;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// ─── Componente ───────────────────────────────────────────────────────────────

export default function CatalogoProductGrid({
  productos,
  loading,
  loadingMore,
  error,
  pageSize,
  strapiUrl,
  onClearAll,
  onRetry,
  activePage,
  totalPages,
  onLoadMore,
  activeBusqueda,
}) {
  return (
    <>
      {/* Estado de error */}
      {error && (
        <EmptyState>
          <h3>Ocurrió un inconveniente</h3>
          <p>{error}</p>
          <ActionPill
            style={{ backgroundColor: 'var(--color-bordo-secundario)', border: 'none' }}
            onClick={onRetry}
          >
            Reintentar
          </ActionPill>
        </EmptyState>
      )}

      {/* Grilla */}
      {!error && (
        <ProductsGrid>
          {loading ? (
            Array.from({ length: pageSize }).map((_, i) => (
              <SkeletonCard key={i}>
                <SkeletonBox $height="220px" $radius="16px" />
                <SkeletonBox $width="40%" $height="14px" />
                <SkeletonBox $width="80%" $height="18px" />
                <SkeletonBox $width="60%" $height="20px" />
                <SkeletonBox $width="100%" $height="40px" $radius="12px" />
              </SkeletonCard>
            ))
          ) : productos.length === 0 ? (
            activeBusqueda ? (
              <SearchEmptyWrapper>
                <SearchEmptyState>
                  <SearchEmptyIcon>
                    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M49 49L38.9667 38.9667M25.6667 16.3333V25.6667M25.6667 35H25.69M44.3333 25.6667C44.3333 35.976 35.976 44.3333 25.6667 44.3333C15.3574 44.3333 7 35.976 7 25.6667C7 15.3574 15.3574 7 25.6667 7C35.976 7 44.3333 15.3574 44.3333 25.6667Z" stroke="#7C0405" strokeWidth="4.66667" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </SearchEmptyIcon>
                  <SearchEmptyText>
                    <h2>No encontramos resultados para &ldquo;<strong>{activeBusqueda}</strong>&rdquo;</h2>
                    <p>Te recomendamos revisar si está bien escrito o intentar con otras palabras.</p>
                  </SearchEmptyText>
                </SearchEmptyState>
                <CategoriesSection compact />
              </SearchEmptyWrapper>
            ) : (
              <EmptyState>
                <h3>No se encontraron productos</h3>
                <p>Intentá removiendo algunos de los filtros seleccionados.</p>
                <ActionPill
                  style={{ backgroundColor: 'var(--color-marron-principal)', border: 'none' }}
                  onClick={onClearAll}
                >
                  Limpiar Filtros
                </ActionPill>
              </EmptyState>
            )
          ) : (
            productos.map((product) => (
              <CatalogoProductCard
                key={product.id || product.documentId}
                product={product}
                strapiUrl={strapiUrl}
              />
            ))
          )}
        </ProductsGrid>
      )}

      {/* Botón Cargar Más */}
      {!loading && !error && activePage < totalPages && (
        <LoadMoreContainer>
          <LoadMoreBtn
            disabled={loadingMore}
            onClick={onLoadMore}
          >
            {loadingMore ? 'Cargando...' : 'Cargar más productos'}
          </LoadMoreBtn>
        </LoadMoreContainer>
      )}
    </>
  );
}
