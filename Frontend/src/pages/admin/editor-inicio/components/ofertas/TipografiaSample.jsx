import React from 'react';
import styled from 'styled-components';
import { SECCION_ALINEACIONES, SECCION_COLORES, SECCION_FONDOS, SECCION_FUENTES, SECCION_PESOS } from '../../../../../utils/disenoSeccion';

const SAMPLE_SIZES = { chico: '15px', mediano: '18px', grande: '21px', 'muy-grande': '26px' };

const Text = styled.span`
  display: block;
  width: 86px;
  color: ${({ $color }) => $color};
  font-family: ${({ $fuente }) => SECCION_FUENTES[$fuente]};
  font-size: ${({ $tamano }) => SAMPLE_SIZES[$tamano]};
  font-weight: ${({ $peso }) => SECCION_PESOS[$peso]};
  line-height: 1.1;
  text-align: ${({ $alineacion }) => SECCION_ALINEACIONES[$alineacion]};
  white-space: nowrap;
`;

const Lines = styled.span`
  display: grid;
  gap: 4px;
  width: 64px;
  justify-items: ${({ $alineacion }) => ({ izquierda: 'start', centro: 'center', derecha: 'end' })[$alineacion]};

  i {
    display: block;
    height: 5px;
    border-radius: var(--radius-full);
    background: ${({ $color }) => $color};
  }

  i:nth-child(1) { width: 100%; }
  i:nth-child(2) { width: 62%; }
  i:nth-child(3) { width: 80%; }
`;

const Band = styled.span`
  display: flex;
  align-items: center;
  gap: 5px;
  width: 86px;
  padding: ${({ $espaciado }) => ({ compacto: '5px', original: '10px', amplio: '17px' })[$espaciado] || '10px'} 8px;
  border: 1px solid #ebe5e5;
  border-radius: 6px;
  background: ${({ $fondo }) => SECCION_FONDOS[$fondo] || 'var(--color-blanco)'};

  i {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--color-bordo-secundario);
    opacity: 0.85;
  }
`;

// Muestra dibujada de una opción del título o de la sección para los selectores visuales.
export default function TipografiaSample({ kind, value, diseno = {}, areaColor }) {
  const color = SECCION_COLORES[kind === 'color' ? value : diseno.color] || areaColor;
  if (kind === 'alineacion') return <Lines $alineacion={value} $color={color}><i /><i /><i /></Lines>;
  if (kind === 'fondo') return <Band $fondo={value} $espaciado="original"><i /><i /><i /></Band>;
  if (kind === 'espaciado') return <Band $fondo={diseno.fondo || 'blanco'} $espaciado={value}><i /><i /><i /></Band>;
  const sample = { fuente: diseno.fuente || 'secundaria', tamano: 'grande', peso: diseno.peso || 'semibold', [kind]: value };
  return <Text $color={color} $fuente={sample.fuente} $tamano={sample.tamano} $peso={sample.peso} $alineacion="centro">Ofertas</Text>;
}
