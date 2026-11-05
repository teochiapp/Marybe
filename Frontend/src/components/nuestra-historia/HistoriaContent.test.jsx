import React from 'react';
import { render, screen } from '@testing-library/react';
import HistoriaContent from './HistoriaContent';
import { usePaginaHistoria } from '../../hooks/usePaginaHistoria';

jest.mock('../../hooks/usePaginaHistoria');

test('selecciona la imagen móvil con picture y conserva un solo nodo img para la imagen final', () => {
  usePaginaHistoria.mockReturnValue({
    titulo: 'Nuestra Historia',
    texto_banner_1: '<p>Texto inicial</p>',
    texto_intermedio: '<p>Texto central</p>',
    texto_banner_2: '<p>Texto secundario</p>',
    imagen_inicio: 'https://strapi.test/inicio.jpg',
    imagen_secundaria: 'https://strapi.test/equipo.jpg',
    imagen_final_desktop: 'https://strapi.test/final-desktop.jpg',
    imagen_final_mobile: 'https://strapi.test/final-mobile.jpg',
    encuadre_imagen_inicio: 'left center',
    encuadre_imagen_secundaria: 'center bottom',
    encuadre_imagen_final_desktop: 'center top',
    encuadre_imagen_final_mobile: 'right center',
  });

  const { container } = render(<HistoriaContent />);
  const picture = container.querySelector('picture');

  expect(picture.querySelector('source').getAttribute('media')).toBe('(max-width: 900px)');
  expect(picture.querySelector('source').getAttribute('srcset')).toBe('https://strapi.test/final-mobile.jpg');
  expect(picture.querySelectorAll('img')).toHaveLength(1);
  expect(picture.querySelector('img').getAttribute('src')).toBe('https://strapi.test/final-desktop.jpg');
  expect(picture.style.getPropertyValue('--position-desktop')).toBe('center top');
  expect(picture.style.getPropertyValue('--position-mobile')).toBe('right center');
  expect(getComputedStyle(screen.getByAltText(/Fundadores de MARYBE/)).objectPosition).toBe('left center');
  expect(getComputedStyle(screen.getByAltText(/Equipo de MARYBE/)).objectPosition).toBe('center bottom');
});

test('omite contenedores de imágenes si Strapi no envía archivos', () => {
  usePaginaHistoria.mockReturnValue({
    titulo: 'Nuestra Historia',
    texto_banner_1: '<p>Texto inicial</p>',
    texto_intermedio: '<p>Texto central</p>',
    texto_banner_2: '<p>Texto secundario</p>',
    imagen_inicio: '',
    imagen_secundaria: '',
    imagen_final_desktop: '',
    imagen_final_mobile: '',
    encuadre_imagen_inicio: 'center',
    encuadre_imagen_secundaria: 'center',
    encuadre_imagen_final_desktop: 'center',
    encuadre_imagen_final_mobile: 'center',
  });

  const { container } = render(<HistoriaContent />);
  expect(container.querySelectorAll('img, picture')).toHaveLength(0);
  expect(screen.getByText('Nuestra Historia')).toBeTruthy();
});
