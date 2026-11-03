import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { deviceDesign, imageUrl } from '../../utils/bannerDesign';

function thumbnail(banner, device) {
  return imageUrl(device === 'mobile' ? banner?.imagen_mobile || banner?.imagen_tablet || banner?.imagen_desktop : device === 'tablet' ? banner?.imagen_tablet || banner?.imagen_desktop : banner?.imagen_desktop);
}

export default function BannerStructure({ documents, source, selected, inspect, device, busy, loading, onSourceSelect, onSelect, onAction, onCreate, onAddBanner, onMoveDistribution }) {
  const [closed, setClosed] = useState({});
  const [menu, setMenu] = useState(null);
  const nav = useRef(null);
  const menuRef = useRef(null);
  const menuTrigger = useRef(null);
  const dragged = useRef(null);

  useEffect(() => {
    setClosed(previous => ({ ...previous, [source]: false, [`${source}:${selected.row}`]: false }));
    const timer = setTimeout(() => nav.current?.querySelector('[data-selected="true"]')?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' }), 0);
    return () => clearTimeout(timer);
  }, [source, selected]);

  useEffect(() => {
    if (!menu) return;
    menuRef.current?.querySelector('button:not(:disabled)')?.focus();
    const outside = event => { if (!menuRef.current?.contains(event.target) && !menuTrigger.current?.contains(event.target)) setMenu(null); };
    const keyboard = event => {
      if (event.key === 'Escape') { event.preventDefault(); setMenu(null); menuTrigger.current?.focus(); }
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        const buttons = [...menuRef.current.querySelectorAll('button:not(:disabled)')];
        const current = buttons.indexOf(document.activeElement);
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (current + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
        buttons[next]?.focus();
      }
      if (event.key === 'Tab') setMenu(null);
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', keyboard);
    const blur = () => setMenu(null);
    window.addEventListener('blur', blur);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', keyboard); window.removeEventListener('blur', blur); };
  }, [menu]);

  const toggle = key => setClosed(previous => ({ ...previous, [key]: !previous[key] }));
  const chooseElement = (key, row, banner, mode) => {
    if (busy) return;
    if (key !== source) onSourceSelect(key, mode);
    onSelect(row, banner, mode);
  };
  const openMenu = (event, type, key, row = 0, banner = 0) => {
    menuTrigger.current = event.currentTarget;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (type === 'section') onSourceSelect(key, 'row'); else chooseElement(key, row, banner, type === 'distribution' ? 'row' : 'banner');
    setMenu({ type, key, row, banner, left: Math.max(8, Math.min(bounds.left, window.innerWidth - 220)), top: Math.max(8, Math.min(bounds.bottom + 5, window.innerHeight - 310)) });
  };
  const trigger = (title, type, key, row, banner) => <button className="ba-layer-more" disabled={busy} aria-label={type === 'distribution' ? `Acciones de ${title}` : `Acciones de ${type === 'section' ? 'sección' : 'banner'}: ${title}`} aria-haspopup="menu" aria-expanded={Boolean(menu && menu.type === type && menu.key === key && menu.row === (row || 0) && menu.banner === (banner || 0))} onClick={event => openMenu(event, type, key, row, banner)}>•••</button>;
  const active = documents.find(entry => entry.key === source)?.document;
  const activeRow = active?.Filas?.[menu?.row];
  const activeBanner = activeRow?.banners?.[menu?.banner];
  const actions = menu?.type === 'section' ? [
    ['rename-section', 'Renombrar sección'], ['duplicate-section', 'Duplicar sección'], ['add-distribution', 'Agregar distribución'], ['delete-section', 'Eliminar sección'],
  ] : menu?.type === 'distribution' ? [
    ['duplicate-distribution', 'Duplicar distribución'], ['up-distribution', 'Mover arriba', menu.row === 0], ['down-distribution', 'Mover abajo', menu.row >= (active?.Filas?.length || 0) - 1],
    ['hide-distribution', deviceDesign(activeRow?.diseno, device, {}).hidden ? 'Mostrar en este dispositivo' : 'Ocultar en este dispositivo'], ['delete-distribution', 'Eliminar distribución', active?.Filas?.length <= 1],
  ] : [
    ['rename-banner', 'Renombrar banner'], ['duplicate-banner', 'Duplicar banner'], ['up-banner', 'Mover antes', menu?.banner === 0], ['down-banner', 'Mover después', menu?.banner >= (activeRow?.banners?.length || 0) - 1],
    ['hide-banner', activeBanner?.activo === false ? 'Mostrar banner' : 'Ocultar banner'], ['delete-banner', 'Eliminar banner', activeRow?.banners?.length <= 1],
  ];

  return <aside className="ba-sidebar ba-layers">
    <div className="ba-layers-heading"><div><p className="ba-eyebrow">BANNERS PRINCIPALES</p><h2>Estructura de banners</h2></div><span>{documents.length}</span></div>
    <p className="ba-scope-note">Elegí una sección para cambiar su distribución, o un banner para editar su contenido.</p>
    {loading && <p role="status">Cargando banners…</p>}
    {!loading && !documents.length && <p className="ba-layer-empty">Todavía no hay secciones en esta área.</p>}
    <nav aria-label="Estructura de banners" ref={nav}>
      <ul className="ba-layer-list">{documents.map(({ key, document: section }) => {
        const isCurrent = source === key;
        const collapsed = closed[key] ?? !isCurrent;
        const count = (section.Filas || []).reduce((total, row) => total + row.banners.length, 0);
        const sectionTitle = section.titulo || 'Sección de banners';
        return <li key={key} className={`ba-layer-section ${isCurrent ? 'is-current' : ''}`}>
          <div className="ba-layer-heading">
            <button className="ba-layer-chevron" aria-label={`${collapsed ? 'Expandir' : 'Contraer'} ${sectionTitle}`} aria-expanded={!collapsed} aria-controls={`layers-${key}`} onClick={() => setClosed(previous => ({ ...previous, [key]: !collapsed }))}>{collapsed ? '›' : '⌄'}</button>
            <button className={`ba-layer-section-title ${isCurrent && inspect === 'row' ? 'is-active' : ''}`} onClick={() => onSourceSelect(key, 'row')} aria-label={`Editar sección: ${sectionTitle}`} aria-pressed={isCurrent && inspect === 'row'}><span aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3 10 5-10 5L2 8l10-5Z" /><path d="m2 12 10 5 10-5M2 16l10 5 10-5" /></svg></span><span>{sectionTitle}<small>{count} {count === 1 ? 'banner' : 'banners'} · {section.Filas?.some(row => row.es_carrusel) ? 'Carrusel' : 'Grilla'}</small></span></button>
            {trigger(sectionTitle, 'section', key)}
          </div>
          {!collapsed && <ul id={`layers-${key}`} className="ba-layer-children">
            {(section.Filas || []).map((row, ri) => {
              const rowKey = `${key}:${ri}`;
              const multiple = section.Filas.length > 1 || (isCurrent && inspect === 'row');
              return <li key={row.id ? `row-${row.id}` : `new-${ri}`}>
                {multiple && <div className={`ba-layer-distribution ${isCurrent && selected.row === ri && inspect === 'row' ? 'is-active' : ''}`} draggable={isCurrent && !busy} onDragStart={() => { dragged.current = ri; }} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); if (isCurrent && dragged.current !== null) onMoveDistribution(dragged.current, ri - dragged.current); dragged.current = null; }}>
                  <button className="ba-layer-chevron" aria-label={`${closed[rowKey] ? 'Expandir' : 'Contraer'} distribución ${ri + 1}`} aria-expanded={!closed[rowKey]} onClick={() => toggle(rowKey)}>{closed[rowKey] ? '›' : '⌄'}</button>
                  <button onClick={() => chooseElement(key, ri, 0, 'row')}>Distribución {ri + 1}<small>{row.es_carrusel ? 'Carrusel' : 'Grilla'}{deviceDesign(row.diseno, device, {}).hidden ? ' · Oculta' : ''}</small></button>
                  {trigger(`distribución ${ri + 1}`, 'distribution', key, ri)}
                </div>}
                {!closed[rowKey] && <ul className="ba-layer-banners">{row.banners.map((banner, bi) => {
                  const title = banner.titulo || `Banner ${bi + 1}`;
                  const selectedBanner = isCurrent && selected.row === ri && selected.banner === bi && inspect === 'banner';
                  const hidden = banner.activo === false || deviceDesign(banner.diseno, device, {}).hidden;
                  const image = thumbnail(banner, device);
                  return <li className={`ba-layer-banner ${selectedBanner ? 'is-active' : ''} ${hidden ? 'is-hidden' : ''}`} key={banner.id ? `banner-${banner.id}` : `new-${bi}`} data-selected={selectedBanner}>
                    <button className="ba-layer-banner-select" aria-label={`Editar banner: ${title}`} aria-pressed={selectedBanner} onClick={() => chooseElement(key, ri, bi, 'banner')}><span className="ba-thumbnail">{image ? <img src={image} alt="" /> : '▧'}</span><span>{title}<small>{hidden ? 'Oculto' : 'Imagen y contenido'}</small></span></button>
                    {trigger(title, 'banner', key, ri, bi)}
                  </li>;
                })}{isCurrent && <li><button className="ba-add-inline" disabled={busy} onClick={() => onAddBanner(ri)}>＋ Agregar banner</button></li>}</ul>}
              </li>;
            })}
          </ul>}
        </li>;
      })}</ul>
    </nav>
    <button className="ba-add-section" disabled={busy || loading} onClick={onCreate}>＋ Agregar sección</button>
    <div className="ba-help"><strong>Tu próximo cambio, en tres pasos</strong><ol><li>Elegí Perfumería o Hogar.</li><li>Seleccioná la imagen que querés editar.</li><li>Revisá la vista previa y guardá el borrador.</li></ol><a href="/inicio" target="_blank" rel="noreferrer">Abrir la tienda ↗</a></div>
    {menu && createPortal(<div className="ba-app ba-layer-menu" ref={menuRef} role="menu" aria-label="Acciones del elemento" style={{ left: menu.left, top: menu.top }}>{actions.map(([action, label, disabled]) => <button role="menuitem" key={action} disabled={busy || disabled} className={action.startsWith('delete') ? 'ba-menu-danger' : ''} onClick={() => { setMenu(null); onAction(action, menu); }}>{label}</button>)}</div>, document.body)}
  </aside>;
}
