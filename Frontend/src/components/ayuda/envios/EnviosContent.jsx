import React, { useState } from 'react';
import styled from 'styled-components';
import { FiMapPin, FiTruck, FiClock, FiShoppingBag, FiCheckCircle } from 'react-icons/fi';

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xxl);

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const InfoCard = styled.div`
  background-color: var(--color-blanco);
  border: 1px solid rgba(62, 1, 2, 0.08);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: var(--shadow-sm);
`;

const IconWrap = styled.div`
  background-color: rgba(124, 4, 5, 0.1);
  color: var(--color-bordo-secundario);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 24px;
    height: 24px;
  }
`;

const CardTitle = styled.h3`
  font-family: var(--font-family-secondary);
  font-weight: 700;
  font-size: 1.2rem;
  color: var(--color-marron-principal);
  margin: 0;
`;

const CardText = styled.p`
  font-size: 0.95rem;
  color: #4a4a4a;
  line-height: 1.5;
  margin: 0;
`;

const CardHighlight = styled.div`
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-bordo-secundario);
  margin-top: auto;
  border-top: 1px solid rgba(0,0,0,0.05);
  padding-top: var(--spacing-sm);
`;

const CalculatorSection = styled.div`
  background-color: var(--color-blanco);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  border: 1px solid rgba(62, 1, 2, 0.08);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--spacing-xxl);
`;

const SectionTitle = styled.h2`
  font-family: var(--font-family-primary);
  font-size: 1.8rem;
  color: var(--color-marron-principal);
  margin-bottom: var(--spacing-sm);
`;

const CalcForm = styled.form`
  display: flex;
  gap: var(--spacing-md);
  margin: var(--spacing-md) 0;
  max-width: 500px;

  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const Input = styled.input`
  flex: 1;
  background-color: var(--color-fondo-beneficio-tarjeta);
  border: 1px solid rgba(62, 1, 2, 0.15);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  font-size: 1rem;
  color: var(--color-marron-tercero);
  outline: none;

  &:focus {
    border-color: var(--color-bordo-secundario);
  }
`;

const Button = styled.button`
  background-color: var(--color-marron-principal);
  color: var(--color-blanco);
  font-weight: 600;
  padding: 12px 28px;
  border-radius: var(--radius-md);
  transition: var(--transition-fast);

  &:hover {
    background-color: var(--color-bordo-secundario);
  }
`;

const CalcResult = styled.div`
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md);
  background-color: var(--color-fondo-tarjetas-promo);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ResultItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid rgba(0,0,0,0.05);

  &:last-child {
    border-bottom: none;
  }
`;

const ResultName = styled.span`
  font-weight: 600;
  color: var(--color-marron-secundario);
`;

const ResultValue = styled.span`
  font-weight: 700;
  color: var(--color-bordo-secundario);
`;

const TimelineContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  position: relative;
  padding-left: 32px;
  margin-bottom: var(--spacing-md);

  &::before {
    content: '';
    position: absolute;
    top: 5px;
    left: 11px;
    bottom: 5px;
    width: 2px;
    background-color: rgba(124, 4, 5, 0.15);
  }
`;

const TimelineStep = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const TimelineBullet = styled.div`
  position: absolute;
  left: -32px;
  top: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: var(--color-blanco);
  border: 2px solid var(--color-bordo-secundario);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;

  svg {
    width: 12px;
    height: 12px;
    color: var(--color-bordo-secundario);
  }
`;

const StepTitle = styled.h4`
  font-family: var(--font-family-secondary);
  font-weight: 700;
  font-size: 1.05rem;
  color: var(--color-marron-principal);
  margin: 0;
`;

const StepDesc = styled.p`
  font-size: 0.9rem;
  color: #555555;
  margin: 0;
`;

