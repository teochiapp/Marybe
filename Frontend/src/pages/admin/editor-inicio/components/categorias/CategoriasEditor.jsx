import React, { useCallback, useMemo, useState } from 'react';
import SectionEditorShell from '../SectionEditorShell';
import MediaLibraryDialog from '../MediaLibraryDialog';
import useSectionDraft from '../../hooks/useSectionDraft';
import CategoriasPartsPanel from './CategoriasPartsPanel';
import CategoriaPanel from './CategoriaPanel';
import OrdenPanel from './OrdenPanel';
import DisenoPanel from './DisenoPanel';
import OrderStrip from '../OrderStrip';
import { CATEGORIAS_AREAS, categoriasParts, categoryFromPart, categoryPart, changedCovers, moveItem, orderedCategories, toPreviewData } from './categoriasModel';

const AREA_KEYS = CATEGORIAS_AREAS.map(area => area.key);

export default function CategoriasEditor({ token, onBack, onLogout }) {
  const draft = useSectionDraft({ token, endpoint: '/api/categorias-inicio-admin', areaKeys: AREA_KEYS });
  const { data, areaKey, change, busy, overview, serverArea, setError, setMessage } = draft;
  const [part, setPart] = useState('orden');
  const [device, setDevice] = useState('desktop');
  const [library, setLibrary] = useState(null);

  const area = CATEGORIAS_AREAS.find(item => item.key === areaKey);
  const categories = useMemo(() => overview?.areas?.[areaKey]?.categorias || [], [overview, areaKey]);
  const parts = useMemo(() => categoriasParts(categories), [categories]);
  const activePart = parts.find(item => item.id === part) || parts.find(item => item.id === 'orden');
  const ordered = useMemo(() => (data ? orderedCategories(data, categories) : []), [data, categories]);
  const activeCategoryId = categoryFromPart(activePart?.id);
  const activeCategory = ordered.find(category => category.documentId === activeCategoryId);

  const selectPart = useCallback(id => {
    setPart(id);
    setError('');
  }, [setError]);

  const selectFromPreview = useCallback(id => {
    if (parts.some(item => item.id === id)) selectPart(id);
  }, [parts, selectPart]);

  function selectArea(nextArea) {
    if (draft.selectArea(nextArea) && categoryFromPart(part)) setPart('orden');
  }

  const moveCategory = useCallback((documentId, to) => change(next => {
    next.orden = moveItem(next.orden, next.orden.indexOf(documentId), to);
  }), [change]);

  function chooseMedia(file) {
    const image = { id: file.id, url: file.url, name: file.name, width: file.width, height: file.height };
    const target = library;
    change(next => { next.portadas[target] = image; });
    setLibrary(null);
  }

  function publish() {
    const covers = changedCovers(data, serverArea.published).length;
    const detail = covers ? ` Se ${covers === 1 ? 'actualizó 1 imagen' : `actualizaron ${covers} imágenes`} de portada en Strapi.` : '';
    draft.save(true, `Publicado. Las categorías de ${area.label} ya están actualizadas en Inicio.${detail}`, 'No se publicó ningún cambio:');
  }

  const catalogOrder = data ? data.orden.every((id, index) => id === categories[index]?.documentId) : true;
  const previewPayload = useMemo(() => (data ? { section: 'categorias', area: areaKey, previewData: toPreviewData(data, categories), selected: activePart?.id, mode: 'edit' } : null), [data, areaKey, categories, activePart]);

  return (
    <SectionEditorShell
      title="Categorías"
      locationText={<>Sección «Categorías» de <strong>{area.label}</strong></>}
      areas={CATEGORIAS_AREAS}
      draft={draft}
      device={device}
      onDevice={setDevice}
      previewPayload={previewPayload}
      previewTitle="Vista previa de Categorías"
      canvasCaption={`VISTA PREVIA · CATEGORÍAS · ${area.label.toUpperCase()}`}
      onSelectFromPreview={selectFromPreview}
      onSelectArea={selectArea}
      onSaveDraft={() => draft.save(false, 'Borrador guardado. La tienda y las categorías de Strapi no cambian hasta que publiques.')}
      onPublish={publish}
      onBack={onBack}
      onLogout={onLogout}
      sidebar={data && <CategoriasPartsPanel data={data} categories={categories} published={serverArea.published} selected={activePart?.id} onSelect={selectPart} />}
      stageTop={ordered.length > 1 && <OrderStrip
          items={ordered}
          selectedId={activeCategoryId}
          disabled={busy}
          title="Orden · arrastrá las tarjetas a izquierda o derecha"
          hint="También podés usar las flechas. Hacé clic en una tarjeta para cambiar su imagen."
          listLabel="Orden de las categorías (reordenable)"
          itemNoun="Categoría"
          onReorder={moveCategory}
          onSelect={id => selectPart(categoryPart(id))}
        />}
      inspectorTitle={activePart?.label}
      dialogs={library && <MediaLibraryDialog token={token} title={`Portada de ${ordered.find(category => category.documentId === library)?.nombre || 'la categoría'}`} onChoose={chooseMedia} onClose={() => setLibrary(null)} />}
    >
      {activeCategory && (
        <CategoriaPanel
          category={activeCategory}
          position={ordered.indexOf(activeCategory)}
          total={ordered.length}
          published={serverArea.published.portadas[activeCategory.documentId]}
          onChooseImage={() => setLibrary(activeCategory.documentId)}
          onRestoreImage={() => change(next => { next.portadas[activeCategory.documentId] = serverArea.published.portadas[activeCategory.documentId]; })}
          onMove={step => moveCategory(activeCategory.documentId, ordered.indexOf(activeCategory) + step)}
        />
      )}
      {activePart?.id === 'orden' && (
        <OrdenPanel
          categories={ordered}
          catalogOrder={catalogOrder}
          onMove={moveCategory}
          onRestoreCatalogOrder={() => { change(next => { next.orden = categories.map(category => category.documentId); }); setMessage('Se aplicó el orden del catálogo. Publicá para guardarlo.'); }}
        />
      )}
      {(activePart?.id === 'forma' || activePart?.id === 'botones') && <DisenoPanel part={activePart.id} data={data} onChange={change} />}
      {!categories.length && <p className="ba-hint">No hay categorías publicadas en {area.label}.</p>}
    </SectionEditorShell>
  );
}
