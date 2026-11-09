import React from 'react';
import '@testing-library/jest-dom';
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

  expect(await screen.findByAltText('Banco 12')).toBeTruthy();

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

test('aplica orden, textos, botón y ajustes de logo publicados en diseno_secciones.beneficios', async () => {
  const items = [
    {
      id: 1,
      documentId: 'promo-1',
      nombre: 'Banco Uno',
      cuotas_cantidad: [3, 6],
      cuotas_descripcion: 'sin interés',
      monto_minimo: '$30.000',
      orden: 1,
      logo: { url: '/uploads/b1.png' },
    },
    {
      id: 2,
      documentId: 'promo-2',
      nombre: 'Banco Dos',
      cuotas_cantidad: [12],
      cuotas_descripcion: 'fijas',
      monto_minimo: '$50.000',
      orden: 2,
      logo: { url: '/uploads/b2.png' },
    },
  ];

  global.fetch = jest.fn((url) => {
    if (String(url).includes('/api/promociones-bancarias')) {
      return Promise.resolve({ ok: true, json: async () => ({ data: items }) });
    }
    return Promise.resolve({
      ok: true,
      json: async () => ({
        data: {
          diseno_secciones: {
            beneficios: {
              general: {
                titulo: 'Beneficios exclusivos Marybe',
                info_titulo: '¿Tenés dudas sobre medios de pago?',
                info_descripcion: 'Conocé todos los bancos adheridos.',
                boton_texto: 'Ver medios de pago',
                boton_enlace: '/tienda',
                orden: ['promo-2', 'promo-1'],
                tarjetas: {
                  'promo-2': {
                    tamano_logo: 'grande',
                    ajuste_logo: 'cubrir',
                    posicion_logo: 'izquierda',
                  },
                },
              },
            },
          },
        },
      }),
    });
  });

  render(<TarjetasPromociones />);

  expect(
    await screen.findByRole('heading', { name: 'Beneficios exclusivos Marybe' })
  ).toBeInTheDocument();

  const imgs = screen.getAllByRole('img');
  expect(imgs).toHaveLength(2);
  expect(imgs[0]).toHaveAttribute('alt', 'Banco Dos');
  expect(imgs[1]).toHaveAttribute('alt', 'Banco Uno');

  expect(imgs[0]).toHaveStyle({
    height: '54px',
    objectFit: 'cover',
    objectPosition: 'left center',
  });

  expect(screen.getByText('¿Tenés dudas sobre medios de pago?')).toBeInTheDocument();
  expect(screen.getByText('Conocé todos los bancos adheridos.')).toBeInTheDocument();
  const link = screen.getByRole('link', { name: 'Ver medios de pago' });
  expect(link).toHaveAttribute('href', '/tienda');
});

test('renderiza previewData directamente sin consultar la red', () => {
  global.fetch = jest.fn();
  render(
    <TarjetasPromociones
      previewData={{
        titulo: 'Vista previa de beneficios',
        info_titulo: 'Más info preview',
        info_descripcion: 'Descripción preview',
        boton_texto: 'Botón preview',
        boton_enlace: '/promos',
        orden: ['doc-b', 'doc-a'],
        promociones: [
          {
            id: 1,
            documentId: 'doc-a',
            nombre: 'Naranja X',
            cuotas_cantidad: [3, 6],
            cuotas_descripcion: 'sin interés',
            monto_minimo: '$25.000',
            logo: { url: '/uploads/nx.png' },
          },
          {
            id: 2,
            documentId: 'doc-b',
            nombre: 'Macro',
            cuotas_cantidad: [3],
            cuotas_descripcion: 'sin interés',
            monto_minimo: '',
            logo: { url: '/uploads/macro.png' },
          },
        ],
      }}
    />
  );

  expect(global.fetch).not.toHaveBeenCalled();
  expect(screen.getByRole('heading', { name: 'Vista previa de beneficios' })).toBeInTheDocument();
  const imgs = screen.getAllByRole('img');
  expect(imgs.map(img => img.getAttribute('alt'))).toEqual(['Macro', 'Naranja X']);
  expect(screen.getByRole('link', { name: 'Botón preview' })).toHaveAttribute('href', '/promos');
});
