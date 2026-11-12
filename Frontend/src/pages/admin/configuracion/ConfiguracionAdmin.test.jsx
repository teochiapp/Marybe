import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import ConfiguracionAdmin from './ConfiguracionAdmin';

jest.mock('axios');
jest.mock('react-router-dom', () => ({
  useOutletContext: () => ({ token: 'mock-token' }),
}), { virtual: true });

const mockConfig = {
  cuotas_activas: true,
  cuotas_texto_previo: 'Hasta',
  cuotas_cantidad: 3,
  whatsapp_numero: '5491112345678',
  costo_envio: 6000,
  envio_gratis_desde: 50000,
  costo_uber_moto: 3500,
  mp_habilitado: true,
  mp_titulo: 'Mercado Pago',
  mp_subtitulo: 'Tarjetas y dinero en cuenta',
  mp_etiqueta: 'Recomendado',
  mp_descripcion: 'Instrucciones MP',
  transf_habilitado: true,
  transf_titulo: 'Transferencia Bancaria',
  transf_subtitulo: '10% de descuento',
  transf_etiqueta: '10% OFF',
  transf_banco: 'Banco Galicia',
  transf_titular: 'Marybe SRL',
  transf_cuit: '30-71234567-8',
  transf_cbu: '0070000000000000000001',
  transf_alias: 'MARYBE.TIENDA',
  transf_mensaje_wp: 'Enviá comprobante con tu número de pedido',
  ef_habilitado: true,
  ef_titulo: 'Efectivo al retirar',
  ef_subtitulo: 'Aboná en sucursal',
  ef_etiqueta: 'En local',
  ef_horario: 'Lunes a Sábados 9 a 20 hs',
  ac_habilitado: true,
  ac_titulo: 'A convenir',
  ac_subtitulo: 'Coordinar con nosotros',
  ac_etiqueta: 'A coordinar',
  ac_descripcion: 'Detalle a convenir',
  ac_respuesta: 'Te contactaremos para finalizar',
};

beforeEach(() => {
  jest.clearAllMocks();
  axios.get.mockResolvedValue({ data: { data: mockConfig } });
  axios.put.mockResolvedValue({ data: { data: mockConfig } });
});

test('carga y muestra la configuración general desde la API', async () => {
  render(<ConfiguracionAdmin />);
  expect(screen.getByText(/Cargando configuración general…/i)).toBeInTheDocument();

  await screen.findByRole('heading', { name: 'Configuración General' });
  expect(axios.get).toHaveBeenCalledWith(
    expect.stringMatching(/\/api\/configuracion-general-admin$/),
    expect.objectContaining({ headers: { Authorization: 'Bearer mock-token' } })
  );

  expect(screen.getByLabelText(/Costo de envío estándar/i)).toHaveValue(6000);
  expect(screen.getByLabelText(/Envío gratis a partir de/i)).toHaveValue(50000);
  expect(screen.getByLabelText(/Número de WhatsApp/i)).toHaveValue('5491112345678');
  expect(screen.getByLabelText(/Cantidad de cuotas/i)).toHaveValue('3');
});

test('permite modificar campos y guardar la configuración con PUT', async () => {
  render(<ConfiguracionAdmin />);
  await screen.findByRole('heading', { name: 'Configuración General' });

  const inputCosto = screen.getByLabelText(/Costo de envío estándar/i);
  fireEvent.change(inputCosto, { target: { value: '7500' } });
  expect(inputCosto).toHaveValue(7500);

  const [btnGuardar] = screen.getAllByRole('button', { name: /Guardar cambios/i });
  expect(btnGuardar).toBeEnabled();

  fireEvent.click(btnGuardar);

  await waitFor(() => {
    expect(axios.put).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/configuracion-general-admin$/),
      expect.objectContaining({
        data: expect.objectContaining({
          costo_envio: 7500,
          envio_gratis_desde: 50000,
        }),
      }),
      expect.any(Object)
    );
  });

  expect(await screen.findByText(/Configuración guardada correctamente/i)).toBeInTheDocument();
});

test('muestra alerta cuando falla la carga de la API', async () => {
  axios.get.mockRejectedValueOnce({
    response: { data: { error: { message: 'Fallo del servidor' } } },
  });
  render(<ConfiguracionAdmin />);

  expect(await screen.findByRole('alert')).toHaveTextContent('Fallo del servidor');
});

test('filtra las tarjetas según el tab seleccionado', async () => {
  render(<ConfiguracionAdmin />);
  await screen.findByRole('heading', { name: 'Configuración General' });

  expect(screen.getByRole('heading', { name: 'Envíos y Logística' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Cuotas y Financiación' })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Envíos y Logística' }));
  expect(screen.getByRole('heading', { name: 'Envíos y Logística' })).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Cuotas y Financiación' })).toBeNull();
});
