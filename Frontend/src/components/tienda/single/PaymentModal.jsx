import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const STRAPI_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 20px;
`;

const ModalContent = styled.div`
  background-color: #fff;
  border-radius: 12px;
  width: 100%;
  max-width: 700px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 30px;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  color: #555;
  transition: color 0.2s;

  &:hover {
    color: #000;
  }
`;

const Title = styled.h3`
  font-family: var(--font-family-secondary);
  font-size: 1.5rem;
  margin-top: 0;
  margin-bottom: 20px;
  color: #000;
  text-align: center;
`;

const PromoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const PromoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
`;

const PromoLogo = styled.img`
  width: 60px;
  height: auto;
  object-fit: contain;
`;

const PromoLogoPlaceholder = styled.div`
  width: 60px;
  height: 40px;
  background: rgba(40, 1, 1, 0.08);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: rgba(40, 1, 1, 0.4);
  font-weight: 600;
  text-transform: uppercase;
  text-align: center;
`;

const PromoText = styled.div`
  font-family: var(--font-family-secondary);
  font-size: 0.9rem;
  color: #333;
  line-height: 1.4;

  strong {
    font-weight: 700;
  }
`;

const InfoBox = styled.div`
  background-color: var(--color-fondo-info-promo, #FDF7F2);
  border-radius: 12px;
  padding: 24px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  width: 100%;
  margin-top: 24px;

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
  background-color: var(--color-boton-promo, #280101);
  color: var(--color-blanco, #fff);
  font-family: var(--font-family-secondary);
  font-size: 16px;
  font-weight: 500;
  padding: 14px 28px;
  border-radius: 10px;
  text-decoration: none;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
    opacity: 0.92;
  }

  @media (max-width: 768px) {
    align-self: stretch;
    text-align: center;
    padding: 14px 0;
  }
`;

function formatCuotas(cuotas_cantidad) {
  if (!cuotas_cantidad) return null;
  const arr = Array.isArray(cuotas_cantidad) ? cuotas_cantidad : [cuotas_cantidad];
  if (arr.length === 0) return null;
  if (arr.length === 1) return String(arr[0]);
  const last = arr[arr.length - 1];
  const rest = arr.slice(0, -1);
  return `${rest.join(', ')} y ${last}`;
}

function buildCuotasTexto(promo) {
  const { cuotas_descripcion, cuotas_cantidad, monto_maximo } = promo;
  const cuotasStr = formatCuotas(cuotas_cantidad);

  return (
    <>
      {cuotasStr ? (
        <>
          Hasta <strong>{cuotasStr} cuotas</strong> sin interés
        </>
      ) : cuotas_descripcion ? (
        cuotas_descripcion
      ) : null}
      {monto_maximo && (
        <>
          <br />
          en compras hasta <strong>{monto_maximo}</strong>
        </>
      )}
    </>
  );
}

export default function PaymentModal({ isOpen, onClose }) {
  const [promociones, setPromociones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const controller = new AbortController();
    setLoading(true);

    fetch(
      `${STRAPI_URL}/api/promociones-bancarias?sort=orden:asc&populate=logo&filters[activo][$eq]=true`,
      { signal: controller.signal }
    )
      .then((res) => {
        if (!res.ok) throw new Error('Error al cargar promociones');
        return res.json();
      })
      .then((json) => {
        setPromociones(json.data || []);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('PaymentModal:', err);
          setError(true);
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        <Title>Medios de pago y Promociones</Title>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>Cargando promociones...</div>
        ) : error || promociones.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            No hay promociones disponibles en este momento.
          </div>
        ) : (
          <PromoList>
            {promociones.map((item) => {
              const { id, nombre, logo, cuotas_descripcion, cuotas_cantidad, monto_maximo } = item;
              const logoUrl = logo?.url
                ? logo.url.startsWith('http')
                  ? logo.url
                  : `${STRAPI_URL}${logo.url}`
                : null;

              return (
                <PromoItem key={id}>
                  {logoUrl ? (
                    <PromoLogo src={logoUrl} alt={nombre} />
                  ) : (
                    <PromoLogoPlaceholder>{nombre}</PromoLogoPlaceholder>
                  )}
                  <PromoText>
                    {buildCuotasTexto({ cuotas_descripcion, cuotas_cantidad, monto_maximo })}
                  </PromoText>
                </PromoItem>
              );
            })}
            </PromoList>
          )}

          <InfoBox>
            <InfoTextWrapper>
              <InfoTitle>¿Necesitás más información?</InfoTitle>
              <InfoDesc>
                Consultá todas las promociones vigentes y encontrá la que más te conviene.
              </InfoDesc>
            </InfoTextWrapper>
            <InfoButton href="#">Ver todas las promociones</InfoButton>
          </InfoBox>

        </ModalContent>
      </ModalOverlay>
  );
}
