import React from 'react';
import styled from 'styled-components';

// ─── Styled Components ────────────────────────────────────────────────────────

const TopBanner = styled.div`
  width: 100%;
  max-width: 1400px;
  margin: 0 auto 40px auto;
  background: ${({ $bgColor }) => $bgColor || 'linear-gradient(135deg, #280101 0%, #160000 50%, #3e0102 100%)'};
  border-radius: 24px;
  padding: 0px 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;
  min-height: 240px;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -20%;
    width: 60%;
    height: 200%;
    background: radial-gradient(circle, rgba(242, 220, 143, 0.08) 0%, transparent 70%);
    pointer-events: none;
  }

  @media (max-width: 900px) {
    flex-direction: row;
    align-items: flex-start;
    padding: 30px 24px;
    gap: 0;
    min-height: 220px;
  }
`;

const BannerTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 2;
  max-width: 50%;

  @media (max-width: 900px) {
    max-width: 50%;
    align-items: flex-start;
    z-index: 4;
  }
`;

const BannerTitle = styled.h2`
  font-family: var(--font-family-primary);
  font-size: 3.5rem;
  font-weight: 600;
  color: var(--color-blanco);
  margin: 0;
  line-height: 1.1;
  font-style: italic;

  @media (max-width: 600px) {
    font-size: 2.2rem;
  }
`;


/* Imagen posicionada absolutamente al fondo-derecha del banner */
const BannerImageWrapper = styled.div`
  position: absolute;
  right: 60px;
  bottom: 0;
  width: 32%;
  height: 105%;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  z-index: 1;
  pointer-events: none;

  img {
    height: 100%;
    object-fit: contain;
    filter: drop-shadow(0 15px 20px rgba(0, 0, 0, 0.45));
  }

    @media (max-width: 1450px) and (min-width: 901px) {
    bottom: -2vh;
  }



  @media (max-width: 900px) {
    position: absolute;
    right: 0px;
    bottom: -6vh;
    width: 65%;
    height: 150%;
    pointer-events: none;
  }

    @media (max-width: 410px) {
    bottom: -7vh;
  }

`;

/* Columna derecha solo para las pills */
const BannerRightColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-end;
  width: 40%;
  z-index: 3;
  padding-bottom: 24px;
  align-self: stretch;

  @media (max-width: 900px) {
    position: absolute;
    bottom: 15px;
    right: 15px;
    width: auto;
    align-items: flex-end;
    padding-bottom: 0;
    z-index: 5;
  }
`;

const BannerActions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;

  @media (max-width: 900px) {
    justify-content: flex-end;
  }
`;

const BannerPill = styled.button`
  background-color: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #FAF9F7;
  background: #7C040540;
  padding: 5px 8px;
  border-radius: 13px;
  font-weight: 400;
  font-size: 1.1rem;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--color-titulo-marybe);
    color: var(--color-marron-tercero);
    border-color: var(--color-titulo-marybe);
    transform: translateY(-2px);
  }
`;

// ─── Componente ───────────────────────────────────────────────────────────────

export default function CatalogoBanner({ currentBanner, onPillClick }) {
  if (!currentBanner) return null;

  return (
    <TopBanner $bgColor={currentBanner.bgColor}>
      {/* Título a la izquierda */}
      <BannerTextContainer>
        <BannerTitle>{currentBanner.title}</BannerTitle>
      </BannerTextContainer>

      {/* Imagen: posición absoluta anclada al fondo */}
      <BannerImageWrapper>
        <img src={currentBanner.image} alt={currentBanner.imageAlt} />
      </BannerImageWrapper>

      {/* Pills: columna derecha, parte inferior */}
      <BannerRightColumn>
        <BannerActions>
          {currentBanner.pills.map((pill, idx) => (
            <BannerPill
              key={pill}
              id={`banner-pill-${idx}`}
              onClick={onPillClick}
            >
              {pill}
            </BannerPill>
          ))}
        </BannerActions>
      </BannerRightColumn>
    </TopBanner>
  );
}
