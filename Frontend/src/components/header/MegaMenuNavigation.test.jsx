import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MegaMenuProvider, orderMenuItems } from '../../context/MegaMenuContext';
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

test('el orden visual usa identificadores y conserva las opciones nuevas', () => {
  const items = [
    { documentId: 'hogar1', nombre: 'Limpieza' },
    { documentId: 'hogar2', nombre: 'Cuidado Personal' },
  ];
  expect(orderMenuItems(items, ['categoria:hogar2', 'ofertas', 'categoria:eliminada', 'ofertas', 'lanzamientos']))
    .toEqual(['Cuidado Personal', 'Ofertas', 'Lanzamientos', 'Limpieza']);
  expect(orderMenuItems(items, null)).toEqual(['Ofertas', 'Lanzamientos', 'Limpieza', 'Cuidado Personal']);
});

test('una tienda abierta actualiza el orden publicado al volver a la pestaña', async () => {
  let order = ['ofertas', 'lanzamientos', 'categoria:home'];
  global.fetch = jest.fn(async url => {
    if (url.includes('/api/categorias?')) return { ok: true, json: async () => ({ data: [], meta: { pagination: { pageCount: 1 } } }) };
    if (url.includes('/api/ordenamiento-menu-header')) return { ok: true, json: async () => ({ data: {
      categoriasHogar: [{ documentId: 'home', nombre: 'Limpieza', seccion: 'Hogar' }],
      ordenVisual: { hogar: order },
    } }) };
    return { ok: true, json: async () => ({ data: {} }) };
  });
  render(<MegaMenuProvider><CategoryNav /></MegaMenuProvider>);
  await screen.findByRole('button', { name: 'Limpieza' });
  expect(screen.getAllByRole('button').filter(button => ['Ofertas', 'Lanzamientos', 'Limpieza'].includes(button.textContent)).map(button => button.textContent)).toEqual(['Ofertas', 'Lanzamientos', 'Limpieza']);
  order = ['categoria:home', 'ofertas', 'lanzamientos'];
  fireEvent.focus(window);
  await waitFor(() => expect(screen.getAllByRole('button').filter(button => ['Ofertas', 'Lanzamientos', 'Limpieza'].includes(button.textContent)).map(button => button.textContent)).toEqual(['Limpieza', 'Ofertas', 'Lanzamientos']));
  expect(global.fetch.mock.calls.find(([url]) => url.includes('/api/ordenamiento-menu-header'))[1].cache).toBe('no-store');
});

test('la vista previa usa contenido local sin alterar el menú público', async () => {
  const preview = { context: 'HOGAR', categories: ['Lanzamientos', 'Ofertas'], menu: {
    ofertas: { mostrar_columna_descuentos: true, titulo_descuentos: 'Promociones de prueba', columnas_categorias: [], productos_destacados: [] },
    lanzamientos: { categorias: [], productos_destacados: [] },
  } };
  render(<MegaMenuProvider><CategoryNav preview={preview} /></MegaMenuProvider>);
  await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(3));
  fireEvent.click(screen.getByRole('button', { name: 'Ofertas' }));
  expect(screen.getByText('Promociones de prueba')).toBeInTheDocument();
  expect(screen.getByText('Hasta 60%')).toBeInTheDocument();
  expect(mockNavigate).not.toHaveBeenCalled();
});

test('la vista previa móvil muestra las categorías de lanzamientos editadas', async () => {
  const preview = { context: 'HOGAR', categories: ['Lanzamientos', 'Ofertas'], menu: {
    ofertas: null,
    lanzamientos: { titulo_categorias: 'Recién llegados', categorias: [{ nombre: 'Limpieza', seccion: 'Hogar' }], productos_destacados: [] },
  } };
  render(<CartContext.Provider value={{ itemCount: 0 }}><AuthContext.Provider value={{ isAuthenticated: false }}><MegaMenuProvider><NavBar preview={preview} /></MegaMenuProvider></AuthContext.Provider></CartContext.Provider>);
  await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(3));
  fireEvent.click(screen.getByLabelText('Menú'));
  fireEvent.click(screen.getAllByText('Lanzamientos')[0]);
  expect(screen.getByText('Recién llegados')).toBeInTheDocument();
  expect(screen.getByText('Limpieza')).toBeInTheDocument();
});

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
  fireEvent.click(screen.getByRole('button', { name: 'Cuidado Personal' }));
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

