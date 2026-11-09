import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import GiftCardEditor from './GiftCardEditor';

jest.mock('axios');
jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>,
}), { virtual: true });

function buildApiResponse(overrides = {}) {
  const defaultArea = (bg = '#6A0304') => ({
    titulo_destacado: 'Regalá',
    titulo_complementario: 'Marybe',
    bloque1_titulo: 'Producto',
    bloque1_descripcion: 'Elegí el producto perfecto para regalar',
    bloque1_icono: 'original',
    bloque2_titulo: 'Monto personalizado',
    bloque2_descripcion: 'Vos elegís cuánto regalar',
    bloque2_icono: 'original',
    imagen: null,
    imagen_tamano: 'mediano',
    imagen_posicion_x: 'centro',
    imagen_posicion_y: 'centro',
    imagen_ajuste: 'contener',
    color_fondo: bg,
    modo_texto: 'auto',
    boton_texto: 'Conocer más',
    boton_enlace: '/gift-card',
  });

  return {
    data: {
      data: {
        version: 'v-1',
        exists: true,
        areas: {
          perfumeria: {
            defaultBg: '#6A0304',
            published: { ...defaultArea('#6A0304'), ...(overrides.perfumeria || {}) },
            draft: overrides.draftPerfumeria ?? null,
            draftSavedAt: null,
          },
          hogar: {
            defaultBg: '#B10002',
            published: defaultArea('#B10002'),
            draft: null,
            draftSavedAt: null,
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

test('permite editar título, bloques descriptivos, imagen, color de fondo y botón y publicar', async () => {
  axios.get.mockResolvedValueOnce(buildApiResponse());
  axios.put.mockResolvedValueOnce(buildApiResponse());

  render(<GiftCardEditor token="test-token" onBack={jest.fn()} onLogout={jest.fn()} />);

  const destacadoInput = await screen.findByLabelText(/Texto destacado/i);
  expect(destacadoInput).toHaveValue('Regalá');

  fireEvent.change(destacadoInput, { target: { value: 'Sorprendé con' } });
  fireEvent.change(screen.getByLabelText(/Texto complementario/i), {
    target: { value: 'Marybe Gift' },
  });
  fireEvent.change(screen.getByLabelText(/Título del bloque 1/i), {
    target: { value: 'Fragancias' },
  });
  fireEvent.change(screen.getByLabelText(/Descripción del bloque 1/i), {
    target: { value: 'Elegí la fragancia ideal' },
  });

  // Ir al panel de Imagen principal
  fireEvent.click(screen.getByText('Imagen principal'));
  fireEvent.click(screen.getByRole('radio', { name: /Grande/i }));
  fireEvent.click(screen.getByRole('radio', { name: /Derecha/i }));

  // Ir al panel de Color de fondo y contraste
  fireEvent.click(screen.getByText('Color de fondo y contraste'));
  const hexInput = screen.getByLabelText(/Código de color HEX/i);
  fireEvent.change(hexInput, { target: { value: '#F7F3EC' } });

  // Ir al panel de Botón
  fireEvent.click(screen.getByText('Botón «Conocer más»'));
  fireEvent.change(screen.getByLabelText(/Texto del botón/i), {
    target: { value: 'Regalar ahora' },
  });
  fireEvent.change(screen.getByLabelText(/URL o enlace de destino/i), {
    target: { value: '/tienda' },
  });

  // Publicar
  fireEvent.click(screen.getByRole('button', { name: /Publicar/i }));

  await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
  const [putUrl, putBody] = axios.put.mock.calls[0];
  expect(putUrl).toMatch(/\/api\/gift-card-admin\/perfumeria$/);
  expect(putBody.publish).toBe(true);
  expect(putBody.data).toMatchObject({
    titulo_destacado: 'Sorprendé con',
    titulo_complementario: 'Marybe Gift',
    bloque1_titulo: 'Fragancias',
    bloque1_descripcion: 'Elegí la fragancia ideal',
    imagen_tamano: 'grande',
    imagen_posicion_x: 'derecha',
    color_fondo: '#F7F3EC',
    boton_texto: 'Regalar ahora',
    boton_enlace: '/tienda',
  });
});

test('valida enlaces inválidos antes de publicar', async () => {
  axios.get.mockResolvedValueOnce(buildApiResponse());

  render(<GiftCardEditor token="test-token" onBack={jest.fn()} onLogout={jest.fn()} />);

  await screen.findByLabelText(/Texto destacado/i);
  fireEvent.click(screen.getByText('Botón «Conocer más»'));
  fireEvent.change(screen.getByLabelText(/URL o enlace de destino/i), {
    target: { value: 'enlace-invalido' },
  });

  fireEvent.click(screen.getByRole('button', { name: /Publicar/i }));

  expect(axios.put).not.toHaveBeenCalled();
  expect(
    await screen.findByText(/El enlace del botón debe comenzar con "\/" o con "https:\/\/"/i)
  ).toBeInTheDocument();
});
