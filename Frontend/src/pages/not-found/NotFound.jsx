import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Container = styled.div`
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: var(--color-blanco);
  text-align: center;
  padding: 40px 20px;
`;

const ErrorCode = styled(motion.h1)`
  font-family: var(--font-family-primary);
  font-size: clamp(6rem, 15vw, 12rem);
  font-weight: 700;
  color: var(--color-marron-principal);
  line-height: 1;
  margin: 0;
  text-shadow: 4px 4px 0px rgba(124, 4, 5, 0.1);
`;

const Title = styled(motion.h2)`
  font-family: var(--font-family-secondary);
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  font-weight: 600;
  color: #1a1a1a;
  margin: 20px 0 10px;
`;

const Description = styled(motion.p)`
  font-family: var(--font-family-secondary);
  font-size: 1.1rem;
  color: #666;
  max-width: 500px;
  margin: 0 auto 40px;
  line-height: 1.6;
`;

const BackButton = styled(motion.button)`
  background-color: var(--color-marron-cuarto);
  color: var(--color-blanco);
  font-family: var(--font-family-secondary);
  font-weight: 600;
  font-size: 1rem;
  padding: 16px 32px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;

  &:hover {
    background-color: var(--color-marron-principal);
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(62, 1, 2, 0.15);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Container>
      <ErrorCode
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        404
      </ErrorCode>
      <Title
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        Página no encontrada
      </Title>
      <Description
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        Lo sentimos, la página que estás buscando no existe, fue eliminada o cambió de lugar temporalmente.
      </Description>
      <BackButton
        onClick={() => navigate('/')}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Volver al inicio
      </BackButton>
    </Container>
  );
}
