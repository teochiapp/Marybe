import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import axios from 'axios';
import ExportacionProveedoresAdmin from './ExportacionProveedoresAdmin';

jest.mock('axios');
beforeEach(() => {
  localStorage.setItem('admin_jwt', 'token');
  jest.resetAllMocks();
  axios.get.mockResolvedValue({ data: { proveedores: ['A, SA', 'Otro'] } });
});
afterEach(() => localStorage.removeItem('admin_jwt'));

const vista = { proveedores: ['A, SA', 'Otro'], total: 3, comprobante: 'preview', productos: [
  { documentId: 'doc1', id_original: 'P1', nombre: 'Crema', sku: 'SKU1', skuVariantes: ['EAN-50'], proveedor: 'A, SA' },
  { documentId: 'doc2', id_original: 'P2', nombre: 'Jabón', sku: 'SKU2', proveedor: 'Otro' },
  { documentId: 'doc3', id_original: 'P3', nombre: 'Perfume', sku: 'SKU3', proveedor: 'A, SA' },
] };

test('selecciona productos de varios proveedores y busca SKU, variantes y nombre sin borrar los demás', async () => {
  axios.post.mockResolvedValueOnce({ data: vista });
  axios.post.mockResolvedValueOnce({ data: { ok: true, borrados: [{ id_original: 'P1', nombre: 'Crema' }, { id_original: 'P2', nombre: 'Jabón' }], errores: [] } });
  render(<ExportacionProveedoresAdmin modoEliminar />);
  const borrar = screen.getByRole('button', { name: 'Seleccionar productos para borrar' });
  expect(borrar).toBeDisabled();
  fireEvent.click(await screen.findByRole('checkbox', { name: 'A, SA' }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Otro' }));
  expect(borrar).toBeEnabled();
  fireEvent.click(borrar);
  const dialog = await screen.findByRole('dialog');
  expect(within(dialog).getByRole('button', { name: 'Revisar selección (0)' })).toBeDisabled();
  const buscar = within(dialog).getByRole('textbox', { name: 'Buscar por SKU o nombre' });
  fireEvent.change(buscar, { target: { value: 'EAN-50' } });
  fireEvent.click(within(dialog).getByRole('checkbox', { name: /Crema/ }));
  fireEvent.change(buscar, { target: { value: 'jabon' } });
  fireEvent.click(within(dialog).getByRole('checkbox', { name: /Jabón/ }));
  fireEvent.click(within(dialog).getByRole('button', { name: 'Revisar selección (2)' }));
  expect(within(dialog).queryByText(/Perfume/)).not.toBeInTheDocument();
  const confirm = within(dialog).getByRole('button', { name: 'Confirmar borrado' });
  expect(confirm).toBeDisabled();
  fireEvent.change(within(dialog).getByRole('textbox'), { target: { value: 'BORRAR' } });
  fireEvent.click(confirm);
  await waitFor(() => expect(screen.getByText(/Se eliminaron/)).toBeInTheDocument());
  expect(axios.post.mock.calls[0][1]).toEqual({ proveedores: ['A, SA', 'Otro'] });
  expect(axios.post.mock.calls[1][1]).toEqual({ proveedores: vista.proveedores, productos: ['doc1', 'doc2'], confirmacion: 'BORRAR', comprobante: 'preview' });
});

test('seleccionar visibles respeta la búsqueda y muestra errores parciales', async () => {
  axios.post.mockResolvedValueOnce({ data: vista });
  axios.post.mockResolvedValueOnce({ data: { ok: false, borrados: [], errores: [{ id_original: 'P2', nombre: 'Jabón', mensaje: 'No se pudo borrar' }] } });
  render(<ExportacionProveedoresAdmin modoEliminar />);
  fireEvent.click(await screen.findByRole('checkbox', { name: 'A, SA' }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Otro' }));
  fireEvent.click(screen.getByRole('button', { name: 'Seleccionar productos para borrar' }));
  const dialog = await screen.findByRole('dialog');
  fireEvent.change(within(dialog).getByRole('textbox'), { target: { value: 'SKU2' } });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Seleccionar visibles' }));
  fireEvent.click(within(dialog).getByRole('button', { name: 'Revisar selección (1)' }));
  fireEvent.change(within(dialog).getByRole('textbox'), { target: { value: 'BORRAR' } });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Confirmar borrado' }));
  expect(await screen.findByText(/Jabón: No se pudo borrar/)).toBeInTheDocument();
  expect(axios.post.mock.calls[1][1].productos).toEqual(['doc2']);
});

test('revisa producto y variante de otro producto y ejecuta ambas etapas', async () => {
  const variant = { id: 12, id_original: 'V12', sku_ean: 'EAN12', volumen: '50 ml', color_nombre: '', publicado: true };
  const producto = { documentId: 'doc2', id_original: 'P2', nombre: 'Jabón', sku: 'SKU2', proveedor: 'Otro', variantes: [variant] };
  const initial = { ...vista, productos: [vista.productos[0], producto] };
  axios.post.mockResolvedValueOnce({ data: initial });
  axios.post.mockResolvedValueOnce({ data: { borrados: [{ documentId: 'doc1', nombre: 'Crema' }], errores: [] } });
  axios.post.mockResolvedValueOnce({ data: { ...initial, comprobante: 'nuevo', productos: [producto] } });
  axios.post.mockResolvedValueOnce({ data: { ok: true } });
  render(<ExportacionProveedoresAdmin modoEliminar />);
  fireEvent.click(await screen.findByRole('checkbox', { name: 'A, SA' }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Otro' }));
  fireEvent.click(screen.getByRole('button', { name: 'Seleccionar productos para borrar' }));
  const dialog = await screen.findByRole('dialog');
  fireEvent.click(within(dialog).getByRole('checkbox', { name: /Crema/ }));
  fireEvent.click(within(dialog).getByText('Variantes'));
  fireEvent.click(within(dialog).getByRole('checkbox', { name: /EAN12/ }));
  fireEvent.click(within(dialog).getByRole('button', { name: 'Revisar selección (2)' }));
  expect(within(dialog).getByText(/variantes individuales de otros productos/)).toHaveTextContent('1 variantes individuales');
  fireEvent.change(within(dialog).getByRole('textbox'), { target: { value: 'BORRAR' } });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Confirmar borrado' }));
  await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(4));
  expect(axios.post.mock.calls[3][1]).toMatchObject({ producto: 'doc2', variante: 12, comprobante: 'nuevo' });
  expect(await screen.findByText('Borrado completado')).toBeInTheDocument();
});

test('filtra proveedores por búsqueda en exportación y borrado sin perder selecciones previas', async () => {
  axios.get.mockResolvedValue({ data: { proveedores: ['A, SA', "L'Oréal", 'Otro'] } });
  const { rerender } = render(<ExportacionProveedoresAdmin />);

  const buscar = await screen.findByRole('searchbox', { name: 'Buscar proveedor' });
  fireEvent.click(screen.getByRole('checkbox', { name: 'A, SA' }));
  fireEvent.change(buscar, { target: { value: 'loreal' } });

  expect(screen.queryByRole('checkbox', { name: 'A, SA' })).not.toBeInTheDocument();
  expect(screen.getByRole('checkbox', { name: "L'Oréal" })).toBeInTheDocument();
  expect(screen.queryByRole('checkbox', { name: 'Otro' })).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Todos' }));
  fireEvent.change(buscar, { target: { value: '' } });

  expect(screen.getByRole('checkbox', { name: 'A, SA' })).toBeChecked();
  expect(screen.getByRole('checkbox', { name: "L'Oréal" })).toBeChecked();
  expect(screen.getByRole('checkbox', { name: 'Otro' })).not.toBeChecked();

  rerender(<ExportacionProveedoresAdmin modoEliminar />);
  fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar proveedor' }), { target: { value: 'xyz' } });
  expect(screen.getByText('Ningún proveedor coincide con la búsqueda.')).toBeInTheDocument();
});
