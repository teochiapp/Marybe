import React from 'react';
import styled from 'styled-components';
import { Link, useLocation, Navigate } from 'react-router-dom';

const PageContainer = styled.div`
  min-height: 80vh;
  background-color: var(--color-blanco);
  padding: 40px 60px;
  font-family: var(--font-family-secondary, sans-serif);

  @media (max-width: 1024px) {
    padding: 30px 20px;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const Breadcrumb = styled.div`
  font-size: 0.9rem;
  color: #777;
  margin-bottom: 40px;

  a {
    color: #777;
    text-decoration: none;
    &:hover { color: #333; }
  }
  span {
    margin: 0 8px;
  }
  .active {
    color: #333;
    font-weight: 600;
  }
`;

const ProgressContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 800px;
  margin: 0 auto 60px;
  position: relative;
`;

const ProgressStep = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  z-index: 1;

  .circle {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: ${({ $active, $completed }) => ($active || $completed ? '#5C0A0A' : '#d3d3d3')};
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 600;
    font-size: 0.9rem;
  }

  .label {
    font-size: 0.9rem;
    font-weight: ${({ $active }) => ($active ? '700' : '500')};
    color: ${({ $active, $completed }) => ($active || $completed ? '#5C0A0A' : '#a0a0a0')};
  }
`;

const ProgressLine = styled.div`
  position: absolute;
  top: 16px;
  left: 40px;
  right: 40px;
  height: 1px;
  background-color: #d3d3d3;
  z-index: 0;
`;

const ConfirmationContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  font-family: var(--font-family-secondary, sans-serif);
`;

const ErrorBanner = styled.div`
  background-color: #fffafb;
  border: 1px solid #d32f2f;
  border-radius: 12px;
  padding: 40px 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px;

  svg {
    width: 50px;
    height: 50px;
    color: #b91c1c;
  }
  
  .text {
    h2 {
      font-size: 1.8rem;
      color: #b91c1c;
      font-family: var(--font-family-secondary, sans-serif);
      margin: 0 0 10px 0;
      font-weight: 700;
    }
    p {
      margin: 0;
      color: #333;
      font-size: 1.05rem;
      line-height: 1.4;
      max-width: 500px;
    }
  }
`;

const DetailCard = styled.div`
  background-color: #f9f9f9;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 40px;

  .row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    font-size: 0.95rem;

    .label {
      color: #555;
    }
    .value {
      font-weight: 500;
      color: #333;
      text-align: right;
    }
  }

  .total-row {
    display: flex;
    justify-content: space-between;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #ddd;
    font-size: 1.3rem;
    font-weight: 700;
    color: #333;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
`;

const RetryBtn = styled(Link)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 350px;
  background-color: #2b0b0a;
  color: white;
  padding: 16px 0;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: #4a1311;
  }
`;

const SecondaryLink = styled(Link)`
  color: #333;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const HelpText = styled.div`
  text-align: center;
  font-size: 0.95rem;
  color: #555;
  
  a {
    color: #b91c1c;
    font-weight: 600;
    text-decoration: underline;
    
    &:hover {
      color: #8b1515;
    }
  }
`;

const formatPrice = (price) => {
  if (!price) return '$0.00';
  return '$ ' + Number(price).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function OrderError() {
  const location = useLocation();

  // Al regresar de Mercado Pago por URL, location.state estará vacío, pero tenemos sessionStorage
  const mpPending = JSON.parse(sessionStorage.getItem('mp_pending_order') || 'null');
  const orderData = location.state || mpPending;

  if (!orderData) {
    return <Navigate to="/carrito" replace />;
  }

  const { paymentMethod, cartTotal, savedAddress } = orderData;

  return (
    <PageContainer>
      <ContentWrapper>
        <Breadcrumb>
          <Link to="/">Inicio</Link> <span>/</span> <Link to="/carrito">Carrito</Link> <span>/</span> <Link to="/login">Identificación</Link> <span>/</span> <Link to="/envio">Envío</Link> <span>/</span> <span className="active">Pago</span>
        </Breadcrumb>

        <ProgressContainer>
          <ProgressLine />
          <ProgressStep $active={false} $completed={true}>
            <div className="circle">1</div>
            <div className="label">Carrito</div>
          </ProgressStep>
          <ProgressStep $active={false} $completed={true}>
            <div className="circle">2</div>
            <div className="label">Identificación</div>
          </ProgressStep>
          <ProgressStep $active={false} $completed={true}>
            <div className="circle">3</div>
            <div className="label">Envío</div>
          </ProgressStep>
          <ProgressStep $active={true} $completed={true}>
            <div className="circle">4</div>
            <div className="label">Pago</div>
          </ProgressStep>
        </ProgressContainer>

        <ConfirmationContainer>
          <ErrorBanner>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            <div className="text">
              <h2>No pudimos procesar tu pago</h2>
              <p>Puede deberse a fondos insuficientes, datos incorrectos o un problema momentáneo. No se realizó ningún cargo.</p>
            </div>
          </ErrorBanner>

          <DetailCard>
            <div className="row">
              <span className="label">Pago</span>
              <span className="value">{paymentMethod === 'transferencia' ? 'Transferencia' : paymentMethod === 'efectivo' ? 'Efectivo' : paymentMethod === 'mercadopago' ? 'Mercado Pago' : 'Débito/Crédito'}</span>
            </div>
            <div className="row">
              <span className="label">Envío</span>
              <span className="value">Correo Argentino - 3 a 5 días hábiles</span>
            </div>
            <div className="row">
              <span className="label">Dirección</span>
              <span className="value">
                {savedAddress ? `${savedAddress.calle} ${savedAddress.numero}, ${savedAddress.ciudad}` : 'Av. Dirección 1234, Ciudad, Provincia, CP 0000'}
              </span>
            </div>

            <div className="total-row">
              <span>Total</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
          </DetailCard>

          <ActionButtons>
            <RetryBtn to="/pago">Reintentar con otro método de pago</RetryBtn>
            <SecondaryLink to="/carrito">Volver al carrito</SecondaryLink>
          </ActionButtons>
          
          <HelpText>
            ¿El problema persiste? <a href="https://wa.me/5493510000000" target="_blank" rel="noopener noreferrer">Contactanos por WhatsApp</a>
          </HelpText>

        </ConfirmationContainer>
      </ContentWrapper>
    </PageContainer>
  );
}
