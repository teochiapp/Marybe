import React from 'react';
import { PROXIMOS_EVENTOS_DEFAULTS } from '../../../../../utils/proximosEventosSection';
import { isValidOptionalLink } from './proximosEventosModel';

export default function EnlaceInferiorEventosPanel({ data, published, onChange }) {
  if (!data) return null;

  const linkValid = isValidOptionalLink(data.enlace_inferior_url, true);

  const restoreFooter = () => {
    onChange(next => {
      next.enlace_inferior_texto =
        published?.enlace_inferior_texto || PROXIMOS_EVENTOS_DEFAULTS.enlace_inferior_texto;
      next.enlace_inferior_url =
        published?.enlace_inferior_url || PROXIMOS_EVENTOS_DEFAULTS.enlace_inferior_url;
    });
  };

  return (
    <>
      <p className="ba-inspector-help">
        Configurá el texto y el destino del enlace inferior que invita a ver todos los eventos.
      </p>

      <details open>
        <summary>Enlace inferior</summary>
        <label htmlFor="eventos-enlace-texto">
          Texto del enlace
          <input
            id="eventos-enlace-texto"
            type="text"
            maxLength={80}
            value={data.enlace_inferior_texto || ''}
            placeholder={PROXIMOS_EVENTOS_DEFAULTS.enlace_inferior_texto}
            onChange={e => onChange(next => { next.enlace_inferior_texto = e.target.value; })}
          />
        </label>

        <label htmlFor="eventos-enlace-url">
          URL de destino
          <input
            id="eventos-enlace-url"
            type="text"
            maxLength={300}
            value={data.enlace_inferior_url || ''}
            placeholder="# o /eventos o https://..."
            onChange={e => onChange(next => { next.enlace_inferior_url = e.target.value; })}
          />
        </label>
        {!linkValid ? (
          <small className="ba-hint" style={{ color: '#b91c1c' }}>
            El enlace debe ser <code>#</code>, comenzar con <code>/</code> o con <code>https://</code>.
          </small>
        ) : (
          <small className="ba-hint">
            El ícono de flecha se conserva automáticamente junto al texto configurado.
          </small>
        )}
      </details>

      <button type="button" className="ba-reset-device" onClick={restoreFooter}>
        Volver al enlace publicado
      </button>
    </>
  );
}
