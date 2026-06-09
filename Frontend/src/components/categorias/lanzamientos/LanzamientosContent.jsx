import React from 'react';
import styled from 'styled-components';

const HeroBanner = styled.div`
  background: linear-gradient(135deg, var(--color-marron-cuarto) 0%, var(--color-bordo-tercero) 100%);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xxl) var(--spacing-xl);
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
  color: var(--color-blanco);
  margin-bottom: var(--spacing-xxl);
  box-shadow: var(--shadow-md);

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    padding: var(--spacing-xl);
  }
`;

const HeroText = styled.div`
  flex: 1.2;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ReleaseTag = styled.span`
  background-color: var(--color-titulo-marybe);
  color: var(--color-marron-tercero);
  font-size: 0.8rem;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  width: fit-content;
  text-transform: uppercase;
  letter-spacing: 1px;

  @media (max-width: 768px) {
    margin: 0 auto;
  }
`;

const HeroTitle = styled.h2`
  font-family: var(--font-family-primary);
  font-size: clamp(2rem, 3.5vw, 2.7rem);
  color: var(--color-blanco);
  margin: 0;
  font-weight: 700;
  line-height: 1.1;
`;

const HeroDesc = styled.p`
  font-size: 1rem;
  color: var(--color-rosa-tercero);
  line-height: 1.5;
  margin: 0;
`;

const ReleaseImage = styled.div`
  flex: 0.8;
  display: flex;
  justify-content: center;
  font-size: 8rem;
`;

const ShowcaseSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
`;

const ProductRow = styled.div`
  background-color: var(--color-blanco);
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  display: flex;
  gap: var(--spacing-xl);
  align-items: center;
  box-shadow: var(--shadow-sm);

  &:nth-child(even) {
    flex-direction: row-reverse;
  }

  @media (max-width: 768px) {
    flex-direction: column !important;
    gap: var(--spacing-md);
  }
`;

const ProductImgWrap = styled.div`
  flex: 0.8;
  aspect-ratio: 1.2;
  background-color: var(--color-fondo-beneficio-tarjeta);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 5rem;
  box-shadow: var(--shadow-inner);
`;

const ProductInfo = styled.div`
  flex: 1.2;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const BrandName = styled.span`
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--color-bordo-secundario);
  font-weight: 700;
`;

const Name = styled.h3`
  font-family: var(--font-family-primary);
  font-size: 1.8rem;
  color: var(--color-marron-principal);
  margin: 0;
`;

const Description = styled.p`
  font-size: 0.95rem;
  color: #555;
  line-height: 1.5;
  margin: 0;
`;

const NotesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 10px;
`;

const NoteCard = styled.div`
  background-color: var(--color-fondo-tarjetas-promo);
  padding: 8px 12px;
  border-radius: var(--radius-md);
  text-align: center;
  font-size: 0.85rem;
  
  .label {
    font-weight: 700;
    color: var(--color-marron-principal);
    display: block;
    margin-bottom: 2px;
  }
  .value {
    color: #666;
  }
`;

const Button = styled.button`
  background-color: var(--color-marron-principal);
  color: var(--color-blanco);
  font-weight: 600;
  padding: 12px 24px;
  border-radius: var(--radius-md);
  transition: var(--transition-fast);
  width: fit-content;
  margin-top: var(--spacing-sm);

  &:hover {
    background-color: var(--color-bordo-secundario);
  }
`;

const LAUNCHES = [
  {
    brand: 'Azzaro',
    name: 'The Most Wanted Parfum',
    desc: 'Una fragancia masculina intensamente ardiente que te desafía a liberar tu energía más salvaje. Diseñada para el hombre audaz que juega para ganar.',
    emoji: '🥃',
    top: 'Jengibre Rojo',
    heart: 'Acordes de Maderas',
    base: 'Vainilla Bourbon'
  },
  {
    brand: 'Giorgio Armani',
    name: 'My Way Parfum',
    desc: 'Un nuevo capítulo floral e intenso que nos invita a descubrir nuevos horizontes y a forjar nuestro propio camino. Un ramillete radiante y sofisticado.',
    emoji: '🌸',
    top: 'Flor de Azahar',
    heart: 'Iris Pallida',
    base: 'Almizcle Blanco'
  }
];

export default function LanzamientosContent() {
  return (
    <>
      <HeroBanner>
        <HeroText>
          <ReleaseTag>Estreno Exclusivo</ReleaseTag>
          <HeroTitle>Azzaro Wanted Eau de Parfum</HeroTitle>
          <HeroDesc>
            Sentí la adrenalina en tu piel. La combinación perfecta de notas amaderadas y especiadas que definen la masculinidad moderna. Ya disponible en Marybe.
          </HeroDesc>
          <Button style={{ backgroundColor: 'var(--color-titulo-marybe)', color: 'var(--color-marron-tercero)' }}>
            Descubrir Azzaro
          </Button>
        </HeroText>
        <ReleaseImage>🍾</ReleaseImage>
      </HeroBanner>

      <ShowcaseSection>
        {LAUNCHES.map((prod, idx) => (
          <ProductRow key={idx}>
            <ProductImgWrap>{prod.emoji}</ProductImgWrap>
            <ProductInfo>
              <BrandName>{prod.brand}</BrandName>
              <Name>{prod.name}</Name>
              <Description>{prod.desc}</Description>
              <NotesGrid>
                <NoteCard>
                  <span className="label">Nota de salida</span>
                  <span className="value">{prod.top}</span>
                </NoteCard>
                <NoteCard>
                  <span className="label">Nota de corazón</span>
                  <span className="value">{prod.heart}</span>
                </NoteCard>
                <NoteCard>
                  <span className="label">Nota de fondo</span>
                  <span className="value">{prod.base}</span>
                </NoteCard>
              </NotesGrid>
              <Button>Comprar Ahora</Button>
            </ProductInfo>
          </ProductRow>
        ))}
      </ShowcaseSection>
    </>
  );
}
