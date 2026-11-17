import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiCheck, FiCheckCircle, FiChevronRight, FiEdit2, FiLayers, FiPlus, FiRotateCcw, FiSearch, FiTag, FiTrash2, FiZap } from 'react-icons/fi';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:1337';
const STORAGE_KEY_PILLS = 'marybe_recat_campanas_v1';
const CAMPANAS_PREDETERMINADAS = [
  { id: 'black-friday', label: 'Black Friday', seccion: '', categoria: '', subcategoria: 'Black Friday', tipo: '' },
  { id: 'cyber-monday', label: 'Cyber Monday', seccion: '', categoria: '', subcategoria: 'Cyber Monday', tipo: '' },
  { id: 'hot-sale', label: 'Hot Sale', seccion: '', categoria: '', subcategoria: 'Hot Sale', tipo: '' },
  { id: 'navidad', label: 'Navidad', seccion: '', categoria: '', subcategoria: 'Navidad', tipo: '' },
  { id: 'ofertas', label: 'Ofertas', seccion: '', categoria: '', subcategoria: 'Ofertas', tipo: '' },
];
const vacia = () => ({ seccion: '', categoria: '', subcategoria: '', tipo: '' });
const norm = v => String(v ?? '').trim().toLocaleLowerCase();

function clonarPredeterminadas() {
  return CAMPANAS_PREDETERMINADAS.map(p => ({ ...p }));
}

function normalizarPillGuardada(item, idx) {
  if (!item || typeof item !== 'object') return null;
  const label = String(item.label ?? '').trim().slice(0, 80);
  if (!label) return null;
  const sub = typeof item.subcategoria === 'string' ? item.subcategoria.trim().slice(0, 80) : label;
  const tipo = sub && typeof item.tipo === 'string' ? item.tipo.trim().slice(0, 80) : '';
  return {
    id: String(item.id || `pill-${idx}-${norm(label).replace(/[^a-z0-9]+/g, '-')}`),
    label,
    seccion: ['Perfumería', 'Hogar'].includes(item.seccion) ? item.seccion : '',
    categoria: typeof item.categoria === 'string' ? item.categoria.trim().slice(0, 80) : '',
    subcategoria: sub,
    tipo,
  };
}

function cargarPills() {
  try {
    const raw = window?.localStorage?.getItem(STORAGE_KEY_PILLS);
    if (!raw) return clonarPredeterminadas();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return clonarPredeterminadas();
    return parsed.map(normalizarPillGuardada).filter(Boolean);
  } catch {
    return clonarPredeterminadas();
  }
}

function guardarPills(pills) {
  try {
    window?.localStorage?.setItem(STORAGE_KEY_PILLS, JSON.stringify(pills));
  } catch { /* ignore storage restrictions */ }
}

