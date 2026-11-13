import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import OptionTiles from '../OptionTiles';
import {
  GIFT_CARD_COLOR_PRESETS,
  MODO_TEXTO_OPTIONS,
  defaultBgForSeccion,
  isValidHexColor,
  resolveTextTone,
} from '../../../../../utils/giftCardSection';

const SwatchGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 12px;
`;

const SwatchButton = styled.button`
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 8px !important;
  border: 1px solid ${({ $active }) => ($active ? 'var(--color-bordo-secundario)' : '#e7dfdd')} !important;
  border-radius: 8px !important;
  background: ${({ $active }) => ($active ? '#fbf3f3' : 'var(--color-blanco)')} !important;
  font-size: 10.5px !important;
  text-align: left;

  i {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 1px solid rgba(0, 0, 0, 0.15);
    flex-shrink: 0;
  }

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--color-marron-cuarto);
    font-weight: 600;
  }
`;

const ColorPickerRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;

  input[type='color'] {
    width: 44px;
    height: 36px;
    padding: 2px;
    border: 1px solid #d9cfd1;
    border-radius: 8px;
    background: #fff;
    cursor: pointer;
  }

  input[type='text'] {
    flex: 1;
    font-family: monospace;
    text-transform: uppercase;
  }
`;

const renderToneSample = value => {
  const bg = value === 'oscuro' ? '#F7F3EC' : '#6A0304';
  const fg = value === 'oscuro' ? '#280101' : '#FFFFFF';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 44,
        height: 26,
        borderRadius: 6,
        background: bg,
        color: fg,
        fontSize: 12,
        fontWeight: 700,
        border: '1px solid rgba(0,0,0,0.12)',
      }}
    >
      Aa
    </span>
  );
};

export default function AparienciaGiftCardPanel({
  data,
  areaKey,
  onChange,
}) {
  const defaultBg = defaultBgForSeccion(areaKey);
  const [hexInput, setHexInput] = useState(data?.color_fondo || defaultBg);

  useEffect(() => {
    setHexInput(data?.color_fondo || defaultBg);
  }, [data?.color_fondo, defaultBg]);

  if (!data) return null;

  const hexValid = isValidHexColor(hexInput);
  const activeColor = isValidHexColor(data.color_fondo)
    ? data.color_fondo.toUpperCase()
    : defaultBg;
  const resolvedTone = resolveTextTone(activeColor, data.modo_texto);

  const handleHexChange = raw => {
    setHexInput(raw);
    if (isValidHexColor(raw)) {
      onChange(next => {
        next.color_fondo = raw.trim().toUpperCase();
      });
    }
  };

  return (
    <>
      <p className="ba-inspector-help">
        Elegí un color de la paleta de Marybe o ingresá un código HEX personalizado. El cambio solo afecta a la sección Gift Card.
      </p>

      <details open>
        <summary>Color de fondo de la sección</summary>
        <SwatchGrid role="group" aria-label="Colores predefinidos de Marybe">
          {GIFT_CARD_COLOR_PRESETS.map(preset => {
            const isSelected = activeColor === preset.value.toUpperCase();
            return (
              <SwatchButton
                key={preset.value}
                type="button"
                $active={isSelected}
                onClick={() => {
                  setHexInput(preset.value);
                  onChange(next => {
                    next.color_fondo = preset.value;
                  });
                }}
              >
                <i style={{ background: preset.value }} aria-hidden="true" />
                <span>{preset.label}</span>
              </SwatchButton>
            );
          })}
        </SwatchGrid>

        <label htmlFor="giftcard-color-hex">Código de color HEX</label>
        <ColorPickerRow>
          <input
            id="giftcard-color-picker"
            name="color_fondo_picker"
            type="color"
            aria-label="Selector visual de color de fondo"
            value={activeColor}
            onChange={e => handleHexChange(e.target.value.toUpperCase())}
          />
          <input
            id="giftcard-color-hex"
            name="color_fondo"
            type="text"
            maxLength={7}
            value={hexInput}
            placeholder={defaultBg}
            onChange={e => handleHexChange(e.target.value)}
          />
        </ColorPickerRow>
        {!hexValid ? (
          <small className="ba-hint" style={{ color: '#b91c1c' }}>
            Ingresá un valor HEX válido de 6 dígitos precedido por # (ej. <code>#6A0304</code>).
          </small>
        ) : (
          <small className="ba-hint">
            Color actual: <strong>{activeColor}</strong> (original de esta área: {defaultBg}).
          </small>
        )}

        <button
          type="button"
          style={{ marginTop: 8 }}
          disabled={activeColor === defaultBg}
          onClick={() => {
            setHexInput(defaultBg);
            onChange(next => {
              next.color_fondo = defaultBg;
            });
          }}
        >
          Restaurar color original ({defaultBg})
        </button>
      </details>

      <details open>
        <summary>Contraste y color de textos</summary>
        <OptionTiles
          label="Contraste de textos"
          options={MODO_TEXTO_OPTIONS}
          value={data.modo_texto || 'auto'}
          onChange={val => onChange(next => { next.modo_texto = val; })}
          renderSample={renderToneSample}
          columns={3}
        />
        <small className="ba-hint">
          En modo automático, el texto e íconos se muestran en tono{' '}
          <strong>{resolvedTone === 'oscuro' ? 'oscuro' : 'claro'}</strong> para asegurar legibilidad.
        </small>
      </details>
    </>
  );
}
