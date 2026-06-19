import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const STRAPI_URL = process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337';
const WHATSAPP_NUMBER = "5403854211687";

// ─── Styled Components ────────────────────────────────────────────────────────

const Section = styled.section`
  background: #FDFDFC;
  padding: 56px 64px;
  width: 100%;

  @media (max-width: 992px) {
    padding: 48px 24px;
  }

  @media (max-width: 600px) {
    padding: 32px 16px;
    background: linear-gradient(180deg, #FFFFFF 0%, var(--color-fondo-info-promo) 100%);
  }
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 40px;

  @media (max-width: 600px) {
    margin-bottom: 28px;
    align-items: flex-start;
  }
`;

const HeaderIconWrap = styled.div`
  display: flex;
  align-items: center;
`;

const Title = styled.h2`
  font-family: var(--font-family-primary);
  font-style: italic;
  font-weight: 600;
  letter-spacing: -2%;
  font-size: 48px;
  color: var(--color-marron-tercero);
  margin: 0;
  line-height: 1.1;

  @media (max-width: 992px) {
    font-size: 40px;
  }

  @media (max-width: 600px) {
    font-size: 32px;
  }
`;

/* ─── Grid ───────────────────────────────────────────────────────────────── */

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  width: 100%;

  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

/* ─── Card ───────────────────────────────────────────────────────────────── */

const Card = styled.article`
  background-color: var(--color-blanco);
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (max-width: 600px) {
    padding: 24px;
  }
`;

const CardTitle = styled.h3`
  font-family: var(--font-family-secondary);
  font-weight: 700;
  font-size: 20px;
  color: var(--color-marron-tercero);
  margin: 0;
  line-height: 1.2;
`;

const CardDesc = styled.p`
  font-family: var(--font-family-secondary);
  font-size: 14px;
  color: rgba(0, 0, 0, 0.55);
  margin: 0;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
`;

const InfoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-family-secondary);
  font-size: 14px;
  color: var(--color-marron-tercero);

  svg {
    flex-shrink: 0;
  }
`;

const ReservarBtn = styled.button`
  background-color: var(--color-boton-promo);
  color: var(--color-blanco);
  font-family: var(--font-family-secondary);
  font-size: 16px;
  font-weight: 500;
  padding: 16px 24px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-decoration: none;
  margin-top: auto;
  transition: var(--transition-fast);

  &:hover {
    transform: translateY(-1px);
    opacity: 0.92;
  }
`;

/* ─── Footer link ───────────────────────────────────────────────────────── */

const Footer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 40px;

  @media (max-width: 600px) {
    margin-top: 28px;
  }
`;

const VerTodosLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-family-secondary);
  font-size: 16px;
  font-weight: 500;
  color: var(--color-marron-tercero);
  text-decoration: none;
  cursor: pointer;
  transition: var(--transition-fast);

  &:hover {
    opacity: 0.7;
  }
