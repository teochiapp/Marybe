import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

// ─── Styled Components ────────────────────────────────────────────────────────

const Banner = styled.section`
  background-color: ${({ $seccion }) => ($seccion === 'hogar' ? 'var(--color-hogar)' : 'var(--color-bordo-cuarto)')};
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 437px;
  padding: 32px 64px;
  gap: 48px;
  overflow: hidden;
  position: relative;

  @media (max-width: 1200px) {
    flex-direction: column;
    align-items: stretch;
    padding: 32px 20px 20px;
    gap: 0;
    min-height: 0;
  }
`;

/* ─── Título ─────────────────────────────────────────────────────────────── */

const DesktopTitle = styled.h2`
  font-family: var(--font-family-primary);
  font-size: 56px;
  font-weight: 400;
  color: var(--color-blanco);
  margin: 0 0 24px 0;
  line-height: 1.1;
  white-space: nowrap;

  em {
    font-style: italic;
    font-weight: 700;
  }

  @media (max-width: 1200px) {
    display: none;
  }
`;

const MobileTitle = styled.h2`
  display: none;

  @media (max-width: 1200px) {
    display: flex;
    gap: 15px;   
    justify-content: center;
    font-family: var(--font-family-primary);
    font-size: 56px;
    font-weight: 400;
    color: var(--color-blanco);
    margin: 0 0 24px 0;
    line-height: 1.05;
    text-align: center;
    letter-spacing: -2%;

    em {
      font-style: italic;
      font-weight: 600;
      display: block;
    }
  }

  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

/* ─── Imagen ─────────────────────────────────────────────────────────────── */

const ImageWrapper = styled(motion.div)`
  flex: 0 0 32%;
  position: relative;
  align-self: stretch;

  @media (max-width: 1200px) {
    flex: none;
    width: 100%;
    height: 380px;
    margin-bottom: 16px;
  }

  @media (max-width: 600px) {
    height: 260px;
  }
`;

/*
  Animación suave de la imagen:
  - En desktop ancho (≥1440px) queda corrida a la izquierda con translateX -476px
  - A medida que el viewport se achica hacia 1200px, el clamp/calc
    la lleva gradualmente hacia la derecha hasta -340px
  - A 1200px y menos pasa al layout mobile/tablet (centrada y más grande)
  - A 600px y menos achica para mobile chico
*/
const CardImage = styled.img`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(
      clamp(-476px, calc(-476px + (1440px - 100vw) * 0.567), -340px),
      -50%
    )
    rotate(8deg);
  width: 750px;
  max-width: none;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(rgba(0, 0, 0, 0.35) 0px 18px 32px);
  pointer-events: none;

  @media (max-width: 1200px) {
    width: 800px;
    transform: translate(-50%, -50%) rotate(-0deg);
  }

  @media (max-width: 600px) {
    width: 360px;
  }
`;

/* ─── Contenido derecho ──────────────────────────────────────────────────── */

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;

  @media (max-width: 1200px) {
    width: 100%;
  }
`;

const Features = styled.div`
  display: flex;
  gap: 32px;
  margin-bottom: 12px;

  @media (max-width: 1200px) {
    flex-direction: column;
    gap: 0;
    margin-bottom: 8px;
  }
`;

const Divider = styled.div`
  width: 1px;
  background-color: rgba(255, 255, 255, 0.25);
  align-self: stretch;

  @media (max-width: 1200px) {
    width: 100%;
    height: 1px;
  }
`;

const Feature = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;

  @media (max-width: 1200px) {
    padding: 16px 0;
  }
`;

const FeatureTitle = styled.span`
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-family-secondary);
  font-size: 24px;
  font-weight: 600;
  color: var(--color-blanco);
`;

const FeatureDesc = styled.span`
  font-family: var(--font-family-secondary);
  font-size: 16px;
  color: rgba(255, 255, 255, 0.75);
  padding-left: 34px;
  line-height: 1.4;
