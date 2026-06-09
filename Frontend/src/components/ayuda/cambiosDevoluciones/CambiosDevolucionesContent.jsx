import React, { useState } from 'react';
import styled from 'styled-components';
import { FiRefreshCw, FiClipboard, FiShield, FiAlertTriangle } from 'react-icons/fi';

const MainLayout = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: var(--spacing-xxl);

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-xl);
  }
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
`;

const PolicyCard = styled.div`
  background-color: var(--color-blanco);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  border: 1px solid rgba(62, 1, 2, 0.08);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const PolicyItem = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-start;

  svg {
    width: 24px;
    height: 24px;
    color: var(--color-bordo-secundario);
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const PolicyTitle = styled.h3`
  font-family: var(--font-family-secondary);
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--color-marron-principal);
  margin: 0 0 4px 0;
`;

const PolicyText = styled.p`
  font-size: 0.95rem;
  color: #555555;
  line-height: 1.5;
  margin: 0;
`;

const WarningBox = styled.div`
  background-color: #fff8f8;
  border-left: 4px solid var(--color-bordo-secundario);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  display: flex;
  gap: 12px;
  align-items: flex-start;
  color: var(--color-marron-tercero);
  font-size: 0.9rem;
  line-height: 1.5;

  svg {
    color: var(--color-bordo-secundario);
    flex-shrink: 0;
    margin-top: 3px;
  }
`;

const FormCard = styled.div`
  background-color: var(--color-blanco);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  border: 1px solid rgba(62, 1, 2, 0.08);
  box-shadow: var(--shadow-sm);
  height: fit-content;
`;

const FormTitle = styled.h3`
  font-family: var(--font-family-primary);
  font-size: 1.6rem;
  color: var(--color-marron-principal);
  margin-bottom: var(--spacing-md);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-marron-secundario);
`;

const Input = styled.input`
  background-color: var(--color-fondo-beneficio-tarjeta);
  border: 1px solid rgba(62, 1, 2, 0.15);
  border-radius: var(--radius-md);
  padding: 12px;
  font-size: 0.95rem;
  color: var(--color-marron-tercero);
  outline: none;

  &:focus {
    border-color: var(--color-bordo-secundario);
  }
`;

const Select = styled.select`
  background-color: var(--color-fondo-beneficio-tarjeta);
  border: 1px solid rgba(62, 1, 2, 0.15);
  border-radius: var(--radius-md);
  padding: 12px;
  font-size: 0.95rem;
  color: var(--color-marron-tercero);
  outline: none;

  &:focus {
    border-color: var(--color-bordo-secundario);
  }
`;

const TextArea = styled.textarea`
  background-color: var(--color-fondo-beneficio-tarjeta);
  border: 1px solid rgba(62, 1, 2, 0.15);
  border-radius: var(--radius-md);
  padding: 12px;
  font-size: 0.95rem;
  color: var(--color-marron-tercero);
  min-height: 100px;
  resize: vertical;
  outline: none;

  &:focus {
    border-color: var(--color-bordo-secundario);
  }
`;

const SubmitBtn = styled.button`
  background-color: var(--color-marron-principal);
  color: var(--color-blanco);
  font-weight: 600;
  padding: 14px;
  border-radius: var(--radius-md);
  transition: var(--transition-fast);
  margin-top: var(--spacing-sm);

  &:hover {
    background-color: var(--color-bordo-secundario);
  }
`;

const SuccessMsg = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: var(--spacing-xl) 0;

  svg {
    width: 60px;
    height: 60px;
    color: #2e7d32;
  }

  h4 {
    font-family: var(--font-family-primary);
    font-size: 1.6rem;
    color: var(--color-marron-principal);
    margin: 0;
  }

  p {
    font-size: 0.95rem;
    color: #555555;
    margin: 0;
  }
`;

export default function CambiosDevolucionesContent() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    orden: '',
    motivo: 'defecto',
    comentario: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const randomTicket = 'CAM-' + Math.floor(100000 + Math.random() * 900000);
    setTicketId(randomTicket);
    setSubmitted(true);
  };

  return (
    <MainLayout>
      <Section>
        <PolicyCard>
          <PolicyItem>
            <FiRefreshCw />
            <div>
              <PolicyTitle>Plazo de 30 días</PolicyTitle>
              <PolicyText>
                Podés solicitar el cambio de cualquier producto dentro de los 30 días corridos a partir de la fecha de entrega de tu pedido.
              </PolicyText>
            </div>
          </PolicyItem>

          <PolicyItem>
            <FiShield />
            <div>
              <PolicyTitle>Estado original del producto</PolicyTitle>
              <PolicyText>
                Para poder efectuar el cambio, el artículo debe estar sin abrir, en su celofán exterior original intacto, con etiquetas y en las mismas condiciones en que fue recibido.
              </PolicyText>
            </div>
          </PolicyItem>

          <PolicyItem>
            <FiClipboard />
            <div>
              <PolicyTitle>Documentación necesaria</PolicyTitle>
              <PolicyText>
                Es necesario presentar la factura de compra o el ticket de regalo que acompaña al pedido, ya sea en formato físico o digital.
              </PolicyText>
            </div>
          </PolicyItem>
        </PolicyCard>

        <WarningBox>
          <FiAlertTriangle />
          <div>
            <strong>Importante por cuestiones de higiene:</strong> Fragancias abiertas, cosméticos, maquillaje o productos de cuidado personal que hayan sido abiertos o muestren indicios de uso <strong>no son elegibles para cambios ni devoluciones</strong>, salvo por fallas de fábrica demostrables en el atomizador o envase.
          </div>
        </WarningBox>
      </Section>

      <FormCard>
        {!submitted ? (
          <>
            <FormTitle>Iniciar solicitud</FormTitle>
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>Nombre completo</Label>
                <Input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Correo electrónico</Label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Número de pedido</Label>
                <Input
                  type="text"
                  name="orden"
                  placeholder="Ej: #12345"
                  value={formData.orden}
                  onChange={handleChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Motivo del cambio</Label>
                <Select
                  name="motivo"
                  value={formData.motivo}
                  onChange={handleChange}
                >
                  <option value="defecto">Producto defectuoso / falla de fábrica</option>
                  <option value="error">Recibí un producto incorrecto</option>
                  <option value="arrepentimiento">No es lo que esperaba / Arrepentimiento</option>
                  <option value="otro">Otro motivo (especificar abajo)</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Detalles o comentarios adicionales</Label>
                <TextArea
                  name="comentario"
                  value={formData.comentario}
                  onChange={handleChange}
                  placeholder="Contanos más sobre la solicitud..."
                />
              </FormGroup>

              <SubmitBtn type="submit">Enviar Solicitud</SubmitBtn>
            </Form>
          </>
        ) : (
          <SuccessMsg>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <h4>¡Solicitud enviada!</h4>
            <p>Tu reclamo ha sido registrado con el código:</p>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-bordo-secundario)', margin: '4px 0' }}>
              {ticketId}
            </div>
            <p style={{ fontSize: '0.85rem', color: '#666', marginTop: 10 }}>
              Recibirás un email en las próximas 24 horas con las instrucciones detalladas para coordinar el cambio del producto.
            </p>
            <SubmitBtn onClick={() => setSubmitted(false)} style={{ width: '100%' }}>
              Nueva Solicitud
            </SubmitBtn>
          </SuccessMsg>
        )}
      </FormCard>
    </MainLayout>
  );
}
