import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import FeaturedSection from '../../../components/inicio/perfumeria/FeaturedSection';
import FeaturedSectionHogar from '../../../components/inicio/hogar/FeaturedSectionHogar';
import CategoriesSection from '../../../components/inicio/perfumeria/CategoriesSection';
import FeaturedCategorySection from '../../../components/inicio/perfumeria/FeaturedCategorySection';
import SpecificCategorySection from '../../../components/inicio/perfumeria/SpecificCategorySection';
import OfertasSection from '../../../components/inicio/perfumeria/OfertasSection';
import DiscountedSection from '../../../components/inicio/perfumeria/DiscountedSection';
import DiscountedSectionHogar from '../../../components/inicio/hogar/DiscountedSectionHogar';
import TarjetasPromociones from '../../../components/inicio/perfumeria/TarjetasPromociones';
import GiftCard from '../../../components/inicio/shared/GiftCard';

const PreviewPage = styled.main`
  --editor-vh: ${({ $viewportHeight }) => ($viewportHeight ? `${$viewportHeight / 100}px` : '1vh')};
  min-height: 100px;
  padding: 30px 0 40px;
  background: var(--color-blanco);
  font-family: var(--font-family-secondary);

  &[data-mode='edit'] [data-editor-part] {
    cursor: pointer;
    transition: outline-color 0.15s ease;
    outline: 2px dashed transparent;
    outline-offset: 4px;
  }

  &[data-mode='edit'] [data-editor-part]:hover {
    outline-color: rgba(194, 161, 92, 0.95);
  }

  ${({ $selected }) => $selected && `
    &[data-mode='edit'] [data-editor-part='${$selected}'] {
      outline: 3px solid #c2a15c;
      outline-offset: 4px;
    }
  `}
`;

const PREVIEWS = {
  'seccion-destacada': ({ area, previewData }) => (area === 'hogar'
    ? <FeaturedSectionHogar previewData={previewData} />
    : <FeaturedSection seccion="perfumeria" previewData={previewData} />),
  categorias: ({ area, previewData }) => <CategoriesSection seccion={area} previewData={previewData} />,
  'categoria-destacada-1': ({ area, previewData }) => <FeaturedCategorySection seccion={area} previewData={previewData} />,
  'categoria-destacada-2': ({ area, previewData }) => <SpecificCategorySection seccion={area} previewData={previewData} />,
  ofertas: ({ area, previewData }) => <OfertasSection seccion={area} previewData={previewData} />,
  // En Descuentos el área es el identificador estable del bloque (bloque-1 · bloque-2).
  descuentos: ({ area, previewData }) => (area === 'bloque-2'
    ? <DiscountedSectionHogar previewData={previewData} />
    : <DiscountedSection seccion="perfumeria" previewData={previewData} />),
  beneficios: ({ previewData }) => <TarjetasPromociones previewData={previewData} />,
  'gift-card': ({ area, previewData }) => <GiftCard seccion={area || 'perfumeria'} previewData={previewData} />,
};

const send = data => window.parent.postMessage(data, window.location.origin);

// Lienzo interno del Editor de Inicio: recibe borradores del editor (mismo origen) y renderiza
// las secciones reales de la landing. No consulta borradores en la API pública.
export default function EditorInicioPreview() {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const receive = event => {
      if (event.origin !== window.location.origin || event.source !== window.parent || event.data?.type !== 'MARYBE_EDITOR_PREVIEW') return;
      setPreview(event.data.payload);
    };
    window.addEventListener('message', receive);
    send({ type: 'MARYBE_EDITOR_READY' });
    // Evita que el fondo oscuro del sitio asome mientras el lienzo ajusta su alto.
    const previousBackground = document.body.style.backgroundColor;
    document.body.style.backgroundColor = '#ffffff';
    return () => {
      window.removeEventListener('message', receive);
      document.body.style.backgroundColor = previousBackground;
    };
  }, []);

  useEffect(() => {
    const target = document.getElementById('editor-inicio-preview-content');
    if (!target) return undefined;
    const observer = new ResizeObserver(() => send({ type: 'MARYBE_EDITOR_HEIGHT', height: target.getBoundingClientRect().height }));
    observer.observe(target);
    return () => observer.disconnect();
  }, [preview]);

  useEffect(() => {
    if (preview?.mode !== 'view') return undefined;
    const keyboard = event => { if (event.key === 'Escape') send({ type: 'MARYBE_EDITOR_CLOSE_PREVIEW' }); };
    window.addEventListener('keydown', keyboard);
    return () => window.removeEventListener('keydown', keyboard);
  }, [preview?.mode]);

  if (!preview) return <p style={{ textAlign: 'center', padding: 32 }}>Preparando vista previa…</p>;
  const Preview = PREVIEWS[preview.section];
  if (!Preview) return <p style={{ textAlign: 'center', padding: 32 }}>Sección sin vista previa.</p>;

  const handleClickCapture = event => {
    if (event.target.closest('[aria-label="Anterior"], [aria-label="Siguiente"], [data-preview-interactive]')) return;
    event.preventDefault();
    event.stopPropagation();
    const part = event.target.closest('[data-editor-part]')?.dataset.editorPart;
    if (preview.mode === 'edit' && part) send({ type: 'MARYBE_EDITOR_SELECT', part });
  };

  return (
    <PreviewPage id="editor-inicio-preview-content" data-mode={preview.mode} $viewportHeight={Number.isFinite(preview.viewportHeight) ? preview.viewportHeight : 0} $selected={/^[a-z0-9_-]+$/i.test(preview.selected || '') ? preview.selected : ''} onClickCapture={handleClickCapture}>
      <Preview area={preview.area} previewData={preview.previewData} />
    </PreviewPage>
  );
}
