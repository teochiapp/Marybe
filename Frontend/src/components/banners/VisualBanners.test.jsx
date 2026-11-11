import React from 'react';
import { render } from '@testing-library/react';
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
