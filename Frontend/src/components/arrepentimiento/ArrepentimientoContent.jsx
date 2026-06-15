import React, { useState } from 'react';
import styled from 'styled-components';
import { FiMapPin } from 'react-icons/fi';

const Wrapper = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: var(--spacing-xxl) var(--spacing-xl);
  font-family: var(--font-family-secondary);

  @media (max-width: 600px) {
    padding: var(--spacing-xl) var(--spacing-md);
  }
`;

const Title = styled.h1`
  font-family: var(--font-family-primary);
  font-style: italic;
  font-weight: 600;
  font-size: 48px;
  letter-spacing: -2%;
  color: #280101;
  margin: 0 0 var(--spacing-xxl);

  @media (max-width: 600px) {
    font-size: 2rem;
    margin: 0 0 var(--spacing-lg);
  }
`;

const Columns = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-xxl);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-xl);
  }
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
`;

const ColTitle = styled.h2`
  font-size: 1.10rem;
  font-weight: 600;
  font-family: inter;
  color: #280101;
  margin: 0 0 var(--spacing-md);
`;

const ColText = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: #280101;
  line-height: 120%;
  margin: 0 0 var(--spacing-xl);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #d8d2ca;
  border-radius: var(--radius-md);
  font-family: var(--font-family-secondary);
  font-size: 0.95rem;
  color: #280101;
  background-color: var(--color-blanco);
  box-sizing: border-box;

  &::placeholder {
    color: #b0a89f;
  }

  &:focus {
    outline: none;
    border-color: var(--color-bordo-secundario);
  }
`;

const SubmitButton = styled.button`
  align-self: flex-end;
  margin-top: var(--spacing-sm);
  background-color: #280101;
  color: var(--color-blanco);
  border: none;
  border-radius: var(--radius-md);
  padding: 14px var(--spacing-xl);
  font-family: var(--font-family-secondary);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-fast);

  &:hover {
    background-color: var(--color-bordo-secundario);
  }

  @media (max-width: 768px) {
    align-self: stretch;
    width: 100%;
  }
`;

const WhatsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const WhatsButton = styled.a`
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: #F5F2ED;
  color: #7C0405;
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
  padding: 14px var(--spacing-lg);
  border-radius: var(--radius-full);
  transition: var(--transition-fast);

  svg {
    flex-shrink: 0;
  }

  &:hover {
    background-color: #ecd6d6;
  }
`;

const sucursalesWhats = [
  { label: 'Santiago del Estero', tel: '5493855189775' },
  { label: 'La Banda - SDE', tel: '5493854714941' },
  { label: 'Tucumán', tel: '5493815714926' },
];

export default function ArrepentimientoContent() {
  const [form, setForm] = useState({ nombre: '', email: '', compra: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <Wrapper>
      <Title>Botón de Arrepentimiento</Title>

      <Columns>
        <Column>
          <ColTitle>Vía E-mail</ColTitle>
          <ColText>
            Completá el siguiente formulario para que demos de baja tu compra. No te preocupes si ya la pagaste, la anulación es inmediata!
          </ColText>
          <Form onSubmit={handleSubmit}>
            <Input type="text" name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} />
            <Input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} />
            <Input type="text" name="compra" placeholder="Número de compra" value={form.compra} onChange={handleChange} />
            <SubmitButton type="submit">Enviar</SubmitButton>
          </Form>
        </Column>

        <Column>
          <ColTitle>Por Whatsapp</ColTitle>
          <ColText>
            Puedes comunicarte a nuestras sucursales haciendo click en los links de abajo con tu número de compra y nuestro staff cancelará tu compra a la brevedad. No te preocupes si ya lo pagaste, la anulación es inmediata!
          </ColText>
          <WhatsList>
            {sucursalesWhats.map((s) => (
              <WhatsButton key={s.label} href={`https://wa.me/${s.tel}`} target="_blank" rel="noopener noreferrer">
                <FiMapPin size={18} />
                {s.label}
              </WhatsButton>
            ))}
          </WhatsList>
        </Column>
      </Columns>
    </Wrapper>
  );
}
