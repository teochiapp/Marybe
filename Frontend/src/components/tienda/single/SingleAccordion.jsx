import React, { useState } from 'react';
import styled from 'styled-components';

const AccordionContainer = styled.div`
  margin-top: 40px;
  border-top: 1px solid #EAEAEA;
`;

const AccordionItem = styled.div`
  border-bottom: 1px solid #EAEAEA;
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
  color: #28180B;
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
  padding-bottom: 20px;
  font-size: 0.95rem;
  line-height: 1.6;
  color: #555;
`;

const ChevronDown = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

export default function SingleAccordion({ descripcion, especificaciones, politicas }) {
  const [openSection, setOpenSection] = useState('descripcion'); // 'descripcion' open by default

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <AccordionContainer>
      <AccordionItem>
        <AccordionHeader 
          $isOpen={openSection === 'descripcion'} 
          onClick={() => toggleSection('descripcion')}
        >
          Descripción
          <ChevronDown />
        </AccordionHeader>
        <AccordionContent $isOpen={openSection === 'descripcion'}>
          <ContentInner>
            {descripcion || 'No hay descripción detallada disponible para este producto.'}
          </ContentInner>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem>
        <AccordionHeader 
          $isOpen={openSection === 'especificaciones'} 
          onClick={() => toggleSection('especificaciones')}
        >
          Especificaciones
          <ChevronDown />
        </AccordionHeader>
        <AccordionContent $isOpen={openSection === 'especificaciones'}>
          <ContentInner>
            {especificaciones || 'No hay especificaciones adicionales.'}
          </ContentInner>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem>
        <AccordionHeader 
          $isOpen={openSection === 'politicas'} 
          onClick={() => toggleSection('politicas')}
        >
          Política de envío y devoluciones
          <ChevronDown />
        </AccordionHeader>
        <AccordionContent $isOpen={openSection === 'politicas'}>
          <ContentInner>
            {politicas || (
              <>
                <p><strong>Envíos:</strong> Realizamos envíos a todo el país. El costo se calcula al momento del checkout.</p>
                <p><strong>Devoluciones:</strong> Tenés 30 días para devolver el producto si no estás conforme, siempre que se encuentre cerrado y en su envase original.</p>
              </>
            )}
          </ContentInner>
        </AccordionContent>
      </AccordionItem>
    </AccordionContainer>
  );
}
