import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiCheckCircle, FiChevronRight, FiLayers, FiPlus, FiSearch, FiTag, FiTrash2 } from 'react-icons/fi';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:1337';
const vacia = () => ({ seccion: '', categoria: '', subcategoria: '', tipo: '' });

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
  const headers = { Authorization: `Bearer ${token}` };
  const clave = JSON.stringify([...proveedores].sort());
  useEffect(() => { setProductos([]); setSeleccion(null); setMensaje(''); }, [clave]);
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
  const editar = p => { setSeleccion(p); setFilas(p.clasificaciones.map(c => ({ ...c }))); setMensaje(''); };
  const cambiar = (i, campo, valor) => { setFilas(prev => prev.map((f, j) => j !== i ? f : { ...f, [campo]: valor, ...(campo === 'categoria' ? { subcategoria: '', tipo: '' } : campo === 'subcategoria' ? { tipo: '' } : {}) })); };
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
      <div className="recat-classifications">{filas.map((f, i) => <fieldset className="recat-classification" key={i} disabled={cargando}>
        <legend>{i ? `Clasificación ${i + 1}` : 'Clasificación principal'}</legend>
        <div className="recat-fields">
          <label>Sección <select value={f.seccion} onChange={e => cambiar(i, 'seccion', e.target.value)}><option value="">Elegir sección</option><option>Perfumería</option><option>Hogar</option></select></label>
          <label>Categoría <select value={f.categoria} onChange={e => cambiar(i, 'categoria', e.target.value)}><option value="">Elegir categoría</option>{Object.keys(taxonomia).map(c => <option key={c}>{c}</option>)}</select></label>
          <label>Subcategoría <select value={f.subcategoria} onChange={e => cambiar(i, 'subcategoria', e.target.value)} disabled={!taxonomia[f.categoria]}><option value="">Sin subcategoría</option>{Object.keys(taxonomia[f.categoria] || {}).map(c => <option key={c}>{c}</option>)}</select></label>
          <label>Tipo <select value={f.tipo} onChange={e => cambiar(i, 'tipo', e.target.value)} disabled={!f.subcategoria}><option value="">Sin tipo</option>{(taxonomia[f.categoria]?.[f.subcategoria] || []).map(c => <option key={c}>{c}</option>)}</select></label>
        </div>
        {filas.length > 1 && <button className="recat-remove" type="button" onClick={() => setFilas(filas.filter((_, j) => i !== j))}><FiTrash2 aria-hidden="true" /> Quitar clasificación</button>}
      </fieldset>)}</div>
      <button className="recat-add" type="button" disabled={cargando} onClick={() => setFilas([...filas, vacia()])}><FiPlus aria-hidden="true" /> Agregar clasificación</button>
      <div className="recat-actions"><p>Al guardar, los cambios se publican en la tienda.</p><div><button type="button" className="recat-button recat-button--primary" disabled={cargando || filas.some(f => !f.seccion || !f.categoria)} onClick={guardar}>{cargando ? 'Guardando...' : 'Guardar cambios'}</button></div></div>
    </section>}
  </div>;
}
