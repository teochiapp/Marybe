import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import GiftCardsAdmin from './GiftCardsAdmin';

jest.mock('axios');
jest.mock(
  'react-router-dom',
  () => ({
    useOutletContext: () => ({ token: 'test-admin-jwt' }),
  }),
  { virtual: true }
);

const mockResponse = {
  data: {
    data: [
      {
        id: 1,
        documentId: 'gc-1',
        codigo: 'GC-ACTIVA-01',
        monto: 50000,
        activa: true,
        fecha_expiracion: '2027-11-01T00:00:00.000Z',
        createdAt: '2026-11-01T10:00:00.000Z',
        estado_actual: 'activa',
        pedido_origen: {
          numero_pedido: 'M-1010AA',
          cliente_email: 'cliente1@marybe.com',
        },
        usos: [],
      },
      {
        id: 2,
        documentId: 'gc-2',
        codigo: 'GC-USADA-02',
        monto: 0,
        activa: false,
        fecha_expiracion: '2027-10-01T00:00:00.000Z',
        createdAt: '2026-10-01T10:00:00.000Z',
        estado_actual: 'usada',
        pedido_origen: {
          numero_pedido: 'M-2020BB',
          cliente_email: 'cliente2@marybe.com',
        },
        usos: [
          {
            numero_pedido: 'M-3030CC',
            cliente_email: 'canje@marybe.com',
            monto_usado: 30000,
          },
        ],
      },
    ],
    meta: {
      stats: {
        total: 2,
        activas: 1,
        usadas: 1,
        expiradas: 0,
        inactivas: 0,
        saldo_activo_total: 50000,
      },
    },
  },
};

describe('GiftCardsAdmin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockResolvedValue(mockResponse);
    axios.post.mockResolvedValue({ data: { data: { id: 3, codigo: 'GC-NUEVA' } } });
    axios.patch.mockResolvedValue({ data: { data: { id: 1, activa: false } } });
  });

  test('muestra las gift cards compradas, estadísticas y pedido origen', async () => {
    render(<GiftCardsAdmin />);

    expect(await screen.findByText('GC-ACTIVA-01')).toBeTruthy();
    expect(screen.getByText('GC-USADA-02')).toBeTruthy();
    expect(screen.getByText('M-1010AA')).toBeTruthy();
    expect(screen.getByText('cliente1@marybe.com')).toBeTruthy();
    expect(screen.getByText('M-3030CC ($ 30.000)')).toBeTruthy();
  });

  test('filtra gift cards por texto de búsqueda y por estado', async () => {
    render(<GiftCardsAdmin />);

    await screen.findByText('GC-ACTIVA-01');

    fireEvent.click(screen.getByRole('button', { name: 'Usadas' }));
    expect(screen.queryByText('GC-ACTIVA-01')).toBeNull();
    expect(screen.getByText('GC-USADA-02')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Todas' }));
    fireEvent.change(screen.getByLabelText('Buscar Gift Cards'), {
      target: { value: 'M-1010AA' },
    });
    expect(screen.getByText('GC-ACTIVA-01')).toBeTruthy();
    expect(screen.queryByText('GC-USADA-02')).toBeNull();
  });

  test('permite crear una nueva gift card desde el modal', async () => {
    render(<GiftCardsAdmin />);

    await screen.findByText('GC-ACTIVA-01');
    fireEvent.click(screen.getByRole('button', { name: /Nueva Gift Card/i }));

    fireEvent.change(screen.getByLabelText(/Monto \/ Saldo/i), {
      target: { value: '45000' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Crear Gift Card' }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/gift-cards-admin'),
        expect.objectContaining({ monto: 45000 }),
        expect.objectContaining({
          headers: { Authorization: 'Bearer test-admin-jwt' },
        })
      );
    });
  });

  test('permite desactivar una gift card activa', async () => {
    render(<GiftCardsAdmin />);

    await screen.findByText('GC-ACTIVA-01');
    fireEvent.click(screen.getByRole('button', { name: 'Desactivar' }));

    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith(
        expect.stringContaining('/api/gift-cards-admin/1'),
        { activa: false },
        expect.objectContaining({
          headers: { Authorization: 'Bearer test-admin-jwt' },
        })
      );
    });
  });

  test('mantiene deshabilitado Desactivar en tarjetas expiradas', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        data: [
          {
            id: 9,
            documentId: 'gc-9',
            codigo: '2941768',
            monto: 15000,
            activa: true,
            fecha_expiracion: '2025-01-01T00:00:00.000Z',
            createdAt: '2024-01-01T10:00:00.000Z',
            estado_actual: 'expirada',
            pedido_origen: null,
            usos: [],
          },
        ],
        meta: {
          stats: {
            total: 1,
            activas: 0,
            usadas: 0,
            expiradas: 1,
            inactivas: 0,
            saldo_activo_total: 0,
          },
        },
      },
    });

    render(<GiftCardsAdmin />);

    await screen.findByText('2941768');
    const desactivarBtn = screen.getByRole('button', { name: 'Desactivar' });
    expect(desactivarBtn.disabled).toBe(true);
    fireEvent.click(desactivarBtn);
    expect(axios.patch).not.toHaveBeenCalled();
  });
});
