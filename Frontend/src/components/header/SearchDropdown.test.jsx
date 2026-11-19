import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, within } from '@testing-library/react';
import SearchDropdown from './SearchDropdown';

jest.mock('react-router-dom', () => ({ useNavigate: () => jest.fn() }), { virtual: true });

test.each(['Versace Eros', 'Eros Versace'])('combina nombre y marca para %s', async query => {
  global.fetch = jest.fn(async url => ({
    json: async () => ({ data: url.includes('/api/productos') ? [
      { id: 1, nombre: 'Eros', marca: 'Versace' },
      { id: 2, attributes: { nombre: 'Eros Flame', marca: 'Versace' } },
      { id: 3, nombre: 'Dylan Blue', marca: 'Versace' },
      { id: 4, nombre: 'Eros de otra marca', marca: 'Otra' },
    ] : [] }),
  }));
  try {
    render(<SearchDropdown query={query} onClose={jest.fn()} />);
    await screen.findByText('Eros');
    const section = screen.getByText('Productos').parentElement;
    expect(within(section).getAllByRole('option')).toHaveLength(2);
    expect(within(section).queryByText('Dylan Blue')).not.toBeInTheDocument();
    expect(within(section).queryByText('Eros de otra marca')).not.toBeInTheDocument();
  } finally {
    delete global.fetch;
  }
});

test('muestra primero productos por nombre y agrega coincidencias de marca sin duplicados', async () => {
  global.fetch = jest.fn(async url => ({
    json: async () => ({ data: url.includes('/api/productos') ? [
      { id: 1, nombre: 'Crema hidratante', marca: 'CLINIQUE' },
      { id: 2, attributes: { nombre: 'Clinique perfume', marca: 'Clinique' } },
      { id: 3, nombre: 'Otro producto', marca: 'Otra', tipo: 'Clinique' },
    ] : [] }),
  }));

  const { container } = render(<SearchDropdown query="clinique" onClose={jest.fn()} />);
  await screen.findByText('Crema hidratante');
  const productSection = screen.getByText('Productos').parentElement;
  const options = within(productSection).getAllByRole('option');
  expect(options).toHaveLength(2);
  expect(options[0]).toHaveTextContent('Clinique perfume');
  expect(options[1]).toHaveTextContent('Crema hidratante');
  expect(container).not.toHaveTextContent('Otro producto');
  delete global.fetch;
});

test('limita las sugerencias de productos a siete', async () => {
  global.fetch = jest.fn(async url => ({
    json: async () => ({ data: url.includes('/api/productos')
      ? Array.from({ length: 9 }, (_, i) => ({ id: i + 1, nombre: `Producto ${i + 1}`, marca: 'Clinique' }))
      : [] }),
  }));

  render(<SearchDropdown query="clinique" onClose={jest.fn()} />);
  await screen.findByText('Producto 1');
  const productSection = screen.getByText('Productos').parentElement;
  expect(within(productSection).getAllByRole('option')).toHaveLength(7);
  expect(within(productSection).queryByText('Producto 8')).not.toBeInTheDocument();
  delete global.fetch;
});

test('adapta el contenedor de sugerencias a pantallas bajas y textos largos', async () => {
  global.fetch = jest.fn(async url => ({
    json: async () => ({
      data: url.includes('/api/productos')
        ? [{ id: 1, nombre: 'Producto muy largo de prueba responsive en buscador', marca: 'MarcaExtendidaSinEspaciosParaProbarCorte' }]
        : [],
    }),
  }));

  try {
    render(<SearchDropdown query="producto" onClose={jest.fn()} />);
    await screen.findByText('Producto muy largo de prueba responsive en buscador');
    const listbox = screen.getByRole('listbox', { name: 'Sugerencias de búsqueda' });
    const classes = Array.from(listbox.classList);
    const dropdownRules = Array.from(document.querySelectorAll('style[data-styled]'))
      .flatMap(style => {
        const sheetRules = Array.from(style.sheet?.cssRules || []).map(r => r.cssText);
        if (sheetRules.length) return sheetRules;
        return (style.textContent || '').split('}').map(r => `${r}}`);
      })
      .filter(rule => classes.some(cls => rule.includes(`.${cls}{`) || rule.includes(`.${cls} {`)))
      .join('\n');
    expect(dropdownRules).toMatch(/overflow-y:\s*auto/);
    expect(dropdownRules).toMatch(/overscroll-behavior:\s*contain/);
  } finally {
    delete global.fetch;
  }
});
