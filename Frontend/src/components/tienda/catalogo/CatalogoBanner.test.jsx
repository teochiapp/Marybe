import React from 'react';
import { render, screen } from '@testing-library/react';
import CatalogoBanner from './CatalogoBanner';

function getCssRulesForElement(el, descendant = '') {
  const classes = Array.from(el.classList);
  const suffix = descendant ? ` ${descendant}` : '';
  return Array.from(document.querySelectorAll('style[data-styled]'))
    .flatMap(style => {
      const sheetRules = Array.from(style.sheet?.cssRules || []).map(r => r.cssText);
      if (sheetRules.length) return sheetRules;
      return (style.textContent || '').split('}').map(r => `${r}}`);
    })
    .filter(rule => classes.some(cls => rule.includes(`.${cls}${suffix}{`) || rule.includes(`.${cls}${suffix} {`)))
    .join('\n');
}

test('aplica el difuminado horizontal y border-radius igual al contenedor en portada de categoría', () => {
  render(
    <CatalogoBanner
      currentBanner={{
        title: 'Niños y Bebes',
        image: '/uploads/ninos.jpg',
        imageAlt: 'Niños y Bebes',
        pills: ['Más relevantes', 'Novedades'],
        bgColor: 'var(--color-hogar)',
        isCategoryCover: true,
      }}
      onPillClick={jest.fn()}
    />
  );

  const wrapper = screen.getByTestId('banner-image-wrapper');
  const wrapperCss = getCssRulesForElement(wrapper);
  const imgCss = getCssRulesForElement(wrapper, 'img');

  expect(wrapperCss).toMatch(/mask-image:\s*linear-gradient\(\s*to left/i);
  expect(wrapperCss).toMatch(/rgba\(\s*0,\s*0,\s*0,\s*0\s*\)\s*100%/i);
  expect(wrapperCss).toMatch(/border-radius:\s*24px/i);
  expect(imgCss).toMatch(/border-radius:\s*24px/i);
});

test('no aplica mask-image de portada cuando isCategoryCover es false', () => {
  render(
    <CatalogoBanner
      currentBanner={{
        title: 'Hogar',
        image: '/inicio/hogar.webp',
        imageAlt: 'Productos Hogar',
        pills: ['Aromatizantes'],
        bgColor: 'var(--color-hogar)',
        isCategoryCover: false,
      }}
      onPillClick={jest.fn()}
    />
  );

  const wrapperCss = getCssRulesForElement(screen.getByTestId('banner-image-wrapper'));

  expect(wrapperCss).not.toMatch(/mask-image:/i);
});

test('no renderiza wrapper ni imagen cuando currentBanner.image es null', () => {
  render(
    <CatalogoBanner
      currentBanner={{
        title: 'Electro belleza',
        image: null,
        imageAlt: 'Electro belleza',
        pills: ['Más relevantes', 'Novedades'],
        bgColor: 'var(--color-hogar)',
        isCategoryCover: false,
      }}
      onPillClick={jest.fn()}
    />
  );

  expect(screen.getByRole('heading', { name: 'Electro belleza' })).toBeTruthy();
  expect(screen.queryByRole('img')).toBeNull();
  expect(screen.queryByTestId('banner-image-wrapper')).toBeNull();
});
