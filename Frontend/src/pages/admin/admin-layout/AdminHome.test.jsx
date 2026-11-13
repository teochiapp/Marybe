import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import axios from 'axios';
import AdminHome from './AdminHome';

jest.mock('axios');
jest.mock('react-router-dom', () => ({
  Link: ({ to, children }) => <a href={to}>{children}</a>,
  useOutletContext: () => ({ token: 'test-token' }),
}), { virtual: true });

test('muestra métricas reales del endpoint administrativo', async () => {
  axios.get.mockResolvedValue({ data: { data: { ventasTotales: 12500, pedidosMes: 4, productosSemana: 3, pedidosPendientes: 1 } } });
  render(<AdminHome />);
  expect(await screen.findByText(/12\.500/)).toBeInTheDocument();
  expect(screen.getByText('Pedidos del mes').parentElement).toHaveTextContent('4');
  expect(screen.queryByText('Productos nuevos')).not.toBeInTheDocument();
  expect(axios.get).toHaveBeenCalledWith(expect.stringMatching(/\/api\/admin-dashboard$/), expect.objectContaining({ headers: { Authorization: 'Bearer test-token' } }));
});
