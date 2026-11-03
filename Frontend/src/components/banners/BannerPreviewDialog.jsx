import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DEVICES, DEVICE_WIDTHS } from '../../utils/bannerDesign';

const NAMES = { desktop: 'Computadora', tablet: 'Tablet', mobile: 'Celular' };

export default function BannerPreviewDialog({ rows, title, initialDevice = 'desktop', onClose }) {
  const [device, setDevice] = useState(initialDevice);
  const [ready, setReady] = useState(0);
  const [height, setHeight] = useState(700);
  const [availableWidth, setAvailableWidth] = useState(1280);
  const [fit, setFit] = useState(true);
  const frame = useRef(null);
  const canvas = useRef(null);
  const dialog = useRef(null);
  const close = useRef(null);
  const width = DEVICE_WIDTHS[device];
  const scale = fit ? Math.min(1, Math.max(.2, (availableWidth - 40) / width)) : 1;

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    close.current?.focus();
    const keyboard = event => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); }
      if (event.key !== 'Tab') return;
      const controls = dialog.current?.querySelectorAll('button:not([disabled]), iframe');
      if (!controls?.length) return;
      const first = controls[0]; const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', keyboard);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', keyboard);
      previousFocus?.focus();
    };
  }, [onClose]);

  useEffect(() => {
    const observer = new ResizeObserver(entries => setAvailableWidth(entries[0].contentRect.width));
    if (canvas.current) observer.observe(canvas.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const receive = event => {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow) return;
      if (event.data?.type === 'MARYBE_BANNERS_READY') setReady(value => value + 1);
      if (event.data?.type === 'MARYBE_BANNERS_HEIGHT' && Number.isFinite(event.data.height)) setHeight(Math.min(16000, Math.max(180, event.data.height)));
      if (event.data?.type === 'MARYBE_BANNERS_CLOSE_PREVIEW') onClose();
    };
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, [onClose]);

  useEffect(() => {
    frame.current?.contentWindow?.postMessage({ type: 'MARYBE_BANNERS_PREVIEW', payload: { rows, device, mode: 'view' } }, window.location.origin);
  }, [rows, device, ready]);

  return createPortal(<section className="ba-app ba-live-preview" ref={dialog} role="dialog" aria-modal="true" aria-labelledby="ba-live-preview-title">
    <header className="ba-live-preview-header"><div><p className="ba-eyebrow">VISTA PREVIA PRIVADA</p><h2 id="ba-live-preview-title">{title || 'Banners principales'}</h2><p>Revisá el diseño completo antes de publicar.</p></div><button ref={close} className="ba-primary" onClick={onClose}>Volver al editor</button></header>
    <div className="ba-live-preview-toolbar"><div className="ba-device-tabs">{DEVICES.map(value => <button key={value} aria-pressed={device === value} className={device === value ? 'is-active' : ''} onClick={() => setDevice(value)}>{NAMES[value]}</button>)}</div><span>{width} px · {Math.round(scale * 100)}%</span><div className="ba-live-preview-zoom"><button aria-pressed={fit} onClick={() => setFit(true)}>Ajustar a pantalla</button><button aria-pressed={!fit} onClick={() => setFit(false)}>Tamaño real 100%</button></div></div>
    <div className="ba-live-preview-canvas" ref={canvas}><div className="ba-frame-shell" style={{ width: width * scale, height: height * scale }}><iframe title="Vista previa limpia de banners" ref={frame} src="/banners-preview" onLoad={() => setReady(value => value + 1)} style={{ width, height, transform: `scale(${scale})` }} /></div></div>
  </section>, document.body);
}
