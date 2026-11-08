import React from 'react';
import { imageUrl } from '../../../../../utils/bannerDesign';

export default function CategoriaPanel({ category, position, total, published, onChooseImage, onRestoreImage, onMove }) {
  const url = imageUrl(category.portada);
  const changed = (category.portada?.id ?? null) !== (published?.id ?? null);
  return (
    <>
      <p className="ba-inspector-help">La imagen de portada se guarda en la categoría de Strapi al publicar. También se usa en el catálogo de la tienda.</p>
      <details open>
        <summary>Imagen de portada</summary>
        <div className="ba-image-current">{url ? <img src={url} alt={`Portada de ${category.nombre}`} /> : <span>Sin imagen</span>}</div>
        <button className="ba-library-button" onClick={onChooseImage}>Elegir imagen</button>
        {changed && <button onClick={onRestoreImage}>Volver a la imagen publicada</button>}
        <small className="ba-hint">{changed ? 'Imagen nueva: se aplica en Strapi cuando publiques.' : 'Recomendado: imagen horizontal o cuadrada, con el motivo centrado.'}</small>
      </details>
      <details open>
        <summary>Posición en la sección</summary>
        <p className="ba-hint" role="status">Lugar {position + 1} de {total}</p>
        <div className="ba-presets">
          <button disabled={position === 0} onClick={() => onMove(-1)} aria-label={`Mover ${category.nombre} antes`}>← Mover antes</button>
          <button disabled={position === total - 1} onClick={() => onMove(1)} aria-label={`Mover ${category.nombre} después`}>Mover después →</button>
        </div>
      </details>
    </>
  );
}
