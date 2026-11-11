import React from 'react';
import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import UbicacionPopup from './UbicacionPopup';

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

test('recuerda el código postal y lo recupera al volver a abrir', () => {
  const { unmount } = render(<UbicacionPopup onClose={() => {}} />);
  fireEvent.change(screen.getByPlaceholderText('Ej: 5000'), { target: { value: '5000' } });
  fireEvent.click(screen.getByText('Continuar'));
  expect(localStorage.getItem('marybe_cp')).toBe('5000');
  unmount();
  render(<UbicacionPopup onClose={() => {}} />);
  expect(screen.getByPlaceholderText('Ej: 5000').value).toBe('5000');
});

test('sin recordar conserva el código solo durante la sesión', () => {
  localStorage.setItem('marybe_cp', '5000');
  render(<UbicacionPopup onClose={() => {}} />);
  fireEvent.change(screen.getByPlaceholderText('Ej: 5000'), { target: { value: '4200' } });
  fireEvent.click(screen.getByRole('button', { name: 'Recordar datos' }));
  fireEvent.click(screen.getByText('Continuar'));
  expect(localStorage.getItem('marybe_cp')).toBeNull();
  expect(sessionStorage.getItem('marybe_cp')).toBe('4200');
  cleanup();
  render(<UbicacionPopup onClose={() => {}} />);
  expect(screen.getByPlaceholderText('Ej: 5000').value).toBe('4200');
  expect(screen.getByRole('button', { name: 'Recordar datos' }).getAttribute('aria-pressed')).toBe('false');
});
