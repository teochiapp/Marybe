import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import FeaturedSection from './perfumeria/FeaturedSection';
import FeaturedSectionHogar from './hogar/FeaturedSectionHogar';
import DiscountedSection from './perfumeria/DiscountedSection';
import DiscountedSectionHogar from './hogar/DiscountedSectionHogar';
import TopBar from '../header/TopBar';

jest.mock('react-router-dom', () => ({
  MemoryRouter: ({ children }) => children,
  useNavigate: () => jest.fn(),
  Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>,
}), { virtual: true });
jest.mock('../../hooks/useConfiguracionGeneral', () => ({ useConfiguracionGeneral: () => ({ config: {} }) }));

const originalFetch = global.fetch;
afterEach(() => { global.fetch = originalFetch; });

const cases = [
  ['Lo nuevo / Perfumería', FeaturedSection, 'secciones', 'Perfumeria'],
  ['Lo nuevo / Hogar', FeaturedSectionHogar, 'secciones', 'Hogar'],
  ['Descuentos / Perfumería', DiscountedSection, 'descuento_perfumeria'],
  ['Descuentos / Hogar', DiscountedSectionHogar, 'descuento_hogar'],
];

describe.each(cases)('%s', (label, Component, field, section) => {
  test.each([
    ['colores independientes', '#123456', '#aBcDeF'],
    ['sin configurar', undefined, undefined],
    ['campos vacíos', '', null],
    ['valores inválidos', 'red; display:none', 'var(--otro-color)'],
    ['solo cursiva', '#123456', ''],
  ])('%s en respuestas Strapi v5 y v4', async (name, italic, regular) => {
    for (const legacy of [false, true]) {
      const settings = { titulo_cursiva: 'Título cursiva', titulo_normal: 'Título normal', color_titulo_cursiva: italic, color_titulo_normal: regular, productos: [] };
      const attrs = field === 'secciones'
        ? { secciones: [{ ...settings, seccion: section }, { ...settings, seccion: section === 'Hogar' ? 'Perfumeria' : 'Hogar', color_titulo_normal: '#000000' }] }
        : { [field]: settings };
      global.fetch = jest.fn(async url => ({ ok: true, json: async () => ({ data: url.includes('/api/seccion-principal') ? (legacy ? { attributes: attrs } : attrs) : [] }) }));
      const view = render(<MemoryRouter><Component /></MemoryRouter>);
      const heading = await screen.findByRole('heading', { name: 'Título cursiva Título normal' });
      expect(within(heading).getByText('Título cursiva').style.color).toBe(italic === '#123456' ? 'rgb(18, 52, 86)' : '');
      expect(within(heading).getByText('Título normal').style.color).toBe(regular === '#aBcDeF' ? 'rgb(171, 205, 239)' : '');
      view.unmount();
    }
  });
});

test.each([false, true])('barra superior usa colores independientes por ítem en escritorio y celular (v4=%s)', async legacy => {
  const attrs = { color_texto: '#000000', items: [
    { texto: 'Mensaje de prueba', enlace: '/sucursales', icono: 'pin', color_texto: '#123456' },
    { texto: 'Segundo mensaje', enlace: '/', color_texto: '#aBcDeF' },
    { texto: 'Sin color', enlace: '/' },
  ] };
  global.fetch = jest.fn(async () => ({ json: async () => ({ data: legacy ? { attributes: attrs } : attrs }) }));
  render(<MemoryRouter><TopBar /></MemoryRouter>);
  const links = (await screen.findAllByText('Mensaje de prueba')).map(text => text.closest('a'));
  expect(links).toHaveLength(3);
  links.forEach(link => expect(link.style.color).toBe('rgb(18, 52, 86)'));
  screen.getAllByText('Segundo mensaje').forEach(text => expect(text.closest('a').style.color).toBe('rgb(171, 205, 239)'));
  screen.getAllByText('Sin color').forEach(text => expect(text.closest('a').style.color).toBe(''));
});

test.each([undefined, null, '', '#no-valido'])('barra superior conserva su estilo con color %s', async color => {
  global.fetch = jest.fn(async () => ({ json: async () => ({ data: { items: [{ texto: 'Sin personalizar', enlace: '/', color_texto: color }] } }) }));
  render(<MemoryRouter><TopBar /></MemoryRouter>);
  const links = await screen.findAllByRole('link', { name: 'Sin personalizar' });
  links.forEach(link => expect(link.style.color).toBe(''));
});
