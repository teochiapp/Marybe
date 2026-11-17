import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import RecategorizacionRapida from './RecategorizacionRapida';
jest.mock('axios');
beforeEach(() => jest.clearAllMocks());
test('edita clasificaciones en cascada y publica al guardar', async () => {
  axios.get.mockResolvedValue({ data: { taxonomia: { Belleza: { Facial: ['Crema'], Corporal: ['Aceite'] } } } });
  axios.post.mockImplementation(url => url.endsWith('/productos') ? Promise.resolve({ data: { productos: [{ documentId: 'p1', nombre: 'Producto', proveedor: 'Proveedor', updatedAt: 'v1', clasificaciones: [{ seccion: 'Hogar', categoria: 'Belleza', subcategoria: 'Facial', tipo: 'Crema' }] }] } }) : Promise.resolve({ data: { ok: true, updatedAt: 'v2' } }));
  render(<RecategorizacionRapida token="token" proveedores={['Proveedor']} />);
  fireEvent.click(screen.getByRole('button', { name: 'Buscar productos' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Producto · Proveedor' }));
  fireEvent.change(screen.getByLabelText('Buscar producto'), { target: { value: 'Producto' } });
  await screen.findByRole('option', { name: 'Belleza' });
  fireEvent.change(screen.getByLabelText('Subcategoría'), { target: { value: 'Corporal' } });
  expect(screen.getByLabelText('Tipo').value).toBe('');
  fireEvent.change(screen.getByLabelText('Tipo'), { target: { value: 'Aceite' } });
  fireEvent.click(screen.getByText('Agregar clasificación'));
  fireEvent.change(screen.getAllByLabelText('Sección')[1], { target: { value: 'Perfumería' } });
  fireEvent.change(screen.getAllByLabelText('Categoría')[1], { target: { value: 'Belleza' } });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
  await waitFor(() => expect(axios.post).toHaveBeenLastCalledWith(expect.stringContaining('/guardar'), expect.objectContaining({ documentId: 'p1', clasificaciones: [{ seccion: 'Hogar', categoria: 'Belleza', subcategoria: 'Corporal', tipo: 'Aceite' }, { seccion: 'Perfumería', categoria: 'Belleza', subcategoria: '', tipo: '' }] }), expect.anything()));
  expect(await screen.findByText(/Cambios guardados y publicados/)).toBeTruthy();
  expect(screen.queryByRole('region', { name: 'Editar clasificaciones' })).toBeNull();
  expect(axios.post).toHaveBeenCalledTimes(2);
  expect(screen.getByLabelText('Buscar producto').value).toBe('Producto');
  fireEvent.click(screen.getByRole('button', { name: 'Producto · Proveedor' }));
  expect(screen.getAllByLabelText('Subcategoría')[0].value).toBe('Corporal');
  fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
  await waitFor(() => expect(axios.post).toHaveBeenLastCalledWith(expect.stringContaining('/guardar'), expect.objectContaining({ documentId: 'p1', updatedAt: 'v2' }), expect.anything()));
});
test('busca en el catálogo sin seleccionar proveedores y permite editar el resultado', async () => {
  axios.get.mockResolvedValue({ data: { taxonomia: { Belleza: {} } } });
  axios.post.mockResolvedValue({ data: { productos: [{ documentId: 'p2', nombre: 'Producto encontrado', proveedor: null, updatedAt: 'v1', clasificaciones: [{ seccion: 'Hogar', categoria: 'Belleza', subcategoria: '', tipo: '' }] }] } });
  render(<RecategorizacionRapida token="token" proveedores={[]} />);
  fireEvent.change(screen.getByLabelText('Buscar en todo el catálogo'), { target: { value: 'EAN123' } });
  fireEvent.click(screen.getByRole('button', { name: 'Buscar en todo el catálogo' }));
  await waitFor(() => expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/productos'), { busqueda: 'EAN123' }, expect.anything()));
  fireEvent.click(await screen.findByRole('button', { name: 'Producto encontrado · Sin proveedor' }));
  expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeTruthy();
});

test('permite alternar campañas rápidas y agregar una categoría personalizada al vuelo', async () => {
  axios.get.mockResolvedValue({ data: { taxonomia: { Fragancias: {} } } });
  axios.post.mockImplementation(url =>
    url.endsWith('/productos')
      ? Promise.resolve({
          data: {
            productos: [{
              documentId: 'p3',
              nombre: 'Perfume Test',
              proveedor: 'Prov',
              updatedAt: 'v1',
              clasificaciones: [{ seccion: 'Perfumería', categoria: 'Fragancias', subcategoria: '', tipo: '' }],
            }],
          },
        })
      : Promise.resolve({ data: { ok: true, updatedAt: 'v2' } })
  );

  render(<RecategorizacionRapida token="token" proveedores={['Prov']} />);
  fireEvent.click(screen.getByRole('button', { name: 'Buscar productos' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Perfume Test · Prov' }));

  const bfBtn = await screen.findByRole('button', { name: 'Black Friday' });
  expect(bfBtn.getAttribute('aria-pressed')).toBe('false');

  // Primer clic: agrega Black Friday usando la sección principal (Perfumería)
  fireEvent.click(bfBtn);
  expect(bfBtn.getAttribute('aria-pressed')).toBe('true');
  expect(screen.getAllByLabelText('Categoría')).toHaveLength(2);
  expect(screen.getAllByLabelText('Categoría')[1].value).toBe('Black Friday');

  // Segundo clic: toggle lo quita
  fireEvent.click(bfBtn);
  expect(bfBtn.getAttribute('aria-pressed')).toBe('false');
  expect(screen.getAllByLabelText('Categoría')).toHaveLength(1);

  // Tercer clic: vuelve a asignarlo
  fireEvent.click(bfBtn);

  // Agregar categoría personalizada al vuelo
  fireEvent.click(screen.getByRole('button', { name: 'Nueva categoría' }));
  fireEvent.change(screen.getByLabelText('Nueva categoría o campaña'), { target: { value: 'Día de la Madre' } });
  fireEvent.click(screen.getByRole('button', { name: 'Agregar' }));

  const madreBtn = screen.getByRole('button', { name: 'Día de la Madre' });
  expect(madreBtn.getAttribute('aria-pressed')).toBe('true');

  fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
  await waitFor(() =>
    expect(axios.post).toHaveBeenLastCalledWith(
      expect.stringContaining('/guardar'),
      expect.objectContaining({
        documentId: 'p3',
        clasificaciones: [
          { seccion: 'Perfumería', categoria: 'Fragancias', subcategoria: '', tipo: '' },
          { seccion: 'Perfumería', categoria: 'Black Friday', subcategoria: '', tipo: '' },
          { seccion: 'Perfumería', categoria: 'Día de la Madre', subcategoria: '', tipo: '' },
        ],
      }),
      expect.anything()
    )
  );
});
