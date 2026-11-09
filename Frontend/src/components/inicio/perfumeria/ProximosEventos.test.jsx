import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import ProximosEventos from './ProximosEventos';

beforeEach(() => {
  jest.clearAllMocks();
});

test('renderiza previewData en tiempo real con orden, ícono, diseño y tarjetas personalizadas', () => {
  const previewData = {
    titulo: 'Agenda de Experiencias',
    icono: 'estrella',
    fuente: 'secundaria',
    tamano: 'grande',
    peso: 'bold',
    estilo: 'normal',
    alineacion: 'centro',
    bordes_tarjeta: 'muy-redondeado',
    espaciado_tarjetas: 'amplio',
    cantidad_visible: 'todos',
    boton_redondeo: 'pildora',
    enlace_inferior_texto: 'Ver calendario anual',
    enlace_inferior_url: '/calendario',
    orden: ['ev-2', 'ev-1'],
    eventos: [
      {
        id: 2,
        documentId: 'ev-2',
        titulo: 'Masterclass de Skincare',
        descripcion: 'Limpieza facial\nTesteo de serums',
        fecha: 'Viernes 21 - 17:30 hs',
        ubicacion: 'Yerba Buena',
        whatsapp_numero: '5493813632682',
        boton_texto: 'Inscribirme',
        boton_enlace: '/inscripcion',
      },
      {
        id: 1,
        documentId: 'ev-1',
        titulo: 'Cata Sensorial',
        descripcion: 'Notas florales\nCierre con brindis',
        fecha: 'Sábado 15 - 18:00 hs',
        ubicacion: 'Local Centro',
        whatsapp_numero: '5493813632682',
        boton_texto: 'Reservar cupo',
        boton_enlace: '',
      },
    ],
  };

  render(<ProximosEventos previewData={previewData} />);

  expect(screen.getByRole('heading', { name: 'Agenda de Experiencias' })).toBeInTheDocument();
  expect(screen.getByText('Ver calendario anual')).toBeInTheDocument();

  const cardHeadings = screen.getAllByRole('heading', { level: 3 });
  expect(cardHeadings.map(h => h.textContent)).toEqual([
    'Masterclass de Skincare',
    'Cata Sensorial',
  ]);

  expect(screen.getByText('Limpieza facial')).toBeInTheDocument();
  expect(screen.getByText('Notas florales')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Inscribirme' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Reservar cupo' })).toBeInTheDocument();
});

test('carga eventos publicados de Strapi y aplica configuración publicada de diseno_secciones', async () => {
  const fetchSpy = jest.spyOn(global, 'fetch').mockImplementation(url => {
    if (String(url).includes('/api/eventos')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          data: [
            {
              id: 1,
              documentId: 'ev-1',
              titulo: 'Cata de Perfumes',
              descripcion: 'Fragancias importadas',
              fecha: 'Sábado 15 de Noviembre',
              ubicacion: 'Local Centro',
              whatsapp_numero: '5493813632682',
            },
            {
              id: 2,
              documentId: 'ev-2',
              titulo: 'Taller de Maquillaje',
              descripcion: 'Automaquillaje de noche',
              fecha: 'Sábado 29 de Noviembre',
              ubicacion: 'Local Centro',
              whatsapp_numero: '5493813632682',
            },
          ],
        }),
      });
    }
    if (String(url).includes('/api/seccion-principal')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          data: {
            diseno_secciones: {
              'proximos-eventos': {
                general: {
                  titulo: 'Nuestros próximos eventos',
                  icono: 'corazon',
                  cantidad_visible: '1',
                  orden: ['ev-2', 'ev-1'],
                  eventos: {
                    'ev-2': {
                      boton_texto: 'Anotarme por WhatsApp',
                      boton_enlace: '',
                    },
                  },
                },
              },
            },
          },
        }),
      });
    }
    return Promise.reject(new Error(`Unexpected URL: ${url}`));
  });

  const openSpy = jest.spyOn(window, 'open').mockImplementation(() => {});

  render(<ProximosEventos />);

  expect(await screen.findByRole('heading', { name: 'Nuestros próximos eventos' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Taller de Maquillaje' })).toBeInTheDocument();
  // Como cantidad_visible es '1', el segundo evento no se muestra
  expect(screen.queryByRole('heading', { name: 'Cata de Perfumes' })).toBeNull();

  fireEvent.click(screen.getByRole('button', { name: 'Anotarme por WhatsApp' }));
  expect(openSpy).toHaveBeenCalledWith(
    expect.stringContaining('https://wa.me/5493813632682?text='),
    '_blank'
  );

  openSpy.mockRestore();
  fetchSpy.mockRestore();
});
