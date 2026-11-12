import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FiArrowDown, FiArrowUp, FiChevronRight, FiDroplet, FiEye, FiEyeOff, FiHome, FiLayers, FiMenu, FiMove } from 'react-icons/fi';
import useSectionDraft from '../hooks/useSectionDraft';
import { EDITOR_INICIO_SECTIONS, sectionPath } from '../editorInicioSections';
import { normalizarComposicion } from '../../../inicio/composicionInicio';
const AREAS = ['perfumeria', 'hogar'];
const Panel = styled.section`
  width:100%; min-width:0; background:white; padding:24px; border-radius:16px;
  h1 {color:#5c0a0a;}
  button {cursor:pointer; padding:8px; min-height:40px; border:1px solid #ddd1cb; border-radius:8px; background:white; color:#5c0a0a;}
  button:disabled {opacity:.45; cursor:default;}
  button:focus-visible, a:focus-visible {outline:3px solid #9e5b36; outline-offset:3px;}
  nav, .actions {display:flex; gap:8px; flex-wrap:wrap; margin:16px 0;}
  nav [aria-pressed="true"] {background:#5c0a0a; color:white;}
  .actions button:first-child {background:#5c0a0a; color:white;}
  ol {padding:0; list-style:none;}
  li {display:flex; align-items:center; flex-wrap:wrap; gap:12px; min-height:96px; border:1px solid #ded6d0; border-radius:12px; padding:18px; margin:10px 0; background:#fff;}
  li[data-dragging="true"] {opacity:.55;}
  li[data-drop="true"] {outline:3px solid #5c0a0a; background:#fff3eb;}
  li img {width:80px;height:50px;object-fit:cover; border-radius:6px;}
  li span {flex:1;min-width:130px; overflow-wrap:anywhere;}
  li small {display:block; color:#70645f;}
  .row-actions {display:flex; align-items:center; gap:6px;}
  .row-actions a {display:inline-flex; align-items:center; justify-content:center; min-height:40px; padding:0 16px; border:1px solid #5c0a0a; border-radius:8px; background:#5c0a0a; color:#fff; font-size:13px; font-weight:700; text-decoration:none; box-shadow:0 2px 5px #5c0a0a24;}
  .row-actions a:hover {background:#790e0e; border-color:#790e0e;}
  [data-handle] {touch-action:none; user-select:none; cursor:grab;}
  @media(max-width:600px) {padding:14px; li {gap:8px;min-height:96px;padding:14px;} li img {width:52px;height:40px;} li span {min-width:100px;} .row-actions {width:100%;justify-content:flex-end;} .row-actions a {flex:1;max-width:140px;}}
`;
const SelectorHeader = styled.header`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(240px, 330px);
  align-items: center;
  gap: 28px;
  padding: 8px 0 28px;
  border-bottom: 1px solid #eee5df;

  .eyebrow { display: flex; align-items: center; gap: 7px; margin: 0 0 10px; color: #956d57; font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
  h1 { margin: 0 0 10px; font-family: var(--font-family-primary); font-size: clamp(28px, 3.6vw, 40px); line-height: 1.15; font-weight: 600; letter-spacing: -.025em; }
  .intro { max-width: 540px; margin: 0; color: #786960; font-size: 14px; line-height: 1.6; }

  @media(max-width:800px) { grid-template-columns: 1fr; gap: 20px; padding-bottom: 22px; }
`;
const MenuSettingsLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid #e8dcd3;
  border-radius: 12px;
  color: #5c0a0a;
  background: #fcf8f4;
  text-decoration: none;
  transition: background .15s, border-color .15s;
  .menu-icon { display: grid; place-items: center; flex-shrink: 0; width: 40px; height: 40px; border-radius: 10px; color: #5c0a0a; background: #f1e5dc; }
  .menu-copy { flex: 1; min-width: 0; }
  strong { display: block; font-size: 13px; line-height: 1.5; font-weight: 600; }
  small { display: block; margin-top: 3px; font-size: 11px; color: #8a7466; }
  > svg { flex-shrink: 0; }
  &:hover { background: #f6ece3; border-color: #c8a68b; }
`;
const AreaControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  padding: 24px 0 8px;
  .area-label { margin: 0 0 8px; color: #786960; font-size: 11px; font-weight: 600; }
  nav { display: inline-flex; flex-wrap: nowrap; gap: 4px; margin: 0; padding: 4px; border: 1px solid #e9ded5; border-radius: 12px; background: #f8f4f0; }
  nav button { display: flex; align-items: center; justify-content: center; gap: 8px; min-width: 140px; padding: 10px 20px; border: none; border-radius: 8px; background: transparent; color: #8a7466; font: inherit; font-size: 13px; font-weight: 600; }
  nav button[aria-pressed="true"] { background: #5c0a0a; color: white; box-shadow: 0 2px 5px #5c0a0a20; }
  .area-summary { margin: 0; color: #8a7466; font-size: 12px; }
  .area-summary strong { color: #5c0a0a; font-weight: 600; }
  @media(max-width:600px) { gap: 12px; padding-top: 20px; > div {width:100%;} nav {display:flex;} nav button {flex:1; min-width:0; padding:10px 14px;} }
`;
export default function SectionSelector({ token }) {
  const draft = useSectionDraft({ token, endpoint: '/api/secciones-inicio-admin/composicion', areaKeys: AREAS });
  const drag = useRef(null);
  const animationFrame = useRef(null);
  const [dragState, setDragState] = useState(null);
  const cancelDrag = () => { drag.current = null; cancelAnimationFrame(animationFrame.current); setDragState(null); };
  useEffect(() => () => cancelAnimationFrame(animationFrame.current), []);
  const sections = [...EDITOR_INICIO_SECTIONS.filter(item => item.id !== 'menu-header'), { id:'descubri-mas', title:'Descubrí más' }];
  const move = (id, to) => draft.change(next => { const from=next.orden.indexOf(id); if(from<0 || to<0 || to>=next.orden.length) return; next.orden.splice(to,0,next.orden.splice(from,1)[0]); });
  const updateTarget = () => {
    const current = drag.current;
    if (!current?.moved) return;
    const target = document.elementFromPoint(current.x, current.y)?.closest('[data-composition-id]')?.dataset.compositionId;
    if (target) current.target = target;
    setDragState({ id: current.id, target: current.target });
  };
  const autoScroll = () => {
    const current = drag.current;
    if (!current) return;
    if (current.moved) {
      const delta = current.y < 90 ? -14 : current.y > window.innerHeight - 90 ? 14 : 0;
      if (delta) { window.scrollBy(0, delta); updateTarget(); }
    }
    animationFrame.current = requestAnimationFrame(autoScroll);
  };
  const pointerDown = (event, id) => {
    if (draft.busy || event.button !== 0 || drag.current) return;
    drag.current = { id, target:id, pointerId:event.pointerId, startY:event.clientY, x:event.clientX, y:event.clientY, moved:false };
    event.currentTarget.setPointerCapture?.(event.pointerId);
    animationFrame.current = requestAnimationFrame(autoScroll);
  };
  const pointerMove = event => {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    current.x = event.clientX; current.y = event.clientY;
    current.moved ||= Math.abs(current.y - current.startY) > 5;
    updateTarget();
  };
  const pointerUp = event => {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    updateTarget();
    if (current.moved) move(current.id, draft.data.orden.indexOf(current.target));
    cancelDrag();
  };
  return <Panel aria-label="Composición de Inicio">
    <SelectorHeader>
      <div><p className="eyebrow"><FiLayers aria-hidden="true" /> Página principal</p><h1>Organizar Inicio</h1><p className="intro">Elegí un área y organizá sus secciones. Arrastrá para cambiar el orden y usá el ojo para mostrar u ocultar.</p></div>
      <MenuSettingsLink to={sectionPath('menu-header')} aria-label="Editar Menú Header / Mega Menú"><span className="menu-icon"><FiMenu size={20} aria-hidden="true" /></span><span className="menu-copy"><strong>Editar Menú Header / Mega Menú</strong><small>Configuración de la navegación</small></span><FiChevronRight size={18} aria-hidden="true" /></MenuSettingsLink>
    </SelectorHeader>
    <AreaControls>
      <div><p className="area-label">Área que estás organizando</p><nav aria-label="Área de Inicio">{AREAS.map(area => <button key={area} disabled={draft.busy} aria-pressed={draft.areaKey===area} onClick={()=>draft.selectArea(area)}>{area === 'hogar' ? <FiHome aria-hidden="true" /> : <FiDroplet aria-hidden="true" />}{area==='hogar'?'Hogar':'Perfumería'}</button>)}</nav></div>
      {draft.data && <p className="area-summary"><strong>{draft.data.orden.length - draft.data.ocultos.length} de {draft.data.orden.length}</strong> secciones visibles</p>}
    </AreaControls>
    {draft.loading && <p>Cargando composición…</p>}{draft.error && <p role="alert">{draft.error}</p>}{draft.message && <p role="status">{draft.message}</p>}
    {draft.data && <><div className="actions"><button className="ba-primary" disabled={draft.busy || !draft.dirty} onClick={()=>draft.save(true,'Composición publicada.')}>Publicar</button><button disabled={!draft.canUndo || draft.busy} onClick={draft.undo}>Deshacer</button><button disabled={!draft.canRedo || draft.busy} onClick={draft.redo}>Rehacer</button><button disabled={draft.busy} onClick={()=>draft.change(next=>Object.assign(next,normalizarComposicion(null,draft.areaKey)))}>Restaurar orden original</button></div>
    {(!draft.message || draft.dirty || dragState) && <p role="status">{dragState ? `Soltar en la posición de ${sections.find(item => item.id === dragState.target)?.title || ''}. Escape para cancelar.` : draft.dirty ? 'Cambios sin guardar.' : draft.hasDraft ? 'Borrador guardado; pendiente de publicación.' : 'Composición publicada.'}</p>}
    <ol aria-label="Secciones de la página de inicio">{draft.data.orden.map((id,index)=>{const section=sections.find(item=>item.id===id); if(!section)return null; const hidden=draft.data.ocultos.includes(id);return <li key={id} data-composition-id={id} data-dragging={dragState?.id === id} data-drop={dragState?.target === id && dragState?.id !== id} style={{opacity:hidden?0.65:undefined}}>
      <button data-handle disabled={draft.busy} aria-label={`Mover ${section.title}`} onKeyDown={event=>{if(event.key === 'Escape') cancelDrag(); if(['ArrowUp','ArrowDown'].includes(event.key)){event.preventDefault();move(id,index+(event.key==='ArrowUp'?-1:1));}}} onPointerDown={event=>pointerDown(event,id)} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={cancelDrag} onLostPointerCapture={cancelDrag}><FiMove /></button>
      {section.previewImage && <img src={section.previewImage} alt="" />}<span>{index+1}. {section.title}{hidden && <small>Oculta</small>}</span>
      <div className="row-actions">
      <button disabled={draft.busy} aria-label={`${hidden?'Mostrar':'Ocultar'} ${section.title}`} aria-pressed={!hidden} onClick={()=>draft.change(next=>{next.ocultos=hidden?next.ocultos.filter(item=>item!==id):[...next.ocultos,id];})}>{hidden?<FiEyeOff/>:<FiEye/>}</button>
      <button disabled={draft.busy || index===0} aria-label={`Subir ${section.title}`} onClick={()=>move(id,index-1)}><FiArrowUp /></button><button disabled={draft.busy || index===draft.data.orden.length-1} aria-label={`Bajar ${section.title}`} onClick={()=>move(id,index+1)}><FiArrowDown /></button>
      {id!=='descubri-mas' && <Link to={sectionPath(id)}>Editar</Link>}</div></li>;})}</ol>
    </>}
  </Panel>;
}
