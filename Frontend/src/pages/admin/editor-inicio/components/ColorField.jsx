import React from 'react';
import styled from 'styled-components';

const ResetButton = styled.button`
  grid-column: 1 / -1;
  justify-self: start;
  padding: 4px 8px !important;
  font-size: 10px !important;
`;

export default function ColorField({ label, value, fallback, onChange }) {
  return (
    <label className="ba-control ba-color">
      <span>{label}</span>
      <input aria-label={label} type="color" value={(value || fallback).toLowerCase()} onChange={event => onChange(event.target.value.toUpperCase())} />
      <code>{value || 'Original'}</code>
      {value && <ResetButton type="button" onClick={event => { event.preventDefault(); onChange(''); }}>Usar color original</ResetButton>}
    </label>
  );
}