`;

/* ─── Botón ──────────────────────────────────────────────────────────────── */

const KnowMoreBtn = styled.a`
  align-self: flex-end;
  margin-right: 10%;
  background-color: var(--color-blanco);
  color: var(--color-marron-tercero);
  font-family: var(--font-family-secondary);
  font-size: 0.95rem;
  font-weight: 500;
  padding: 15px 36px;
  border-radius: 10px;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;

  &:hover {
    background-color: var(--color-rosa-tercero);
    transform: translateY(-1px);
  }

  @media (max-width: 1200px) {
    align-self: stretch;
    margin-right: 0;
    text-align: center;
    padding: 16px 28px;
    font-size: 1rem;
  }
`;

// ─── Íconos ───────────────────────────────────────────────────────────────────

const SparkleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M14.0002 4.1002L12.0002 6.0002M5.1002 8.0002L2.2002 7.2002M6.0002 12.0002L4.1002 14.0002M7.2002 2.2002L8.0002 5.1002M9.0372 9.6902C8.99842 9.59885 8.98782 9.498 9.00675 9.40059C9.02569 9.30317 9.07329 9.21364 9.14346 9.14346C9.21364 9.07329 9.30317 9.02569 9.40059 9.00675C9.498 8.98782 9.59885 8.99842 9.6902 9.0372L20.6902 13.5372C20.7881 13.5774 20.8707 13.6475 20.9262 13.7377C20.9817 13.8278 21.0071 13.9332 20.9989 14.0387C20.9907 14.1442 20.9492 14.2443 20.8804 14.3247C20.8117 14.4052 20.7191 14.4617 20.6162 14.4862L16.2672 15.5272C16.0877 15.5701 15.9235 15.6618 15.7929 15.7922C15.6623 15.9227 15.5703 16.0867 15.5272 16.2662L14.4872 20.6162C14.463 20.7195 14.4065 20.8124 14.326 20.8815C14.2454 20.9506 14.145 20.9922 14.0392 21.0005C13.9335 21.0087 13.8278 20.9831 13.7376 20.9273C13.6473 20.8715 13.5771 20.7885 13.5372 20.6902L9.0372 9.6902Z"
      stroke="#FAF9F7"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MoneyIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M16 8H10C9.46957 8 8.96086 8.21071 8.58579 8.58579C8.21071 8.96086 8 9.46957 8 10C8 10.5304 8.21071 11.0391 8.58579 11.4142C8.96086 11.7893 9.46957 12 10 12H14C14.5304 12 15.0391 12.2107 15.4142 12.5858C15.7893 12.9609 16 13.4696 16 14C16 14.5304 15.7893 15.0391 15.4142 15.4142C15.0391 15.7893 14.5304 16 14 16H8M12 18V6M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
      stroke="#FAF9F7"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ─── Componente ───────────────────────────────────────────────────────────────

export default function GiftCard({ seccion = 'perfumeria' }) {
  return (
    <Banner $seccion={seccion}>
      {/* Título solo mobile — arriba de todo */}
      <MobileTitle>
        <em>Regalá</em> Marybe
      </MobileTitle>

      <ImageWrapper
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
      >
        <CardImage src="/inicio/giftcard.png" alt="Gift card Marybe" />
      </ImageWrapper>

      <Content>
        <DesktopTitle>
          <em>Regalá</em> Marybe
        </DesktopTitle>

        <Features>
          <Feature>
            <FeatureTitle>
              <SparkleIcon /> Producto
            </FeatureTitle>
            <FeatureDesc>Elegí el producto perfecto para regalar</FeatureDesc>
          </Feature>

          <Divider />

          <Feature>
            <FeatureTitle>
              <MoneyIcon /> Monto personalizado
            </FeatureTitle>
            <FeatureDesc>Vos elegís cuánto regalar</FeatureDesc>
          </Feature>
        </Features>

        <KnowMoreBtn href="#">Conocer más</KnowMoreBtn>
      </Content>
    </Banner>
  );
}
