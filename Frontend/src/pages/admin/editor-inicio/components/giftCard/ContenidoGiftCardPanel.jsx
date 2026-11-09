import React from 'react';
import OptionTiles from '../OptionTiles';
import {
  GIFT_CARD_DEFAULTS,
  GIFT_CARD_ICON_OPTIONS,
} from '../../../../../utils/giftCardSection';

function renderIconSample(value) {
  if (value === 'ninguno') {
    return <span style={{ fontSize: 13, color: '#8a7d81', fontWeight: 600 }}>Aa</span>;
  }
  if (value === 'original') {
    return <span style={{ fontSize: 18, color: '#7c0405' }}>✦</span>;
  }
  const entry = GIFT_CARD_ICON_OPTIONS.find(item => item.value === value);
  if (!entry?.Icon) return null;
  const IconComp = entry.Icon;
  return <IconComp style={{ width: 22, height: 22, color: '#7c0405' }} />;
}

export default function ContenidoGiftCardPanel({ data, published, onChange }) {
  if (!data) return null;

  const restoreContent = () => {
    onChange(next => {
      next.titulo_destacado = published?.titulo_destacado ?? GIFT_CARD_DEFAULTS.titulo_destacado;
      next.titulo_complementario =
        published?.titulo_complementario ?? GIFT_CARD_DEFAULTS.titulo_complementario;
      next.bloque1_titulo = published?.bloque1_titulo ?? GIFT_CARD_DEFAULTS.bloque1_titulo;
      next.bloque1_descripcion =
        published?.bloque1_descripcion ?? GIFT_CARD_DEFAULTS.bloque1_descripcion;
      next.bloque1_icono = published?.bloque1_icono ?? GIFT_CARD_DEFAULTS.bloque1_icono;
      next.bloque2_titulo = published?.bloque2_titulo ?? GIFT_CARD_DEFAULTS.bloque2_titulo;
      next.bloque2_descripcion =
        published?.bloque2_descripcion ?? GIFT_CARD_DEFAULTS.bloque2_descripcion;
      next.bloque2_icono = published?.bloque2_icono ?? GIFT_CARD_DEFAULTS.bloque2_icono;
    });
  };

  return (
    <>
      <p className="ba-inspector-help">
        Editá las dos partes del título principal y los dos bloques informativos conservando su tipografía original.
      </p>

      <details open>
        <summary>Título principal («Regalá Marybe»)</summary>
        <label htmlFor="giftcard-titulo-destacado">
          Texto destacado (cursiva y negrita)
          <input
            id="giftcard-titulo-destacado"
            type="text"
            maxLength={60}
            value={data.titulo_destacado ?? ''}
            placeholder={GIFT_CARD_DEFAULTS.titulo_destacado}
            onChange={e => onChange(next => { next.titulo_destacado = e.target.value; })}
          />
        </label>

        <label htmlFor="giftcard-titulo-complementario">
          Texto complementario
          <input
            id="giftcard-titulo-complementario"
            type="text"
            maxLength={60}
            value={data.titulo_complementario ?? ''}
            placeholder={GIFT_CARD_DEFAULTS.titulo_complementario}
            onChange={e => onChange(next => { next.titulo_complementario = e.target.value; })}
          />
        </label>
        <small className="ba-hint">
          Vista previa: <em><strong>{data.titulo_destacado || 'Regalá'}</strong></em>{' '}
          {data.titulo_complementario || 'Marybe'}
        </small>
      </details>

      <details open>
        <summary>Bloque 1 — Producto</summary>
        <label htmlFor="giftcard-bloque1-titulo">
          Título del bloque 1
          <input
            id="giftcard-bloque1-titulo"
            type="text"
            maxLength={80}
            value={data.bloque1_titulo || ''}
            placeholder={GIFT_CARD_DEFAULTS.bloque1_titulo}
            onChange={e => onChange(next => { next.bloque1_titulo = e.target.value; })}
          />
        </label>

        <label htmlFor="giftcard-bloque1-descripcion">
          Descripción del bloque 1
          <textarea
            id="giftcard-bloque1-descripcion"
            rows={2}
            maxLength={200}
            value={data.bloque1_descripcion || ''}
            placeholder={GIFT_CARD_DEFAULTS.bloque1_descripcion}
            onChange={e => onChange(next => { next.bloque1_descripcion = e.target.value; })}
          />
        </label>

        <p className="ba-hint" style={{ marginTop: 8, marginBottom: 6 }}>
          Ícono del bloque 1
        </p>
        <OptionTiles
          label="Ícono del bloque 1"
          options={GIFT_CARD_ICON_OPTIONS}
          value={data.bloque1_icono || 'original'}
          onChange={val => onChange(next => { next.bloque1_icono = val; })}
          renderSample={renderIconSample}
          columns={3}
        />
      </details>

      <details open>
        <summary>Bloque 2 — Monto personalizado</summary>
        <label htmlFor="giftcard-bloque2-titulo">
          Título del bloque 2
          <input
            id="giftcard-bloque2-titulo"
            type="text"
            maxLength={80}
            value={data.bloque2_titulo || ''}
            placeholder={GIFT_CARD_DEFAULTS.bloque2_titulo}
            onChange={e => onChange(next => { next.bloque2_titulo = e.target.value; })}
          />
        </label>

        <label htmlFor="giftcard-bloque2-descripcion">
          Descripción del bloque 2
          <textarea
            id="giftcard-bloque2-descripcion"
            rows={2}
            maxLength={200}
            value={data.bloque2_descripcion || ''}
            placeholder={GIFT_CARD_DEFAULTS.bloque2_descripcion}
            onChange={e => onChange(next => { next.bloque2_descripcion = e.target.value; })}
          />
        </label>

        <p className="ba-hint" style={{ marginTop: 8, marginBottom: 6 }}>
          Ícono del bloque 2
        </p>
        <OptionTiles
          label="Ícono del bloque 2"
          options={GIFT_CARD_ICON_OPTIONS}
          value={data.bloque2_icono || 'original'}
          onChange={val => onChange(next => { next.bloque2_icono = val; })}
          renderSample={renderIconSample}
          columns={3}
        />
      </details>

      <button type="button" className="ba-reset-device" onClick={restoreContent}>
        Volver a los textos publicados
      </button>
    </>
  );
}
