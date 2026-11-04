import React from 'react';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import CatalogoProductCard from '../../components/tienda/catalogo/CatalogoProductCard';
import ProductoSingle from '../tienda/ProductoSingle';
import Carrito from '../carrito/Carrito';
import Login from './Login';
import Envio from './Envio';
import Pago from './Pago';
import { CartProvider } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: '1-perfume-prueba' }),
  useLocation: () => ({ search: '' }),
  Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>,
}), { virtual: true });
jest.mock('../../hooks/useConfiguracionGeneral', () => ({ useConfiguracionGeneral: () => ({ config: {
  costo_envio: 6000, envio_gratis_desde: 50000,
  metodosPago: [{ id: 'efectivo', title: 'Efectivo', subtitle: 'Pago' }],
} }) }));
jest.mock('../../hooks/usePaginaSucursales', () => ({ usePaginaSucursales: () => ({ loading: false, sucursales: [
  { provincia: 'Tucumán', locales: [{ direccion: 'Sucursal de prueba', ciudad: 'Tucumán', telefono: '1234' }] },
] }) }));
jest.mock('../../components/shared/FavoriteButton', () => () => null);
jest.mock('../../components/tienda/single/SingleBreadcrumb', () => () => null);
jest.mock('../../components/tienda/single/SingleImageGallery', () => () => null);
jest.mock('../../components/tienda/single/SingleAccordion', () => () => null);
jest.mock('../../components/tienda/single/SingleSimilares', () => () => null);
jest.mock('../../components/inicio/shared/GiftCard', () => () => null);

const product = { id: 1, nombre: 'Perfume prueba', marca: 'Marca', publicado: true, variantes: [
  { id: 11, id_original: 'V100', volumen: '100 ml', precio: 1000, stock: 8, sku_ean: 'SKU100', publicado: true },
  { id: 12, id_original: 'V200', volumen: '200 ml', precio: 2000, precio_oferta: 1500, stock: 3, sku_ean: 'SKU200', publicado: true },
] };
const guest = { nombre: 'Ana', apellido: 'Pérez', email: 'ana@example.test', telefono: '3851234567' };
const auth = { token: null, user: null, isLoading: false, openAuthModal: jest.fn() };
const cart = () => JSON.parse(localStorage.getItem('marybe_cart'));
const mount = component => render(<AuthContext.Provider value={auth}><CartProvider>{component}</CartProvider></AuthContext.Provider>);

beforeEach(() => {
  localStorage.clear(); sessionStorage.clear(); mockNavigate.mockClear();
  window.scrollTo = jest.fn();
  global.fetch = jest.fn(async url => ({ ok: true, json: async () => String(url).includes('/api/productos?')
    ? { data: [product] } : { data: { numero_pedido: 'M-TEST' } } }));
});

