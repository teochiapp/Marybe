import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { MegaMenuProvider } from '../../context/MegaMenuContext';
import CategoryNav from './CategoryNav';
import NavBar from './NavBar';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { fetchCategoryTree, menuCategoryUrl, discountUrl } from '../../data/megamenu';

const mockNavigate = jest.fn();
let mockPath = '/tienda';
let mockSearch = 'seccion=Hogar';
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: mockPath, search: `?${mockSearch}` }),
  useSearchParams: () => [new URLSearchParams(mockSearch)],
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
}), { virtual: true });

beforeEach(() => {
  mockNavigate.mockClear();
  mockPath = '/tienda';
  mockSearch = 'seccion=Hogar';
  global.fetch = jest.fn(async url => {
    if (url.includes('/api/categorias?')) return { ok: true, json: async () => ({ data: [
      { nombre: 'Cuidado Personal', seccion: 'Hogar', subcategorias: [{ nombre: 'Baño', tipos: [{ nombre: 'Jabón' }] }] },
      { nombre: 'Cuidado Personal', seccion: 'Hogar', subcategorias: [{ nombre: 'Baño', tipos: [{ nombre: 'Espuma' }] }] },
      { nombre: 'Cuidado Personal', seccion: 'Perfumería', subcategorias: [{ nombre: 'Rostro', tipos: [{ nombre: 'Crema' }] }, { nombre: 'Baño', tipos: [{ nombre: 'Gel' }] }] },
    ], meta: { pagination: { pageCount: 1 } } }) };
    if (url.includes('/api/ordenamiento-menu-header')) return { ok: true, json: async () => ({ data: {
      categoriasHogar: [{ nombre: 'Cuidado Personal', seccion: 'Hogar' }, { nombre: 'Cuidado Personal', seccion: 'Hogar' }],
      categoriasPerfumeria: [{ nombre: 'Cuidado Personal', seccion: 'Perfumería' }, { nombre: 'Cuidado Personal', seccion: 'Perfumería' }],
      categoriasGeneral: [{ nombre: 'Cuidado Personal', seccion: 'Hogar' }],
    } }) };
    return { ok: true, json: async () => ({ data: {} }) };
  });
});
afterEach(() => { delete global.fetch; });

test('el megamenú de Hogar navega a la categoría, subcategoría y tipo de esa sección', async () => {
  render(<MegaMenuProvider><CategoryNav /></MegaMenuProvider>);
  fireEvent.click(await screen.findByRole('button', { name: 'Cuidado Personal' }));
  expect(await screen.findByText('Baño')).toBeInTheDocument();
  expect(screen.getByText('Espuma')).toBeInTheDocument();
  expect(screen.queryByText('Rostro')).not.toBeInTheDocument();
  fireEvent.click(screen.getByText('Jabón'));
  const url = new URL(mockNavigate.mock.calls[0][0], 'http://localhost');
  expect(Object.fromEntries(url.searchParams)).toEqual({ categoria: 'Cuidado Personal', subcategoria: 'Baño', seccion: 'Hogar', tipo: 'Jabón' });
});

test('el título de la categoría y la subcategoría conservan la sección Hogar', async () => {
  render(<MegaMenuProvider><CategoryNav /></MegaMenuProvider>);
  const open = await screen.findByRole('button', { name: 'Cuidado Personal' });
  fireEvent.click(open);
  fireEvent.click(await screen.findByTitle('Ver todo en Cuidado Personal'));
  let url = new URL(mockNavigate.mock.calls[0][0], 'http://localhost');
  expect(Object.fromEntries(url.searchParams)).toEqual({ categoria: 'Cuidado Personal', seccion: 'Hogar' });
  fireEvent.click(open);
  fireEvent.click(await screen.findByText('Baño'));
  url = new URL(mockNavigate.mock.calls[1][0], 'http://localhost');
  expect(Object.fromEntries(url.searchParams)).toEqual({ categoria: 'Cuidado Personal', subcategoria: 'Baño', seccion: 'Hogar' });
});

test('el menú móvil permite ver todos los productos de la categoría elegida', async () => {
  render(<CartContext.Provider value={{ itemCount: 0 }}><AuthContext.Provider value={{ isAuthenticated: false }}><MegaMenuProvider><NavBar /></MegaMenuProvider></AuthContext.Provider></CartContext.Provider>);
  fireEvent.click(screen.getByLabelText('Menú'));
  fireEvent.click(await screen.findByText('Cuidado Personal'));
  fireEvent.click(screen.getByText('Ver todos en Cuidado Personal'));
  const url = new URL(mockNavigate.mock.calls[0][0], 'http://localhost');
  expect(Object.fromEntries(url.searchParams)).toEqual({ categoria: 'Cuidado Personal', seccion: 'Hogar' });
});

