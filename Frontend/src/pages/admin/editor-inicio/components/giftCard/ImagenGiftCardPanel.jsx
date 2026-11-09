import React from 'react';
import { imageUrl } from '../../../../../utils/bannerDesign';
import {
  DEFAULT_GIFT_CARD_IMAGE,
  IMAGEN_AJUSTE_OPTIONS,
  IMAGEN_POSICION_X_OPTIONS,
  IMAGEN_POSICION_Y_OPTIONS,
  IMAGEN_TAMANO_OPTIONS,
} from '../../../../../utils/giftCardSection';
import OptionTiles from '../OptionTiles';

const renderSizeSample = value => {
  const w = value === 'pequeno' ? 26 : value === 'grande' ? 46 : 36;
  const h = value === 'pequeno' ? 16 : value === 'grande' ? 28 : 22;
  return (
    <span
      style={{
        display: 'inline-block',
        width: w,
        height: h,
        borderRadius: 4,
        border: '1.5px solid #7c0405',
        background: 'rgba(124, 4, 5, 0.14)',
        transform: 'rotate(6deg)',
      }}
    />
  );
};

const renderPosXSample = value => {
  const justify =
    value === 'izquierda' ? 'flex-start' : value === 'derecha' ? 'flex-end' : 'center';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: justify,
        width: 44,
        height: 26,
        padding: 3,
        borderRadius: 4,
        border: '1.5px solid #d7cbcd',
      }}
    >
      <span style={{ width: 16, height: 12, borderRadius: 2, background: '#7c0405' }} />
    </span>
  );
};

const renderPosYSample = value => {
  const align =
    value === 'arriba' ? 'flex-start' : value === 'abajo' ? 'flex-end' : 'center';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: align,
        justifyContent: 'center',
        width: 44,
        height: 26,
        padding: 3,
        borderRadius: 4,
        border: '1.5px solid #d7cbcd',
      }}
    >
      <span style={{ width: 16, height: 12, borderRadius: 2, background: '#7c0405' }} />
    </span>
  );
};

const renderFitSample = value => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 44,
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
        height: value === 'contener' ? '72%' : '100%',
        background: 'rgba(124, 4, 5, 0.2)',
        borderRadius: 2,
      }}
    />
  </span>
);

export default function ImagenGiftCardPanel({
  data,
  published,
  onChooseImage,
  onChange,
}) {
  if (!data) return null;

  const customUrl = imageUrl(data.imagen);
  const currentSrc = customUrl || DEFAULT_GIFT_CARD_IMAGE;
  const imageChanged = (data.imagen?.id ?? null) !== (published?.imagen?.id ?? null);

  const restoreImageSettings = () => {
    onChange(next => {
      next.imagen = published?.imagen || null;
      next.imagen_tamano = published?.imagen_tamano || 'mediano';
      next.imagen_posicion_x = published?.imagen_posicion_x || 'centro';
      next.imagen_posicion_y = published?.imagen_posicion_y || 'centro';
      next.imagen_ajuste = published?.imagen_ajuste || 'contener';
    });
  };

  return (
    <>
      <p className="ba-inspector-help">
        Reemplazá la imagen de la tarjeta de regalo o ajustá su tamaño y posición sin alterar el archivo original.
      </p>

      <details open>
        <summary>Imagen principal</summary>
        <div
          className="ba-image-current"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: data.color_fondo || '#6A0304',
            padding: 12,
          }}
        >
          <img
            src={currentSrc}
            alt="Gift card Marybe"
            style={{ maxHeight: 110, maxWidth: '100%', objectFit: 'contain' }}
          />
        </div>
        <button type="button" className="ba-library-button" onClick={onChooseImage}>
          Elegir imagen
        </button>
        {data.imagen && (
          <button
            type="button"
            onClick={() => onChange(next => { next.imagen = null; })}
          >
            Usar tarjeta original de Marybe
          </button>
        )}
        {imageChanged && (
          <button
            type="button"
            onClick={() => onChange(next => { next.imagen = published?.imagen || null; })}
          >
            Volver a la imagen publicada
          </button>
        )}
        <small className="ba-hint">
          Recomendado: imagen PNG o WebP con fondo transparente para conservar la sombra proyectada.
        </small>
      </details>

      <details open>
        <summary>Ajustes visuales de la imagen</summary>
        <p className="ba-hint" style={{ marginBottom: 6 }}>
          Tamaño de imagen
        </p>
        <OptionTiles
          label="Tamaño de imagen"
          options={IMAGEN_TAMANO_OPTIONS}
          value={data.imagen_tamano || 'mediano'}
          onChange={val => onChange(next => { next.imagen_tamano = val; })}
          renderSample={renderSizeSample}
          columns={3}
        />

        <p className="ba-hint" style={{ marginBottom: 6 }}>
          Posición horizontal
        </p>
        <OptionTiles
          label="Posición horizontal"
          options={IMAGEN_POSICION_X_OPTIONS}
          value={data.imagen_posicion_x || 'centro'}
          onChange={val => onChange(next => { next.imagen_posicion_x = val; })}
          renderSample={renderPosXSample}
          columns={3}
        />

        <p className="ba-hint" style={{ marginBottom: 6 }}>
          Posición vertical
        </p>
        <OptionTiles
          label="Posición vertical"
          options={IMAGEN_POSICION_Y_OPTIONS}
          value={data.imagen_posicion_y || 'centro'}
          onChange={val => onChange(next => { next.imagen_posicion_y = val; })}
          renderSample={renderPosYSample}
          columns={3}
        />

        <p className="ba-hint" style={{ marginBottom: 6 }}>
          Ajuste de proporción
        </p>
        <OptionTiles
          label="Ajuste de imagen"
          options={IMAGEN_AJUSTE_OPTIONS}
          value={data.imagen_ajuste || 'contener'}
          onChange={val => onChange(next => { next.imagen_ajuste = val; })}
          renderSample={renderFitSample}
          columns={2}
        />
      </details>

      <button type="button" className="ba-reset-device" onClick={restoreImageSettings}>
        Restaurar imagen y ajustes publicados
      </button>
    </>
  );
}
