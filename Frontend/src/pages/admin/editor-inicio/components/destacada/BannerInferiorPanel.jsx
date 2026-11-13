import React from 'react';
import { imageUrl } from '../../../../../utils/bannerDesign';
import ScaleField from './ScaleField';

export default function BannerInferiorPanel({ index, banner, onChooseImage, onChange, onRemove, onShowDevice }) {
  const url = imageUrl(banner.imagen);
  const update = (key, value) => onChange(draft => { draft.banners[index][key] = value; });
  return (
    <>
      <p className="ba-inspector-help">Tarjeta debajo de los productos con un título, una imagen y un botón.</p>
      <details open>
        <summary>Contenido</summary>
        <label>Título<input id={`dd-banner-${index}-titulo`} value={banner.titulo} maxLength={120} onChange={event => update('titulo', event.target.value)} /></label>
        <div className="ba-image-current">{url ? <img src={url} alt={`Imagen del banner inferior ${index + 1}`} /> : <span>Sin imagen</span>}</div>
        <button className="ba-library-button" onClick={() => onChooseImage(`banner-${index}`)}>Elegir imagen</button>
      </details>
      <details open>
        <summary>Tamaño de la imagen</summary>
        <ScaleField label="Tamaño en computadora y tablet" value={banner.escala_imagen_desktop} onChange={value => { onShowDevice('desktop'); update('escala_imagen_desktop', value); }} />
        <ScaleField label="Tamaño en celular" value={banner.escala_imagen_mobile} onChange={value => { onShowDevice('mobile'); update('escala_imagen_mobile', value); }} />
        <small className="ba-hint">La imagen crece desde la base de la tarjeta; lo que sobresale se recorta en el borde.</small>
      </details>
      <details open>
        <summary>Botón</summary>
        <label htmlFor={`dd-banner-${index}-texto-boton`}>Texto del botón<input id={`dd-banner-${index}-texto-boton`} name="texto_boton" value={banner.texto_boton} maxLength={60} onChange={event => update('texto_boton', event.target.value)} /></label>
        <label htmlFor={`dd-banner-${index}-link-boton`}>Enlace<input id={`dd-banner-${index}-link-boton`} name="link_boton" value={banner.link_boton} maxLength={2048} placeholder="/tienda?categoria=… o https://…" onChange={event => update('link_boton', event.target.value)} /></label>
        <small className="ba-hint">Usá una ruta de la tienda que empiece con / o una dirección https. Vacío lleva a /tienda.</small>
      </details>
      <button className="ba-reset-device" onClick={onRemove}>Eliminar banner inferior {index + 1}</button>
    </>
  );
}
