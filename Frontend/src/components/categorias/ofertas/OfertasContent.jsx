import React from 'react';
import styled from 'styled-components';
import { FiPercent, FiClock } from 'react-icons/fi';

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xxl);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const PromoCard = styled.div`
  background: linear-gradient(135deg, ${({ $bg }) => $bg || 'var(--color-marron-cuarto)'} 0%, var(--color-marron-tercero) 100%);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 240px;
  color: var(--color-blanco);
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;

  &::before {
    content: '%';
    position: absolute;
    right: -20px;
    bottom: -30px;
    font-size: 10rem;
    font-weight: 900;
    color: rgba(255, 255, 255, 0.05);
    font-family: var(--font-family-primary);
  }
`;

const PromoHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--color-titulo-marybe);
  font-weight: 600;

  svg {
    color: var(--color-titulo-marybe);
  }
`;

const PromoTitle = styled.h3`
  font-family: var(--font-family-primary);
  font-size: 1.8rem;
  color: var(--color-blanco);
  margin: var(--spacing-sm) 0;
  font-weight: 700;
`;

const PromoDesc = styled.p`
  font-size: 0.95rem;
  color: var(--color-rosa-tercero);
  line-height: 1.4;
  margin: 0;
`;

const ActionButton = styled.button`
  background-color: var(--color-titulo-marybe);
  color: var(--color-marron-tercero);
  border: none;
  border-radius: var(--radius-md);
  padding: 10px 20px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: var(--transition-fast);
  margin-top: var(--spacing-md);
  width: fit-content;

  &:hover {
    background-color: var(--color-blanco);
  }
`;

const ProductsHeader = styled.h2`
  font-family: var(--font-family-primary);
  font-size: 2rem;
  color: var(--color-marron-principal);
  margin-bottom: var(--spacing-lg);
  text-align: center;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-lg);

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const ProductCard = styled.div`
  background-color: var(--color-blanco);
  border-radius: var(--radius-xl);
  padding: var(--spacing-md);
  border: 1px solid rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  transition: var(--transition-normal);

  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-md);
  }
`;

const Badge = styled.span`
  background-color: var(--color-bordo-secundario);
  color: var(--color-blanco);
  font-size: 0.8rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  align-self: flex-start;
  margin-bottom: 10px;
`;

const ProductImage = styled.div`
  aspect-ratio: 1;
  background-color: #fff;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  margin-bottom: var(--spacing-md);
`;

const ProductName = styled.h4`
  font-family: var(--font-family-secondary);
  font-size: 1rem;
  color: var(--color-marron-tercero);
  margin-bottom: 4px;
`;

const PriceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: auto;
  padding-top: var(--spacing-sm);

  .old-price {
    font-size: 0.9rem;
    color: #a0a0a0;
    text-decoration: line-through;
  }

  .new-price {
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--color-bordo-secundario);
  }
`;

const OFFERS = [
  {
    title: 'Acqua Di Gio Profondo',
    category: 'Giorgio Armani',
    oldPrice: 194600,
    newPrice: 116760,
    discount: '40% OFF',
    emoji: '🌊'
  },
  {
    title: 'Sauvage Eau de Parfum',
    category: 'Dior',
    oldPrice: 210000,
    newPrice: 168000,
    discount: '20% OFF',
    emoji: '🪵'
  },
  {
    title: 'Azzaro Wanted by Night',
    category: 'Azzaro',
    oldPrice: 155000,
    newPrice: 108500,
    discount: '30% OFF',
    emoji: '🔥'
  }
];

export default function OfertasContent() {
  return (
    <>
      <Grid>
        <PromoCard $bg="#7C0405">
          <PromoHeader>
            <FiPercent /> Promoción Especial
          </PromoHeader>
          <div>
            <PromoTitle>Fragancias Seleccionadas</PromoTitle>
            <PromoDesc>Aprovechá hasta un 40% de descuento directo en marcas seleccionadas nacionales e internacionales.</PromoDesc>
          </div>
          <ActionButton>Ver Productos</ActionButton>
        </PromoCard>

        <PromoCard $bg="#3E0102">
          <PromoHeader>
            <FiClock /> Oferta por Tiempo Limitado
          </PromoHeader>
          <div>
            <PromoTitle>Beauty Week - 3x2</PromoTitle>
            <PromoDesc>Llevando 3 productos de maquillaje o dermocosmética, pagás solo 2. La unidad de menor valor es gratis.</PromoDesc>
          </div>
          <ActionButton>Explorar Maquillaje</ActionButton>
        </PromoCard>
      </Grid>

      <ProductsHeader>Descuentos Destacados</ProductsHeader>
      <ProductGrid>
        {OFFERS.map((prod, idx) => (
          <ProductCard key={idx}>
            <Badge>{prod.discount}</Badge>
            <ProductImage>{prod.emoji}</ProductImage>
            <ProductName>{prod.title}</ProductName>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>{prod.category}</div>
            <PriceRow>
              <span className="old-price">${prod.oldPrice.toLocaleString()}</span>
              <span className="new-price">${prod.newPrice.toLocaleString()}</span>
            </PriceRow>
          </ProductCard>
        ))}
      </ProductGrid>
    </>
  );
}