test('Perfumería usa sus subcategorías aunque el ordenamiento contenga nombres repetidos', async () => {
  mockSearch = 'seccion=Perfumer%C3%ADa';
  render(<MegaMenuProvider><CategoryNav /></MegaMenuProvider>);
  fireEvent.click(await screen.findByRole('button', { name: 'Cuidado Personal' }));
  expect(await screen.findByText('Rostro')).toBeInTheDocument();
  expect(screen.queryByText('Jabón')).not.toBeInTheDocument();
  fireEvent.click(screen.getByText('Gel'));
  expect(new URL(mockNavigate.mock.calls[0][0], 'http://localhost').searchParams.get('seccion')).toBe('Perfumería');
});

test('General toma exactamente la categoría seleccionada en Strapi sin aclarar sección ni mostrar ambas', async () => {
  mockPath = '/contacto';
  mockSearch = '';
  render(<MegaMenuProvider><CategoryNav /></MegaMenuProvider>);
  fireEvent.click(await screen.findByRole('button', { name: 'Cuidado Personal' }));
  expect(await screen.findByText('Baño')).toBeInTheDocument();
  expect(screen.queryByText(/Baño ·/)).not.toBeInTheDocument();
  expect(screen.queryByText(/Rostro/)).not.toBeInTheDocument();
  expect(screen.queryByText(/Gel/)).not.toBeInTheDocument();
  fireEvent.click(screen.getByText('Baño'));
  let url = new URL(mockNavigate.mock.calls[0][0], 'http://localhost');
  expect(Object.fromEntries(url.searchParams)).toEqual({ categoria: 'Cuidado Personal', subcategoria: 'Baño', seccion: 'Hogar' });
  fireEvent.click(screen.getByRole('button', { name: 'Cuidado Personal' }));
  fireEvent.click(screen.getByTitle('Ver todo en Cuidado Personal'));
  url = new URL(mockNavigate.mock.calls[1][0], 'http://localhost');
  expect(Object.fromEntries(url.searchParams)).toEqual({ categoria: 'Cuidado Personal', seccion: 'Hogar' });
});

test('el menú móvil general usa únicamente la categoría seleccionada en Strapi', async () => {
  mockPath = '/contacto';
  mockSearch = '';
  render(<CartContext.Provider value={{ itemCount: 0 }}><AuthContext.Provider value={{ isAuthenticated: false }}><MegaMenuProvider><NavBar /></MegaMenuProvider></AuthContext.Provider></CartContext.Provider>);
  fireEvent.click(screen.getByLabelText('Menú'));
  fireEvent.click(await screen.findByText('Cuidado Personal'));
  expect(screen.queryByText(/Baño ·/)).not.toBeInTheDocument();
  expect(screen.queryByText('Rostro')).not.toBeInTheDocument();
  fireEvent.click(await screen.findByText('Baño'));
  fireEvent.click(screen.getByText('Jabón'));
  let url = new URL(mockNavigate.mock.calls[0][0], 'http://localhost');
  expect(Object.fromEntries(url.searchParams)).toEqual({ categoria: 'Cuidado Personal', subcategoria: 'Baño', seccion: 'Hogar', tipo: 'Jabón' });
  fireEvent.click(screen.getByText('Ver todos en Cuidado Personal'));
  url = new URL(mockNavigate.mock.calls[1][0], 'http://localhost');
  expect(Object.fromEntries(url.searchParams)).toEqual({ categoria: 'Cuidado Personal', seccion: 'Hogar' });
});

test('las categorías del menú se leen en todas las páginas de Strapi', async () => {
  global.fetch = jest.fn(async url => ({ ok: true, json: async () => ({ data: [{ nombre: url.includes('page]=2') ? 'Segunda' : 'Primera' }], meta: { pagination: { pageCount: 2 } } }) }));
  expect((await fetchCategoryTree()).map(c => c.nombre)).toEqual(['Primera', 'Segunda']);
  expect(global.fetch).toHaveBeenCalledTimes(2);
});

test('ofertas y lanzamientos llevan filtros que el catálogo entiende y conservan la sección', () => {
  expect(menuCategoryUrl('Ofertas', 'HOGAR')).toBe('/tienda?descuento=todas&seccion=Hogar');
  expect(discountUrl(30, 'PERFUMERIA')).toBe('/tienda?descuento=30&seccion=Perfumer%C3%ADa');
  expect(menuCategoryUrl('Lanzamientos', 'HOGAR')).toBe('/tienda?orden=createdAt%3Adesc&seccion=Hogar');
});
