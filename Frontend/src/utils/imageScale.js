import { css } from 'styled-components';

// Tamaño de imagen configurable desde el Editor de Inicio (porcentaje, 100 = tamaño original).
export const IMAGE_SCALE_MIN = 30;
export const IMAGE_SCALE_MAX = 200;
export const IMAGE_SCALE_BREAKPOINT = 768;

export function validImageScale(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isInteger(number) && number >= IMAGE_SCALE_MIN && number <= IMAGE_SCALE_MAX ? number : null;
}

// Props para el contenedor de la imagen. Sin ajustes devuelve {} y el estilo original no cambia.
export function imageScaleProps(source) {
  const desktop = validImageScale(source?.escala_imagen_desktop) ?? 100;
  const mobile = validImageScale(source?.escala_imagen_mobile) ?? 100;
  if (desktop === 100 && mobile === 100) return {};
  return { 'data-img-escala': '', style: { '--img-escala': desktop / 100, '--img-escala-mobile': mobile / 100 } };
}

export const imageScaleCss = (origin = 'center', mobileOrigin = origin) => css`
  &[data-img-escala] img {
    transform: scale(var(--img-escala, 1));
    transform-origin: ${origin};
  }

  @media (max-width: ${IMAGE_SCALE_BREAKPOINT}px) {
    &[data-img-escala] img {
      transform: scale(var(--img-escala-mobile, 1));
      transform-origin: ${mobileOrigin};
    }
  }
`;
