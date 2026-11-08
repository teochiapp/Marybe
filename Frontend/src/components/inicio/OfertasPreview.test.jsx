import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import OfertasSection from './perfumeria/OfertasSection';
import { disenoSeccion } from '../../utils/disenoSeccion';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }), { virtual: true });

const respond = body => Promise.resolve({ json: () => Promise.resolve(body) });
const originalFetch = global.fetch;
afterEach(() => { global.fetch = originalFetch; mockNavigate.mockClear(); });

test('sin configuración muestra el título y el diseño originales y conserva las insignias y sus enlaces', async () => {
  global.fetch = jest.fn(() => respond({ data: { diseno_secciones: null } }));
  render(<OfertasSection seccion="hogar" />);
  const title = await screen.findByRole('heading', { name: 'Disfrutá de las mejores ofertas' });
  expect(title).toBeVisible();
  expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/seccion-principal?fields[0]=diseno_secciones'));
  expect(title).toHaveStyle({ fontWeight: '600', textAlign: 'left', color: 'var(--color-hogar)', fontFamily: 'var(--font-family-secondary)', fontSize: '2.5rem' });
  const badges = screen.getAllByRole('button', { name: /Filtrar ofertas hasta/ });
  expect(badges.map(badge => badge.getAttribute('aria-label'))).toEqual([60, 50, 40, 35, 30, 25, 20, 15, 10].map(value => `Filtrar ofertas hasta ${value}%`));
  fireEvent.click(badges[0]);
  expect(mockNavigate).toHaveBeenCalledWith('/tienda?descuento=60&seccion=Hogar');
});

test('aplica lo publicado del área y oculta el título solo mientras carga', async () => {
  global.fetch = jest.fn(() => respond({ data: { diseno_secciones: { ofertas: { perfumeria: { titulo: 'Ofertas de la semana', fuente: 'principal', tamano: 'chico', peso: 'bold', alineacion: 'centro', color: 'marron-cuarto', fondo: 'arena', espaciado: 'amplio' } } } } }));
  render(<OfertasSection seccion="perfumeria" />);
  expect(screen.getByRole('heading', { hidden: true })).not.toBeVisible();
  const title = await screen.findByRole('heading', { name: 'Ofertas de la semana' });
  await waitFor(() => expect(title).toBeVisible());
  expect(title).toHaveStyle({ fontWeight: '700', textAlign: 'center', color: 'var(--color-marron-cuarto)', fontFamily: 'var(--font-family-primary)', fontSize: '1.9rem', paddingRight: '60px' });
  expect(title).toHaveAttribute('data-editor-part', 'titulo');
});

test('si Strapi falla muestra el diseño original', async () => {
  global.fetch = jest.fn(() => Promise.reject(new Error('offline')));
  render(<OfertasSection seccion="perfumeria" />);
  expect(await screen.findByRole('heading', { name: 'Disfrutá de las mejores ofertas' })).toBeVisible();
});

test('con previewData usa el borrador sin consultar Strapi', () => {
  global.fetch = jest.fn();
  render(<OfertasSection seccion="perfumeria" previewData={{ titulo: 'Borrador', peso: 'normal' }} />);
  expect(screen.getByRole('heading', { name: 'Borrador' })).toHaveStyle({ fontWeight: '400' });
  expect(global.fetch).not.toHaveBeenCalled();
});

test('disenoSeccion descarta valores inválidos', () => {
  expect(disenoSeccion({ titulo: ' ', fuente: 'comic', color: '#FF0000', fondo: 'url(x)', tamano: '__proto__' }, 'Título')).toEqual({ titulo: 'Título', fuente: 'secundaria', tamano: 'grande', peso: 'semibold', alineacion: 'izquierda', color: 'original', fondo: 'blanco', espaciado: 'original' });
});
