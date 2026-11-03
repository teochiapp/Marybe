import React, { useRef, useState, useEffect } from 'react';
import { BANNER_DEFAULTS, DEVICES, deviceDesign, imageUrl, safeBannerLink } from '../../utils/bannerDesign';
import './VisualBanners.css';

function vars(design, defaults, prefix) {
  const result = {};
  for (const [index, device] of DEVICES.entries()) {
    const values = deviceDesign(design, device, defaults);
    for (const [key, value] of Object.entries(values)) result[`--${prefix}-${key}-${index}`] = key === 'height' ? (value ? `${value}px` : 'auto') : typeof value === 'boolean' ? (value ? 'none' : 'flex') : value;
  }
  return result;
}
export function VisualBanner({ banner, selection, onSelect, onMove, onResize, device = 'desktop', priority = false }) {
  const ref = useRef(null);
  const [position, setPosition] = useState(null);
  const [width, setWidth] = useState(null);
  const dragging = useRef(false);
  const dragStart = useRef(null);
  const resizeStart = useRef(null);
  if (!banner || banner.activo === false) return null;
  const desktop = imageUrl(banner.imagen_desktop);
  const tablet = imageUrl(banner.imagen_tablet) || desktop;
  const mobile = imageUrl(banner.imagen_mobile) || tablet;
  const link = safeBannerLink(banner.enlace);
  const styles = vars(banner.diseno, BANNER_DEFAULTS, 'vb');
  const box = deviceDesign(banner.diseno, device);
  function pointerPosition(event) {
    const start = dragStart.current;
    return { textX: Math.round(Math.max(0, Math.min(90, start.textX + (event.clientX - start.x) / start.width * 100))), textY: Math.round(Math.max(5, Math.min(95, start.textY + (event.clientY - start.y) / start.height * 100))) };
  }
  function resizedWidth(event) {
    const start = resizeStart.current;
    return Math.round(Math.max(10, Math.min(100, start.width + ((event.clientX - start.x) / start.containerWidth) * 100)));
  }
  const resizedStyles = width === null ? styles : { ...styles, '--vb-width-0': width, '--vb-width-1': width, '--vb-width-2': width };
  return <div className={`vb-banner ${selection ? 'vb-banner--selected' : ''}`} ref={ref} style={resizedStyles} data-visual-banner={banner.titulo} onClick={event => {
    if (onSelect) { event.preventDefault(); event.stopPropagation(); onSelect(); }
  }}>
    {desktop && <picture className="vb-image"><source media="(max-width: 767px)" srcSet={mobile} /><source media="(max-width: 1023px)" srcSet={tablet} /><img src={desktop} alt={banner.titulo || ''} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} draggable={false} /></picture>}
    {!desktop && !banner.mostrar_texto && onSelect && <span className="vb-empty">Elegí una imagen desde el panel</span>}
    <div className="vb-shade" />
    {link && !onSelect && <a className="vb-cover-link" href={link} aria-label={banner.titulo || 'Ver promoción'} />}
    {banner.mostrar_texto && <div className={`vb-content ${onMove ? 'vb-content--drag' : ''}`} style={position ? { left: `${position.textX}%`, top: `${position.textY}%` } : undefined}
      onPointerDown={event => { if (!onMove) return; event.preventDefault(); event.stopPropagation(); const rect = ref.current.getBoundingClientRect(); dragStart.current = { x: event.clientX, y: event.clientY, textX: box.textX, textY: box.textY, width: rect.width, height: rect.height }; dragging.current = true; event.currentTarget.setPointerCapture(event.pointerId); onSelect?.(); }}
      onPointerMove={event => { if (dragging.current) setPosition(pointerPosition(event)); }}
      onPointerUp={event => { if (!dragging.current) return; dragging.current = false; const value = pointerPosition(event); setPosition(null); onMove(value); }}
      onPointerCancel={() => { dragging.current = false; setPosition(null); }}>
      <h2>{banner.titulo}</h2>{banner.subtitulo && <p>{banner.subtitulo}</p>}
      {banner.texto_boton && (link && !onSelect ? <a className="vb-button" href={link}>{banner.texto_boton}</a> : <span className="vb-button">{banner.texto_boton}</span>)}
    </div>}
    {onSelect && <span className="vb-edit-label">{banner.titulo || 'Banner'} · {box.height || 'auto'} px</span>}
    {selection && onResize && <button type="button" role="slider" className="vb-width-handle" aria-label="Ajustar ancho del banner" aria-valuemin="10" aria-valuemax="100" aria-valuenow={width ?? box.width}
      onPointerDown={event => { event.preventDefault(); event.stopPropagation(); const container = ref.current?.parentElement?.getBoundingClientRect(); if (!container?.width) return; resizeStart.current = { x: event.clientX, width: box.width, containerWidth: container.width }; event.currentTarget.setPointerCapture(event.pointerId); onSelect?.(); }}
      onPointerMove={event => { if (resizeStart.current) setWidth(resizedWidth(event)); }}
      onPointerUp={event => { if (!resizeStart.current) return; const value = resizedWidth(event); resizeStart.current = null; setWidth(null); onResize(value); }}
      onPointerCancel={() => { resizeStart.current = null; setWidth(null); }}
      onKeyDown={event => { if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return; event.preventDefault(); onResize(Math.max(10, Math.min(100, box.width + (event.key === 'ArrowRight' ? 5 : -5)))); }} />}
  </div>;
}

