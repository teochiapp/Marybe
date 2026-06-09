import React from 'react';
import styled from 'styled-components';

// ─── Styled Components ────────────────────────────────────────────────────────

const Section = styled.section`
  background-color: var(--color-fondo-tarjetas-promo);
  padding: 64px 32px;
  width: 100%;

  @media (max-width: 768px) {
    padding: 40px 16px;
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h2`
  font-family: var(--font-family-primary);
  font-weight: 600;
  font-size: 48px;
  color: black;
  margin: 0 0 48px 0;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 24px;
    margin-bottom: 32px;
  }
`;

/* ─── Grid de tarjetas ──────────────────────────────────────────────────── */

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  width: 100%;
  margin-bottom: 40px;

  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 0 24px 24px 24px;
  border-bottom: 1px solid rgba(40, 1, 1, 0.15);

  @media (max-width: 992px) {
    padding: 0 16px 24px 16px;
  }
`;

const CardImage = styled.img`
  width: auto;
  max-width: 140px;
  height: 50px;
  object-fit: contain;
  margin-bottom: 16px;
`;

const CardText = styled.p`
  font-family: var(--font-family-secondary);
  font-size: 14px;
  color: black;
  margin: 0;
  line-height: 1.5;

  strong {
    font-weight: 700;
  }

  & + & {
    margin-top: 8px;
  }
`;

/* ─── Box de información ─────────────────────────────────────────────── */

const InfoBox = styled.div`
  background-color: var(--color-fondo-info-promo);
  border-radius: 12px;
  padding: 24px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    padding: 20px;
  }
`;

const InfoTextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const InfoTitle = styled.h3`
  font-family: var(--font-family-secondary);
  font-size: 20px;
  font-weight: 700;
  color: black;
  margin: 0;
`;

const InfoDesc = styled.p`
  font-family: var(--font-family-secondary);
  font-size: 14px;
  color: black;
  margin: 0;
  opacity: 0.85;
`;

const InfoButton = styled.a`
  background-color: var(--color-boton-promo);
  color: var(--color-blanco);
  font-family: var(--font-family-secondary);
  font-size: 16px;
  font-weight: 500;
  padding: 14px 28px;
  border-radius: 10px;
  text-decoration: none;
  cursor: pointer;
  white-space: nowrap;
  transition: var(--transition-fast);

  &:hover {
    transform: translateY(-1px);
    opacity: 0.92;
  }

  @media (max-width: 768px) {
    align-self: stretch;
    text-align: center;
  }
`;

// ─── Datos ────────────────────────────────────────────────────────────────────

const tarjetas = [
  {
    id: 1,
    img: '/inicio/tajetaNaranja.png',
    alt: 'NaranjaX',
    texto: (
      <>
        Hasta <strong>6 cuotas</strong> sin interés
        <br />
        en compras hasta <strong>$150.000</strong>
      </>
    ),
  },
  {
    id: 2,
    img: '/inicio/tajetaNaranja.png',
    alt: 'Banco del Sol',
    texto: (
      <>
        Hasta <strong>3 y 6 cuotas</strong> sin interés
        <br />
        en compras hasta <strong>$150.000</strong>
      </>
    ),
  },
  {
    id: 3,
    img: '/inicio/tajetaNaranja.png',
    alt: 'Sucrédito',
    texto: (
      <>
        Hasta <strong>2 y 6 cuotas</strong> sin interés
        <br />
        en compras hasta <strong>$150.000</strong>
      </>
    ),
  },
  {
    id: 4,
    img: '/inicio/tajetaNaranja.png',
    alt: 'Visa / Mastercard',
    texto: (
      <>
        <strong>3 cuotas</strong> sin interés
        <br />
        <strong>6 cuotas</strong> sin interés
        <br />
        en compras desde <strong>$100.000</strong>
      </>
    ),
  },
];

// ─── Componente ───────────────────────────────────────────────────────────────

export default function TarjetasPromociones() {
  return (
    <Section>
      <Container>
        <Title>Beneficios para vos</Title>

        <CardsGrid>
          {tarjetas.map((t) => (
            <Card key={t.id}>
              <CardImage src={t.img} alt={t.alt} />
              <CardText>{t.texto}</CardText>
            </Card>
          ))}
        </CardsGrid>

        <InfoBox>
          <InfoTextWrapper>
            <InfoTitle>¿Necesitás más información?</InfoTitle>
            <InfoDesc>
              Consultá todas las promociones vigentes y encontrá la que mas te conviene.
            </InfoDesc>
          </InfoTextWrapper>
          <InfoButton href="#">Ver todas las promociones</InfoButton>
        </InfoBox>
      </Container>
    </Section>
  );
}
