import React from 'react';
import styled from 'styled-components';
import CatalogoProductCard from './CatalogoProductCard';

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

const PaginationRow = styled.nav`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 40px;
  flex-wrap: wrap;
`;

const PageBtn = styled.button`
  background-color: ${({ $active }) => ($active ? 'var(--color-bordo-secundario)' : 'white')};
  color: ${({ $active }) => ($active ? 'white' : '#28180b')};
  border: 1px solid #ece9e4;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    border-color: var(--color-bordo-secundario);
    background-color: ${({ $active }) => ($active ? 'var(--color-bordo-secundario)' : '#faf4ee')};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const PageArrowBtn = styled(PageBtn)`
  width: auto;
  padding: 0 16px;
`;

const PageInfo = styled.span`
  font-size: 0.9rem;
  color: #7a7a7a;
  margin-left: 12px;
`;

// ─── Componente ───────────────────────────────────────────────────────────────

export default function CatalogoProductGrid({
  productos,
  loading,
  error,
  pageSize,
  strapiUrl,
  favorites,
  onToggleFav,
  onClearAll,
  onRetry,
  activePage,
  totalPages,
  onChangePage,
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
          ) : (
            productos.map((product) => (
              <CatalogoProductCard
                key={product.id || product.documentId}
                product={product}
                isFav={!!favorites[product.id || product.documentId]}
                onToggleFav={onToggleFav}
                strapiUrl={strapiUrl}
              />
            ))
          )}
        </ProductsGrid>
      )}

      {/* Paginación */}
      {!loading && !error && totalPages > 1 && (
        <PaginationRow aria-label="Navegación de páginas">
          <PageArrowBtn
            id="btn-pag-prev"
            disabled={activePage === 1}
            onClick={() => onChangePage(activePage - 1)}
          >
            ← Anterior
          </PageArrowBtn>

          {Array.from({ length: totalPages }).map((_, idx) => {
            const p = idx + 1;
            return (
              <PageBtn
                key={p}
                $active={activePage === p}
                onClick={() => onChangePage(p)}
              >
                {p}
              </PageBtn>
            );
          })}

          <PageArrowBtn
            id="btn-pag-next"
            disabled={activePage === totalPages}
            onClick={() => onChangePage(activePage + 1)}
          >
            Siguiente →
          </PageArrowBtn>

          <PageInfo>Página {activePage} de {totalPages}</PageInfo>
        </PaginationRow>
      )}
    </>
  );
}
