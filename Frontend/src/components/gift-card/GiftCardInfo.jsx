import React, { useState } from 'react';
import styled from 'styled-components';

const InfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const Eyebrow = styled.span`
  font-family: var(--font-family-secondary);
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #535353;
`;

const IconActions = styled.div`
  display: flex;
  gap: 16px;
  color: var(--color-bordo-secundario);

  button {
    background: none;
    border: none;
    cursor: pointer;
    color: inherit;
    display: flex;
    transition: var(--transition-fast);
  }

  button:hover {
    opacity: 0.65;
  }
`;

const Title = styled.h1`
  font-family: var(--font-family-primary);
  font-size: clamp(2.4rem, 4vw, 3.4rem);
  font-weight: 400;
  color: var(--color-marron-principal);
  margin: 8px 0 24px 0;
`;

const FieldLabel = styled.label`
  font-family: var(--font-family-secondary);
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-marron-secundario);
  margin-bottom: 10px;
  display: block;
`;

const MontoInput = styled.input`
  width: 100%;
  padding: 14px 16px;
  border: 1px solid var(--color-giftcard-borde);
  border-radius: var(--radius-md);
  font-family: var(--font-family-secondary);
  font-size: 1rem;
  color: var(--color-marron-secundario);
  background-color: var(--color-blanco);
  transition: var(--transition-fast);

  &::placeholder {
    color: #b8b0a8;
  }

  &:focus {
    outline: none;
    border-color: var(--color-giftcard-oro);
    box-shadow: 0 0 0 3px rgba(194, 161, 92, 0.15);
  }
`;

const CantidadLabel = styled.span`
  font-family: var(--font-family-secondary);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-marron-secundario);
  margin: 22px 0 10px 0;
  display: block;
`;

const ActionRow = styled.div`
  display: flex;
  gap: 16px;

  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const Stepper = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid var(--color-giftcard-borde);
  border-radius: var(--radius-md);
  overflow: hidden;

  button {
    width: 44px;
    height: 52px;
    background: none;
    border: none;
    font-size: 1.3rem;
    color: var(--color-marron-secundario);
    cursor: pointer;
    transition: var(--transition-fast);
  }

  button:hover {
    background-color: var(--color-giftcard-crema);
  }
`;

const Quantity = styled.span`
  min-width: 40px;
  text-align: center;
  font-family: var(--font-family-secondary);
  font-size: 1rem;
  color: var(--color-marron-secundario);
`;

const AddButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background-color: #280101;
  color: var(--color-blanco);
  font-family: var(--font-family-secondary);
  font-size: 1rem;
  font-weight: 500;
  border: none;
  border-radius: var(--radius-md);
  padding: 0 28px;
  height: 52px;
  cursor: pointer;
  transition: var(--transition-fast);

  &:hover {
    background-color: var(--color-bordo-tercero);
  }
`;

const InfoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: 26px 0;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-family: var(--font-family-secondary);
  font-size: 0.9rem;
  color: var(--color-marron-secundario);

  svg {
    flex-shrink: 0;
    margin-top: 2px;
    color: var(--color-bordo-secundario);
  }

  a {
    color: #9D4343;
    font-weight: 600;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const GiftNote = styled.div`
  background-color: var(--color-giftcard-crema);
  border-radius: var(--radius-md);
  padding: 20px 24px;
  display: flex;
  gap: 18px;
  align-items: center;

  @media (max-width: 600px) {
    flex-direction: column;
    text-align: center;
  }
`;

const GiftNoteTitle = styled.span`
  font-family: var(--font-family-primary);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-marron-principal);
  line-height: 1.2;
  flex-shrink: 0;
  max-width: 130px;
`;

const GiftNoteText = styled.p`
  font-family: var(--font-family-secondary);
  font-size: 0.9rem;
  color: var(--color-marron-secundario);
  margin: 0;
  line-height: 1.5;

  strong {
    font-weight: 600;
  }
`;

const HeartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const ShareIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const PinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const TruckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const GiftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 12 20 22 4 22 4 12" />
    <rect x="2" y="7" width="20" height="5" />
    <line x1="12" y1="22" x2="12" y2="7" />
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
  </svg>
);

export default function GiftCardInfo() {
  const [cantidad, setCantidad] = useState(1);

  const decrease = () => setCantidad((q) => Math.max(1, q - 1));
  const increase = () => setCantidad((q) => q + 1);

  return (
    <InfoWrapper>
      <TopRow>
        <Eyebrow>Regalá Marybe</Eyebrow>
        <IconActions>
          <button type="button" aria-label="Compartir"><ShareIcon /></button>
          <button type="button" aria-label="Agregar a favoritos"><HeartIcon /></button>
        </IconActions>
      </TopRow>

      <Title>Gift card</Title>

      <FieldLabel htmlFor="monto">Indicá el monto que querés regalar</FieldLabel>
      <MontoInput id="monto" type="text" inputMode="numeric" placeholder="$20.000" />

      <CantidadLabel>Cantidad</CantidadLabel>
      <ActionRow>
        <Stepper>
          <button type="button" onClick={decrease} aria-label="Disminuir cantidad">−</button>
          <Quantity>{cantidad}</Quantity>
          <button type="button" onClick={increase} aria-label="Aumentar cantidad">+</button>
        </Stepper>
        <AddButton type="button">
          Agregar
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        </AddButton>
      </ActionRow>

      <InfoList>
        <InfoItem>
          <PinIcon />
          <span>Retira gratis en nuestras sucursales&nbsp;<a href="/sucursales">Ver sucursales</a></span>
        </InfoItem>
        <InfoItem>
          <TruckIcon />
          <span>Calcula costo de envío&nbsp;<a href="/metodo-envio">Calcular costo</a></span>
        </InfoItem>
        <InfoItem>
          <GiftIcon />
          <span>Si es para regalo, en el carro de compras podrás dejar un mensaje personalizado para esa persona.</span>
        </InfoItem>
      </InfoList>

      <GiftNote>
        <GiftNoteTitle>¿Te regalaron una Gift Card?</GiftNoteTitle>
        <GiftNoteText>
          Agregá los productos que desees en el carrito y luego en el proceso de compra agregá el <strong>código de tu Gift Card.</strong>
        </GiftNoteText>
      </GiftNote>
    </InfoWrapper>
  );
}
