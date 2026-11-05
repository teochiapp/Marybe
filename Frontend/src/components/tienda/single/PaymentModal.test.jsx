import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import PaymentModal from './PaymentModal';

test('el modal recupera y presenta las promociones bancarias activas de Strapi', async () => {
  const fetchMock = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ data: [{
      id: 42,
      nombre: 'Banco de prueba',
      cuotas_cantidad: [3, 6],
      monto_minimo: '$50.000',
      logo: { url: '/uploads/banco-prueba.png' },
    }] }),
  });
  global.fetch = fetchMock;

  render(<PaymentModal isOpen onClose={jest.fn()} />);

  await waitFor(() => expect(screen.getByAltText('Banco de prueba')).toBeTruthy());

  expect(fetchMock).toHaveBeenCalledWith(
    expect.stringContaining('/api/promociones-bancarias?sort=orden:asc&populate=logo&filters[activo][$eq]=true'),
    expect.objectContaining({ signal: expect.any(AbortSignal) })
  );
  expect(screen.getByText(/en compras desde/)).toBeTruthy();
  expect(screen.getByText('$50.000')).toBeTruthy();
});
