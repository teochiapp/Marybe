import React, { useState } from 'react';
import styled from 'styled-components';
import { FiSearch, FiCheck, FiTruck, FiPackage, FiShoppingBag, FiCheckCircle } from 'react-icons/fi';

const TrackingCard = styled.div`
  background-color: var(--color-blanco);
  border: 1px solid rgba(62, 1, 2, 0.08);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  max-width: 650px;
  margin: 0 auto var(--spacing-xl);
`;

const Form = styled.form`
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);

  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
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

  &:focus {
    border-color: var(--color-bordo-secundario);
  }
`;

const SubmitBtn = styled.button`
  background-color: var(--color-marron-principal);
  color: var(--color-blanco);
  font-weight: 600;
  padding: 12px 24px;
  border-radius: var(--radius-md);
  transition: var(--transition-fast);
  align-self: flex-end;

  @media (max-width: 600px) {
    align-self: stretch;
  }

  &:hover {
    background-color: var(--color-bordo-secundario);
  }
`;

const StepperWrapper = styled.div`
  background-color: var(--color-blanco);
  border: 1px solid rgba(62, 1, 2, 0.08);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  max-width: 650px;
  margin: 0 auto;
`;

const OrderSummary = styled.div`
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  padding-bottom: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
  font-size: 0.95rem;
  color: var(--color-marron-secundario);
`;

const Stepper = styled.div`
  display: flex;
  justify-content: space-between;
  position: relative;
  margin-bottom: var(--spacing-xl);

  &::before {
    content: '';
    position: absolute;
    top: 20px;
    left: 20px;
    right: 20px;
    height: 3px;
    background-color: rgba(124, 4, 5, 0.1);
    z-index: 0;
  }
`;

const ProgressLine = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  width: ${({ $progress }) => $progress}%;
  height: 3px;
  background-color: #2e7d32;
  z-index: 0;
  transition: width 0.5s ease-in-out;
`;

const Step = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  z-index: 1;
  width: 80px;
`;

const StepCircle = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${({ $completed, $active }) =>
    $completed ? '#2e7d32' : $active ? 'var(--color-bordo-secundario)' : '#e0e0e0'};
  color: var(--color-blanco);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid var(--color-blanco);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;

  svg {
    width: 18px;
    height: 18px;
  }
`;

const StepLabel = styled.span`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ $active, $completed }) =>
    $active || $completed ? 'var(--color-marron-tercero)' : '#888'};
  text-align: center;
`;

const HistoryBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  background-color: var(--color-fondo-tarjetas-promo);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
`;

const HistoryItem = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.88rem;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0,0,0,0.05);

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

export default function SeguimientoEnvioContent() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [trackingData, setTrackingData] = useState(null);

  const handleTrack = (e) => {
    e.preventDefault();
    if (!orderNumber || !email) return;

    setTrackingData({
      number: orderNumber,
      carrier: 'Andreani',
      service: 'Envío Estándar a Domicilio',
      estimatedDate: '10/06/2026',
      progress: 66,
      steps: [
        { label: 'Aprobado', icon: <FiShoppingBag />, completed: true, active: false, date: '05/06 10:24 hs' },
        { label: 'Preparado', icon: <FiPackage />, completed: true, active: false, date: '05/06 16:45 hs' },
        { label: 'En camino', icon: <FiTruck />, completed: false, active: true, date: '06/06 09:15 hs' },
        { label: 'Entregado', icon: <FiCheckCircle />, completed: false, active: false, date: 'Pendiente' }
      ]
    });
  };

  return (
    <>
      <TrackingCard>
        <div style={{ fontSize: '1rem', fontWeight: 600 }}>Completá los datos del pedido</div>
        <Form onSubmit={handleTrack}>
          <FormGroup>
            <Label>Número de pedido</Label>
            <Input
              type="text"
              placeholder="Ej: #12345"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Email de compra</Label>
            <Input
              type="email"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </FormGroup>

          <SubmitBtn type="submit">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FiSearch /> Buscar
            </div>
          </SubmitBtn>
        </Form>
      </TrackingCard>

      {trackingData && (
        <StepperWrapper>
          <OrderSummary>
            <div>
              <strong>Pedido:</strong> {trackingData.number} <br />
              <strong>Correo:</strong> {trackingData.carrier}
            </div>
            <div style={{ textAlign: 'right' }}>
              <strong>Servicio:</strong> {trackingData.service} <br />
              <strong>Entrega estimada:</strong> {trackingData.estimatedDate}
            </div>
          </OrderSummary>

          <Stepper>
            <ProgressLine $progress={trackingData.progress} />
            {trackingData.steps.map((step, idx) => (
              <Step key={idx}>
                <StepCircle $completed={step.completed} $active={step.active}>
                  {step.completed ? <FiCheck /> : step.icon}
                </StepCircle>
                <StepLabel $active={step.active} $completed={step.completed}>
                  {step.label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          <HistoryBox>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 6 }}>Historial de movimientos</div>
            {trackingData.steps
              .filter(s => s.date !== 'Pendiente')
              .map((step, idx) => (
                <HistoryItem key={idx}>
                  <span>Pedido {step.label.toLowerCase()} con éxito</span>
                  <span style={{ fontWeight: 600 }}>{step.date}</span>
                </HistoryItem>
              ))}
          </HistoryBox>
        </StepperWrapper>
      )}
    </>
  );
}
