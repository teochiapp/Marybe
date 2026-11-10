import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import axios from 'axios';
import { BANNER_DEFAULTS, DEVICES, DEVICE_WIDTHS, designOrigin, deviceDesign, duplicateRow, imageUrl, newBanner, structuredCopy } from '../../utils/bannerDesign';
import './BannersAdmin.css';
import './ImportacionAdmin.css';
import BannerPreviewDialog from '../../components/banners/BannerPreviewDialog';
import BannerStructure from '../../components/banners/BannerStructure';
import BannerRowInspector from '../../components/banners/BannerRowInspector';

const API = process.env.REACT_APP_STRAPI_URL || process.env.REACT_APP_API_URL || 'http://localhost:1337';
const NAMES = { desktop: 'Computadora', tablet: 'Tablet', mobile: 'Celular' };
const TYPE_COLUMNS = { 'layout.fila-1-columna': 1, 'layout.fila-2-columnas': 2, 'layout.fila-4-columnas': 4, 'layout.fila-mixta': 1 };
function normalized(document) {
  return { ...document, Filas: (document.Filas || []).map(row => ({ ...row, diseno: row.diseno || {}, banners: row.banners || [] })) };
}
function savedSelection(key) {
  try {
    const value = JSON.parse(sessionStorage.getItem(`marybe-banner-selection:${key}`) || 'null');
    if (!value || !Number.isInteger(value.row) || !Number.isInteger(value.banner) || value.row < 0 || value.banner < 0) return null;
    return { selected: { row: value.row, banner: value.banner }, inspect: value.inspect === 'banner' ? 'banner' : 'row' };
  } catch { return null; }
}
function Origin({ origin, onReset, label }) {
  if (!origin) return null;
  return <div className="ba-field-origin"><span>{origin.label}</span>{origin.own && <button type="button" aria-label={`Volver a heredar ${label}`} onClick={onReset}>Volver a heredar</button>}</div>;
}
function NumberControl({ label, value, min = 0, max = 100, step = 1, onChange, suffix = 'px', origin, onReset }) {
  return <div><label className="ba-control"><span>{label} <small>{suffix}</small></span><div className="ba-range"><input aria-label={`${label} deslizador`} type="range" min={min} max={max} step={step} value={value ?? min} onChange={e => onChange(Number(e.target.value))} /><input aria-label={label} type="number" min={min} max={max} step={step} value={value ?? min} onChange={e => { if (e.target.value !== '') onChange(Math.max(min, Math.min(max, Number(e.target.value)))); }} /></div></label><Origin origin={origin} onReset={onReset} label={label} /></div>;
}
export default function BannersAdmin({ onBack, onLogout } = {}) {
  const [token, setToken] = useState(() => localStorage.getItem('admin_jwt') || '');
  const [credentials, setCredentials] = useState({ identifier: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [promotions, setPromotions] = useState([]);
  const [area, setArea] = useState('Perfumería');
  const [source, setSource] = useState('');
  const [draft, setDraft] = useState(null);
  const [selected, setSelected] = useState({ row: 0, banner: 0 });
  const [device, setDevice] = useState('desktop');
  const [inspect, setInspect] = useState('row');
  const [focalMode, setFocalMode] = useState(false);
  const [openBlocks, setOpenBlocks] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('marybe-banner-inspector-blocks') || '{}'); } catch { return {}; }
  });
  function setBlock(name, open) {
    setOpenBlocks(previous => {
      const next = { ...previous, [name]: open };
      try { sessionStorage.setItem('marybe-banner-inspector-blocks', JSON.stringify(next)); } catch { /* La edición sigue disponible sin almacenamiento de sesión. */ }
      return next;
    });
  }
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
  function setInitial(value, selection = { row: 0, banner: 0 }) {
    const copy = structuredCopy(value);
    baseline.current = JSON.stringify(copy);
    setDraft(copy); setHistory([copy]); setHistoryIndex(0); setSelected(selection);
  }
  function rememberCurrent() {
    if (draft && source) {
      navigation.current.set(source, { draft: structuredCopy(draft), baseline: baseline.current, history, historyIndex, selected, inspect });
      lastSource.current[draft.seccion] = source;
    }
  }
  function selectSource(key, nextInspect) {
    if (busy) return;
    setFocalMode(false);
    if (key === source) { setInspect(nextInspect || inspect); setSelected({ ...selected }); return; }
    const cached = navigation.current.get(key);
    const record = cached?.draft || promotions.find(p => p.documentId === key);
    if (!record) return;
    rememberCurrent();
    const saved = savedSelection(key);
    setError(''); setMessage(''); setSource(key); setInspect(nextInspect || cached?.inspect || saved?.inspect || 'row'); setArea(record.seccion);
    lastSource.current[record.seccion] = key;
    if (cached) {
      baseline.current = cached.baseline;
      setDraft(structuredCopy(cached.draft)); setHistory(cached.history); setHistoryIndex(cached.historyIndex); setSelected({ ...cached.selected });
    } else setInitial(normalized(record), saved?.selected);
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
      if (records.length) {
        const lastKey = sessionStorage.getItem('marybe-banner-last-source');
        const record = records.find(item => item.documentId === lastKey) || records[0];
        const saved = savedSelection(record.documentId);
        setArea(record.seccion); setSource(record.documentId); setInspect(saved?.inspect || 'row'); setInitial(normalized(record), saved?.selected);
      }
      else { setSource(''); setDraft(null); }
    }).catch(e => { if (active) handleError(e); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
    // Auth changes intentionally reload the document inventory.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);
  useEffect(() => {
    if (!source || !draft) return;
    if (draft.documentId && draft.documentId !== source) return;
    sessionStorage.setItem(`marybe-banner-selection:${source}`, JSON.stringify({ ...selected, inspect }));
    if (draft.documentId) sessionStorage.setItem('marybe-banner-last-source', source);
  }, [source, draft, selected, inspect]);
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
      if (data?.type === 'MARYBE_BANNERS_SELECT' && rows[data.row]?.banners?.[data.banner]) { setSelected({ row: data.row, banner: data.banner }); setInspect('banner'); setFocalMode(false); }
      if (data?.type === 'MARYBE_BANNERS_EXIT_FOCAL') setFocalMode(false);
      if (data?.type === 'MARYBE_BANNERS_FOCAL' && rows[data.row]?.banners?.[data.banner] && Number.isFinite(data.value?.positionX) && Number.isFinite(data.value?.positionY)) {
        change(copy => {
          const item = copy.Filas[data.row].banners[data.banner];
          item.diseno = { ...item.diseno, [device]: { ...item.diseno?.[device], positionX: Math.max(0, Math.min(100, data.value.positionX)), positionY: Math.max(0, Math.min(100, data.value.positionY)) } };
        });
      }
      if (data?.type === 'MARYBE_BANNERS_MOVE' && rows[data.row]?.banners?.[data.banner]) {
        change(copy => {
          const target = copy.Filas[data.row].banners[data.banner];
          target.diseno = { ...target.diseno, [device]: { ...target.diseno?.[device], textX: Math.max(0, Math.min(90, data.value.textX)), textY: Math.max(5, Math.min(95, data.value.textY)) } };
        });
      }
      if (data?.type === 'MARYBE_BANNERS_REORDER' && data.source === source) reorderBanner(data.row, data.from, data.to);
      if (data?.type === 'MARYBE_BANNERS_RESIZE' && Number.isInteger(data.row) && Number.isInteger(data.banner) && rows[data.row]?.banners?.[data.banner] && Number.isFinite(data.value)) {
        const isHeight = data.dimension === 'height';
        if (isHeight && (data.source !== source || data.device !== device)) return;
        const key = isHeight ? 'height' : 'width';
        const value = Math.max(isHeight ? 80 : 10, Math.min(isHeight ? 1600 : 100, Math.round(data.value)));
        change(copy => {
          const target = copy.Filas[data.row].banners[data.banner];
          target.diseno = { ...target.diseno, [device]: { ...target.diseno?.[device], [key]: value } };
        });
      }
    };
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, draft, device, source, history, historyIndex, busy]);
  useEffect(() => {
    const timer = setTimeout(() => frame.current?.contentWindow?.postMessage({ type: 'MARYBE_BANNERS_PREVIEW', payload: { rows, selected, device, focalMode, source } }, window.location.origin), 60);
    return () => clearTimeout(timer);
  }, [rows, selected, device, ready, focalMode, source]);
  useEffect(() => {
    if (!focalMode) return undefined;
    const keyboard = event => { if (event.key === 'Escape') setFocalMode(false); };
    window.addEventListener('keydown', keyboard);
    return () => window.removeEventListener('keydown', keyboard);
  }, [focalMode]);

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
    setSource(key); setInspect('row'); setInitial(document);
  }
  async function deleteSection(position) {
    const entry = documents.find(item => item.key === position.key);
    const target = entry?.document || draft;
    if (!target || busy || !window.confirm(`¿Eliminar la sección "${target.titulo || 'sin nombre'}"? Esta acción no se puede deshacer.`)) return;
    setBusy(true); setError(''); setMessage('');
    try {
      if (target.documentId) await axios.delete(`${API}/api/banners-admin/promociones/${target.documentId}`, { ...auth, data: { version: target.updatedAt } });
      navigation.current.delete(position.key);
      if (target.documentId) setPromotions(previous => previous.filter(item => item.documentId !== target.documentId));
      const next = documents.find(item => item.key !== position.key);
      if (!next) {
        setSource(''); setDraft(null); setHistory([]); setHistoryIndex(0); setSelected({ row: 0, banner: 0 }); setInspect('row');
      } else {
        const cached = navigation.current.get(next.key);
        const nextDraft = structuredCopy(cached?.draft || normalized(next.document));
        setSource(next.key); setArea(nextDraft.seccion); setInspect(cached?.inspect || 'row');
        baseline.current = cached?.baseline || JSON.stringify(nextDraft);
        setDraft(nextDraft); setHistory(cached?.history || [nextDraft]); setHistoryIndex(cached?.historyIndex || 0); setSelected(cached?.selected || { row: 0, banner: 0 });
      }
      setMessage('Sección eliminada.');
    } catch (error) { handleError(error); } finally { setBusy(false); }
  }
  function selectElement(row, banner, mode) { setSelected({ row, banner }); setInspect(mode); setFocalMode(false); }
  function reorderBanner(row, from, to) {
    if (busy || !Number.isInteger(row) || !Number.isInteger(from) || !Number.isInteger(to) || from === to) return;
    const banners = rows[row]?.banners;
    if (!banners?.[from] || !banners[to]) return;
    change(copy => {
      const list = copy.Filas[row].banners;
      const [banner] = list.splice(from, 1);
      list.splice(to, 0, banner);
    });
    selectElement(row, to, 'banner');
  }
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
      if (action === 'rename-banner' && !rows[ri]?.banners?.[bi]?.mostrar_texto) setBlock('more', true);
      requestAnimationFrame(() => { const input = document.getElementById(action === 'rename-section' ? 'ba-section-name' : 'ba-banner-name'); input?.focus(); input?.select(); });
    }
    if (action === 'duplicate-section') createPromotion({ titulo: `${draft.titulo} (copia)`, seccion: area, Filas: rows.map(duplicateRow) });
    if (action === 'delete-section') deleteSection(position);
    if (action === 'add-distribution') addDistribution();
    if (action === 'duplicate-distribution') { change(copy => copy.Filas.splice(ri + 1, 0, duplicateRow(rows[ri]))); selectElement(ri + 1, 0, 'row'); }
    if (action === 'up-distribution' || action === 'down-distribution') { moveRow(ri, action === 'up-distribution' ? -1 : 1); setInspect('row'); }
    if (action === 'hide-distribution') updateDesign({ hidden: !deviceDesign(rows[ri].diseno, device, {}).hidden }, ri);
    if (action === 'delete-distribution' && rows.length > 1) { change(copy => copy.Filas.splice(ri, 1)); selectElement(Math.max(0, ri - 1), 0, 'row'); }
    if (action === 'duplicate-banner') { change(copy => copy.Filas[ri].banners.splice(bi + 1, 0, { ...structuredCopy(rows[ri].banners[bi]), id: undefined })); selectElement(ri, bi + 1, 'banner'); }
    if (action === 'up-banner' || action === 'down-banner') reorderBanner(ri, bi, bi + (action === 'up-banner' ? -1 : 1));
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
  const resetField = key => change(copy => {
    const item = inspect === 'row' ? copy.Filas[selected.row] : copy.Filas[selected.row].banners[selected.banner];
    if (item?.diseno?.[device]) delete item.diseno[device][key];
  });
  const origin = (key, label) => <Origin origin={designOrigin(target?.diseno, device, key)} label={label} onReset={() => resetField(key)} />;
  const number = (key, label, min, max, suffix = 'px', step = 1) => <NumberControl key={key} label={label} value={values[key]} min={min} max={max} suffix={suffix} step={step} origin={designOrigin(target?.diseno, device, key)} onReset={() => resetField(key)} onChange={value => updateDesign({ [key]: value })} />;
  const color = (key, label) => <div key={key}><label className="ba-control ba-color"><span>{label}</span><input aria-label={label} type="color" value={values[key]} onChange={event => updateDesign({ [key]: event.target.value })} /><code>{values[key]}</code></label>{origin(key, label)}</div>;

  if (!token) return <main className="ia-wrapper">
    <div className="ia-bg-particles">{[...Array(12)].map((_, index) => <div key={index} className={`ia-particle ia-particle--${index + 1}`} />)}</div>
    <section className="ia-login-card" aria-labelledby="banners-login-title">
      <div className="ia-login-brand">
        <div className="ia-brand-icon">
          <svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M24 4L44 14V34L24 44L4 34V14L24 4Z" stroke="currentColor" strokeWidth="2" /><path d="M24 12L36 18V30L24 36L12 30V18L24 12Z" fill="currentColor" opacity=".2" /><path d="M24 20L30 23V29L24 32L18 29V23L24 20Z" fill="currentColor" /></svg>
        </div>
        <h1 id="banners-login-title" className="ia-brand-title">Marybe</h1>
        <p className="ia-brand-sub">Panel de Banners</p>
      </div>
      <form className="ia-login-form" onSubmit={login} noValidate>
        <div className="ia-field"><label htmlFor="banners-admin-email" className="ia-label">Email administrador</label><div className="ia-input-wrap"><span className="ia-input-icon" aria-hidden="true"><svg viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg></span><input id="banners-admin-email" type="email" className="ia-input" placeholder="admin@marybe.com" autoComplete="email" required value={credentials.identifier} onChange={event => setCredentials({ ...credentials, identifier: event.target.value })} /></div></div>
        <div className="ia-field"><label htmlFor="banners-admin-password" className="ia-label">Contraseña</label><div className="ia-input-wrap"><span className="ia-input-icon" aria-hidden="true"><svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a7 7 0 0114 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg></span><input id="banners-admin-password" type={showPassword ? 'text' : 'password'} className="ia-input" placeholder="••••••••••••" autoComplete="current-password" required value={credentials.password} onChange={event => setCredentials({ ...credentials, password: event.target.value })} /><button type="button" className="ia-show-pass" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>{showPassword ? '◉' : '◌'}</button></div></div>
        {error && <div className="ia-alert ia-alert--error" role="alert">{error}</div>}
        <button id="btn-login-banners" type="submit" className="ia-btn ia-btn--primary" disabled={busy || !credentials.identifier || !credentials.password}>{busy ? <><span className="ia-spinner" aria-hidden="true" /> Iniciando sesión...</> : 'Iniciar sesión'}</button>
      </form>
      <p className="ia-login-hint">Acceso restringido · Solo administradores</p>
    </section>
  </main>;

  return <main className="ba-app" inert={showPreview}>
    {showPreview && draft && <BannerPreviewDialog rows={rows} title={draft.titulo} initialDevice={device} onClose={closePreview} />}
    <header className="ba-topbar">
      {onBack && <button type="button" className="ba-back" disabled={busy} onClick={() => { if (!hasUnsaved || window.confirm('¿Volver al Editor de Inicio con cambios sin guardar?')) onBack(); }}>← Editor de Inicio</button>}
      <div className="ba-brand"><img src="/logo-marybe.png" alt="Marybe" width="629" height="168" /><span>Editor de banners</span></div>
      <span className={`ba-status ${hasUnsaved ? 'ba-status--dirty' : ''}`}>{!draft?.documentId && draft ? '○ Sección nueva' : dirty ? '● Cambios pendientes' : hasUnsaved ? '● Otros cambios pendientes' : draft ? '● Borrador guardado' : ''}</span>
      <div className="ba-top-actions">
        <details className="ba-top-more"><summary>Más opciones</summary><div><button onClick={recover} disabled={!draft || busy}>Recuperar copia</button><button disabled={busy} onClick={() => { if (!hasUnsaved || window.confirm('¿Salir con cambios sin guardar?')) { localStorage.removeItem('admin_jwt'); setToken(''); onLogout?.(); } }}>Salir</button></div></details>
        <button className="ba-preview-open" disabled={!draft || loading} onClick={() => setShowPreview(true)}>Vista previa</button>
        <button disabled={!draft || busy} onClick={() => save(false)}>Guardar borrador</button>
        <button className="ba-primary" disabled={!draft || busy} onClick={() => save(true)}>{busy ? 'Guardando…' : 'Publicar en la tienda'}</button>
      </div>
    </header>
    <div className="ba-locationbar"><div><p className="ba-eyebrow">TIENDA / EDITOR VISUAL</p><h1>Página de Inicio</h1></div><div className="ba-area-tabs" role="group" aria-label="Área de Inicio">{['Perfumería', 'Hogar'].map(value => <button key={value} disabled={busy || loading} aria-pressed={area === value} onClick={() => selectArea(value)}>{value}</button>)}</div><p>Banners principales de <strong>{area}</strong></p></div>
    {(error || message) && <div className={`ba-notice ${error ? 'ba-notice--error' : ''}`} role={error ? 'alert' : 'status'}>{error || message}<button onClick={() => { setError(''); setMessage(''); }} aria-label="Cerrar mensaje">×</button></div>}
    <div className="ba-workspace">
      <BannerStructure documents={documents} source={source} selected={selected} inspect={inspect} device={device} busy={busy} loading={loading} onSourceSelect={selectSource} onSelect={selectElement} onAction={structureAction} onCreate={() => createPromotion()} onAddBanner={addBanner} onMoveDistribution={moveRow} />

      <section className="ba-stage"><div className="ba-preview-toolbar"><div className="ba-device-tabs">{DEVICES.map(value => <button key={value} className={device === value ? 'is-active' : ''} onClick={() => setDevice(value)}>{NAMES[value]}</button>)}</div><span>{DEVICE_WIDTHS[device]} px · {Math.round(scale * 100)}%</span><div className="ba-undo"><button aria-label="Deshacer" disabled={historyIndex <= 0 || busy} onClick={() => { setHistoryIndex(historyIndex - 1); setDraft(structuredCopy(history[historyIndex - 1])); }}>↶</button><button aria-label="Rehacer" disabled={historyIndex >= history.length - 1 || busy} onClick={() => { setHistoryIndex(historyIndex + 1); setDraft(structuredCopy(history[historyIndex + 1])); }}>↷</button></div></div>
        <div className="ba-canvas" ref={canvas}>{draft ? <><div className="ba-canvas-caption">VISTA PREVIA · {draft.titulo}</div><div className="ba-frame-shell" style={{ width: DEVICE_WIDTHS[device] * scale, height: previewHeight * scale }}><iframe title="Vista previa de banners" src="/banners-preview" ref={frame} onLoad={() => setReady(value => value + 1)} style={{ width: DEVICE_WIDTHS[device], height: previewHeight, transform: `scale(${scale})` }} /></div><p className="ba-canvas-tip">Tu vista previa es privada. Publicá cuando esté lista.</p></> : <div className="ba-empty"><h2>Creá tu primera sección de banners</h2><p>Agregá una sección en {area} y empezá por elegir sus imágenes.</p><button className="ba-primary" onClick={() => createPromotion()}>Crear sección</button></div>}</div>
      </section>

      <aside className="ba-inspector"><div className="ba-inspector-title"><p className="ba-eyebrow">PERSONALIZAR</p><h2>{inspect === 'row' ? draft?.titulo || 'Sección de banners' : banner?.titulo || 'Elegí un banner'}</h2>{draft && <p>Distribución {selected.row + 1} · Banner {selected.banner + 1}</p>}<span>{NAMES[device]} · {DEVICE_WIDTHS[device]} px</span><p className="ba-device-help">{device === 'desktop' ? 'Diseño base. Tablet y celular heredan estos ajustes hasta personalizarlos.' : `Los ajustes de tamaño y posición se aplican solo a ${NAMES[device].toLowerCase()}.`}</p></div>
        {draft && <div className="ba-inspector-tabs"><button aria-label="Distribución" className={inspect === 'row' ? 'is-active' : ''} onClick={() => { setInspect('row'); setFocalMode(false); }}>1. Distribución</button><button aria-label="Banner" className={inspect === 'banner' ? 'is-active' : ''} onClick={() => setInspect('banner')}>2. Banner</button></div>}
        {target && <>
          {inspect === 'banner' && <p className="ba-inspector-help">Imagen y diseño: por dispositivo. Textos, enlace y estado activo: compartidos.</p>}
          {inspect === 'row' && <p className="ba-inspector-help">Organizá cómo se presentan los banners en este dispositivo. Podés editar cada imagen desde la estructura.</p>}
          {inspect === 'row' ? <BannerRowInspector draft={draft} row={row} rows={rows} selected={selected} device={device} deviceName={NAMES[device]} values={values} busy={busy} change={change} selectElement={selectElement} addBanner={addBanner} addDistribution={addDistribution} updateDesign={updateDesign} number={number} color={color} origin={origin} NumberControl={NumberControl} /> : <>
            <div className="ba-image-controls">
              <h3>Imagen · {NAMES[device]}</h3>
              <div className="ba-image-current">{imageUrl(currentImage) ? <img src={imageUrl(currentImage)} alt="Imagen seleccionada" /> : <span>Sin imagen</span>}</div>
              <div className="ba-image-actions"><button className="ba-library-button" onClick={openLibrary}>Cambiar imagen · {NAMES[device]}</button><button type="button" aria-pressed={focalMode} onClick={() => setFocalMode(value => !value)}>{focalMode ? 'Terminar encuadre' : 'Editar encuadre'}</button></div>
              {focalMode && <p className="ba-inspector-help">Arrastrá la imagen o hacé clic para marcar el punto focal. Usá Escape para terminar.</p>}
              <small className="ba-hint">Tablet y celular heredan la imagen anterior si no se especifica otra.</small>{device !== 'desktop' && <button onClick={() => updateBanner({ [`imagen_${device}`]: null })}>Usar imagen heredada</button>}
              <label>Ajuste de imagen<select value={values.fit} onChange={e => updateDesign({ fit: e.target.value })}><option value="contain">Mostrar imagen completa</option><option value="cover">Llenar el banner</option><option value="fill">Estirar imagen</option></select></label>{origin('fit', 'Ajuste de imagen')}
              {number('imageScale', 'Zoom de imagen', 25, 200, '%')}
            </div>
            <label>Destino al hacer clic<input placeholder="/tienda o https://…" maxLength={2048} value={banner.enlace || ''} onChange={e => updateBanner({ enlace: e.target.value })} /></label>
            <label className="ba-check"><input type="checkbox" checked={banner.mostrar_texto || false} onChange={e => updateBanner({ mostrar_texto: e.target.checked })} />Mostrar textos sobre la imagen</label>
            {banner.mostrar_texto && <div className="ba-text-content"><label>Nombre del banner / título<input id="ba-banner-name" value={banner.titulo || ''} maxLength={200} onChange={e => updateBanner({ titulo: e.target.value })} /></label><label>Descripción<textarea rows={3} maxLength={2000} value={banner.subtitulo || ''} onChange={e => updateBanner({ subtitulo: e.target.value })} /></label><label>Texto del botón<input maxLength={100} value={banner.texto_boton || ''} onChange={e => updateBanner({ texto_boton: e.target.value })} /></label></div>}
            <details open={!!openBlocks.size}><summary onClick={e => { e.preventDefault(); setBlock('size', !openBlocks.size); }}>Tamaño y encuadre · {NAMES[device]}</summary>{number('height', 'Alto', 0, 1600)}<small className="ba-hint">Usá 0 para conservar la proporción original.</small>{number('width', 'Ancho del banner', 10, 100, '%')}{number('positionX', 'Encuadre horizontal', 0, 100, '%')}{number('positionY', 'Encuadre vertical', 0, 100, '%')}{row?.__component === 'layout.fila-mixta' && <NumberControl label="Porcentaje en distribución libre" suffix="%" min={1} max={100} value={banner.ancho_porcentaje || 100} onChange={value => updateBanner({ ancho_porcentaje: value })} />}</details>
            {banner.mostrar_texto && <details open={!!openBlocks.text}><summary onClick={e => { e.preventDefault(); setBlock('text', !openBlocks.text); }}>Diseño de textos</summary>{number('fontSize', 'Tamaño del título', 12, 150)}{number('subtitleSize', 'Tamaño descripción', 10, 60)}{number('textX', 'Posición horizontal', 0, 90, '%')}{number('textY', 'Posición vertical', 5, 95, '%')}{number('textWidth', 'Ancho del texto', 10, 100, '%')}{number('padding', 'Espacio interior del texto', 0, 160)}<label>Alineación<select value={values.align} onChange={e => updateDesign({ align: e.target.value })}><option value="left">Izquierda</option><option value="center">Centro</option><option value="right">Derecha</option></select></label>{origin('align', 'Alineación')}{color('color', 'Color del texto')}{color('buttonBackground', 'Fondo del botón')}{color('buttonColor', 'Texto del botón')}{number('buttonSize', 'Tamaño del botón', 10, 40)}</details>}
            <details open={!!openBlocks.more}><summary onClick={e => { e.preventDefault(); setBlock('more', !openBlocks.more); }}>Más ajustes</summary>
              {!banner.mostrar_texto && <label>Nombre del banner / título<input id="ba-banner-name" value={banner.titulo || ''} maxLength={200} onChange={e => updateBanner({ titulo: e.target.value })} /></label>}
              {number('radius', 'Bordes redondeados', 0, 160)}{color('background', 'Fondo')}{number('overlay', 'Oscurecer imagen', 0, 1, '', .05)}
              {banner.mostrar_texto && <>{number('buttonRadius', 'Bordes del botón', 0, 100)}<label>Tipografía del título<select value={values.fontFamily} onChange={e => updateDesign({ fontFamily: e.target.value })}>{['Inter', 'Brygada 1918', 'Arial', 'Georgia'].map(font => <option key={font}>{font}</option>)}</select></label>{origin('fontFamily', 'Tipografía del título')}{number('fontWeight', 'Grosor del título', 300, 900, '', 100)}{number('lineHeight', 'Interlineado del título', .8, 2, '', .05)}{number('letterSpacing', 'Espaciado de letras', -2, 8, 'px', .1)}</>}
              <button className="ba-reset-device" onClick={() => change(copy => { const item = copy.Filas[selected.row].banners[selected.banner]; if (item?.diseno) delete item.diseno[device]; })}>Restablecer ajustes de {NAMES[device].toLowerCase()}</button>
              <details open={!!openBlocks.presets}><summary onClick={e => { e.preventDefault(); setBlock('presets', !openBlocks.presets); }}>Plantillas rápidas</summary><div className="ba-presets"><button onClick={() => updateBanner({ mostrar_texto: false, diseno: { desktop: { ...BANNER_DEFAULTS, fit: 'cover' }, mobile: { height: 280 } } })}>Solo imagen</button><button onClick={() => updateBanner({ mostrar_texto: true, texto_boton: banner.texto_boton || 'Descubrir', diseno: { desktop: { ...BANNER_DEFAULTS, fit: 'cover', overlay: .35 }, mobile: { height: 340, fontSize: 30, textWidth: 90, textX: 2 } } })}>Campaña</button><button onClick={() => updateBanner({ mostrar_texto: true, diseno: { desktop: { ...BANNER_DEFAULTS, color: '#560203', background: '#f5eee6', textWidth: 50, positionX: 90 }, mobile: { height: 360, fontSize: 28, textWidth: 90 } } })}>Editorial</button></div></details>
            </details>
            <details open={!!openBlocks.visibility}><summary onClick={e => { e.preventDefault(); setBlock('visibility', !openBlocks.visibility); }}>Visibilidad</summary><label className="ba-check"><input type="checkbox" checked={banner.activo !== false} onChange={e => updateBanner({ activo: e.target.checked })} />Banner activo en todos los dispositivos</label><label className="ba-check ba-device-hidden"><input type="checkbox" checked={values.hidden || false} onChange={e => updateDesign({ hidden: e.target.checked })} />Ocultar en {NAMES[device].toLowerCase()}</label>{origin('hidden', `Ocultar en ${NAMES[device].toLowerCase()}`)}</details>
          </>}
          {inspect === 'row' && <button className="ba-reset-device" onClick={() => change(copy => { const item = copy.Filas[selected.row]; if (item?.diseno) delete item.diseno[device]; })}>Restablecer ajustes de {NAMES[device].toLowerCase()}</button>}
        </>}
      </aside>
    </div>
    {library && <div className="ba-modal-backdrop" onClick={() => !busy && setLibrary(null)}><section className="ba-media-modal" role="dialog" aria-modal="true" aria-label="Biblioteca de imágenes" onClick={e => e.stopPropagation()}><header><div><p className="ba-eyebrow">BIBLIOTECA MARYBE</p><h2>Elegí tu próxima imagen</h2></div><button aria-label="Cerrar biblioteca" disabled={busy} onClick={() => setLibrary(null)}>×</button></header>{error && <p role="alert" style={{ color: '#a53a37' }}>{error}</p>}<div className="ba-media-toolbar"><input aria-label="Buscar imagen" placeholder="Buscar en las últimas 200 imágenes…" value={mediaSearch} onChange={e => setMediaSearch(e.target.value)} /><label className="ba-upload">{busy ? 'Subiendo…' : '＋ Subir imagen'}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" disabled={busy} onChange={e => upload(e.target.files[0])} /></label></div><p>Imagen para {NAMES[device].toLowerCase()} · JPG, PNG, WebP, GIF o AVIF · máximo 10 MB</p><div className="ba-media-grid">{media.filter(file => file.name.toLowerCase().includes(mediaSearch.toLowerCase())).map(file => <button key={file.id} disabled={busy} onClick={() => chooseMedia(file)}><img src={imageUrl(file, API)} alt={file.name} loading="lazy" /><strong>{file.name}</strong><small>{file.width} × {file.height}</small></button>)}</div></section></div>}
  </main>;
}