export default function EnviosContent() {
  const [zipCode, setZipCode] = useState('');
  const [results, setResults] = useState(null);

  const handleCalculate = (e) => {
    e.preventDefault();
    if (!zipCode || zipCode.trim() === '') return;

    const parsedZip = parseInt(zipCode);
    let region = 'Nacional';
    let basePrice = 2800;

    if (parsedZip >= 4000 && parsedZip <= 4300) {
      region = 'Provincial (Tucumán / Santiago del Estero)';
      basePrice = 1200;
    } else if (parsedZip >= 1000 && parsedZip <= 1999) {
      region = 'Buenos Aires (GBA/CABA)';
      basePrice = 2200;
    }

    setResults({
      region,
      express: basePrice === 1200 ? 'Gratis' : `$${basePrice + 1200}`,
      standard: basePrice === 1200 ? 'Gratis (Compra > $20.000)' : `$${basePrice}`,
      pickup: 'Gratis en sucursal'
    });
  };

  return (
    <>
      <InfoGrid>
        <InfoCard>
          <IconWrap><FiShoppingBag /></IconWrap>
          <CardTitle>Retiro en Sucursal</CardTitle>
          <CardText>
            Comprá online y retirá sin cargo en cualquiera de nuestras sucursales habilitadas en Santiago del Estero o Tucumán.
          </CardText>
          <CardHighlight>¡Gratis en 2 horas!</CardHighlight>
        </InfoCard>

        <InfoCard>
          <IconWrap><FiTruck /></IconWrap>
          <CardTitle>Envío Estándar</CardTitle>
          <CardText>
            Entregas a domicilio a través de Andreani. Disponible para todo el territorio argentino con tarifas reducidas en compras superiores.
          </CardText>
          <CardHighlight>De 3 a 5 días hábiles</CardHighlight>
        </InfoCard>

        <InfoCard>
          <IconWrap><FiClock /></IconWrap>
          <CardTitle>Envío Express</CardTitle>
          <CardText>
            Servicio rápido puerta a puerta. Ideal para compras urgentes o regalos. Disponible en capitales de provincia seleccionadas.
          </CardText>
          <CardHighlight>De 24 a 48 horas</CardHighlight>
        </InfoCard>
      </InfoGrid>

      <CalculatorSection>
        <SectionTitle>Simulá tu costo de envío</SectionTitle>
        <CardText>Ingresá tu código postal para conocer las tarifas estimadas y tiempos de entrega.</CardText>
        <CalcForm onSubmit={handleCalculate}>
          <Input
            type="number"
            placeholder="Ej: 4000"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            required
          />
          <Button type="submit">Calcular Envío</Button>
        </CalcForm>

        {results && (
          <CalcResult>
            <ResultItem>
              <ResultName>Región detectada:</ResultName>
              <span style={{ fontWeight: 600 }}>{results.region}</span>
            </ResultItem>
            <ResultItem>
              <ResultName>Retiro en Sucursal (Marybe Sucursales):</ResultName>
              <ResultValue>{results.pickup}</ResultValue>
            </ResultItem>
            <ResultItem>
              <ResultName>Envío Estándar (Domicilio Andreani):</ResultName>
              <ResultValue>{results.standard}</ResultValue>
            </ResultItem>
            <ResultItem>
              <ResultName>Envío Express (Domicilio Rápido):</ResultName>
              <ResultValue>{results.express}</ResultValue>
            </ResultItem>
          </CalcResult>
        )}
      </CalculatorSection>

      <div style={{ marginBottom: 'var(--spacing-xl)' }}>
        <SectionTitle style={{ marginBottom: 'var(--spacing-md)' }}>¿Cómo es el trayecto de tu pedido?</SectionTitle>
        <TimelineContainer>
          <TimelineStep>
            <TimelineBullet><FiCheckCircle /></TimelineBullet>
            <StepTitle>1. Confirmación de compra</StepTitle>
            <StepDesc>Procesamos tu pago de forma segura y te enviamos la confirmación por correo electrónico junto a la factura.</StepDesc>
          </TimelineStep>
          <TimelineStep>
            <TimelineBullet><FiCheckCircle /></TimelineBullet>
            <StepTitle>2. Preparación y embalaje</StepTitle>
            <StepDesc>Seleccionamos cuidadosamente tus productos y los preparamos en cajas protegidas para asegurar que lleguen en perfectas condiciones.</StepDesc>
          </TimelineStep>
          <TimelineStep>
            <TimelineBullet><FiCheckCircle /></TimelineBullet>
            <StepTitle>3. Despacho y Tracking</StepTitle>
            <StepDesc>Entregamos tu pedido al correo correspondiente y te notificamos por email el código de seguimiento en tiempo real.</StepDesc>
          </TimelineStep>
          <TimelineStep>
            <TimelineBullet><FiMapPin /></TimelineBullet>
            <StepTitle>4. Entrega en domicilio o sucursal</StepTitle>
            <StepDesc>El operador logístico realiza la visita a tu domicilio o te avisa que ya está disponible para retirar en la sucursal elegida.</StepDesc>
          </TimelineStep>
        </TimelineContainer>
      </div>
    </>
  );
}
