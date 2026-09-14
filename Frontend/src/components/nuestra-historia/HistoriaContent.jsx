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
  grid-template-columns: 1fr 1fr;
  align-items: stretch;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Photo = styled.img`
  width: 100%;
  height: 100%;
  min-height: 460px;
  object-fit: cover;
  display: block;

  @media (max-width: 900px) {
    min-height: 320px;
  }
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
    font-size: 22px;
  }

  p:last-child {
    margin-bottom: 0;
  }

  strong {
    color: #280101;
    font-weight: 600;
    font-size: 22px;
  }
`;

const Title = styled.h1`
  font-family: var(--font-family-primary);
  font-style: italic;
  font-weight: 600;
  font-size: 2.8rem;
  color: #280101;
  letter-spacing: -2%;
  margin: 0 0 var(--spacing-xxl);

  @media (max-width: 600px) {
    font-size: 2rem;
  }
`;

const FullText = styled.div`
  color: #280101;
  font-family: var(--font-family-secondary);
  line-height: 1.8;
  margin: 4rem 0;
  gap: 20px;
  display: flex;
  flex-direction: column;

  p {
    margin: 0;
    color: #280101;
    font-size: 22px;
    font-weight: 400;
  }

  strong {
    color: #280101;
    font-weight: 600;
    font-size: 22px;
  }
`;

/* La foto de "vestidas" queda por debajo para que la imagen full-width
   final se vea superpuesta por encima de ella. Se recortan 200px de arriba. */
const OverlapWrap = styled.div`
  position: relative;
  z-index: 1;
  overflow: hidden;
  height: 460px;

  @media (max-width: 900px) {
    height: 320px;
    order: -1;
  }
`;

const CroppedPhoto = styled.img`
  width: 100%;
  height: calc(100% + 600px);
  margin-top: -200px;
  object-fit: cover;
  display: block;
`;

const MobileFullPhoto = styled.img`
  display: none;

  @media (max-width: 900px) {
    display: block;
    width: 100%;
    max-height: 400px;
    object-fit: cover;
    object-position: center top;
  }
`;

const FullPhoto = styled.img`
  width: 100%;
  display: block;
  position: relative;
  z-index: 2;
  margin-top: -80px; /* 70% de los 460px del banner superior */
  max-height: 600px;
  object-fit: cover;
  object-position: center top;

  @media (max-width: 900px) {
    display: none;
  }
`;

export default function HistoriaContent() {
  const {
    titulo,
    imagen_inicio,
    texto_banner_1,
    texto_intermedio,
    texto_banner_2,
    imagen_secundaria,
    imagen_final_desktop,
    imagen_final_mobile,
  } = usePaginaHistoria();

  return (
    <>
      <Banner>
        <Photo src={imagen_inicio} alt="Fundadores de MARYBE en los inicios de la perfumería" />
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

      <Banner>
        <BannerText>
          <TextBlock dangerouslySetInnerHTML={{ __html: texto_banner_2 }} />
        </BannerText>
        <OverlapWrap>
          <CroppedPhoto src={imagen_secundaria} alt="Equipo de MARYBE en una de las sucursales" />
        </OverlapWrap>
      </Banner>

      <FullPhoto src={imagen_final_desktop} alt="Familia y equipo de MARYBE Perfumerías" />
      <MobileFullPhoto src={imagen_final_mobile} alt="Familia y equipo de MARYBE Perfumerías" />
    </>
  );
}
