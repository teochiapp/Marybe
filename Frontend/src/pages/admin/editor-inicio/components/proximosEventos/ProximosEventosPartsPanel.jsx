import React from 'react';
import styled from 'styled-components';
import PartButton from '../PartButton';
import {
  PART_DISENO,
  PART_ENCABEZADO,
  PART_ENLACE,
  PART_ORDEN,
  eventoPart,
  isEventoModified,
  orderedEventos,
} from './proximosEventosModel';

const GroupTitle = styled.p`
  margin: 18px 0 6px;
  color: #a08c93;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;

export default function ProximosEventosPartsPanel({
  data,
  eventosCatalogo,
  published,
  selected,
  onSelect,
}) {
  const ordered = orderedEventos(data, eventosCatalogo);

  return (
    <aside className="ba-sidebar ba-layers">
      <div className="ba-layers-heading">
        <div>
          <p className="ba-eyebrow">PRÓXIMOS EVENTOS</p>
          <h2>Partes de la sección</h2>
        </div>
        <span>{ordered.length}</span>
      </div>
      <p className="ba-scope-note">
        Personalizá el encabezado, el orden, el diseño de las tarjetas o seleccioná un evento para editar sus datos en Strapi.
      </p>
      <nav aria-label="Partes de la sección Próximos Eventos">
        <GroupTitle>Encabezado y diseño</GroupTitle>
        <ul className="ba-layer-list">
          <PartButton
            id={PART_ENCABEZADO}
            label="Encabezado y tipografía"
            detail={data.titulo || 'Próximos eventos'}
            icon="✎"
            selected={selected}
            onSelect={onSelect}
          />
          <PartButton
            id={PART_ORDEN}
            label="Orden de los eventos"
            detail="Arrastrá o usá las flechas"
            icon="⇄"
            selected={selected}
            onSelect={onSelect}
          />
          <PartButton
            id={PART_DISENO}
            label="Diseño de tarjetas y grilla"
            detail={`Bordes ${data.bordes_tarjeta || 'redondeado'} · Visibles: ${data.cantidad_visible || 'todos'}`}
            icon="▢"
            selected={selected}
            onSelect={onSelect}
          />
          <PartButton
            id={PART_ENLACE}
            label="Enlace «Ver todos los eventos»"
            detail={`${data.enlace_inferior_texto || 'Ver todos los eventos'}`}
            icon="→"
            selected={selected}
            onSelect={onSelect}
          />
        </ul>

        <GroupTitle>Eventos publicados ({ordered.length})</GroupTitle>
        {!ordered.length && (
          <p className="ba-layer-empty">No hay eventos publicados en Strapi.</p>
        )}
        <ul className="ba-layer-list">
          {ordered.map((ev, index) => {
            const modified = isEventoModified(ev.documentId, data, published);
            const detail = modified
              ? 'Cambios sin publicar'
              : `${ev.fecha || 'Sin fecha'} · ${ev.ubicacion || 'Sin ubicación'}`;

            return (
              <PartButton
                key={ev.documentId}
                id={eventoPart(ev.documentId)}
                label={`${index + 1}. ${ev.titulo}`}
                detail={detail}
                icon="📅"
                selected={selected}
                onSelect={onSelect}
              />
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
