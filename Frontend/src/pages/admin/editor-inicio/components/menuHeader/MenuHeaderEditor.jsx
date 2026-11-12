import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import SectionEditorShell from '../SectionEditorShell';
import OrderStrip from '../OrderStrip';
import useSectionDraft from '../../hooks/useSectionDraft';
import { imageUrl } from '../../../../../utils/bannerDesign';
import { SECTION_MAP } from '../../../../../data/megamenu';
import './MenuHeaderEditor.css';

const AREAS = [
  { key: 'perfumeria', label: 'Perfumería' },
  { key: 'hogar', label: 'Hogar' },
  { key: 'general', label: 'General' },
  { key: 'ofertas', label: 'Ofertas' },
  { key: 'lanzamientos', label: 'Lanzamientos' },
];
const AREA_KEYS = AREAS.map(area => area.key);
const names = { ofertas: 'Ofertas', lanzamientos: 'Lanzamientos' };

function move(values, id, to) {
  const result = [...values];
  const from = result.indexOf(id);
  if (from < 0 || to < 0 || to >= result.length) return result;
  result.splice(to, 0, result.splice(from, 1)[0]);
  return result;
}

function OrderedSelection({ title, selected, options, onChange, searchable = true }) {
  const [query, setQuery] = useState('');
  const entries = selected.map(id => options.find(option => option.documentId === id) || { documentId: id, nombre: `No disponible (${id})` });
  const filtered = options.filter(option => `${option.nombre} ${option.seccion || ''} ${option.sku || ''}`.toLowerCase().includes(query.toLowerCase()));
  return <section className="mh-selection">
    <h3>{title}</h3>
    {entries.length > 0 && <OrderStrip items={entries} title={`Orden de ${title.toLowerCase()}`} hint="Arrastrá o usá las flechas." listLabel={`Orden de ${title.toLowerCase()}`} onSelect={() => {}} onReorder={(id, to) => onChange(move(selected, id, to))} />}
    {entries.length > 0 && <div className="mh-selected">{entries.map(item => <button key={item.documentId} type="button" onClick={() => onChange(selected.filter(id => id !== item.documentId))}>Quitar {item.nombre}</button>)}</div>}
    {searchable && <label>Buscar {title.toLowerCase()}<input type="search" value={query} onChange={event => setQuery(event.target.value)} /></label>}
    <div className="mh-options">
      {filtered.map(item => <label key={item.documentId} className="mh-option">
        <input type="checkbox" checked={selected.includes(item.documentId)} onChange={() => onChange(selected.includes(item.documentId) ? selected.filter(id => id !== item.documentId) : [...selected, item.documentId])} />{' '}
        {item.portada && <img src={imageUrl(item.portada)} alt="" style={{ width: 36, height: 36, objectFit: 'contain', verticalAlign: 'middle', marginRight: 6 }} />}
        {item.nombre}{item.seccion ? ` · ${item.seccion}` : ''}{item.sku ? ` · ${item.sku}` : ''}
      </label>)}
    </div>
  </section>;
}

