import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import axios from 'axios';
import OfertasEditor from './OfertasEditor';
import { publishProblems } from './ofertasModel';

jest.mock('axios');
jest.mock('react-router-dom', () => ({ Link: ({ children }) => <span>{children}</span> }), { virtual: true });

const ORIGINAL = { titulo: 'Disfrutá de las mejores ofertas', fuente: 'secundaria', tamano: 'grande', peso: 'semibold', alineacion: 'izquierda', color: 'original', fondo: 'blanco', espaciado: 'original' };
const overview = (perfumeria = { published: ORIGINAL, draft: null }) => ({ version: 'v1', defaultTitle: ORIGINAL.titulo, areas: { perfumeria, hogar: { published: { ...ORIGINAL, titulo: 'Ofertas para tu casa' }, draft: null } } });

beforeEach(() => {
  jest.clearAllMocks();
  global.ResizeObserver = class { observe() {} disconnect() {} };
  axios.get.mockResolvedValue({ data: { data: overview() } });
  axios.put.mockImplementation(async (url, body) => ({ data: { data: { ...overview(body.publish ? { published: body.data, draft: null } : { published: ORIGINAL, draft: body.data }), version: 'v2' } } }));
});

const renderEditor = () => render(<OfertasEditor token="fixture-token" onBack={jest.fn()} onLogout={jest.fn()} />);
const radio = (group, name) => within(screen.getByRole('radiogroup', { name: group })).getByRole('radio', { name: new RegExp(name) });

test('precarga el título actual con las partes agrupadas y la vista previa real', async () => {
  renderEditor();
  expect(await screen.findByRole('textbox', { name: 'Título' })).toHaveValue('Disfrutá de las mejores ofertas');
  expect(axios.get).toHaveBeenCalledWith(expect.stringMatching(/\/api\/secciones-inicio-admin\/ofertas$/), { headers: { Authorization: 'Bearer fixture-token' } });
  const parts = screen.getByRole('navigation', { name: 'Partes de la sección Ofertas' });
  ['Contenido', 'Tipografía', 'Diseño'].forEach(group => expect(within(parts).getByText(group)).toBeInTheDocument());
  expect(screen.getByText(/insignias de descuento, sus porcentajes/)).toBeInTheDocument();
  expect(screen.getByTitle('Vista previa de Ofertas')).toHaveAttribute('src', '/editor-inicio-preview');
});

test('cambia título, tipografía, color, fondo y espaciado, deshace y guarda como borrador', async () => {
  renderEditor();
  fireEvent.change(await screen.findByRole('textbox', { name: 'Título' }), { target: { value: 'Ofertas de la semana' } });
  fireEvent.click(screen.getByRole('button', { name: 'Editar Tipografía del título' }));
  fireEvent.click(radio('Fuente del título', 'Brygada'));
  fireEvent.click(radio('Tamaño del título', 'Muy grande'));
  fireEvent.click(radio('Peso del título', '^Bold'));
  fireEvent.click(radio('Alineación del título', 'Centro'));
  expect(radio('Alineación del título', 'Centro')).toHaveAttribute('aria-checked', 'true');
  fireEvent.click(screen.getByRole('button', { name: 'Deshacer' }));
  expect(radio('Alineación del título', 'Izquierda')).toHaveAttribute('aria-checked', 'true');
  fireEvent.click(radio('Alineación del título', 'Derecha'));
  fireEvent.click(screen.getByRole('button', { name: 'Editar Color del título' }));
  fireEvent.click(radio('Color del título', 'Marrón oscuro'));
  fireEvent.click(screen.getByRole('button', { name: 'Editar Fondo y espaciado' }));
  fireEvent.click(radio('Fondo de la sección', 'Arena'));
  fireEvent.click(radio('Espaciado superior e inferior', 'Compacto'));
  fireEvent.click(screen.getByRole('button', { name: 'Guardar borrador' }));
  await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
  const [url, body] = axios.put.mock.calls[0];
  expect(url).toMatch(/\/api\/secciones-inicio-admin\/ofertas\/perfumeria$/);
  expect(body).toEqual({ version: 'v1', publish: false, data: { titulo: 'Ofertas de la semana', fuente: 'principal', tamano: 'muy-grande', peso: 'bold', alineacion: 'derecha', color: 'marron-cuarto', fondo: 'arena', espaciado: 'compacto' } });
});

test('restablecer la tipografía vuelve al diseño original', async () => {
  renderEditor();
  fireEvent.click(await screen.findByRole('button', { name: 'Editar Tipografía del título' }));
  fireEvent.click(radio('Peso del título', 'Normal'));
  fireEvent.click(screen.getByRole('button', { name: 'Restablecer la tipografía original' }));
  expect(radio('Peso del título', 'Semibold')).toHaveAttribute('aria-checked', 'true');
  expect(screen.queryByRole('button', { name: 'Restablecer la tipografía original' })).toBeNull();
});

test('no publica sin título y un error del servidor aclara que no se aplicó nada', async () => {
  renderEditor();
  fireEvent.change(await screen.findByRole('textbox', { name: 'Título' }), { target: { value: ' ' } });
  fireEvent.click(screen.getByRole('button', { name: 'Publicar cambios' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Antes de publicar: Escribí el título de la sección.');
  expect(axios.put).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Usar el título original' }));
  expect(screen.getByRole('textbox', { name: 'Título' })).toHaveValue('Disfrutá de las mejores ofertas');
  fireEvent.change(screen.getByRole('textbox', { name: 'Título' }), { target: { value: 'Nuevo título' } });
  axios.put.mockRejectedValueOnce({ response: { status: 409, data: { error: { message: 'Otro administrador modificó la Página de Inicio.' } } } });
  fireEvent.click(screen.getByRole('button', { name: 'Publicar cambios' }));
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('No se publicó ningún cambio: Otro administrador modificó la Página de Inicio.'));
});

test('Hogar tiene su propio título', async () => {
  renderEditor();
  await screen.findByRole('textbox', { name: 'Título' });
  fireEvent.click(screen.getByRole('button', { name: 'Hogar' }));
  expect(screen.getByRole('textbox', { name: 'Título' })).toHaveValue('Ofertas para tu casa');
  expect(publishProblems({ titulo: 'x' })).toEqual([]);
});
