import React from 'react';
import styled from 'styled-components';
import SocialBanner from './SocialBanner';
import FormularioContacto from './FormularioContacto';
import ArrepentimientoBanner from './ArrepentimientoBanner';

const Container = styled.div`
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 var(--spacing-xl);

  @media (max-width: 600px) {
    padding: 0 var(--spacing-md);
  }
`;

const Spacer = styled.div`
  height: ${({ $size }) => $size || 'var(--spacing-xxl)'};
`;

export default function ContactoContent() {
  return (
    <>
      <Container>
        <SocialBanner />
      </Container>

      <Spacer />

      <FormularioContacto />

      <Spacer />

      <Container>
        <ArrepentimientoBanner />
      </Container>

      <Spacer />
    </>
  );
}
