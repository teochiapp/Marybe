import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import SectionEditorShell from '../SectionEditorShell';
import OrderStrip from '../OrderStrip';
import useSectionDraft from '../../hooks/useSectionDraft';
import { acquireDedupedRequest, isRequestCanceled } from '../../../../../utils/requestDedup';
import CategoriaDestacadaPartsPanel from './CategoriaDestacadaPartsPanel';
import ContenidoPanel from './ContenidoPanel';
import ProductosCategoriaPanel from './ProductosCategoriaPanel';
import DisenoCategoriaDestacadaPanel from './DisenoCategoriaDestacadaPanel';
import { AREA_COLORS, CATEGORIA_DESTACADA_AREAS, CATEGORIA_DESTACADA_MODULES, CATEGORIA_DESTACADA_PARTS, moveItem, publishProblems, shownProducts, toPreviewData } from './categoriaDestacadaModel';

const PRODUCTS_ENDPOINT = '/api/categoria-destacada-admin/productos';
const AREA_KEYS = CATEGORIA_DESTACADA_AREAS.map(area => area.key);

export default function CategoriaDestacadaEditor({ token, onBack, onLogout, moduleKey = 'categoria-destacada-1' }) {
  const moduleInfo = CATEGORIA_DESTACADA_MODULES[moduleKey] || CATEGORIA_DESTACADA_MODULES['categoria-destacada-1'];
  const [productIndex, setProductIndex] = useState({});
  const remember = useCallback(list => setProductIndex(previous => ({ ...previous, ...Object.fromEntries(list.map(product => [product.documentId, product])) })), []);
  const rememberOverview = useCallback(next => remember(Object.values(next.products || {})), [remember]);
  const draft = useSectionDraft({ token, endpoint: moduleInfo.endpoint, areaKeys: AREA_KEYS, onOverview: rememberOverview });
  const { data, areaKey, change, busy, api, auth, overview, setError } = draft;
  const [part, setPart] = useState('contenido');
  const [device, setDevice] = useState('desktop');
  const [automatic, setAutomatic] = useState({ categoria: null, items: [] });

  const area = CATEGORIA_DESTACADA_AREAS.find(item => item.key === areaKey);
  const categories = useMemo(() => overview?.categorias || [], [overview]);
  const categoria = data?.categoria || null;
  const categoryName = categories.find(category => category.documentId === categoria)?.nombre || '';
  const activePart = CATEGORIA_DESTACADA_PARTS.find(item => item.id === part);

  const loadProducts = useCallback(async (query, page, signal) => {
    const response = await axios.get(`${api}${PRODUCTS_ENDPOINT}`, {
      ...auth,
      ...(signal ? { signal } : {}),
      params: { categoria, q: query, page },
    });
    remember(response.data.data.items);
    return response.data.data;
  }, [api, auth, categoria, remember]);

  // Productos que la tienda muestra en modo automático (primera página de la categoría).
  useEffect(() => {
    if (!categoria) { setAutomatic({ categoria: null, items: [] }); return undefined; }
    let active = true;
    const request = acquireDedupedRequest(
      `categoria-destacada-auto:${token || ''}:${categoria}`,
      signal => loadProducts('', 1, signal)
    );
    request.promise
      .then(response => { if (active) setAutomatic({ categoria, items: response.items }); })
      .catch(err => { if (active && !isRequestCanceled(err)) setAutomatic({ categoria, items: [] }); });
    return () => { active = false; request.release(); };
  }, [categoria, token, loadProducts]);

  const automaticItems = useMemo(() => (automatic.categoria === categoria ? automatic.items : []), [automatic, categoria]);
  const shown = useMemo(() => (data ? shownProducts(data, productIndex, automaticItems) : []), [data, productIndex, automaticItems]);

  const selectPart = useCallback(id => {
    setPart(id);
    setError('');
  }, [setError]);

  const selectFromPreview = useCallback(id => {
    if (id === 'titulo') selectPart('contenido');
    if (id === 'productos') selectPart('productos');
    if (id === 'seccion') selectPart('diseno');
  }, [selectPart]);

  // Cambiar de categoría descarta la selección anterior: sus productos no pertenecen a la nueva.
  function changeCategory(nextCategory) {
    if (nextCategory === categoria) return;
    if (data.productos.length && !window.confirm(`Cambiar la categoría quita los ${data.productos.length} productos elegidos, porque pertenecen a la categoría anterior. ¿Continuar?`)) return;
    change(next => { next.categoria = nextCategory; next.productos = []; });
  }

  const moveProduct = useCallback((documentId, to) => change(next => {
    next.productos = moveItem(next.productos, next.productos.indexOf(documentId), to);
  }), [change]);

  function publish() {
    const problems = publishProblems(data);
    if (problems.length) {
      setError(`Antes de publicar: ${problems.map(problem => problem.message).join(' ')}`);
      setPart(problems[0].part);
      return;
    }
    draft.save(true, `Publicado. ${moduleInfo.title} de ${area.label} ya está actualizada en Inicio.`, 'No se publicó ningún cambio:');
  }

  const areaColor = AREA_COLORS[areaKey] || AREA_COLORS.perfumeria;
  const selectedPreviewPart = part === 'contenido' ? 'titulo' : part === 'diseno' ? 'seccion' : 'productos';
  const previewPayload = useMemo(() => (data ? { section: moduleInfo.key, area: areaKey, previewData: toPreviewData(data, productIndex, automaticItems), selected: selectedPreviewPart, mode: 'edit' } : null), [data, moduleInfo.key, areaKey, productIndex, automaticItems, selectedPreviewPart]);
  const selectedProducts = data ? data.productos.map(id => productIndex[id]).filter(Boolean) : [];

  return (
    <SectionEditorShell
      title={moduleInfo.title}
      locationText={<>{moduleInfo.ordinal} de <strong>{area.label}</strong></>}
      areas={CATEGORIA_DESTACADA_AREAS}
      draft={draft}
      device={device}
      onDevice={setDevice}
      previewPayload={previewPayload}
      previewTitle={`Vista previa de ${moduleInfo.title}`}
      canvasCaption={`VISTA PREVIA · ${moduleInfo.eyebrow} · ${area.label.toUpperCase()}`}
      onSelectFromPreview={selectFromPreview}
      onSelectArea={draft.selectArea}
      onSaveDraft={() => draft.save(false, 'Borrador guardado. La tienda sigue mostrando la última publicación.')}
      onPublish={publish}
      onBack={onBack}
      onLogout={onLogout}
      sidebar={data && <CategoriaDestacadaPartsPanel moduleInfo={moduleInfo} data={data} categoryName={categoryName} shown={shown} selected={part} onSelect={selectPart} />}
      stageTop={selectedProducts.length > 1 && (
        <OrderStrip
          items={selectedProducts}
          disabled={busy}
          title="Orden de los productos · arrastrá las tarjetas a izquierda o derecha"
          hint="También podés usar las flechas. El orden solo se aplica a esta sección."
          listLabel="Orden de los productos (reordenable)"
          itemNoun="Producto"
          onReorder={moveProduct}
          onSelect={() => selectPart('productos')}
        />
      )}
      inspectorTitle={activePart?.label}
    >
      {!shown.length && categoria && <p className="ba-notice" role="status">Sin productos para mostrar: en la tienda esta sección no aparece.</p>}
      {part === 'contenido' && <ContenidoPanel data={data} categories={categories} defaultTitle={overview?.defaultTitle} areaColor={areaColor} onChange={change} onCategoryChange={changeCategory} />}
      {part === 'productos' && <ProductosCategoriaPanel data={data} categoryName={categoryName} productIndex={productIndex} automatic={automaticItems} loadProducts={loadProducts} onChange={change} onMove={moveProduct} />}
      {part === 'diseno' && <DisenoCategoriaDestacadaPanel data={data} device={device} areaColor={areaColor} onChange={change} onShowDevice={setDevice} />}
    </SectionEditorShell>
  );
}

export function CategoriaDestacada2Editor(props) {
  return <CategoriaDestacadaEditor {...props} moduleKey="categoria-destacada-2" />;
}
