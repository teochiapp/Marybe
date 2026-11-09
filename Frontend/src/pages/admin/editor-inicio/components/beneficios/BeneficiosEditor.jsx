import React, { useCallback, useMemo, useState } from 'react';
import SectionEditorShell from '../SectionEditorShell';
import MediaLibraryDialog from '../MediaLibraryDialog';
import useSectionDraft from '../../hooks/useSectionDraft';
import OrderStrip from '../OrderStrip';
import BeneficiosPartsPanel from './BeneficiosPartsPanel';
import ContenidoGeneralPanel from './ContenidoGeneralPanel';
import OrdenBeneficiosPanel from './OrdenBeneficiosPanel';
import TarjetaBeneficioPanel from './TarjetaBeneficioPanel';
import {
  BENEFICIOS_AREAS,
  PART_CONTENIDO,
  PART_ORDEN,
  beneficiosParts,
  cardFromPart,
  cardPart,
  changedCardsCount,
  moveItem,
  orderedPromociones,
  toPreviewData,
  validateBeneficiosData,
} from './beneficiosModel';

const AREA_KEYS = BENEFICIOS_AREAS.map(area => area.key);

export default function BeneficiosEditor({ token, onBack, onLogout }) {
  const draft = useSectionDraft({
    token,
    endpoint: '/api/beneficios-admin',
    areaKeys: AREA_KEYS,
  });
  const { data, areaKey, change, busy, overview, serverArea, setError, setMessage } = draft;
  const [part, setPart] = useState(PART_CONTENIDO);
  const [device, setDevice] = useState('desktop');
  const [libraryTarget, setLibraryTarget] = useState(null);

  const promociones = useMemo(
    () => overview?.areas?.[areaKey]?.promociones || [],
    [overview, areaKey]
  );
  const parts = useMemo(() => beneficiosParts(promociones, data), [promociones, data]);
  const activePart =
    parts.find(item => item.id === part) ||
    parts.find(item => item.id === PART_CONTENIDO);
  const ordered = useMemo(
    () => (data ? orderedPromociones(data, promociones) : []),
    [data, promociones]
  );
  const activeCardId = cardFromPart(activePart?.id);
  const activeCard = ordered.find(promo => promo.documentId === activeCardId);

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

  const movePromo = useCallback(
    (documentId, to) =>
      change(next => {
        next.orden = moveItem(next.orden, next.orden.indexOf(documentId), to);
      }),
    [change]
  );

  const updateCard = useCallback(
    (documentId, patch) =>
      change(next => {
        if (!next.tarjetas) next.tarjetas = {};
        next.tarjetas[documentId] = {
          ...(next.tarjetas[documentId] || {}),
          ...patch,
        };
      }),
    [change]
  );

  const restoreCard = useCallback(
    documentId => {
      const pub = serverArea?.published?.tarjetas?.[documentId];
      if (!pub) return;
      change(next => {
        next.tarjetas[documentId] = JSON.parse(JSON.stringify(pub));
      });
    },
    [change, serverArea]
  );

  function chooseMedia(file) {
    if (!libraryTarget) return;
    const image = {
      id: file.id,
      url: file.url,
      name: file.name,
      width: file.width,
      height: file.height,
    };
    updateCard(libraryTarget, { logo: image });
    setLibraryTarget(null);
  }

  function handleSaveDraft() {
    draft.save(
      false,
      'Borrador guardado. La página de Inicio y los beneficios en Strapi no cambian hasta que publiques.'
    );
  }

  function handlePublish() {
    const validationError = validateBeneficiosData(data, promociones);
    if (validationError) {
      setError(validationError);
      return;
    }
    const modifiedCount = changedCardsCount(data, serverArea?.published);
    const detail = modifiedCount
      ? ` Se ${modifiedCount === 1 ? 'actualizó 1 beneficio' : `actualizaron ${modifiedCount} beneficios`} en Strapi.`
      : '';
    draft.save(
      true,
      `Publicado. La sección Beneficios ya está actualizada en Inicio.${detail}`,
      'No se publicó ningún cambio:'
    );
  }

  const catalogOrder = data
    ? data.orden.every((id, index) => id === promociones[index]?.documentId)
    : true;

  const previewPayload = useMemo(
    () =>
      data
        ? {
            section: 'beneficios',
            area: areaKey,
            previewData: toPreviewData(data, promociones),
            selected: activePart?.id,
            mode: 'edit',
          }
        : null,
    [data, areaKey, promociones, activePart]
  );

  return (
    <SectionEditorShell
      title="Beneficios"
      locationText={<>Sección «Beneficios» de <strong>Inicio</strong></>}
      areas={BENEFICIOS_AREAS}
      draft={draft}
      device={device}
      onDevice={setDevice}
      previewPayload={previewPayload}
      previewTitle="Vista previa de Beneficios"
      canvasCaption="VISTA PREVIA · BENEFICIOS BANCARIOS Y PROMOCIONES"
      onSelectFromPreview={selectFromPreview}
      onSelectArea={draft.selectArea}
      onSaveDraft={handleSaveDraft}
      onPublish={handlePublish}
      onBack={onBack}
      onLogout={onLogout}
      sidebar={
        data && (
          <BeneficiosPartsPanel
            data={data}
            promociones={promociones}
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
            selectedId={activeCardId}
            disabled={busy}
            title="Orden · arrastrá las tarjetas a izquierda o derecha"
            hint="También podés usar las flechas. Hacé clic en una tarjeta para editar su texto y logo."
            listLabel="Orden de los beneficios (reordenable)"
            itemNoun="Beneficio"
            onReorder={movePromo}
            onSelect={id => selectPart(cardPart(id))}
          />
        )
      }
      inspectorTitle={activePart?.label}
      dialogs={
        libraryTarget && (
          <MediaLibraryDialog
            token={token}
            title={`Logo de ${ordered.find(p => p.documentId === libraryTarget)?.nombre || 'el beneficio'}`}
            onChoose={chooseMedia}
            onClose={() => setLibraryTarget(null)}
          />
        )
      }
    >
      {activePart?.id === PART_CONTENIDO && data && (
        <ContenidoGeneralPanel
          data={data}
          published={serverArea?.published}
          onChange={change}
        />
      )}
      {activePart?.id === PART_ORDEN && (
        <OrdenBeneficiosPanel
          promociones={ordered}
          catalogOrder={catalogOrder}
          onMove={movePromo}
          onRestoreCatalogOrder={() => {
            change(next => {
              next.orden = promociones.map(p => p.documentId);
            });
            setMessage('Se aplicó el orden predeterminado. Publicá para guardarlo.');
          }}
        />
      )}
      {activeCard && (
        <TarjetaBeneficioPanel
          card={activeCard}
          position={ordered.indexOf(activeCard)}
          total={ordered.length}
          publishedCard={serverArea?.published?.tarjetas?.[activeCard.documentId]}
          onChangeCard={patch => updateCard(activeCard.documentId, patch)}
          onChooseLogo={() => setLibraryTarget(activeCard.documentId)}
          onRestoreLogo={() =>
            updateCard(activeCard.documentId, {
              logo: serverArea?.published?.tarjetas?.[activeCard.documentId]?.logo || null,
            })
          }
          onRestoreCard={() => restoreCard(activeCard.documentId)}
          onMove={step => movePromo(activeCard.documentId, ordered.indexOf(activeCard) + step)}
        />
      )}
      {!promociones.length && (
        <p className="ba-hint">No hay promociones bancarias activas publicadas en Strapi.</p>
      )}
    </SectionEditorShell>
  );
}
