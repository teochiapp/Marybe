import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import PedidosAdmin from './PedidosAdmin';

jest.mock('axios');

const mockPedido = {
  id: 10,
  documentId: 'ped-10',
  numero_pedido: 'M-ACAE66',
  createdAt: '2026-11-10T14:30:00.000Z',
  cliente_email: 'ana@marybe.com',
  estado: 'Procesando',
  estado_pago: 'pagado',
  total: 25000,
  items: [],
};

describe('PedidosAdmin', () => {
  beforeEach(() => {
    localStorage.setItem('admin_jwt', 'admin-token');
    jest.clearAllMocks();
    axios.get.mockResolvedValue({
      data: {
        data: [mockPedido],
        meta: { pagination: { pageCount: 1 } },
      },
    });
  });

  afterEach(() => {
    localStorage.removeItem('admin_jwt');
  });

  test('filtra por buscador, estado y fechas enviando filtros REST esperados', async () => {
    render(<PedidosAdmin />);

    await screen.findByText('M-ACAE66');

    fireEvent.change(screen.getByLabelText('Estado'), { target: { value: 'Enviado' } });
    await waitFor(() => {
      const lastUrl = axios.get.mock.calls.at(-1)[0];
      expect(lastUrl).toContain('filters%5Bestado%5D%5B%24eq%5D=Enviado');
    });

    fireEvent.change(screen.getByLabelText('Desde'), { target: { value: '2026-11-01' } });
    fireEvent.change(screen.getByLabelText('Hasta'), { target: { value: '2026-11-10' } });
    await waitFor(() => {
      const lastUrl = axios.get.mock.calls.at(-1)[0];
      expect(lastUrl).toContain('filters%5BcreatedAt%5D%5B%24gte%5D=');
      expect(lastUrl).toContain('filters%5BcreatedAt%5D%5B%24lte%5D=');
    });

    fireEvent.change(screen.getByLabelText('Buscar'), { target: { value: 'ACAE66' } });
    await waitFor(
      () => {
        const lastUrl = axios.get.mock.calls.at(-1)[0];
        expect(lastUrl).toContain('filters%5B%24or%5D%5B0%5D%5Bnumero_pedido%5D%5B%24containsi%5D=ACAE66');
        expect(lastUrl).toContain('filters%5B%24or%5D%5B1%5D%5Bcliente_email%5D%5B%24containsi%5D=ACAE66');
      },
      { timeout: 1000 }
    );

    fireEvent.click(screen.getByRole('button', { name: 'Limpiar' }));
    expect(screen.getByLabelText('Buscar')).toHaveValue('');
    expect(screen.getByLabelText('Estado')).toHaveValue('');
  });

  test('el botón de cierre del modal de detalle tiene aria-label accesible', async () => {
    render(<PedidosAdmin />);

    await screen.findByText('M-ACAE66');
    fireEvent.click(screen.getByTitle('Ver detalles'));

    const closeBtn = await screen.findByRole('button', { name: 'Cerrar detalle del pedido M-ACAE66' });
    expect(closeBtn).toBeInTheDocument();
  });
});
