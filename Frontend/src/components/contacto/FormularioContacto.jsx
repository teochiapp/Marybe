import React, { useState } from 'react';
import styled, { css } from 'styled-components';

const HeroSection = styled.section`
  position: relative;
  width: 100%;
  background-image: linear-gradient(rgba(22, 0, 0, 0.45), rgba(22, 0, 0, 0.45)),
    url('/contacto/familiaMarybenueva.webp');
  background-size: cover;
  background-position: center;
  height: 600px;
  display: flex;
  align-items: center;

  @media (max-width: 800px) {
    height: auto;
    padding: var(--spacing-xxl) 0;
  }
`;

const HeroInner = styled.div`
  width: 100%;
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 var(--spacing-xl);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-xxl);
  align-items: center;

  @media (max-width: 800px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-xl);
  }
`;

const HeroTitle = styled.h2`
  font-family: var(--font-family-secondary);
  font-size: clamp(2.2rem, 4vw, 3.2rem);
  font-weight: 700;
  color: var(--color-blanco);
  line-height: 1.15;
  margin: 0;
  max-width: 400px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const fieldStyles = css`
  width: 100%;
  background-color: var(--color-blanco);
  border: none;
  border-radius: var(--radius-md);
  padding: 14px 16px;
  font-family: var(--font-family-secondary);
  font-size: 0.95rem;
  color: var(--color-marron-secundario);
  outline: none;

  &::placeholder {
    color: #9b9b9b;
  }

  &:focus {
    box-shadow: 0 0 0 2px var(--color-bordo-secundario);
  }
`;

const Input = styled.input`
  ${fieldStyles}
`;

const TextArea = styled.textarea`
  ${fieldStyles}
  min-height: 110px;
  resize: vertical;
`;

const SubmitRow = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const SubmitButton = styled.button`
  background-color: var(--color-blanco);
  color: var(--color-marron-principal);
  font-family: var(--font-family-secondary);
  font-size: 0.95rem;
  font-weight: 600;
  border: none;
  border-radius: var(--radius-md);
  padding: 12px var(--spacing-xl);
  cursor: pointer;
  transition: var(--transition-fast);

  &:hover {
    background-color: var(--color-rosa-tercero);
  }

  &:disabled {
    opacity: 0.7;
    cursor: default;
  }
`;

const SuccessMessage = styled.p`
  font-family: var(--font-family-secondary);
  font-size: 0.9rem;
  color: var(--color-blanco);
  background-color: rgba(0, 0, 0, 0.35);
  border-radius: var(--radius-md);
  padding: 10px 14px;
  margin: 0;
  text-align: center;
`;

export default function FormularioContacto() {
  const [form, setForm] = useState({ nombre: '', email: '', mensaje: '' });
  const [enviado, setEnviado] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setEnviado(true);
    setForm({ nombre: '', email: '', mensaje: '' });
  };

  return (
    <HeroSection>
      <HeroInner>
        <HeroTitle>Dejanos tu mensaje</HeroTitle>

        <Form onSubmit={handleSubmit}>
          <Input
            type="text"
            name="nombre"
            placeholder="Nombre"
            value={form.nombre}
            onChange={handleChange}
            required
          />
          <Input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <TextArea
            name="mensaje"
            placeholder="Mensaje"
            value={form.mensaje}
            onChange={handleChange}
            required
          />

          {enviado && (
            <SuccessMessage>
              ¡Gracias por tu mensaje! Te responderemos a la brevedad.
            </SuccessMessage>
          )}

          <SubmitRow>
            <SubmitButton type="submit">Enviar</SubmitButton>
          </SubmitRow>
        </Form>
      </HeroInner>
    </HeroSection>
  );
}
