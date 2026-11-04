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
  render(<ExportacionProveedoresAdmin />);
  const borrar = screen.getByRole('button', { name: 'Seleccionar productos para borrar' });
  expect(borrar).toBeDisabled();
  expect(borrar.compareDocumentPosition(screen.getByRole('button', { name: /Seleccioná al menos un proveedor/ })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
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
  const confirm = within(dialog).getByRole('button', { name: 'Borrar 2 productos' });
  expect(confirm).toBeDisabled();
  fireEvent.change(within(dialog).getByRole('textbox'), { target: { value: 'BORRAR' } });
  fireEvent.click(confirm);
  await waitFor(() => expect(screen.getByText('2 productos borrados · 0 errores')).toBeInTheDocument());
  expect(axios.post.mock.calls[0][1]).toEqual({ proveedores: ['A, SA', 'Otro'] });
  expect(axios.post.mock.calls[1][1]).toEqual({ proveedores: vista.proveedores, productos: ['doc1', 'doc2'], confirmacion: 'BORRAR', comprobante: 'preview' });
});

test('seleccionar visibles respeta la búsqueda y muestra errores parciales', async () => {
  axios.post.mockResolvedValueOnce({ data: vista });
  axios.post.mockResolvedValueOnce({ data: { ok: false, borrados: [], errores: [{ id_original: 'P2', nombre: 'Jabón', mensaje: 'No se pudo borrar' }] } });
  render(<ExportacionProveedoresAdmin />);
  fireEvent.click(await screen.findByRole('checkbox', { name: 'A, SA' }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Otro' }));
  fireEvent.click(screen.getByRole('button', { name: 'Seleccionar productos para borrar' }));
  const dialog = await screen.findByRole('dialog');
  fireEvent.change(within(dialog).getByRole('textbox'), { target: { value: 'SKU2' } });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Seleccionar visibles' }));
  fireEvent.click(within(dialog).getByRole('button', { name: 'Revisar selección (1)' }));
  fireEvent.change(within(dialog).getByRole('textbox'), { target: { value: 'BORRAR' } });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Borrar 1 producto' }));
  expect(await screen.findByText(/P2 · Jabón: No se pudo borrar/)).toBeInTheDocument();
  expect(axios.post.mock.calls[1][1].productos).toEqual(['doc2']);
});
