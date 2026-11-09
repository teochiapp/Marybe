import React from 'react';
import { GIFT_CARD_DEFAULTS } from '../../../../../utils/giftCardSection';
import { isValidButtonLink } from './giftCardModel';

export default function BotonGiftCardPanel({ data, published, onChange }) {
  if (!data) return null;
  const linkValid = isValidButtonLink(data.boton_enlace);

  const restoreButton = () => {
    onChange(next => {
      next.boton_texto = published?.boton_texto || GIFT_CARD_DEFAULTS.boton_texto;
      next.boton_enlace = published?.boton_enlace || GIFT_CARD_DEFAULTS.boton_enlace;
    });
  };

  return (
    <>
      <p className="ba-inspector-help">
        Personalizá el texto y el enlace de destino del botón de acción de la sección Gift Card.
      </p>

      <details open>
        <summary>Botón de acción</summary>
        <label htmlFor="giftcard-boton-texto">
          Texto del botón
          <input
            id="giftcard-boton-texto"
            type="text"
            maxLength={80}
            value={data.boton_texto || ''}
            placeholder={GIFT_CARD_DEFAULTS.boton_texto}
            onChange={e => onChange(next => { next.boton_texto = e.target.value; })}
          />
        </label>

        <label htmlFor="giftcard-boton-enlace">
          URL o enlace de destino
          <input
            id="giftcard-boton-enlace"
            type="text"
            maxLength={300}
            value={data.boton_enlace || ''}
            placeholder={GIFT_CARD_DEFAULTS.boton_enlace}
            onChange={e => onChange(next => { next.boton_enlace = e.target.value; })}
          />
        </label>
        {!linkValid ? (
          <small className="ba-hint" style={{ color: '#b91c1c' }}>
            El enlace debe comenzar con &quot;/&quot; (ruta interna, ej. <code>/gift-card</code>) o con &quot;https://&quot;.
          </small>
        ) : (
          <small className="ba-hint">
            Acepta rutas internas como <code>/gift-card</code> o enlaces externos completos con <code>https://</code>.
          </small>
        )}
      </details>

      <button type="button" className="ba-reset-device" onClick={restoreButton}>
        Volver al botón publicado
      </button>
    </>
  );
}