test.each([
  ['catálogo', 'domicilio', 6000],
  ['ficha', 'sucursal', 0],
])('compra desde %s conserva la variante y el total hasta el pedido con %s', async (entry, delivery, shipping) => {
  let view = mount(entry === 'catálogo' ? <CatalogoProductCard product={product} strapiUrl="" /> : <ProductoSingle />);
  if (entry === 'ficha') await screen.findByRole('heading', { name: 'Perfume prueba' });
  fireEvent.click(screen.getByRole('radio', { name: '200 ml' }));
  if (entry === 'catálogo') {
    fireEvent.click(screen.getByRole('button', { name: /^Agregar$/ }));
    const modal = screen.getByRole('heading', { name: 'Agregar al carrito' }).parentElement;
    expect(within(modal).getByRole('radio', { name: '200 ml' }).getAttribute('aria-checked')).toBe('true');
    fireEvent.click(within(modal).getByRole('button', { name: '+' }));
    fireEvent.click(within(modal).getByRole('button', { name: 'Agregar al carrito' }));
  } else {
    fireEvent.click(screen.getByRole('button', { name: '+' }));
    fireEvent.click(screen.getByRole('button', { name: 'Agregar' }));
  }
  await screen.findByText('¡Agregado al carrito!');
  expect(cart().map(item => [item.variant.id, item.quantity, item.price])).toEqual([[12, 2, 1500]]);
  fireEvent.click(screen.getByRole('button', { name: 'Ir al carrito' }));
  expect(mockNavigate).toHaveBeenCalledWith('/carrito');
  view.unmount();

  view = mount(<Carrito />);
  fireEvent.click(screen.getByRole('button', { name: '+' }));
  expect(screen.getByRole('button', { name: '+' }).disabled).toBe(true);
  expect(cart().map(item => [item.variant.id, item.quantity, item.price])).toEqual([[12, 3, 1500]]);
  fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));
  expect(mockNavigate).toHaveBeenCalledWith('/login');
  view.unmount();

  view = mount(<Login />);
  for (const [label, value] of [['Nombre', guest.nombre], ['Apellido', guest.apellido], ['Email', guest.email], ['Teléfono', guest.telefono]]) {
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
  }
  fireEvent.click(screen.getByRole('button', { name: 'Continuar como invitado' }));
  expect(mockNavigate).toHaveBeenCalledWith('/envio');
  view.unmount();

  view = mount(<Envio />);
  if (delivery === 'sucursal') {
    fireEvent.click(screen.getByText('Retiro por sucursal'));
    fireEvent.change(screen.getByLabelText('Elegí la sucursal de retiro'), { target: { value: JSON.stringify(['Tucumán', 'Sucursal de prueba']) } });
  } else {
    for (const [label, value] of [['Calle', 'Mitre'], ['Número / Depto', '123'], ['Código postal', '4200'], ['Ciudad', 'Ciudad'], ['Provincia', 'Tucumán']]) {
      fireEvent.change(screen.getByLabelText(label), { target: { value } });
    }
  }
  fireEvent.click(screen.getByRole('button', { name: 'Ir a pagar' }));
  expect(mockNavigate).toHaveBeenCalledWith('/pago');
  view.unmount();

  view = mount(<Pago />);
  fireEvent.click(await screen.findByRole('button', { name: 'Hacer pedido' }));
  await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/order-success', expect.anything()));
  const orderCall = global.fetch.mock.calls.find(([url]) => String(url).includes('/api/pedidos-invitado'));
  const order = JSON.parse(orderCall[1].body);
  expect(order).toEqual(expect.objectContaining({ cliente: guest, metodo_envio: delivery, metodo_pago: 'efectivo', envio: shipping, total: 4500 + shipping }));
  expect(order.productos.map(item => [item.product.id, item.variant.id, item.variant.sku_ean, item.quantity, item.price])).toEqual([[1, 12, 'SKU200', 3, 1500]]);
  expect(cart()).toEqual([]);
  view.unmount();
});

test.each(['catálogo', 'ficha'])('%s agrega la combinación exacta de tamaño y color', async entry => {
  const colored = { ...product, variantes: [
    { id: 21, volumen: '100 ml', color_nombre: 'Rojo', precio: 1000, stock: 4 },
    { id: 22, volumen: '100 ml', color_nombre: 'Azul', precio: 1200, stock: 4 },
    { id: 23, volumen: '200 ml', color_nombre: 'Azul', precio: 2200, precio_oferta: 1800, stock: 2, sku_ean: 'AZ200' },
  ] };
  global.fetch = jest.fn(async () => ({ ok: true, json: async () => ({ data: [colored] }) }));
  mount(entry === 'catálogo' ? <CatalogoProductCard product={colored} strapiUrl="" /> : <ProductoSingle />);
  if (entry === 'ficha') await screen.findByRole('heading', { name: 'Perfume prueba' });
  fireEvent.click(screen.getByRole('radio', { name: 'Azul' }));
  fireEvent.click(screen.getByRole('radio', { name: '200 ml' }));
  if (entry === 'catálogo') {
    fireEvent.click(screen.getByRole('button', { name: 'Agregar' }));
    const modal = screen.getByRole('heading', { name: 'Agregar al carrito' }).parentElement;
    expect(within(modal).getByRole('radio', { name: 'Azul' }).getAttribute('aria-checked')).toBe('true');
    expect(within(modal).getByRole('radio', { name: '200 ml' }).getAttribute('aria-checked')).toBe('true');
    fireEvent.click(within(modal).getByRole('button', { name: 'Agregar al carrito' }));
  } else {
    fireEvent.click(screen.getByRole('button', { name: 'Agregar' }));
  }
  await screen.findByText('¡Agregado al carrito!');
  expect(cart().map(item => [item.variant.id, item.variant.volumen, item.variant.color_nombre, item.variant.sku_ean, item.price])).toEqual([[23, '200 ml', 'Azul', 'AZ200', 1800]]);
});
