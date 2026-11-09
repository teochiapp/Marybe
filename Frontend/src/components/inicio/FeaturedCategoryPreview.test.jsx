import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import FeaturedCategorySection from './perfumeria/FeaturedCategorySection';
import SpecificCategorySection from './perfumeria/SpecificCategorySection';

jest.mock('react-router-dom', () => ({ useNavigate: () => jest.fn() }), { virtual: true });
jest.mock('../../hooks/useConfiguracionGeneral', () => ({ useConfiguracionGeneral: () => ({ config: {} }) }));
jest.mock('../shared/FavoriteButton', () => () => null);
jest.mock('../carrito/AddToCartModal', () => () => null);

const product = (documentId, nombre) => ({ id: documentId.length, documentId, nombre, marca: 'QA', precio: 1000, publicado: true });
const respond = body => Promise.resolve({ json: () => Promise.resolve(body) });
const productNames = () => screen.getAllByRole('heading', { level: 3 }).map(heading => heading.textContent);

const originalFetch = global.fetch;
beforeEach(() => { global.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} }; });
afterEach(() => { global.fetch = originalFetch; });

function mockStrapi(config, products) {
  global.fetch = jest.fn(url => (url.includes('/api/seccion-principal')
    ? respond({ data: { destacada_perfumeria: config } })
    : respond({ data: products })));
}

test('con previewData muestra título y productos del editor sin consultar Strapi', async () => {
  global.fetch = jest.fn();
  render(<FeaturedCategorySection seccion="perfumeria" previewData={{ titulo: 'Título en borrador', productos: [product('b', 'Segundo'), product('a', 'Primero')] }} />);
  expect(screen.getByRole('heading', { name: 'Título en borrador' })).toHaveAttribute('data-editor-part', 'titulo');
  expect(productNames()).toEqual(['Segundo', 'Primero']);
  await waitFor(() => expect(global.fetch).not.toHaveBeenCalled());
});

test('con productos elegidos los pide por documentId y respeta el orden guardado', async () => {
  mockStrapi({ titulo: 'Cuidado de la piel', categoria: { documentId: 'cat1' }, productos_orden: ['p3', 'p1'] }, [product('p1', 'Uno'), product('p3', 'Tres')]);
  render(<FeaturedCategorySection seccion="perfumeria" />);
  await screen.findByRole('heading', { name: 'Cuidado de la piel' });
  expect(productNames()).toEqual(['Tres', 'Uno']);
  const productsUrl = global.fetch.mock.calls[1][0];
  expect(productsUrl).toContain('filters[categoria][documentId][$eq]=cat1');
  expect(productsUrl).toContain('filters[documentId][$in][0]=p3');
  expect(productsUrl).toContain('filters[documentId][$in][1]=p1');
});

test('sin selección guardada mantiene el comportamiento original (productos de la categoría)', async () => {
  mockStrapi({ titulo: 'Fragancias', categoria: { documentId: 'cat2' }, productos_orden: null }, [product('x', 'Equis'), product('y', 'Ye')]);
  render(<FeaturedCategorySection seccion="perfumeria" />);
  await screen.findByRole('heading', { name: 'Fragancias' });
  expect(productNames()).toEqual(['Equis', 'Ye']);
  const productsUrl = global.fetch.mock.calls[1][0];
  expect(productsUrl).not.toContain('$in');
  expect(productsUrl).not.toContain('pageSize');
});

test('renderiza el ícono opcional al final del título en ambas secciones y lo omite cuando está vacío', async () => {
  global.fetch = jest.fn();
  const { unmount } = render(
    <FeaturedCategorySection
      seccion="perfumeria"
      previewData={{ titulo: 'Favoritos de hoy', icono: 'estrella', productos: [product('a', 'Uno')] }}
    />
  );
  const heading1 = screen.getByRole('heading', { name: 'Favoritos de hoy' });
  expect(heading1.querySelector('[data-title-icon="estrella"]')).toBeInTheDocument();
  unmount();

  render(
    <SpecificCategorySection
      seccion="hogar"
      previewData={{ titulo: 'Regalos para el hogar', icono: 'regalo', productos: [product('b', 'Dos')] }}
    />
  );
  const heading2 = screen.getByRole('heading', { name: 'Regalos para el hogar' });
  expect(heading2.querySelector('[data-title-icon="regalo"]')).toBeInTheDocument();
});

test('Categoría Destacada (2) respeta productos_orden e icono_titulo publicados desde Strapi', async () => {
  global.fetch = jest.fn(url => (url.includes('/api/seccion-principal')
    ? respond({ data: { categoria_especifica_perfumeria: { titulo: 'Selección exclusiva', icono_titulo: 'destellos', categoria: { documentId: 'cat2' }, productos_orden: ['p2', 'p1'] } } })
    : respond({ data: [product('p1', 'Primero'), product('p2', 'Segundo')] })));
  render(<SpecificCategorySection seccion="perfumeria" />);
  const heading = await screen.findByRole('heading', { name: 'Selección exclusiva' });
  expect(heading.querySelector('[data-title-icon="destellos"]')).toBeInTheDocument();
  expect(productNames()).toEqual(['Segundo', 'Primero']);
});
