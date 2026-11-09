import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import GiftCard from './GiftCard';

jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>,
}), { virtual: true });

beforeEach(() => {
  window.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

afterEach(() => jest.restoreAllMocks());

test('renderiza los contenidos predeterminados cuando no hay configuración personalizada', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ data: { diseno_secciones: {} } }),
  });

  render(<GiftCard seccion="perfumeria" />);

  expect(screen.getAllByText('Regalá')).toHaveLength(2);
  expect(screen.getByText('Producto')).toBeInTheDocument();
  expect(screen.getByText('Elegí el producto perfecto para regalar')).toBeInTheDocument();
  expect(screen.getByText('Monto personalizado')).toBeInTheDocument();
  expect(screen.getByText('Vos elegís cuánto regalar')).toBeInTheDocument();

  const img = screen.getByAltText('Gift card Marybe');
  expect(img).toHaveAttribute('src', '/inicio/giftcard.webp');

  const btn = screen.getByRole('link', { name: 'Conocer más' });
  expect(btn).toHaveAttribute('href', '/gift-card');
});

test('aplica la configuración publicada de diseno_secciones["gift-card"]', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      data: {
        diseno_secciones: {
          'gift-card': {
            perfumeria: {
              titulo_destacado: 'Sorprendé con',
              titulo_complementario: 'Marybe Gift',
              bloque1_titulo: 'Perfumes exclusivos',
              bloque1_descripcion: 'Seleccioná su aroma preferido',
              bloque1_icono: 'regalo',
              bloque2_titulo: 'Importe a elección',
              bloque2_descripcion: 'Cargá el saldo que quieras',
              bloque2_icono: 'ninguno',
              imagen: { id: 9, url: '/uploads/custom-card.webp' },
              imagen_tamano: 'grande',
              imagen_posicion_x: 'derecha',
              imagen_posicion_y: 'arriba',
              imagen_ajuste: 'contener',
              color_fondo: '#F7F3EC',
              modo_texto: 'auto',
              boton_texto: 'Quiero regalar',
              boton_enlace: '/tienda',
            },
          },
        },
      },
    }),
  });

  render(<GiftCard seccion="perfumeria" />);

  expect(await screen.findByText('Perfumes exclusivos')).toBeInTheDocument();
  expect(screen.getAllByText('Sorprendé con')).toHaveLength(2);
  expect(screen.getByText('Seleccioná su aroma preferido')).toBeInTheDocument();
  expect(screen.getByText('Importe a elección')).toBeInTheDocument();
  expect(screen.getByText('Cargá el saldo que quieras')).toBeInTheDocument();

  const section = screen.getByRole('region', { name: 'Gift Card Marybe' });
  expect(section).toHaveStyle({ backgroundColor: '#F7F3EC' });

  const img = screen.getByAltText('Gift card Marybe');
  expect(img.getAttribute('src')).toMatch(/\/uploads\/custom-card\.webp$/);

  const btn = screen.getByRole('link', { name: 'Quiero regalar' });
  expect(btn).toHaveAttribute('href', '/tienda');
});

test('renderiza previewData en tiempo real sin llamadas a la red', () => {
  global.fetch = jest.fn();

  render(
    <GiftCard
      seccion="hogar"
      previewData={{
        titulo_destacado: 'Regalá',
        titulo_complementario: 'Hogar',
        bloque1_titulo: 'Deco & Aromas',
        bloque1_descripcion: 'Detalles únicos para cada ambiente',
        bloque1_icono: 'estrella',
        bloque2_titulo: 'Monto libre',
        bloque2_descripcion: 'Elegí el valor de la tarjeta',
        bloque2_icono: 'original',
        color_fondo: '#3E0102',
        boton_texto: 'Ver opciones',
        boton_enlace: 'https://marybe.com/gift',
      }}
    />
  );

  expect(global.fetch).not.toHaveBeenCalled();
  expect(screen.getByText('Deco & Aromas')).toBeInTheDocument();
  const btn = screen.getByRole('link', { name: 'Ver opciones' });
  expect(btn).toHaveAttribute('href', 'https://marybe.com/gift');
});
