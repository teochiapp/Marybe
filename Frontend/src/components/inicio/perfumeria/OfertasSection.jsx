import React, { useRef, useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { SECCION_ALINEACIONES, SECCION_COLORES, SECCION_ESPACIADOS, SECCION_FONDOS, SECCION_FUENTES, SECCION_PESOS, SECCION_TAMANOS, disenoSeccion } from '../../../utils/disenoSeccion';

const STRAPI_URL = process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337';
export const OFERTAS_TITULO = 'Disfrutá de las mejores ofertas';

const SectionWrapper = styled.section`
  padding: ${({ $espaciado }) => SECCION_ESPACIADOS[$espaciado][0]} 60px;
  padding-right: 0 !important;
  background-color: ${({ $fondo }) => SECCION_FONDOS[$fondo]};
  display: flex;
  flex-direction: column;
  gap: 30px;
  align-items: flex-start;

  @media (max-width: 1024px) {
    padding: ${({ $espaciado }) => SECCION_ESPACIADOS[$espaciado][1]} 40px;
  }

  @media (max-width: 768px) {
    padding-left: 30px;
    padding-right: 0;
    gap: 20px;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
`;

// Con el título centrado o a la derecha se compensa la sección, que no tiene margen derecho (las insignias llegan al borde).
const SectionTitle = styled.h2`
  font-family: ${({ $fuente }) => SECCION_FUENTES[$fuente]};
  font-size: ${({ $tamano }) => SECCION_TAMANOS[$tamano][0]};
  color: ${({ $color, $seccion }) => SECCION_COLORES[$color] || ($seccion === 'hogar' ? 'var(--color-hogar)' : 'var(--color-bordo-secundario)')};
  font-weight: ${({ $peso }) => SECCION_PESOS[$peso]};
  text-align: ${({ $alineacion }) => SECCION_ALINEACIONES[$alineacion]};
  padding-right: ${({ $alineacion }) => ($alineacion === 'izquierda' ? '0' : '60px')};
  visibility: ${({ $pending }) => ($pending ? 'hidden' : 'visible')};
  margin: 0;

  @media (max-width: 1024px) {
    padding-right: ${({ $alineacion }) => ($alineacion === 'izquierda' ? '0' : '40px')};
  }

  @media (max-width: 768px) {
    font-size: ${({ $tamano }) => SECCION_TAMANOS[$tamano][1]};
    padding-right: ${({ $alineacion }) => ($alineacion === 'izquierda' ? '0' : '30px')};
  }

  @media (max-width: 400px) {
    font-size: ${({ $tamano }) => SECCION_TAMANOS[$tamano][2]};
  }
`;

const BadgesContainer = styled.div`
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  justify-content: flex-start;
  gap: 25px;
  align-items: center;
  position: relative;
  z-index: 1;
  cursor: grab;
  width: 100%;
  padding-bottom: 15px;

  &:active {
    cursor: grabbing;
  }

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 768px) {
    gap: 15px;
    padding-bottom: 10px;
  }
`;

const BadgeButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: transform 0.2s ease, filter 0.2s ease;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  outline: none;
  flex-shrink: 0;
  scroll-snap-align: start;
  user-select: none;
  -webkit-user-drag: none;

  width: 165px;
  height: 165px;

  @media (max-width: 768px) {
    width: 65px;
    height: 65px;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    transition: filter 0.2s ease;
    filter: grayscale(10%);
    pointer-events: none;
  }

  &:hover {
    transform: scale(1.05);
    img {
      filter: grayscale(0%);
    }
  }
`;

export default function OfertasSection({ seccion, previewData }) {
  const navigate = useNavigate();
  const isPreview = Boolean(previewData);
  const [disenoApi, setDisenoApi] = useState(null);
  const [loading, setLoading] = useState(!isPreview);
  const area = seccion === 'hogar' ? 'hogar' : 'perfumeria';
  const diseno = disenoSeccion(isPreview ? previewData : disenoApi?.[area], OFERTAS_TITULO);

  // Título y tipografía configurados en el Editor de Inicio; sin configuración se usa el diseño original.
  useEffect(() => {
    if (isPreview) return undefined;
    let active = true;
    fetch(`${STRAPI_URL}/api/seccion-principal?fields[0]=diseno_secciones`)
      .then(res => res.json())
      .then(json => { if (active) setDisenoApi(json?.data?.diseno_secciones?.ofertas || null); })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [isPreview]);
  const discountValores = [60, 50, 40, 35, 30, 25, 20, 15, 10];
  const scrollRef = useRef(null);

  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftVal = useRef(0);
  const hasDragged = useRef(false);

  const handleMouseDown = useCallback((e) => {
    const el = scrollRef.current;
    if (!el) return;
    isDown.current = true;
    hasDragged.current = false;
    el.style.scrollSnapType = 'none';
    el.style.scrollBehavior = 'auto';
    startX.current = e.pageX - el.offsetLeft;
    scrollLeftVal.current = el.scrollLeft;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!isDown.current) return;
    isDown.current = false;
    const el = scrollRef.current;
    if (el) {
      el.style.scrollSnapType = 'x mandatory';
      el.style.scrollBehavior = '';
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    if (!isDown.current) return;
    isDown.current = false;
    const el = scrollRef.current;
    if (el) {
      el.style.scrollSnapType = 'x mandatory';
      el.style.scrollBehavior = '';
    }
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDown.current) return;
    e.preventDefault();
    const el = scrollRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    if (Math.abs(walk) > 5) {
      hasDragged.current = true;
    }
    el.scrollLeft = scrollLeftVal.current - walk;
  }, []);

  const handleSelectFilter = (val) => {
    if (hasDragged.current) return;
    
    let url = `/tienda?descuento=${val}`;
    if (seccion === 'hogar') {
      url += '&seccion=Hogar';
    } else if (seccion === 'perfumeria') {
      url += '&seccion=Perfumer%C3%ADa';
    } else if (seccion) {
      url += `&seccion=${seccion}`;
    }
    
    navigate(url);
  };

  return (
    <SectionWrapper data-editor-part="seccion" $fondo={diseno.fondo} $espaciado={diseno.espaciado}>
      <SectionHeader>
        <SectionTitle
          data-editor-part="titulo"
          $seccion={seccion}
          $fuente={diseno.fuente}
          $tamano={diseno.tamano}
          $peso={diseno.peso}
          $alineacion={diseno.alineacion}
          $color={diseno.color}
          $pending={loading}
        >
          {diseno.titulo}
        </SectionTitle>
        <BadgesContainer
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          {discountValores.map(val => (
            <BadgeButton
              key={val}
              onClick={() => handleSelectFilter(val)}
              aria-label={`Filtrar ofertas hasta ${val}%`}
            >
              <img src={`/ofertas/${val}.png`} alt={`Hasta ${val}%`} />
            </BadgeButton>
          ))}
        </BadgesContainer>
      </SectionHeader>
    </SectionWrapper>
  );
}
