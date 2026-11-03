import React, { forwardRef, useId } from 'react';
import styled from 'styled-components';

const PALETTE = [
  ['Blanco', '#FFFFFF'], ['Negro', '#000000'], ['Gris', '#808080'],
  ['Bordó Marybe', '#560203'], ['Rosa Marybe', '#F2D4D4'], ['Dorado Marybe', '#C7A86B'],
  ['Rojo', '#E53935'], ['Naranja', '#FB8C00'], ['Amarillo', '#FDD835'],
  ['Verde', '#43A047'], ['Turquesa', '#00897B'], ['Celeste', '#29B6F6'],
  ['Azul', '#1E88E5'], ['Violeta', '#8E24AA'], ['Rosa', '#EC407A'],
];
const LABELS = { color_texto: 'Color del texto', color_titulo_cursiva: 'Color del título en cursiva', color_titulo_normal: 'Color del título normal' };

const Fieldset = styled.fieldset`
  border: 0;
  margin: 0;
  padding: 0;
  min-width: 0;
  color: ${({ theme }) => theme?.colors?.neutral800 || '#32324D'};
  font-size: 14px;
  legend { padding: 0; margin-bottom: 8px; font-weight: 600; }
  p { margin: 8px 0 0; font-size: 12px; line-height: 1.5; }
  &:disabled { opacity: .6; }
`;
const Card = styled.div`
  border: 1px solid ${({ theme, $error }) => $error ? (theme?.colors?.danger600 || '#D02B20') : (theme?.colors?.neutral200 || '#DCDCE4')};
  border-radius: 8px;
  padding: 14px;
  background: ${({ theme }) => theme?.colors?.neutral0 || '#FFF'};
`;
const Swatches = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 12px 0 16px;
`;
const Swatch = styled.button`
  width: 30px;
  height: 30px;
  padding: 0;
  border: 1px solid #999;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  cursor: pointer;
  &[aria-pressed='true'] { outline: 3px solid ${({ theme }) => theme?.colors?.primary600 || '#4945FF'}; outline-offset: 2px; }
  &:focus-visible { outline: 3px solid ${({ theme }) => theme?.colors?.primary600 || '#4945FF'}; outline-offset: 3px; }
  &:disabled { cursor: not-allowed; }
`;
const Actions = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  label { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; }
  input[type='color'] { width: 38px; height: 32px; padding: 2px; border: 1px solid #999; border-radius: 4px; background: transparent; cursor: pointer; }
  input:focus-visible, button:focus-visible { outline: 2px solid ${({ theme }) => theme?.colors?.primary600 || '#4945FF'}; outline-offset: 3px; }
  button { border: 0; padding: 6px 0; background: transparent; color: ${({ theme }) => theme?.colors?.primary600 || '#4945FF'}; text-decoration: underline; font: inherit; font-size: 13px; cursor: pointer; }
  button:disabled { cursor: not-allowed; opacity: .6; }
`;

const ColorPaletteInput = forwardRef(function ColorPaletteInput({ name, value, onChange, onBlur, onFocus, label, intlLabel, disabled = false, required = false, error }, ref) {
  const id = useId();
  const fieldName = name.split('.').pop();
  const providedLabel = label || intlLabel?.defaultMessage;
  const title = !providedLabel || providedLabel === fieldName ? (LABELS[fieldName] || 'Color del texto') : providedLabel;
  const color = typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value) ? value.toUpperCase() : '';
  const selection = PALETTE.find(([, hex]) => hex === color);
  const status = color ? (selection?.[0] || 'Color personalizado') : 'Color original';
  const change = next => {
    if (!disabled) onChange({ target: { name, type: 'string', value: next } });
  };

  return (
    <Fieldset disabled={disabled} aria-describedby={`${id}-hint${error ? ` ${id}-error` : ''}`} aria-invalid={Boolean(error)} onFocus={onFocus} onBlur={onBlur}>
      <legend>{title}{required ? ' *' : ''}</legend>
      <Card $error={Boolean(error)}>
        <span role="status">{status}</span>
        <Swatches role="group" aria-label={`Paleta: ${title}`}>
          {PALETTE.map(([colorName, hex]) => (
            <Swatch key={hex} type="button" $color={hex} title={colorName} aria-label={colorName} aria-pressed={color === hex} onClick={() => change(hex)} />
          ))}
        </Swatches>
        <Actions>
          <label htmlFor={id}>
            <input ref={ref} id={id} name={name} type="color" value={color || '#560203'} onChange={event => change(event.target.value.toUpperCase())} aria-label={`Otro color: ${title}`} />
            Otro color
          </label>
          <button type="button" onClick={() => change(null)} disabled={!value || disabled}>Restaurar color original</button>
        </Actions>
      </Card>
      <p id={`${id}-hint`}>Elegí un color de la paleta o abrí “Otro color”. Sin selección se mantiene el color original.</p>
      {error && <p id={`${id}-error`} role="alert">{typeof error === 'string' ? error : 'Revisá el color seleccionado.'}</p>}
    </Fieldset>
  );
});

export default ColorPaletteInput;
