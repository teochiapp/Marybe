import React from 'react';
import styled from 'styled-components';
import { FiCreditCard, FiInfo } from 'react-icons/fi';

const PromoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xxl);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const BankCard = styled.div`
  background-color: var(--color-blanco);
  border: 1px solid rgba(62, 1, 2, 0.08);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 250px;
  position: relative;
  overflow: hidden;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  padding-bottom: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
`;

const BankLogoMock = styled.div`
  background: ${({ $color }) => $color || 'var(--color-marron-principal)'};
  color: var(--color-blanco);
  padding: 6px 14px;
  border-radius: var(--radius-sm);
  font-weight: 700;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
`;

const PromoTag = styled.span`
  background-color: rgba(46, 125, 50, 0.1);
  color: #2e7d32;
  font-size: 0.8rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  text-transform: uppercase;
`;

const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: var(--spacing-md);
`;

const DiscountVal = styled.div`
  font-size: 2.2rem;
  font-weight: 900;
  color: var(--color-bordo-secundario);
  font-family: var(--font-family-primary);
  line-height: 1;
`;

const Installments = styled.div`
  font-weight: 700;
  color: var(--color-marron-secundario);
  font-size: 1.05rem;
`;

const BankDesc = styled.p`
  font-size: 0.9rem;
  color: #555555;
  margin: 0;
  line-height: 1.4;
`;

const InfoBox = styled.div`
  background-color: var(--color-fondo-tarjetas-promo);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  display: flex;
  gap: 12px;
  align-items: flex-start;
  color: var(--color-marron-secundario);
  font-size: 0.9rem;
  line-height: 1.5;

  svg {
    color: var(--color-bordo-secundario);
    flex-shrink: 0;
    margin-top: 3px;
  }
`;

const PROMOS = [
  {
    bank: 'Santander',
    logoBg: '#EC0000',
    discount: '30% Ahorro',
    installments: 'Hasta 3 Cuotas sin Interés',
    days: 'Válido todos los miércoles de Junio.',
    cap: 'Tope de reintegro de $8.000 por mes de cuenta.'
  },
  {
    bank: 'Galicia',
    logoBg: '#FF6F00',
    discount: '25% Ahorro',
    installments: 'Hasta 3 Cuotas sin Interés',
    days: 'Válido todos los jueves de Junio.',
    cap: 'Tope de reintegro de $6.500 por transacción.'
  },
  {
    bank: 'BBVA',
    logoBg: '#004481',
    discount: '20% Ahorro',
    installments: 'Hasta 6 Cuotas sin Interés',
    days: 'Válido los días lunes y martes.',
    cap: 'Sin tope de reintegro para compras mayores a $50.000.'
  },
  {
    bank: 'Banco Nación',
    logoBg: '#00838F',
    discount: '15% Ahorro',
    installments: 'Hasta 12 Cuotas sin Interés',
    days: 'Válido todos los viernes pagando con MODO.',
    cap: 'Tope de reintegro de $5.000 por compra.'
  }
];

export default function PromocionesBancariasContent() {
  return (
    <>
      <PromoGrid>
        {PROMOS.map((promo, idx) => (
          <BankCard key={idx}>
            <CardHeader>
              <BankLogoMock $color={promo.logoBg}>{promo.bank}</BankLogoMock>
              <PromoTag>Vigente</PromoTag>
            </CardHeader>
            <CardBody>
              <DiscountVal>{promo.discount}</DiscountVal>
              <Installments>{promo.installments}</Installments>
              <BankDesc>{promo.days}</BankDesc>
              <div style={{ fontSize: '0.8rem', color: '#777', marginTop: 4 }}>
                <strong>Condición:</strong> {promo.cap}
              </div>
            </CardBody>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--color-bordo-secundario)', fontWeight: 600 }}>
              <FiCreditCard /> Ver tarjetas adheridas
            </div>
          </BankCard>
        ))}
      </PromoGrid>

      <InfoBox>
        <FiInfo size={20} />
        <div>
          <strong>Información sobre reintegros:</strong> Los descuentos se aplican de forma directa en el resumen de cuenta o tarjeta correspondiente según la política de cada entidad bancaria dentro de los 30 días posteriores al cierre del ciclo. Para compras realizadas a través de billeteras virtuales de terceros (ej. Mercado Pago), verificar las condiciones específicas de cada banco.
        </div>
      </InfoBox>
    </>
  );
}
