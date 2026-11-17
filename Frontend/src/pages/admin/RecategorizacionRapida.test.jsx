import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import RecategorizacionRapida from './RecategorizacionRapida';
jest.mock('axios');
beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});
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

test('asigna campañas rápidas clonando sección y categoría principal como subcategoría', async () => {
  axios.get.mockResolvedValue({ data: { taxonomia: { 'Electro belleza': { Secadores: [] }, Fragancias: {} } } });
  axios.post.mockImplementation(url =>
    url.endsWith('/productos')
      ? Promise.resolve({
          data: {
            productos: [{
              documentId: 'p3',
              nombre: 'Secador Pro',
              proveedor: 'Prov',
              updatedAt: 'v1',
              clasificaciones: [{ seccion: 'Hogar', categoria: 'Electro belleza', subcategoria: 'Secadores', tipo: '' }],
            }],
          },
        })
      : Promise.resolve({ data: { ok: true, updatedAt: 'v2' } })
  );

  render(<RecategorizacionRapida token="token" proveedores={['Prov']} />);
  fireEvent.click(screen.getByRole('button', { name: 'Buscar productos' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Secador Pro · Prov' }));

  const bfBtn = await screen.findByRole('button', { name: 'Black Friday' });
  expect(bfBtn.getAttribute('aria-pressed')).toBe('false');

  // Primer clic: clona sección (Hogar) y categoría principal (Electro belleza), asignando Black Friday en subcategoría
  fireEvent.click(bfBtn);
  expect(bfBtn.getAttribute('aria-pressed')).toBe('true');
  expect(screen.getAllByLabelText('Categoría')).toHaveLength(2);
  expect(screen.getAllByLabelText('Sección')[1].value).toBe('Hogar');
  expect(screen.getAllByLabelText('Categoría')[1].value).toBe('Electro belleza');
  expect(screen.getAllByLabelText('Subcategoría')[1].value).toBe('Black Friday');

  // Segundo clic: toggle lo quita
  fireEvent.click(bfBtn);
  expect(bfBtn.getAttribute('aria-pressed')).toBe('false');
  expect(screen.getAllByLabelText('Categoría')).toHaveLength(1);

  // Tercer clic: vuelve a asignarlo
  fireEvent.click(bfBtn);

  // Agregar campaña personalizada al vuelo
  fireEvent.click(screen.getByRole('button', { name: 'Nueva campaña' }));
  fireEvent.change(screen.getByLabelText('Nombre de la pill'), { target: { value: 'Día de la Madre' } });
  expect(screen.getByLabelText('Subcategoría de la pill').value).toBe('Día de la Madre');
  fireEvent.click(screen.getByRole('button', { name: 'Agregar pill' }));

  const madreBtn = screen.getByRole('button', { name: 'Día de la Madre' });
  expect(madreBtn.getAttribute('aria-pressed')).toBe('true');

  fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
  await waitFor(() =>
    expect(axios.post).toHaveBeenLastCalledWith(
      expect.stringContaining('/guardar'),
      expect.objectContaining({
        documentId: 'p3',
        clasificaciones: [
          { seccion: 'Hogar', categoria: 'Electro belleza', subcategoria: 'Secadores', tipo: '' },
          { seccion: 'Hogar', categoria: 'Electro belleza', subcategoria: 'Black Friday', tipo: '' },
          { seccion: 'Hogar', categoria: 'Electro belleza', subcategoria: 'Día de la Madre', tipo: '' },
        ],
      }),
      expect.anything()
    )
  );
});

test('permite editar nombre y configuración de pills predeterminadas y restaurarlas', async () => {
  axios.get.mockResolvedValue({ data: { taxonomia: { Fragancias: { Femeninas: [] }, 'Electro belleza': { Secadores: [] } } } });
  axios.post.mockImplementation(url =>
    url.endsWith('/productos')
      ? Promise.resolve({
          data: {
            productos: [{
              documentId: 'p4',
              nombre: 'Secador Hogar',
              proveedor: 'Prov',
              updatedAt: 'v1',
              clasificaciones: [{ seccion: 'Hogar', categoria: 'Electro belleza', subcategoria: 'Secadores', tipo: '' }],
            }],
          },
        })
      : Promise.resolve({ data: { ok: true, updatedAt: 'v2' } })
  );

  const view = render(<RecategorizacionRapida token="token" proveedores={['Prov']} />);
  fireEvent.click(screen.getByRole('button', { name: 'Buscar productos' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Secador Hogar · Prov' }));

  // Entrar a edición de pills y configurar "Ofertas"
  fireEvent.click(await screen.findByRole('button', { name: 'Editar pills' }));
  fireEvent.click(screen.getByRole('button', { name: 'Ofertas' }));
  fireEvent.change(screen.getByLabelText('Nombre de la pill'), { target: { value: 'Liquidación' } });
  fireEvent.change(screen.getByLabelText('Sección de la pill'), { target: { value: 'Perfumería' } });
  fireEvent.change(screen.getByLabelText('Categoría de la pill'), { target: { value: 'Fragancias' } });
  fireEvent.change(screen.getByLabelText('Subcategoría de la pill'), { target: { value: 'Outlet' } });
  fireEvent.change(screen.getByLabelText('Tipo de la pill'), { target: { value: 'Tester' } });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar pill' }));
  fireEvent.click(screen.getByRole('button', { name: 'Listo' }));

  expect(screen.queryByRole('button', { name: 'Ofertas' })).toBeNull();
  expect(screen.getByRole('button', { name: 'Liquidación' })).toBeTruthy();

  // Persiste entre sesiones (localStorage)
  view.unmount();
  render(<RecategorizacionRapida token="token" proveedores={['Prov']} />);
  fireEvent.click(screen.getByRole('button', { name: 'Buscar productos' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Secador Hogar · Prov' }));

  const liqBtn = await screen.findByRole('button', { name: 'Liquidación' });
  fireEvent.click(liqBtn);

  fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
  await waitFor(() =>
    expect(axios.post).toHaveBeenLastCalledWith(
      expect.stringContaining('/guardar'),
      expect.objectContaining({
        documentId: 'p4',
        clasificaciones: [
          { seccion: 'Hogar', categoria: 'Electro belleza', subcategoria: 'Secadores', tipo: '' },
          { seccion: 'Perfumería', categoria: 'Fragancias', subcategoria: 'Outlet', tipo: 'Tester' },
        ],
      }),
      expect.anything()
    )
  );

  // Reabrir y restaurar pills predeterminadas
  fireEvent.click(await screen.findByRole('button', { name: 'Secador Hogar · Prov' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Editar pills' }));
  fireEvent.click(screen.getByRole('button', { name: 'Restaurar' }));
  expect(await screen.findByRole('button', { name: 'Ofertas' })).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Liquidación' })).toBeNull();
});
