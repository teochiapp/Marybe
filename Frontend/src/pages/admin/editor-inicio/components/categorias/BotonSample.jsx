import React from 'react';
import styled, { css } from 'styled-components';

// Miniatura de cómo queda cada estilo de botón.
const ButtonSample = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  border-radius: 999px;
  background: var(--color-bordo-secundario);
  color: var(--color-blanco);
  font-size: 10px;
  font-weight: 600;

  ${({ $boton }) => $boton === 'redondeado' && css`border-radius: 6px;`}
  ${({ $boton }) => $boton === 'cuadrado' && css`border-radius: 0;`}
  ${({ $estilo }) => $estilo === 'claro' && css`
    background: var(--color-blanco);
    color: var(--color-bordo-secundario);
    box-shadow: 0 0 0 1px #e3d6d6, 0 2px 6px rgba(0, 0, 0, 0.08);
  `}
`;

const ButtonBackdrop = styled.span`
  display: grid;
  place-items: center;
  width: 92px;
  height: 46px;
  border-radius: 6px;
  background: linear-gradient(135deg, #e9d9c4, #b98f6a);
`;

export default function BotonSample({ boton, estilo }) {
  return <ButtonBackdrop><ButtonSample $boton={boton} $estilo={estilo}>Fragancias ›</ButtonSample></ButtonBackdrop>;
}
