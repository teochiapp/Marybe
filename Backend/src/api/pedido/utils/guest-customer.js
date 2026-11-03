'use strict';

module.exports = function guestCustomer(input) {
  const customer = {};
  for (const field of ['nombre', 'apellido', 'email', 'telefono']) {
    if (typeof input?.[field] !== 'string') throw new Error('Completá los datos de contacto del invitado.');
    customer[field] = input[field].trim();
    if (!customer[field] || customer[field].length > (field === 'email' ? 254 : 100)) throw new Error('Datos de contacto inválidos.');
  }
  customer.email = customer.email.toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) throw new Error('Ingresá un email válido.');
  if (customer.telefono.replace(/\D/g, '').length < 6) throw new Error('Ingresá un teléfono válido.');
  return customer;
};
