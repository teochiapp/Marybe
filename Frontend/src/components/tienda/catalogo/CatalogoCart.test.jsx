import React, { useContext } from 'react';
import { render, screen, fireEvent, within, act } from '@testing-library/react';
import CatalogoProductCard from './CatalogoProductCard';
import { CartContext, CartProvider } from '../../../context/CartContext';

jest.mock('react-router-dom', () => ({ useNavigate: () => jest.fn() }), { virtual: true });
jest.mock('../../../hooks/useConfiguracionGeneral', () => ({ useConfiguracionGeneral: () => ({ config: {} }) }));
jest.mock('../../shared/FavoriteButton', () => () => null);

const products = [
  { id: 1, nombre: 'Perfume A', variantes: [
    { id: 11, volumen: '100 ml', precio: 1000, stock: 8, sku_ean: 'A100' },
    { id: 12, volumen: '200 ml', precio: 2000, precio_oferta: 1500, stock: 3, sku_ean: 'A200' },
  ] },
  { id: 2, nombre: 'Perfume B', variantes: [
    { id: 21, volumen: '100 ml', precio: 3000, stock: 4, sku_ean: 'B100' },
    { id: 22, volumen: '200 ml', precio: 4000, stock: 2, sku_ean: 'B200' },
  ] },
];
function CartSnapshot() {
  const { cartItems, cartTotal } = useContext(CartContext);
  return <output data-testid="cart">{JSON.stringify({ cartItems, cartTotal })}</output>;
}
function snapshot() { return JSON.parse(screen.getByTestId('cart').textContent); }
function addFromCard(name, size, modalSize) {
  const card = screen.getByRole('heading', { name }).parentElement;
  fireEvent.click(within(card).getByRole('radio', { name: size }));
  fireEvent.click(within(card).getByRole('button', { name: /^Agregar$/ }));
  const modal = screen.getByRole('heading', { name: 'Agregar al carrito' }).parentElement;
  // The selected card variant must be preserved on opening the modal.
  expect(within(modal).getByRole('radio', { name: size }).getAttribute('aria-checked')).toBe('true');
  if (modalSize) fireEvent.click(within(modal).getByRole('radio', { name: modalSize }));
  fireEvent.click(within(modal).getByRole('button', { name: 'Agregar al carrito' }));
  act(() => { jest.advanceTimersByTime(900); });
  fireEvent.click(screen.getByRole('button', { name: 'Seguir comprando' }));
}
beforeEach(() => { localStorage.clear(); jest.useFakeTimers(); });
afterEach(() => { jest.runOnlyPendingTimers(); jest.useRealTimers(); });

test('catálogo conserva productos y variantes distintas, acumula solo la misma variante y persiste precios', () => {
  render(<CartProvider>{products.map(product => <CatalogoProductCard key={product.id} product={product} strapiUrl="" />)}<CartSnapshot /></CartProvider>);
  addFromCard('Perfume A', '200 ml');
  addFromCard('Perfume A', '200 ml', '100 ml');
  addFromCard('Perfume B', '100 ml');
  addFromCard('Perfume B', '200 ml');
  addFromCard('Perfume A', '200 ml');
  const cart = snapshot();
  expect(cart.cartItems).toHaveLength(4);
  expect(cart.cartItems.map(item => [item.product.id, item.variant.id, item.quantity, item.price])).toEqual([
    [1, 12, 2, 1500], [1, 11, 1, 1000], [2, 21, 1, 3000], [2, 22, 1, 4000],
  ]);
  expect(cart.cartTotal).toBe(11000);
  expect(JSON.parse(localStorage.getItem('marybe_cart'))).toEqual(cart.cartItems);
  addFromCard('Perfume A', '200 ml');
  addFromCard('Perfume A', '200 ml');
  expect(snapshot().cartItems.find(item => item.variant.id === 12).quantity).toBe(3);
  expect(snapshot().cartItems.find(item => item.variant.id === 22).quantity).toBe(1);
});
