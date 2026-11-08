import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import FeaturedSection from './perfumeria/FeaturedSection';
import FeaturedSectionHogar from './hogar/FeaturedSectionHogar';
import { imageScaleProps } from '../../utils/imageScale';

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
  Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>,
}), { virtual: true });
jest.mock('../../hooks/useConfiguracionGeneral', () => ({ useConfiguracionGeneral: () => ({ config: {} }) }));
jest.mock('../shared/FavoriteButton', () => () => null);

const previewData = {
  seccionInfo: { titulo_cursiva: 'Borrador cursiva', titulo_normal: 'borrador normal', color_titulo_cursiva: '#C2A15C', subtitulo: 'Subtítulo en borrador', imagen_desktop: { url: '/uploads/borrador.webp' }, imagen_mobile: null },
  banners: [{ titulo: 'Banner en borrador', imagen: { url: '/uploads/banner.webp' }, texto_boton: 'Ver más', link_boton: '/tienda' }],
  productos: [{ id: 1, documentId: 'p1', nombre: 'Producto en borrador', marca: 'QA', precio: 1000 }],
};

const originalFetch = global.fetch;
beforeEach(() => { global.fetch = jest.fn(() => Promise.resolve({ json: () => Promise.resolve({ data: null }) })); });
afterEach(() => { global.fetch = originalFetch; });

test('FeaturedSection muestra los datos del editor sin consultar la API', async () => {
  render(<FeaturedSection seccion="perfumeria" previewData={previewData} />);
  expect(screen.getByText('Borrador cursiva')).toHaveStyle({ color: '#C2A15C' });
  expect(screen.getByText('Subtítulo en borrador')).toBeInTheDocument();
  expect(screen.getByText('Producto en borrador')).toBeInTheDocument();
  expect(screen.getByText('Banner en borrador')).toBeInTheDocument();
  expect(screen.getByAltText('Fragancias destacadas')).toHaveAttribute('src', expect.stringContaining('/uploads/borrador.webp'));
  await waitFor(() => expect(global.fetch).not.toHaveBeenCalled());
});

test('sin previewData la sección sigue consultando Strapi como antes', async () => {
  render(<FeaturedSection seccion="perfumeria" />);
  await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/seccion-principal')));
  expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('filters[destacado][$eq]=true'));
});

test('FeaturedSectionHogar muestra los datos del editor sin consultar la API', async () => {
  render(<FeaturedSectionHogar previewData={{ ...previewData, banners: [] }} />);
  expect(screen.getByText('Borrador cursiva')).toBeInTheDocument();
  expect(screen.getByText('Producto en borrador')).toBeInTheDocument();
  await waitFor(() => expect(global.fetch).not.toHaveBeenCalled());
});

test('el tamaño de imagen solo cambia el estilo cuando hay un ajuste válido', () => {
  expect(imageScaleProps({})).toEqual({});
  expect(imageScaleProps({ escala_imagen_desktop: 100, escala_imagen_mobile: null })).toEqual({});
  expect(imageScaleProps({ escala_imagen_desktop: 999 })).toEqual({});
  expect(imageScaleProps({ escala_imagen_desktop: 140, escala_imagen_mobile: 60 }).style).toEqual({ '--img-escala': 1.4, '--img-escala-mobile': 0.6 });
  render(<FeaturedSection seccion="perfumeria" previewData={{ ...previewData, seccionInfo: { ...previewData.seccionInfo, escala_imagen_desktop: 140 }, banners: [{ ...previewData.banners[0], escala_imagen_mobile: 60 }] }} />);
  // El ajuste vive en el contenedor de la imagen, sin rol accesible propio.
  /* eslint-disable testing-library/no-node-access */
  expect(screen.getByAltText('Fragancias destacadas').closest('[data-img-escala]')).toHaveStyle({ '--img-escala': '1.4' });
  expect(screen.getByAltText('Banner en borrador').closest('[data-img-escala]')).toHaveStyle({ '--img-escala-mobile': '0.6' });
  /* eslint-enable testing-library/no-node-access */
});
