import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FiArrowDown, FiArrowUp, FiChevronRight, FiDroplet, FiEye, FiEyeOff, FiHome, FiLayers, FiMenu, FiMove } from 'react-icons/fi';
import useSectionDraft from '../hooks/useSectionDraft';
import { EDITOR_INICIO_SECTIONS, sectionPath } from '../editorInicioSections';
import { normalizarComposicion } from '../../../inicio/composicionInicio';

const AREAS = ['perfumeria', 'hogar'];

const Panel = styled.section`
  width: 100%;
  max-width: 1100px;
  min-width: 0;
  margin: 0 auto;
  background: white;
  padding: 28px 32px;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);

  h1 { color: #5c0a0a; }

  button {
    cursor: pointer;
    padding: 8px;
    min-height: 40px;
    border: 1px solid #ddd1cb;
    border-radius: 8px;
    background: white;
    color: #5c0a0a;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
  }
  button:disabled { opacity: .45; cursor: default; }
  button:not(:disabled):hover { background: #fbf5f2; border-color: #6a0304; }
  button:focus-visible, a:focus-visible { outline: 3px solid #9e5b36; outline-offset: 3px; }

  nav { display: flex; gap: 8px; flex-wrap: wrap; margin: 16px 0; }
  nav [aria-pressed="true"] { background: #5c0a0a; color: white; }

  .sections-list-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
    margin: 24px 0 12px;
    padding: 0 4px;

    h2 {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      color: #5c0a0a;
    }

    .sections-list-tip {
      font-size: 12px;
      color: #8a7466;
    }
  }

  ol { padding: 0; list-style: none; margin: 12px 0 0; }

  li {
    display: grid;
    grid-template-columns: 280px minmax(0, 1fr) auto;
    align-items: center;
    gap: 24px;
    padding: 16px 20px;
    margin: 14px 0;
    border: 1px solid #e8dcd3;
    border-radius: 12px;
    background: #ffffff;
    box-shadow: 0 2px 8px rgba(92, 10, 10, 0.04);
    transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
  }

  li:hover {
    border-color: #c8a68b;
    box-shadow: 0 4px 16px rgba(92, 10, 10, 0.07);
  }

  li[data-dragging="true"] { opacity: .55; transform: scale(0.99); }
  li[data-drop="true"] { outline: 3px solid #5c0a0a; background: #fff3eb; }

  /* Columna izquierda: miniatura rectangular grande */
  .section-preview {
    position: relative;
    width: 100%;
    max-width: 280px;
    aspect-ratio: 16 / 9;
    background: #faf6f4;
    border: 1px solid #ebd8db;
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 1px 4px rgba(92, 10, 10, 0.04);
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .preview-link {
    display: block;
    width: 100%;
    height: 100%;
    text-decoration: none;
    cursor: pointer;
  }
  .preview-link:hover {
    border-color: #c8a68b;
  }

  .section-preview img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 4px;
    transition: transform 0.2s ease, opacity 0.2s ease, filter 0.2s ease;
  }
  .preview-link:hover img {
    transform: scale(1.02);
  }

  .section-preview.is-hidden img {
    opacity: 0.55;
    filter: grayscale(35%);
  }

  .section-preview.preview-placeholder {
    color: #a48f86;
    font-size: 12px;
    font-weight: 500;
    border-style: dashed;
    border-color: #dcd0cb;
    background: #fdfaf8;
  }

  /* Columna central: información y metadatos */
  .section-info {
    min-width: 0;
  }

  .section-header-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 6px;
  }

  .section-index {
    font-family: var(--font-family-primary);
    font-size: 18px;
    font-weight: 700;
    color: #a48f86;
    letter-spacing: -0.02em;
    line-height: 1;
  }

  .section-status-pill {
    display: inline-flex;
    align-items: center;
    padding: 3px 9px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: .02em;
    line-height: 1;
    text-transform: uppercase;
  }

  .section-status-pill.is-visible {
    background: #eef8f1;
    color: #1e7e34;
    border: 1px solid #c7ebd1;
  }

  .section-status-pill.is-hidden {
    background: #fff0f1;
    color: #8a1d22;
    border: 1px solid #ebd0d2;
  }

  .section-title {
    margin: 0;
    font-size: 17px;
    font-weight: 700;
    color: #3b181e;
    line-height: 1.35;
    overflow-wrap: anywhere;
  }

  .section-desc {
    margin: 6px 0 0;
    color: #786960;
    font-size: 13px;
    line-height: 1.45;
  }

  /* Columna derecha: acciones agrupadas */
  .section-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    flex-wrap: wrap;
  }

  [data-handle] {
    touch-action: none;
    user-select: none;
    cursor: grab;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border-radius: 8px;
    background: #faf6f3;
    border: 1px solid #e5d7cf;
    color: #6a0304;
    transition: background 0.15s, border-color 0.15s;
  }
  [data-handle]:hover {
    background: #f4e8e1;
    border-color: #6a0304;
  }
  [data-handle]:active {
    cursor: grabbing;
  }

  .action-arrow {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    padding: 0;
  }

  .action-visibility {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 38px;
    padding: 0 14px;
    font-size: 13px;
    font-weight: 600;
    color: #5c0a0a;
    background: white;
    border: 1px solid #ddd1cb;
    border-radius: 8px;
    transition: background 0.15s, border-color 0.15s;
  }
  .action-visibility:hover:not(:disabled) {
    background: #fbf5f2;
    border-color: #6a0304;
  }
  .action-visibility svg {
    flex-shrink: 0;
  }

  .action-edit {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 38px;
    padding: 0 20px;
    border: 1px solid #5c0a0a;
    border-radius: 8px;
    background: #5c0a0a;
    color: #ffffff;
    font-size: 13px;
    font-weight: 700;
    text-decoration: none;
    box-shadow: 0 2px 5px rgba(92, 10, 10, 0.15);
    transition: background 0.15s, border-color 0.15s, box-shadow 0.15s, transform 0.15s;
  }
  .action-edit:hover {
    background: #790e0e;
    border-color: #790e0e;
    box-shadow: 0 3px 8px rgba(106, 3, 4, 0.3);
    transform: translateY(-1px);
  }

  /* Barra inferior persistente de publicación */
  .actions {
    position: sticky;
    bottom: 20px;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    margin: 28px 0 0;
    padding: 14px 20px;
    background: #ffffff;
    border: 1px solid #e8dcd3;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(92, 10, 10, 0.1);
  }

  .actions-buttons {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .actions button.ba-primary {
    background: #5c0a0a;
    color: white;
    border-color: #5c0a0a;
    font-weight: 700;
    padding: 8px 20px;
  }
  .actions button.ba-primary:not(:disabled):hover {
    background: #7c0405;
    border-color: #7c0405;
  }

  .actions-status {
    margin: 0;
    font-size: 13px;
    font-weight: 600;
    color: #786960;
  }
  .actions-status.is-dirty {
    color: #8a1d22;
  }

  @media (max-width: 850px) {
    li {
      grid-template-columns: 220px minmax(0, 1fr);
      gap: 16px;
      padding: 16px;
    }
    .section-preview {
      max-width: 220px;
    }
    .section-actions {
      grid-column: 1 / -1;
      justify-content: flex-end;
    }
  }

  @media (max-width: 600px) {
    padding: 16px;
    li {
      grid-template-columns: 1fr;
      gap: 14px;
    }
    .section-preview {
      max-width: 100%;
    }
    .section-actions {
      grid-column: 1;
      justify-content: flex-end;
    }
    .section-actions .action-edit {
      flex: 1;
      max-width: 140px;
    }
    .actions {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
    }
    .actions-buttons {
      width: 100%;
      justify-content: flex-start;
    }
  }
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

  const sections = [
    ...EDITOR_INICIO_SECTIONS.filter(item => item.id !== 'menu-header'),
    {
      id: 'descubri-mas',
      title: 'Descubrí más',
      description: 'Bloque con accesos y destacados para explorar más productos de la tienda.',
      previewImage: '/capturas-admin-editor/11-descubri-mas.png',
    },
  ];

  const move = (id, to) => draft.change(next => {
    const from = next.orden.indexOf(id);
    if (from < 0 || to < 0 || to >= next.orden.length) return;
    next.orden.splice(to, 0, next.orden.splice(from, 1)[0]);
  });

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
    drag.current = { id, target: id, pointerId: event.pointerId, startY: event.clientY, x: event.clientX, y: event.clientY, moved: false };
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

  return (
    <Panel aria-label="Composición de Inicio">
      <SelectorHeader>
        <div>
          <p className="eyebrow"><FiLayers aria-hidden="true" /> Página principal</p>
          <h1>Organizar Inicio</h1>
          <p className="intro">Elegí un área y organizá sus secciones. Arrastrá o usá las flechas para cambiar el orden, y configurá su visibilidad.</p>
        </div>
        <MenuSettingsLink to={sectionPath('menu-header')} aria-label="Editar Menú Header / Mega Menú">
          <span className="menu-icon"><FiMenu size={20} aria-hidden="true" /></span>
          <span className="menu-copy">
            <strong>Editar Menú Header / Mega Menú</strong>
            <small>Configuración de la navegación</small>
          </span>
          <FiChevronRight size={18} aria-hidden="true" />
        </MenuSettingsLink>
      </SelectorHeader>

      <AreaControls>
        <div>
          <p className="area-label">Área que estás organizando</p>
          <nav aria-label="Área de Inicio">
            {AREAS.map(area => (
              <button key={area} disabled={draft.busy} aria-pressed={draft.areaKey === area} onClick={() => draft.selectArea(area)}>
                {area === 'hogar' ? <FiHome aria-hidden="true" /> : <FiDroplet aria-hidden="true" />}
                {area === 'hogar' ? 'Hogar' : 'Perfumería'}
              </button>
            ))}
          </nav>
        </div>
        {draft.data && (
          <p className="area-summary">
            <strong>{draft.data.orden.length - draft.data.ocultos.length} de {draft.data.orden.length}</strong> secciones visibles
          </p>
        )}
      </AreaControls>

      {draft.loading && <p>Cargando composición…</p>}
      {draft.error && <p role="alert">{draft.error}</p>}
      {draft.message && <p role="status">{draft.message}</p>}

      {draft.data && (
        <>
          <div className="sections-list-header">
            <h2>Secciones de la página</h2>
            <span className="sections-list-tip">Arrastrá para ordenar o usá las flechas de cada tarjeta</span>
          </div>

          <ol aria-label="Secciones de la página de inicio">
            {draft.data.orden.map((id, index) => {
              const section = sections.find(item => item.id === id);
              if (!section) return null;
              const hidden = draft.data.ocultos.includes(id);

              return (
                <li
                  key={id}
                  data-composition-id={id}
                  data-dragging={dragState?.id === id}
                  data-drop={dragState?.target === id && dragState?.id !== id}
                >
                  <div className={`section-preview ${hidden ? 'is-hidden' : ''} ${!section.previewImage ? 'preview-placeholder' : ''}`}>
                    {section.previewImage ? (
                      id !== 'descubri-mas' ? (
                        <Link
                          to={sectionPath(id)}
                          className="preview-link"
                          aria-label={`Editar sección ${section.title}`}
                          tabIndex={-1}
                        >
                          <img src={section.previewImage} alt="" />
                        </Link>
                      ) : (
                        <img src={section.previewImage} alt="" />
                      )
                    ) : (
                      <span>Sin vista previa</span>
                    )}
                  </div>

                  <div className="section-info">
                    <div className="section-header-meta">
                      <span className="section-index">{String(index + 1).padStart(2, '0')}</span>
                      <span className={`section-status-pill ${hidden ? 'is-hidden' : 'is-visible'}`}>
                        {hidden ? 'Oculta' : 'Visible'}
                      </span>
                    </div>
                    <div className="section-title">{section.title}</div>
                    {section.description && <p className="section-desc">{section.description}</p>}
                  </div>

                  <div className="section-actions">
                    <button
                      data-handle
                      disabled={draft.busy}
                      aria-label={`Mover ${section.title}`}
                      onKeyDown={event => {
                        if (event.key === 'Escape') cancelDrag();
                        if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
                          event.preventDefault();
                          move(id, index + (event.key === 'ArrowUp' ? -1 : 1));
                        }
                      }}
                      onPointerDown={event => pointerDown(event, id)}
                      onPointerMove={pointerMove}
                      onPointerUp={pointerUp}
                      onPointerCancel={cancelDrag}
                      onLostPointerCapture={cancelDrag}
                    >
                      <FiMove aria-hidden="true" />
                    </button>
                    <button
                      className="action-arrow"
                      disabled={draft.busy || index === 0}
                      aria-label={`Subir ${section.title}`}
                      onClick={() => move(id, index - 1)}
                    >
                      <FiArrowUp aria-hidden="true" />
                    </button>
                    <button
                      className="action-arrow"
                      disabled={draft.busy || index === draft.data.orden.length - 1}
                      aria-label={`Bajar ${section.title}`}
                      onClick={() => move(id, index + 1)}
                    >
                      <FiArrowDown aria-hidden="true" />
                    </button>
                    <button
                      className="action-visibility"
                      disabled={draft.busy}
                      aria-label={`${hidden ? 'Mostrar' : 'Ocultar'} ${section.title}`}
                      aria-pressed={!hidden}
                      onClick={() =>
                        draft.change(next => {
                          next.ocultos = hidden ? next.ocultos.filter(item => item !== id) : [...next.ocultos, id];
                        })
                      }
                    >
                      {hidden ? (
                        <>
                          <FiEyeOff aria-hidden="true" />
                          <span>Mostrar</span>
                        </>
                      ) : (
                        <>
                          <FiEye aria-hidden="true" />
                          <span>Ocultar</span>
                        </>
                      )}
                    </button>
                    {id !== 'descubri-mas' && (
                      <Link to={sectionPath(id)} className="action-edit">
                        Editar
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="actions">
            <div className="actions-buttons">
              <button
                className="ba-primary"
                disabled={draft.busy || !draft.dirty}
                onClick={() => draft.save(true, 'Composición publicada.')}
              >
                Publicar
              </button>
              <button disabled={!draft.canUndo || draft.busy} onClick={draft.undo}>
                Deshacer
              </button>
              <button disabled={!draft.canRedo || draft.busy} onClick={draft.redo}>
                Rehacer
              </button>
              <button
                disabled={draft.busy}
                onClick={() =>
                  draft.change(next => {
                    next.orden = normalizarComposicion(null, draft.areaKey).orden;
                  })
                }
              >
                Restaurar orden original
              </button>
            </div>
            {(!draft.message || draft.dirty || dragState) && (
              <p className={`actions-status ${draft.dirty ? 'is-dirty' : ''}`} role="status">
                {dragState
                  ? `Soltar en la posición de ${sections.find(item => item.id === dragState.target)?.title || ''}. Escape para cancelar.`
                  : draft.dirty
                    ? '● Cambios sin guardar.'
                    : draft.hasDraft
                      ? '● Borrador guardado; pendiente de publicación.'
                      : 'Composición publicada.'}
              </p>
            )}
          </div>
        </>
      )}
    </Panel>
  );
}
