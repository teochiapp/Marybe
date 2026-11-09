import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import DescuentosEditor from './DescuentosEditor';
import { entityOptions, entityStatus, publishProblems, toPreviewData, destinoDeBloque } from './descuentosModel';
import { botonDestino, entidadUrl, descuentosDefaultUrl } from '../../../../../utils/descuentosBloque';

jest.mock('axios');
jest.mock('react-router-dom', () => ({ Link: ({ children }) => <span>{children}</span> }), { virtual: true });
jest.mock('../MediaLibraryDialog', () => ({ onChoose, onClose }) => (
  <div role="dialog" aria-label="Biblioteca">
    <button type="button" onClick={() => onChoose({ id: 9, url: '/uploads/promo.webp', name: 'promo.webp', width: 900, height: 700 })}>Elegir promo.webp</button>
    <button type="button" onClick={onClose}>Cerrar biblioteca</button>
  </div>
));

const base = { entidad_tipo: '', entidad_id: '', entidad_nombre: '', entidad_seccion: '', texto_superior: 'Envíos a todo el país', titulo_cursiva: 'Descuentos', titulo_normal: 'de Miércoles', color_titulo_cursiva: '', color_titulo_normal: '', imagen: null, boton_texto: 'Conocer más', boton_modo: 'auto', boton_enlace: '' };
const second = { ...base, titulo_normal: 'de Hogar' };
const overview = (first = { published: base, draft: null }) => ({ version: 'v1', defaults: { texto_superior: 'Envíos a todo el país', titulo_cursiva: 'Descuentos', boton_texto: 'Conocer más' }, tipos: ['categoria', 'marca', 'proveedor'], areas: { 'bloque-1': first, 'bloque-2': { published: second, draft: null } } });
const entities = {
  categoria: [
    { documentId: 'cat1', nombre: 'Maquillaje', seccion: 'Perfumería', productos: 12, portada: { id: 7, url: '/uploads/maq.png', name: 'maq.png', width: 600, height: 600 } },
    { documentId: 'cat2', nombre: 'Limpieza del Hogar', seccion: 'Hogar', productos: 0, portada: null },
  ],
  marca: [{ nombre: 'Ala', productos: 5 }, { nombre: 'Loreal', productos: 30 }],
  proveedor: [{ nombre: 'Prov A', productos: 9 }],
};

beforeEach(() => {
  jest.clearAllMocks();
  global.ResizeObserver = class { observe() {} disconnect() {} };
  axios.get.mockImplementation(async url => (url.endsWith('/entidades') ? { data: { data: entities } } : { data: { data: overview() } }));
  axios.put.mockImplementation(async (url, body) => ({ data: { data: { ...overview(body.publish ? { published: body.data, draft: null } : { published: base, draft: body.data }), version: 'v2' } } }));
});

const renderEditor = () => render(<DescuentosEditor token="fixture-token" onBack={jest.fn()} onLogout={jest.fn()} />);
const openPart = async name => fireEvent.click(await screen.findByRole('button', { name }));

test('carga los dos bloques con los valores actuales y las entidades de Strapi', async () => {
  renderEditor();
  expect(await screen.findByRole('combobox', { name: /qué querés promocionar/i })).toHaveValue('');
  expect(axios.get).toHaveBeenCalledWith(expect.stringMatching(/\/api\/descuentos-admin$/), { headers: { Authorization: 'Bearer fixture-token' } });
  expect(axios.get).toHaveBeenCalledWith(expect.stringMatching(/\/api\/descuentos-admin\/entidades$/), { headers: { Authorization: 'Bearer fixture-token' } });
  expect(screen.getByTitle('Vista previa de Descuentos')).toHaveAttribute('src', '/editor-inicio-preview');
  expect(screen.getByRole('button', { name: /Bloque 1/ })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Bloque 2/ })).toBeInTheDocument();
});

