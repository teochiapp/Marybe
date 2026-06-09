import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const STRAPI_URL = process.env.REACT_APP_API_URL || 'http://localhost:1337';

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
  font-style: italic;
  font-weight: 600;
  font-size: 48px;
  line-height: 56px;
  letter-spacing: -0.02em;
  color: black;
  margin: 0 0 48px 0;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 24px;
    line-height: 1.2;
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

const CardImagePlaceholder = styled.div`
  width: 140px;
  height: 50px;
  margin-bottom: 16px;
  background: rgba(40, 1, 1, 0.08);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-family-secondary);
  font-size: 11px;
  color: rgba(40, 1, 1, 0.4);
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
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

/* ─── Skeleton loader ────────────────────────────────────────────────────── */

const shimmer = keyframes`
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
`;

const SkeletonBase = styled.div`
  background: linear-gradient(90deg, #f0e8e8 25%, #e8dcdc 50%, #f0e8e8 75%);
  background-size: 800px 100%;
  animation: ${shimmer} 1.4s infinite linear;
  border-radius: 8px;
`;

const SkeletonImg = styled(SkeletonBase)`
  width: 120px;
  height: 44px;
  margin-bottom: 16px;
`;

const SkeletonLine = styled(SkeletonBase)`
  height: 14px;
  width: ${({ $w }) => $w || '100%'};
  margin-bottom: 8px;
  border-radius: 4px;
`;

const SkeletonCard = () => (
  <Card>
    <SkeletonImg />
    <SkeletonLine $w="80%" />
    <SkeletonLine $w="60%" />
  </Card>
);

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Formatea el array de cuotas como texto legible.
 * Ej: [3, 6] → "3 y 6"  |  [6] → "6"  |  6 → "6"
 */
function formatCuotas(cuotas_cantidad) {
  if (!cuotas_cantidad) return null;
  const arr = Array.isArray(cuotas_cantidad) ? cuotas_cantidad : [cuotas_cantidad];
  if (arr.length === 0) return null;
  if (arr.length === 1) return String(arr[0]);
  const last = arr[arr.length - 1];
  const rest = arr.slice(0, -1);
  return `${rest.join(', ')} y ${last}`;
}

/**
 * Construye el JSX de texto de cuotas a partir de los campos estructurados:
 * cuotas_descripcion, cuotas_cantidad (number | number[]), monto_maximo
 */
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

// ─── Componente ───────────────────────────────────────────────────────────────

export default function TarjetasPromociones() {
  const [promociones, setPromociones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

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
          console.error('TarjetasPromociones:', err);
          setError(true);
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  // Determinar columnas del grid según cantidad de ítems
  const count = promociones.length;
  const cols = count > 0 ? Math.min(count, 4) : 4;

  return (
    <Section>
      <Container>
        <Title>Beneficios para vos</Title>

        <CardsGrid style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {loading ? (
            // Skeleton mientras carga
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : error || promociones.length === 0 ? (
            // Silencioso si no hay datos — no rompe el layout
            null
          ) : (
            promociones.map((item) => {
              const { id, nombre, logo, cuotas_descripcion, cuotas_cantidad, monto_maximo } = item;
              const logoUrl = logo?.url
                ? logo.url.startsWith('http')
                  ? logo.url
                  : `${STRAPI_URL}${logo.url}`
                : null;

              return (
                <Card key={id}>
                  {logoUrl ? (
                    <CardImage src={logoUrl} alt={nombre} />
                  ) : (
                    <CardImagePlaceholder>{nombre}</CardImagePlaceholder>
                  )}
                  <CardText>
                    {buildCuotasTexto({ cuotas_descripcion, cuotas_cantidad, monto_maximo })}
                  </CardText>
                </Card>
              );
            })
          )}
        </CardsGrid>

        <InfoBox>
          <InfoTextWrapper>
            <InfoTitle>¿Necesitás más información?</InfoTitle>
            <InfoDesc>
              Consultá todas las promociones vigentes y encontrá la que más te conviene.
            </InfoDesc>
          </InfoTextWrapper>
          <InfoButton href="#">Ver todas las promociones</InfoButton>
        </InfoBox>
      </Container>
    </Section>
  );
}