`;

// ─── Íconos ───────────────────────────────────────────────────────────────────

const HeaderIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M16.1693 29.3332H6.66667C5.95942 29.3332 5.28115 29.0522 4.78105 28.5521C4.28095 28.052 4 27.3737 4 26.6665V7.99984C4 7.29259 4.28095 6.61432 4.78105 6.11422C5.28115 5.61412 5.95942 5.33317 6.66667 5.33317H25.3333C26.0406 5.33317 26.7189 5.61412 27.2189 6.11422C27.719 6.61432 28 7.29259 28 7.99984V14.8332M21.3333 2.6665V7.99984M4 13.3332H28M10.6667 2.6665V7.99984M19.4933 25.0665C19.2128 24.774 18.9945 24.4278 18.8515 24.0486C18.7084 23.6695 18.6437 23.2653 18.6612 22.8604C18.6787 22.4556 18.778 22.0584 18.9532 21.693C19.1284 21.3276 19.3758 21.0015 19.6805 20.7343C19.9851 20.4671 20.3408 20.2644 20.7259 20.1385C21.1111 20.0125 21.5178 19.9659 21.9215 20.0014C22.3251 20.037 22.7174 20.1539 23.0747 20.3452C23.4319 20.5365 23.7467 20.7982 24 21.1145C24.2545 20.8015 24.5696 20.5431 24.9263 20.3546C25.283 20.1662 25.6741 20.0517 26.0761 20.0179C26.4781 19.9841 26.8828 20.0317 27.266 20.1579C27.6492 20.2841 28.003 20.4863 28.3062 20.7524C28.6094 21.0185 28.8559 21.343 29.0308 21.7066C29.2057 22.0701 29.3055 22.4652 29.3243 22.8682C29.343 23.2712 29.2802 23.6738 29.1397 24.052C28.9993 24.4302 28.7839 24.7761 28.5067 25.0692L25.0053 28.8772C24.8804 29.021 24.7261 29.1363 24.5528 29.2154C24.3794 29.2944 24.1912 29.3353 24.0007 29.3353C23.8102 29.3353 23.6219 29.2944 23.4486 29.2154C23.2752 29.1363 23.1209 29.021 22.996 28.8772L19.4933 25.0665Z"
      stroke="#160000"
      strokeWidth="2.66667"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CalendarStoreIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_406_22627)">
      <path
        d="M9.99932 13.9997V10.6663C9.99932 10.4895 9.92908 10.32 9.80405 10.1949C9.67903 10.0699 9.50946 9.99967 9.33265 9.99967H6.66598C6.48917 9.99967 6.3196 10.0699 6.19458 10.1949C6.06955 10.32 5.99932 10.4895 5.99932 10.6663V13.9997M11.8486 6.87301C11.7097 6.73997 11.5247 6.6657 11.3323 6.6657C11.1399 6.6657 10.955 6.73997 10.816 6.87301C10.506 7.16869 10.094 7.33364 9.66565 7.33364C9.23726 7.33364 8.82531 7.16869 8.51532 6.87301C8.37637 6.74016 8.19155 6.66602 7.99932 6.66602C7.80708 6.66602 7.62226 6.74016 7.48332 6.87301C7.17329 7.16888 6.7612 7.33396 6.33265 7.33396C5.9041 7.33396 5.49201 7.16888 5.18198 6.87301C5.04301 6.73997 4.85804 6.6657 4.66565 6.6657C4.47326 6.6657 4.28829 6.73997 4.14932 6.87301C3.84988 7.15875 3.45483 7.32285 3.04107 7.33337C2.6273 7.34389 2.22443 7.20008 1.91085 6.92993C1.59728 6.65977 1.39545 6.2826 1.34464 5.87184C1.29383 5.46107 1.39769 5.04609 1.63598 4.70767L3.56198 1.91834C3.68419 1.73802 3.84871 1.59038 4.04117 1.48834C4.23363 1.3863 4.44815 1.33297 4.66598 1.33301H11.3326C11.5498 1.33292 11.7638 1.3859 11.9558 1.48733C12.1479 1.58876 12.3123 1.73558 12.4346 1.91501L14.3646 4.70967C14.603 5.04836 14.7067 5.46365 14.6556 5.87463C14.6045 6.28561 14.4022 6.66284 14.0881 6.9328C13.774 7.20276 13.3707 7.34612 12.9567 7.33495C12.5427 7.32377 12.1477 7.15886 11.8486 6.87234M2.66598 7.29967V12.6663C2.66598 13.02 2.80646 13.3591 3.05651 13.6092C3.30656 13.8592 3.6457 13.9997 3.99932 13.9997H11.9993C12.3529 13.9997 12.6921 13.8592 12.9421 13.6092C13.1922 13.3591 13.3326 13.02 13.3326 12.6663V7.29967"
        stroke="#7C0405"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_406_22627">
        <rect width="16" height="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const MapPinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_406_22643)">
      <path
        d="M8.40002 14.5323C9.64002 13.4617 13.3327 9.99501 13.3327 6.66634C13.3327 5.25185 12.7708 3.8953 11.7706 2.89511C10.7704 1.89491 9.41384 1.33301 7.99935 1.33301C6.58486 1.33301 5.22831 1.89491 4.22811 2.89511C3.22792 3.8953 2.66602 5.25185 2.66602 6.66634C2.66602 9.99501 6.35868 13.4617 7.59868 14.5323C7.7142 14.6192 7.85482 14.6662 7.99935 14.6662C8.14388 14.6662 8.2845 14.6192 8.40002 14.5323Z"
        stroke="#7C0405"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.99935 8.66634C9.10392 8.66634 9.99935 7.77091 9.99935 6.66634C9.99935 5.56177 9.10392 4.66634 7.99935 4.66634C6.89478 4.66634 5.99935 5.56177 5.99935 6.66634C5.99935 7.77091 6.89478 8.66634 7.99935 8.66634Z"
        stroke="#7C0405"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_406_22643">
        <rect width="16" height="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M17 2.91005C16.0831 1.98416 14.991 1.25002 13.7875 0.750416C12.584 0.250812 11.2931 -0.00426317 9.99 5.38951e-05C4.53 5.38951e-05 0.0800002 4.45005 0.0800002 9.91005C0.0800002 11.6601 0.54 13.3601 1.4 14.8601L0 20.0001L5.25 18.6201C6.7 19.4101 8.33 19.8301 9.99 19.8301C15.45 19.8301 19.9 15.3801 19.9 9.92005C19.9 7.27005 18.87 4.78005 17 2.91005ZM9.99 18.1501C8.51 18.1501 7.06 17.7501 5.79 17.0001L5.49 16.8201L2.37 17.6401L3.2 14.6001L3 14.2901C2.17755 12.9771 1.74092 11.4593 1.74 9.91005C1.74 5.37005 5.44 1.67005 9.98 1.67005C12.18 1.67005 14.25 2.53005 15.8 4.09005C16.5676 4.85392 17.1759 5.7626 17.5896 6.76338C18.0033 7.76417 18.2142 8.83714 18.21 9.92005C18.23 14.4601 14.53 18.1501 9.99 18.1501ZM14.51 11.9901C14.26 11.8701 13.04 11.2701 12.82 11.1801C12.59 11.1001 12.43 11.0601 12.26 11.3001C12.09 11.5501 11.62 12.1101 11.48 12.2701C11.34 12.4401 11.19 12.4601 10.94 12.3301C10.69 12.2101 9.89 11.9401 8.95 11.1001C8.21 10.4401 7.72 9.63005 7.57 9.38005C7.43 9.13005 7.55 9.00005 7.68 8.87005C7.79 8.76005 7.93 8.58005 8.05 8.44005C8.17 8.30005 8.22 8.19005 8.3 8.03005C8.38 7.86005 8.34 7.72005 8.28 7.60005C8.22 7.48005 7.72 6.26005 7.52 5.76005C7.32 5.28005 7.11 5.34005 6.96 5.33005H6.48C6.31 5.33005 6.05 5.39005 5.82 5.64005C5.6 5.89005 4.96 6.49005 4.96 7.71005C4.96 8.93005 5.85 10.1101 5.97 10.2701C6.09 10.4401 7.72 12.9401 10.2 14.0101C10.79 14.2701 11.25 14.4201 11.61 14.5301C12.2 14.7201 12.74 14.6901 13.17 14.6301C13.65 14.5601 14.64 14.0301 14.84 13.4501C15.05 12.8701 15.05 12.3801 14.98 12.2701C14.91 12.1601 14.76 12.1101 14.51 11.9901Z"
      fill="white"
    />
  </svg>
);

const ChevronIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M9 18L15 12L9 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ProximosEventos() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${STRAPI_URL}/api/eventos?populate=*`)
      .then(res => res.json())
      .then(data => {
        if (data && data.data) {
          setEventos(data.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching eventos:', err);
        setLoading(false);
      });
  }, []);

  const handleReservar = (ev) => {
    const message = `Hola, me gustaría reservar un turno para el evento "${ev.titulo}" el día ${ev.fecha} en ${ev.ubicacion}.`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (loading || eventos.length === 0) return null;

  return (
    <Section>
      <Header>
        <HeaderIconWrap>
          <HeaderIcon />
        </HeaderIconWrap>
        <Title>Próximos eventos</Title>
      </Header>

      <CardsGrid>
        {eventos.map((item) => {
          const id = item.id || item.documentId;
          const ev = item.attributes || item;

          return (
            <Card key={id}>
              <CardTitle>{ev.titulo}</CardTitle>
              <CardDesc>{ev.descripcion}</CardDesc>

              <InfoList>
                <InfoRow>
                  <CalendarStoreIcon />
                  {ev.fecha}
                </InfoRow>
                <InfoRow>
                  <MapPinIcon />
                  {ev.ubicacion}
                </InfoRow>
              </InfoList>

              <ReservarBtn onClick={() => handleReservar(ev)}>
                Reservar turno
                <WhatsAppIcon />
              </ReservarBtn>
            </Card>
          );
        })}
      </CardsGrid>

      <Footer>
        <VerTodosLink href="#">
          Ver todos los eventos
          <ChevronIcon />
        </VerTodosLink>
      </Footer>
    </Section>
  );
}
