import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { BANNER_DEFAULTS, DEVICES, DEVICE_WIDTHS, ROW_TYPES, deviceDesign, duplicateRow, imageUrl, newBanner, structuredCopy } from '../../utils/bannerDesign';
import './BannersAdmin.css';
import BannerPreviewDialog from '../../components/banners/BannerPreviewDialog';
import BannerStructure from '../../components/banners/BannerStructure';

const API = process.env.REACT_APP_STRAPI_URL || process.env.REACT_APP_API_URL || 'http://localhost:1337';
const NAMES = { desktop: 'Computadora', tablet: 'Tablet', mobile: 'Celular' };
const TYPE_COLUMNS = { 'layout.fila-1-columna': 1, 'layout.fila-2-columnas': 2, 'layout.fila-4-columnas': 4, 'layout.fila-mixta': 1 };
function normalized(document) {
  return { ...document, Filas: (document.Filas || []).map(row => ({ ...row, diseno: { desktop: { columns: TYPE_COLUMNS[row.__component], ...row.diseno?.desktop }, tablet: row.diseno?.tablet || {}, mobile: { columns: 1, ...row.diseno?.mobile } }, banners: row.banners || [] })) };
}
function NumberControl({ label, value, min = 0, max = 100, step = 1, onChange, suffix = 'px' }) {
  return <label className="ba-control"><span>{label} <small>{suffix}</small></span><div className="ba-range"><input aria-label={`${label} deslizador`} type="range" min={min} max={max} step={step} value={value ?? min} onChange={e => onChange(Number(e.target.value))} /><input aria-label={label} type="number" min={min} max={max} step={step} value={value ?? min} onChange={e => { if (e.target.value !== '') onChange(Math.max(min, Math.min(max, Number(e.target.value)))); }} /></div></label>;
}
export default function BannersAdmin() {
  const [token, setToken] = useState(() => localStorage.getItem('admin_jwt') || '');
  const [credentials, setCredentials] = useState({ identifier: '', password: '' });
  const [promotions, setPromotions] = useState([]);
  const [area, setArea] = useState('Perfumería');
  const [source, setSource] = useState('');
  const [draft, setDraft] = useState(null);
  const [selected, setSelected] = useState({ row: 0, banner: 0 });
  const [device, setDevice] = useState('desktop');
  const [inspect, setInspect] = useState('banner');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [library, setLibrary] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [media, setMedia] = useState([]);
  const [mediaSearch, setMediaSearch] = useState('');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [ready, setReady] = useState(0);
  const [scale, setScale] = useState(.65);
  const [previewHeight, setPreviewHeight] = useState(700);
  const baseline = useRef('');
  const frame = useRef(null);
  const canvas = useRef(null);
  const navigation = useRef(new Map());
  const lastSource = useRef({});
  const newSectionId = useRef(0);
  const dirty = draft !== null && JSON.stringify(draft) !== baseline.current;
  const hasUnsaved = dirty || [...navigation.current.entries()].some(([key, entry]) => key !== source && JSON.stringify(entry.draft) !== entry.baseline);
  const hasDraft = draft !== null;
  const rows = useMemo(() => draft?.Filas || [], [draft]);
  const row = rows[selected.row] || rows[0];
  const banner = row?.banners?.[selected.banner];
  const currentImage = device === 'desktop' ? banner?.imagen_desktop : device === 'tablet' ? banner?.imagen_tablet || banner?.imagen_desktop : banner?.imagen_mobile || banner?.imagen_tablet || banner?.imagen_desktop;
  const auth = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);
  const closePreview = useCallback(() => setShowPreview(false), []);
  const documents = [
    ...promotions.map(record => ({ key: record.documentId, document: source === record.documentId && draft ? draft : navigation.current.get(record.documentId)?.draft || record })),
    ...[...navigation.current.entries()].filter(([key, entry]) => key.startsWith('new-') && !entry.draft.documentId).map(([key, entry]) => ({ key, document: key === source && draft ? draft : entry.draft })),
  ].filter(entry => entry.document.seccion === area);

  function handleError(error) {
    if ([401, 403].includes(error.response?.status)) { localStorage.removeItem('admin_jwt'); setToken(''); }
    setError(error.response?.data?.error?.message || error.message || 'No se pudo completar la operación.');
  }
  function setInitial(value) {
    const copy = structuredCopy(value);
    baseline.current = JSON.stringify(copy);
    setDraft(copy); setHistory([copy]); setHistoryIndex(0); setSelected({ row: 0, banner: 0 });
  }
  function rememberCurrent() {
    if (draft && source) {
      navigation.current.set(source, { draft: structuredCopy(draft), baseline: baseline.current, history, historyIndex, selected, inspect });
      lastSource.current[draft.seccion] = source;
    }
  }
  function selectSource(key, nextInspect) {
    if (busy) return;
    if (key === source) { setInspect(nextInspect || inspect); setSelected({ ...selected }); return; }
    const cached = navigation.current.get(key);
    const record = cached?.draft || promotions.find(p => p.documentId === key);
    if (!record) return;
    rememberCurrent();
    setError(''); setMessage(''); setSource(key); setInspect(nextInspect || cached?.inspect || 'banner'); setArea(record.seccion);
    lastSource.current[record.seccion] = key;
    if (cached) {
      baseline.current = cached.baseline;
      setDraft(structuredCopy(cached.draft)); setHistory(cached.history); setHistoryIndex(cached.historyIndex); setSelected({ ...cached.selected });
    } else setInitial(normalized(record));
  }
  function selectArea(nextArea) {
    if (busy || nextArea === area) return;
    rememberCurrent();
    const saved = promotions.find(record => record.seccion === nextArea);
    const pending = [...navigation.current.entries()].find(([, entry]) => entry.draft.seccion === nextArea);
    const previousKey = lastSource.current[nextArea];
    if (previousKey && (navigation.current.has(previousKey) || promotions.some(record => record.documentId === previousKey))) selectSource(previousKey);
    else if (saved || pending) selectSource(pending?.[0] || saved.documentId);
    else { setSource(''); setDraft(null); setHistory([]); setHistoryIndex(0); setError(''); setMessage(''); }
    setArea(nextArea);
  }
  useEffect(() => {
    if (!token) return;
    let active = true;
    setLoading(true);
    axios.get(`${API}/api/banners-admin`, auth).then(response => {
      if (!active) return;
      const { promotions: records = [] } = response.data.data;
      setPromotions(records);
      navigation.current.clear();
      lastSource.current = {};
      if (records.length) { setArea(records[0].seccion); setSource(records[0].documentId); setInitial(normalized(records[0])); }
      else { setSource(''); setDraft(null); }
    }).catch(e => { if (active) handleError(e); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
    // Auth changes intentionally reload the document inventory.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);
  useEffect(() => {
    if (dirty && source) sessionStorage.setItem(`marybe-banner-draft:${source}`, JSON.stringify({ version: draft.updatedAt, draft }));
    const warn = event => { if (hasUnsaved) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty, hasUnsaved, source, draft]);
  useEffect(() => {
    if (!rows.length) return;
    const rowIndex = Math.min(selected.row, rows.length - 1);
    const bannerIndex = Math.min(selected.banner, Math.max(0, rows[rowIndex].banners.length - 1));
    if (rowIndex !== selected.row || bannerIndex !== selected.banner) setSelected({ row: rowIndex, banner: bannerIndex });
  }, [rows, selected]);
  function change(mutator) {
    if (!draft || busy) return;
    const copy = structuredCopy(draft); mutator(copy); setDraft(copy);
    const next = [...history.slice(0, historyIndex + 1), copy].slice(-60);
    setHistory(next); setHistoryIndex(next.length - 1); setMessage('');
  }
  const updateBanner = useCallback((values, rowIndex = selected.row, bannerIndex = selected.banner) => {
    change(copy => {
      const target = copy.Filas[rowIndex]?.banners[bannerIndex];
      if (target) Object.assign(target, values);
    });
    // Each call must capture the current undo history and selected banner.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, selected, history, historyIndex, busy]);
  const updateDesign = useCallback((values, rowIndex = selected.row, bannerIndex = selected.banner) => {
    change(copy => {
      const target = inspect === 'row' ? copy.Filas[rowIndex] : copy.Filas[rowIndex]?.banners[bannerIndex];
      if (target) target.diseno = { ...target.diseno, [device]: { ...target.diseno?.[device], ...values } };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, selected, inspect, device, history, historyIndex, busy]);
  useEffect(() => {
    const observer = new ResizeObserver(entries => setScale(Math.min(1, Math.max(.2, (entries[0].contentRect.width - 40) / DEVICE_WIDTHS[device]))));
    if (canvas.current) observer.observe(canvas.current);
    return () => observer.disconnect();
  }, [device, hasDraft]);
  useEffect(() => {
    const receive = event => {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow) return;
      const data = event.data;
      if (data?.type === 'MARYBE_BANNERS_READY') setReady(value => value + 1);
      if (data?.type === 'MARYBE_BANNERS_HEIGHT' && Number.isFinite(data.height)) setPreviewHeight(Math.min(16000, Math.max(180, data.height)));
      if (data?.type === 'MARYBE_BANNERS_SELECT' && rows[data.row]?.banners?.[data.banner]) { setSelected({ row: data.row, banner: data.banner }); setInspect('banner'); }
      if (data?.type === 'MARYBE_BANNERS_MOVE' && rows[data.row]?.banners?.[data.banner]) {
        change(copy => {
          const target = copy.Filas[data.row].banners[data.banner];
          target.diseno = { ...target.diseno, [device]: { ...target.diseno?.[device], textX: Math.max(0, Math.min(90, data.value.textX)), textY: Math.max(5, Math.min(95, data.value.textY)) } };
        });
      }
      if (data?.type === 'MARYBE_BANNERS_RESIZE' && rows[data.row]?.banners?.[data.banner] && Number.isFinite(data.value)) {
        change(copy => {
          const target = copy.Filas[data.row].banners[data.banner];
          target.diseno = { ...target.diseno, [device]: { ...target.diseno?.[device], width: Math.max(10, Math.min(100, Math.round(data.value))) } };
        });
      }
    };
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, draft, device, history, historyIndex]);
  useEffect(() => {
    const timer = setTimeout(() => frame.current?.contentWindow?.postMessage({ type: 'MARYBE_BANNERS_PREVIEW', payload: { rows, selected, device } }, window.location.origin), 60);
    return () => clearTimeout(timer);
  }, [rows, selected, device, ready]);

  async function login(event) {
    event.preventDefault(); setBusy(true); setError('');
    try { const response = await axios.post(`${API}/api/importacion-admin/login`, credentials); localStorage.setItem('admin_jwt', response.data.jwt); setToken(response.data.jwt); }
    catch (error) { handleError(error); } finally { setBusy(false); }
  }
  async function save(publish) {
    setBusy(true); setError(''); setMessage('');
    try {
      const response = await axios.put(`${API}/api/banners-admin/promociones/${draft.documentId || 'new'}`, { data: draft, version: draft.updatedAt, publish }, auth);
      const saved = response.data.data;
      navigation.current.delete(source);
      lastSource.current[saved.seccion] = saved.documentId;
      setPromotions(previous => [...previous.filter(p => p.documentId !== saved.documentId), saved]);
      setSource(saved.documentId); setInitial(normalized(saved));
      const rowIndex = Math.max(0, Math.min(selected.row, saved.Filas.length - 1));
      setSelected({ row: rowIndex, banner: Math.max(0, Math.min(selected.banner, saved.Filas[rowIndex].banners.length - 1)) });
      sessionStorage.removeItem(`marybe-banner-draft:${source}`);
      setMessage(publish ? 'Publicado. Los cambios ya están disponibles en Inicio al recargar.' : 'Borrador guardado. La web sigue mostrando la última publicación.');
    } catch (error) { handleError(error); } finally { setBusy(false); }
  }
  async function openLibrary() {
    setLibrary(true); setError('');
    try { const response = await axios.get(`${API}/api/banners-admin/media`, auth); setMedia(response.data.data || []); }
    catch (error) { handleError(error); }
  }
  function chooseMedia(file) { updateBanner({ [`imagen_${device === 'mobile' ? 'mobile' : device}`]: file }); setLibrary(null); }
  async function upload(file) {
    if (!file) return;
    setBusy(true);
    try {
      const data = new FormData(); data.append('files', file);
      const response = await axios.post(`${API}/api/banners-admin/upload`, data, auth);
      // Apply after upload without the busy guard swallowing the result.
      const copy = structuredCopy(draft); const target = copy.Filas[selected.row].banners[selected.banner];
      target[`imagen_${device === 'mobile' ? 'mobile' : device}`] = response.data.data[0];
      setDraft(copy); const next = [...history.slice(0, historyIndex + 1), copy]; setHistory(next); setHistoryIndex(next.length - 1); setLibrary(null);
    } catch (error) { handleError(error); } finally { setBusy(false); }
  }
  function createPromotion(value) {
    if (busy) return;
    rememberCurrent();
    const key = `new-${++newSectionId.current}`;
    const document = value || { titulo: 'Nueva sección de banners', seccion: area, Filas: [{ __component: 'layout.fila-1-columna', es_carrusel: false, diseno: { desktop: { columns: 1 }, mobile: { columns: 1 } }, banners: [newBanner()] }] };
    navigation.current.set(key, { draft: document, baseline: JSON.stringify(document), history: [document], historyIndex: 0, selected: { row: 0, banner: 0 } });
    setSource(key); setInspect('banner'); setInitial(document);
  }
  function selectElement(row, banner, mode) { setSelected({ row, banner }); setInspect(mode); }
  function addBanner(rowIndex) {
    if (busy) return;
    const index = rows[rowIndex].banners.length;
    change(copy => copy.Filas[rowIndex].banners.push(newBanner()));
    selectElement(rowIndex, index, 'banner');
  }
  function addDistribution() {
    const index = rows.length;
    change(copy => copy.Filas.push({ __component: 'layout.fila-1-columna', es_carrusel: false, diseno: { desktop: { columns: 1 }, mobile: { columns: 1 } }, banners: [newBanner()] }));
    selectElement(index, 0, 'row');
  }
  function structureAction(action, position) {
    const ri = position.row, bi = position.banner;
    if (action === 'rename-section' || action === 'rename-banner') {
      setInspect(action === 'rename-section' ? 'row' : 'banner');
      requestAnimationFrame(() => { const input = document.getElementById(action === 'rename-section' ? 'ba-section-name' : 'ba-banner-name'); input?.focus(); input?.select(); });
    }
    if (action === 'duplicate-section') createPromotion({ titulo: `${draft.titulo} (copia)`, seccion: area, Filas: rows.map(duplicateRow) });
    if (action === 'add-distribution') addDistribution();
    if (action === 'duplicate-distribution') { change(copy => copy.Filas.splice(ri + 1, 0, duplicateRow(rows[ri]))); selectElement(ri + 1, 0, 'row'); }
    if (action === 'up-distribution' || action === 'down-distribution') { moveRow(ri, action === 'up-distribution' ? -1 : 1); setInspect('row'); }
    if (action === 'hide-distribution') updateDesign({ hidden: !deviceDesign(rows[ri].diseno, device, {}).hidden }, ri);
    if (action === 'delete-distribution' && rows.length > 1) { change(copy => copy.Filas.splice(ri, 1)); selectElement(Math.max(0, ri - 1), 0, 'row'); }
    if (action === 'duplicate-banner') { change(copy => copy.Filas[ri].banners.splice(bi + 1, 0, { ...structuredCopy(rows[ri].banners[bi]), id: undefined })); selectElement(ri, bi + 1, 'banner'); }
    if (action === 'up-banner' || action === 'down-banner') {
      const destination = bi + (action === 'up-banner' ? -1 : 1);
      if (destination < 0 || destination >= rows[ri].banners.length) return;
      change(copy => { const list = copy.Filas[ri].banners; [list[bi], list[destination]] = [list[destination], list[bi]]; }); selectElement(ri, destination, 'banner');
    }
    if (action === 'hide-banner') updateBanner({ activo: rows[ri].banners[bi].activo === false }, ri, bi);
    if (action === 'delete-banner' && rows[ri].banners.length > 1) { change(copy => copy.Filas[ri].banners.splice(bi, 1)); selectElement(ri, Math.max(0, bi - 1), 'banner'); }
  }
  function moveRow(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;
    change(copy => { const [value] = copy.Filas.splice(index, 1); copy.Filas.splice(target, 0, value); }); setSelected({ row: target, banner: 0 });
  }
  function recover() {
    try {
      const cached = JSON.parse(sessionStorage.getItem(`marybe-banner-draft:${source}`) || 'null');
      if (!cached) { setMessage('No hay una copia local para esta sección.'); return; }
      if (cached.version !== draft.updatedAt) { setError('La copia local corresponde a una versión anterior. Recargá los datos actuales.'); return; }
      change(copy => { for (const key of Object.keys(copy)) delete copy[key]; Object.assign(copy, cached.draft); });
    } catch { setError('No se pudo recuperar la copia local.'); }
  }
  const target = inspect === 'row' ? row : banner;
  const values = deviceDesign(target?.diseno, device, inspect === 'row' ? { columns: TYPE_COLUMNS[row?.__component] || 1, gap: 16, padding: 0, margin: 0, width: 100, maxWidth: 1920, background: '#ffffff', hidden: false } : BANNER_DEFAULTS);
  const number = (key, label, min, max, suffix = 'px', step = 1) => <NumberControl key={key} label={label} value={values[key]} min={min} max={max} suffix={suffix} step={step} onChange={value => updateDesign({ [key]: value })} />;
  const color = (key, label) => <label className="ba-control ba-color" key={key}><span>{label}</span><input aria-label={label} type="color" value={values[key]} onChange={event => updateDesign({ [key]: event.target.value })} /><code>{values[key]}</code></label>;

  if (!token) return <main className="ba-login"><form onSubmit={login}><img src="/logo-marybe.png" alt="Marybe" /><p className="ba-eyebrow">ESTUDIO DE BANNERS</p><h1>Diseñá el próximo inicio.</h1><p>Ingresá con el acceso de administración de Marybe.</p><label>Email<input type="email" autoComplete="username" required value={credentials.identifier} onChange={e => setCredentials({ ...credentials, identifier: e.target.value })} /></label><label>Contraseña<input type="password" autoComplete="current-password" required value={credentials.password} onChange={e => setCredentials({ ...credentials, password: e.target.value })} /></label>{error && <p role="alert">{error}</p>}<button className="ba-primary" disabled={busy}>{busy ? 'Ingresando…' : 'Abrir editor'}</button><Link to="/inicio">Volver a la tienda</Link></form></main>;

  return <main className="ba-app" inert={showPreview}>
    {showPreview && draft && <BannerPreviewDialog rows={rows} title={draft.titulo} initialDevice={device} onClose={closePreview} />}
    <header className="ba-topbar">
      <div className="ba-brand"><img src="/logo-marybe.png" alt="Marybe" /><span>Editor de banners</span></div>
      <span className={`ba-status ${hasUnsaved ? 'ba-status--dirty' : ''}`}>{!draft?.documentId && draft ? '○ Sección nueva' : dirty ? '● Cambios sin guardar' : hasUnsaved ? '● Otros cambios pendientes' : '● Todo guardado'}</span>
      <div className="ba-top-actions">
        <details className="ba-top-more"><summary>Más opciones</summary><div><button onClick={recover} disabled={!draft || busy}>Recuperar copia</button><button disabled={busy} onClick={() => { if (!hasUnsaved || window.confirm('¿Salir con cambios sin guardar?')) { localStorage.removeItem('admin_jwt'); setToken(''); } }}>Salir</button></div></details>
        <button className="ba-preview-open" disabled={!draft || loading} onClick={() => setShowPreview(true)}>Vista previa</button>
        <button disabled={!draft || busy} onClick={() => save(false)}>Guardar borrador</button>
        <button className="ba-primary" disabled={!draft || busy} onClick={() => save(true)}>{busy ? 'Guardando…' : 'Publicar cambios'}</button>
      </div>
    </header>
    <div className="ba-locationbar"><div><p className="ba-eyebrow">TIENDA / EDITOR VISUAL</p><h1>Página de Inicio</h1></div><div className="ba-area-tabs" role="group" aria-label="Área de Inicio">{['Perfumería', 'Hogar'].map(value => <button key={value} disabled={busy || loading} aria-pressed={area === value} onClick={() => selectArea(value)}>{value}</button>)}</div><p>Banners principales de <strong>{area}</strong></p></div>
    {(error || message) && <div className={`ba-notice ${error ? 'ba-notice--error' : ''}`} role={error ? 'alert' : 'status'}>{error || message}<button onClick={() => { setError(''); setMessage(''); }} aria-label="Cerrar mensaje">×</button></div>}
    <div className="ba-workspace">
      <BannerStructure documents={documents} source={source} selected={selected} inspect={inspect} device={device} busy={busy} loading={loading} onSourceSelect={selectSource} onSelect={selectElement} onAction={structureAction} onCreate={() => createPromotion()} onAddBanner={addBanner} onMoveDistribution={moveRow} />

      <section className="ba-stage"><div className="ba-preview-toolbar"><div className="ba-device-tabs">{DEVICES.map(value => <button key={value} className={device === value ? 'is-active' : ''} onClick={() => setDevice(value)}>{NAMES[value]}</button>)}</div><span>{DEVICE_WIDTHS[device]} px · {Math.round(scale * 100)}%</span><div className="ba-undo"><button aria-label="Deshacer" disabled={historyIndex <= 0 || busy} onClick={() => { setHistoryIndex(historyIndex - 1); setDraft(structuredCopy(history[historyIndex - 1])); }}>↶</button><button aria-label="Rehacer" disabled={historyIndex >= history.length - 1 || busy} onClick={() => { setHistoryIndex(historyIndex + 1); setDraft(structuredCopy(history[historyIndex + 1])); }}>↷</button></div></div>
        <div className="ba-canvas" ref={canvas}>{draft ? <><div className="ba-canvas-caption">VISTA PREVIA · {draft.titulo}</div><div className="ba-frame-shell" style={{ width: DEVICE_WIDTHS[device] * scale, height: previewHeight * scale }}><iframe title="Vista previa de banners" src="/banners-preview" ref={frame} onLoad={() => setReady(value => value + 1)} style={{ width: DEVICE_WIDTHS[device], height: previewHeight, transform: `scale(${scale})` }} /></div><p className="ba-canvas-tip">Tu vista previa es privada. Publicá cuando esté lista.</p></> : <div className="ba-empty"><h2>Creá tu primera sección de banners</h2><p>Agregá una sección en {area} y empezá por elegir sus imágenes.</p><button className="ba-primary" onClick={() => createPromotion()}>Crear sección</button></div>}</div>
      </section>

      <aside className="ba-inspector"><div className="ba-inspector-title"><p className="ba-eyebrow">PERSONALIZAR</p><h2>{inspect === 'row' ? draft?.titulo || 'Sección de banners' : banner?.titulo || 'Elegí un banner'}</h2><span>{NAMES[device]} · {DEVICE_WIDTHS[device]} px</span><p className="ba-device-help">{device === 'desktop' ? 'Diseño base. Tablet y celular heredan estos ajustes hasta personalizarlos.' : `Los ajustes de tamaño y posición se aplican solo a ${NAMES[device].toLowerCase()}.`}</p></div>
        {draft && <div className="ba-inspector-tabs"><button className={inspect === 'banner' ? 'is-active' : ''} onClick={() => setInspect('banner')}>Banner</button><button className={inspect === 'row' ? 'is-active' : ''} onClick={() => setInspect('row')}>Distribución</button></div>}
        {target && <>
          {inspect === 'banner' && <p className="ba-inspector-help">Imagen y diseño: por dispositivo. Textos, enlace y estado activo: compartidos.</p>}
          {inspect === 'row' && <p className="ba-inspector-help">Organizá cómo se presentan los banners en este dispositivo. Podés editar cada imagen desde la estructura.</p>}
          {inspect === 'row' ? <><label>Nombre de la sección<input id="ba-section-name" value={draft.titulo} maxLength={200} onChange={e => change(copy => { copy.titulo = e.target.value; })} /></label>{rows.length > 1 && <label>Distribución activa<select value={selected.row} onChange={e => selectElement(Number(e.target.value), 0, 'row')}>{rows.map((item, index) => <option key={index} value={index}>Distribución {index + 1}</option>)}</select></label>}<details open><summary>Distribución de los banners</summary><label>Tipo de distribución<select value={row.__component} onChange={e => change(copy => { copy.Filas[selected.row].__component = e.target.value; copy.Filas[selected.row].diseno = { ...copy.Filas[selected.row].diseno, desktop: { ...copy.Filas[selected.row].diseno?.desktop, columns: TYPE_COLUMNS[e.target.value] } }; })}>{Object.entries(ROW_TYPES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><label>Tipo de presentación<select value={row.es_carrusel ? 'carousel' : 'grid'} onChange={e => change(copy => { copy.Filas[selected.row].es_carrusel = e.target.value === 'carousel'; })}><option value="grid">Grilla</option><option value="carousel">Carrusel</option></select></label>{number('columns', 'Columnas', 1, 4, '')}<NumberControl label="Alto de los banners" value={deviceDesign(row.banners[0]?.diseno, device).height} min={0} max={1600} onChange={height => change(copy => { copy.Filas[selected.row].banners.forEach(item => { item.diseno = { ...item.diseno, [device]: { ...item.diseno?.[device], height } }; }); })} /><small className="ba-hint">Aplica a todos los banners de esta distribución, solo en {NAMES[device].toLowerCase()}. Usá 0 para el alto automático.</small>{number('gap', 'Separación', 0, 100)}{number('width', 'Ancho de distribución', 10, 100, '%')}{number('maxWidth', 'Ancho máximo', 320, 2560)}{number('padding', 'Espacio interior', 0, 160)}{number('margin', 'Margen vertical', 0, 200)}{color('background', 'Fondo de distribución')}</details><button className="ba-add-row" onClick={addDistribution} disabled={busy}>＋ Agregar distribución</button></> : <>
            <details open><summary>1. Imagen y contenido</summary><label>Nombre del banner / título<input id="ba-banner-name" value={banner.titulo || ''} maxLength={200} onChange={e => updateBanner({ titulo: e.target.value })} /></label><div className="ba-image-current">{imageUrl(currentImage) ? <img src={imageUrl(currentImage)} alt="Imagen seleccionada" /> : <span>Sin imagen</span>}</div><button className="ba-library-button" onClick={openLibrary}>Elegir imagen · {NAMES[device]}</button><small className="ba-hint">Tablet y celular heredan la imagen anterior si no se especifica otra.</small>{device !== 'desktop' && <button onClick={() => updateBanner({ [`imagen_${device}`]: null })}>Usar imagen heredada</button>}
              <label className="ba-check"><input type="checkbox" checked={banner.mostrar_texto || false} onChange={e => updateBanner({ mostrar_texto: e.target.checked })} />Mostrar textos sobre la imagen</label>{banner.mostrar_texto && <><label>Descripción<textarea rows={3} maxLength={2000} value={banner.subtitulo || ''} onChange={e => updateBanner({ subtitulo: e.target.value })} /></label><label>Texto del botón<input maxLength={100} value={banner.texto_boton || ''} onChange={e => updateBanner({ texto_boton: e.target.value })} /></label></>}<label>Enlace<input placeholder="/tienda o https://…" maxLength={2048} value={banner.enlace || ''} onChange={e => updateBanner({ enlace: e.target.value })} /></label>
              <label className="ba-check"><input type="checkbox" checked={banner.activo !== false} onChange={e => updateBanner({ activo: e.target.checked })} />Banner activo</label>
            </details>
            <details open><summary>2. Tamaño y encuadre</summary>{number('height', 'Alto', 0, 1600)}<small className="ba-hint">Alto en píxeles para este dispositivo. Usá 0 para conservar la proporción original.</small>{number('width', 'Ancho del banner', 10, 100, '%')}{number('radius', 'Bordes redondeados', 0, 160)}<label>Ajuste de imagen<select value={values.fit} onChange={e => updateDesign({ fit: e.target.value })}><option value="contain">Completa (sin recortar)</option><option value="cover">Cubrir (recortar bordes)</option><option value="fill">Estirar</option></select></label>{number('positionX', 'Encuadre horizontal', 0, 100, '%')}{number('positionY', 'Encuadre vertical', 0, 100, '%')}{color('background', 'Fondo')}{number('overlay', 'Oscurecer imagen', 0, 1, '', .05)}{row?.__component === 'layout.fila-mixta' && <NumberControl label="Porcentaje en distribución libre" suffix="%" min={1} max={100} value={banner.ancho_porcentaje || 100} onChange={value => updateBanner({ ancho_porcentaje: value })} />}</details>
            {banner.mostrar_texto && <details open><summary>3. Texto, botón y posición</summary>{number('fontSize', 'Tamaño del título', 12, 150)}{number('subtitleSize', 'Tamaño descripción', 10, 60)}{number('textX', 'Posición horizontal', 0, 90, '%')}{number('textY', 'Posición vertical', 5, 95, '%')}{number('textWidth', 'Ancho del texto', 10, 100, '%')}{number('padding', 'Espacio interior del texto', 0, 160)}<label>Alineación<select value={values.align} onChange={e => updateDesign({ align: e.target.value })}><option value="left">Izquierda</option><option value="center">Centro</option><option value="right">Derecha</option></select></label>{color('color', 'Color del texto')}{color('buttonBackground', 'Fondo del botón')}{color('buttonColor', 'Texto del botón')}{number('buttonSize', 'Tamaño del botón', 10, 40)}</details>}
          {inspect === 'banner' && <details><summary>Más ajustes: zoom y tipografía</summary>{number('imageScale', 'Zoom de imagen', 25, 200, '%')}{number('buttonRadius', 'Bordes del botón', 0, 100)}<label>Tipografía del título<select value={values.fontFamily} onChange={e => updateDesign({ fontFamily: e.target.value })}>{['Inter', 'Brygada 1918', 'Arial', 'Georgia'].map(font => <option key={font}>{font}</option>)}</select></label>{number('fontWeight', 'Grosor del título', 300, 900, '', 100)}{number('lineHeight', 'Interlineado del título', .8, 2, '', .05)}{number('letterSpacing', 'Espaciado de letras', -2, 8, 'px', .1)}</details>}
            <details><summary>Plantillas rápidas</summary><div className="ba-presets"><button onClick={() => updateBanner({ mostrar_texto: false, diseno: { desktop: { ...BANNER_DEFAULTS, fit: 'cover' }, mobile: { height: 280 } } })}>Solo imagen</button><button onClick={() => updateBanner({ mostrar_texto: true, texto_boton: banner.texto_boton || 'Descubrir', diseno: { desktop: { ...BANNER_DEFAULTS, fit: 'cover', overlay: .35 }, mobile: { height: 340, fontSize: 30, textWidth: 90, textX: 2 } } })}>Campaña</button><button onClick={() => updateBanner({ mostrar_texto: true, diseno: { desktop: { ...BANNER_DEFAULTS, color: '#560203', background: '#f5eee6', textWidth: 50, positionX: 90 }, mobile: { height: 360, fontSize: 28, textWidth: 90 } } })}>Editorial</button></div></details>
          </>}
          <label className="ba-check ba-device-hidden"><input type="checkbox" checked={values.hidden || false} onChange={e => updateDesign({ hidden: e.target.checked })} />Ocultar en {NAMES[device].toLowerCase()}</label>
          <button className="ba-reset-device" onClick={() => change(copy => { const item = inspect === 'row' ? copy.Filas[selected.row] : copy.Filas[selected.row].banners[selected.banner]; if (item?.diseno) delete item.diseno[device]; })}>Restablecer ajustes de {NAMES[device].toLowerCase()}</button>
        </>}
      </aside>
    </div>
    {library && <div className="ba-modal-backdrop" onClick={() => !busy && setLibrary(null)}><section className="ba-media-modal" role="dialog" aria-modal="true" aria-label="Biblioteca de imágenes" onClick={e => e.stopPropagation()}><header><div><p className="ba-eyebrow">BIBLIOTECA MARYBE</p><h2>Elegí tu próxima imagen</h2></div><button aria-label="Cerrar biblioteca" disabled={busy} onClick={() => setLibrary(null)}>×</button></header>{error && <p role="alert" style={{ color: '#a53a37' }}>{error}</p>}<div className="ba-media-toolbar"><input aria-label="Buscar imagen" placeholder="Buscar en las últimas 200 imágenes…" value={mediaSearch} onChange={e => setMediaSearch(e.target.value)} /><label className="ba-upload">{busy ? 'Subiendo…' : '＋ Subir imagen'}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" disabled={busy} onChange={e => upload(e.target.files[0])} /></label></div><p>Imagen para {NAMES[device].toLowerCase()} · JPG, PNG, WebP, GIF o AVIF · máximo 10 MB</p><div className="ba-media-grid">{media.filter(file => file.name.toLowerCase().includes(mediaSearch.toLowerCase())).map(file => <button key={file.id} disabled={busy} onClick={() => chooseMedia(file)}><img src={imageUrl(file, API)} alt={file.name} loading="lazy" /><strong>{file.name}</strong><small>{file.width} × {file.height}</small></button>)}</div></section></div>}
  </main>;
}
