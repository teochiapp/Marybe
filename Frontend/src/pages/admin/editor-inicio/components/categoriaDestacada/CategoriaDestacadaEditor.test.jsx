import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import axios from 'axios';
import CategoriaDestacadaEditor from './CategoriaDestacadaEditor';
import { moveItem, publishProblems, shownProducts, toPreviewData } from './categoriaDestacadaModel';

jest.mock('axios');
jest.mock('react-router-dom', () => ({ Link: ({ children }) => <span>{children}</span> }), { virtual: true });

const product = (documentId, nombre) => ({ id: documentId.length, documentId, nombre, marca: 'QA', precio: 1000 });
const catalog = { c1: [product('p1', 'Serum'), product('p2', 'Crema'), product('p3', 'Protector')], c2: [product('p9', 'Labial')], vacia: [] };
const published = { titulo: 'Cuidado de la piel', categoria: 'c1', productos: [] };
const overview = (perfumeria = { published, draft: null }) => ({
  version: 'v1',
  defaultTitle: 'Categoría destacada',
  maxProducts: 25,
  areas: { perfumeria, hogar: { published: { titulo: 'Hogar', categoria: null, productos: [] }, draft: null } },
  categorias: [
    { documentId: 'c1', nombre: 'Dermocosmética', seccion: 'Perfumería', productos: 3 },
    { documentId: 'c2', nombre: 'Maquillaje', seccion: 'Perfumería', productos: 1 },
    { documentId: 'vacia', nombre: 'Vacía', seccion: 'Hogar', productos: 0 },
  ],
  products: {},
});

beforeEach(() => {
  jest.clearAllMocks();
  global.ResizeObserver = class { observe() {} disconnect() {} };
  axios.get.mockImplementation(async (url, config) => {
    if (url.endsWith('/productos')) {
      const items = (catalog[config.params.categoria] || []).filter(item => item.nombre.toLowerCase().includes((config.params.q || '').toLowerCase()));
      return { data: { data: { items, total: items.length, page: 1, pageSize: 30 } } };
    }
    return { data: { data: overview() } };
  });
  axios.put.mockImplementation(async (url, body) => ({ data: { data: { ...overview(body.publish ? { published: body.data, draft: null } : { published, draft: body.data }), version: 'v2' } } }));
});

const renderEditor = () => render(<CategoriaDestacadaEditor token="fixture-token" onBack={jest.fn()} onLogout={jest.fn()} />);
const visibleNames = () => within(screen.getByRole('list', { name: 'Productos visibles' })).getAllByRole('listitem').map(item => item.textContent);

test('carga la categoría publicada y muestra el modo automático con los productos de la categoría', async () => {
  renderEditor();
  const select = await screen.findByRole('combobox', { name: 'Categoría de la tienda' });
  expect(select).toHaveValue('c1');
  expect(screen.getByRole('textbox', { name: 'Título' })).toHaveValue('Cuidado de la piel');
  expect(axios.get).toHaveBeenCalledWith(expect.stringMatching(/\/api\/categoria-destacada-admin$/), { headers: { Authorization: 'Bearer fixture-token' } });
  await waitFor(() => expect(axios.get).toHaveBeenCalledWith(expect.stringMatching(/\/productos$/), expect.objectContaining({ params: { categoria: 'c1', q: '', page: 1 } })));
  fireEvent.click(screen.getByRole('button', { name: /Productos de la sección/ }));
  expect(await screen.findByText('Automático · 3 visibles')).toBeInTheDocument();
  expect(screen.getByText(/en el orden del catálogo \(3 visibles\)/)).toBeInTheDocument();
  expect(screen.getByTitle('Vista previa de Categoría Destacada (1)')).toHaveAttribute('src', '/editor-inicio-preview');
});

