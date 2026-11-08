import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import axios from 'axios';
import CategoriasEditor from './CategoriasEditor';
import { changedCovers, moveItem, toPreviewData } from './categoriasModel';
import { orderCategories } from '../../../../../utils/categoriasInicio';

jest.mock('axios');
jest.mock('react-router-dom', () => ({ Link: ({ children }) => <span>{children}</span> }), { virtual: true });

const image = (id, name) => ({ id, url: `/uploads/${name}.webp`, name: `${name}.webp` });
const published = { orden: ['c1', 'c2', 'c3'], forma: 'redondeado', boton: 'pildora', estiloBoton: 'relleno', portadas: { c1: image(10, 'fragancias'), c2: null, c3: null } };
const overview = (perfumeria = { published, draft: null }) => ({
  version: 'v1',
  areas: {
    perfumeria: { categorias: [{ id: 1, documentId: 'c1', nombre: 'Fragancias' }, { id: 2, documentId: 'c2', nombre: 'Maquillaje' }, { id: 3, documentId: 'c3', nombre: 'Dermo' }], ...perfumeria },
    hogar: { categorias: [{ id: 4, documentId: 'h1', nombre: 'Limpieza' }], published: { orden: ['h1'], forma: 'redondeado', boton: 'pildora', estiloBoton: 'relleno', portadas: { h1: null } }, draft: null },
  },
});

beforeEach(() => {
  jest.clearAllMocks();
  global.ResizeObserver = class { observe() {} disconnect() {} };
  axios.get.mockImplementation(async url => (url.endsWith('/media') ? { data: { data: [image(20, 'nueva')] } } : { data: { data: overview() } }));
  axios.put.mockImplementation(async (url, body) => ({ data: { data: { ...overview(body.publish ? { published: body.data, draft: null } : { published, draft: body.data }), version: 'v2' } } }));
});

const renderEditor = () => render(<CategoriasEditor token="fixture-token" onBack={jest.fn()} onLogout={jest.fn()} />);
const stripNames = () => within(screen.getByRole('list', { name: 'Orden de las categorías (reordenable)' })).getAllByRole('listitem').map(item => item.getAttribute('aria-label'));

test('carga las categorías del área con sus partes agrupadas y la franja de orden', async () => {
  renderEditor();
  await screen.findByRole('list', { name: 'Orden de las categorías (reordenable)' });
  expect(axios.get).toHaveBeenCalledWith(expect.stringMatching(/\/api\/categorias-inicio-admin$/), { headers: { Authorization: 'Bearer fixture-token' } });
  expect(stripNames()).toEqual(['1. Fragancias', '2. Maquillaje', '3. Dermo']);
  const parts = screen.getByRole('navigation', { name: 'Partes de la sección Categorías' });
  expect(within(parts).getByText('Contenido')).toBeInTheDocument();
  expect(within(parts).getByText('Organización')).toBeInTheDocument();
  expect(within(parts).getByText('Diseño')).toBeInTheDocument();
  expect(screen.getByTitle('Vista previa de Categorías')).toHaveAttribute('src', '/editor-inicio-preview');
});

test('reordena con las flechas accesibles, deshace y guarda el orden como borrador', async () => {
  renderEditor();
  fireEvent.click(await screen.findByRole('button', { name: 'Mover Fragancias a la derecha' }));
  expect(stripNames()).toEqual(['1. Maquillaje', '2. Fragancias', '3. Dermo']);
  fireEvent.click(screen.getByRole('button', { name: 'Deshacer' }));
  expect(stripNames()).toEqual(['1. Fragancias', '2. Maquillaje', '3. Dermo']);
  fireEvent.click(screen.getByRole('button', { name: 'Bajar Fragancias' }));
  fireEvent.click(screen.getByRole('button', { name: 'Guardar borrador' }));
  await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
  const [url, body] = axios.put.mock.calls[0];
  expect(url).toMatch(/\/api\/categorias-inicio-admin\/perfumeria$/);
  expect(body).toEqual(expect.objectContaining({ version: 'v1', publish: false }));
  expect(body.data.orden).toEqual(['c2', 'c1', 'c3']);
  await screen.findByText('Borrador guardado. La tienda y las categorías de Strapi no cambian hasta que publiques.');
});

