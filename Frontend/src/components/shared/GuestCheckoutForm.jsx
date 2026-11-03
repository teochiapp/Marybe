import React, { useState } from 'react';
import { GUEST_KEY, readGuest, validGuest } from '../../utils/guestCheckout';
import './GuestCheckoutForm.css';

export default function GuestCheckoutForm({ onContinue }) {
  const [guest, setGuest] = useState(() => readGuest() || { nombre: '', apellido: '', email: '', telefono: '' });
  const [error, setError] = useState('');
  return <form className="guest-checkout" onSubmit={e => {
    e.preventDefault();
    const contact = Object.fromEntries(Object.entries(guest).map(([key, value]) => [key, String(value).trim()]));
    contact.email = contact.email.toLowerCase();
    if (!validGuest(contact)) { setError('Completá tu nombre, apellido, email válido y teléfono de contacto.'); return; }
    sessionStorage.setItem(GUEST_KEY, JSON.stringify(contact));
    onContinue();
  }}>
    <h3>Comprar como invitado</h3>
    <p>Sin crear una cuenta. Te enviaremos la confirmación y las novedades del pedido por email.</p>
    <div className="guest-checkout-fields">{[
      ['nombre', 'Nombre', 'text', 'given-name'], ['apellido', 'Apellido', 'text', 'family-name'],
      ['email', 'Email', 'email', 'email'], ['telefono', 'Teléfono', 'tel', 'tel'],
    ].map(([key, label, type, autoComplete]) => <label key={key} htmlFor={`guest-${key}`}>{label}<input id={`guest-${key}`} name={key} type={type} autoComplete={autoComplete} required maxLength={key === 'email' ? 254 : 100} value={guest[key] || ''} onChange={e => setGuest({ ...guest, [key]: e.target.value })} /></label>)}</div>
    {error && <p role="alert">{error}</p>}
    <button type="submit">Continuar como invitado</button>
  </form>;
}
