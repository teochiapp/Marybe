import React, { useState, useEffect, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import {
  applyBeneficiosConfig,
  formatCuotas,
  logoImgStyle,
  resolveLogoUrl,
} from '../../../utils/beneficiosSection';
import { useSeccionPrincipalData } from '../../../context/SeccionPrincipalContext';
import { INICIO_CACHE_TTL_MS, fetchWithSWR, readCachedEntry } from '../../../utils/apiCache';
import { isRequestCanceled } from '../../../utils/requestDedup';

const STRAPI_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337';
const PROMOS_CACHE_KEY = 'inicio:promociones-bancarias';
const PROMOS_URL = `${STRAPI_URL}/api/promociones-bancarias?sort=orden:asc&populate=logo&filters[activo][$eq]=true`;

// ─── Styled Components ────────────────────────────────────────────────────────

const Section = styled.section`
  background-color: var(--color-fondo-tarjetas-promo);
  padding: 40px 24px;
  width: 100%;

  @media (max-width: 768px) {
    padding: 32px 16px;
  }

  @media (max-width: 480px) {
    padding: 28px 12px;
  }
`;

const Container = styled.div`
  max-width: 1320px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h2`
  font-family: var(--font-family-primary);
  font-style: italic;
  font-weight: 600;
  font-size: 40px;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: black;
  margin: 0 0 28px;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 24px;
    line-height: 1.2;
    margin-bottom: 22px;
  }
`;

/* ─── Grid de tarjetas ──────────────────────────────────────────────────── */

const CardsGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  width: 100%;
  margin-bottom: 28px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 720px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  @media (max-width: 360px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  justify-content: flex-start;
  min-width: 0;
  min-height: 132px;
  padding: 14px 12px;
  border: 1px solid rgba(40, 1, 1, 0.12);
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.48);

  @media (max-width: 992px) {
    min-height: 126px;
    padding: 12px 10px;
  }
`;

const CardImage = styled.img`
  width: auto;
  max-width: min(100%, 120px);
  height: 38px;
  object-fit: contain;
  margin-bottom: 10px;
`;

const CardImagePlaceholder = styled.div`
  width: min(100%, 120px);
  height: 38px;
  margin-bottom: 10px;
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
  font-size: 13px;
  color: black;
  margin: 0;
  line-height: 1.4;

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
    padding: 14px 0;
  }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildCuotasTexto(promo) {
  const { cuotas_descripcion, cuotas_cantidad, monto_minimo } = promo;
  const cuotasStr = formatCuotas(cuotas_cantidad);
  const condicion = cuotas_descripcion || 'sin interés';

  return (
    <>
      {cuotasStr ? (
        <>
          Hasta <strong>{cuotasStr}</strong> {condicion}
        </>
      ) : cuotas_descripcion ? (
        cuotas_descripcion
      ) : null}
      {monto_minimo && (
        <>
          <br />
          en compras desde <strong>{monto_minimo}</strong>
        </>
      )}
    </>
  );
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function TarjetasPromociones({ previewData = null }) {
  const isPreview = Boolean(previewData);
  const [rawPromociones, setRawPromociones] = useState(() => {
    if (isPreview) return [];
    const cached = readCachedEntry(PROMOS_CACHE_KEY, { ttlMs: INICIO_CACHE_TTL_MS });
    return Array.isArray(cached?.data?.data) ? cached.data.data : [];
  });
  const [promosLoading, setPromosLoading] = useState(
    () => !isPreview && !readCachedEntry(PROMOS_CACHE_KEY, { ttlMs: INICIO_CACHE_TTL_MS })
  );
  const [error, setError] = useState(false);

  const { attrs: seccionAttrs, loading: seccionLoading } = useSeccionPrincipalData(
    `${STRAPI_URL}/api/seccion-principal?fields[0]=diseno_secciones`,
    { skip: isPreview || rawPromociones.length === 0, passSignal: true }
  );
  const publishedConfig = seccionAttrs?.diseno_secciones?.beneficios?.general || null;
  const loading = !isPreview && (promosLoading || (rawPromociones.length > 0 && seccionLoading));

  useEffect(() => {
    if (isPreview) {
      setPromosLoading(false);
      setError(false);
      return undefined;
    }

    let active = true;
    const controller = new AbortController();

    fetchWithSWR(PROMOS_CACHE_KEY, PROMOS_URL, {
      ttlMs: INICIO_CACHE_TTL_MS,
      signal: controller.signal,
      passSignal: true,
      fallbackToStaleOnError: true,
      onData: (json) => {
        if (!active) return;
        setRawPromociones(json?.data || []);
        setError(false);
        setPromosLoading(false);
      },
    }).catch((err) => {
      if (!active || isRequestCanceled(err)) return;
      console.error('TarjetasPromociones:', err);
      setError(true);
      setPromosLoading(false);
    });

    return () => {
      active = false;
      controller.abort();
    };
  }, [isPreview]);

  const sectionState = useMemo(() => {
    if (isPreview) {
      return applyBeneficiosConfig(previewData.promociones || [], previewData);
    }
    return applyBeneficiosConfig(rawPromociones, publishedConfig);
  }, [isPreview, previewData, rawPromociones, publishedConfig]);

  const { promociones, titulo, info_titulo, info_descripcion, boton_texto, boton_enlace } =
    sectionState;

  return (
    <Section>
      <Container>
        <Title data-editor-part="contenido-general">{titulo}</Title>

        <CardsGrid data-editor-part="orden">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : error || promociones.length === 0 ? (
            null
          ) : (
            promociones.map((item) => {
              const { id, documentId, nombre, logo, cuotas_descripcion, cuotas_cantidad, monto_minimo } =
                item;
              const logoUrl = resolveLogoUrl(logo);
              const imgStyle = logoImgStyle(item);
              const partKey = documentId ? `beneficio-${documentId}` : 'orden';

              return (
                <Card key={documentId || id} data-editor-part={partKey}>
                  {logoUrl ? (
                    <CardImage
                      src={logoUrl}
                      alt={nombre}
                      width="140"
                      height="50"
                      style={imgStyle}
                    />
                  ) : (
                    <CardImagePlaceholder>{nombre}</CardImagePlaceholder>
                  )}
                  <CardText>
                    {buildCuotasTexto({ cuotas_descripcion, cuotas_cantidad, monto_minimo })}
                  </CardText>
                </Card>
              );
            })
          )}
        </CardsGrid>

        <InfoBox data-editor-part="contenido-general">
          <InfoTextWrapper>
            <InfoTitle>{info_titulo}</InfoTitle>
            <InfoDesc>{info_descripcion}</InfoDesc>
          </InfoTextWrapper>
          <InfoButton href={boton_enlace || '#'}>{boton_texto}</InfoButton>
        </InfoBox>
      </Container>
    </Section>
  );
}
