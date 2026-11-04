import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import CatalogoSidebar from './CatalogoSidebar';

const props = {
  mobileOpen: false, availableBrands: [], availableSizes: [], availablePriceRange: [0, 100],
  activeBrands: [], activeSizes: [], activePrice: [0, 100], activePriceParam: '', activeSeccion: '',
  activeDescuento: [], activeCatParam: 'Cuidado Personal', activeSubcatParam: '', activeTipoParam: '',
  accordions: { categoria: true }, onSelectCategory: jest.fn(), onSelectSubcategory: jest.fn(),
  onSelectTipo: jest.fn(), onClearCategory: jest.fn(), onToggleAccordion: jest.fn(),
  onCheckboxToggle: jest.fn(), onDescuentoChange: jest.fn(), onPriceChange: jest.fn(),
  onRemoveTag: jest.fn(), onClearAll: jest.fn(), onSubmit: jest.fn(), total: 2,
};

beforeEach(() => {
  global.fetch = jest.fn(async () => ({ ok: true, json: async () => ({ data: [
    { nombre: 'Cuidado Personal', seccion: 'Hogar', subcategorias: [{ nombre: 'Baño', tipos: [{ nombre: 'Jabón' }] }] },
    { nombre: 'Cuidado Personal', seccion: 'Perfumería', subcategorias: [{ nombre: 'Rostro', tipos: [{ nombre: 'Crema' }] }, { nombre: 'Baño', tipos: [{ nombre: 'Gel' }] }] },
  ], meta: { pagination: { pageCount: 1 } } }) }));
});
afterEach(() => { delete global.fetch; });

test('sin sección activa combina las subcategorías y tipos de ambas ramas', async () => {
  const view = render(<CatalogoSidebar {...props} />);
  expect(await screen.findByLabelText('Baño')).toBeInTheDocument();
  expect(screen.getByLabelText('Rostro')).toBeInTheDocument();
  view.rerender(<CatalogoSidebar {...props} activeSubcatParam="Baño" />);
  expect(screen.getByLabelText('Jabón')).toBeInTheDocument();
  expect(screen.getByLabelText('Gel')).toBeInTheDocument();
  view.rerender(<CatalogoSidebar {...props} activeSeccion="Hogar" />);
  expect(screen.getByLabelText('Baño')).toBeInTheDocument();
  expect(screen.queryByLabelText('Rostro')).not.toBeInTheDocument();
});
