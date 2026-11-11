import React, { useRef, useState } from 'react';
import { BANNER_DEFAULTS, MAIN_BANNER_DEFAULTS, DEVICES, deviceDesign, imageUrl, safeBannerLink } from '../../utils/bannerDesign';
import BannerCarousel from './BannerCarousel';
import './VisualBanners.css';

const MIN_HEIGHT = 80;
const MAX_HEIGHT = 1600;
const clampHeight = value => Math.round(Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, value)));

function vars(design, defaults, prefix) {
  const result = {};
  for (const [index, device] of DEVICES.entries()) {
    const values = deviceDesign(design, device, defaults);
    for (const [key, value] of Object.entries(values)) result[`--${prefix}-${key}-${index}`] = key === 'height' ? (value ? `${value}px` : 'auto') : typeof value === 'boolean' ? (value ? 'none' : 'flex') : value;
  }
  return result;
}
export function VisualBanner({ banner, selection, onSelect, onMove, onResize, onHeightResize, onReorderKey, onFocal, focalMode = false, device = 'desktop', priority = false, defaults = BANNER_DEFAULTS }) {
  const ref = useRef(null);
  const [position, setPosition] = useState(null);
  const [width, setWidth] = useState(null);
  const [height, setHeight] = useState(null);
  const [focalPosition, setFocalPosition] = useState(null);
  const dragging = useRef(false);
  const dragStart = useRef(null);
  const resizeStart = useRef(null);
  const heightStart = useRef(null);
  const focalStart = useRef(null);
  if (!banner || banner.activo === false) return null;
  const desktop = imageUrl(banner.imagen_desktop);
  const tablet = imageUrl(banner.imagen_tablet) || desktop;
  const mobile = imageUrl(banner.imagen_mobile) || tablet;
  const link = safeBannerLink(banner.enlace);
  const styles = vars(banner.diseno, defaults, 'vb');
  const box = deviceDesign(banner.diseno, device);
  function pointerPosition(event) {
    const start = dragStart.current;
    return { textX: Math.round(Math.max(0, Math.min(90, start.textX + (event.clientX - start.x) / start.width * 100))), textY: Math.round(Math.max(5, Math.min(95, start.textY + (event.clientY - start.y) / start.height * 100))) };
  }
  function resizedWidth(event) {
    const start = resizeStart.current;
    return Math.round(Math.max(10, Math.min(100, start.width + ((event.clientX - start.x) / start.containerWidth) * 100)));
  }
  function resizedHeight(event) {
    const start = heightStart.current;
    return clampHeight(start.height + (event.clientY - start.y) * start.direction);
  }
  function cancelHeight() { heightStart.current = null; setHeight(null); }
  function startHeight(event, edge) {
    if (event.button !== 0 || event.isPrimary === false) return;
    event.preventDefault();
    event.stopPropagation();
    const rect = ref.current.getBoundingClientRect();
    heightStart.current = { y: event.clientY, height: rect.height, direction: edge === 'top' ? -1 : 1 };
    event.currentTarget.focus();
    event.currentTarget.setPointerCapture(event.pointerId);
    onSelect?.();
  }
  function finishHeight(event) {
    const start = heightStart.current;
    if (!start) return;
    const value = resizedHeight(event);
    cancelHeight();
    if (event.clientY !== start.y && value !== Math.round(start.height)) onHeightResize(value);
  }
  function heightKey(event) {
    if (event.key === 'Escape') { event.preventDefault(); cancelHeight(); return; }
    if (!['ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const current = ref.current.getBoundingClientRect().height;
    const value = clampHeight(current + (event.key === 'ArrowUp' ? 10 : -10));
    if (value !== Math.round(current)) onHeightResize(value);
  }
  const resizedStyles = { ...styles, ...(width === null ? {} : { '--vb-width-0': width, '--vb-width-1': width, '--vb-width-2': width }), ...(height === null ? {} : { '--vb-height-0': `${height}px`, '--vb-height-1': `${height}px`, '--vb-height-2': `${height}px` }), ...(focalPosition ? Object.fromEntries(DEVICES.flatMap((_, index) => [[`--vb-positionX-${index}`, focalPosition.positionX], [`--vb-positionY-${index}`, focalPosition.positionY]])) : {}) };
  function focalGeometry() {
    const rect = ref.current.getBoundingClientRect();
    const img = ref.current.querySelector('img');
    const naturalWidth = img?.naturalWidth || rect.width;
    const naturalHeight = img?.naturalHeight || rect.height;
    const scale = box.fit === 'cover' ? Math.max(rect.width / naturalWidth, rect.height / naturalHeight) : Math.min(rect.width / naturalWidth, rect.height / naturalHeight);
    const fittedWidth = box.fit === 'fill' ? rect.width : naturalWidth * scale;
    const fittedHeight = box.fit === 'fill' ? rect.height : naturalHeight * scale;
    return { rect, width: fittedWidth * box.imageScale / 100, height: fittedHeight * box.imageScale / 100 };
  }
  function focalValue(event, isClick) {
    const start = focalStart.current;
    const clamp = value => Math.round(Math.max(0, Math.min(100, value)));
    if (isClick) return {
      positionX: clamp((event.clientX - start.rect.left - (start.rect.width - start.width) * start.positionX / 100) / start.width * 100),
      positionY: clamp((event.clientY - start.rect.top - (start.rect.height - start.height) * start.positionY / 100) / start.height * 100),
    };
    const xRange = start.rect.width - start.width;
    const yRange = start.rect.height - start.height;
    return {
      positionX: clamp(start.positionX + (event.clientX - start.x) / (Math.abs(xRange) < 1 ? start.rect.width : xRange) * 100),
      positionY: clamp(start.positionY + (event.clientY - start.y) / (Math.abs(yRange) < 1 ? start.rect.height : yRange) * 100),
    };
  }
  return <div className={`vb-banner ${selection ? 'vb-banner--selected' : ''}`} ref={ref} style={resizedStyles} data-visual-banner={banner.titulo} onClick={event => {
    if (onSelect) { event.preventDefault(); event.stopPropagation(); onSelect(); }
  }}>
    {desktop && <picture className="vb-image"><source media="(max-width: 767px)" srcSet={mobile} /><source media="(max-width: 1023px)" srcSet={tablet} /><img src={desktop} alt={banner.titulo || ''} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} draggable={false} /></picture>}
    {!desktop && !banner.mostrar_texto && onSelect && <span className="vb-empty">Elegí una imagen desde el panel</span>}
    <div className="vb-shade" />
    {link && !onSelect && <a className="vb-cover-link" href={link} aria-label={banner.titulo || 'Ver promoción'} />}
    {banner.mostrar_texto && <div className={`vb-content ${onMove && !focalMode ? 'vb-content--drag' : ''}`} style={position ? { left: `${position.textX}%`, top: `${position.textY}%` } : undefined}
      onPointerDown={event => { if (!onMove) return; event.preventDefault(); event.stopPropagation(); const rect = ref.current.getBoundingClientRect(); dragStart.current = { x: event.clientX, y: event.clientY, textX: box.textX, textY: box.textY, width: rect.width, height: rect.height }; dragging.current = true; event.currentTarget.setPointerCapture(event.pointerId); onSelect?.(); }}
      onPointerMove={event => { if (dragging.current) setPosition(pointerPosition(event)); }}
      onPointerUp={event => { if (!dragging.current) return; dragging.current = false; const value = pointerPosition(event); setPosition(null); onMove(value); }}
      onPointerCancel={() => { dragging.current = false; setPosition(null); }}>
      <h2>{banner.titulo}</h2>{banner.subtitulo && <p>{banner.subtitulo}</p>}
      {banner.texto_boton && (link && !onSelect ? <a className="vb-button" href={link}>{banner.texto_boton}</a> : <span className="vb-button">{banner.texto_boton}</span>)}
    </div>}
    {onSelect && <span className="vb-edit-label">{banner.titulo || 'Banner'} · {height ?? (box.height || 'auto')} px</span>}
    {onReorderKey && !focalMode && <button type="button" className="vb-reorder-handle" data-banner-move aria-label={`Mover ${banner.titulo || 'banner'}`} title="Arrastrá para mover. También podés usar las flechas del teclado." onKeyDown={onReorderKey}>⠿</button>}
    {selection && !focalMode && onHeightResize && ['top', 'bottom'].map(edge => <button key={edge} type="button" role="slider" className={`vb-height-handle vb-height-handle--${edge}`} aria-label={`Ajustar alto desde el borde ${edge === 'top' ? 'superior' : 'inferior'}`} aria-orientation="vertical" aria-valuemin={MIN_HEIGHT} aria-valuemax={MAX_HEIGHT} aria-valuenow={height ?? clampHeight(box.height || ref.current?.getBoundingClientRect().height || MIN_HEIGHT)}
      onClick={event => { event.preventDefault(); event.stopPropagation(); }}
      onPointerDown={event => startHeight(event, edge)}
      onPointerMove={event => { if (heightStart.current) setHeight(resizedHeight(event)); }}
      onPointerUp={finishHeight}
      onPointerCancel={cancelHeight} onLostPointerCapture={cancelHeight}
      onKeyDown={heightKey} />)}
    {selection && focalMode && onFocal && desktop && <div className="vb-focal-layer" role="application" aria-label="Editar punto focal" tabIndex={0} onClick={event => { event.preventDefault(); event.stopPropagation(); }}
      onPointerDown={event => { event.preventDefault(); event.stopPropagation(); const geometry = focalGeometry(); if (!geometry.rect.width || !geometry.rect.height) return; focalStart.current = { ...geometry, x: event.clientX, y: event.clientY, positionX: box.positionX, positionY: box.positionY }; event.currentTarget.setPointerCapture(event.pointerId); }}
      onPointerMove={event => { if (focalStart.current) setFocalPosition(focalValue(event, false)); }}
      onPointerUp={event => { if (!focalStart.current) return; const start = focalStart.current; const click = Math.hypot(event.clientX - start.x, event.clientY - start.y) < 4; const value = focalValue(event, click); focalStart.current = null; setFocalPosition(null); onFocal(value); }}
      onPointerCancel={() => { focalStart.current = null; setFocalPosition(null); }}>
      <span className="vb-focal-marker" style={{ left: `${focalPosition?.positionX ?? box.positionX}%`, top: `${focalPosition?.positionY ?? box.positionY}%` }} />
    </div>}
    {selection && !focalMode && onResize && <button type="button" role="slider" className="vb-width-handle" aria-label="Ajustar ancho del banner" aria-valuemin="10" aria-valuemax="100" aria-valuenow={width ?? box.width}
      onPointerDown={event => { event.preventDefault(); event.stopPropagation(); const container = ref.current?.parentElement?.getBoundingClientRect(); if (!container?.width) return; resizeStart.current = { x: event.clientX, width: box.width, containerWidth: container.width }; event.currentTarget.setPointerCapture(event.pointerId); onSelect?.(); }}
      onPointerMove={event => { if (resizeStart.current) setWidth(resizedWidth(event)); }}
      onPointerUp={event => { if (!resizeStart.current) return; const value = resizedWidth(event); resizeStart.current = null; setWidth(null); onResize(value); }}
      onPointerCancel={() => { resizeStart.current = null; setWidth(null); }}
      onKeyDown={event => { if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return; event.preventDefault(); onResize(Math.max(10, Math.min(100, box.width + (event.key === 'ArrowRight' ? 5 : -5)))); }} />}
  </div>;
}

function VisualRow({ row, rowIndex, selected, onSelect, onMove, onResize, onHeightResize, onReorder, onFocal, focalMode, device, preview }) {
  const reorderStart = useRef(null);
  const suppressClickUntil = useRef(0);
  const [reordering, setReordering] = useState(null);
  const columns = row.__component === 'layout.fila-2-columnas' ? 2 : row.__component === 'layout.fila-4-columnas' ? 4 : 1;
  const defaults = { columns, gap: 16, padding: 0, margin: 0, width: 100, maxWidth: 1920, background: '#ffffff', hidden: false };
  const design = row.diseno;
  const banners = row.banners || [];
  const canReorder = Boolean(onReorder && !focalMode && banners.filter(banner => banner.activo !== false && !deviceDesign(banner.diseno, device).hidden).length > 1);
  function cancelReorder() { reorderStart.current = null; setReordering(null); }
  function beginReorder(event, index) {
    if (!canReorder || event.button !== 0 || event.isPrimary === false || event.target.closest('button:not([data-banner-move]), .vb-content--drag, .vb-focal-layer')) return;
    const handle = event.target.closest('[data-banner-move]');
    if (event.pointerType === 'touch' && !handle) return;
    event.preventDefault();
    const cell = event.currentTarget;
    const { left, top, width, height } = cell.getBoundingClientRect();
    reorderStart.current = { index, destination: index, pointerId: event.pointerId, x: event.clientX, y: event.clientY, scrollLeft: cell.parentElement.scrollLeft, rect: { left, top, width, height }, moved: false };
    suppressClickUntil.current = 0;
    cell.setPointerCapture(event.pointerId);
    (handle || cell).focus();
    onSelect?.(rowIndex, index);
  }
  function moveReorder(event) {
    const start = reorderStart.current;
    if (!start || event.pointerId !== start.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (!start.moved && Math.hypot(dx, dy) < 6) return;
    start.moved = true;
    event.preventDefault();
    const track = event.currentTarget.parentElement;
    const bounds = track.getBoundingClientRect();
    if (track.scrollWidth > track.clientWidth) {
      if (event.clientX > bounds.right - 40) track.scrollLeft += 20;
      else if (event.clientX < bounds.left + 40) track.scrollLeft -= 20;
    }
    const scrollDelta = track.scrollLeft - start.scrollLeft;
    let destination = start.index;
    let nearest = Infinity;
    if (event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom) {
      for (const cell of track.children) {
        if (getComputedStyle(cell).display === 'none') continue;
        const index = Number(cell.dataset.bannerIndex);
        const rect = index === start.index ? { ...start.rect, left: start.rect.left - scrollDelta } : cell.getBoundingClientRect();
        const distance = Math.hypot(event.clientX - rect.left - rect.width / 2, event.clientY - rect.top - rect.height / 2);
        if (distance < nearest) { nearest = distance; destination = index; }
      }
    }
    start.destination = destination;
    setReordering({ source: start.index, destination, dx: dx + scrollDelta, dy });
  }
  function finishReorder(event) {
    const start = reorderStart.current;
    if (!start || event.pointerId !== start.pointerId) return;
    cancelReorder();
    if (!start.moved) return;
    event.preventDefault();
    suppressClickUntil.current = Date.now() + 500;
    if (start.destination !== start.index) onReorder(rowIndex, start.index, start.destination);
  }
  function reorderKey(event, index) {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
    const visible = Array.from(event.currentTarget.closest('.vb-track').children).filter(cell => getComputedStyle(cell).display !== 'none').map(cell => Number(cell.dataset.bannerIndex));
    const direction = ['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 1;
    const destination = visible[visible.indexOf(index) + direction];
    if (destination !== undefined) onReorder(rowIndex, index, destination);
  }
  const cells = banners.map((banner, index) => banner.activo === false ? null : <div className={`vb-cell ${canReorder ? 'vb-cell--editable' : ''} ${reordering?.source === index ? 'vb-cell--dragging' : ''} ${reordering?.destination === index && reordering.source !== index ? 'vb-cell--drop-target' : ''}`} data-banner-index={index} key={banner.id ? `id-${banner.id}` : `new-${index}`} style={{ ...vars(banner.diseno, BANNER_DEFAULTS, 'vc'), ...(row.__component === 'layout.fila-mixta' ? { '--custom-width': `${banner.ancho_porcentaje || 100}%`, '--custom-fraction': (banner.ancho_porcentaje || 100) / 100 } : {}), ...(reordering?.source === index ? { transform: `translate(${reordering.dx}px, ${reordering.dy}px)` } : {}) }}
      onPointerDown={canReorder ? event => beginReorder(event, index) : undefined}
      onPointerMove={canReorder ? moveReorder : undefined}
      onPointerUp={canReorder ? finishReorder : undefined}
      onPointerCancel={canReorder ? cancelReorder : undefined} onLostPointerCapture={canReorder ? cancelReorder : undefined}
      onClickCapture={canReorder ? event => { if (Date.now() < suppressClickUntil.current) { event.preventDefault(); event.stopPropagation(); } } : undefined}
      onKeyDown={canReorder ? event => { if (event.key === 'Escape' && reorderStart.current) { event.preventDefault(); cancelReorder(); } } : undefined} tabIndex={canReorder ? -1 : undefined}>
        <VisualBanner banner={banner} selection={selected?.row === rowIndex && selected?.banner === index} focalMode={focalMode && selected?.row === rowIndex && selected?.banner === index} onFocal={onFocal ? value => onFocal(rowIndex, index, value) : null} onSelect={onSelect ? () => onSelect(rowIndex, index) : null} onMove={onMove ? value => onMove(rowIndex, index, value) : null} onResize={onResize ? value => onResize(rowIndex, index, value) : null} onHeightResize={onHeightResize ? value => onHeightResize(rowIndex, index, value) : null} onReorderKey={canReorder ? event => reorderKey(event, index) : null} device={device} defaults={MAIN_BANNER_DEFAULTS} priority={rowIndex === 0 && index === 0} />
      </div>);
  return <section className={`vb-row ${reordering ? 'vb-row--reordering' : ''}`} style={vars(design, defaults, 'vr')} aria-label={`Fila de banners ${rowIndex + 1}`}>
    {row.es_carrusel ? <BannerCarousel trackClassName={`vb-track vb-track--carousel ${row.config_carrusel?.vistaParcial ? 'vb-track--peek' : ''}`} editable={Boolean(onSelect)} autoplay={!preview} settings={row.config_carrusel} label={`Carrusel de banners ${rowIndex + 1}`}>{cells}</BannerCarousel> : <div className="vb-track">{cells}</div>}
  </section>;
}
export default function VisualBanners({ rows = [], selected, onSelect, onMove, onResize, onHeightResize, onReorder, onFocal, focalMode, device, preview = false }) {
  return <div className="vb-layout">{rows.map((row, index) => <VisualRow key={`${row.id ? `id-${row.id}` : `new-${index}`}-${device || 'responsive'}`} row={row} rowIndex={index} selected={selected} onSelect={onSelect} onMove={onMove} onResize={onResize} onHeightResize={onHeightResize} onReorder={onReorder} onFocal={onFocal} focalMode={focalMode} device={device} preview={preview} />)}</div>;
}
