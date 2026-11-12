import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import EditorAdmin from './EditorAdmin';

jest.mock('axios');
jest.mock('react-router-dom', () => ({
  useOutletContext: () => ({ token: 'mock-token' }),
}), { virtual: true });

const mockProveedores = ['Marybe Paris', 'Dior Oficial'];
const mockProductos = [
  {
    documentId: 'prod-1',
    sku: 'MB-101',
    id_original: 'MB-101',
    marca: 'Marybe',
    nombre: 'Perfume Elegance 100ml Edición Especial',
    precio: 45000,
    precio_oferta: 39900,
    stock: 15,
    portada: null,
    galeria: [],
    variantes: [],
  },
  {
    documentId: 'prod-2',
    sku: 'MB-202',
    id_original: 'MB-202',
    marca: 'Marybe',
    nombre: 'Serum Revitalizante',
    precio: 28000,
    precio_oferta: null,
    stock: 4,
    portada: null,
    galeria: [],
    variantes: [
      { id: 1, sku_ean: 'MB-202-A', volumen: '30ml', color_nombre: '', precio: 28000, precio_oferta: null, stock: 4 },
    ],
  },
];

describe('EditorAdmin — Panel de Edición Rápida', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('admin_jwt', 'mock-token');

    axios.get.mockImplementation((url, config) => {
      if (url.includes('/api/editor-admin/proveedores')) {
        return Promise.resolve({ data: { proveedores: mockProveedores } });
      }
      if (url.includes('/api/editor-admin/productos')) {
        return Promise.resolve({ data: { productos: mockProductos } });
      }
      if (url.includes('/api/editor-admin/buscar')) {
        return Promise.resolve({ data: { productos: [mockProductos[0]] } });
      }
      return Promise.reject(new Error(`Unhandled GET url: ${url}`));
    });

    axios.patch.mockResolvedValue({ data: { ok: true } });
  });

  test('carga proveedores, permite seleccionar y renderiza la tabla compacta', async () => {
    render(<EditorAdmin />);

    expect(screen.getByText('Panel de Edición Rápida')).toBeInTheDocument();
    expect(screen.getByText('Marybe · Administración de Catálogo')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Marybe Paris')).toBeInTheDocument();
    });

    const selectProv = screen.getByRole('combobox');
    fireEvent.change(selectProv, { target: { value: 'Marybe Paris' } });

    await waitFor(() => {
      expect(screen.getByText('Perfume Elegance 100ml Edición Especial')).toBeInTheDocument();
    });

    // Validar campos de stock y precio
    const stockInput = screen.getByDisplayValue('15');
    expect(stockInput).toBeInTheDocument();
    expect(stockInput).toHaveClass('ea-input-stock');

    const numberInputs = screen.getAllByRole('spinbutton');
    expect(numberInputs.length).toBeGreaterThan(0);

    // Headers
    expect(screen.getByRole('columnheader', { name: /sku \/ ean/i })).toHaveClass('ea-col-sku');
    expect(screen.getByRole('columnheader', { name: /^stock$/i })).toHaveClass('ea-col-stock');
    expect(screen.getByRole('columnheader', { name: /^precio$/i })).toHaveClass('ea-col-precio');
  });

  test('permite modificar stock y precios, habilita guardar y envía el PATCH', async () => {
    render(<EditorAdmin />);

    await waitFor(() => {
      expect(screen.getByText('Marybe Paris')).toBeInTheDocument();
    });

    const selectProv = screen.getByRole('combobox');
    fireEvent.change(selectProv, { target: { value: 'Marybe Paris' } });

    await waitFor(() => {
      expect(screen.getByText('Perfume Elegance 100ml Edición Especial')).toBeInTheDocument();
    });

    const stockInput = screen.getByDisplayValue('15');
    fireEvent.change(stockInput, { target: { value: '25' } });

    // Botón de guardar activado
    const saveButton = screen.getByRole('button', { name: /guardar cambios/i });
    expect(saveButton).toBeEnabled();

    // Contador de cambios pendientes
    expect(screen.getByText(/1 con cambios/i)).toBeInTheDocument();

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith(
        expect.stringContaining('/api/editor-admin/productos/prod-1'),
        expect.objectContaining({ stock: '25' }),
        expect.any(Object)
      );
    });
  });

  test('ejecuta búsqueda universal por SKU con debounce', async () => {
    render(<EditorAdmin />);

    const searchInput = screen.getByPlaceholderText(/buscar por sku \/ ean/i);
    fireEvent.change(searchInput, { target: { value: 'MB-101' } });

    await waitFor(
      () => {
        expect(axios.get).toHaveBeenCalledWith(
          expect.stringContaining('/api/editor-admin/buscar'),
          expect.objectContaining({ params: { q: 'MB-101' } })
        );
      },
      { timeout: 1500 }
    );
  });
});
