import React, { useCallback, useMemo, useState } from 'react';
import axios from 'axios';
import SectionEditorShell from '../SectionEditorShell';
import MediaLibraryDialog from '../MediaLibraryDialog';
import useSectionDraft from '../../hooks/useSectionDraft';
import DestacadaPartsPanel from './DestacadaPartsPanel';
import TextosPanel from './TextosPanel';
import ImagenPanel from './ImagenPanel';
import ProductosPanel from './ProductosPanel';
import BannerInferiorPanel from './BannerInferiorPanel';
import { DESTACADA_AREAS, areaInfo, bannerIndex, destacadaParts, newBottomBanner, publishProblems, toPreviewData } from './destacadaModel';

const AREA_KEYS = DESTACADA_AREAS.map(area => area.key);

export default function DestacadaEditor({ token, onBack, onLogout }) {
  const [productIndex, setProductIndex] = useState({});
  const rememberProducts = useCallback(next => setProductIndex(previous => ({ ...previous, ...next.products })), []);
  const draft = useSectionDraft({ token, endpoint: '/api/destacada-admin', areaKeys: AREA_KEYS, onOverview: rememberProducts });
  const { data, areaKey, change, busy, api, auth, setError, setMessage } = draft;
  const [part, setPart] = useState('textos');
  const [device, setDevice] = useState('desktop');
  const [library, setLibrary] = useState(null);

  const area = areaInfo(areaKey);
  const parts = useMemo(() => (data ? destacadaParts(areaKey, data) : []), [areaKey, data]);
  const activePart = parts.find(item => item.id === part) || parts[0];

  const searchProducts = useCallback(async query => {
    const response = await axios.get(`${api}/api/destacada-admin/productos`, { ...auth, params: { area: areaKey, q: query } });
    const list = response.data.data || [];
    setProductIndex(previous => ({ ...previous, ...Object.fromEntries(list.map(product => [product.documentId, product])) }));
    return list;
  }, [api, auth, areaKey]);

  const selectPart = useCallback(id => {
    setPart(id);
    setError('');
  }, [setError]);

  const selectFromPreview = useCallback(id => {
    if (parts.some(item => item.id === id)) selectPart(id);
    // Los banners predeterminados (sin banners cargados) no tienen panel propio.
    else if (bannerIndex(id) !== null && area.banners) setMessage('Ese banner es el predeterminado de la tienda. Agregá un banner inferior para reemplazarlo.');
  }, [parts, selectPart, area.banners, setMessage]);

  function selectArea(nextArea) {
    if (draft.selectArea(nextArea) && !areaInfo(nextArea).banners && bannerIndex(part) !== null) setPart('textos');
  }

  function publish() {
    const problems = publishProblems(data, areaKey);
    if (problems.length) {
      setError(`Antes de publicar: ${problems.map(problem => problem.message).join(' ')}`);
      setPart(problems[0].part);
      return;
    }
    draft.save(true, `Publicado. La Sección Destacada de ${area.label} ya está actualizada en Inicio.`);
  }

  function chooseMedia(file) {
    const image = { id: file.id, url: file.url, name: file.name, width: file.width, height: file.height };
    const target = library;
    change(next => {
      const index = bannerIndex(target);
      if (index !== null) next.banners[index].imagen = image;
      else next[target] = image;
    });
    setLibrary(null);
  }

  function addBanner() {
    const index = data.banners.length;
    change(next => { next.banners.push(newBottomBanner()); });
    setPart(`banner-${index}`);
  }

  function removeBanner(index) {
    change(next => { next.banners.splice(index, 1); });
    setPart(index > 0 ? `banner-${index - 1}` : 'productos');
  }

  // Al ajustar el tamaño de una imagen se muestra el dispositivo correspondiente en el lienzo.
  const showDevice = useCallback(target => setDevice(current => (target === 'mobile' ? 'mobile' : current === 'mobile' ? 'desktop' : current)), []);

  const previewPayload = useMemo(() => (data ? { section: 'seccion-destacada', area: areaKey, previewData: toPreviewData(data, productIndex), selected: activePart?.id, mode: 'edit' } : null), [data, areaKey, productIndex, activePart]);
  const libraryTitle = library === 'imagen_mobile' ? 'Imagen para celular' : library === 'imagen_desktop' ? 'Imagen para computadora' : 'Imagen del banner inferior';
  const index = bannerIndex(activePart?.id);

  return (
    <SectionEditorShell
      title="Sección Destacada"
      locationText={<>«Lo nuevo en Marybe» de <strong>{area.label}</strong></>}
      areas={DESTACADA_AREAS}
      draft={draft}
      device={device}
      onDevice={setDevice}
      previewPayload={previewPayload}
      previewTitle="Vista previa de la Sección Destacada"
      canvasCaption={`VISTA PREVIA · LO NUEVO EN MARYBE · ${area.label.toUpperCase()}`}
      onSelectFromPreview={selectFromPreview}
      onSelectArea={selectArea}
      onSaveDraft={() => draft.save(false, 'Borrador guardado. La tienda sigue mostrando la última publicación.')}
      onPublish={publish}
      onBack={onBack}
      onLogout={onLogout}
      sidebar={data && <DestacadaPartsPanel areaKey={areaKey} data={data} selected={activePart?.id} busy={busy} onSelect={selectPart} onAddBanner={addBanner} />}
      inspectorTitle={activePart?.label}
      dialogs={library && <MediaLibraryDialog token={token} title={libraryTitle} onChoose={chooseMedia} onClose={() => setLibrary(null)} />}
    >
      {activePart?.id === 'textos' && <TextosPanel areaKey={areaKey} data={data} onChange={change} />}
      {activePart?.id === 'imagen' && <ImagenPanel data={data} device={device} onChooseImage={setLibrary} onChange={change} onShowDevice={showDevice} />}
      {activePart?.id === 'productos' && <ProductosPanel areaLabel={area.label} data={data} productIndex={productIndex} searchProducts={searchProducts} onChange={change} />}
      {index !== null && data.banners[index] && <BannerInferiorPanel index={index} banner={data.banners[index]} onChooseImage={setLibrary} onChange={change} onRemove={() => removeBanner(index)} onShowDevice={showDevice} />}
    </SectionEditorShell>
  );
}
