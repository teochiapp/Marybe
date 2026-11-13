import React, { useId } from 'react';
import styled from 'styled-components';
import { IMAGE_SCALE_MAX, IMAGE_SCALE_MIN } from '../../../../../utils/imageScale';

const StepButtons = styled.div`
  display: flex;
  gap: 6px;
  margin: -6px 0 14px;

  button {
    padding: 5px 10px !important;
    font-size: 11px !important;
  }
`;

const clamp = value => Math.max(IMAGE_SCALE_MIN, Math.min(IMAGE_SCALE_MAX, Math.round(value)));

// Tamaño en porcentaje: 100 (original) se guarda como null para no alterar la tienda.
export default function ScaleField({ label, value, onChange }) {
  const baseId = useId();
  const rangeId = `${baseId}-range`;
  const numberId = `${baseId}-number`;
  const current = value ?? 100;
  const set = next => onChange(clamp(next) === 100 ? null : clamp(next));
  return (
    <>
      <div className="ba-control">
        <span><label htmlFor={numberId}>{label}</label> <small>%</small></span>
        <div className="ba-range">
          <input id={rangeId} name={rangeId} aria-label={`${label} deslizador`} type="range" min={IMAGE_SCALE_MIN} max={IMAGE_SCALE_MAX} step={5} value={current} onChange={event => set(Number(event.target.value))} />
          <input id={numberId} name={numberId} aria-label={label} type="number" min={IMAGE_SCALE_MIN} max={IMAGE_SCALE_MAX} step={5} value={current} onChange={event => { if (event.target.value !== '') set(Number(event.target.value)); }} />
        </div>
      </div>
      <StepButtons>
        <button type="button" aria-label={`Achicar: ${label}`} disabled={current <= IMAGE_SCALE_MIN} onClick={() => set(current - 10)}>－ Achicar</button>
        <button type="button" aria-label={`Agrandar: ${label}`} disabled={current >= IMAGE_SCALE_MAX} onClick={() => set(current + 10)}>＋ Agrandar</button>
        <button type="button" aria-label={`Tamaño original: ${label}`} disabled={current === 100} onClick={() => onChange(null)}>Original</button>
      </StepButtons>
    </>
  );
}
