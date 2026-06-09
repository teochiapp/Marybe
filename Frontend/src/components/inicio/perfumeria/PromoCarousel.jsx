import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const STRAPI_URL = process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337';

// ─── Styled Components ───────────────────────────────────────────────────────

const Wrapper = styled.div`
  width: 100%;
  max-width: 1400px;
  margin: 0 auto 40px auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  /* Permite que el scroll sobrepase el borde derecho para el efecto peek */
  overflow: visible;
`;

/* Contenedor con fade derecho para indicar que hay más contenido */
const TrackOuter = styled.div`
  width: 100%;
  position: relative;

  /* Gradiente de fade a la derecha para hint de scroll */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 60px;
    height: 100%;
    background: linear-gradient(to right, transparent, rgba(255,255,255,0.85));
    pointer-events: none;
    z-index: 2;
    border-radius: 0 16px 16px 0;
    transition: opacity 0.3s;
  }
`;

/* Fila scrolleable – NO tiene overflow hidden para que se vea el peek */
const ScrollRow = styled.div`
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  /* padding izquierdo para separar del borde, derecho grande para que el último card pe keep visible */
  padding: 6px 20px 8px 20px;
  /* Las alturas las define cada imagen de forma natural */
  cursor: grab;
  user-select: none;

  &:active {
    cursor: grabbing;
  }

  &::-webkit-scrollbar {
    display: none;
  }
`;

const BannerCard = styled.a`
  flex-shrink: 0;
  scroll-snap-align: start;
  border-radius: 20px;
  overflow: hidden;
  text-decoration: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.01);
  background-color: #F5F2ED;
  display: flex;
  flex-direction: column;
  justify-content: center;
  user-select: none;
  -webkit-user-drag: none;

  /* Mobile: 85% para que el siguiente card asome ~15% (efecto peek) */
  width: 85%;
  min-width: 85%;

  /* Desktop: usa el porcentaje del CMS pero ligeramente reducido para insinuar el siguiente */
  @media (min-width: 768px) {
    width: ${({ $tamano }) => `calc(${$tamano}% - 24px)`};
    min-width: ${({ $tamano }) => `calc(${$tamano}% - 24px)`};
  }

  &:hover {
    transform: translateY(-4px);
  }
`;

const BannerImage = styled.img`
  display: block;
  width: 100%;
  height: auto; /* La altura la define la proporción natural de la imagen */
  transition: transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
  user-select: none;
  -webkit-user-drag: none;

  ${BannerCard}:hover & {
    transform: scale(1.025);
  }
`;

const DotsRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const Dot = styled.button`
  width: 28px;
  height: 4px;
  background-color: ${({ $active }) =>
    $active ? 'var(--color-bordo-secundario, #7C0405)' : '#BDBDBD'};
  border: none;
  padding: 0;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: var(--color-bordo-secundario, #7C0405);
  }
`;

