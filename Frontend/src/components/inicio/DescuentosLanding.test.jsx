import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DiscountedSection from './perfumeria/DiscountedSection';
import DiscountedSectionHogar from './hogar/DiscountedSectionHogar';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>,
}), { virtual: true });
jest.mock('../../hooks/useConfiguracionGeneral', () => ({ useConfiguracionGeneral: () => ({ config: {} }) }));
jest.mock('../shared/FavoriteButton', () => () => null);
jest.mock('../carrito/AddToCartModal', () => () => null);

const bloque = (extra = {}) => ({
  entidad_tipo: '', entidad_id: '', entidad_nombre: '', entidad_seccion: '',
  texto_superior: 'Solo esta semana', titulo_cursiva: 'Promo', titulo_normal: 'especial',
  color_titulo_cursiva: '', color_titulo_normal: '', imagen: null,
  boton_texto: 'Ver más', boton_modo: 'auto', boton_enlace: '', ...extra,
});

// Responde por URL: la configuración del editor, la categoría actual y los datos originales del componente.
function mockStrapi({ descuentos = {}, categorias = [], componente = {} } = {}) {
  global.fetch = jest.fn(async url => {
    let data = [];
    if (url.includes('/api/seccion-principal?fields[0]=diseno_secciones')) data = { diseno_secciones: { descuentos } };
    else if (url.includes('/api/seccion-principal')) data = { descuento_perfumeria: { titulo_cursiva: 'Descuentos', titulo_normal: 'de Miércoles', productos: [], ...componente }, descuento_hogar: { titulo_cursiva: 'Descuentos', titulo_normal: 'de Hogar', productos: [] } };
    else if (url.includes('/api/categorias')) data = categorias;
    return { ok: true, json: async () => ({ data }) };
  });
}

const originalFetch = global.fetch;
const originalLocation = window.location;
afterEach(() => {
  global.fetch = originalFetch;
  mockNavigate.mockClear();
  Object.defineProperty(window, 'location', { value: originalLocation, writable: true, configurable: true });
});

