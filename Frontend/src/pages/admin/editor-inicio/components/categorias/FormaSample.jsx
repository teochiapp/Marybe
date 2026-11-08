import React from 'react';
import styled, { css } from 'styled-components';

// Miniatura de cómo queda cada forma de tarjeta.
const CardSample = styled.span`
  position: relative;
  display: block;
  width: 62px;
  height: 52px;
  border-radius: 9px;
  overflow: hidden;
  background: linear-gradient(135deg, #e9d9c4, #b98f6a);

  ${({ $forma }) => $forma === 'rectangular' && css`border-radius: 0;`}
  ${({ $forma }) => $forma === 'cuadrado' && css`width: 52px; border-radius: 4px;`}
  ${({ $forma }) => $forma === 'circular' && css`
    width: 52px;
    height: 58px;
    overflow: visible;
    background: none;
  `}
`;

const CircleImage = styled.span`
  display: block;
  width: 44px;
  height: 44px;
  margin: 0 auto;
  border-radius: 50%;
  background: linear-gradient(135deg, #e9d9c4, #b98f6a);
`;

const LabelBar = styled.span`
  position: absolute;
  left: 6px;
  right: 6px;
  bottom: 6px;
  height: 9px;
  border-radius: 999px;
  background: var(--color-bordo-secundario);

  ${({ $static }) => $static && css`
    position: static;
    display: block;
    width: 44px;
    margin: 5px auto 0;
  `}
`;

export default function FormaSample({ forma }) {
  return (
    <CardSample $forma={forma}>
      {forma === 'circular' && <CircleImage />}
      <LabelBar $static={forma === 'circular'} />
    </CardSample>
  );
}
