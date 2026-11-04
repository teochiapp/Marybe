import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import Catalogo from './Catalogo';

const mockSearchParams = new URLSearchParams('seccion=Hogar&categoria=Cuidado%20Personal&descuento=todas');
jest.mock('react-router-dom', () => ({ useSearchParams: () => [mockSearchParams, jest.fn()] }), { virtual: true });
jest.mock('../../components/tienda/catalogo/CatalogoSidebar', () => props => <div data-testid="brands">{props.availableBrands.join(',')}</div>);
jest.mock('../../components/tienda/catalogo/CatalogoBreadcrumb', () => () => null);
jest.mock('../../components/tienda/catalogo/CatalogoBanner', () => () => null);
jest.mock('../../components/tienda/catalogo/CatalogoControlsBar', () => () => null);
jest.mock('../../components/tienda/catalogo/CatalogoProductGrid', () => () => null);
jest.mock('../../components/animations/ScrollAnimations', () => ({ FadeIn: ({ children }) => <>{children}</>, FadeInLeft: ({ children }) => <>{children}</> }));

test('las marcas del filtro incluyen productos posteriores a la página 100 y respetan sección y ofertas', async () => {
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
