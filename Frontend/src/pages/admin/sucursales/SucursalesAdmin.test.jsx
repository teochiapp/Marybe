import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import SucursalesAdmin from './SucursalesAdmin';

jest.mock('axios');
jest.mock('react-router-dom', () => ({
  useOutletContext: () => ({ token: 'mock-token' }),
}), { virtual: true });

const mockSucursales = [
  {
    id: 1,
    provincia: 'Santiago del Estero',
    ciudad: 'Capital',
    calle: 'Absalón Rojas 55',
    numero_celular: '+54 9 3854 73-5731',
    numero_fijo: '(0385) 4214890',
    embed_google_maps: 'https://maps.app.goo.gl/absalon55',
  },
  {
    id: 2,
    provincia: 'Tucumán',
    ciudad: 'San Miguel de Tucumán',
    calle: '25 de Mayo 256',
    numero_celular: '+54 9 3814 01-1551',
    numero_fijo: '(0381) 4310500',
    embed_google_maps: 'https://maps.app.goo.gl/25demayo',
  },
];

describe('SucursalesAdmin — Panel Administrativo de Sucursales', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('admin_jwt', 'mock-token');

    axios.get.mockResolvedValue({
      data: {
        data: {
          titulo: 'Nuestras Sucursales Oficiales',
          sucursales: mockSucursales,
        },
      },
    });

    axios.put.mockResolvedValue({
      data: {
        data: {
          titulo: 'Nuestras Sucursales Oficiales',
          sucursales: mockSucursales,
        },
      },
    });

    window.confirm = jest.fn(() => true);
  });

  test('renderiza el título, las sucursales cargadas y las píldoras de provincias', async () => {
    render(<SucursalesAdmin />);

    expect(screen.getByText('Página de Sucursales')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Absalón Rojas 55')).toBeInTheDocument();
    });
    expect(screen.getByText('25 de Mayo 256')).toBeInTheDocument();

    expect(screen.getByDisplayValue('Nuestras Sucursales Oficiales')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Santiago del Estero \(1\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tucumán \(1\)/i })).toBeInTheDocument();
  });

  test('permite filtrar por búsqueda de texto y por píldora de provincia', async () => {
    render(<SucursalesAdmin />);

    await waitFor(() => {
      expect(screen.getByText('Absalón Rojas 55')).toBeInTheDocument();
    });

    // Filtro por texto
    const searchInput = screen.getByLabelText(/filtrar sucursales/i);
    fireEvent.change(searchInput, { target: { value: 'Tucumán' } });

    expect(screen.queryByText('Absalón Rojas 55')).not.toBeInTheDocument();
    expect(screen.getByText('25 de Mayo 256')).toBeInTheDocument();

    // Limpiar búsqueda
    fireEvent.change(searchInput, { target: { value: '' } });

    // Filtro por píldora
    const pillSantiago = screen.getByRole('button', { name: /Santiago del Estero \(1\)/i });
    fireEvent.click(pillSantiago);

    expect(screen.getByText('Absalón Rojas 55')).toBeInTheDocument();
    expect(screen.queryByText('25 de Mayo 256')).not.toBeInTheDocument();
  });

  test('permite agregar una nueva sucursal abriendo el modal y guardando', async () => {
    render(<SucursalesAdmin />);

    await waitFor(() => {
      expect(screen.getByText('Absalón Rojas 55')).toBeInTheDocument();
    });

    const addBtn = screen.getByLabelText(/agregar sucursal/i);
    fireEvent.click(addBtn);

    expect(screen.getByRole('heading', { name: /nueva sucursal/i })).toBeInTheDocument();

    const calleInput = screen.getByLabelText(/calle y número/i);
    fireEvent.change(calleInput, { target: { value: 'Pellegrini 141' } });

    const submitBtn = screen.getByRole('button', { name: /agregar local/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Pellegrini 141')).toBeInTheDocument();
    });

    // Sticky save bar
    const saveAllBtn = screen.getByRole('button', { name: /guardar cambios/i });
    expect(saveAllBtn).toBeInTheDocument();

    fireEvent.click(saveAllBtn);

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        expect.stringContaining('/api/sucursales-admin'),
        expect.objectContaining({
          titulo: 'Nuestras Sucursales Oficiales',
          sucursales: expect.arrayContaining([
            expect.objectContaining({ calle: 'Pellegrini 141' }),
          ]),
        }),
        expect.any(Object)
      );
    });
  });

  test('permite editar, duplicar y eliminar sucursales', async () => {
    render(<SucursalesAdmin />);

    await waitFor(() => {
      expect(screen.getByText('Absalón Rojas 55')).toBeInTheDocument();
    });

    // Duplicar
    const duplicateBtns = screen.getAllByRole('button', { name: /duplicar/i });
    fireEvent.click(duplicateBtns[0]);

    await waitFor(() => {
      expect(screen.getByText('Absalón Rojas 55 (Copia)')).toBeInTheDocument();
    });

    // Eliminar copia
    const deleteBtns = screen.getAllByLabelText(/eliminar sucursal/i);
    fireEvent.click(deleteBtns[1]);

    expect(screen.queryByText('Absalón Rojas 55 (Copia)')).not.toBeInTheDocument();
  });
});
