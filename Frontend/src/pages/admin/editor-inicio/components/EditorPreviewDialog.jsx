import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DEVICES, DEVICE_WIDTHS } from '../../../../utils/bannerDesign';
import EditorPreviewFrame from './EditorPreviewFrame';

const NAMES = { desktop: 'Computadora', tablet: 'Tablet', mobile: 'Celular' };

// Vista previa limpia (sin marcas de edición) a pantalla completa, igual que en el editor de banners.
export default function EditorPreviewDialog({ payload, title, initialDevice = 'desktop', onClose }) {
  const [device, setDevice] = useState(initialDevice);
  const [availableWidth, setAvailableWidth] = useState(1280);
  const [fit, setFit] = useState(true);
  const canvas = useRef(null);
  const close = useRef(null);
  const width = DEVICE_WIDTHS[device];
  const scale = fit ? Math.min(1, Math.max(0.2, (availableWidth - 40) / width)) : 1;
  const viewPayload = useMemo(() => ({ ...payload, mode: 'view' }), [payload]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = 'hidden';
    close.current?.focus();
    const keyboard = event => { if (event.key === 'Escape') { event.preventDefault(); onClose(); } };
    document.addEventListener('keydown', keyboard);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', keyboard);
      previousFocus?.focus?.();
    };
  }, [onClose]);

  useEffect(() => {
    const observer = new ResizeObserver(entries => setAvailableWidth(entries[0].contentRect.width));
    if (canvas.current) observer.observe(canvas.current);
    return () => observer.disconnect();
  }, []);

  return createPortal(
    <section className="ba-app ba-live-preview" role="dialog" aria-modal="true" aria-labelledby="editor-inicio-preview-title">
      <header className="ba-live-preview-header">
        <div><p className="ba-eyebrow">VISTA PREVIA PRIVADA</p><h2 id="editor-inicio-preview-title">{title}</h2><p>Revisá la sección completa antes de publicar.</p></div>
        <button ref={close} className="ba-primary" onClick={onClose}>Volver al editor</button>
      </header>
      <div className="ba-live-preview-toolbar">
        <div className="ba-device-tabs">{DEVICES.map(value => <button key={value} aria-pressed={device === value} className={device === value ? 'is-active' : ''} onClick={() => setDevice(value)}>{NAMES[value]}</button>)}</div>
        <span>{width} px · {Math.round(scale * 100)}%</span>
        <div className="ba-live-preview-zoom"><button aria-pressed={fit} onClick={() => setFit(true)}>Ajustar a pantalla</button><button aria-pressed={!fit} onClick={() => setFit(false)}>Tamaño real 100%</button></div>
      </div>
      <div className="ba-live-preview-canvas" ref={canvas}>
        <EditorPreviewFrame payload={viewPayload} width={width} scale={scale} title={`Vista previa limpia: ${title}`} onClose={onClose} />
      </div>
    </section>,
    document.body,
  );
}
