import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import SectionEditorShell from '../SectionEditorShell';
import MediaLibraryDialog from '../MediaLibraryDialog';
import useSectionDraft from '../../hooks/useSectionDraft';
import { acquireDedupedRequest, isRequestCanceled } from '../../../../../utils/requestDedup';
import { DESCUENTOS_DEFAULTS } from '../../../../../utils/descuentosBloque';
import DescuentosPartsPanel from './DescuentosPartsPanel';
import ContenidoPanel from './ContenidoPanel';
import TextosPanel from './TextosPanel';
import ImagenPanel from './ImagenPanel';
import BotonPanel from './BotonPanel';
import { BLOQUE_INFO, DESCUENTOS_AREAS, DESCUENTOS_PARTS, destinoDeBloque, publishProblems, toPreviewData } from './descuentosModel';

const ENDPOINT = '/api/descuentos-admin';
const AREA_KEYS = DESCUENTOS_AREAS.map(area => area.key);
const PREVIEW_PARTS = { texto: 'texto', imagen: 'imagen', boton: 'boton' };

export default function DescuentosEditor({ token, onBack, onLogout }) {
  const draft = useSectionDraft({ token, endpoint: ENDPOINT, areaKeys: AREA_KEYS });
  const { data, areaKey, change, api, auth, setError } = draft;
  const [part, setPart] = useState('contenido');
  const [device, setDevice] = useState('desktop');
  const [library, setLibrary] = useState(null);
  const [entities, setEntities] = useState(null);
  const [entitiesError, setEntitiesError] = useState('');

  // Categorías, marcas y proveedores existentes en Strapi (solo lectura).
  useEffect(() => {
    let active = true;
    const request = acquireDedupedRequest(
      `descuentos-entidades:${token || ''}`,
      () => axios.get(`${api}${ENDPOINT}/entidades`, auth)
    );
    request.promise
      .then(response => { if (active) setEntities(response.data.data); })
      .catch(requestError => {
        if (active && !isRequestCanceled(requestError)) {
          setEntitiesError(requestError.response?.data?.error?.message || 'No se pudieron cargar las categorías, marcas y proveedores.');
        }
      });
    return () => {
      active = false;
      request.release();
    };
  }, [api, auth, token]);

  const area = DESCUENTOS_AREAS.find(item => item.key === areaKey);
  const activePart = DESCUENTOS_PARTS.find(item => item.id === part);
  const defaults = draft.overview?.defaults || DESCUENTOS_DEFAULTS;

  const selectPart = useCallback(id => {
    setPart(id);
    setError('');
  }, [setError]);

  const selectFromPreview = useCallback(id => { if (PREVIEW_PARTS[id]) selectPart(PREVIEW_PARTS[id]); }, [selectPart]);

  const showDevice = useCallback(target => {
    setDevice(current => (target === 'mobile' ? 'mobile' : current === 'mobile' ? 'desktop' : current));
  }, []);

  function chooseMedia(file) {
    const slot = library === 'imagen_mobile' ? 'imagen_mobile' : 'imagen';
    change(next => { next[slot] = { id: file.id, url: file.url, name: file.name, width: file.width, height: file.height }; });
    setLibrary(null);
  }

  function useCover(cover) {
    change(next => { next.imagen = { id: cover.id, url: cover.url, name: cover.name, width: cover.width, height: cover.height }; });
    selectPart('imagen');
  }

  function publish() {
    const problems = publishProblems(data);
    if (problems.length) {
      setError(`Antes de publicar: ${problems.map(problem => problem.message).join(' ')}`);
      setPart(problems[0].part);
      return;
    }
    draft.save(true, `Publicado. El ${area.label} de Descuentos ya está actualizado en Inicio.`, 'No se publicó ningún cambio:');
  }

  const previewPayload = useMemo(() => (data ? { section: 'descuentos', area: areaKey, previewData: toPreviewData(data, entities), selected: PREVIEW_PARTS[part] || '', mode: 'edit' } : null), [data, entities, areaKey, part]);

  return (
    <SectionEditorShell
      title="Descuentos"
      locationText={<>Sección «Descuentos» · <strong>{area.label}</strong> ({BLOQUE_INFO[areaKey].donde})</>}
      areas={DESCUENTOS_AREAS}
      draft={draft}
      device={device}
      onDevice={setDevice}
      previewPayload={previewPayload}
      previewTitle="Vista previa de Descuentos"
      canvasCaption={`VISTA PREVIA · DESCUENTOS · ${area.label.toUpperCase()}`}
      onSelectFromPreview={selectFromPreview}
      onSelectArea={draft.selectArea}
      onSaveDraft={() => draft.save(false, 'Borrador guardado. La tienda sigue mostrando la última publicación.')}
      onPublish={publish}
      onBack={onBack}
      onLogout={onLogout}
      sidebar={data && <DescuentosPartsPanel areaKey={areaKey} data={data} entities={entities} selected={part} onSelect={selectPart} />}
      inspectorTitle={activePart?.label}
      dialogs={library && <MediaLibraryDialog token={token} title={library === 'imagen_mobile' ? 'Imagen para celular del bloque' : 'Imagen promocional del bloque'} onChoose={chooseMedia} onClose={() => setLibrary(null)} />}
    >
      {part === 'contenido' && <ContenidoPanel data={data} entities={entities} entitiesError={entitiesError} onChange={change} onUseCover={useCover} />}
      {part === 'texto' && <TextosPanel data={data} defaults={defaults} onChange={change} />}
      {part === 'imagen' && <ImagenPanel areaKey={areaKey} data={data} device={device} onChooseImage={slot => setLibrary(slot || 'imagen')} onChange={change} onShowDevice={showDevice} />}
      {part === 'boton' && <BotonPanel areaKey={areaKey} data={data} entities={entities} defaults={defaults} destino={destinoDeBloque(data, areaKey, entities)} onChange={change} />}
    </SectionEditorShell>
  );
}
