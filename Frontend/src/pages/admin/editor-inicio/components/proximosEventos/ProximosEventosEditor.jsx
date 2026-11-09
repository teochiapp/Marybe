import React, { useCallback, useMemo, useState } from 'react';
import SectionEditorShell from '../SectionEditorShell';
import useSectionDraft from '../../hooks/useSectionDraft';
import OrderStrip from '../OrderStrip';
import ProximosEventosPartsPanel from './ProximosEventosPartsPanel';
import EncabezadoEventosPanel from './EncabezadoEventosPanel';
import OrdenEventosPanel from './OrdenEventosPanel';
import EventoIndividualPanel from './EventoIndividualPanel';
import DisenoEventosPanel from './DisenoEventosPanel';
import EnlaceInferiorEventosPanel from './EnlaceInferiorEventosPanel';
import {
  PART_DISENO,
  PART_ENCABEZADO,
  PART_ENLACE,
  PART_ORDEN,
  PROXIMOS_EVENTOS_AREAS,
  changedEventosCount,
  eventoFromPart,
  eventoPart,
  moveItem,
  orderedEventos,
  proximosEventosParts,
  toPreviewData,
  validateProximosEventosData,
} from './proximosEventosModel';

const AREA_KEYS = PROXIMOS_EVENTOS_AREAS.map(area => area.key);

