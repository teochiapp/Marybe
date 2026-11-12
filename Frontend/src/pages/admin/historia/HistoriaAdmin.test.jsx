import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import HistoriaAdmin from './HistoriaAdmin';

jest.mock('axios');
jest.mock(
  'react-router-dom',
  () => ({
    useOutletContext: () => ({ token: 'test-admin-jwt' }),
  }),
  { virtual: true }
);

const mockData = {
  titulo: 'Nuestra Historia',
  imagen_inicio: { id: 10, url: '/uploads/inicio.jpg', name: 'inicio.jpg' },
  encuadre_imagen_inicio: 'centro',
  texto_banner_1: '<p>Fundación 1969</p>',
  texto_intermedio: '<p>Expansión regional</p>',
  texto_banner_2: '<p>Más de 50 años</p>',
  imagen_secundaria: null,
  encuadre_imagen_secundaria: 'arriba',
  imagen_final_desktop: null,
  encuadre_imagen_final_desktop: 'centro',
  imagen_final_mobile: null,
  encuadre_imagen_final_mobile: 'centro',
};

describe('HistoriaAdmin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockResolvedValue({ data: { data: mockData } });
    axios.put.mockResolvedValue({
      data: {
        data: { ...mockData, titulo: 'Nuestra Historia Renovada' },
      },
    });
    axios.post.mockResolvedValue({
      data: {
        data: { id: 77, url: '/uploads/nueva.jpg', name: 'nueva.jpg' },
      },
    });
  });

  test('carga y muestra los campos actuales de Nuestra Historia', async () => {
    render(<HistoriaAdmin />);

    expect(await screen.findByDisplayValue('Nuestra Historia')).toBeTruthy();
    expect(screen.getByText('Fundación 1969')).toBeTruthy();
    expect(screen.getByText('Expansión regional')).toBeTruthy();
    expect(screen.getByText('Más de 50 años')).toBeTruthy();
  });

  test('permite editar textos desde el editor visual, encuadre y guardar cambios en /api/historia-admin', async () => {
    render(<HistoriaAdmin />);

    const tituloInput = await screen.findByLabelText('Título de la página');
    fireEvent.change(tituloInput, { target: { value: 'Nuestra Historia Renovada' } });
    const editorBanner1 = screen.getByRole('textbox', { name: 'Texto banner 1' });
    editorBanner1.innerHTML = '<p><strong>Nuevo texto 1</strong></p>';
    fireEvent.input(editorBanner1);

    fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        expect.stringContaining('/api/historia-admin'),
        expect.objectContaining({
          titulo: 'Nuestra Historia Renovada',
          texto_banner_1: '<p><strong>Nuevo texto 1</strong></p>',
          imagen_inicio: 10,
        }),
        expect.objectContaining({
          headers: { Authorization: 'Bearer test-admin-jwt' },
        })
      );
    });
  });

  test('permite subir una imagen secundaria desde el panel', async () => {
    render(<HistoriaAdmin />);

    await screen.findByLabelText('Título de la página');
    const fileInput = screen.getAllByLabelText(/Subir imagen/i)[0];
    const file = new File(['img'], 'secundaria.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/historia-admin/upload'),
        expect.any(FormData),
        expect.objectContaining({
          headers: { Authorization: 'Bearer test-admin-jwt' },
        })
      );
    });
  });
});
