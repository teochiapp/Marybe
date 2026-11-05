import React from 'react';
import styled from 'styled-components';
import { usePaginaHistoria } from '../../hooks/usePaginaHistoria';

const Container = styled.div`
  max-width: 1480px;
  margin: 0 auto;

  @media (max-width: 600px) {
    padding: 0 var(--spacing-md);
  }
`;

/* Banda a todo el ancho: una mitad foto (de borde a borde) y la otra texto. */
const Banner = styled.div`
  display: grid;
  grid-template-columns: ${({ $hasImage }) => ($hasImage ? '1fr 1fr' : '1fr')};
  align-items: center;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const PhotoFrame = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 5 / 4;
  overflow: hidden;

  @media (max-width: 900px) {
    aspect-ratio: 16 / 10;
  }
`;

const Photo = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: ${({ $position }) => $position || 'center'};
  display: block;
`;

const BannerText = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  justify-self: center;
  padding: var(--spacing-xxl);
  max-width: 750px;

  @media (max-width: 900px) {
    padding: var(--spacing-xl) var(--spacing-md);
    max-width: none;
  }
`;

const TextBlock = styled.div`
  color: #280101;
  font-family: var(--font-family-secondary);
  line-height: 1.7;

  p {
    margin: 0 0 var(--spacing-lg);
    color: #280101;
    font-size: clamp(1rem, 1.5vw, 1.375rem);
  }

  p:last-child {
    margin-bottom: 0;
  }

  strong {
    color: #280101;
    font-weight: 600;
    font-size: clamp(1rem, 1.5vw, 1.375rem);
  }
`;

const Title = styled.h1`
  font-family: var(--font-family-primary);
  font-style: italic;
  font-weight: 600;
  font-size: clamp(2rem, 4vw, 2.8rem);
  color: #280101;
  letter-spacing: -0.02em;
  margin: 0 0 var(--spacing-xxl);

  @media (max-width: 600px) {
    font-size: 2rem;
  }
`;

const FullText = styled.div`
  color: #280101;
  font-family: var(--font-family-secondary);
  line-height: 1.8;
  margin: clamp(2rem, 5vw, 4rem) 0;
  gap: 20px;
  display: flex;
  flex-direction: column;

  p {
    margin: 0;
    color: #280101;
    font-size: clamp(1rem, 1.5vw, 1.375rem);
    font-weight: 400;
  }

  strong {
    color: #280101;
    font-weight: 600;
    font-size: clamp(1rem, 1.5vw, 1.375rem);
  }
`;

const FinalPicture = styled.picture`
  display: block;
  width: 100%;
  margin-top: clamp(1.5rem, 4vw, 3rem);

  img {
    display: block;
    width: 100%;
    height: auto;
  }
`;

export default function HistoriaContent() {
  const {
    titulo,
    imagen_inicio,
    encuadre_imagen_inicio,
    texto_banner_1,
    texto_intermedio,
    texto_banner_2,
    imagen_secundaria,
    encuadre_imagen_secundaria,
    imagen_final_desktop,
    encuadre_imagen_final_desktop,
    imagen_final_mobile,
    encuadre_imagen_final_mobile,
  } = usePaginaHistoria();

  return (
    <>
      <Banner $hasImage={Boolean(imagen_inicio)}>
        {imagen_inicio && <PhotoFrame>
          <Photo src={imagen_inicio} alt="Fundadores de MARYBE en los inicios de la perfumería" $position={encuadre_imagen_inicio} loading="eager" fetchPriority="high" decoding="async" />
        </PhotoFrame>}
        <BannerText>
          <TextBlock>
            <Title>{titulo}</Title>
            <div dangerouslySetInnerHTML={{ __html: texto_banner_1 }} />
          </TextBlock>
        </BannerText>
      </Banner>

      <Container>
        <FullText dangerouslySetInnerHTML={{ __html: texto_intermedio }} />
      </Container>

      <Banner $hasImage={Boolean(imagen_secundaria)}>
        <BannerText>
          <TextBlock dangerouslySetInnerHTML={{ __html: texto_banner_2 }} />
        </BannerText>
        {imagen_secundaria && <PhotoFrame>
          <Photo src={imagen_secundaria} alt="Equipo de MARYBE en una de las sucursales" $position={encuadre_imagen_secundaria} loading="lazy" decoding="async" />
        </PhotoFrame>}
      </Banner>

      {(imagen_final_desktop || imagen_final_mobile) && (
        <FinalPicture style={{
          '--position-desktop': encuadre_imagen_final_desktop,
          '--position-mobile': encuadre_imagen_final_mobile,
        }}>
          {imagen_final_mobile && <source media="(max-width: 900px)" srcSet={imagen_final_mobile} />}
          <img
            src={imagen_final_desktop || imagen_final_mobile}
            alt="Familia y equipo de MARYBE Perfumerías"
            loading="lazy"
            decoding="async"
          />
        </FinalPicture>
      )}
    </>
  );
}