export default function ProximosEventosEditor({ token, onBack, onLogout }) {
  const draft = useSectionDraft({
    token,
    endpoint: '/api/proximos-eventos-admin',
    areaKeys: AREA_KEYS,
  });
  const { data, areaKey, change, busy, overview, serverArea, setError, setMessage } = draft;
  const [part, setPart] = useState(PART_ENCABEZADO);
  const [device, setDevice] = useState('desktop');

  const eventosCatalogo = useMemo(
    () => overview?.areas?.[areaKey]?.eventosCatalogo || [],
    [overview, areaKey]
  );
  const parts = useMemo(
    () => proximosEventosParts(eventosCatalogo, data),
    [eventosCatalogo, data]
  );
  const activePart =
    parts.find(item => item.id === part) ||
    parts.find(item => item.id === PART_ENCABEZADO);
  const ordered = useMemo(
    () => (data ? orderedEventos(data, eventosCatalogo) : []),
    [data, eventosCatalogo]
  );
  const activeEventoId = eventoFromPart(activePart?.id);
  const activeEvento = ordered.find(ev => ev.documentId === activeEventoId);

  const selectPart = useCallback(
    id => {
      setPart(id);
      setError('');
    },
    [setError]
  );

  const selectFromPreview = useCallback(
    id => {
      if (parts.some(item => item.id === id)) selectPart(id);
    },
    [parts, selectPart]
  );

  const moveEvento = useCallback(
    (documentId, to) =>
      change(next => {
        next.orden = moveItem(next.orden, next.orden.indexOf(documentId), to);
      }),
    [change]
  );

  const updateEvento = useCallback(
    (documentId, patch) =>
      change(next => {
        if (!next.eventos) next.eventos = {};
        next.eventos[documentId] = {
          ...(next.eventos[documentId] || {}),
          ...patch,
        };
      }),
    [change]
  );

  const restoreEvento = useCallback(
    documentId => {
      const pub = serverArea?.published?.eventos?.[documentId];
      if (!pub) return;
      change(next => {
        next.eventos[documentId] = JSON.parse(JSON.stringify(pub));
      });
    },
    [change, serverArea]
  );

  function handleSaveDraft() {
    draft.save(
      false,
      'Borrador guardado. La página de Inicio y los eventos en Strapi no cambian hasta que publiques.'
    );
  }

  function handlePublish() {
    const validationError = validateProximosEventosData(data, eventosCatalogo);
    if (validationError) {
      setError(validationError);
      return;
    }
    const modifiedCount = changedEventosCount(data, serverArea?.published);
    const detail = modifiedCount
      ? ` Se ${modifiedCount === 1 ? 'actualizó 1 evento' : `actualizaron ${modifiedCount} eventos`} en Strapi.`
      : '';
    draft.save(
      true,
      `Publicado. La sección Próximos Eventos ya está actualizada en Inicio.${detail}`,
      'No se publicó ningún cambio:'
    );
  }

  const catalogOrder = data
    ? data.orden.every((id, index) => id === eventosCatalogo[index]?.documentId)
    : true;

  const previewPayload = useMemo(
    () =>
      data
        ? {
            section: 'proximos-eventos',
            area: areaKey,
            previewData: toPreviewData(data, eventosCatalogo),
            selected: activePart?.id,
            mode: 'edit',
          }
        : null,
    [data, areaKey, eventosCatalogo, activePart]
  );

  return (
    <SectionEditorShell
      title="Próximos Eventos"
      locationText={<>Sección «Próximos Eventos» de <strong>Inicio</strong></>}
      areas={PROXIMOS_EVENTOS_AREAS}
      draft={draft}
      device={device}
      onDevice={setDevice}
      previewPayload={previewPayload}
      previewTitle="Vista previa de Próximos Eventos"
      canvasCaption="VISTA PREVIA · PRÓXIMOS EVENTOS"
      onSelectFromPreview={selectFromPreview}
      onSelectArea={draft.selectArea}
      onSaveDraft={handleSaveDraft}
      onPublish={handlePublish}
      onBack={onBack}
      onLogout={onLogout}
      sidebar={
        data && (
          <ProximosEventosPartsPanel
            data={data}
            eventosCatalogo={eventosCatalogo}
            published={serverArea?.published}
            selected={activePart?.id}
            onSelect={selectPart}
          />
        )
      }
      stageTop={
        ordered.length > 1 && (
          <OrderStrip
            items={ordered}
            selectedId={activeEventoId}
            disabled={busy}
            title="Orden · arrastrá los eventos a izquierda o derecha"
            hint="También podés usar las flechas. Hacé clic en un evento para editar sus datos."
            listLabel="Orden de los eventos (reordenable)"
            itemNoun="Evento"
            onReorder={moveEvento}
            onSelect={id => selectPart(eventoPart(id))}
          />
        )
      }
      inspectorTitle={activePart?.label}
    >
      {activePart?.id === PART_ENCABEZADO && data && (
        <EncabezadoEventosPanel
          data={data}
          published={serverArea?.published}
          onChange={change}
        />
      )}
      {activePart?.id === PART_ORDEN && (
        <OrdenEventosPanel
          eventos={ordered}
          catalogOrder={catalogOrder}
          onMove={moveEvento}
          onRestoreCatalogOrder={() => {
            change(next => {
              next.orden = eventosCatalogo.map(ev => ev.documentId);
            });
            setMessage('Se aplicó el orden predeterminado. Publicá para guardarlo.');
          }}
        />
      )}
      {activePart?.id === PART_DISENO && data && (
        <DisenoEventosPanel
          data={data}
          published={serverArea?.published}
          onChange={change}
        />
      )}
      {activePart?.id === PART_ENLACE && data && (
        <EnlaceInferiorEventosPanel
          data={data}
          published={serverArea?.published}
          onChange={change}
        />
      )}
      {activeEvento && (
        <EventoIndividualPanel
          evento={activeEvento}
          position={ordered.indexOf(activeEvento)}
          total={ordered.length}
          onChangeEvento={patch => updateEvento(activeEvento.documentId, patch)}
          onRestoreEvento={() => restoreEvento(activeEvento.documentId)}
          onMove={step => moveEvento(activeEvento.documentId, ordered.indexOf(activeEvento) + step)}
        />
      )}
      {!eventosCatalogo.length && (
        <p className="ba-hint">No hay eventos publicados en Strapi.</p>
      )}
    </SectionEditorShell>
  );
}
