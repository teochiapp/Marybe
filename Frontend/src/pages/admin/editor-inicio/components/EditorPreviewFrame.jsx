import React, { useEffect, useRef, useState } from 'react';

// Alto de pantalla simulado por ancho de dispositivo: el iframe crece con el contenido,
// así que las medidas en vh de la landing se calculan sobre una pantalla real.
const VIEWPORT_HEIGHTS = { 1280: 800, 820: 1180, 390: 844 };

// Iframe del lienzo /editor-inicio-preview: envía el borrador y recibe alto, selección y cierre.
export default function EditorPreviewFrame({ payload, width, scale, title, onSelect, onClose }) {
  const frame = useRef(null);
  const [ready, setReady] = useState(0);
  const [height, setHeight] = useState(720);

  useEffect(() => {
    const receive = event => {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow) return;
      const { data } = event;
      if (data?.type === 'MARYBE_EDITOR_READY') setReady(value => value + 1);
      if (data?.type === 'MARYBE_EDITOR_HEIGHT' && Number.isFinite(data.height)) setHeight(Math.min(16000, Math.max(200, Math.ceil(data.height))));
      if (data?.type === 'MARYBE_EDITOR_SELECT' && typeof data.part === 'string') onSelect?.(data.part);
      if (data?.type === 'MARYBE_EDITOR_CLOSE_PREVIEW') onClose?.();
    };
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, [onSelect, onClose]);

  useEffect(() => {
    const timer = setTimeout(() => frame.current?.contentWindow?.postMessage({ type: 'MARYBE_EDITOR_PREVIEW', payload: { ...payload, viewportHeight: VIEWPORT_HEIGHTS[width] || 800 } }, window.location.origin), 60);
    return () => clearTimeout(timer);
  }, [payload, ready, width]);

  return (
    <div className="ba-frame-shell" style={{ width: width * scale, height: height * scale }}>
      <iframe
        title={title}
        src="/editor-inicio-preview"
        ref={frame}
        onLoad={() => setReady(value => value + 1)}
        style={{ width, height, transform: `scale(${scale})` }}
      />
    </div>
  );
}
