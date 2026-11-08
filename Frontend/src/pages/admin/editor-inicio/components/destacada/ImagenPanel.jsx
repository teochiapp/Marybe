import React from 'react';
import { imageUrl } from '../../../../../utils/bannerDesign';
import ScaleField from './ScaleField';

const SLOTS = [
  { key: 'imagen_desktop', scaleKey: 'escala_imagen_desktop', device: 'desktop', label: 'Computadora y tablet', hint: 'Obligatoria. Se usa en pantallas de más de 768 px.' },
  { key: 'imagen_mobile', scaleKey: 'escala_imagen_mobile', device: 'mobile', label: 'Celular', hint: 'Opcional. Si la dejás vacía se usa la imagen predeterminada para celular.' },
];

export default function ImagenPanel({ data, device, onChooseImage, onChange, onShowDevice }) {
  return (
    <>
      <p className="ba-inspector-help">La imagen acompaña al título en la parte superior de la sección.</p>
      {SLOTS.map(slot => {
        const url = imageUrl(data[slot.key]);
        const current = slot.device === 'mobile' ? device === 'mobile' : device !== 'mobile';
        return (
          <details open key={slot.key}>
            <summary>{slot.label}{current ? ' · vista actual' : ''}</summary>
            <div className="ba-image-current">{url ? <img src={url} alt={`Imagen para ${slot.label.toLowerCase()}`} /> : <span>Sin imagen</span>}</div>
            <button className="ba-library-button" onClick={() => onChooseImage(slot.key)}>Elegir imagen · {slot.label}</button>
            {slot.key === 'imagen_mobile' && data.imagen_mobile && <button onClick={() => onChange(draft => { draft.imagen_mobile = null; })}>Quitar imagen de celular</button>}
            <small className="ba-hint">{slot.hint}</small>
            <ScaleField label={`Tamaño en ${slot.label.toLowerCase()}`} value={data[slot.scaleKey]} onChange={value => { onShowDevice(slot.device); onChange(draft => { draft[slot.scaleKey] = value; }); }} />
          </details>
        );
      })}
    </>
  );
}
