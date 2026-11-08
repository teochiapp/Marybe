import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import axios from 'axios';
import DestacadaEditor from './DestacadaEditor';
import { publishProblems, toPreviewData } from './destacadaModel';

jest.mock('axios');
jest.mock('react-router-dom', () => ({ Link: ({ children }) => <span>{children}</span> }), { virtual: true });

const image = { id: 10, url: '/uploads/hero.webp', name: 'hero.webp' };
const published = { titulo_cursiva: 'Lo nuevo', titulo_normal: 'en Marybe', color_titulo_cursiva: '', color_titulo_normal: '', subtitulo: 'Sub', imagen_desktop: image, imagen_mobile: null, banners: [{ titulo: 'Elixir', imagen: image, texto_boton: 'Conocer más', link_boton: '/tienda' }], productos: ['p1'] };
const overview = (overrides = {}) => ({
  version: 'v1',
  exists: true,
  areas: {
    perfumeria: { published, draft: null, draftSavedAt: null },
    hogar: { published: { ...published, titulo_cursiva: 'Tu espacio,', banners: [], productos: [] }, draft: null, draftSavedAt: null },
  },
  products: { p1: { id: 1, documentId: 'p1', nombre: 'Perfume Uno', marca: 'QA', precio: 1000 } },
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
  global.ResizeObserver = class { observe() {} disconnect() {} };
  axios.get.mockImplementation(async url => (url.endsWith('/productos')
    ? { data: { data: [{ id: 2, documentId: 'p2', nombre: 'Perfume Dos', marca: 'QA', precio: 2000 }] } }
    : { data: { data: overview() } }));
  axios.put.mockImplementation(async (url, body) => ({ data: { data: overview({ version: 'v2', areas: { ...overview().areas, perfumeria: body.publish ? { published: body.data, draft: null } : { published, draft: body.data } } }) } }));
});

const renderEditor = props => render(<DestacadaEditor token="fixture-token" onBack={jest.fn()} onLogout={jest.fn()} {...props} />);

test('carga la sección con el token administrativo y muestra sus partes', async () => {
  renderEditor();
  expect(await screen.findByLabelText('Primera parte (cursiva)')).toHaveValue('Lo nuevo');
  expect(axios.get).toHaveBeenCalledWith(expect.stringMatching(/\/api\/destacada-admin$/), { headers: { Authorization: 'Bearer fixture-token' } });
  const parts = screen.getByRole('navigation', { name: 'Partes de la Sección Destacada' });
  expect(within(parts).getAllByRole('button').map(button => button.getAttribute('aria-label'))).toEqual(['Editar Título y subtítulo', 'Editar Imagen principal', 'Editar Productos destacados', 'Editar Banner inferior 1']);
  expect(screen.getByTitle('Vista previa de la Sección Destacada')).toHaveAttribute('src', '/editor-inicio-preview');
});