function generarIdPill(label, existentes) {
  const base = norm(label).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'campana';
  const ids = new Set(existentes.map(p => p.id));
  if (!ids.has(base)) return base;
  let n = 2;
  while (ids.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

function resolverClasificacionPill(pill, principal) {
  const seccion = pill.seccion || principal?.seccion || 'Perfumería';
  const categoria = pill.categoria || principal?.categoria || '';
  const subcategoria = pill.subcategoria;
  const tipo = subcategoria ? (pill.tipo || '') : '';
  return { seccion, categoria, subcategoria, tipo };
}

function coincideClasificacion(a, b) {
  return ['seccion', 'categoria', 'subcategoria', 'tipo'].every(k => norm(a?.[k]) === norm(b?.[k]));
}

function describirTargetPill(pill, principal) {
  const t = resolverClasificacionPill(pill, principal);
  const partes = [t.seccion, t.categoria || '(requiere categoría principal)', t.subcategoria, t.tipo].filter(Boolean);
  return partes.join(' › ');
}

export default function RecategorizacionRapida({ token, proveedores }) {
  const [taxonomia, setTaxonomia] = useState({});
  const [productos, setProductos] = useState([]);
  const [seleccion, setSeleccion] = useState(null);
  const [filas, setFilas] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [busquedaGeneral, setBusquedaGeneral] = useState('');
  const [limiteAlcanzado, setLimiteAlcanzado] = useState(false);
  const [pills, setPills] = useState(() => cargarPills());
  const [modoEdicionPills, setModoEdicionPills] = useState(false);
  const [pillForm, setPillForm] = useState(null);
  const headers = { Authorization: `Bearer ${token}` };
  const clave = JSON.stringify([...proveedores].sort());
  useEffect(() => { setProductos([]); setSeleccion(null); setMensaje(''); }, [clave]);
  useEffect(() => { guardarPills(pills); }, [pills]);
  useEffect(() => {
    let activo = true;
    axios.get(`${API_URL}/api/exportacion-proveedores-admin/recategorizacion/taxonomia`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { if (activo) setTaxonomia(r.data.taxonomia); })
      .catch(() => { if (activo) setMensaje('No se pudo cargar la taxonomía.'); });
    return () => { activo = false; };
  }, [token]);
  const cargar = async (termino = '') => {
    setCargando(true); setMensaje(''); setSeleccion(null);
    try {
      const r = await axios.post(`${API_URL}/api/exportacion-proveedores-admin/recategorizacion/productos`, termino ? { busqueda: termino } : { proveedores }, { headers });
      setProductos(r.data.productos);
      setBusqueda(''); setLimiteAlcanzado(!!r.data.limiteAlcanzado);
      if (!r.data.productos.length) setMensaje('No se encontraron productos disponibles.');
    } catch (e) { setProductos([]); setLimiteAlcanzado(false); setMensaje(e.response?.data?.error?.message || 'No se pudieron cargar los productos.'); }
    finally { setCargando(false); }
  };
  const editar = p => {
    setSeleccion(p);
    setFilas(p.clasificaciones.map(c => ({ ...c })));
    setMensaje('');
    setPillForm(null);
  };
  const cambiar = (i, campo, valor) => { setFilas(prev => prev.map((f, j) => j !== i ? f : { ...f, [campo]: valor, ...(campo === 'categoria' ? { subcategoria: '', tipo: '' } : campo === 'subcategoria' ? { tipo: '' } : {}) })); };
  const asegurarEnTaxonomia = ({ categoria, subcategoria, tipo }) => {
    if (!categoria) return;
    setTaxonomia(prev => {
      const catActual = prev[categoria] || {};
      const existeCat = Object.hasOwn(prev, categoria);
      const existeSub = !subcategoria || Object.hasOwn(catActual, subcategoria);
      const tiposActuales = subcategoria ? (catActual[subcategoria] || []) : [];
      const existeTipo = !subcategoria || !tipo || tiposActuales.includes(tipo);
      if (existeCat && existeSub && existeTipo) return prev;
      const nextCat = { ...catActual };
      if (subcategoria) {
        nextCat[subcategoria] = tipo && !tiposActuales.includes(tipo) ? [...tiposActuales, tipo] : [...tiposActuales];
      }
      return { ...prev, [categoria]: nextCat };
    });
  };
  const aplicarPill = (pill, { soloAgregar = false } = {}) => {
    const target = resolverClasificacionPill(pill, filas[0]);
    if (!target.categoria) {
      setMensaje('Elegí primero la categoría principal antes de aplicar una campaña.');
      return;
    }
    asegurarEnTaxonomia(target);
    const yaExiste = filas.some(f => coincideClasificacion(f, target));
    if (yaExiste) {
      if (!soloAgregar && filas.length > 1) {
        setFilas(prev => {
          const restantes = prev.filter((f, idx) => idx === 0 || !coincideClasificacion(f, target));
          return restantes.length !== prev.length ? restantes : prev.filter(f => !coincideClasificacion(f, target));
        });
      }
      return;
    }
    setMensaje('');
    if (filas.length === 1 && !filas[0].categoria) {
      setFilas([target]);
      return;
    }
    setFilas(prev => [...prev, target]);
  };
  const abrirNuevaPill = () => {
    setPillForm({
      id: null,
      originalLabel: '',
      label: '',
      seccion: '',
      categoriaSelect: '',
      categoriaCustom: '',
      subcategoria: '',
      subSyncConLabel: true,
      tipo: '',
    });
  };
  const abrirEditorPill = pill => {
    const cat = pill.categoria || '';
    const enTaxonomia = cat && Object.hasOwn(taxonomia, cat);
    setPillForm({
      id: pill.id,
      originalLabel: pill.label,
      label: pill.label,
      seccion: pill.seccion || '',
      categoriaSelect: !cat ? '' : (enTaxonomia ? cat : '__otra__'),
      categoriaCustom: !cat || enTaxonomia ? '' : cat,
      subcategoria: pill.subcategoria || '',
      subSyncConLabel: norm(pill.subcategoria) === norm(pill.label),
      tipo: pill.tipo || '',
    });
  };
  const actualizarPillForm = (campo, valor) => {
    setPillForm(prev => {
      if (!prev) return prev;
      if (campo === 'label') {
        const nextSub = prev.subSyncConLabel ? valor : prev.subcategoria;
        return { ...prev, label: valor, subcategoria: nextSub, ...(nextSub.trim() ? {} : { tipo: '' }) };
      }
      if (campo === 'subcategoria') {
        return { ...prev, subcategoria: valor, subSyncConLabel: false, ...(valor.trim() ? {} : { tipo: '' }) };
      }
      if (campo === 'categoriaSelect') {
        return { ...prev, categoriaSelect: valor, ...(valor === '__otra__' ? {} : { categoriaCustom: '' }) };
      }
      return { ...prev, [campo]: valor };
    });
  };
  const guardarPillForm = () => {
    if (!pillForm) return;
    const labelClean = pillForm.label.trim().slice(0, 80);
    if (!labelClean) return;
    const categoriaClean = (pillForm.categoriaSelect === '__otra__' ? pillForm.categoriaCustom : pillForm.categoriaSelect).trim().slice(0, 80);
    if (pillForm.categoriaSelect === '__otra__' && !categoriaClean) {
      setMensaje('Ingresá el nombre de la categoría personalizada de la pill.');
      return;
    }
    const duplicada = pills.some(p => p.id !== pillForm.id && norm(p.label) === norm(labelClean));
    if (duplicada) {
      setMensaje(`Ya existe una pill llamada "${labelClean}".`);
      return;
    }
    const subClean = pillForm.subcategoria.trim().slice(0, 80);
    const tipoClean = subClean ? pillForm.tipo.trim().slice(0, 80) : '';
    const pillFinal = {
      id: pillForm.id || generarIdPill(labelClean, pills),
      label: labelClean,
      seccion: pillForm.seccion,
      categoria: categoriaClean,
      subcategoria: subClean,
      tipo: tipoClean,
    };
    setPills(prev => (pillForm.id ? prev.map(p => (p.id === pillForm.id ? pillFinal : p)) : [...prev, pillFinal]));
    setMensaje('');
    if (!pillForm.id && !modoEdicionPills) {
      aplicarPill(pillFinal, { soloAgregar: true });
    }
    setPillForm(null);
  };
  const eliminarPill = id => {
    setPills(prev => prev.filter(p => p.id !== id));
    setPillForm(prev => (prev?.id === id ? null : prev));
  };
  const restaurarPills = () => {
    setPills(clonarPredeterminadas());
    setPillForm(null);
    setModoEdicionPills(false);
  };
  const categoriasOpciones = (catActual) => {
    const base = Object.keys(taxonomia);
    return catActual && !base.includes(catActual) ? [catActual, ...base] : base;
  };
  const subcategoriasOpciones = (catActual, subActual) => {
    const base = Object.keys(taxonomia[catActual] || {});
    return subActual && !base.includes(subActual) ? [subActual, ...base] : base;
  };
  const tiposOpciones = (catActual, subActual, tipoActual) => {
    const base = taxonomia[catActual]?.[subActual] || [];
    return tipoActual && !base.includes(tipoActual) ? [tipoActual, ...base] : base;
  };
  const guardar = async () => {
    setCargando(true); setMensaje('');
    try {
      const res = await axios.post(`${API_URL}/api/exportacion-proveedores-admin/recategorizacion/guardar`, { documentId: seleccion.documentId, proveedor: seleccion.proveedor, updatedAt: seleccion.updatedAt, clasificaciones: filas }, { headers });
      const actualizado = { ...seleccion, updatedAt: res.data.updatedAt, clasificaciones: filas.map(fila => ({ ...fila })) };
      setProductos(prev => prev.map(producto => producto.documentId === actualizado.documentId ? actualizado : producto));
      setSeleccion(null); setMensaje('Cambios guardados y publicados.');
    } catch (e) { setMensaje(e.response?.data?.error?.message || 'No se pudieron guardar los cambios.'); }
    finally { setCargando(false); }
  };
  const filtrados = productos.filter(p => `${p.nombre} ${p.proveedor}`.toLocaleLowerCase().includes(busqueda.toLocaleLowerCase()));
  const categoriaEfectivaPillForm = pillForm
    ? ((pillForm.categoriaSelect === '__otra__' ? pillForm.categoriaCustom : pillForm.categoriaSelect).trim() || filas[0]?.categoria || '')
    : '';
  const subcatsSugeridasPill = Object.keys(taxonomia[categoriaEfectivaPillForm] || {});
  const tiposSugeridosPill = pillForm?.subcategoria.trim() ? (taxonomia[categoriaEfectivaPillForm]?.[pillForm.subcategoria.trim()] || []) : [];
  const pillsPersonalizadas = JSON.stringify(pills) !== JSON.stringify(CAMPANAS_PREDETERMINADAS);
  return <div className="recat-workspace">
    <div className="recat-search-bar">
      <div><span className="recat-step">PRODUCTOS</span><h2>Elegí un producto</h2><p>Buscá por nombre o código, o consultá los proveedores seleccionados.</p></div>
      <button className="recat-button recat-button--primary" type="button" onClick={() => cargar()} disabled={!proveedores.length || cargando}><FiSearch aria-hidden="true" /> {cargando ? 'Cargando...' : 'Buscar productos'}</button>
    </div>
    <form className="recat-general-search" onSubmit={e => { e.preventDefault(); cargar(busquedaGeneral.trim()); }}>
      <label className="recat-search"><FiSearch aria-hidden="true" /><span className="recat-sr-only">Buscar en todo el catálogo</span><input type="search" aria-label="Buscar en todo el catálogo" placeholder="Nombre, SKU, EAN o ID del producto" value={busquedaGeneral} onChange={e => setBusquedaGeneral(e.target.value)} maxLength={100} /></label>
      <button className="recat-button recat-button--primary" type="submit" disabled={cargando || busquedaGeneral.trim().length < 2}>Buscar en todo el catálogo</button>
    </form>
    {mensaje && <p role="status" className={`recat-notice${mensaje === 'Cambios guardados y publicados.' ? ' recat-notice--saved' : ''}`}><FiCheckCircle aria-hidden="true" />{mensaje}</p>}
    {!!productos.length && <section className="recat-results" aria-label="Productos encontrados">
      <div className="recat-results-heading"><div><h3>Productos encontrados</h3><p>Seleccioná uno para editar sus clasificaciones.</p></div><span className="recat-count">{filtrados.length} {filtrados.length === 1 ? 'producto' : 'productos'}</span></div>
      {limiteAlcanzado && <p className="recat-result-limit">Se muestran hasta 50 resultados. Escribí una búsqueda más específica si no encontrás el producto.</p>}
      <label className="recat-search"><FiSearch aria-hidden="true" /><span className="recat-sr-only">Buscar producto</span><input type="search" aria-label="Buscar producto" placeholder="Buscar por producto o proveedor" value={busqueda} onChange={e => setBusqueda(e.target.value)} /></label>
      <div className="recat-product-list">
        {filtrados.map(p => <button key={p.documentId} type="button" disabled={cargando} aria-label={`${p.nombre} · ${p.proveedor || 'Sin proveedor'}`} className={`recat-product${seleccion?.documentId === p.documentId ? ' is-selected' : ''}`} onClick={() => editar(p)}><span className="recat-product-icon"><FiTag aria-hidden="true" /></span><span className="recat-product-text"><strong>{p.nombre}</strong><small>{p.proveedor || 'Sin proveedor'}</small></span><FiChevronRight className="recat-chevron" aria-hidden="true" /></button>)}
        {!filtrados.length && <p className="recat-empty">No encontramos productos con esa búsqueda.</p>}
      </div>
    </section>}
    {seleccion && <section className="recat-editor" aria-label="Editar clasificaciones">
      <div className="recat-editor-heading"><span className="recat-editor-icon"><FiLayers aria-hidden="true" /></span><div><span className="recat-step">CLASIFICACIONES</span><h2>{seleccion.nombre}</h2><p>{seleccion.proveedor || 'Sin proveedor'}</p></div></div>
      <p className="recat-editor-help">La primera clasificación es la principal. Agregá otras para mostrar el producto en otras categorías del catálogo.</p>
      <div className="recat-quick-bar">
        <div className="recat-quick-header">
          <div>
            <span>Campañas rápidas (1 clic para asignar o quitar)</span>
            <small>{filas[0]?.categoria ? `Se asignan en ${filas[0]?.seccion || 'Perfumería'} · ${filas[0].categoria} (subcategoría)` : `Elegí sección y categoría principal para asignar subcategorías`}</small>
          </div>
          <div className="recat-quick-header-actions">
            {modoEdicionPills && pillsPersonalizadas && <button type="button" disabled={cargando} className="recat-quick-tool" onClick={restaurarPills}><FiRotateCcw aria-hidden="true" /> Restaurar</button>}
            <button type="button" disabled={cargando} aria-pressed={modoEdicionPills} className={`recat-quick-tool${modoEdicionPills ? ' is-active' : ''}`} onClick={() => { setModoEdicionPills(v => !v); setPillForm(null); }}><FiEdit2 aria-hidden="true" /> {modoEdicionPills ? 'Listo' : 'Editar pills'}</button>
          </div>
        </div>
        <div className="recat-quick-pills">
          {pills.map(pill => {
            const target = resolverClasificacionPill(pill, filas[0]);
            const activa = !!target.categoria && filas.some(f => coincideClasificacion(f, target));
            const editando = pillForm?.id === pill.id;
            return modoEdicionPills
              ? <button key={pill.id} type="button" disabled={cargando} aria-pressed={editando} title={`Editar ${pill.label}: ${describirTargetPill(pill, filas[0])}`} className={`recat-quick-pill recat-quick-pill--editable${editando ? ' is-editing' : ''}`} onClick={() => abrirEditorPill(pill)}><FiEdit2 aria-hidden="true" /> {pill.label}</button>
              : <button key={pill.id} type="button" disabled={cargando} aria-pressed={activa} title={describirTargetPill(pill, filas[0])} className={`recat-quick-pill${activa ? ' is-active' : ''}`} onClick={() => aplicarPill(pill)}>{activa ? <FiCheck aria-hidden="true" /> : <FiZap aria-hidden="true" />} {pill.label}</button>;
          })}
          <button type="button" disabled={cargando} className="recat-quick-pill recat-quick-pill--add" onClick={abrirNuevaPill}><FiPlus aria-hidden="true" /> Nueva campaña</button>
        </div>
        {pillForm && <div className="recat-quick-editor" role="region" aria-label={pillForm.id ? `Configurar pill ${pillForm.originalLabel}` : 'Nueva campaña rápida'}>
          <div className="recat-quick-editor-title">{pillForm.id ? `Editando pill "${pillForm.originalLabel}"` : 'Nueva campaña rápida'}</div>
          <div className="recat-quick-editor-grid">
            <label>Nombre de la pill <input type="text" aria-label="Nombre de la pill" placeholder="Ej: Día de la Madre" value={pillForm.label} maxLength={80} disabled={cargando} onChange={e => actualizarPillForm('label', e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); guardarPillForm(); } }} /></label>
            <label>Sección <select aria-label="Sección de la pill" value={pillForm.seccion} disabled={cargando} onChange={e => actualizarPillForm('seccion', e.target.value)}><option value="">{`Clonar principal (${filas[0]?.seccion || 'Perfumería'})`}</option><option value="Perfumería">Perfumería</option><option value="Hogar">Hogar</option></select></label>
            <label>Categoría <select aria-label="Categoría de la pill" value={pillForm.categoriaSelect} disabled={cargando} onChange={e => actualizarPillForm('categoriaSelect', e.target.value)}><option value="">{`Clonar principal (${filas[0]?.categoria || 'sin categoría'})`}</option>{categoriasOpciones(pillForm.categoriaSelect === '__otra__' ? '' : pillForm.categoriaSelect).map(c => <option key={c} value={c}>{c}</option>)}<option value="__otra__">Otra categoría...</option></select></label>
            {pillForm.categoriaSelect === '__otra__' && <label>Categoría personalizada <input type="text" aria-label="Categoría personalizada de la pill" placeholder="Nombre de la categoría" value={pillForm.categoriaCustom} maxLength={80} disabled={cargando} onChange={e => actualizarPillForm('categoriaCustom', e.target.value)} /></label>}
            <label>Subcategoría <input type="text" aria-label="Subcategoría de la pill" list="recat-pill-subcats" placeholder="Ej: Black Friday (vacío = sin subcategoría)" value={pillForm.subcategoria} maxLength={80} disabled={cargando} onChange={e => actualizarPillForm('subcategoria', e.target.value)} /></label>
            <label>Tipo <input type="text" aria-label="Tipo de la pill" list="recat-pill-tipos" placeholder="Opcional" value={pillForm.tipo} maxLength={80} disabled={cargando || !pillForm.subcategoria.trim()} onChange={e => actualizarPillForm('tipo', e.target.value)} /></label>
          </div>
          <datalist id="recat-pill-subcats">{subcatsSugeridasPill.map(s => <option key={s} value={s} />)}</datalist>
          <datalist id="recat-pill-tipos">{tiposSugeridosPill.map(t => <option key={t} value={t} />)}</datalist>
          <div className="recat-quick-editor-actions">
            <button type="button" className="recat-button recat-button--primary recat-button--sm" disabled={cargando || !pillForm.label.trim() || (pillForm.categoriaSelect === '__otra__' && !pillForm.categoriaCustom.trim())} onClick={guardarPillForm}>{pillForm.id ? 'Guardar pill' : 'Agregar pill'}</button>
            {pillForm.id && <button type="button" className="recat-button recat-button--secondary recat-button--sm" disabled={cargando} onClick={() => eliminarPill(pillForm.id)}><FiTrash2 aria-hidden="true" /> Quitar pill</button>}
            <button type="button" className="recat-button recat-button--secondary recat-button--sm" disabled={cargando} onClick={() => setPillForm(null)}>Cancelar</button>
          </div>
        </div>}
      </div>
      <div className="recat-classifications">{filas.map((f, i) => {
        const subOpciones = subcategoriasOpciones(f.categoria, f.subcategoria);
        return <fieldset className="recat-classification" key={i} disabled={cargando}>
          <legend>{i ? `Clasificación ${i + 1}` : 'Clasificación principal'}</legend>
          <div className="recat-fields">
            <label>Sección <select value={f.seccion} onChange={e => cambiar(i, 'seccion', e.target.value)}><option value="">Elegir sección</option><option>Perfumería</option><option>Hogar</option></select></label>
            <label>Categoría <select value={f.categoria} onChange={e => cambiar(i, 'categoria', e.target.value)}><option value="">Elegir categoría</option>{categoriasOpciones(f.categoria).map(c => <option key={c}>{c}</option>)}</select></label>
            <label>Subcategoría <select value={f.subcategoria} onChange={e => cambiar(i, 'subcategoria', e.target.value)} disabled={subOpciones.length === 0}><option value="">Sin subcategoría</option>{subOpciones.map(c => <option key={c}>{c}</option>)}</select></label>
            <label>Tipo <select value={f.tipo} onChange={e => cambiar(i, 'tipo', e.target.value)} disabled={!f.subcategoria}><option value="">Sin tipo</option>{tiposOpciones(f.categoria, f.subcategoria, f.tipo).map(c => <option key={c}>{c}</option>)}</select></label>
          </div>
          {filas.length > 1 && <button className="recat-remove" type="button" onClick={() => setFilas(filas.filter((_, j) => i !== j))}><FiTrash2 aria-hidden="true" /> Quitar clasificación</button>}
        </fieldset>;
      })}</div>
      <button className="recat-add" type="button" disabled={cargando} onClick={() => setFilas([...filas, vacia()])}><FiPlus aria-hidden="true" /> Agregar clasificación</button>
      <div className="recat-actions"><p>Al guardar, los cambios se publican en la tienda.</p><div><button type="button" className="recat-button recat-button--primary" disabled={cargando || filas.some(f => !f.seccion || !f.categoria)} onClick={guardar}>{cargando ? 'Guardando...' : 'Guardar cambios'}</button></div></div>
    </section>}
  </div>;
}
