import React from 'react';
import styled from 'styled-components';

const Section = styled.section`
  margin-top: 72px;
`;

const Title = styled.h2`
  font-family: var(--font-family-primary);
  font-size: 3rem;
  font-weight: 700;
  color: #560203;
  margin: 0 0 36px;

  @media (max-width: 600px) {
    font-size: 2.4rem;
  }
`;

const Row = styled.div`
  display: flex;
  gap: 24px;
  justify-content: safe center;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding-bottom: 14px;

  /* Full-bleed: ocupa todo el ancho de la pantalla */
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  padding-left: 60px;
  padding-right: 60px;
  box-sizing: border-box;

  &::-webkit-scrollbar {
    height: 7px;
  }
  &::-webkit-scrollbar-thumb {
    background: #e0d8d2;
    border-radius: 10px;
  }

  @media (max-width: 1024px) {
    padding-left: 20px;
    padding-right: 20px;
  }
`;

const Card = styled.article`
  /* 6 productos a la vez: (ancho - padding lateral 120px - 5 gaps de 24px) / 6 */
  flex: 0 0 calc((100vw - 240px) / 6);
  scroll-snap-align: start;

  @media (max-width: 1024px) {
    /* 3 a la vez */
    flex: 0 0 calc((100vw - 88px) / 3);
  }

  @media (max-width: 600px) {
    /* 2 a la vez */
    flex: 0 0 calc((100vw - 64px) / 2);
  }
  background-color: var(--color-blanco);
  border: 1px solid #eee;
  border-radius: 17px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.25s ease, box-shadow 0.25s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 14px 28px -14px rgba(40, 1, 1, 0.25);
  }
`;

const ImageWrap = styled.div`
  position: relative;
  background-color: #f6f4f0;
  height: 276px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 19px;

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`;

const Promo = styled.span`
  position: absolute;
  top: 14px;
  left: 14px;
  background-color: #f4dede;
  color: #7C0405;
  font-size: 0.94rem;
  font-weight: 700;
  padding: 4px 14px;
  border-radius: var(--radius-full);
`;

const ComboTag = styled.span`
  position: absolute;
  top: 53px;
  left: 14px;
  background-color: #f0c9c9;
  color: #7C0405;
  font-size: 0.9rem;
  font-weight: 700;
  padding: 4px 14px;
  border-radius: var(--radius-full);
`;

const Body = styled.div`
  padding: 17px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
`;

const Name = styled.p`
  font-size: 1.14rem;
  font-weight: 600;
  color: #280101;
  margin: 0;
`;

const Brand = styled.span`
  font-size: 0.86rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: #9a8f88;
  text-transform: uppercase;
`;

const PriceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 7px;
`;

const OldPrice = styled.span`
  font-size: 0.98rem;
  color: #b0a89f;
  text-decoration: line-through;
`;

const Price = styled.span`
  font-size: 1.26rem;
  font-weight: 700;
  color: #7C0405;
`;

const Discount = styled.span`
  background-color: #c0392b;
  color: #fff;
  font-size: 0.86rem;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 7px;
`;

const Installments = styled.span`
  font-size: 0.98rem;
  color: #5b524c;
`;

const Legal = styled.span`
  font-size: 0.86rem;
  color: #b0a89f;
`;

const AddBtn = styled.button`
  margin-top: 17px;
  width: 100%;
  background-color: #280101;
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  padding: 15px;
  font-family: var(--font-family-secondary);
  font-size: 1.08rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: background-color 0.25s ease;

  &:hover {
    background-color: #7C0405;
  }

  svg {
    width: 22px;
    height: 22px;
  }
`;

const IMG = '/inicio/elixir.png';

const similares = Array.from({ length: 8 }).map((_, i) => ({
  id: i,
  nombre: 'Flower Ikebana Indigo EDP 40ml',
  marca: 'KENZO',
  precioViejo: '$194.600',
  precio: '$116.760',
  descuento: '10%',
  cuota: '$4.333',
  sinImpuestos: '$200.000',
}));

export default function SingleSimilares() {
  return (
    <Section>
      <Title>Similares</Title>
      <Row>
        {similares.map((p) => (
          <Card key={p.id}>
            <ImageWrap>
              <Promo>2×1</Promo>
              <ComboTag>Combo</ComboTag>
              <img src={IMG} alt={p.nombre} loading="lazy" />
            </ImageWrap>
            <Body>
              <Name>{p.nombre}</Name>
              <Brand>{p.marca}</Brand>
              <PriceRow>
                <OldPrice>{p.precioViejo}</OldPrice>
                <Price>{p.precio}</Price>
                <Discount>{p.descuento}</Discount>
              </PriceRow>
              <Installments>
                3 cuotas sin interés de <strong>{p.cuota}</strong>
              </Installments>
              <Legal>Precio sin impuestos nacionales {p.sinImpuestos}</Legal>
              <AddBtn>
                Agregar
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 20a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm7 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-8.8-4h9.6l2.4-12H5.6L4.2 1H1v2h2.2l3.4 17h11v-2H7.6l-.4-2zM6.4 6h12.6l-1.6 8H7.2L6.4 6z" />
                </svg>
              </AddBtn>
            </Body>
          </Card>
        ))}
      </Row>
    </Section>
  );
}
