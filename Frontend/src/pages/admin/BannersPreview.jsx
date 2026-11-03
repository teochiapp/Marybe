import React, { useState, useEffect } from 'react';
import VisualBanners from '../../components/banners/VisualBanners';

export default function BannersPreview() {
  const [preview, setPreview] = useState(null);
  useEffect(() => {
    const receive = event => {
      if (event.origin !== window.location.origin || event.source !== window.parent || event.data?.type !== 'MARYBE_BANNERS_PREVIEW') return;
      setPreview(event.data.payload);
    };
    window.addEventListener('message', receive);
    window.parent.postMessage({ type: 'MARYBE_BANNERS_READY' }, window.location.origin);
    return () => window.removeEventListener('message', receive);
  }, []);
  useEffect(() => {
    const target = document.getElementById('banners-preview-content');
    if (!target) return undefined;
    const observer = new ResizeObserver(() => window.parent.postMessage({ type: 'MARYBE_BANNERS_HEIGHT', height: target.getBoundingClientRect().height }, window.location.origin));
    observer.observe(target);
    return () => observer.disconnect();
  }, [preview]);
  useEffect(() => {
    if (preview?.mode !== 'view') return undefined;
    const keyboard = event => { if (event.key === 'Escape') window.parent.postMessage({ type: 'MARYBE_BANNERS_CLOSE_PREVIEW' }, window.location.origin); };
    window.addEventListener('keydown', keyboard);
    return () => window.removeEventListener('keydown', keyboard);
  }, [preview?.mode]);
  const send = data => window.parent.postMessage(data, window.location.origin);
  if (!preview) return <p style={{ textAlign: 'center', padding: 32 }}>Preparando vista previa…</p>;
  const side = /^(featured_|descuento_|categoria_)/.test(preview.slot || '');
  const full = preview.slot?.startsWith('gift_');
  const rows = preview.slot ? preview.rows.map(row => ({ ...row, diseno: { desktop: { columns: 1, width: side ? 45 : full ? 100 : 90 }, mobile: { width: full ? 100 : 90 } } })) : preview.rows;
  const readOnly = preview.mode === 'view';
  return <main id="banners-preview-content" className={preview.slot ? 'vb-preview-piece' : ''} style={{ paddingTop: 20, paddingBottom: 20, minHeight: 100, background: '#ffffff' }} onClickCapture={event => {
    if (readOnly && event.target.closest('a')) event.preventDefault();
  }}><VisualBanners rows={rows} selected={readOnly ? null : preview.selected} device={preview.device}
    onSelect={readOnly ? undefined : (row, banner) => send({ type: 'MARYBE_BANNERS_SELECT', row, banner })}
    onMove={readOnly ? undefined : (row, banner, value) => send({ type: 'MARYBE_BANNERS_MOVE', row, banner, value })} /></main>;
}
