import React, { useState } from 'react';
import styled from 'styled-components';
import { FiGift, FiCheckCircle } from 'react-icons/fi';

const MainLayout = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: var(--spacing-xxl);

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-xl);
  }
`;

const ContentBox = styled.div`
  background-color: var(--color-blanco);
  border: 1px solid rgba(62, 1, 2, 0.08);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  color: #4a4a4a;
  line-height: 1.6;

  h3 {
    font-family: var(--font-family-secondary);
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--color-marron-principal);
    margin: 0;
  }
`;

const CardForm = styled.div`
  background-color: var(--color-blanco);
  border: 1px solid rgba(62, 1, 2, 0.08);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  height: fit-content;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-marron-secundario);
`;

const Input = styled.input`
  background-color: var(--color-fondo-beneficio-tarjeta);
  border: 1px solid rgba(62, 1, 2, 0.15);
  border-radius: var(--radius-md);
  padding: 12px;
  font-size: 0.95rem;
  color: var(--color-marron-tercero);
  outline: none;
  letter-spacing: ${({ $isCode }) => ($isCode ? '4px' : 'normal')};
  text-align: ${({ $isCode }) => ($isCode ? 'center' : 'left')};

  &:focus {
    border-color: var(--color-bordo-secundario);
  }
`;

const ActionButton = styled.button`
  background-color: var(--color-marron-principal);
  color: var(--color-blanco);
  font-weight: 600;
  padding: 14px;
  border-radius: var(--radius-md);
  transition: var(--transition-fast);
  margin-top: var(--spacing-sm);

  &:hover {
    background-color: var(--color-bordo-secundario);
  }
`;

const SecButton = styled.button`
  background-color: transparent;
  color: var(--color-marron-principal);
  border: 1px solid var(--color-marron-principal);
  font-weight: 600;
  padding: 12px;
  border-radius: var(--radius-md);
  transition: var(--transition-fast);

  &:hover {
    background-color: rgba(62, 1, 2, 0.05);
  }
`;

const BalanceShow = styled.div`
  background-color: var(--color-fondo-tarjetas-promo);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  text-align: center;
  margin-top: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: 4px;

  .amount {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--color-bordo-secundario);
  }
`;

const GiftCardGraphic = styled.div`
  width: 100%;
  aspect-ratio: 1.6;
  background: linear-gradient(135deg, var(--color-marron-cuarto) 0%, var(--color-marron-principal) 100%);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: var(--color-titulo-marybe);
  box-shadow: var(--shadow-lg);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(242, 220, 143, 0.1) 0%, transparent 70%);
    pointer-events: none;
  }
`;

export default function CanjearGiftCardContent() {
  const [cardNumber, setCardNumber] = useState('');
  const [pin, setPin] = useState('');
  const [balance, setBalance] = useState(null);
  const [redeemed, setRedeemed] = useState(false);

  const handleCheckBalance = (e) => {
    e.preventDefault();
    if (!cardNumber || !pin) return;

    setBalance(5000);
    setRedeemed(false);
  };

  const handleRedeem = () => {
    setRedeemed(true);
    setBalance(null);
  };

  return (
    <MainLayout>
      <ContentBox>
        <GiftCardGraphic>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '1.25rem', fontFamily: 'var(--font-family-primary)', letterSpacing: 1 }}>MARYBE</span>
            <FiGift size={24} />
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-blanco-pero-no-tan-blanco)', opacity: 0.8 }}>GIFT CARD</div>
        </GiftCardGraphic>

        <h3>¿Cómo funciona la Gift Card Marybe?</h3>
        <p>
          La Gift Card es un medio de pago precargado que podés utilizar para adquirir cualquier producto disponible en nuestra tienda online y sucursales físicas.
        </p>
        <p>
          <strong>Términos de uso:</strong> Es acumulable con otras promociones bancarias, tiene una vigencia de 12 meses a partir de la fecha de emisión y se puede consumir de forma total o parcial.
        </p>
      </ContentBox>

      <CardForm>
        {!redeemed ? (
          <Form onSubmit={handleCheckBalance}>
            <FormGroup>
              <Label>Código de la Gift Card (16 dígitos)</Label>
              <Input
                $isCode
                type="text"
                placeholder="0000 0000 0000 0000"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                maxLength={19}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>PIN de seguridad (4 dígitos)</Label>
              <Input
                $isCode
                type="password"
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                maxLength={4}
                required
              />
            </FormGroup>

            <ActionButton type="submit">Consultar Saldo</ActionButton>

            {balance !== null && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <BalanceShow>
                  <span>Saldo disponible:</span>
                  <span className="amount">${balance.toLocaleString()}</span>
                </BalanceShow>
                <ActionButton type="button" onClick={handleRedeem} style={{ backgroundColor: '#2e7d32' }}>
                  Canjear en mi cuenta
                </ActionButton>
              </div>
            )}
          </Form>
        ) : (
          <div style={{ textItems: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '20px 0' }}>
            <FiCheckCircle size={60} color="#2e7d32" />
            <h3 style={{ fontFamily: 'var(--font-family-primary)', fontSize: '1.5rem', color: 'var(--color-marron-principal)' }}>
              ¡Canje Exitoso!
            </h3>
            <p style={{ textAlign: 'center', fontSize: '0.95rem' }}>
              Se han acreditado <strong>$5.000</strong> a tu saldo monedero de Marybe. Podés utilizarlos de inmediato al finalizar tu próximo pedido en el checkout.
            </p>
            <SecButton onClick={() => { setRedeemed(false); setCardNumber(''); setPin(''); }} style={{ width: '100%' }}>
              Canjear otra tarjeta
            </SecButton>
          </div>
        )}
      </CardForm>
    </MainLayout>
  );
}
