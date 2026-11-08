import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import axios from 'axios';
import BannersAdmin from './BannersAdmin';

jest.mock('axios');
jest.mock('react-router-dom', () => ({ Link: ({ children }) => <span>{children}</span> }), { virtual: true });

const group = { documentId: 'promo-1', updatedAt: 'v1', titulo: 'Campaña inicial', seccion: 'Perfumería', Filas: [{ id: 1, __component: 'layout.fila-1-columna', banners: [{ id: 2, titulo: 'Campaña inicial', imagen_desktop: { id: 3, url: '/uploads/test.webp' }, diseno: { desktop: { height: 480 } } }] }] };

beforeEach(() => {
  localStorage.clear(); sessionStorage.clear(); jest.clearAllMocks();
  global.ResizeObserver = class { observe() {} disconnect() {} };
  localStorage.setItem('admin_jwt', 'fixture-token');
  axios.get.mockResolvedValue({ data: { data: { promotions: [group] } } });
});
afterEach(() => jest.restoreAllMocks());

test('en /banners-admin no muestra el acceso al Editor de Inicio', async () => {
  render(<BannersAdmin />);
  await screen.findByRole('spinbutton', { name: 'Alto' });
  expect(screen.queryByRole('button', { name: '← Editor de Inicio' })).toBeNull();
});

test('integrado en el Editor de Inicio permite volver al selector', async () => {
  const onBack = jest.fn();
  render(<BannersAdmin onBack={onBack} />);
  await screen.findByRole('spinbutton', { name: 'Alto' });
  fireEvent.click(screen.getByRole('button', { name: '← Editor de Inicio' }));
  expect(onBack).toHaveBeenCalledTimes(1);
});

test('advierte antes de volver si hay cambios sin guardar', async () => {
  const onBack = jest.fn();
  const confirm = jest.spyOn(window, 'confirm').mockReturnValue(false);
  render(<BannersAdmin onBack={onBack} />);
  fireEvent.change(await screen.findByRole('spinbutton', { name: 'Alto' }), { target: { value: '350' } });
  fireEvent.click(screen.getByRole('button', { name: '← Editor de Inicio' }));
  expect(confirm).toHaveBeenCalled();
  expect(onBack).not.toHaveBeenCalled();
  confirm.mockReturnValue(true);
  fireEvent.click(screen.getByRole('button', { name: '← Editor de Inicio' }));
  expect(onBack).toHaveBeenCalledTimes(1);
});

test('Salir cierra la sesión compartida y avisa al Editor de Inicio', async () => {
  const onLogout = jest.fn();
  render(<BannersAdmin onBack={jest.fn()} onLogout={onLogout} />);
  await screen.findByRole('spinbutton', { name: 'Alto' });
  fireEvent.click(screen.getByRole('button', { name: 'Salir' }));
  expect(onLogout).toHaveBeenCalledTimes(1);
  expect(localStorage.getItem('admin_jwt')).toBeNull();
});
