import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BannersPreview from './BannersPreview';
jest.mock('../../components/banners/VisualBanners', () => ({ __esModule: true, default: ({ onSelect, onMove, selected }) => <div data-testid="preview-state">{JSON.stringify({ editable: Boolean(onSelect || onMove), selected })}<a href="/tienda">Ver promoción</a></div> }));
beforeEach(() => { global.ResizeObserver = class { observe() {} disconnect() {} }; });

test('modo limpio no muestra selección ni permite edición o navegación de enlaces', () => {
  render(<BannersPreview />);
  fireEvent(window, new MessageEvent('message', { origin: window.location.origin, source: window.parent, data: { type: 'MARYBE_BANNERS_PREVIEW', payload: { mode: 'view', rows: [], selected: { row: 0, banner: 0 } } } }));
  expect(JSON.parse(screen.getByTestId('preview-state').firstChild.textContent)).toEqual({ editable: false, selected: null });
  expect(fireEvent.click(screen.getByRole('link', { name: 'Ver promoción' }))).toBe(false);
});
