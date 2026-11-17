import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import Catalogo from './Catalogo';

let mockSearchParams = new URLSearchParams('seccion=Hogar&categoria=Cuidado%20Personal&descuento=todas');
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useSearchParams: () => [mockSearchParams, jest.fn()],
  useNavigate: () => mockNavigate,
}), { virtual: true });
jest.mock('../../components/tienda/catalogo/CatalogoSidebar', () => props => <div data-testid="brands">{props.availableBrands.join(',')}</div>);
jest.mock('../../components/tienda/catalogo/CatalogoBreadcrumb', () => () => null);
jest.mock('../../components/tienda/catalogo/CatalogoBanner', () => ({ currentBanner }) => (
  <div
    data-testid="banner"
    data-title={currentBanner?.title || ''}
    data-image={currentBanner?.image || ''}
    data-cover={String(Boolean(currentBanner?.isCategoryCover))}
  />
));
jest.mock('../../components/tienda/catalogo/CatalogoControlsBar', () => () => null);
jest.mock('../../components/tienda/catalogo/CatalogoProductGrid', () => props => (
  <div data-testid="grid">{props.productos.map(p => (p.attributes || p).nombre).join(',')}</div>
));
jest.mock('../../components/animations/ScrollAnimations', () => ({ FadeIn: ({ children }) => <>{children}</>, FadeInLeft: ({ children }) => <>{children}</> }));

test('búsqueda por marca (ej. Givenchy) filtra nombre, marca, subcategoria y tipo en catálogo', async () => {
  mockSearchParams = new URLSearchParams('busqueda=Givenchy');
  window.scrollTo = jest.fn();
  global.fetch = jest.fn(async raw => {
    const url = new URL(raw);
    if (url.pathname.includes('/api/categorias')) return { ok: true, json: async () => ({ data: [] }) };
    const prod = { id: 1, nombre: "L'INTERDIT EDP", marca: 'GIVENCHY', precio: 150000 };
    return { ok: true, json: async () => ({ data: [prod], meta: { pagination: { pageCount: 1, total: 1 } } }) };
  });

  render(<Catalogo />);
  await waitFor(() => expect(screen.getByTestId('grid')).toHaveTextContent("L'INTERDIT EDP"));
  expect(screen.getByTestId('brands')).toHaveTextContent('GIVENCHY');

  const productCalls = global.fetch.mock.calls
    .map(([raw]) => new URL(raw))
    .filter(url => url.pathname.endsWith('/api/productos'));
  expect(productCalls.length).toBeGreaterThanOrEqual(2);

  for (const url of productCalls) {
    const p = url.searchParams;
    expect(p.has('filters[nombre][$containsi]')).toBe(false);
    expect(p.get('filters[$and][0][$or][0][nombre][$containsi]')).toBe('Givenchy');
    expect(p.get('filters[$and][0][$or][1][marca][$containsi]')).toBe('Givenchy');
    expect(p.get('filters[$and][0][$or][2][subcategoria][$containsi]')).toBe('Givenchy');
    expect(p.get('filters[$and][0][$or][3][tipo][$containsi]')).toBe('Givenchy');
  }
  delete global.fetch;
});

test('las marcas del filtro incluyen productos posteriores a la página 100 y respetan sección y ofertas', async () => {
  mockSearchParams = new URLSearchParams('seccion=Hogar&categoria=Cuidado%20Personal&descuento=todas');
  window.scrollTo = jest.fn();
  global.fetch = jest.fn(async raw => {
    const url = new URL(raw);
    if (url.pathname.includes('/api/categorias')) return { ok: true, json: async () => ({ data: [] }) };
    const params = url.searchParams;
    if (params.get('populate') === 'variantes') {
      const page = params.get('pagination[page]');
      return { ok: true, json: async () => ({ data: [{ marca: page === '2' ? 'Marca segunda página' : 'Marca primera página' }], meta: { pagination: { pageCount: 2 } } }) };
    }
    return { ok: true, json: async () => ({ data: [], meta: { pagination: { pageCount: 1, total: 0 } } }) };
  });
  render(<Catalogo />);
  await waitFor(() => expect(screen.getByTestId('brands')).toHaveTextContent('Marca segunda página'));
  const metadataUrls = global.fetch.mock.calls.map(([url]) => new URL(url)).filter(url => url.searchParams.get('populate') === 'variantes');
  expect(metadataUrls.map(url => url.searchParams.get('pagination[page]'))).toEqual(['1', '2']);
  for (const url of metadataUrls) {
    expect(url.searchParams.get('filters[descuento][$gt]')).toBe('0');
    expect(url.searchParams.get('filters[$and][0][$or][1][clasificaciones][seccion][$eq]')).toBe('Hogar');
  }
  delete global.fetch;
});

