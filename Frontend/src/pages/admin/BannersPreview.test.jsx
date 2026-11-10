import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import BannersPreview from './BannersPreview';

const rows = [{ banners: [
  { id: 1, titulo: 'Primero', enlace: '/tienda', imagen_desktop: '/inicio/featured.webp', diseno: { mobile: { height: 280 } } },
  { id: 2, titulo: 'Segundo' },
] }];

function showPreview(mode) {
  render(<BannersPreview />);
  fireEvent(window, new MessageEvent('message', { origin: window.location.origin, source: window.parent, data: {
    type: 'MARYBE_BANNERS_PREVIEW', payload: { mode, rows, selected: { row: 0, banner: 0 }, source: 'promo-1', device: 'mobile' },
  } }));
}

function pointer(element, type, clientX, clientY) {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, button: 0, clientX, clientY });
  Object.defineProperty(event, 'pointerId', { value: 1 });
  fireEvent(element, event);
}

beforeEach(() => { global.ResizeObserver = class { observe() {} disconnect() {} }; });
afterEach(() => jest.restoreAllMocks());

test('modo limpio no muestra selección ni permite edición o navegación de enlaces', () => {
  showPreview('view');
  expect(screen.getByRole('img', { name: 'Primero' }).closest('.vb-banner')).not.toHaveClass('vb-banner--selected');
  expect(screen.queryByRole('slider')).toBeNull();
  expect(screen.queryByRole('button', { name: 'Mover Primero' })).toBeNull();
  expect(fireEvent.click(screen.getByRole('link', { name: 'Primero' }))).toBe(false);
});

test.each([['superior', 100, 60], ['inferior', 380, 420]])('el borde %s previsualiza el alto y lo envía al soltar', (edge, startY, endY) => {
  const send = jest.spyOn(window.parent, 'postMessage').mockImplementation(() => {});
  showPreview('edit');
  const handle = screen.getByRole('slider', { name: `Ajustar alto desde el borde ${edge}` });
  const banner = handle.closest('.vb-banner');
  handle.setPointerCapture = jest.fn();
  jest.spyOn(banner, 'getBoundingClientRect').mockReturnValue({ height: 280 });

  pointer(handle, 'pointerdown', 150, startY);
  pointer(handle, 'pointermove', 150, endY);
  expect(banner.style.getPropertyValue('--vb-height-2')).toBe('320px');
  expect(send.mock.calls.some(([data]) => data.type === 'MARYBE_BANNERS_RESIZE')).toBe(false);
  pointer(handle, 'pointerup', 150, endY);
  expect(send).toHaveBeenLastCalledWith({ type: 'MARYBE_BANNERS_RESIZE', dimension: 'height', row: 0, banner: 0, value: 320, device: 'mobile', source: 'promo-1' }, window.location.origin);
});

test('arrastrar un banner marca el destino y envía una sola operación de reordenamiento', () => {
  const send = jest.spyOn(window.parent, 'postMessage').mockImplementation(() => {});
  showPreview('edit');
  const first = screen.getByRole('img', { name: 'Primero' }).closest('.vb-cell');
  const second = screen.getByRole('button', { name: 'Mover Segundo' }).closest('.vb-cell');
  const track = first.parentElement;
  first.setPointerCapture = jest.fn();
  jest.spyOn(first, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, width: 180, height: 280 });
  jest.spyOn(second, 'getBoundingClientRect').mockReturnValue({ left: 200, top: 0, width: 180, height: 280 });
  jest.spyOn(track, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, right: 380, bottom: 280 });

  pointer(first, 'pointerdown', 90, 140);
  pointer(first, 'pointermove', 290, 140);
  expect(second).toHaveClass('vb-cell--drop-target');
  expect(send.mock.calls.some(([data]) => data.type === 'MARYBE_BANNERS_REORDER')).toBe(false);
  pointer(first, 'pointerup', 290, 140);
  expect(second).not.toHaveClass('vb-cell--drop-target');
  expect(send.mock.calls.filter(([data]) => data.type === 'MARYBE_BANNERS_REORDER')).toEqual([
    [{ type: 'MARYBE_BANNERS_REORDER', row: 0, from: 0, to: 1, source: 'promo-1' }, window.location.origin],
  ]);
});
