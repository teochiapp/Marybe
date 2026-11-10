import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import axios from 'axios';
import BannersAdmin from './BannersAdmin';
import { deviceDesign, imageUrl, safeBannerLink } from '../../utils/bannerDesign';
jest.mock('axios');
jest.mock('react-router-dom', () => ({ Link: ({ children }) => <span>{children}</span> }), { virtual: true });
const group = { documentId: 'promo-1', updatedAt: 'v1', titulo: 'Campaña inicial', seccion: 'Perfumería', Filas: [{ id: 1, __component: 'layout.fila-1-columna', banners: [{ id: 2, titulo: 'Campaña inicial', imagen_desktop: { id: 3, url: '/uploads/test.webp' }, diseno: { desktop: { height: 480 }, mobile: { height: 280 } } }] }] };
beforeEach(() => {
  localStorage.clear(); sessionStorage.clear(); jest.clearAllMocks();
  sessionStorage.setItem('marybe-banner-inspector-blocks', JSON.stringify({ size: true, more: true, visibility: true }));
  global.ResizeObserver = class { observe() {} disconnect() {} };
  localStorage.setItem('admin_jwt', 'fixture-token');
  axios.get.mockResolvedValue({ data: { data: { promotions: [group], main: { documentId: 'main-1', updatedAt: 'm1' } } } });
  axios.put.mockImplementation(async (url, body) => ({ data: { data: { ...body.data, documentId: body.data.documentId || `created-${axios.put.mock.calls.length}`, updatedAt: 'v2' } } }));
});
test('prioriza imagen y destino, recuerda bloques y muestra ajustes según el contenido', async () => {
  sessionStorage.removeItem('marybe-banner-inspector-blocks');
  const { unmount } = render(<BannersAdmin />);
  fireEvent.click(await screen.findByRole('button', { name: 'Editar banner: Campaña inicial' }));
  expect(screen.getByRole('button', { name: 'Cambiar imagen · Computadora' })).toBeVisible();
  expect(screen.getByRole('combobox', { name: 'Ajuste de imagen' })).toHaveDisplayValue('Mostrar imagen completa');
  expect(screen.getByLabelText('Destino al hacer clic')).toBeVisible();
  expect(screen.getByRole('spinbutton', { name: 'Alto' })).not.toBeVisible();
  expect(screen.queryByText('Diseño de textos')).toBeNull();
  fireEvent.click(screen.getByText('Tamaño y encuadre · Computadora'));
  expect(screen.getByRole('spinbutton', { name: 'Alto' })).toBeVisible();
  fireEvent.click(screen.getByLabelText('Mostrar textos sobre la imagen'));
  expect(screen.getByLabelText('Descripción')).toBeVisible();
  expect(screen.getByText('Diseño de textos')).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Distribución', exact: true }));
  fireEvent.click(screen.getByRole('button', { name: 'Banner', exact: true }));
  expect(screen.getByRole('spinbutton', { name: 'Alto' })).toBeVisible();
  unmount();
  render(<BannersAdmin />);
  expect(await screen.findByRole('spinbutton', { name: 'Alto' })).toBeVisible();
});
test('abre Distribución y recupera el banner seleccionado al volver', async () => {
  const { unmount } = render(<BannersAdmin />);
  await screen.findByRole('combobox', { name: 'Plantilla de distribución' });
  expect(screen.getByText('1. Distribución')).toHaveClass('is-active');
  expect(screen.getByText('Distribución 1 · Banner 1')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Editar banner: Campaña inicial' }));
  expect(screen.getByText('2. Banner')).toHaveClass('is-active');
  unmount();
  render(<BannersAdmin />);
  await screen.findByLabelText('Nombre del banner / título');
  expect(screen.getByText('2. Banner')).toHaveClass('is-active');
});

test('restablece solo un campo del dispositivo y lo conserva al reabrir', async () => {
  const configured = JSON.parse(JSON.stringify(group));
  configured.Filas[0].banners[0].diseno = { desktop: { height: 480 }, tablet: { height: 400 }, mobile: { height: 300, positionX: 24, fontSize: 36 } };
  axios.get.mockResolvedValue({ data: { data: { promotions: [configured] } } });
  const { unmount } = render(<BannersAdmin />);
  fireEvent.click(await screen.findByRole('button', { name: 'Editar banner: Campaña inicial' }));
  fireEvent.click(screen.getByRole('button', { name: 'Celular' }));
  fireEvent.click(screen.getByRole('button', { name: 'Volver a heredar Alto' }));
  expect(screen.getByRole('spinbutton', { name: 'Alto' })).toHaveValue(400);
  expect(screen.getByRole('spinbutton', { name: 'Encuadre horizontal' })).toHaveValue(24);
  fireEvent.click(screen.getByRole('button', { name: 'Deshacer' }));
  expect(screen.getByRole('spinbutton', { name: 'Alto' })).toHaveValue(300);
  fireEvent.click(screen.getByRole('button', { name: 'Rehacer' }));
  fireEvent.click(screen.getByRole('button', { name: 'Guardar borrador' }));
  await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
  const saved = axios.put.mock.calls[0][1].data;
  expect(saved.Filas[0].banners[0].diseno.mobile).toEqual({ positionX: 24, fontSize: 36 });
  await screen.findByText('Borrador guardado. La web sigue mostrando la última publicación.');
  unmount();
  axios.get.mockResolvedValue({ data: { data: { promotions: [saved] } } });
  render(<BannersAdmin />);
  await screen.findByRole('spinbutton', { name: 'Alto' });
  fireEvent.click(screen.getByRole('button', { name: 'Celular' }));
  expect(screen.getByRole('spinbutton', { name: 'Alto' })).toHaveValue(400);
  expect(screen.queryByRole('button', { name: 'Volver a heredar Alto' })).toBeNull();
});

test('guarda el encuadre como una acción y sale del modo con Escape', async () => {
  render(<BannersAdmin />);
  fireEvent.click(await screen.findByRole('button', { name: 'Editar banner: Campaña inicial' }));
  fireEvent.click(screen.getByRole('button', { name: 'Celular' }));
  fireEvent.click(screen.getByRole('button', { name: 'Editar encuadre' }));
  const frame = screen.getByTitle('Vista previa de banners');
  fireEvent(window, new MessageEvent('message', { origin: window.location.origin, source: frame.contentWindow, data: { type: 'MARYBE_BANNERS_FOCAL', row: 0, banner: 0, value: { positionX: 23, positionY: 65 } } }));
  expect(screen.getByRole('spinbutton', { name: 'Encuadre horizontal' })).toHaveValue(23);
  fireEvent.click(screen.getByRole('button', { name: 'Deshacer' }));
  expect(screen.getByRole('spinbutton', { name: 'Encuadre horizontal' })).toHaveValue(50);
  fireEvent.click(screen.getByRole('button', { name: 'Rehacer' }));
  expect(screen.getByRole('spinbutton', { name: 'Encuadre horizontal' })).toHaveValue(23);
  fireEvent.keyDown(window, { key: 'Escape' });
  expect(screen.getByRole('button', { name: 'Editar encuadre' })).toHaveAttribute('aria-pressed', 'false');
});

test('configura las opciones del carrusel en un borrador', async () => {
  render(<BannersAdmin />);
  fireEvent.change(await screen.findByRole('combobox', { name: 'Tipo de presentación' }), { target: { value: 'carousel' } });
  expect(screen.getByRole('spinbutton', { name: 'Intervalo en segundos' })).toHaveValue(7);
  fireEvent.change(screen.getByRole('spinbutton', { name: 'Intervalo en segundos' }), { target: { value: '5' } });
  fireEvent.change(screen.getByRole('combobox', { name: 'Indicador' }), { target: { value: 'puntos' } });
  fireEvent.click(screen.getByRole('checkbox', { name: 'Mostrar parte del próximo banner' }));
  fireEvent.click(screen.getByRole('button', { name: 'Guardar borrador' }));
  await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
  expect(axios.put.mock.calls[0][1].data.Filas[0].config_carrusel).toEqual({ autoplay: true, intervalo: 5, indicador: 'puntos', vistaParcial: true });
  expect(axios.put.mock.calls[0][1].publish).toBe(false);
});

test('la distribución libre permite ajustar y ordenar sin perder los banners al cambiar plantilla', async () => {
  const second = { ...group.Filas[0].banners[0], id: 4, titulo: 'Segundo banner', ancho_porcentaje: 40 };
  axios.get.mockResolvedValue({ data: { data: { promotions: [{ ...group, Filas: [{ ...group.Filas[0], banners: [group.Filas[0].banners[0], second] }] }] } } });
  render(<BannersAdmin />);
  fireEvent.change(await screen.findByRole('combobox', { name: 'Plantilla de distribución' }), { target: { value: 'layout.fila-mixta' } });
  fireEvent.change(screen.getByRole('spinbutton', { name: 'Porcentaje de Segundo banner' }), { target: { value: '35' } });
  fireEvent.click(screen.getByRole('button', { name: 'Mover Segundo banner antes' }));
  fireEvent.change(screen.getByRole('combobox', { name: 'Plantilla de distribución' }), { target: { value: 'layout.fila-4-columnas' } });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar borrador' }));
  await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
  const row = axios.put.mock.calls[0][1].data.Filas[0];
  expect(row.banners.map(item => item.titulo)).toEqual(['Segundo banner', 'Campaña inicial']);
  expect(row.banners[0].ancho_porcentaje).toBe(35);
  expect(row.banners[0].diseno.desktop.height).toBe(480);
});
test('editar celular no pisa el alto de PC; borrador y publicación son acciones diferenciadas', async () => {
  render(<BannersAdmin />);
  fireEvent.click((await screen.findAllByRole('button', { name: /^Editar banner:/ }))[0]);
  fireEvent.click(screen.getByRole('button', { name: 'Celular' }));
  fireEvent.change(screen.getByRole('spinbutton', { name: 'Alto' }), { target: { value: '350' } });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar borrador' }));
  await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
  const body = axios.put.mock.calls[0][1];
  expect(body.publish).toBe(false);
  expect(body.version).toBe('v1');
  expect(body.data.Filas[0].banners[0].diseno).toEqual(expect.objectContaining({ desktop: { height: 480 }, mobile: { height: 350 } }));
  await screen.findByText('Borrador guardado. La web sigue mostrando la última publicación.');
  fireEvent.click(screen.getByRole('button', { name: 'Publicar en la tienda' }));
  await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(2));
  expect(axios.put.mock.calls[1][1].publish).toBe(true);
  expect(axios.put.mock.calls[1][1].version).toBe('v2');
});
test('duplicar y deshacer recupera la estructura de filas', async () => {
  render(<BannersAdmin />);
  fireEvent.click((await screen.findAllByRole('button', { name: /^Editar banner:/ }))[0]);
  fireEvent.click(screen.getByRole('button', { name: 'Distribución', exact: true }));
  fireEvent.click(screen.getByRole('button', { name: 'Acciones de distribución 1' }));
  fireEvent.click(screen.getByRole('menuitem', { name: 'Duplicar distribución' }));
  expect(screen.getByRole('combobox', { name: 'Distribución activa' }).options).toHaveLength(2);
  fireEvent.click(screen.getByRole('button', { name: 'Deshacer' }));
  expect(screen.queryByRole('combobox', { name: 'Distribución activa' })).toBeNull();
});
test('medios absolutos, fallback responsive y enlaces seguros', () => {
  expect(imageUrl({ url: 'https://cdn.test/photo.webp' })).toBe('https://cdn.test/photo.webp');
  expect(imageUrl({ url: '/uploads/test.webp' }, 'https://cms.test')).toBe('https://cms.test/uploads/test.webp');
  expect(imageUrl({ url: '/inicio/giftcard.webp' })).toBe('/inicio/giftcard.webp');
  // eslint-disable-next-line no-script-url -- Verify that executable URLs are rejected.
  expect(safeBannerLink('javascript:alert(1)')).toBe('');
  expect(deviceDesign({ desktop: { height: 500, color: '#112233' }, mobile: { height: 250 } }, 'mobile').color).toBe('#112233');
});
test('el editor ofrece únicamente grupos principales y nunca guarda piezas secundarias', async () => {
  render(<BannersAdmin />);
  fireEvent.click((await screen.findAllByRole('button', { name: /^Editar banner:/ }))[0]);
  const structure = screen.getByRole('navigation', { name: 'Estructura de banners' });
  expect(within(structure).getAllByRole('button', { name: /^Editar sección:/ })).toHaveLength(1);
  expect(screen.queryByText('Otras piezas del inicio')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Guardar borrador' }));
  await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
  expect(axios.put.mock.calls[0][0]).toMatch(/\/banners-admin\/promociones\/promo-1$/);
});
test('sin grupos principales muestra creación, aunque existan otras piezas en Inicio', async () => {
  axios.get.mockResolvedValue({ data: { data: { promotions: [], main: { documentId: 'main-1', banners_visuales: { published: { gift_perfumeria: { titulo: 'Gift Card' } } } } } } });
  render(<BannersAdmin />);
  await screen.findByRole('heading', { name: 'Creá tu primera sección de banners' });
  expect(screen.queryByText('Gift Card')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Crear sección' }));
  expect(screen.getByRole('combobox', { name: 'Plantilla de distribución' })).toBeTruthy();
  expect(screen.getByText('○ Sección nueva')).toBeTruthy();
});
test('restablecer la fila permite volver a cambiar su distribución', async () => {
  render(<BannersAdmin />);
  fireEvent.click((await screen.findAllByRole('button', { name: /^Editar banner:/ }))[0]);
  fireEvent.click(screen.getByRole('button', { name: 'Distribución', exact: true }));
  fireEvent.click(screen.getByRole('button', { name: 'Restablecer ajustes de computadora' }));
  fireEvent.change(screen.getByRole('combobox', { name: 'Plantilla de distribución' }), { target: { value: 'layout.fila-2-columnas' } });
  expect(screen.getByRole('spinbutton', { name: 'Columnas' }).value).toBe('2');
  fireEvent.click(screen.getByRole('button', { name: 'Guardar borrador' }));
  await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
  expect(axios.put.mock.calls[0][1].data.Filas[0].diseno.desktop.columns).toBe(2);
});
test('vista previa ampliada permite cambiar dispositivo y volver sin guardar ni publicar', async () => {
  render(<BannersAdmin />);
  fireEvent.click((await screen.findAllByRole('button', { name: /^Editar banner:/ }))[0]);
  fireEvent.change(screen.getByRole('spinbutton', { name: 'Alto' }), { target: { value: '555' } });
  fireEvent.click(screen.getByRole('button', { name: 'Vista previa', exact: true }));
  const dialog = screen.getByRole('dialog', { name: 'Campaña inicial' });
  expect(within(dialog).getByTitle('Vista previa limpia de banners')).toBeTruthy();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Celular' }));
  expect(within(dialog).getByRole('button', { name: 'Celular' }).getAttribute('aria-pressed')).toBe('true');
  fireEvent.click(within(dialog).getByRole('button', { name: 'Tamaño real 100%' }));
  expect(within(dialog).getByText('390 px · 100%')).toBeTruthy();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Volver al editor' }));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(screen.getByRole('spinbutton', { name: 'Alto' }).value).toBe('555');
  expect(axios.put).not.toHaveBeenCalled();
});
test('Escape cierra la vista previa y conserva el trabajo local', async () => {
  render(<BannersAdmin />);
  fireEvent.click((await screen.findAllByRole('button', { name: /^Editar banner:/ }))[0]);
  fireEvent.click(screen.getByRole('button', { name: 'Vista previa', exact: true }));
  expect(document.body.style.overflow).toBe('hidden');
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(document.body.style.overflow).not.toBe('hidden');
  expect(axios.put).not.toHaveBeenCalled();
});

test('cambiar de área conserva borradores independientes, historial y aviso de cambios pendientes', async () => {
  const home = { ...group, documentId: 'home-1', seccion: 'Hogar', titulo: 'Hogar principal' };
  axios.get.mockResolvedValue({ data: { data: { promotions: [group, home] } } });
  render(<BannersAdmin />);
  fireEvent.click((await screen.findAllByRole('button', { name: /^Editar banner:/ }))[0]);
  fireEvent.change(screen.getByRole('spinbutton', { name: 'Alto' }), { target: { value: '555' } });
  fireEvent.click(screen.getByRole('button', { name: 'Hogar', exact: true }));
  expect(screen.queryByRole('button', { name: 'Editar sección: Campaña inicial' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Editar banner: Campaña inicial' }));
  expect(screen.getByRole('spinbutton', { name: 'Alto' }).value).toBe('480');
  const warning = new Event('beforeunload', { cancelable: true });
  fireEvent(window, warning);
  expect(warning.defaultPrevented).toBe(true);
  fireEvent.change(screen.getByRole('spinbutton', { name: 'Alto' }), { target: { value: '444' } });
  fireEvent.click(screen.getByRole('button', { name: 'Perfumería', exact: true }));
  expect(screen.getByRole('spinbutton', { name: 'Alto' }).value).toBe('555');
  fireEvent.click(screen.getByRole('button', { name: 'Deshacer' }));
  expect(screen.getByRole('spinbutton', { name: 'Alto' }).value).toBe('480');
  fireEvent.click(screen.getByRole('button', { name: 'Rehacer' }));
  expect(screen.getByRole('spinbutton', { name: 'Alto' }).value).toBe('555');
  fireEvent.click(screen.getByRole('button', { name: 'Hogar', exact: true }));
  expect(screen.getByRole('spinbutton', { name: 'Alto' }).value).toBe('444');
  expect(axios.put).not.toHaveBeenCalled();
});

test('menú contextual renombra, mueve, oculta, duplica y elimina el banner elegido', async () => {
  const second = { ...group.Filas[0].banners[0], id: 3, titulo: 'Segundo banner' };
  axios.get.mockResolvedValue({ data: { data: { promotions: [{ ...group, Filas: [{ ...group.Filas[0], banners: [group.Filas[0].banners[0], second] }] }] } } });
  render(<BannersAdmin />);
  fireEvent.click((await screen.findAllByRole('button', { name: /^Editar banner:/ }))[0]);
  fireEvent.click(screen.getByRole('button', { name: 'Acciones de banner: Segundo banner' }));
  fireEvent.click(screen.getByRole('menuitem', { name: 'Renombrar banner' }));
  fireEvent.change(screen.getByLabelText('Nombre del banner / título'), { target: { value: 'Oferta de temporada' } });
  const open = () => fireEvent.click(screen.getByRole('button', { name: 'Acciones de banner: Oferta de temporada' }));
  open(); fireEvent.click(screen.getByRole('menuitem', { name: 'Mover antes' }));
  open(); fireEvent.click(screen.getByRole('menuitem', { name: 'Ocultar banner' }));
  expect(screen.getByLabelText('Banner activo en todos los dispositivos').checked).toBe(false);
  open(); fireEvent.click(screen.getByRole('menuitem', { name: 'Duplicar banner' }));
  expect(screen.getAllByRole('button', { name: 'Editar banner: Oferta de temporada' })).toHaveLength(2);
  fireEvent.click(screen.getAllByRole('button', { name: 'Acciones de banner: Oferta de temporada' })[1]);
  fireEvent.click(screen.getByRole('menuitem', { name: 'Eliminar banner' }));
  expect(screen.getAllByRole('button', { name: 'Editar banner: Oferta de temporada' })).toHaveLength(1);
  fireEvent.click(screen.getByRole('button', { name: 'Guardar borrador' }));
  await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
  const banners = axios.put.mock.calls[0][1].data.Filas[0].banners;
  expect(banners.map(banner => banner.titulo)).toEqual(['Oferta de temporada', 'Campaña inicial']);
  expect(banners[0].activo).toBe(false);
  expect(axios.put.mock.calls[0][1].publish).toBe(false);
});

test('el árbol se expande y se selecciona al hacer clic en el lienzo, y envía su selección al iframe', async () => {
  const second = { ...group.Filas[0].banners[0], id: 3, titulo: 'Segundo banner' };
  axios.get.mockResolvedValue({ data: { data: { promotions: [{ ...group, Filas: [{ ...group.Filas[0], banners: [group.Filas[0].banners[0], second] }] }] } } });
  render(<BannersAdmin />);
  fireEvent.click((await screen.findAllByRole('button', { name: /^Editar banner:/ }))[0]);
  fireEvent.click(screen.getByRole('button', { name: 'Contraer Campaña inicial' }));
  expect(screen.queryByRole('button', { name: 'Editar banner: Segundo banner' })).toBeNull();
  const frame = screen.getByTitle('Vista previa de banners');
  const post = jest.spyOn(frame.contentWindow, 'postMessage');
  fireEvent(window, new MessageEvent('message', { origin: window.location.origin, source: frame.contentWindow, data: { type: 'MARYBE_BANNERS_SELECT', row: 0, banner: 1 } }));
  const selected = await screen.findByRole('button', { name: 'Editar banner: Segundo banner' });
  expect(selected.getAttribute('aria-pressed')).toBe('true');
  expect(screen.getByLabelText('Nombre del banner / título').value).toBe('Segundo banner');
  fireEvent.click(screen.getByRole('button', { name: 'Editar banner: Campaña inicial' }));
  await waitFor(() => expect(post).toHaveBeenCalledWith(expect.objectContaining({ type: 'MARYBE_BANNERS_PREVIEW', payload: expect.objectContaining({ selected: { row: 0, banner: 0 } }) }), window.location.origin));
  post.mockRestore();
});

test('menú accesible cierra con Escape y protege el último banner', async () => {
  render(<BannersAdmin />);
  fireEvent.click((await screen.findAllByRole('button', { name: /^Editar banner:/ }))[0]);
  const trigger = screen.getByRole('button', { name: 'Acciones de banner: Campaña inicial' });
  fireEvent.click(trigger);
  expect(screen.getByRole('menuitem', { name: 'Eliminar banner' }).disabled).toBe(true);
  expect(screen.getByRole('menuitem', { name: 'Mover antes' }).disabled).toBe(true);
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(screen.queryByRole('menu')).toBeNull();
  expect(trigger).toHaveFocus();
  expect(axios.put).not.toHaveBeenCalled();
});

test('crear una sección usa el área elegida, y duplicar conserva diseño sin reutilizar IDs', async () => {
  render(<BannersAdmin />);
  fireEvent.click((await screen.findAllByRole('button', { name: /^Editar banner:/ }))[0]);
  fireEvent.click(screen.getByRole('button', { name: 'Hogar', exact: true }));
  fireEvent.click(screen.getByRole('button', { name: /Agregar sección/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Guardar borrador' }));
  await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
  expect(axios.put.mock.calls[0][1].data.seccion).toBe('Hogar');
  fireEvent.click(screen.getByRole('button', { name: 'Perfumería', exact: true }));
  fireEvent.click(screen.getByRole('button', { name: 'Acciones de sección: Campaña inicial' }));
  fireEvent.click(screen.getByRole('menuitem', { name: 'Duplicar sección' }));
  fireEvent.click(screen.getByRole('button', { name: 'Guardar borrador' }));
  await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(2));
  const copied = axios.put.mock.calls[1][1].data;
  expect(axios.put.mock.calls[1][0]).toMatch(/\/promociones\/new$/);
  expect(copied.titulo).toBe('Campaña inicial (copia)');
  expect(copied.Filas[0].id).toBeUndefined();
  expect(copied.Filas[0].banners[0].id).toBeUndefined();
  expect(copied.Filas[0].banners[0].diseno.desktop.height).toBe(480);
});

test('vuelve a la última sección del área y permite ajustar el alto de toda la distribución por dispositivo', async () => {
  const second = { ...group, documentId: 'promo-2', titulo: 'Promociones de temporada', Filas: [{ ...group.Filas[0], banners: [group.Filas[0].banners[0], { ...group.Filas[0].banners[0], id: 3, titulo: 'Segundo banner' }] }] };
  const home = { ...group, documentId: 'home-1', seccion: 'Hogar', titulo: 'Hogar principal' };
  axios.get.mockResolvedValue({ data: { data: { promotions: [group, second, home] } } });
  render(<BannersAdmin />);
  fireEvent.click((await screen.findAllByRole('button', { name: /^Editar banner:/ }))[0]);
  fireEvent.click(screen.getByRole('button', { name: 'Editar sección: Promociones de temporada' }));
  fireEvent.click(screen.getByRole('button', { name: 'Celular' }));
  fireEvent.change(screen.getByRole('spinbutton', { name: 'Alto de los banners' }), { target: { value: '345' } });
  fireEvent.click(screen.getByRole('button', { name: 'Hogar', exact: true }));
  fireEvent.click(screen.getByRole('button', { name: 'Perfumería', exact: true }));
  expect(screen.getByRole('button', { name: 'Editar banner: Segundo banner' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Guardar borrador' }));
  await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
  const body = axios.put.mock.calls[0][1];
  expect(body.data.documentId).toBe('promo-2');
  body.data.Filas[0].banners.forEach(banner => {
    expect(banner.diseno.mobile.height).toBe(345);
    expect(banner.diseno.desktop.height).toBe(480);
  });
});

test('the preview edge updates the active device width', async () => {
  render(<BannersAdmin />);
  fireEvent.click((await screen.findAllByRole('button', { name: /^Editar banner:/ }))[0]);
  fireEvent.click(screen.getByRole('button', { name: 'Celular' }));
  const frame = screen.getByTitle('Vista previa de banners');
  fireEvent(window, new MessageEvent('message', { origin: window.location.origin, source: frame.contentWindow, data: { type: 'MARYBE_BANNERS_RESIZE', row: 0, banner: 0, value: 64 } }));
  expect(screen.getByRole('spinbutton', { name: 'Ancho del banner' }).value).toBe('64');
  fireEvent.click(screen.getByRole('button', { name: 'Guardar borrador' }));
  await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
  const design = axios.put.mock.calls[0][1].data.Filas[0].banners[0].diseno;
  expect(design.mobile.width).toBe(64);
  expect(design.desktop.width).toBeUndefined();
});

test('el lienzo reordena el borrador y ajusta el alto solo en el dispositivo activo', async () => {
  const configured = JSON.parse(JSON.stringify(group));
  configured.Filas[0].banners.push({ id: 7, titulo: 'Segundo' }, { id: 8, titulo: 'Tercero' });
  axios.get.mockResolvedValue({ data: { data: { promotions: [configured] } } });
  render(<BannersAdmin />);
  await screen.findByRole('button', { name: 'Editar banner: Tercero' });
  fireEvent.click(screen.getByRole('button', { name: 'Celular' }));
  const frame = screen.getByTitle('Vista previa de banners');
  const send = data => fireEvent(window, new MessageEvent('message', { origin: window.location.origin, source: frame.contentWindow, data: { row: 0, source: 'promo-1', ...data } }));
  const order = () => screen.getAllByRole('button', { name: /^Editar banner:/ }).map(button => button.getAttribute('aria-label'));
  send({ type: 'MARYBE_BANNERS_REORDER', from: 0, to: 2 });
  expect(order()).toEqual(['Editar banner: Segundo', 'Editar banner: Tercero', 'Editar banner: Campaña inicial']);
  const height = screen.getByRole('spinbutton', { name: 'Alto' });
  send({ type: 'MARYBE_BANNERS_RESIZE', dimension: 'height', banner: 2, device: 'desktop', value: 325 });
  expect(height).toHaveValue(280);
  send({ type: 'MARYBE_BANNERS_RESIZE', dimension: 'height', banner: 2, device: 'mobile', value: 325 });
  expect(height).toHaveValue(325);
  fireEvent.click(screen.getByRole('button', { name: 'Deshacer' }));
  expect(height).toHaveValue(280);
  fireEvent.click(screen.getByRole('button', { name: 'Deshacer' }));
  expect(order()[0]).toBe('Editar banner: Campaña inicial');
  fireEvent.click(screen.getByRole('button', { name: 'Rehacer' }));
  fireEvent.click(screen.getByRole('button', { name: 'Rehacer' }));
  fireEvent.click(screen.getByRole('button', { name: 'Guardar borrador' }));
  await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
  const { data, publish } = axios.put.mock.calls[0][1];
  expect(publish).toBe(false);
  expect(data.Filas[0].banners.map(banner => banner.id)).toEqual([7, 8, 2]);
  expect(data.Filas[0].banners[2].diseno).toEqual({ desktop: { height: 480 }, mobile: { height: 325 } });
});

test('banners uses the shared administrative login panel', async () => {
  localStorage.removeItem('admin_jwt');
  axios.post.mockResolvedValue({ data: { jwt: 'new-admin-token' } });
  render(<BannersAdmin />);
  expect(screen.getByText('Panel de Banners')).toBeTruthy();
  fireEvent.change(screen.getByLabelText('Email administrador'), { target: { value: 'admin@marybe.com' } });
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'clave-segura' } });
  fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
  await waitFor(() => expect(axios.post).toHaveBeenCalledWith(expect.stringMatching(/\/api\/importacion-admin\/login$/), { identifier: 'admin@marybe.com', password: 'clave-segura' }));
  expect(localStorage.getItem('admin_jwt')).toBe('new-admin-token');
});

test('the section menu deletes a saved section after confirmation', async () => {
  const confirm = jest.spyOn(window, 'confirm').mockReturnValue(true);
  axios.delete.mockResolvedValue({ data: { data: { documentId: 'promo-1' } } });
  render(<BannersAdmin />);
  fireEvent.click((await screen.findAllByRole('button', { name: /^Editar banner:/ }))[0]);
  fireEvent.click(screen.getByRole('button', { name: 'Acciones de sección: Campaña inicial' }));
  fireEvent.click(screen.getByRole('menuitem', { name: 'Eliminar sección' }));
  await waitFor(() => expect(axios.delete).toHaveBeenCalledWith(expect.stringMatching(/\/api\/banners-admin\/promociones\/promo-1$/), expect.objectContaining({ data: { version: 'v1' } })));
  expect(screen.getByRole('heading', { name: 'Creá tu primera sección de banners' })).toBeTruthy();
  confirm.mockRestore();
});
