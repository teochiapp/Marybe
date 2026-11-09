import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import BeneficiosEditor from './BeneficiosEditor';

jest.mock('axios');
jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>,
}), { virtual: true });

function buildApiResponse(overrides = {}) {
  const published = {
    titulo: 'Beneficios para vos',
    info_titulo: '¿Necesitás más información?',
    info_descripcion: 'Consultá todas las promociones vigentes y encontrá la que más te conviene.',
    boton_texto: 'Ver todas las promociones',
    boton_enlace: '',
    orden: ['promo-naranja', 'promo-macro'],
    tarjetas: {
      'promo-naranja': {
        nombre: 'Tarjeta Naranja X',
        cuotas_descripcion: 'sin interés',
        cuotas_cantidad: [3, 6],
        monto_minimo: '$30.000',
        logo: { id: 101, url: '/uploads/naranja.png', name: 'naranja.png' },
        tamano_logo: 'mediano',
        ajuste_logo: 'contener',
        posicion_logo: 'centro',
      },
      'promo-macro': {
        nombre: 'Banco Macro',
        cuotas_descripcion: 'sin interés bancarias',
        cuotas_cantidad: [3],
        monto_minimo: '$35.000',
        logo: { id: 102, url: '/uploads/macro.png', name: 'macro.png' },
        tamano_logo: 'mediano',
        ajuste_logo: 'contener',
        posicion_logo: 'centro',
      },
    },
    ...(overrides.published || {}),
  };

  return {
    data: {
      data: {
        version: 'v-1',
        exists: true,
        areas: {
          general: {
            promociones: [
              { id: 1, documentId: 'promo-naranja', nombre: 'Tarjeta Naranja X', orden: 1 },
              { id: 2, documentId: 'promo-macro', nombre: 'Banco Macro', orden: 2 },
            ],
            published,
            draft: overrides.draft ?? null,
            draftSavedAt: overrides.draftSavedAt ?? null,
          },
        },
      },
    },
  };
}

beforeEach(() => {
  window.ResizeObserver = class {
    observe() {}
    disconnect() {}
  };
  jest.clearAllMocks();
});

test('carga beneficios, permite editar textos generales, tarjeta individual, ajustes de logo y publicar', async () => {
  axios.get.mockResolvedValueOnce(buildApiResponse());
  axios.put.mockResolvedValueOnce(
    buildApiResponse({
      published: {
        titulo: 'Beneficios exclusivos Marybe',
        boton_enlace: '/tienda',
      },
    })
  );

  render(<BeneficiosEditor token="test-token" onBack={jest.fn()} onLogout={jest.fn()} />);

  const titleInput = await screen.findByLabelText(/Título de la sección/i);
  expect(titleInput).toHaveValue('Beneficios para vos');

  fireEvent.change(titleInput, { target: { value: 'Beneficios exclusivos Marybe' } });
  fireEvent.change(screen.getByLabelText(/Enlace o acción del botón/i), {
    target: { value: '/tienda' },
  });

  // Seleccionar la primera tarjeta desde el panel lateral
  fireEvent.click(screen.getByText('1. Tarjeta Naranja X'));

  const bankInput = await screen.findByLabelText(/Nombre del banco o entidad/i);
  expect(bankInput).toHaveValue('Tarjeta Naranja X');

  fireEvent.change(bankInput, { target: { value: 'Naranja X Plan Z' } });
  fireEvent.change(
    screen.getByLabelText(/Cantidad de cuotas destacadas en negrita/i),
    { target: { value: '3, 6, 12' } }
  );
  fireEvent.change(screen.getByLabelText(/Monto mínimo destacado en negrita/i), {
    target: { value: '$45.000' },
  });

  // Ajustar tamaño, ajuste y posición del logo
  fireEvent.click(screen.getByRole('radio', { name: /Grande/i }));
  fireEvent.click(screen.getByRole('radio', { name: /Cubrir/i }));
  fireEvent.click(screen.getByRole('radio', { name: /Izquierda/i }));

  // Publicar cambios
  fireEvent.click(screen.getByRole('button', { name: /Publicar/i }));

  await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
  const [putUrl, putBody] = axios.put.mock.calls[0];
  expect(putUrl).toMatch(/\/api\/beneficios-admin\/general$/);
  expect(putBody.publish).toBe(true);
  expect(putBody.data.titulo).toBe('Beneficios exclusivos Marybe');
  expect(putBody.data.boton_enlace).toBe('/tienda');
  expect(putBody.data.tarjetas['promo-naranja']).toEqual({
    nombre: 'Naranja X Plan Z',
    cuotas_descripcion: 'sin interés',
    cuotas_cantidad: [3, 6, 12],
    monto_minimo: '$45.000',
    logo: { id: 101, url: '/uploads/naranja.png', name: 'naranja.png' },
    tamano_logo: 'grande',
    ajuste_logo: 'cubrir',
    posicion_logo: 'izquierda',
  });
});

test('permite reordenar las tarjetas de beneficios y guardar borrador', async () => {
  axios.get.mockResolvedValueOnce(buildApiResponse());
  axios.put.mockResolvedValueOnce(buildApiResponse());

  render(<BeneficiosEditor token="test-token" onBack={jest.fn()} onLogout={jest.fn()} />);

  await screen.findByLabelText(/Título de la sección/i);
  fireEvent.click(screen.getByText('Orden de beneficios'));

  const moveAfterBtn = await screen.findByRole('button', {
    name: 'Mover Tarjeta Naranja X después',
  });
  fireEvent.click(moveAfterBtn);

  fireEvent.click(screen.getByRole('button', { name: /Guardar borrador/i }));

  await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
  const [, putBody] = axios.put.mock.calls[0];
  expect(putBody.publish).toBe(false);
  expect(putBody.data.orden).toEqual(['promo-macro', 'promo-naranja']);
});
