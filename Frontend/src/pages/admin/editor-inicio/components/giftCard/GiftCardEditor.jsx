import React, { useCallback, useMemo, useState } from 'react';
import SectionEditorShell from '../SectionEditorShell';
import MediaLibraryDialog from '../MediaLibraryDialog';
import useSectionDraft from '../../hooks/useSectionDraft';
import GiftCardPartsPanel from './GiftCardPartsPanel';
import ContenidoGiftCardPanel from './ContenidoGiftCardPanel';
import ImagenGiftCardPanel from './ImagenGiftCardPanel';
import AparienciaGiftCardPanel from './AparienciaGiftCardPanel';
import BotonGiftCardPanel from './BotonGiftCardPanel';
import {
  GIFT_CARD_AREAS,
  GIFT_CARD_PARTS,
  PART_APARIENCIA,
  PART_BOTON,
  PART_CONTENIDO,
  PART_IMAGEN,
  toPreviewData,
  validateGiftCardData,
} from './giftCardModel';

const AREA_KEYS = GIFT_CARD_AREAS.map(area => area.key);

export default function GiftCardEditor({ token, onBack, onLogout }) {
  const draft = useSectionDraft({
    token,
    endpoint: '/api/gift-card-admin',
    areaKeys: AREA_KEYS,
  });
  const { data, areaKey, change, serverArea, setError } = draft;
  const [part, setPart] = useState(PART_CONTENIDO);
  const [device, setDevice] = useState('desktop');
  const [libraryOpen, setLibraryOpen] = useState(false);

  const area = GIFT_CARD_AREAS.find(item => item.key === areaKey) || GIFT_CARD_AREAS[0];
  const activePart =
    GIFT_CARD_PARTS.find(item => item.id === part) || GIFT_CARD_PARTS[0];

  const selectPart = useCallback(
    id => {
      setPart(id);
      setError('');
    },
    [setError]
  );

  const selectFromPreview = useCallback(
    id => {
      if (GIFT_CARD_PARTS.some(item => item.id === id)) selectPart(id);
    },
    [selectPart]
  );

  function chooseMedia(file) {
    const image = {
      id: file.id,
      url: file.url,
      name: file.name,
      width: file.width,
      height: file.height,
    };
    change(next => {
      next.imagen = image;
    });
    setLibraryOpen(false);
  }

  function handleSaveDraft() {
    draft.save(
      false,
      `Borrador guardado. La sección Gift Card de ${area.label} no cambia en Inicio hasta que publiques.`
    );
  }

  function handlePublish() {
    const validationError = validateGiftCardData(data);
    if (validationError) {
      setError(validationError);
      return;
    }
    draft.save(
      true,
      `Publicado. La sección Gift Card de ${area.label} ya está actualizada en Inicio.`,
      'No se publicó ningún cambio:'
    );
  }

  const previewPayload = useMemo(
    () =>
      data
        ? {
            section: 'gift-card',
            area: areaKey,
            previewData: toPreviewData(data, areaKey),
            selected: activePart?.id,
            mode: 'edit',
          }
        : null,
    [data, areaKey, activePart]
  );

  return (
    <SectionEditorShell
      title="Gift Card"
      locationText={<>Sección «Gift Card» de <strong>{area.label}</strong></>}
      areas={GIFT_CARD_AREAS}
      draft={draft}
      device={device}
      onDevice={setDevice}
      previewPayload={previewPayload}
      previewTitle="Vista previa de Gift Card"
      canvasCaption={`VISTA PREVIA · GIFT CARD · ${area.label.toUpperCase()}`}
      onSelectFromPreview={selectFromPreview}
      onSelectArea={draft.selectArea}
      onSaveDraft={handleSaveDraft}
      onPublish={handlePublish}
      onBack={onBack}
      onLogout={onLogout}
      sidebar={
        data && (
          <GiftCardPartsPanel
            data={data}
            selected={activePart?.id}
            onSelect={selectPart}
          />
        )
      }
      inspectorTitle={activePart?.label}
      dialogs={
        libraryOpen && (
          <MediaLibraryDialog
            token={token}
            title="Imagen principal de Gift Card"
            onChoose={chooseMedia}
            onClose={() => setLibraryOpen(false)}
          />
        )
      }
    >
      {activePart?.id === PART_CONTENIDO && data && (
        <ContenidoGiftCardPanel
          data={data}
          published={serverArea?.published}
          onChange={change}
        />
      )}
      {activePart?.id === PART_IMAGEN && data && (
        <ImagenGiftCardPanel
          data={data}
          published={serverArea?.published}
          onChooseImage={() => setLibraryOpen(true)}
          onChange={change}
        />
      )}
      {activePart?.id === PART_APARIENCIA && data && (
        <AparienciaGiftCardPanel
          data={data}
          areaKey={areaKey}
          onChange={change}
        />
      )}
      {activePart?.id === PART_BOTON && data && (
        <BotonGiftCardPanel
          data={data}
          published={serverArea?.published}
          onChange={change}
        />
      )}
    </SectionEditorShell>
  );
}
