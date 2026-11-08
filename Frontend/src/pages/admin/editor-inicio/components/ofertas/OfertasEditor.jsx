import React, { useCallback, useMemo, useState } from 'react';
import SectionEditorShell from '../SectionEditorShell';
import useSectionDraft from '../../hooks/useSectionDraft';
import OfertasPartsPanel from './OfertasPartsPanel';
import TituloPanel from './TituloPanel';
import TipografiaPanel from './TipografiaPanel';
import DisenoOfertasPanel from './DisenoOfertasPanel';
import { AREA_COLORS, OFERTAS_AREAS, OFERTAS_PARTS, publishProblems } from './ofertasModel';

const AREA_KEYS = OFERTAS_AREAS.map(area => area.key);

export default function OfertasEditor({ token, onBack, onLogout }) {
  const draft = useSectionDraft({ token, endpoint: '/api/secciones-inicio-admin/ofertas', areaKeys: AREA_KEYS });
  const { data, areaKey, change, overview, setError } = draft;
  const [part, setPart] = useState('titulo');
  const [device, setDevice] = useState('desktop');

  const area = OFERTAS_AREAS.find(item => item.key === areaKey);
  const activePart = OFERTAS_PARTS.find(item => item.id === part);
  const areaColor = AREA_COLORS[areaKey];

  const selectPart = useCallback(id => {
    setPart(id);
    setError('');
  }, [setError]);

  const selectFromPreview = useCallback(id => {
    if (id === 'titulo') selectPart('titulo');
    if (id === 'seccion') selectPart('fondo');
  }, [selectPart]);

  function publish() {
    const problems = publishProblems(data);
    if (problems.length) {
      setError(`Antes de publicar: ${problems.map(problem => problem.message).join(' ')}`);
      setPart(problems[0].part);
      return;
    }
    draft.save(true, `Publicado. La sección Ofertas de ${area.label} ya está actualizada en Inicio.`, 'No se publicó ningún cambio:');
  }

  const previewPayload = useMemo(() => (data ? { section: 'ofertas', area: areaKey, previewData: data, selected: part === 'fondo' ? 'seccion' : 'titulo', mode: 'edit' } : null), [data, areaKey, part]);

  return (
    <SectionEditorShell
      title="Ofertas"
      locationText={<>Sección «Ofertas» de <strong>{area.label}</strong></>}
      areas={OFERTAS_AREAS}
      draft={draft}
      device={device}
      onDevice={setDevice}
      previewPayload={previewPayload}
      previewTitle="Vista previa de Ofertas"
      canvasCaption={`VISTA PREVIA · OFERTAS · ${area.label.toUpperCase()}`}
      onSelectFromPreview={selectFromPreview}
      onSelectArea={draft.selectArea}
      onSaveDraft={() => draft.save(false, 'Borrador guardado. La tienda sigue mostrando la última publicación.')}
      onPublish={publish}
      onBack={onBack}
      onLogout={onLogout}
      sidebar={data && <OfertasPartsPanel data={data} selected={part} onSelect={selectPart} />}
      inspectorTitle={activePart?.label}
    >
      {part === 'titulo' && <TituloPanel data={data} defaultTitle={overview?.defaultTitle} onChange={change} />}
      {part === 'tipografia' && <TipografiaPanel data={data} areaColor={areaColor} onChange={change} />}
      {(part === 'color' || part === 'fondo') && <DisenoOfertasPanel part={part} data={data} areaColor={areaColor} onChange={change} />}
    </SectionEditorShell>
  );
}
