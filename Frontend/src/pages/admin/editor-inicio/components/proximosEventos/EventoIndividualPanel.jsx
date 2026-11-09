import React from 'react';
import {
  DEFAULT_WHATSAPP_NUMBER,
  PROXIMOS_EVENTOS_DEFAULTS,
} from '../../../../../utils/proximosEventosSection';
import { isValidOptionalLink } from './proximosEventosModel';

export default function EventoIndividualPanel({
  evento,
  position,
  total,
  onChangeEvento,
  onRestoreEvento,
  onMove,
}) {
  if (!evento) return null;

  const customLinkValid = isValidOptionalLink(evento.boton_enlace, false);

  return (
    <>
      <p className="ba-inspector-help">
        Modificá los datos del evento. Al publicar, el título, la descripción, la fecha, la ubicación y el WhatsApp se actualizan en el registro de Strapi.
      </p>

      <details open>
        <summary>Información principal</summary>
        <label htmlFor="evento-titulo">
          Nombre o título del evento
          <input
            id="evento-titulo"
            type="text"
            maxLength={140}
            value={evento.titulo || ''}
            placeholder="Ej: Masterclass de Maquillaje"
            onChange={e => onChangeEvento({ titulo: e.target.value })}
          />
        </label>

        <label htmlFor="evento-descripcion">
          Descripción (una línea por punto destacado)
          <textarea
            id="evento-descripcion"
            rows={4}
            maxLength={1200}
            value={evento.descripcion || ''}
            placeholder={'Diagnóstico personalizado\nTécnicas de aplicación\nObsequios exclusivos'}
            onChange={e => onChangeEvento({ descripcion: e.target.value })}
          />
        </label>
        <small className="ba-hint">
          Cada salto de línea se muestra como un ítem con viñeta dentro de la tarjeta.
        </small>
      </details>

      <details open>
        <summary>Fecha y ubicación</summary>
        <label htmlFor="evento-fecha">
          Fecha y horario del evento
          <input
            id="evento-fecha"
            type="text"
            maxLength={120}
            value={evento.fecha || ''}
            placeholder="Ej: Sábado 22 de Noviembre · 18:00 hs"
            onChange={e => onChangeEvento({ fecha: e.target.value })}
          />
        </label>

        <label htmlFor="evento-ubicacion">
          Ubicación o sucursal
          <input
            id="evento-ubicacion"
            type="text"
            maxLength={160}
            value={evento.ubicacion || ''}
            placeholder="Ej: Sucursal Pellegrini 141, Santiago del Estero"
            onChange={e => onChangeEvento({ ubicacion: e.target.value })}
          />
        </label>
      </details>

      <details open>
        <summary>Botón de acción y reserva</summary>
        <label htmlFor="evento-boton-texto">
          Texto del botón
          <input
            id="evento-boton-texto"
            type="text"
            maxLength={60}
            value={evento.boton_texto || ''}
            placeholder={PROXIMOS_EVENTOS_DEFAULTS.boton_reserva_texto}
            onChange={e => onChangeEvento({ boton_texto: e.target.value })}
          />
        </label>

        <label htmlFor="evento-whatsapp">
          Número de WhatsApp para reserva (solo dígitos)
          <input
            id="evento-whatsapp"
            type="text"
            maxLength={40}
            value={evento.whatsapp_numero || ''}
            placeholder={DEFAULT_WHATSAPP_NUMBER}
            onChange={e => onChangeEvento({ whatsapp_numero: e.target.value })}
          />
        </label>
        <small className="ba-hint">
          Si se deja vacío, utiliza el WhatsApp general ({DEFAULT_WHATSAPP_NUMBER}) con el mensaje automático del evento.
        </small>

        <label htmlFor="evento-boton-enlace" style={{ marginTop: 8 }}>
          Enlace de reserva personalizado (opcional)
          <input
            id="evento-boton-enlace"
            type="text"
            maxLength={300}
            value={evento.boton_enlace || ''}
            placeholder="Dejar vacío para usar WhatsApp, o ingresar https://..."
            onChange={e => onChangeEvento({ boton_enlace: e.target.value })}
          />
        </label>
        {!customLinkValid && (
          <small className="ba-hint" style={{ color: '#b91c1c' }}>
            El enlace debe comenzar con &quot;/&quot; o con &quot;https://&quot;.
          </small>
        )}
      </details>

      <details open>
        <summary>Posición en la sección</summary>
        <p className="ba-hint" role="status">
          Lugar {position + 1} de {total}
        </p>
        <div className="ba-presets">
          <button
            type="button"
            disabled={position === 0}
            onClick={() => onMove(-1)}
            aria-label={`Mover ${evento.titulo} antes`}
          >
            ← Mover antes
          </button>
          <button
            type="button"
            disabled={position === total - 1}
            onClick={() => onMove(1)}
            aria-label={`Mover ${evento.titulo} después`}
          >
            Mover después →
          </button>
        </div>
      </details>

      <button type="button" className="ba-reset-device" onClick={onRestoreEvento}>
        Restaurar valores publicados de este evento
      </button>
    </>
  );
}
