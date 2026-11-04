import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import ImportacionAdmin from './ImportacionAdmin';

jest.mock('axios');

beforeEach(() => {
  localStorage.setItem('admin_jwt', 'test-token');
  jest.clearAllMocks();
});

afterEach(() => localStorage.removeItem('admin_jwt'));

async function upload(response) {
  axios.post.mockResolvedValueOnce({ data: response });
  render(<ImportacionAdmin />);
  fireEvent.change(screen.getByLabelText('Seleccionar archivo Excel'), {
    target: { files: [new File(['xlsx'], 'copia.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })] },
  });
  fireEvent.click(screen.getByRole('button', { name: /Importar Productos al Catálogo/i }));
  await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
}

test('una importación parcial muestra el producto y la fila con error, sin éxito falso', async () => {
  await upload({ ok: false, parcial: true, datos: {
    totalProductos: 2, creados: 0, actualizados: 1, sinCambios: 0, errores: 1,
    erroresList: ['Fila 7 · producto P2: falta P2-50'], tiempoSegundos: 0.2, log: [],
  } });
  expect(await screen.findByText('Importación parcial: revisá los errores')).toBeInTheDocument();
  expect(screen.getByText('Fila 7 · producto P2: falta P2-50')).toBeInTheDocument();
  expect(screen.queryByText('¡Importación exitosa!')).not.toBeInTheDocument();
});

test('una importación completa conserva el mensaje de éxito', async () => {
  await upload({ ok: true, parcial: false, datos: {
    totalProductos: 1, creados: 0, actualizados: 1, sinCambios: 0, errores: 0,
    erroresList: [], tiempoSegundos: 0.2, log: [],
  } });
  expect(await screen.findByText('¡Importación exitosa!')).toBeInTheDocument();
});
