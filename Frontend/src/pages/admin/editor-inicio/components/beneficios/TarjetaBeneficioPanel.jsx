import React, { useEffect, useState } from 'react';
import { imageUrl } from '../../../../../utils/bannerDesign';
import {
  AJUSTE_LOGO_OPTIONS,
  POSICION_LOGO_OPTIONS,
  TAMANO_LOGO_OPTIONS,
  formatCuotas,
  formatCuotasInput,
  logoContainerStyle,
  logoImgStyle,
  parseCuotasInput,
} from '../../../../../utils/beneficiosSection';
import OptionTiles from '../OptionTiles';

const renderSizeSample = value => {
  const w = value === 'pequeno' ? 24 : value === 'grande' ? 44 : 34;
  const h = value === 'pequeno' ? 14 : value === 'grande' ? 26 : 20;
  return (
    <span
      style={{
        display: 'inline-block',
        width: w,
        height: h,
        borderRadius: 4,
        border: '1.5px solid #7c0405',
        background: 'rgba(124, 4, 5, 0.12)',
      }}
    />
  );
};

const renderFitSample = value => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 42,
      height: 26,
      borderRadius: 4,
      border: '1.5px dashed #a08c93',
      padding: value === 'contener' ? 4 : 0,
      overflow: 'hidden',
    }}
  >
    <span
      style={{
        width: '100%',
        height: value === 'contener' ? '70%' : '100%',
        background: 'rgba(124, 4, 5, 0.2)',
        borderRadius: 2,
      }}
    />
  </span>
);

const renderPosSample = value => {
  const map = {
    centro: { alignItems: 'center', justifyContent: 'center' },
    izquierda: { alignItems: 'center', justifyContent: 'flex-start' },
    derecha: { alignItems: 'center', justifyContent: 'flex-end' },
    arriba: { alignItems: 'flex-start', justifyContent: 'center' },
    abajo: { alignItems: 'flex-end', justifyContent: 'center' },
  };
  const align = map[value] || map.centro;
  return (
    <span
      style={{
        display: 'inline-flex',
        width: 42,
        height: 26,
        padding: 3,
        borderRadius: 4,
        border: '1.5px solid #d7cbcd',
        ...align,
      }}
    >
      <span
        style={{
          width: 14,
          height: 10,
          borderRadius: 2,
          background: '#7c0405',
        }}
      />
    </span>
  );
};

