export const GUEST_KEY = 'marybe_checkout_guest';
export function readGuest() {
  try { return JSON.parse(sessionStorage.getItem(GUEST_KEY)) || null; } catch { return null; }
}
export function validGuest(guest) {
  if (!['nombre', 'apellido', 'email', 'telefono'].every(field => typeof guest?.[field] === 'string')) return false;
  return Boolean(guest.nombre.trim() && guest.apellido.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest.email) && guest.telefono.replace(/\D/g, '').length >= 6);
}