function VisualRow({ row, rowIndex, selected, onSelect, onMove, onResize, device }) {
  const track = useRef(null);
  const columns = row.__component === 'layout.fila-2-columnas' ? 2 : row.__component === 'layout.fila-4-columnas' ? 4 : 1;
  const defaults = { columns, gap: 16, padding: 0, margin: 0, width: 100, maxWidth: 1920, background: '#ffffff', hidden: false };
  const design = { ...row.diseno, mobile: { columns: 1, ...row.diseno?.mobile } };
  const banners = row.banners || [];
  const scroll = direction => track.current?.scrollBy({ left: track.current.clientWidth * direction, behavior: 'smooth' });
  useEffect(() => {
    if (!row.es_carrusel || onSelect || banners.length < 2) return undefined;
    const timer = setInterval(() => {
      const element = track.current;
      if (!element || element.matches(':hover, :focus-within') || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
      if (element.scrollLeft >= element.scrollWidth - element.clientWidth - 4) element.scrollTo({ left: 0, behavior: 'smooth' });
      else scroll(1);
    }, 7000);
    return () => clearInterval(timer);
  }, [row.es_carrusel, onSelect, banners.length]);
  return <section className="vb-row" style={vars(design, defaults, 'vr')} aria-label={`Fila de banners ${rowIndex + 1}`}>
    <div ref={track} className={`vb-track ${row.es_carrusel ? 'vb-track--carousel' : ''}`}>
      {banners.map((banner, index) => banner.activo === false ? null : <div className="vb-cell" key={banner.id ? `id-${banner.id}` : `new-${index}`} style={{ ...vars(banner.diseno, BANNER_DEFAULTS, 'vc'), ...(row.__component === 'layout.fila-mixta' ? { '--custom-width': `${banner.ancho_porcentaje || 100}%`, '--custom-fraction': (banner.ancho_porcentaje || 100) / 100 } : {}) }}>
        <VisualBanner banner={banner} selection={selected?.row === rowIndex && selected?.banner === index} onSelect={onSelect ? () => onSelect(rowIndex, index) : null} onMove={onMove ? value => onMove(rowIndex, index, value) : null} onResize={onResize ? value => onResize(rowIndex, index, value) : null} device={device} priority={rowIndex === 0 && index === 0} />
      </div>)}
    </div>
    {row.es_carrusel && banners.length > 1 && <div className="vb-arrows"><button type="button" onClick={() => scroll(-1)} aria-label="Banner anterior">‹</button><button type="button" onClick={() => scroll(1)} aria-label="Banner siguiente">›</button></div>}
  </section>;
}
export default function VisualBanners({ rows = [], selected, onSelect, onMove, onResize, device }) {
  return <div className="vb-layout">{rows.map((row, index) => <VisualRow key={row.id ? `id-${row.id}` : `new-${index}`} row={row} rowIndex={index} selected={selected} onSelect={onSelect} onMove={onMove} onResize={onResize} device={device} />)}</div>;
}
