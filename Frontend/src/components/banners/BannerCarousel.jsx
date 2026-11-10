import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CAROUSEL_DEFAULTS } from '../../utils/bannerDesign';
import './BannerCarousel.css';

export default function BannerCarousel({ children, trackClassName = '', Track = 'div', editable = false, autoplay = true, settings, label = 'Banners' }) {
  const track = useRef(null);
  const interaction = useRef({ dragging: false, moved: false, pauseUntil: 0 });
  const [overflow, setOverflow] = useState(false);
  const [positions, setPositions] = useState([]);
  const [active, setActive] = useState(0);
  const options = { ...CAROUSEL_DEFAULTS, ...settings };
  const interval = Math.max(1, Math.min(60, Number(options.intervalo) || 7)) * 1000;

  const readPositions = useCallback(() => {
    const element = track.current;
    if (!element) return [];
    const max = Math.max(0, element.scrollWidth - element.clientWidth);
    if (max <= 1) return [];
    const bounds = element.getBoundingClientRect();
    return Array.from(element.children)
      .filter(child => child.getClientRects().length && getComputedStyle(child).display !== 'none')
      .map(child => Math.max(0, Math.min(max, child.getBoundingClientRect().left - bounds.left + element.scrollLeft)))
      .filter((position, index, list) => index === 0 || Math.abs(position - list[index - 1]) > 1);
  }, []);

  const measure = useCallback(() => {
    const element = track.current;
    setOverflow(Boolean(element && element.scrollWidth - element.clientWidth > 1));
    const values = readPositions();
    setPositions(previous => JSON.stringify(previous) === JSON.stringify(values) ? previous : values);
    if (element && values.length) setActive(values.reduce((best, position, index) => Math.abs(position - element.scrollLeft) < Math.abs(values[best] - element.scrollLeft) ? index : best, 0));
    else setActive(0);
  }, [readPositions]);

  useEffect(() => {
    const element = track.current;
    if (!element) return undefined;
    const resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    const observe = () => {
      resize?.disconnect();
      resize?.observe(element);
      Array.from(element.children).forEach(child => resize?.observe(child));
      measure();
    };
    const mutation = new MutationObserver(observe);
    mutation.observe(element, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class', 'hidden'] });
    window.addEventListener('resize', observe);
    observe();
    return () => { resize?.disconnect(); mutation.disconnect(); window.removeEventListener('resize', observe); };
  }, [children, measure]);

  const pause = () => { interaction.current.pauseUntil = Date.now() + interval; };
  const navigate = useCallback(direction => {
    const element = track.current;
    if (!element) return;
    const max = Math.max(0, element.scrollWidth - element.clientWidth);
    if (max <= 1) return;
    const positions = readPositions();
    const current = element.scrollLeft;
    let target;
    if (direction > 0) target = current >= max - 1 ? 0 : positions.find(position => position > current + 1) ?? max;
    else target = current <= 1 ? max : [...positions].reverse().find(position => position < current - 1) ?? 0;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    element.scrollTo({ left: target, behavior: reduced ? 'auto' : 'smooth' });
  }, [readPositions]);

  useEffect(() => {
    if (!autoplay || !options.autoplay || editable || !overflow) return undefined;
    const timer = setInterval(() => {
      const element = track.current;
      if (!element || interaction.current.dragging || Date.now() < interaction.current.pauseUntil || element.matches(':hover, :focus-within') || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
      navigate(1);
    }, interval);
    return () => clearInterval(timer);
  }, [autoplay, options.autoplay, editable, overflow, navigate, interval]);

  const start = event => {
    pause();
    if (editable || event.button !== 0) return;
    interaction.current = { ...interaction.current, dragging: true, moved: false, startX: event.clientX, startScroll: track.current.scrollLeft };
  };
  const move = event => {
    const state = interaction.current;
    if (!state.dragging) return;
    const distance = event.clientX - state.startX;
    if (!state.moved && Math.abs(distance) < 5) return;
    state.moved = true;
    event.preventDefault();
    track.current.style.scrollSnapType = 'none';
    track.current.scrollLeft = state.startScroll - distance;
  };
  const end = () => {
    if (!interaction.current.dragging) return;
    interaction.current.dragging = false;
    if (track.current) track.current.style.scrollSnapType = '';
    pause();
  };
  const click = event => {
    if (!interaction.current.moved) return;
    interaction.current.moved = false;
    event.preventDefault();
    event.stopPropagation();
  };

  return <div className="banner-carousel">
    {overflow && <button className="banner-carousel-arrow banner-carousel-arrow--left" type="button" aria-label="Banner anterior" onClick={() => { pause(); navigate(-1); }}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg></button>}
    <Track ref={track} className={`banner-carousel-track ${editable ? 'banner-carousel-track--editable' : ''} ${overflow ? 'banner-carousel-track--scrollable' : ''} ${trackClassName}`} tabIndex={0} aria-label={label}
      onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end} onTouchStart={pause} onTouchEnd={pause} onFocus={pause} onClickCapture={click} onScroll={measure}
      onDragStart={event => { if (!editable) event.preventDefault(); }}
      onKeyDown={event => { if (event.target !== track.current || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return; event.preventDefault(); pause(); navigate(event.key === 'ArrowLeft' ? -1 : 1); }}>
      {children}
    </Track>
    {overflow && <button className="banner-carousel-arrow banner-carousel-arrow--right" type="button" aria-label="Banner siguiente" onClick={() => { pause(); navigate(1); }}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18l6-6-6-6" /></svg></button>}
    {overflow && positions.length > 1 && options.indicador === 'puntos' && <div className="banner-carousel-dots" aria-label="Posiciones del carrusel">{positions.map((position, index) => <button type="button" key={index} aria-label={`Ir a posición ${index + 1}`} aria-current={active === index ? 'true' : undefined} onClick={() => { pause(); const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches; track.current?.scrollTo({ left: position, behavior: reduced ? 'auto' : 'smooth' }); }} />)}</div>}
    {overflow && positions.length > 1 && options.indicador === 'contador' && <span className="banner-carousel-counter" aria-live="polite">{active + 1} / {positions.length}</span>}
  </div>;
}
