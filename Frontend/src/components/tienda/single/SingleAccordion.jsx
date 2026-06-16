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
  color: #560203;
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem', lineHeight: '1.5' }}>
                <div>
                  <strong style={{ display: 'block', marginBottom: '4px' }}>Métodos de Envío y Retiro:</strong>
                  <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <li><strong>Retiro en sucursal (Sin cargo):</strong> Santiago del Estero, La Banda y Tucumán.</li>
                    <li><strong>Envío a domicilio local:</strong> Entregas en el día para pedidos confirmados hasta las 18:00hs.</li>
                    <li><strong>Envíos a todo el país:</strong> Mediante Correo Argentino.</li>
                  </ul>
                </div>
                <div>
                  <strong style={{ display: 'block', marginBottom: '4px' }}>Cambios y Devoluciones:</strong>
                  <p style={{ margin: '0 0 6px 0' }}>Comunicate a <strong>pelle.marybe@gmail.com</strong>.</p>
                  <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <li>El producto debe estar <strong>sin uso, en perfecto estado y con su embalaje original cerrado</strong> (celofán, etiquetas).</li>
                    <li>Es obligatorio presentar el comprobante de compra.</li>
                    <li><em>No tienen cambio:</em> productos dañados por mal uso o que no mantengan el estado original.</li>
                  </ul>
                </div>
              </div>
            )}
          </ContentInner>
        </AccordionContent>
      </AccordionItem>
    </AccordionContainer>
  );
}