// ─── Componente Principal ────────────────────────────────────────────────────
export default function PromoCarousel({ seccion = 'perfumeria' }) {
  const navigate = useNavigate();
  const [ofertas, setOfertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const [dotPositions, setDotPositions] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    async function fetchOfertas() {
      try {
        const seccionNameRaw = seccion === 'hogar' ? 'Hogar' : 'Perfumer\u00eda';
        const encodedSeccion = encodeURIComponent(seccionNameRaw);
        let params;
        if (seccion === 'hogar') {
          // Hogar: filtro estricto, solo mostrar ofertas explícitamente asignadas a Hogar
          params = [
            `filters[seccion][$eq]=${encodedSeccion}`,
            `sort[0]=orden:asc`,
            `populate=*`,
          ].join('&');
        } else {
          // Perfumería: incluir también registros sin sección asignada (legacy)
          params = [
            `filters[$or][0][seccion][$eq]=${encodedSeccion}`,
            `filters[$or][1][seccion][$null]=true`,
            `sort[0]=orden:asc`,
            `populate=*`,
          ].join('&');
        }

        const res = await fetch(`${STRAPI_URL}/api/ofertas?${params}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        
        if (json && json.data) {
          // Sort client-side para garantizar orden por si Strapi no respeta nulls en orden
          const sorted = [...json.data].sort((a, b) => {
            const aAttrs = a.attributes || a;
            const bAttrs = b.attributes || b;
            return (aAttrs.orden ?? 999) - (bAttrs.orden ?? 999);
          });
          setOfertas(sorted);
        } else {
          setOfertas([]);
        }
      } catch (err) {
        console.error('[PromoCarousel] Error al cargar ofertas:', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchOfertas();
  }, [seccion]);

  /* Scroll horizontal con la rueda del mouse (wheel tilt) */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e) => {
      // Si el usuario mueve la rueda en horizontal (tilt) o vertical, lo convertimos a scroll horizontal
      if (Math.abs(e.deltaX) > 0 || Math.abs(e.deltaY) > 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaX !== 0 ? e.deltaX : e.deltaY;
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const updateDots = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !el.children.length) return;

    const children = Array.from(el.children);
    const scrollWidth = el.scrollWidth;
    const clientWidth = el.clientWidth;
    const maxScroll = scrollWidth - clientWidth;

    if (maxScroll <= 0) {
      setDotPositions([0]);
      return;
    }

    const positions = [];
    positions.push(0);

    for (let i = 1; i < children.length; i++) {
      const child = children[i];
      const pos = child.offsetLeft - 20;

      if (pos < maxScroll - 5) {
        positions.push(pos);
      } else {
        positions.push(maxScroll);
        break;
      }
    }

    if (positions[positions.length - 1] < maxScroll - 5) {
      positions.push(maxScroll);
    }

    setDotPositions(positions);
  }, []);

  useEffect(() => {
    if (ofertas.length > 0) {
      const timer = setTimeout(updateDots, 100);
      return () => clearTimeout(timer);
    }
  }, [ofertas, updateDots]);

  useEffect(() => {
    window.addEventListener('resize', updateDots);
    return () => window.removeEventListener('resize', updateDots);
  }, [updateDots]);

  /* Actualiza el dot activo según la posición de scroll */
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !dotPositions.length) return;

    const scrollLeft = el.scrollLeft;
    let minDist = Infinity;
    let idx = 0;

    dotPositions.forEach((pos, i) => {
      const dist = Math.abs(pos - scrollLeft);
      if (dist < minDist) {
        minDist = dist;
        idx = i;
      }
    });

    setActiveIdx(idx);
  }, [dotPositions]);

  /* Scroll suave al dot clickeado */
  const scrollToCard = useCallback((index) => {
    const el = scrollRef.current;
    if (!el) return;
    const targetPos = dotPositions[index];
    if (targetPos !== undefined) {
      el.scrollTo({ left: targetPos, behavior: 'smooth' });
    }
  }, [dotPositions]);

  /* Gestión de arrastre (drag-to-scroll) con mouse */
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftVal = useRef(0);
  const hasDragged = useRef(false);

  const handleMouseDown = useCallback((e) => {
    const el = scrollRef.current;
    if (!el) return;
    isDown.current = true;
    el.style.scrollSnapType = 'none';
    el.style.scrollBehavior = 'auto';
    startX.current = e.pageX - el.offsetLeft;
    scrollLeftVal.current = el.scrollLeft;
    hasDragged.current = false;
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

  const handleLinkClick = useCallback((e, enlace) => {
    if (hasDragged.current) {
      e.preventDefault();
      return;
    }
    if (enlace && enlace.startsWith('/')) {
      e.preventDefault();
      navigate(enlace);
    }
  }, [navigate]);

  if (loading || ofertas.length === 0) return null;

  return (
    <Wrapper>
      <TrackOuter>
        <ScrollRow
          ref={scrollRef}
          onScroll={handleScroll}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          {ofertas.map((o) => {
            const attrs = o.attributes || o;
            const titulo = attrs.titulo || '';
            const enlace = attrs.enlace || null;
            const tamano = attrs.tamano || 100;
            const imageUrl = attrs.imagen?.data?.attributes?.url
              ? `${STRAPI_URL}${attrs.imagen.data.attributes.url}`
              : attrs.imagen?.url
              ? `${STRAPI_URL}${attrs.imagen.url}`
              : '';
            const itemKey = o.documentId || o.id;

            const inner = imageUrl ? <BannerImage src={imageUrl} alt={titulo} draggable="false" /> : null;

            if (enlace) {
              return (
                <BannerCard
                  key={itemKey}
                  $tamano={tamano}
                  href={enlace}
                  onClick={(e) => handleLinkClick(e, enlace)}
                  title={titulo}
                >
                  {inner}
                </BannerCard>
              );
            }

            return (
              <BannerCard key={itemKey} $tamano={tamano} as="div" style={{ cursor: 'default' }} title={titulo}>
                {inner}
              </BannerCard>
            );
          })}
        </ScrollRow>
      </TrackOuter>

      {/* Dots de paginación – solo si hay más de 1 dot de posición */}
      {dotPositions.length > 1 && (
        <DotsRow>
          {dotPositions.map((_, i) => (
            <Dot
              key={i}
              $active={i === activeIdx}
              onClick={() => scrollToCard(i)}
              aria-label={`Ir a oferta ${i + 1}`}
            />
          ))}
        </DotsRow>
      )}
    </Wrapper>
  );
}
