import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import TarjetasPromociones from './TarjetasPromociones';

const promociones = Array.from({ length: 12 }, (_, index) => ({
  id: index + 1,
  nombre: `Banco ${String(index + 1).padStart(2, '0')}`,
  orden: index + 1,
  activo: true,
  cuotas_cantidad: 3,
  monto_minimo: `${(index + 1) * 10000}`,
  logo: { url: `/uploads/banco-${index + 1}.png` },
}));

afterEach(() => jest.restoreAllMocks());

test('solicita promociones activas ordenadas y muestra los 12 bancos con sus montos mínimos', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ data: promociones }),
  });

  render(<TarjetasPromociones />);

  await waitFor(() => expect(screen.getByAltText('Banco 12')).toBeTruthy());

  expect(global.fetch).toHaveBeenCalledWith(
    expect.stringContaining('/api/promociones-bancarias?sort=orden:asc&populate=logo&filters[activo][$eq]=true'),
    expect.objectContaining({ signal: expect.any(AbortSignal) })
  );
  expect(screen.getAllByText(/en compras desde/)).toHaveLength(12);
  expect(screen.getByText('120000')).toBeTruthy();
  expect(screen.queryByText(/en compras hasta/)).toBeNull();
  expect(screen.getAllByRole('img')).toHaveLength(12);
});

test('ante un error de Strapi no conserva tarjetas anteriores ni muestra valores locales', async () => {
  global.fetch = jest.fn().mockRejectedValue(new Error('Strapi no disponible'));
  const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

  render(<TarjetasPromociones />);

  await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
  expect(screen.queryByText(/Banco/)).toBeNull();
  expect(screen.queryByRole('img')).toBeNull();
  consoleError.mockRestore();
});