test('elige, ordena y guarda los productos como borrador con deshacer', async () => {
  renderEditor();
  fireEvent.click(await screen.findByRole('button', { name: /Productos de la sección/ }));
  fireEvent.click(await screen.findByRole('button', { name: 'Elegir y ordenar estos productos' }));
  expect(screen.getByText('3 de 25 productos, en este orden')).toBeInTheDocument();
  expect(visibleNames().map(name => name.includes('Serum'))).toEqual([true, false, false]);
  fireEvent.click(screen.getByRole('button', { name: 'Bajar Serum' }));
  expect(visibleNames()[1]).toContain('Serum');
  fireEvent.click(screen.getByRole('button', { name: 'Deshacer' }));
  expect(visibleNames()[0]).toContain('Serum');
  fireEvent.click(screen.getByRole('button', { name: 'Mover Protector a la izquierda' }));
  fireEvent.click(screen.getByRole('button', { name: 'Guardar borrador' }));
  await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
  const [url, body] = axios.put.mock.calls[0];
  expect(url).toMatch(/\/api\/categoria-destacada-admin\/perfumeria$/);
  expect(body).toEqual(expect.objectContaining({ version: 'v1', publish: false }));
  expect(body.data).toEqual({ titulo: 'Cuidado de la piel', categoria: 'c1', productos: ['p1', 'p3', 'p2'] });
});

test('cambiar de categoría pide confirmación, limpia la selección y avisa si está vacía', async () => {
  const confirm = jest.spyOn(window, 'confirm').mockReturnValue(true);
  renderEditor();
  fireEvent.click(await screen.findByRole('button', { name: /Productos de la sección/ }));
  fireEvent.click(await screen.findByRole('button', { name: 'Elegir y ordenar estos productos' }));
  fireEvent.click(screen.getByRole('button', { name: /Categoría y título/ }));
  fireEvent.change(screen.getByRole('combobox', { name: 'Categoría de la tienda' }), { target: { value: 'vacia' } });
  expect(confirm).toHaveBeenCalledWith(expect.stringContaining('quita los 3 productos'));
  expect(screen.getByText('Esta categoría no tiene productos publicados: la sección no se muestra en la tienda.')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /Productos de la sección/ }));
  expect(await screen.findByText(/sin productos publicados/)).toBeInTheDocument();
  confirm.mockRestore();
});

test('no publica sin título y un error del servidor aclara que no se aplicó nada', async () => {
  renderEditor();
  fireEvent.change(await screen.findByRole('textbox', { name: 'Título' }), { target: { value: '  ' } });
  fireEvent.click(screen.getByRole('button', { name: 'Publicar cambios' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Antes de publicar: Escribí el título de la sección.');
  expect(axios.put).not.toHaveBeenCalled();
  axios.put.mockRejectedValueOnce({ response: { status: 409, data: { error: { message: 'Otro administrador modificó la Página de Inicio.' } } } });
  fireEvent.change(screen.getByRole('textbox', { name: 'Título' }), { target: { value: 'Nuevo título' } });
  fireEvent.click(screen.getByRole('button', { name: 'Publicar cambios' }));
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('No se publicó ningún cambio: Otro administrador modificó la Página de Inicio.'));
});

test('helpers de orden, productos visibles, vista previa y validación', () => {
  const index = { a: { documentId: 'a' }, b: { documentId: 'b' } };
  const automatic = Array.from({ length: 30 }, (_, i) => ({ documentId: `x${i}` }));
  expect(moveItem(['a', 'b', 'c'], 2, 0)).toEqual(['c', 'a', 'b']);
  expect(shownProducts({ productos: ['b', 'zz', 'a'] }, index, automatic).map(item => item.documentId)).toEqual(['b', 'a']);
  expect(shownProducts({ productos: [] }, index, automatic)).toHaveLength(25);
  expect(toPreviewData({ titulo: 'T', productos: ['a'] }, index, automatic)).toEqual({ titulo: 'T', productos: [index.a] });
  expect(publishProblems({ titulo: '', categoria: null, productos: [] }).map(problem => problem.part)).toEqual(['contenido', 'contenido']);
  expect(publishProblems({ titulo: 'T', categoria: 'c', productos: Array(26).fill('a') })[0].part).toBe('productos');
});
