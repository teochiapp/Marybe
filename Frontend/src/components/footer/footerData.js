import React from 'react';
import { FiPhone } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

export const NAV_COLUMNS = [
  {
    title: 'Mis Pedidos',
    links: [
      { label: 'Mi cuenta', href: '#' },
      { label: 'Seguimiento de envío', href: '#' },
      { label: 'Canjear Gift card', href: '#' },
    ],
  },
  {
    title: 'Categorías',
    links: [
      { label: 'Perfumería', href: '#' },
      { label: 'Hogar', href: '#' },
      { label: 'Gift Cards', href: '#' },
      { label: 'Ofertas', href: '#' },
      { label: 'Nuevos lanzamientos', href: '#' },
      { label: 'Eventos', href: '#' },
      { label: 'Promociones bancarias', href: '#' },
    ],
  },
  {
    title: 'Ayuda',
    links: [
      { label: 'Preguntas Frecuentes', href: '#' },
      { label: 'Envíos', href: '#' },
      { label: 'Cambios y Devoluciones', href: '#' },
      { label: 'Términos y Condiciones', href: '#' },
      { label: 'Botón de arrepentimiento', href: '#' },
    ],
  },
];

export const CONTACT_ITEMS = [
  { icon: <FiPhone size={16} />, phone: '0385 421-5678', hours: 'Lun a Vie 9 a 20 hs' },
  { icon: <FaWhatsapp size={16} />, phone: '+54 9 385 555-1234', hours: 'Lun a Vie 9 a 20 hs' },
];
