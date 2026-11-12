import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render } from '@testing-library/react';
import VisualBanners, { VisualBanner } from './VisualBanners';

test('banners principales usan blanco y respetan el fondo por dispositivo', () => {
  const banner = { titulo: 'Prueba', diseno: { desktop: { background: '#123456' }, mobile: { background: '#abcdef' } } };
  const rows = [{ __component: 'layout.fila-1-columna', banners: [{ titulo: 'Original' }, banner] }];
  const { container } = render(<VisualBanners rows={rows} />);
  const elements = container.querySelectorAll('.vb-banner');
  expect(elements[0].style.getPropertyValue('--vb-background-0')).toBe('#ffffff');
  expect(elements[1].style.getPropertyValue('--vb-background-0')).toBe('#123456');
  expect(elements[1].style.getPropertyValue('--vb-background-1')).toBe('#123456');
  expect(elements[1].style.getPropertyValue('--vb-background-2')).toBe('#abcdef');
});

test('los banners de otras secciones conservan su fondo predeterminado', () => {
  const { container } = render(<VisualBanner banner={{ titulo: 'Otro' }} />);
  expect(container.querySelector('.vb-banner').style.getPropertyValue('--vb-background-0')).toBe('#faf7f4');
});

test('combina video e imagen por dispositivo y reproduce el video sin sonido', () => {
  const originalWidth = window.innerWidth;
  Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: 1280 });
  const banner = { titulo: 'Campaña', imagen_desktop: { url: '/uploads/desktop.mp4', mime: 'video/mp4' }, imagen_mobile: { url: '/uploads/mobile.svg', mime: 'image/svg+xml' } };
  const { container } = render(<VisualBanner banner={banner} />);
  const video = container.querySelector('video');
  expect(video).toBeTruthy();
  expect(video).toHaveAttribute('src', 'http://localhost:1337/uploads/desktop.mp4');
  expect(video.muted).toBe(true);
  expect(video).toHaveAttribute('autoplay');
  expect(video).toHaveAttribute('loop');
  expect(video).toHaveAttribute('playsinline');
  window.innerWidth = 390; fireEvent(window, new Event('resize'));
  expect(container.querySelector('video')).toBeNull();
  expect(container.querySelector('img')).toHaveAttribute('src', 'http://localhost:1337/uploads/mobile.svg');
  window.innerWidth = originalWidth;
});
