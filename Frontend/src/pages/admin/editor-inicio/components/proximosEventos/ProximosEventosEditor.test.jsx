import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import ProximosEventosEditor from './ProximosEventosEditor';

jest.mock('axios');
jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>,
}), { virtual: true });

function buildApiResponse(overrides = {}) {
  const published = {
    titulo: 'Próximos eventos',
    icono: 'original',
    fuente: 'principal',
    tamano: 'grande',
    peso: 'semibold',
    estilo: 'cursiva',
    alineacion: 'izquierda',
    bordes_tarjeta: 'redondeado',
    espaciado_tarjetas: 'normal',
    cantidad_visible: 'todos',
    boton_redondeo: 'redondeado',
    enlace_inferior_texto: 'Ver todos los eventos',
    enlace_inferior_url: '#',
    orden: ['ev-perfumes', 'ev-skincare'],
    eventos: {
      'ev-perfumes': {
        titulo: 'Cata de Perfumes',
        descripcion: 'Descubrí nuevas fragancias\nAsesoramiento personalizado',
        fecha: 'Sábado 15 de Noviembre - 18:00 hs',
        ubicacion: 'Local Centro',
        whatsapp_numero: '5493813632682',
        boton_texto: 'Reservar turno',
        boton_enlace: '',
      },
      'ev-skincare': {
        titulo: 'Taller de Skincare',
        descripcion: 'Rutina facial paso a paso\nDiagnóstico de piel sin cargo',
        fecha: 'Viernes 21 de Noviembre - 17:30 hs',
        ubicacion: 'Sucursal Yerba Buena',
        whatsapp_numero: '5493813632682',
        boton_texto: 'Reservar turno',
        boton_enlace: '',
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
            eventosCatalogo: [
              { id: 1, documentId: 'ev-perfumes', titulo: 'Cata de Perfumes' },
              { id: 2, documentId: 'ev-skincare', titulo: 'Taller de Skincare' },
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

test('carga próximos eventos, permite editar encabezado, ícono, tipografía, tarjeta de evento, diseño y publicar', async () => {
  axios.get.mockResolvedValueOnce(buildApiResponse());
  axios.put.mockResolvedValueOnce(
    buildApiResponse({
      published: {
        titulo: 'Agenda de Eventos Marybe',
        icono: 'estrella',
      },
    })
  );

  render(<ProximosEventosEditor token="test-token" onBack={jest.fn()} onLogout={jest.fn()} />);

  const titleInput = await screen.findByLabelText(/Título de la sección/i);
  expect(titleInput).toHaveValue('Próximos eventos');

  fireEvent.change(titleInput, { target: { value: 'Agenda de Eventos Marybe' } });
  fireEvent.click(screen.getByRole('radio', { name: /Estrella/i }));
  fireEvent.click(screen.getByRole('radio', { name: /Inter/i }));
  fireEvent.click(screen.getByRole('radio', { name: /Centro/i }));

  // Seleccionar la primera tarjeta de evento desde el panel lateral
  fireEvent.click(screen.getByText('1. Cata de Perfumes'));

  const eventTitleInput = await screen.findByLabelText(/Nombre o título del evento/i);
  expect(eventTitleInput).toHaveValue('Cata de Perfumes');

  fireEvent.change(eventTitleInput, { target: { value: 'Cata VIP de Perfumes' } });
  fireEvent.change(screen.getByLabelText(/Fecha y horario del evento/i), {
    target: { value: 'Sábado 22 de Noviembre - 19:00 hs' },
  });
  fireEvent.change(screen.getByLabelText(/Ubicación o sucursal/i), {
    target: { value: 'Showroom Central' },
  });
  fireEvent.change(screen.getByLabelText(/Texto del botón/i), {
    target: { value: 'Inscribirme ahora' },
  });

  // Ajustar controles de diseño
  fireEvent.click(screen.getByText('Diseño de tarjetas y grilla'));
  await screen.findByText(/Bordes de las tarjetas/i);
  fireEvent.click(screen.getByRole('radio', { name: /Suave/i }));
  fireEvent.click(screen.getByRole('radio', { name: /Píldora/i }));

  // Ajustar enlace inferior
  fireEvent.click(screen.getByText('Enlace «Ver todos los eventos»'));
  const bottomLinkText = await screen.findByLabelText(/Texto del enlace/i);
  fireEvent.change(bottomLinkText, { target: { value: 'Ver agenda completa' } });
  fireEvent.change(screen.getByLabelText(/URL de destino/i), {
    target: { value: '/eventos' },
  });

  // Publicar cambios
  fireEvent.click(screen.getByRole('button', { name: /Publicar/i }));

  await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
  const [putUrl, putBody] = axios.put.mock.calls[0];
  expect(putUrl).toMatch(/\/api\/proximos-eventos-admin\/general$/);
  expect(putBody.publish).toBe(true);
  expect(putBody.data.titulo).toBe('Agenda de Eventos Marybe');
  expect(putBody.data.icono).toBe('estrella');
  expect(putBody.data.fuente).toBe('secundaria');
  expect(putBody.data.alineacion).toBe('centro');
  expect(putBody.data.bordes_tarjeta).toBe('muy-redondeado');
  expect(putBody.data.boton_redondeo).toBe('pildora');
  expect(putBody.data.enlace_inferior_texto).toBe('Ver agenda completa');
  expect(putBody.data.enlace_inferior_url).toBe('/eventos');
  expect(putBody.data.eventos['ev-perfumes']).toEqual({
    titulo: 'Cata VIP de Perfumes',
    descripcion: 'Descubrí nuevas fragancias\nAsesoramiento personalizado',
    fecha: 'Sábado 22 de Noviembre - 19:00 hs',
    ubicacion: 'Showroom Central',
    whatsapp_numero: '5493813632682',
    boton_texto: 'Inscribirme ahora',
    boton_enlace: '',
  });
});

test('permite reordenar las tarjetas de eventos y guardar borrador', async () => {
  axios.get.mockResolvedValueOnce(buildApiResponse());
  axios.put.mockResolvedValueOnce(buildApiResponse());

  render(<ProximosEventosEditor token="test-token" onBack={jest.fn()} onLogout={jest.fn()} />);

  await screen.findByLabelText(/Título de la sección/i);
  fireEvent.click(screen.getByText('Orden de los eventos'));

  const moveAfterBtn = await screen.findByRole('button', {
    name: 'Mover Cata de Perfumes después',
  });
  fireEvent.click(moveAfterBtn);

  fireEvent.click(screen.getByRole('button', { name: /Guardar borrador/i }));

  await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
  const [, putBody] = axios.put.mock.calls[0];
  expect(putBody.publish).toBe(false);
  expect(putBody.data.orden).toEqual(['ev-skincare', 'ev-perfumes']);
});