test('elige un tipo, busca una marca, la guarda como borrador y mantiene los textos independientes', async () => {
  renderEditor();
  fireEvent.change(await screen.findByRole('combobox', { name: /qué querés promocionar/i }), { target: { value: 'marca' } });
  const list = await screen.findByRole('listbox', { name: 'Marcas disponibles' });
  expect(list.querySelectorAll('option')).toHaveLength(2);
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'lore' } });
  expect(screen.getByRole('listbox', { name: 'Marcas disponibles' }).querySelectorAll('option')).toHaveLength(1);
  fireEvent.change(screen.getByRole('listbox', { name: 'Marcas disponibles' }), { target: { value: 'Loreal' } });
  expect(screen.getByText('/tienda?marca=Loreal')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Guardar borrador' }));
  await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
  const [url, body] = axios.put.mock.calls[0];
  expect(url).toMatch(/\/api\/descuentos-admin\/bloque-1$/);
  expect(body.publish).toBe(false);
  expect(body.data).toEqual(expect.objectContaining({ entidad_tipo: 'marca', entidad_id: 'Loreal', titulo_cursiva: 'Descuentos', titulo_normal: 'de Miércoles' }));
});

test('al elegir una categoría ofrece su portada sin modificar la categoría y reemplaza la imagen solo del bloque', async () => {
  renderEditor();
  fireEvent.change(await screen.findByRole('combobox', { name: /qué querés promocionar/i }), { target: { value: 'categoria' } });
  fireEvent.change(await screen.findByRole('listbox', { name: 'Categorías disponibles' }), { target: { value: 'cat1' } });
  fireEvent.click(screen.getByRole('button', { name: /Usar la portada de la categoría/ }));
  expect(await screen.findByAltText('Imagen promocional del bloque')).toHaveAttribute('src', expect.stringContaining('/uploads/maq.png'));
  fireEvent.click(screen.getByRole('button', { name: 'Volver a la imagen original' }));
  fireEvent.click(screen.getByRole('button', { name: 'Elegir imagen de la biblioteca' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Elegir promo.webp' }));
  expect(await screen.findByAltText('Imagen promocional del bloque')).toHaveAttribute('src', expect.stringContaining('/uploads/promo.webp'));
  expect(axios.put).not.toHaveBeenCalled();

  // Ajusta tamaño, imagen de celular, encuadre, ajuste y sombra
  fireEvent.click(screen.getByRole('button', { name: 'Agrandar: Tamaño en computadora y tablet' }));
  fireEvent.click(screen.getByRole('button', { name: 'Elegir imagen · Celular' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Elegir promo.webp' }));
  expect(await screen.findByAltText('Imagen para celular del bloque')).toHaveAttribute('src', expect.stringContaining('/uploads/promo.webp'));
  fireEvent.click(screen.getByRole('radio', { name: /Cubrir/i }));
  fireEvent.click(screen.getByRole('radio', { name: /Derecha/i }));
  fireEvent.click(screen.getByRole('checkbox', { name: /Sombra proyectada detrás de la imagen/i }));
  fireEvent.click(screen.getByRole('button', { name: 'Guardar borrador' }));
  await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
  expect(axios.put.mock.calls[0][1].data).toEqual(expect.objectContaining({
    escala_imagen_desktop: 110,
    imagen_ajuste: 'cubrir',
    imagen_posicion: 'derecha',
    imagen_sombra: false,
  }));
});

test('edita los textos y el botón, y valida el enlace personalizado antes de publicar', async () => {
  renderEditor();
  await openPart(/Textos del bloque/);
  fireEvent.change(screen.getByLabelText('Texto sobre el título'), { target: { value: 'Solo hoy' } });
  fireEvent.change(screen.getByLabelText('Primera parte (cursiva)'), { target: { value: 'Promo' } });
  await openPart(/Botón/);
  fireEvent.change(screen.getByLabelText('Texto del botón'), { target: { value: 'Ver ofertas' } });
  fireEvent.click(screen.getByLabelText('Enlace personalizado'));
  fireEvent.change(screen.getByLabelText('Enlace del botón'), { target: { value: 'javascript:alert(1)' } });
  expect(screen.getAllByRole('alert')[0]).toHaveTextContent('Usá una URL https://');
  fireEvent.click(screen.getByRole('button', { name: 'Publicar cambios' }));
  expect(await screen.findByText(/Antes de publicar: Escribí un enlace válido/)).toBeInTheDocument();
  expect(axios.put).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText('Enlace del botón'), { target: { value: '/tienda?marca=Ala' } });
  fireEvent.click(screen.getByRole('button', { name: 'Publicar cambios' }));
  await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
  expect(axios.put.mock.calls[0][1].data).toEqual(expect.objectContaining({ texto_superior: 'Solo hoy', titulo_cursiva: 'Promo', boton_texto: 'Ver ofertas', boton_modo: 'personalizado', boton_enlace: '/tienda?marca=Ala' }));
});

test('cada bloque es independiente y una entidad no disponible se avisa sin romper el editor', async () => {
  axios.get.mockImplementation(async url => (url.endsWith('/entidades') ? { data: { data: entities } } : { data: { data: overview({ published: { ...base, entidad_tipo: 'categoria', entidad_id: 'borrada', entidad_nombre: 'Borrada' }, draft: null }) } }));
  renderEditor();
  expect(await screen.findByText(/Borrada ya no está disponible/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /Bloque 2/ }));
  expect(await screen.findByRole('combobox', { name: /qué querés promocionar/i })).toHaveValue('');
});

test('los proveedores no generan enlace automático', async () => {
  renderEditor();
  fireEvent.change(await screen.findByRole('combobox', { name: /qué querés promocionar/i }), { target: { value: 'proveedor' } });
  fireEvent.change(await screen.findByRole('listbox', { name: 'Proveedores disponibles' }), { target: { value: 'Prov A' } });
  expect(screen.getByText(/no tienen página pública/)).toBeInTheDocument();
});

test('helpers de entidades, enlaces, vista previa y validación', () => {
  expect(entityOptions(entities, 'categoria', 'hogar').map(item => item.documentId)).toEqual(['cat2']);
  expect(entityOptions(entities, 'marca')).toHaveLength(2);
  const categoria = { ...base, entidad_tipo: 'categoria', entidad_id: 'cat1', entidad_nombre: 'Vieja', entidad_seccion: 'Hogar' };
  expect(entityStatus(categoria, entities)).toBe('ok');
  expect(entityStatus({ ...categoria, entidad_id: 'cat2' }, entities)).toBe('sin-productos');
  expect(entityStatus({ ...categoria, entidad_id: 'x' }, entities)).toBe('inexistente');
  expect(entityStatus(base, entities)).toBe('ninguna');
  expect(toPreviewData(categoria, entities)).toEqual(expect.objectContaining({ entidad_nombre: 'Maquillaje', entidad_seccion: 'Perfumería' }));
  expect(destinoDeBloque(categoria, 'bloque-1', entities)).toBe('/tienda?categoria=Maquillaje&seccion=Perfumer%C3%ADa');
  expect(destinoDeBloque({ ...categoria, entidad_id: 'x' }, 'bloque-2', entities)).toBe('/tienda?descuento=todas&seccion=Hogar');
  expect(publishProblems({ ...base, titulo_cursiva: '', titulo_normal: ' ' }).map(problem => problem.part)).toEqual(['texto']);
  expect(publishProblems({ ...base, boton_modo: 'personalizado', boton_enlace: '//x.com' }).map(problem => problem.part)).toEqual(['boton']);
  expect(publishProblems(base)).toEqual([]);
});

test('destino del botón: personalizado válido, entidad, o enlace original', () => {
  const fallback = descuentosDefaultUrl('perfumeria');
  expect(fallback).toBe('/tienda?descuento=todas&seccion=Perfumer%C3%ADa');
  expect(botonDestino(null, fallback, null)).toBe(fallback);
  expect(botonDestino({ boton_modo: 'personalizado', boton_enlace: 'https://marybe.com.ar/promo' }, fallback, null)).toBe('https://marybe.com.ar/promo');
  expect(botonDestino({ boton_modo: 'personalizado', boton_enlace: 'javascript:alert(1)', entidad_tipo: 'marca' }, fallback, { nombre: 'Ala' })).toBe('/tienda?marca=Ala');
  expect(botonDestino({ boton_modo: 'auto', entidad_tipo: 'categoria' }, fallback, { nombre: 'Maquillaje & Co', seccion: 'Hogar' })).toBe('/tienda?categoria=Maquillaje%20%26%20Co&seccion=Hogar');
  expect(botonDestino({ boton_modo: 'auto', entidad_tipo: 'categoria' }, fallback, null)).toBe(fallback);
  expect(botonDestino({ boton_modo: 'auto', entidad_tipo: 'proveedor' }, fallback, { nombre: 'Prov A' })).toBe(fallback);
  expect(entidadUrl('proveedor', 'Prov A')).toBe('');
});