test('guardar borrador y publicar envían el área, la versión y los datos editados', async () => {
  renderEditor();
  fireEvent.change(await screen.findByLabelText('Primera parte (cursiva)'), { target: { value: 'Lo más nuevo' } });
  expect(screen.getByText('● Cambios sin guardar')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Guardar borrador' }));
  await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
  const [url, body] = axios.put.mock.calls[0];
  expect(url).toMatch(/\/api\/destacada-admin\/perfumeria$/);
  expect(body).toEqual(expect.objectContaining({ version: 'v1', publish: false }));
  expect(body.data.titulo_cursiva).toBe('Lo más nuevo');
  await screen.findByText('Borrador guardado. La tienda sigue mostrando la última publicación.');
  expect(screen.getByText('● Borrador sin publicar')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Publicar cambios' }));
  await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(2));
  expect(axios.put.mock.calls[1][1]).toEqual(expect.objectContaining({ version: 'v2', publish: true }));
});

test('no publica si falta el título y lleva al panel con el problema', async () => {
  renderEditor();
  fireEvent.click(await screen.findByRole('button', { name: 'Editar Imagen principal' }));
  fireEvent.click(screen.getByRole('button', { name: 'Editar Título y subtítulo' }));
  fireEvent.change(screen.getByLabelText('Segunda parte'), { target: { value: '' } });
  fireEvent.click(screen.getByRole('button', { name: 'Editar Productos destacados' }));
  fireEvent.click(screen.getByRole('button', { name: 'Publicar cambios' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Completá las dos partes del título.');
  expect(screen.getByRole('heading', { level: 2, name: 'Título y subtítulo' })).toBeInTheDocument();
  expect(axios.put).not.toHaveBeenCalled();
});

test('agrega productos desde la búsqueda y Hogar no ofrece banners inferiores', async () => {
  renderEditor();
  fireEvent.click(await screen.findByRole('button', { name: 'Editar Productos destacados' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Agregar Perfume Dos' }));
  expect(screen.getByText('2 de 25 productos')).toBeInTheDocument();
  expect(axios.get).toHaveBeenCalledWith(expect.stringMatching(/\/api\/destacada-admin\/productos$/), expect.objectContaining({ params: { area: 'perfumeria', q: '' } }));
  fireEvent.click(screen.getByRole('button', { name: 'Hogar' }));
  expect(screen.getByText('0 de 25 productos')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Editar Título y subtítulo' }));
  expect(screen.getByLabelText('Primera parte (cursiva)')).toHaveValue('Tu espacio,');
  expect(screen.queryByRole('button', { name: 'Editar Banner inferior 1' })).toBeNull();
  expect(screen.getByRole('button', { name: 'Perfumería •' })).toBeInTheDocument();
});

test('volver al selector pide confirmación con cambios sin guardar', async () => {
  const onBack = jest.fn();
  const confirm = jest.spyOn(window, 'confirm').mockReturnValue(false);
  renderEditor({ onBack });
  fireEvent.change(await screen.findByLabelText('Primera parte (cursiva)'), { target: { value: 'Otro' } });
  fireEvent.click(screen.getByRole('button', { name: '← Editor de Inicio' }));
  expect(onBack).not.toHaveBeenCalled();
  confirm.mockReturnValue(true);
  fireEvent.click(screen.getByRole('button', { name: '← Editor de Inicio' }));
  expect(onBack).toHaveBeenCalledTimes(1);
  confirm.mockRestore();
});

test('la vista previa usa el orden del catálogo y la validación replica la del backend', () => {
  const index = { a: { id: 9, documentId: 'a' }, b: { id: 3, documentId: 'b' } };
  expect(toPreviewData({ ...published, productos: ['a', 'b', 'gone'] }, index).productos.map(product => product.documentId)).toEqual(['b', 'a']);
  expect(publishProblems(published, 'perfumeria')).toEqual([]);
  expect(publishProblems({ ...published, imagen_desktop: null, banners: [{ titulo: '', imagen: null, texto_boton: '' }] }, 'perfumeria').map(problem => problem.part)).toEqual(['imagen', 'banner-0']);
  expect(publishProblems({ ...published, banners: [{ titulo: '' }] }, 'hogar')).toEqual([]);
  expect(publishProblems({ ...published, productos: Array.from({ length: 26 }, (_, i) => `p${i}`) }, 'perfumeria').map(problem => problem.part)).toEqual(['productos']);
});

test('agranda y achica las imágenes principal e inferior por dispositivo', async () => {
  renderEditor();
  fireEvent.click(await screen.findByRole('button', { name: 'Editar Imagen principal' }));
  fireEvent.click(screen.getByRole('button', { name: 'Agrandar: Tamaño en computadora y tablet' }));
  expect(screen.getByRole('spinbutton', { name: 'Tamaño en computadora y tablet' })).toHaveValue(110);
  fireEvent.change(screen.getByRole('spinbutton', { name: 'Tamaño en celular' }), { target: { value: '70' } });
  expect(screen.getByRole('button', { name: 'Celular' })).toHaveAttribute('aria-pressed', 'true');
  fireEvent.click(screen.getByRole('button', { name: 'Editar Banner inferior 1' }));
  fireEvent.click(screen.getByRole('button', { name: 'Achicar: Tamaño en computadora y tablet' }));
  fireEvent.change(screen.getByRole('spinbutton', { name: 'Tamaño en celular' }), { target: { value: '500' } });
  expect(screen.getByRole('spinbutton', { name: 'Tamaño en celular' })).toHaveValue(200);
  fireEvent.click(screen.getByRole('button', { name: 'Guardar borrador' }));
  await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
  const { data } = axios.put.mock.calls[0][1];
  expect([data.escala_imagen_desktop, data.escala_imagen_mobile]).toEqual([110, 70]);
  expect([data.banners[0].escala_imagen_desktop, data.banners[0].escala_imagen_mobile]).toEqual([90, 200]);
});