test('cambia la portada, la forma y los botones y publica informando las imágenes actualizadas', async () => {
  renderEditor();
  fireEvent.click(await screen.findByRole('button', { name: 'Editar Maquillaje' }));
  fireEvent.click(screen.getByRole('button', { name: 'Elegir imagen' }));
  fireEvent.click(await screen.findByRole('button', { name: /nueva\.webp/ }));
  expect(screen.getByText('Imagen nueva: se aplica en Strapi cuando publiques.')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Editar Forma de las tarjetas' }));
  fireEvent.click(within(screen.getByRole('radiogroup', { name: 'Forma de las tarjetas' })).getByRole('radio', { name: /Circular/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Editar Estilo de los botones' }));
  fireEvent.click(within(screen.getByRole('radiogroup', { name: 'Forma del botón' })).getByRole('radio', { name: /Cuadrado/ }));
  fireEvent.click(within(screen.getByRole('radiogroup', { name: 'Color del botón' })).getByRole('radio', { name: /Claro/ }));
  expect(within(screen.getByRole('radiogroup', { name: 'Color del botón' })).getByRole('radio', { name: /Claro/ })).toHaveAttribute('aria-checked', 'true');
  fireEvent.click(screen.getByRole('button', { name: 'Publicar cambios' }));
  await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
  const { data, publish } = axios.put.mock.calls[0][1];
  expect(publish).toBe(true);
  expect([data.forma, data.boton, data.estiloBoton]).toEqual(['circular', 'cuadrado', 'claro']);
  expect(data.portadas.c2.id).toBe(20);
  await screen.findByText(/Se actualizó 1 imagen de portada en Strapi/);
});

test('un error al publicar aclara que no se aplicó ningún cambio', async () => {
  axios.put.mockRejectedValueOnce({ response: { status: 409, data: { error: { message: 'Otro administrador modificó la Página de Inicio.' } } } });
  renderEditor();
  fireEvent.click(await screen.findByRole('button', { name: 'Mover Fragancias a la derecha' }));
  fireEvent.click(screen.getByRole('button', { name: 'Publicar cambios' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('No se publicó ningún cambio: Otro administrador modificó la Página de Inicio.');
});

test('Hogar tiene su propia lista y la selección de categoría vuelve al orden', async () => {
  renderEditor();
  fireEvent.click(await screen.findByRole('button', { name: 'Editar Dermo' }));
  fireEvent.click(screen.getByRole('button', { name: 'Hogar' }));
  expect(screen.getByRole('heading', { level: 2, name: 'Orden de las categorías' })).toBeInTheDocument();
  expect(screen.queryByRole('list', { name: 'Orden de las categorías (reordenable)' })).toBeNull();
  expect(within(screen.getByRole('list', { name: 'Orden de las categorías' })).getByText('Limpieza')).toBeInTheDocument();
});

test('helpers de orden, vista previa y portadas cambiadas', () => {
  expect(moveItem(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a']);
  const categories = [{ id: 1, documentId: 'c1', nombre: 'A' }, { id: 2, documentId: 'c2', nombre: 'B' }];
  const preview = toPreviewData({ ...published, orden: ['c2', 'c1'], portadas: { c1: null, c2: image(5, 'b') } }, categories);
  expect(preview.categorias.map(category => category.documentId)).toEqual(['c2', 'c1']);
  expect(preview.categorias[0].portada.id).toBe(5);
  expect(changedCovers({ ...published, portadas: { ...published.portadas, c3: image(9, 'x') } }, published)).toEqual(['c3']);
  expect(orderCategories([{ documentId: 'a' }, { documentId: 'b' }, { documentId: 'c' }], ['c', 'a']).map(c => c.documentId)).toEqual(['c', 'a', 'b']);
  expect(orderCategories([{ documentId: 'a' }], null).map(c => c.documentId)).toEqual(['a']);
});
