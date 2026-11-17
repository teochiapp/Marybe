import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, within } from '@testing-library/react';
import Footer from './Footer';

jest.mock(
  'react-router-dom',
  () => ({
    Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>,
  }),
  { virtual: true }
);

test('ubica Privacidad y Cookies en la misma fila final a la derecha junto al botón de WhatsApp', () => {
  render(<Footer />);

  const bottomRow = screen.getByTestId('footer-contact-bottom-row');
  const whatsappLink = within(bottomRow).getByRole('link', { name: /Unirme al canal de Whatsapp/i });
  const privacidadLink = within(bottomRow).getByRole('link', { name: 'Privacidad' });
  const cookiesLink = within(bottomRow).getByRole('link', { name: 'Cookies' });

  expect(whatsappLink).toBeInTheDocument();
  expect(privacidadLink).toHaveAttribute('href', '/terminos-condiciones');
  expect(cookiesLink).toHaveAttribute('href', '/terminos-condiciones');
});
