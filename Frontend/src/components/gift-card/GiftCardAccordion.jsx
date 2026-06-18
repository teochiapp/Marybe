import React, { useState } from 'react';
import styled from 'styled-components';

const AccordionContainer = styled.div`
  margin-top: 8px;
  border-top: 1px solid var(--color-giftcard-borde);
`;

const AccordionItem = styled.div`
  border-bottom: 1px solid var(--color-giftcard-borde);
`;

const AccordionHeader = styled.button`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  background: none;
  border: none;
  font-family: var(--font-family-secondary);
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-bordo-tercero);
  cursor: pointer;

  svg {
    width: 20px;
    height: 20px;
    transition: transform 0.3s ease;
    transform: ${({ $isOpen }) => ($isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
  }
`;

const AccordionContent = styled.div`
  overflow: hidden;
  max-height: ${({ $isOpen }) => ($isOpen ? '1000px' : '0')};
  transition: max-height 0.4s ease-in-out;
`;

const ContentInner = styled.div`
  padding-bottom: 22px;
  font-family: var(--font-family-secondary);
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--color-marron-secundario);

  ul {
    padding-left: 20px;
    margin: 8px 0 0 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
`;

const ChevronDown = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const SECTIONS = [
  {
    id: 'descripcion',
    title: 'Descripción',
    content: (
      <>
        Regalá la experiencia Marybe. La Gift Card es válida para todos los productos
        de nuestra tienda y se entrega de forma digital con un código único. Elegí el
        monto que quieras regalar y dejá que la persona elija lo que más le guste.
      </>
    ),
  },
  {
    id: 'especificaciones',
    title: 'Especificaciones',
    content: (
      <ul>
        <li>Formato: digital, enviada por correo electrónico.</li>
        <li>Monto: personalizable desde el campo de arriba.</li>
        <li>Validez: 12 meses desde la fecha de compra.</li>
        <li>Uso: aplicable a cualquier producto del catálogo.</li>
      </ul>
    ),
  },
  {
    id: 'politicas',
    title: 'Política de envío y devoluciones',
    content: (
      <ul>
        <li>La Gift Card se envía al instante una vez confirmado el pago.</li>
        <li>No admite devolución ni reembolso por tratarse de un producto digital.</li>
        <li>Ante cualquier inconveniente, escribinos a <strong>pelle.marybe@gmail.com</strong>.</li>
      </ul>
    ),
  },
];

export default function GiftCardAccordion() {
  const [openSection, setOpenSection] = useState('descripcion');

  const toggleSection = (section) =>
    setOpenSection((prev) => (prev === section ? null : section));

  return (
    <AccordionContainer>
      {SECTIONS.map(({ id, title, content }) => (
        <AccordionItem key={id}>
          <AccordionHeader $isOpen={openSection === id} onClick={() => toggleSection(id)}>
            {title}
            <ChevronDown />
          </AccordionHeader>
          <AccordionContent $isOpen={openSection === id}>
            <ContentInner>{content}</ContentInner>
          </AccordionContent>
        </AccordionItem>
      ))}
    </AccordionContainer>
  );
}
