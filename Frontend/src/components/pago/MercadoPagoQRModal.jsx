import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99999;
  font-family: var(--font-family-secondary, sans-serif);
`;

const ModalContainer = styled.div`
  background-color: white;
  width: 100%;
  max-width: 480px;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: modalScaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);

  @keyframes modalScaleUp {
    0% { transform: scale(0.9); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: #f0f0f0;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 1.2rem;
  font-weight: bold;
  color: #555;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s;

  &:hover {
    background: #e4e4e4;
    color: #000;
  }
`;

const HeaderTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-marron-cuarto);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Subtitle = styled.p`
  font-size: 0.95rem;
  color: #666;
  margin-bottom: 25px;
  line-height: 1.5;
`;

const QRCodeBox = styled.div`
  background: white;
  padding: 20px;
  border-radius: 20px;
  border: 2px solid var(--color-hogar);
  box-shadow: 0 10px 25px rgba(177, 0, 2, 0.15);
  margin-bottom: 25px;
  width: 220px;
  height: 220px;
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const InfoCard = styled.div`
  background-color: var(--color-blanco-pero-no-tan-blanco, #FAF0F0);
  border-left: 4px solid var(--color-hogar);
  padding: 16px 20px;
  border-radius: 0 12px 12px 0;
  margin-bottom: 25px;
  width: 100%;
  text-align: left;
  font-size: 0.9rem;
  color: #333;
  line-height: 1.5;

  strong {
    color: var(--color-hogar);
  }
`;

const DirectButton = styled.a`
  width: 100%;
  background-color: var(--color-marron-cuarto);
  color: white;
  padding: 16px;
  border-radius: 12px;
  font-size: 1.05rem;
  font-weight: 600;
  text-decoration: none;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  box-shadow: 0 8px 20px rgba(40, 1, 1, 0.2);
  transition: all 0.2s;
  margin-bottom: 25px;

  &:hover {
    background-color: var(--color-hogar);
    transform: translateY(-2px);
  }
`;

const pulseAnimation = keyframes`
  0% { opacity: 0.6; transform: scale(0.98); }
  50% { opacity: 1; transform: scale(1.02); }
  100% { opacity: 0.6; transform: scale(0.98); }
`;

const spinAnimation = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const PollingStatusBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  padding: 16px;
  border-radius: 14px;
  width: 100%;
  color: #495057;
  font-size: 0.95rem;
  font-weight: 500;
  animation: ${pulseAnimation} 2.5s infinite ease-in-out;

  .spinner {
    width: 22px;
    height: 22px;
    border: 3px solid #dee2e6;
    border-top: 3px solid var(--color-hogar);
    border-radius: 50%;
    animation: ${spinAnimation} 1s linear infinite;
  }
`;

const SuccessOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: white;
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
  animation: fadeIn 0.4s ease;

  @keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }

  .circle {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-color: #2ecc71;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 2.5rem;
    margin-bottom: 20px;
    box-shadow: 0 10px 25px rgba(46, 204, 113, 0.3);
  }

  h3 {
    font-size: 1.6rem;
    color: #27ae60;
    margin-bottom: 10px;
    font-weight: 700;
  }

  p {
    color: #555;
    font-size: 1rem;
  }
`;

export default function MercadoPagoQRModal({ isOpen, onClose, onConfirmOrder, initPoint, total, externalReference }) {
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    if (!isOpen || !externalReference) {
      setIsPaid(false);
      return;
    }

    const interval = setInterval(async () => {
      try {
        const apiUrl = process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337';
        const res = await fetch(`${apiUrl}/api/mercado-pago/consultar-pago?external_reference=${externalReference}`);
        const data = await res.json();

        if (data && data.pagado) {
          setIsPaid(true);
          clearInterval(interval);
          // Esperamos 2 segundos mostrando la hermosa pantalla de éxito antes de redirigir
          setTimeout(() => {
            onConfirmOrder();
          }, 2000);
        }
      } catch (err) {
        console.error('Error al consultar estado del pago:', err);
      }
    }, 4000); // Consultar cada 4 segundos

    return () => clearInterval(interval);
  }, [isOpen, externalReference, onConfirmOrder]);

  if (!isOpen) return null;

  const qrImageUrl = initPoint
    ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(initPoint)}`
    : '';

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        {isPaid && (
          <SuccessOverlay>
            <div className="circle">✓</div>
            <h3>¡Pago Confirmado!</h3>
            <p>Redirigiendo a tu pedido...</p>
          </SuccessOverlay>
        )}

        <CloseButton onClick={onClose}>✕</CloseButton>

        <HeaderTitle>
          <span style={{ color: 'var(--color-hogar)' }}>Pagar con</span> QR
        </HeaderTitle>

        <Subtitle>
          Escaneá el código con la app de <strong style={{ color: 'var(--color-marron-cuarto)' }}>Mercado Pago, Modo, Ualá o Naranja X </strong>desde tu celular para pagar.
        </Subtitle>

        <QRCodeBox>
          {qrImageUrl ? (
            <img src={qrImageUrl} alt="Código QR Mercado Pago" />
          ) : (
            <div style={{ color: '#999', fontSize: '0.9rem' }}>Generando QR...</div>
          )}
        </QRCodeBox>

        <InfoCard>
          Total a pagar: <strong>$ {Number(total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</strong>
          <br />
          El sistema detectará tu pago automáticamente al instante.
        </InfoCard>

        <DirectButton href={initPoint} target="_blank" rel="noopener noreferrer">
          Abrir Mercado Pago en este equipo
        </DirectButton>

        <PollingStatusBox>
          <div className="spinner" />
          <span>Esperando confirmación del pago en tu app...</span>
        </PollingStatusBox>

        {/* Botón de simulación exclusivo para desarrollo/sandbox */}
        <button
          onClick={() => {
            setIsPaid(true);
            setTimeout(() => onConfirmOrder(), 2000);
          }}
          style={{
            marginTop: '20px',
            padding: '8px 16px',
            backgroundColor: '#f1f3f5',
            border: '1px dashed #adb5bd',
            borderRadius: '8px',
            color: '#495057',
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Simular Pago Aprobado (Modo Desarrollo)
        </button>
      </ModalContainer>
    </ModalOverlay>
  );
}