describe.each([
  ['Perfumería', DiscountedSection, 'bloque-1', '/tienda?descuento=todas&seccion=Perfumer%C3%ADa', '/inicio/discountedSection.webp'],
  ['Hogar', DiscountedSectionHogar, 'bloque-2', '/tienda?descuento=todas&seccion=Hogar', '/inicio/discountedSectionHogar.webp'],
])('Descuentos / %s', (label, Component, key, defaultUrl, defaultImage) => {
  const renderBlock = props => render(<Component {...props} />);

  test('sin configuración conserva textos, imagen y enlace originales', async () => {
    mockStrapi();
    renderBlock({ seccion: label === 'Hogar' ? 'hogar' : 'perfumeria' });
    expect(await screen.findByText('Envíos a todo el país')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Descuentos/ })).toHaveAttribute('src', defaultImage);
    fireEvent.click(screen.getByText('Conocer más'));
    expect(mockNavigate).toHaveBeenCalledWith(defaultUrl);
  });

  test('aplica los textos, la imagen y el botón publicados del bloque', async () => {
    mockStrapi({ descuentos: { [key]: bloque({ imagen: { id: 9, url: '/uploads/promo.webp' }, entidad_tipo: 'marca', entidad_id: 'Loreal', entidad_nombre: 'Loreal' }) } });
    renderBlock({ seccion: label === 'Hogar' ? 'hogar' : 'perfumeria' });
    expect(await screen.findByText('Solo esta semana')).toBeInTheDocument();
    expect(screen.getByText('Promo')).toBeInTheDocument();
    expect(screen.getByText('especial')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Promo especial' })).toHaveAttribute('src', expect.stringContaining('/uploads/promo.webp'));
    fireEvent.click(screen.getByText('Ver más'));
    expect(mockNavigate).toHaveBeenCalledWith('/tienda?marca=Loreal');
  });

  test('un enlace personalizado interno navega y uno externo abre esa URL', async () => {
    mockStrapi({ descuentos: { [key]: bloque({ boton_modo: 'personalizado', boton_enlace: '/sucursales' }) } });
    const first = renderBlock({ seccion: label === 'Hogar' ? 'hogar' : 'perfumeria' });
    fireEvent.click(await screen.findByText('Ver más'));
    expect(mockNavigate).toHaveBeenCalledWith('/sucursales');
    first.unmount();

    const assign = jest.fn();
    Object.defineProperty(window, 'location', { value: { ...originalLocation, assign }, writable: true, configurable: true });
    mockStrapi({ descuentos: { [key]: bloque({ boton_modo: 'personalizado', boton_enlace: 'https://marybe.com.ar/promo' }) } });
    renderBlock({ seccion: label === 'Hogar' ? 'hogar' : 'perfumeria' });
    fireEvent.click(await screen.findByText('Ver más'));
    expect(assign).toHaveBeenCalledWith('https://marybe.com.ar/promo');
  });

  test('un enlace inválido o un proveedor sin página vuelven al enlace original', async () => {
    mockStrapi({ descuentos: { [key]: bloque({ boton_modo: 'personalizado', boton_enlace: 'javascript:alert(1)', entidad_tipo: 'proveedor', entidad_id: 'Prov A' }) } });
    renderBlock({ seccion: label === 'Hogar' ? 'hogar' : 'perfumeria' });
    fireEvent.click(await screen.findByText('Ver más'));
    expect(mockNavigate).toHaveBeenCalledWith(defaultUrl);
  });

  test('una categoría elegida usa su nombre actual y, si ya no existe, el enlace original', async () => {
    mockStrapi({ descuentos: { [key]: bloque({ entidad_tipo: 'categoria', entidad_id: 'cat1', entidad_nombre: 'Nombre viejo', entidad_seccion: 'Hogar' }) }, categorias: [{ documentId: 'cat1', nombre: 'Maquillaje', seccion: 'Perfumería' }] });
    const first = renderBlock({ seccion: label === 'Hogar' ? 'hogar' : 'perfumeria' });
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/categorias?filters[documentId][$eq]=cat1')));
    await waitFor(() => {
      fireEvent.click(screen.getByText('Ver más'));
      expect(mockNavigate).toHaveBeenLastCalledWith('/tienda?categoria=Maquillaje&seccion=Perfumer%C3%ADa');
    });
    first.unmount();
    mockNavigate.mockClear();

    mockStrapi({ descuentos: { [key]: bloque({ entidad_tipo: 'categoria', entidad_id: 'cat1', entidad_nombre: 'Nombre viejo' }) }, categorias: [] });
    renderBlock({ seccion: label === 'Hogar' ? 'hogar' : 'perfumeria' });
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/categorias?')));
    await waitFor(() => {
      fireEvent.click(screen.getByText('Ver más'));
      expect(mockNavigate).toHaveBeenLastCalledWith(defaultUrl);
    });
  });

  test('con previewData usa el borrador sin consultar la configuración publicada', async () => {
    mockStrapi();
    renderBlock({ seccion: label === 'Hogar' ? 'hogar' : 'perfumeria', previewData: bloque({ texto_superior: 'Borrador arriba', titulo_cursiva: 'Borrador', entidad_tipo: 'marca', entidad_id: 'Ala', entidad_nombre: 'Ala', boton_texto: 'Botón borrador' }) });
    expect(await screen.findByText('Borrador arriba')).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalledWith(expect.stringContaining('fields[0]=diseno_secciones'));
    expect(screen.getByText('Botón borrador').closest('[data-editor-part]')).toHaveAttribute('data-editor-part', 'boton');
    expect(screen.getByText('Borrador').closest('[data-editor-part]')).toHaveAttribute('data-editor-part', 'texto');
  });

  test('un texto superior vacío no deja un hueco con el texto original', async () => {
    mockStrapi({ descuentos: { [key]: bloque({ texto_superior: '' }) } });
    renderBlock({ seccion: label === 'Hogar' ? 'hogar' : 'perfumeria' });
    await screen.findByText('Promo');
    expect(screen.queryByText('Envíos a todo el país')).toBeNull();
  });

  test('aplica escala, imagen móvil, encuadre, ajuste y desactivación de sombra en la imagen del bloque', async () => {
    mockStrapi({
      descuentos: {
        [key]: bloque({
          imagen: { id: 9, url: '/uploads/promo.webp' },
          imagen_mobile: { id: 10, url: '/uploads/promo-mob.webp' },
          escala_imagen_desktop: 130,
          escala_imagen_mobile: 90,
          imagen_posicion: 'derecha',
          imagen_ajuste: 'cubrir',
          imagen_sombra: false,
        }),
      },
    });
    renderBlock({ seccion: label === 'Hogar' ? 'hogar' : 'perfumeria' });
    const img = await screen.findByRole('img', { name: 'Promo especial' });
    const picture = img.closest('picture');
    expect(picture).toHaveAttribute('data-img-escala', '');
    expect(picture.querySelector('source')).toHaveAttribute('srcset', expect.stringContaining('/uploads/promo-mob.webp'));
    expect(img).toHaveStyle({ objectFit: 'cover', objectPosition: 'right center', filter: 'none' });
  });

  test('consulta y muestra los productos publicados de la entidad promocionada (categoría, marca o proveedor)', async () => {
    global.fetch = jest.fn(async url => {
      if (url.includes('/api/seccion-principal?fields[0]=diseno_secciones')) {
        return { ok: true, json: async () => ({ data: { diseno_secciones: { descuentos: { [key]: bloque({ entidad_tipo: 'proveedor', entidad_id: 'SACCHI HNOS SRL', entidad_nombre: 'SACCHI HNOS SRL' }) } } } }) };
      }
      if (url.includes('/api/productos?filters[publicado][$eq]=true&filters[proveedor][$eq]=SACCHI%20HNOS%20SRL')) {
        return { ok: true, json: async () => ({ data: [{ id: 101, documentId: 'prod-sacchi', nombre: 'Perfume Sacchi Exclusivo', marca: 'Sacchi', precio: 25000 }] }) };
      }
      return { ok: true, json: async () => ({ data: [] }) };
    });
    renderBlock({ seccion: label === 'Hogar' ? 'hogar' : 'perfumeria' });
    expect(await screen.findByText('Perfume Sacchi Exclusivo')).toBeInTheDocument();
  });

  test('no muestra textos ni imagen fallback antes de que responda el backend', () => {
    global.fetch = jest.fn(() => new Promise(() => {}));
    renderBlock({ seccion: label === 'Hogar' ? 'hogar' : 'perfumeria' });
    expect(screen.queryByText('Envíos a todo el país')).toBeNull();
    expect(screen.queryByText('Descuentos')).toBeNull();
    expect(screen.queryByRole('img', { name: /Descuentos/ })).toBeNull();
    expect(screen.queryByText('Conocer más')).toBeNull();
  });
});
