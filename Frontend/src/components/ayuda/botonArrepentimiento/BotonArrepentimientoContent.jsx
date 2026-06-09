import React, { useState } from 'react';
import styled from 'styled-components';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

const InstructionBox = styled.div`
  background-color: var(--color-fondo-tarjetas-promo);
  border: 1px solid rgba(62, 1, 2, 0.08);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
  color: var(--color-marron-secundario);
  font-size: 0.95rem;
  line-height: 1.6;

  h3 {
    font-family: var(--font-family-secondary);
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--color-marron-principal);
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 8px;

    svg {
      color: var(--color-bordo-secundario);
    }
  }

  p {
    color: #4a4a4a;
    margin-bottom: var(--spacing-sm);
  }
`;

const FormCard = styled.div`
  background-color: var(--color-blanco);
  border: 1px solid rgba(62, 1, 2, 0.08);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  max-width: 650px;
  margin: 0 auto;
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

const TextArea = styled.textarea`
  background-color: var(--color-fondo-beneficio-tarjeta);
  border: 1px solid rgba(62, 1, 2, 0.15);
  border-radius: var(--radius-md);
  padding: 12px;
  font-size: 0.95rem;
  color: var(--color-marron-tercero);
  min-height: 80px;
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

const SuccessCard = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: var(--spacing-xl) 0;

  svg {
    width: 64px;
    height: 64px;
    color: #2e7d32;
  }

  h3 {
    font-family: var(--font-family-primary);
    font-size: 1.8rem;
    color: var(--color-marron-principal);
    margin: 0;
  }

  p {
    font-size: 0.95rem;
    color: #555555;
    margin: 0;
  }

  .claim-id {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-bordo-secundario);
    background-color: var(--color-fondo-tarjetas-promo);
    padding: var(--spacing-sm) var(--spacing-lg);
    border-radius: var(--radius-md);
    border: 1px dashed var(--color-bordo-secundario);
    margin: 8px 0;
  }
`;

export default function BotonArrepentimientoContent() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    orden: '',
    fechaCompra: '',
    comentario: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [claimId, setClaimId] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const randomClaim = 'REV-' + Math.floor(100000 + Math.random() * 900000);
    setClaimId(randomClaim);
    setSubmitted(true);
  };

  return (
    <>
      <InstructionBox>
        <h3>
          <FiAlertCircle />
          Derecho de Revocación Legal (Ley de Defensa del Consumidor N° 24.240)
        </h3>
        <p>
          Si compraste un producto en nuestra tienda online y decidís arrepentirte, tenés un plazo de <strong>10 días corridos</strong> desde la entrega del producto o la celebración del contrato de compra para revocar tu aceptación sin cargo ni justificación alguna.
        </p>
        <p>
          Una vez completado el formulario de abajo, nos pondremos en contacto con vos para coordinar el retiro del producto sin costo y efectuar la devolución de tu dinero. El producto debe estar sin uso y con su empaque original cerrado.
        </p>
      </InstructionBox>

      <FormCard>
        {!submitted ? (
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>Nombre completo del titular de compra</Label>
              <Input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Correo electrónico registrado en la compra</Label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Teléfono de contacto</Label>
              <Input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Número de pedido / Identificador de compra</Label>
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
              <Label>Fecha aproximada de la compra o entrega</Label>
              <Input
                type="date"
                name="fechaCompra"
                value={formData.fechaCompra}
                onChange={handleChange}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Comentarios adicionales (opcional)</Label>
              <TextArea
                name="comentario"
                value={formData.comentario}
                onChange={handleChange}
                placeholder="Detallá los productos a revocar o cualquier dato adicional para coordinar el retiro..."
              />
            </FormGroup>

            <SubmitBtn type="submit">Confirmar Revocación de Compra</SubmitBtn>
          </Form>
        ) : (
          <SuccessCard>
            <FiCheckCircle />
            <h3>¡Revocación Registrada!</h3>
            <p>Hemos recibido tu solicitud de arrepentimiento. Tu código de reclamo es:</p>
            <div className="claim-id">{claimId}</div>
            <p style={{ fontSize: '0.9rem', color: '#555', marginTop: 10 }}>
              Un agente de atención al cliente te enviará un correo electrónico para coordinar el retiro gratuito del producto y el reembolso de tu pago por el mismo medio que utilizaste para abonar.
            </p>
            <SubmitBtn onClick={() => setSubmitted(false)} style={{ width: '100%', marginTop: 15 }}>
              Registrar otra revocación
            </SubmitBtn>
          </SuccessCard>
        )}
      </FormCard>
    </>
  );
}
