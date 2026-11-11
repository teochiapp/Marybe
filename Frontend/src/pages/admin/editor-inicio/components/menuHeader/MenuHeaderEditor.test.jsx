import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import axios from 'axios';
import MenuHeaderEditor from './MenuHeaderEditor';

jest.mock('axios');
jest.mock('../EditorPreviewFrame', () => ({ payload }) => <div data-testid="preview">{JSON.stringify(payload.previewData)}</div>);

const areas = {
  perfumeria: { published: { orden: ['ofertas', 'lanzamientos', 'categoria:c1'] }, draft: null },
  hogar: { published: { orden: ['ofertas', 'lanzamientos'] }, draft: null },
  general: { published: { orden: ['ofertas', 'lanzamientos'] }, draft: null },
  ofertas: { published: { mostrar_columna_descuentos: true, titulo_descuentos: 'Descuentos', columnas_categorias: [], titulo_destacados: '', productos_destacados: [] }, draft: null },
  lanzamientos: { published: { titulo_categorias: 'Novedades', categorias: [], titulo_destacados: '', productos_destacados: [] }, draft: null },
};
const overview = { version: 'v1', areas, categorias: [{ documentId: 'c1', nombre: 'Perfumes', seccion: 'Perfumería' }, { documentId: 'c2', nombre: 'Limpieza', seccion: 'Hogar' }, { documentId: 'c3', nombre: 'Perfumes', seccion: 'Hogar' }], products: [], menuCategories: { perfumeria: [{ documentId: 'c1', nombre: 'Perfumes', seccion: 'Perfumería' }], hogar: [], general: [] } };

beforeEach(() => {
  global.ResizeObserver = class { observe() {} disconnect() {} };
  axios.get.mockImplementation(url => Promise.resolve({ data: { data: url.endsWith('/productos') ? { items: [], total: 0 } : overview } }));
  axios.put.mockResolvedValue({ data: { data: overview } });
});

test('agrega categorías agrupadas por sección y las muestra en la vista previa', async () => {
  render(<MenuHeaderEditor token="token" onBack={() => {}} onLogout={() => {}} />);
  const option = await screen.findByRole('checkbox', { name: 'Limpieza' });
  expect(screen.getByText(/Hogar · 2/)).toBeInTheDocument();
  expect(screen.getByText(/Perfumería · 1/)).toBeInTheDocument();
  fireEvent.click(option);
  expect(screen.getByTestId('preview')).toHaveTextContent('Limpieza');
  fireEvent.click(screen.getByRole('button', { name: 'Guardar borrador' }));
  await waitFor(() => expect(axios.put).toHaveBeenCalledWith(expect.stringMatching(/menu-header-admin\/perfumeria$/), expect.objectContaining({ publish: false, data: expect.objectContaining({ orden: ['ofertas', 'lanzamientos', 'categoria:c1', 'categoria:c2'] }) }), expect.any(Object)));
});

test('permite seleccionar y quitar categorías homónimas de forma independiente', async () => {
  render(<MenuHeaderEditor token="token" onBack={() => {}} onLogout={() => {}} />);
  await screen.findByText('Agregar categorías existentes');
  const [original, homonym] = screen.getAllByRole('checkbox', { name: 'Perfumes' });
  expect(original).toBeChecked();
  expect(original).toBeEnabled();
  expect(homonym).not.toBeChecked();
  expect(homonym).toBeEnabled();
  fireEvent.click(homonym);
  expect(original).toBeChecked();
  expect(homonym).toBeChecked();
  fireEvent.click(original);
  expect(original).not.toBeChecked();
  expect(homonym).toBeChecked();
  expect(screen.getByTestId('preview')).toHaveTextContent('"seccionMapped":"HOGAR"');
  fireEvent.click(screen.getByRole('button', { name: 'Guardar borrador' }));
  await waitFor(() => expect(axios.put).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ data: { orden: ['ofertas', 'lanzamientos', 'categoria:c3'] }, publish: false }), expect.any(Object)));
});

test('las pestañas mantienen los cambios al alternar contenido', async () => {
  render(<MenuHeaderEditor token="token" onBack={() => {}} onLogout={() => {}} />);
  const areaTabs = await screen.findByRole('group', { name: 'Área de Inicio' });
  fireEvent.click(within(areaTabs).getByRole('button', { name: 'Ofertas' }));
  fireEvent.change(screen.getByLabelText('Título de descuentos'), { target: { value: 'Promociones' } });
  fireEvent.click(screen.getByRole('tab', { name: 'Categorías' }));
  fireEvent.click(screen.getByRole('button', { name: 'Agregar columna' }));
  fireEvent.click(screen.getByText(/Columna 1/));
  fireEvent.change(screen.getByLabelText('Título de columna'), { target: { value: 'Especiales' } });
  fireEvent.click(screen.getByRole('tab', { name: 'Descuentos' }));
  expect(screen.getByLabelText('Título de descuentos')).toHaveValue('Promociones');
  fireEvent.click(screen.getByRole('tab', { name: 'Categorías' }));
  expect(screen.getByText(/Especiales/, { selector: 'summary' })).toBeInTheDocument();
});
afterEach(() => { jest.clearAllMocks(); });

test('oculta opciones por contexto en la vista previa y en el borrador', async () => {
  render(<MenuHeaderEditor token="token" onBack={() => {}} onLogout={() => {}} />);
  const checkbox = await screen.findByRole('checkbox', { name: 'Mostrar Ofertas' });
  expect(checkbox).toBeChecked();
  fireEvent.click(checkbox);
  expect(JSON.parse(screen.getByTestId('preview').textContent).categories.map(item => item.nombre)).toEqual(['Lanzamientos', 'Perfumes']);
  fireEvent.click(screen.getByRole('button', { name: 'Guardar borrador' }));
  await waitFor(() => expect(axios.put).toHaveBeenCalledWith(expect.stringMatching(/menu-header-admin\/perfumeria$/), expect.objectContaining({ publish: false, data: expect.objectContaining({ ocultos: ['ofertas'] }) }), expect.any(Object)));
});

test('ordena opciones, conserva cambios locales y guarda Ofertas como borrador', async () => {
  render(<MenuHeaderEditor token="token" onBack={() => {}} onLogout={() => {}} />);
  await screen.findByLabelText('Mover Ofertas a la derecha');
  fireEvent.click(screen.getByLabelText('Mover Ofertas a la derecha'));
  expect(screen.getByTestId('preview')).toHaveTextContent('Lanzamientos');
  const tabs = screen.getByRole('group', { name: 'Área de Inicio' });
  fireEvent.click(within(tabs).getByRole('button', { name: 'Ofertas' }));
  fireEvent.change(screen.getByLabelText('Título de descuentos'), { target: { value: 'Promociones' } });
  expect(screen.getByTestId('preview')).toHaveTextContent('Promociones');
  fireEvent.click(screen.getByRole('button', { name: 'Guardar borrador' }));
  await waitFor(() => expect(axios.put).toHaveBeenCalledWith(expect.stringMatching(/menu-header-admin\/ofertas$/), expect.objectContaining({ version: 'v1', publish: false, data: expect.objectContaining({ titulo_descuentos: 'Promociones' }) }), expect.any(Object)));
  await waitFor(() => expect(within(tabs).getByRole('button', { name: /Perfumería/ })).toBeEnabled());
  fireEvent.click(within(tabs).getByRole('button', { name: /Perfumería/ }));
  expect(screen.getByRole('list', { name: 'Orden del menú' }).firstChild).toHaveAttribute('aria-label', '1. Lanzamientos');
});