export default function TarjetaBeneficioPanel({
  card,
  position,
  total,
  publishedCard,
  onChangeCard,
  onChooseLogo,
  onRestoreLogo,
  onRestoreCard,
  onMove,
}) {
  const [cuotasInput, setCuotasInput] = useState(() => formatCuotasInput(card?.cuotas_cantidad));

  useEffect(() => {
    setCuotasInput(formatCuotasInput(card?.cuotas_cantidad));
  }, [card?.documentId, card?.cuotas_cantidad]);

  if (!card) return null;

  const url = imageUrl(card.logo);
  const logoChanged = (card.logo?.id ?? null) !== (publishedCard?.logo?.id ?? null);
  const cuotasTexto = formatCuotas(card.cuotas_cantidad);
  const containerStyle = logoContainerStyle(card);
  const imgStyle = logoImgStyle(card);

  const handleCuotasChange = raw => {
    setCuotasInput(raw);
    onChangeCard({ cuotas_cantidad: parseCuotasInput(raw) });
  };

  return (
    <>
      <p className="ba-inspector-help">
        Editá los textos, condiciones de financiación y el logo de esta tarjeta. Los cambios de contenido se aplican en Strapi al publicar.
      </p>

      <details open>
        <summary>Textos de la tarjeta</summary>
        <label htmlFor="beneficio-nombre">
          Nombre del banco o entidad
          <input
            id="beneficio-nombre"
            type="text"
            maxLength={120}
            value={card.nombre || ''}
            placeholder="Ej: Tarjeta Naranja X"
            onChange={e => onChangeCard({ nombre: e.target.value })}
          />
        </label>

        <label htmlFor="beneficio-cuotas-cantidad">
          Cantidad de cuotas destacadas en negrita (opcional)
          <input
            id="beneficio-cuotas-cantidad"
            type="text"
            value={cuotasInput}
            placeholder="Ej: 3, 6"
            onChange={e => handleCuotasChange(e.target.value)}
          />
        </label>
        <small className="ba-hint">
          Escribí los números separados por coma (ej. <code>3, 6</code> para mostrar{' '}
          <strong>Hasta 3 y 6 cuotas</strong>).
        </small>

        <label htmlFor="beneficio-cuotas-descripcion">
          Condición o descripción del beneficio
          <input
            id="beneficio-cuotas-descripcion"
            type="text"
            maxLength={200}
            value={card.cuotas_descripcion || ''}
            placeholder="Ej: sin interés"
            onChange={e => onChangeCard({ cuotas_descripcion: e.target.value })}
          />
        </label>

        <label htmlFor="beneficio-monto-minimo">
          Monto mínimo destacado en negrita (opcional)
          <input
            id="beneficio-monto-minimo"
            type="text"
            maxLength={80}
            value={card.monto_minimo || ''}
            placeholder="Ej: $30.000"
            onChange={e => onChangeCard({ monto_minimo: e.target.value })}
          />
        </label>
        <small className="ba-hint">
          Vista previa del texto:{' '}
          {cuotasTexto ? (
            <>
              Hasta <strong>{cuotasTexto}</strong> {card.cuotas_descripcion}
            </>
          ) : (
            card.cuotas_descripcion
          )}
          {card.monto_minimo ? (
            <>
              {' '}en compras desde <strong>{card.monto_minimo}</strong>
            </>
          ) : null}
        </small>
      </details>

      <details open>
        <summary>Logo e imagen</summary>
        <div
          className="ba-image-current"
          style={{
            display: 'flex',
            background: '#ffffff',
            padding: 10,
            ...(containerStyle || { alignItems: 'center', justifyContent: 'center' }),
          }}
        >
          {url ? (
            <img
              src={url}
              alt={`Logo de ${card.nombre}`}
              style={imgStyle || { maxHeight: '50px', maxWidth: '140px', objectFit: 'contain' }}
            />
          ) : (
            <span>Sin logo</span>
          )}
        </div>
        <button type="button" className="ba-library-button" onClick={onChooseLogo}>
          Elegir logo
        </button>
        {logoChanged && (
          <button type="button" onClick={onRestoreLogo}>
            Volver al logo publicado
          </button>
        )}

        <p className="ba-hint" style={{ marginTop: 10, marginBottom: 6 }}>
          Tamaño del logo
        </p>
        <OptionTiles
          label="Tamaño del logo"
          options={TAMANO_LOGO_OPTIONS}
          value={card.tamano_logo || 'mediano'}
          onChange={val => onChangeCard({ tamano_logo: val })}
          renderSample={renderSizeSample}
          columns={3}
        />

        <p className="ba-hint" style={{ marginTop: 6, marginBottom: 6 }}>
          Ajuste dentro del contenedor
        </p>
        <OptionTiles
          label="Ajuste del logo"
          options={AJUSTE_LOGO_OPTIONS}
          value={card.ajuste_logo || 'contener'}
          onChange={val => onChangeCard({ ajuste_logo: val })}
          renderSample={renderFitSample}
          columns={2}
        />

        <p className="ba-hint" style={{ marginTop: 6, marginBottom: 6 }}>
          Posición del logo
        </p>
        <OptionTiles
          label="Posición del logo"
          options={POSICION_LOGO_OPTIONS}
          value={card.posicion_logo || 'centro'}
          onChange={val => onChangeCard({ posicion_logo: val })}
          renderSample={renderPosSample}
          columns={3}
        />
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
            aria-label={`Mover ${card.nombre} antes`}
          >
            ← Mover antes
          </button>
          <button
            type="button"
            disabled={position === total - 1}
            onClick={() => onMove(1)}
            aria-label={`Mover ${card.nombre} después`}
          >
            Mover después →
          </button>
        </div>
      </details>

      <button type="button" className="ba-reset-device" onClick={onRestoreCard}>
        Restaurar valores publicados de esta tarjeta
      </button>
    </>
  );
}
