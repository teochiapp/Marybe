import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import CategoriesSection from './perfumeria/CategoriesSection';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }), { virtual: true });

const categorias = [
  { id: 1, documentId: 'c1', nombre: 'Fragancias', portada: { url: '/uploads/a.webp' } },
  { id: 2, documentId: 'c2', nombre: 'Maquillaje', portada: null },
  { id: 3, documentId: 'c3', nombre: 'Dermo', portada: null },
];
const names = () => screen.getAllByText(/Fragancias|Maquillaje|Dermo/).map(element => element.textContent);

const originalFetch = global.fetch;
function mockApi(design) {
  global.fetch = jest.fn(url => Promise.resolve({ json: () => Promise.resolve(url.includes('/api/seccion-principal') ? { data: { diseno_categorias: design } } : { data: categorias }) }));
}
afterEach(() => { global.fetch = originalFetch; });

test('sin configuración conserva el orden de la API y el diseño original', async () => {
  mockApi(null);
  render(<CategoriesSection seccion="perfumeria" />);
  await waitFor(() => expect(names()).toEqual(['Fragancias', 'Maquillaje', 'Dermo']));
  expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('pagination[pageSize]=100'));
});

test('aplica el orden guardado del área y agrega al final las categorías nuevas', async () => {
  mockApi({ perfumeria: { orden: ['c3', 'c1'], forma: 'circular' }, hogar: { orden: ['c2'] } });
  render(<CategoriesSection seccion="perfumeria" />);
  await waitFor(() => expect(names()).toEqual(['Dermo', 'Fragancias', 'Maquillaje']));
});

test('la versión compacta del catálogo no consulta el diseño de Inicio', async () => {
  mockApi({ perfumeria: { orden: ['c3'] } });
  render(<CategoriesSection compact />);
  await waitFor(() => expect(names()).toEqual(['Fragancias', 'Maquillaje', 'Dermo']));
  expect(global.fetch).not.toHaveBeenCalledWith(expect.stringContaining('/api/seccion-principal'));
});

test('con previewData muestra el borrador sin consultar la API', () => {
  global.fetch = jest.fn();
  render(<CategoriesSection seccion="perfumeria" previewData={{ categorias: [categorias[1], categorias[0]], diseno: { forma: 'cuadrado', boton: 'cuadrado', estiloBoton: 'claro' } }} />);
  expect(names()).toEqual(['Maquillaje', 'Fragancias']);
  expect(global.fetch).not.toHaveBeenCalled();
});
