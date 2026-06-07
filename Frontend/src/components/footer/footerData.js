import React from 'react';
import { FiPhone } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

export const NAV_COLUMNS = [
  {
    title: 'Mis Pedidos',
    links: [
      { label: 'Mi cuenta', href: '/mi-cuenta' },
      { label: 'Seguimiento de envío', href: '/seguimiento-envio' },
      { label: 'Canjear Gift card', href: '/canjear-gift-card' },
    ],
  },
  {
    title: 'Categorías',
    links: [
      { label: 'Perfumería', href: '/tienda?seccion=Perfumería' },
      { label: 'Hogar', href: '/tienda?seccion=Hogar' },
      { label: 'Gift Cards', href: '/canjear-gift-card' },
      { label: 'Ofertas', href: '/ofertas' },
      { label: 'Nuevos lanzamientos', href: '/lanzamientos' },
      { label: 'Eventos', href: '/eventos' },
      { label: 'Promociones bancarias', href: '/promociones-bancarias' },
    ],
  },
  {
    title: 'Ayuda',
    links: [
      { label: 'Preguntas Frecuentes', href: '/preguntas-frecuentes' },
      { label: 'Envíos', href: '/envios' },
      { label: 'Cambios y Devoluciones', href: '/cambios-devoluciones' },
      { label: 'Términos y Condiciones', href: '/terminos-condiciones' },
      { label: 'Botón de arrepentimiento', href: '/boton-arrepentimiento' },
    ],
  },
];

export const CONTACT_ITEMS = [
  { icon: <FiPhone size={16} />, phone: '0385 421-5678', hours: 'Lun a Vie 9 a 20 hs' },
  { icon: <FaWhatsapp size={16} />, phone: '+54 9 385 555-1234', hours: 'Lun a Vie 9 a 20 hs' },
];