function CategoryChooser({ categories, selected, onChange }) {
  const [query, setQuery] = useState('');
  const filtered = categories.filter(category => category.nombre?.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  const groups = [
    { label: 'Perfumería', items: filtered.filter(category => category.seccion === 'Perfumería') },
    { label: 'Hogar', items: filtered.filter(category => category.seccion === 'Hogar') },
    { label: 'Otras', items: filtered.filter(category => !['Perfumería', 'Hogar'].includes(category.seccion)) },
  ];
  return <section className="mh-selection">
    <h3>Agregar categorías existentes</h3>
    <p className="ba-inspector-help">Marcá o desmarcá las categorías que querés mostrar en este menú.</p>
    <label>Buscar categoría<input type="search" value={query} onChange={event => setQuery(event.target.value)} /></label>
    {groups.filter(group => group.items.length).map(group => <details key={group.label} open>
      <summary>{group.label} · {group.items.length}</summary>
      <div className="mh-options">{group.items.map(category => {
        const key = `categoria:${category.documentId}`;
        const checked = selected.includes(key);
        return <label key={key} className="mh-option">
          <input type="checkbox" checked={checked} onChange={() => onChange(checked ? selected.filter(id => id !== key) : [...selected, key])} />
          <span>{category.nombre}</span>
        </label>;
      })}</div>
    </details>)}
  </section>;
}

export default function MenuHeaderEditor({ token, onBack, onLogout }) {
  const draft = useSectionDraft({ token, endpoint: '/api/menu-header-admin', areaKeys: AREA_KEYS });
  const { data, areaKey, change, overview, api, auth } = draft;
  const [device, setDevice] = useState('desktop');
  const [context, setContext] = useState('perfumeria');
  const [productQuery, setProductQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [productCache, setProductCache] = useState({});
  const [productPage, setProductPage] = useState(1);
  const [productTotal, setProductTotal] = useState(0);
  const [productError, setProductError] = useState('');
  const [parts, setParts] = useState({ ofertas: 'descuentos', lanzamientos: 'categorias' });

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      axios.get(`${api}/api/menu-header-admin/productos`, { ...auth, params: { q: productQuery, page: 1 } })
        .then(response => { if (active) { const items = response.data.data.items; setProducts(items); setProductCache(previous => ({ ...previous, ...Object.fromEntries(items.map(item => [item.documentId, item])) })); setProductPage(1); setProductTotal(response.data.data.total); setProductError(''); } })
        .catch(() => { if (active) setProductError('No se pudieron cargar los productos.'); });
    }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [api, auth, productQuery]);

  const productOptions = useMemo(() => {
    const byId = new Map([...(overview?.products || []), ...Object.values(productCache)].map(product => [product.documentId, product]));
    return [...byId.values()];
  }, [overview, productCache]);
  const categories = overview?.categorias || [];
  const categoryMap = Object.fromEntries(categories.map(category => [category.documentId, category]));
  const productMap = Object.fromEntries(productOptions.map(product => [product.documentId, product]));
  const currentContext = ['perfumeria', 'hogar', 'general'].includes(areaKey) ? areaKey : context;
  const contextItems = overview?.menuCategories?.[currentContext] || [];
  const categoryNames = Object.fromEntries([...categories, ...contextItems].map(item => [`categoria:${item.documentId}`, item.nombre]));
  const orderData = draft.getAreaData(currentContext);
  const publishedOrder = overview?.areas?.[currentContext]?.published?.orden || [];
  const previewCategories = (orderData?.orden || []).filter(id => !(orderData?.ocultos || []).includes(id)).map(id => {
    const category = categoryMap[id.replace(/^categoria:/, '')] || contextItems.find(item => `categoria:${item.documentId}` === id);
    return { key: id, nombre: names[id] || category?.nombre, seccion: category?.seccion, seccionMapped: SECTION_MAP[category?.seccion], forceSection: !publishedOrder.includes(id) };
  }).filter(item => item.nombre);
  const hydrate = area => {
    const value = draft.getAreaData(area);
    if (!value) return null;
    if (area === 'ofertas') return { ...value, columnas_categorias: value.columnas_categorias.map(column => ({ ...column, categorias: column.categorias.map(id => categoryMap[id]).filter(Boolean) })), productos_destacados: value.productos_destacados.map(id => productMap[id]).filter(Boolean) };
    return { ...value, categorias: value.categorias.map(id => categoryMap[id]).filter(Boolean), productos_destacados: value.productos_destacados.map(id => productMap[id]).filter(Boolean) };
  };
  const previewPayload = data ? {
    section: 'menu-header', area: currentContext, mode: 'edit',
    previewData: { context: currentContext.toUpperCase(), categories: previewCategories, estilo: orderData?.estilo || {}, menu: { ofertas: hydrate('ofertas'), lanzamientos: hydrate('lanzamientos') } },
  } : null;
  const setList = (field, value) => change(next => { next[field] = value; });
  const selectArea = key => { if (['perfumeria', 'hogar', 'general'].includes(key)) setContext(key); draft.selectArea(key); };
  const publish = async () => {
    const saved = await draft.save(true, 'Cambios publicados en el menú.');
    if (saved) window.dispatchEvent(new Event('marybe-menu-updated'));
  };
  const moreProducts = async () => {
    try {
      const response = await axios.get(`${api}/api/menu-header-admin/productos`, { ...auth, params: { q: productQuery, page: productPage + 1 } });
      setProducts(current => [...current, ...response.data.data.items]);
      setProductCache(previous => ({ ...previous, ...Object.fromEntries(response.data.data.items.map(item => [item.documentId, item])) }));
      setProductPage(response.data.data.page);
      setProductError('');
    } catch { setProductError('No se pudieron cargar más productos.'); }
  };
  const updateColumn = (index, update) => change(next => { Object.assign(next.columnas_categorias[index], update); });

  return <SectionEditorShell title="Menú Header / Mega Menú" locationText="Configuración global del menú" areas={AREAS} draft={draft} device={device} onDevice={setDevice}
    previewPayload={previewPayload} previewTitle="Vista previa del menú" canvasCaption={`VISTA PREVIA · ${currentContext.toUpperCase()}`}
    onSelectArea={selectArea} onSaveDraft={() => draft.save(false, 'Borrador guardado. La tienda conserva la versión publicada.')} onPublish={publish} onBack={onBack} onLogout={onLogout}
    sidebar={<aside className="ba-sidebar mh-sidebar"><h2>Editar menú</h2><p>Elegí qué parte del menú querés modificar.</p><nav aria-label="Secciones del menú" className="mh-area-nav">{AREAS.map(area => <button key={area.key} type="button" disabled={draft.busy} aria-pressed={areaKey === area.key} onClick={() => selectArea(area.key)}>{area.label}</button>)}</nav></aside>}
    inspectorTitle={AREAS.find(area => area.key === areaKey)?.label}>
    {data && ['perfumeria', 'hogar', 'general'].includes(areaKey) && <><OrderStrip
      items={data.orden.map(id => { const category = categoryMap[id.replace(/^categoria:/, '')] || contextItems.find(item => `categoria:${item.documentId}` === id); return { documentId: id, nombre: category?.seccion ? `${category.nombre} · ${category.seccion}` : names[id] || categoryNames[id] || id }; })}
      title="Orden del header" hint="Arrastrá las opciones o usá las flechas." listLabel="Orden del menú" onSelect={() => {}}
      onReorder={(id, to) => change(next => { next.orden = move(next.orden, id, to); })} />
      <section className="mh-selection"><h3>Tipografía y color del menú</h3>
        <label>Tipografía<select value={data.estilo?.fuente || ''} onChange={event => { const fuente = event.target.value; change(next => { next.estilo = { ...(next.estilo || {}), fuente, color: next.estilo?.color || '' }; }); }}><option value="">Original</option>{['Inter', 'Brygada 1918', 'Montserrat', 'Raleway', 'Playfair Display', 'Cormorant Garamond', 'Arial', 'Georgia', 'Verdana'].map(font => <option key={font}>{font}</option>)}</select></label>
        <label className="mh-font-size">Tamaño de fuente <output>{data.estilo?.tamanoPx ?? 14} px</output><input type="range" min="12" max="24" step="1" value={data.estilo?.tamanoPx ?? 14} aria-label="Tamaño de fuente en píxeles" onChange={event => { const tamanoPx = Number(event.target.value); change(next => { next.estilo = { fuente: next.estilo?.fuente || '', color: next.estilo?.color || '', tamanoPx }; }); }} /><small>De 12 a 24 px · se aplica desde 1200 px; en notebook angosta y celular se conserva el tamaño responsive.</small></label>
        <label>Color de fuente<input type="color" value={data.estilo?.color || '#5c0a0a'} onChange={event => { const color = event.target.value; change(next => { next.estilo = { ...(next.estilo || {}), fuente: next.estilo?.fuente || '', color }; }); }} /></label>
        <button type="button" onClick={() => change(next => { next.estilo = { ...(next.estilo || {}), fuente: next.estilo?.fuente || '', color: '' }; })}>Usar color original</button>
      </section>
      {areaKey !== 'general' && <section className="mh-selection"><h3>Opciones del menú</h3>
        {['ofertas', 'lanzamientos'].map(id => <label key={id} className="mh-option"><input type="checkbox" checked={!(data.ocultos || []).includes(id)} onChange={event => { const checked = event.target.checked; change(next => { next.ocultos = checked ? (next.ocultos || []).filter(item => item !== id) : [...(next.ocultos || []), id]; }); }} /> Mostrar {names[id]}</label>)}
      </section>}
      <CategoryChooser categories={categories} selected={data.orden} onChange={value => setList('orden', value)} />
    </>}
    {data && ['ofertas', 'lanzamientos'].includes(areaKey) && <div className="ba-inspector-tabs mh-tabs" role="tablist" aria-label={`Personalización de ${areaKey}`}>
      {(areaKey === 'ofertas' ? [{ id: 'descuentos', label: 'Descuentos' }, { id: 'categorias', label: 'Categorías' }, { id: 'productos', label: 'Productos' }] : [{ id: 'categorias', label: 'Categorías' }, { id: 'productos', label: 'Productos' }]).map(part => <button key={part.id} type="button" role="tab" aria-selected={parts[areaKey] === part.id} className={parts[areaKey] === part.id ? 'is-active' : ''} onClick={() => setParts(previous => ({ ...previous, [areaKey]: part.id }))}>{part.label}</button>)}
    </div>}
    {data && areaKey === 'ofertas' && parts.ofertas === 'descuentos' && <>
      <label><input type="checkbox" checked={data.mostrar_columna_descuentos} onChange={event => change(next => { next.mostrar_columna_descuentos = event.target.checked; })} /> Mostrar descuentos</label>
      <label>Título de descuentos<input value={data.titulo_descuentos} maxLength={160} onChange={event => change(next => { next.titulo_descuentos = event.target.value; })} /></label>
    </>}
    {data && areaKey === 'ofertas' && parts.ofertas === 'categorias' && <>
      <h3>Columnas de categorías</h3>
      {data.columnas_categorias.map((column, index) => <details className="mh-column" key={column.id || column.key}>
        <summary>{column.titulo_columna || `Columna ${index + 1}`} · {column.categorias.length} categorías</summary>
        <label>Título de columna<input value={column.titulo_columna} maxLength={160} onChange={event => updateColumn(index, { titulo_columna: event.target.value })} /></label>
        <button type="button" disabled={index === 0} onClick={() => change(next => { const item = next.columnas_categorias.splice(index, 1)[0]; next.columnas_categorias.splice(index - 1, 0, item); })}>Mover columna a la izquierda</button>
        <button type="button" disabled={index === data.columnas_categorias.length - 1} onClick={() => change(next => { const item = next.columnas_categorias.splice(index, 1)[0]; next.columnas_categorias.splice(index + 1, 0, item); })}>Mover columna a la derecha</button>
        <button type="button" onClick={() => change(next => { next.columnas_categorias.splice(index, 1); })}>Quitar columna</button>
        <OrderedSelection title="Categorías" selected={column.categorias} options={categories} onChange={value => updateColumn(index, { categorias: value })} />
      </details>)}
      <button type="button" onClick={() => change(next => { next.columnas_categorias.push({ key: `${Date.now()}-${Math.random()}`, titulo_columna: '', categorias: [] }); })}>Agregar columna</button>
    </>}
    {data && areaKey === 'lanzamientos' && parts.lanzamientos === 'categorias' && <>
      <label>Título de categorías<input value={data.titulo_categorias} maxLength={160} onChange={event => change(next => { next.titulo_categorias = event.target.value; })} /></label>
      <OrderedSelection title="Categorías" selected={data.categorias} options={categories} onChange={value => setList('categorias', value)} />
    </>}
    {data && ['ofertas', 'lanzamientos'].includes(areaKey) && parts[areaKey] === 'productos' && <>
      <label>Título de destacados<input value={data.titulo_destacados} maxLength={160} onChange={event => change(next => { next.titulo_destacados = event.target.value; })} /></label>
      <label>Buscar productos por nombre o SKU<input type="search" value={productQuery} onChange={event => setProductQuery(event.target.value)} /></label>
      {productError && <p role="alert">{productError}</p>}
      <OrderedSelection title="Productos destacados" selected={data.productos_destacados} options={productOptions.filter(product => data.productos_destacados.includes(product.documentId) || products.some(result => result.documentId === product.documentId))} searchable={false} onChange={value => setList('productos_destacados', value)} />
      {products.length < productTotal && <button type="button" onClick={moreProducts}>Cargar más productos</button>}
    </>}
  </SectionEditorShell>;
}
