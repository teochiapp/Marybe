import React, { useState } from 'react';
import styled from 'styled-components';
import { FiMapPin, FiClock, FiCheckCircle } from 'react-icons/fi';

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: var(--spacing-xxl);

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-xl);
  }
`;

const EventList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
`;

const EventCard = styled.div`
  background-color: var(--color-blanco);
  border: 1px solid rgba(62, 1, 2, 0.08);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  display: flex;
  gap: var(--spacing-md);

  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const DateBox = styled.div`
  background-color: var(--color-marron-principal);
  color: var(--color-titulo-marybe);
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 90px;
  height: 90px;
  text-align: center;
  flex-shrink: 0;

  .day {
    font-size: 1.8rem;
    font-weight: 700;
    line-height: 1;
  }

  .month {
    font-size: 0.8rem;
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 1px;
  }
`;

const EventInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const EventTitle = styled.h3`
  font-family: var(--font-family-secondary);
  font-weight: 700;
  font-size: 1.25rem;
  color: var(--color-marron-principal);
  margin: 0;
`;

const EventMeta = styled.div`
  display: flex;
  gap: 16px;
  font-size: 0.85rem;
  color: #666;
  flex-wrap: wrap;

  div {
    display: flex;
    align-items: center;
    gap: 4px;
  }
`;

const EventDesc = styled.p`
  font-size: 0.95rem;
  color: #4a4a4a;
  line-height: 1.5;
  margin: 0;
`;

const RSVPCard = styled.div`
  background-color: var(--color-blanco);
  border: 1px solid rgba(62, 1, 2, 0.08);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  height: fit-content;
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

const EVENTS_DATA = [
  {
    day: '15',
    month: 'Jun',
    title: 'Masterclass de Maquillaje Glow',
    desc: 'Aprendé las técnicas de iluminación y preparación de piel para lograr el look glow definitivo con nuestra maquilladora experta.',
    time: '18:30 hs',
    location: 'Modalidad Online (Zoom VIP)'
  },
  {
    day: '22',
    month: 'Jun',
    title: 'Presentación Exclusiva Guerlain',
    desc: 'Un encuentro olfativo guiado por un embajador de la marca para conocer la nueva colección Aqua Allegoria.',
    time: '19:00 hs',
    location: 'Sucursal Santiago del Estero'
  }
];

export default function EventosContent() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    evento: 'glow',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <Grid>
      <EventList>
        {EVENTS_DATA.map((evt, idx) => (
          <EventCard key={idx}>
            <DateBox>
              <span className="day">{evt.day}</span>
              <span className="month">{evt.month}</span>
            </DateBox>
            <EventInfo>
              <EventTitle>{evt.title}</EventTitle>
              <EventMeta>
                <div>
                  <FiClock /> {evt.time}
                </div>
                <div>
                  <FiMapPin /> {evt.location}
                </div>
              </EventMeta>
              <EventDesc>{evt.desc}</EventDesc>
            </EventInfo>
          </EventCard>
        ))}
      </EventList>

      <RSVPCard>
        {!submitted ? (
          <>
            <h3 style={{ fontFamily: 'var(--font-family-primary)', fontSize: '1.5rem', color: 'var(--color-marron-principal)', marginBottom: 15 }}>
              Inscribirme a un evento
            </h3>
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
                <Label>Seleccionar Evento</Label>
                <Select
                  name="evento"
                  value={formData.evento}
                  onChange={handleChange}
                >
                  <option value="glow">Masterclass Glow (15 de Junio)</option>
                  <option value="guerlain">Encuentro Guerlain (22 de Junio)</option>
                </Select>
              </FormGroup>

              <SubmitBtn type="submit">Reservar mi lugar</SubmitBtn>
            </Form>
          </>
        ) : (
          <SuccessMsg>
            <FiCheckCircle />
            <h4>¡Lugar reservado!</h4>
            <p>Tu inscripción ha sido confirmada con éxito.</p>
            <p style={{ fontSize: '0.85rem', color: '#666', marginTop: 10 }}>
              Te enviamos un email con el ticket de acceso y el enlace correspondiente a tu dirección: <strong>{formData.email}</strong>.
            </p>
            <SubmitBtn onClick={() => setSubmitted(false)} style={{ width: '100%' }}>
              Inscribir otra persona
            </SubmitBtn>
          </SuccessMsg>
        )}
      </RSVPCard>
    </Grid>
  );
}