test('una categoría agregada de Hogar en Perfumería conserva su sección y enlaces', async () => {
  mockSearch = 'seccion=Perfumer%C3%ADa';
  global.fetch = jest.fn(async url => {
    if (url.includes('/api/categorias?')) return { ok: true, json: async () => ({ data: [
      { documentId: 'hogar', nombre: 'Limpieza', seccion: 'Hogar', subcategorias: [{ nombre: 'Baño', tipos: [{ nombre: 'Jabón' }] }] },
      { documentId: 'perfume', nombre: 'Limpieza', seccion: 'Perfumería', subcategorias: [{ nombre: 'Rostro', tipos: [] }] },
    ], meta: { pagination: { pageCount: 1 } } }) };
    if (url.includes('/api/ordenamiento-menu-header')) return { ok: true, json: async () => ({ data: {
      categoriasPerfumeria: [{ documentId: 'hogar', nombre: 'Limpieza', seccion: 'Hogar' }],
      ordenVisual: { perfumeria: ['ofertas', 'lanzamientos', 'categoria:hogar'], categoriasAgregadas: { perfumeria: ['hogar'] } },
    } }) };
    return { ok: true, json: async () => ({ data: {} }) };
  });
  render(<MegaMenuProvider><CategoryNav /></MegaMenuProvider>);
  fireEvent.click(await screen.findByRole('button', { name: 'Limpieza' }));
  expect(await screen.findByText('Baño')).toBeInTheDocument();
  expect(screen.queryByText('Rostro')).not.toBeInTheDocument();
  fireEvent.click(screen.getByTitle('Ver todo en Limpieza'));
  expect(new URL(mockNavigate.mock.calls[0][0], 'http://localhost').searchParams.get('seccion')).toBe('Hogar');
});

test('el menú general distingue categorías homónimas y sus enlaces en escritorio y móvil', async () => {
  mockPath = '/contacto';
  mockSearch = '';
  global.fetch = jest.fn(async url => {
    if (url.includes('/api/categorias?')) return { ok: true, json: async () => ({ data: [
      { documentId: 'home', nombre: 'Cuidado Personal', seccion: 'Hogar', subcategorias: [{ nombre: 'Baño', tipos: [{ nombre: 'Jabón' }] }] },
      { documentId: 'beauty', nombre: 'Cuidado Personal', seccion: 'Perfumería', subcategorias: [{ nombre: 'Rostro', tipos: [{ nombre: 'Crema' }] }] },
    ], meta: { pagination: { pageCount: 1 } } }) };
    if (url.includes('/api/ordenamiento-menu-header')) return { ok: true, json: async () => ({ data: {
      categoriasGeneral: [{ documentId: 'home', nombre: 'Cuidado Personal', seccion: 'Hogar' }, { documentId: 'beauty', nombre: 'Cuidado Personal', seccion: 'Perfumería' }],
    } }) };
    return { ok: true, json: async () => ({ data: {} }) };
  });
  const desktop = render(<MegaMenuProvider><CategoryNav /></MegaMenuProvider>);
  const hogar = await screen.findByRole('button', { name: 'Cuidado Personal · Hogar' });
  expect(hogar).toHaveTextContent(/^Cuidado Personal$/);
  fireEvent.click(hogar);
  expect(screen.getByText('Baño')).toBeInTheDocument();
  expect(screen.queryByText('Rostro')).not.toBeInTheDocument();
  fireEvent.click(screen.getByText('Jabón'));
  expect(new URL(mockNavigate.mock.calls[0][0], 'http://localhost').searchParams.get('seccion')).toBe('Hogar');
  const perfumeria = screen.getByRole('button', { name: 'Cuidado Personal · Perfumería' });
  expect(perfumeria).toHaveTextContent(/^Cuidado Personal$/);
  fireEvent.click(perfumeria);
  fireEvent.click(screen.getByText('Crema'));
  expect(new URL(mockNavigate.mock.calls[1][0], 'http://localhost').searchParams.get('seccion')).toBe('Perfumería');
  desktop.unmount();
  render(<CartContext.Provider value={{ itemCount: 0 }}><AuthContext.Provider value={{ isAuthenticated: false }}><MegaMenuProvider><NavBar /></MegaMenuProvider></AuthContext.Provider></CartContext.Provider>);
  fireEvent.click(screen.getByLabelText('Menú'));
  const mobilePerfumeria = await screen.findByLabelText('Cuidado Personal · Perfumería');
  expect(mobilePerfumeria).toHaveTextContent(/^Cuidado Personal$/);
  fireEvent.click(mobilePerfumeria);
  fireEvent.click(screen.getByText('Rostro'));
  fireEvent.click(screen.getByText('Crema'));
  expect(new URL(mockNavigate.mock.calls[2][0], 'http://localhost').searchParams.get('seccion')).toBe('Perfumería');
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