test('subcategorías y tipos heredan la imagen de portada de la categoría padre', async () => {
  window.scrollTo = jest.fn();
  const mockCoverFetch = () => jest.fn(async raw => {
    const url = new URL(raw);
    if (url.pathname.includes('/api/categorias')) {
      return {
        ok: true,
        json: async () => ({ data: [{ id: 1, nombre: 'Niños y Bebes', portada: { url: '/uploads/ninos.jpg' } }] }),
      };
    }
    return { ok: true, json: async () => ({ data: [], meta: { pagination: { pageCount: 1, total: 0 } } }) };
  });

  // Caso 1: URL con categoría + subcategoría + tipo (ej. navegación desde MegaMenú)
  mockSearchParams = new URLSearchParams('seccion=Hogar&categoria=Niños%20y%20Bebes&subcategoria=Higiene%20del%20Bebe&tipo=Toallas%20humedas');
  global.fetch = mockCoverFetch();
  const { unmount: unmountCase1 } = render(<Catalogo />);
  await waitFor(() => expect(screen.getByTestId('banner')).toHaveAttribute('data-cover', 'true'));
  expect(screen.getByTestId('banner')).toHaveAttribute('data-title', 'Toallas humedas');
  expect(screen.getByTestId('banner')).toHaveAttribute('data-image', expect.stringMatching(/\/uploads\/ninos\.jpg$/));
  const catCall1 = new URL(global.fetch.mock.calls.find(([u]) => u.includes('/api/categorias'))[0]);
  expect(catCall1.searchParams.get('filters[nombre][$eq]')).toBe('Niños y Bebes');
  unmountCase1();

  // Caso 2: URL con subcategoría sola (sin parámetro categoria)
  mockSearchParams = new URLSearchParams('seccion=Hogar&subcategoria=Higiene%20del%20Bebe');
  global.fetch = mockCoverFetch();
  const { unmount: unmountCase2 } = render(<Catalogo />);
  await waitFor(() => expect(screen.getByTestId('banner')).toHaveAttribute('data-cover', 'true'));
  expect(screen.getByTestId('banner')).toHaveAttribute('data-title', 'Higiene del Bebe');
  const catCall2 = new URL(global.fetch.mock.calls.find(([u]) => u.includes('/api/categorias'))[0]);
  expect(catCall2.searchParams.get('filters[subcategorias][nombre][$eq]')).toBe('Higiene del Bebe');
  unmountCase2();

  // Caso 3: URL con tipo solo (sin categoría ni subcategoría)
  mockSearchParams = new URLSearchParams('seccion=Hogar&tipo=Toallas%20humedas');
  global.fetch = mockCoverFetch();
  render(<Catalogo />);
  await waitFor(() => expect(screen.getByTestId('banner')).toHaveAttribute('data-cover', 'true'));
  expect(screen.getByTestId('banner')).toHaveAttribute('data-title', 'Toallas humedas');
  const catCall3 = new URL(global.fetch.mock.calls.find(([u]) => u.includes('/api/categorias'))[0]);
  expect(catCall3.searchParams.get('filters[subcategorias][tipos][nombre][$eq]')).toBe('Toallas humedas');

  delete global.fetch;
});
