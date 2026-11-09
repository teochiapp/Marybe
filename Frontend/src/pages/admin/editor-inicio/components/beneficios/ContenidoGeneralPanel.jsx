import React from 'react';
import { BENEFICIOS_DEFAULTS } from '../../../../../utils/beneficiosSection';
import { isValidButtonLink } from './beneficiosModel';

export default function ContenidoGeneralPanel({ data, published, onChange }) {
  if (!data) return null;
  const linkValid = isValidButtonLink(data.boton_enlace);

  const restoreTexts = () => {
    onChange(next => {
      next.titulo = published?.titulo || BENEFICIOS_DEFAULTS.titulo;
      next.info_titulo = published?.info_titulo || BENEFICIOS_DEFAULTS.info_titulo;
      next.info_descripcion = published?.info_descripcion || BENEFICIOS_DEFAULTS.info_descripcion;
      next.boton_texto = published?.boton_texto || BENEFICIOS_DEFAULTS.boton_texto;
      next.boton_enlace = published?.boton_enlace ?? BENEFICIOS_DEFAULTS.boton_enlace;
    });
  };

  return (
    <>
      <p className="ba-inspector-help">
        Personalizá el encabezado principal de Beneficios y el bloque informativo inferior con su botón.
      </p>

      <details open>
        <summary>Título principal</summary>
        <label htmlFor="beneficios-titulo">
          Título de la sección
          <input
            id="beneficios-titulo"
            type="text"
            maxLength={120}
            value={data.titulo || ''}
            placeholder={BENEFICIOS_DEFAULTS.titulo}
            onChange={e => onChange(next => { next.titulo = e.target.value; })}
          />
        </label>
        <small className="ba-hint">Se muestra arriba de la grilla de tarjetas bancarias.</small>
      </details>

      <details open>
        <summary>Bloque informativo inferior</summary>
        <label htmlFor="beneficios-info-titulo">
          Título del bloque inferior
          <input
            id="beneficios-info-titulo"
            type="text"
            maxLength={140}
            value={data.info_titulo || ''}
            placeholder={BENEFICIOS_DEFAULTS.info_titulo}
            onChange={e => onChange(next => { next.info_titulo = e.target.value; })}
          />
        </label>

        <label htmlFor="beneficios-info-descripcion">
          Descripción del bloque inferior
          <textarea
            id="beneficios-info-descripcion"
            rows={3}
            maxLength={260}
            value={data.info_descripcion || ''}
            placeholder={BENEFICIOS_DEFAULTS.info_descripcion}
            onChange={e => onChange(next => { next.info_descripcion = e.target.value; })}
          />
        </label>

        <label htmlFor="beneficios-boton-texto">
          Texto del botón
          <input
            id="beneficios-boton-texto"
            type="text"
            maxLength={80}
            value={data.boton_texto || ''}
            placeholder={BENEFICIOS_DEFAULTS.boton_texto}
            onChange={e => onChange(next => { next.boton_texto = e.target.value; })}
          />
        </label>

        <label htmlFor="beneficios-boton-enlace">
          Enlace o acción del botón (opcional)
          <input
            id="beneficios-boton-enlace"
            type="text"
            maxLength={300}
            value={data.boton_enlace || ''}
            placeholder="/tienda o https://..."
            onChange={e => onChange(next => { next.boton_enlace = e.target.value; })}
          />
        </label>
        {!linkValid ? (
          <small className="ba-hint" style={{ color: '#b91c1c' }}>
            El enlace debe comenzar con &quot;/&quot; (ruta interna) o con &quot;https://&quot;.
          </small>
        ) : (
          <small className="ba-hint">
            Podés indicar una ruta interna como <code>/tienda</code> o una URL completa.
          </small>
        )}
      </details>

      <button type="button" className="ba-reset-device" onClick={restoreTexts}>
        Volver a los textos publicados
      </button>
    </>
  );
}
