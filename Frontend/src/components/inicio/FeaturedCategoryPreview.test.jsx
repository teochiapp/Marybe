import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor, within } from '@testing-library/react';
import FeaturedCategorySection from './perfumeria/FeaturedCategorySection';
import SpecificCategorySection from './perfumeria/SpecificCategorySection';

jest.mock('react-router-dom', () => ({ useNavigate: () => jest.fn() }), { virtual: true });
jest.mock('../../hooks/useConfiguracionGeneral', () => ({ useConfiguracionGeneral: () => ({ config: {} }) }));
jest.mock('../shared/FavoriteButton', () => () => null);
jest.mock('../carrito/AddToCartModal', () => () => null);

const product = (documentId, nombre) => ({ id: documentId, documentId, nombre, marca: 'QA', precio: 1000, publicado: true });
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
  expect(within(heading1).getByTestId('title-icon-estrella')).toBeInTheDocument();
  unmount();

  render(
    <SpecificCategorySection
      seccion="hogar"
      previewData={{ titulo: 'Regalos para el hogar', icono: 'regalo', productos: [product('b', 'Dos')] }}
    />
  );
  const heading2 = screen.getByRole('heading', { name: 'Regalos para el hogar' });
  expect(within(heading2).getByTestId('title-icon-regalo')).toBeInTheDocument();
});

test('Categoría Destacada (2) respeta productos_orden e icono_titulo publicados desde Strapi', async () => {
  global.fetch = jest.fn(url => (url.includes('/api/seccion-principal')
    ? respond({ data: { categoria_especifica_perfumeria: { titulo: 'Selección exclusiva', icono_titulo: 'destellos', categoria: { documentId: 'cat2' }, productos_orden: ['p2', 'p1'] } } })
    : respond({ data: [product('p1', 'Primero'), product('p2', 'Segundo')] })));
  render(<SpecificCategorySection seccion="perfumeria" />);
  const heading = await screen.findByRole('heading', { name: 'Selección exclusiva' });
  expect(within(heading).getByTestId('title-icon-destellos')).toBeInTheDocument();
  expect(productNames()).toEqual(['Segundo', 'Primero']);
});

test('aplica alineación, tamaño, fondo, espaciado y herencia por dispositivo de densidad y encuadre en Categoría Destacada 1 y 2', () => {
  global.fetch = jest.fn();
  const { unmount } = render(
    <FeaturedCategorySection
      seccion="perfumeria"
      previewData={{
        titulo: 'Destacada con diseño',
        tamano: 'muy-grande',
        alineacion: 'centro',
        fondo: 'arena',
        espaciado: 'amplio',
        densidad: 'compacta',
        densidad_mobile: 'amplia',
        encuadre: 'cubrir',
        encuadre_tablet: 'original',
        productos: [product('a', 'Uno')],
      }}
    />
  );

  const section1 = screen.getByTestId('categoria-destacada-seccion');
  const heading1 = screen.getByRole('heading', { name: 'Destacada con diseño' });
  const grid1 = screen.getByTestId('categoria-destacada-productos');

  expect(section1).toHaveAttribute('data-fondo', 'arena');
  expect(section1).toHaveAttribute('data-espaciado', 'amplio');
  expect(heading1).toHaveAttribute('data-tamano', 'muy-grande');
  expect(heading1).toHaveAttribute('data-alineacion', 'centro');
  expect(grid1).toHaveAttribute('data-densidad-desktop', 'compacta');
  expect(grid1).toHaveAttribute('data-densidad-tablet', 'compacta');
  expect(grid1).toHaveAttribute('data-densidad-mobile', 'amplia');
  expect(grid1).toHaveAttribute('data-encuadre-desktop', 'cubrir');
  expect(grid1).toHaveAttribute('data-encuadre-tablet', 'original');
  expect(grid1).toHaveAttribute('data-encuadre-mobile', 'cubrir');
  unmount();

  render(
    <SpecificCategorySection
      seccion="hogar"
      previewData={{
        titulo: 'Destacada 2 con diseño',
        tamano: 'chico',
        alineacion: 'derecha',
        fondo: 'rosado',
        espaciado: 'compacto',
        densidad: 'amplia',
        densidad_desktop: 'compacta',
        encuadre: 'original',
        encuadre_mobile: 'cubrir',
        productos: [product('b', 'Dos')],
      }}
    />
  );

  const section2 = screen.getByTestId('categoria-destacada-seccion');
  const titleWrap2 = screen.getByTestId('categoria-destacada-titulo-wrap');
  const heading2 = screen.getByRole('heading', { name: 'Destacada 2 con diseño' });
  const grid2 = screen.getByTestId('categoria-destacada-productos');

  expect(section2).toHaveAttribute('data-fondo', 'rosado');
  expect(section2).toHaveAttribute('data-espaciado', 'compacto');
  expect(titleWrap2).toHaveAttribute('data-alineacion', 'derecha');
  expect(heading2).toHaveAttribute('data-tamano', 'chico');
  expect(grid2).toHaveAttribute('data-densidad-desktop', 'compacta');
  expect(grid2).toHaveAttribute('data-densidad-tablet', 'amplia');
  expect(grid2).toHaveAttribute('data-densidad-mobile', 'amplia');
  expect(grid2).toHaveAttribute('data-encuadre-desktop', 'original');
  expect(grid2).toHaveAttribute('data-encuadre-tablet', 'original');
  expect(grid2).toHaveAttribute('data-encuadre-mobile', 'cubrir');
});
