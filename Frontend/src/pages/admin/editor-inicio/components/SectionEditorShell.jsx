import React, { useCallback, useEffect, useRef, useState } from 'react';
import '../../BannersAdmin.css';
import { DEVICES, DEVICE_WIDTHS } from '../../../../utils/bannerDesign';
import EditorPreviewFrame from './EditorPreviewFrame';
import EditorPreviewDialog from './EditorPreviewDialog';

export const DEVICE_NAMES = { desktop: 'Computadora', tablet: 'Tablet', mobile: 'Celular' };

/**
 * Estructura visual común de los editores de sección (misma que el editor de banners):
 * barra superior con guardado, selector de área, partes, lienzo con vista previa real e inspector.
 */
export default function SectionEditorShell({
  title,
  locationText,
  areas,
  draft,
  device,
  onDevice,
  previewPayload,
  canvasCaption,
  previewTitle,
  onSelectFromPreview,
  onSelectArea,
  onSaveDraft,
  onPublish,
  onBack,
  onLogout,
  sidebar,
  stageTop,
  inspectorTitle,
  children,
  dialogs,
}) {
  const { data, dirty, hasDraft, hasUnsaved, loading, busy, error, message, setError, setMessage } = draft;
  const [showPreview, setShowPreview] = useState(false);
  const [scale, setScale] = useState(0.65);
  const canvas = useRef(null);
  const area = areas.find(item => item.key === draft.areaKey) || areas[0];

  useEffect(() => {
    const observer = new ResizeObserver(entries => setScale(Math.min(1, Math.max(0.2, (entries[0].contentRect.width - 40) / DEVICE_WIDTHS[device]))));
    if (canvas.current) observer.observe(canvas.current);
    return () => observer.disconnect();
  }, [device, loading]);

  const closePreview = useCallback(() => setShowPreview(false), []);
  const leave = action => { if (!hasUnsaved || window.confirm('Hay cambios sin guardar. ¿Querés salir igual?')) action(); };
  const statusText = !data ? 'Cargando…' : dirty ? '● Cambios sin guardar' : hasDraft ? '● Borrador sin publicar' : hasUnsaved ? '● Otros cambios pendientes' : '● Publicado';

  return (
    <main className="ba-app" inert={showPreview}>
      {showPreview && previewPayload && <EditorPreviewDialog payload={previewPayload} title={`${title} · ${area.label}`} initialDevice={device} onClose={closePreview} />}
      <header className="ba-topbar">
        <button type="button" className="ba-back" disabled={busy} onClick={() => leave(onBack)}>← Editor de Inicio</button>
        <div className="ba-brand"><img src="/logo-marybe.png" alt="Marybe" width="629" height="168" /><span>{title}</span></div>
        <span className={`ba-status ${dirty || hasDraft || hasUnsaved ? 'ba-status--dirty' : ''}`} role="status">{statusText}</span>
        <div className="ba-top-actions">
          <details className="ba-top-more">
            <summary>Más opciones</summary>
            <div>
              <button disabled={!data || busy || !hasDraft} onClick={() => draft.discardDraft(area.label)}>Descartar borrador guardado</button>
              <button disabled={!data || busy} onClick={draft.revertToPublished}>Volver a lo publicado</button>
              <button disabled={busy} onClick={() => leave(onLogout)}>Salir</button>
            </div>
          </details>
          <button className="ba-preview-open" disabled={!data || loading} onClick={() => setShowPreview(true)}>Vista previa</button>
          <button disabled={!data || busy || !dirty} onClick={onSaveDraft}>Guardar borrador</button>
          <button className="ba-primary" disabled={!data || busy || (!dirty && !hasDraft)} onClick={onPublish}>{busy ? 'Guardando…' : 'Publicar cambios'}</button>
        </div>
      </header>
      <div className="ba-locationbar">
        <div><p className="ba-eyebrow">TIENDA / EDITOR VISUAL</p><h1>{title}</h1></div>
        <div className="ba-area-tabs" role="group" aria-label="Área de Inicio">
          {areas.map(item => <button key={item.key} disabled={busy || loading} aria-pressed={draft.areaKey === item.key} onClick={() => onSelectArea(item.key)}>{item.label}{draft.isAreaDirty(item.key) ? ' •' : ''}</button>)}
        </div>
        <p>{locationText}</p>
      </div>
      {(error || message) && <div className={`ba-notice ${error ? 'ba-notice--error' : ''}`} role={error ? 'alert' : 'status'}>{error || message}<button onClick={() => { setError(''); setMessage(''); }} aria-label="Cerrar mensaje">×</button></div>}
      <div className="ba-workspace">
        {data ? sidebar : <aside className="ba-sidebar"><p role="status">{loading ? 'Cargando sección…' : 'No se pudo cargar la sección.'}</p></aside>}

        <section className="ba-stage">
          <div className="ba-preview-toolbar">
            <div className="ba-device-tabs">{DEVICES.map(value => <button key={value} className={device === value ? 'is-active' : ''} aria-pressed={device === value} onClick={() => onDevice(value)}>{DEVICE_NAMES[value]}</button>)}</div>
            <span>{DEVICE_WIDTHS[device]} px · {Math.round(scale * 100)}%</span>
            <div className="ba-undo">
              <button aria-label="Deshacer" disabled={!draft.canUndo || busy} onClick={draft.undo}>↶</button>
              <button aria-label="Rehacer" disabled={!draft.canRedo || busy} onClick={draft.redo}>↷</button>
            </div>
          </div>
          {data && stageTop}
          <div className="ba-canvas" ref={canvas}>
            {previewPayload ? <>
              <div className="ba-canvas-caption">{canvasCaption}</div>
              <EditorPreviewFrame payload={previewPayload} width={DEVICE_WIDTHS[device]} scale={scale} title={previewTitle || `Vista previa de ${title}`} onSelect={onSelectFromPreview} />
              <p className="ba-canvas-tip">Hacé clic en una parte de la sección para editarla. Tu vista previa es privada.</p>
            </> : <div className="ba-empty"><h2>{loading ? 'Cargando…' : `No se pudo cargar ${title}`}</h2></div>}
          </div>
        </section>

        <aside className="ba-inspector">
          <div className="ba-inspector-title">
            <p className="ba-eyebrow">PERSONALIZAR</p>
            <h2>{inspectorTitle || title}</h2>
            <span>{area.label} · {DEVICE_NAMES[device]}</span>
          </div>
          {data && children}
        </aside>
      </div>
      {dialogs}
    </main>
  );
}
