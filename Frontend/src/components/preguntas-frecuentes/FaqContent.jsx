import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const Wrapper = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: var(--spacing-xxl) var(--spacing-xl) 5rem;
  font-family: var(--font-family-secondary);

  @media (max-width: 600px) {
    padding: var(--spacing-xl) var(--spacing-md) 3rem;
  }
`;

const Title = styled.h1`
  font-family: var(--font-family-primary);
  font-style: italic;
  font-weight: 600;
  font-size: 2.6rem;
  color: #280101;
  margin: 0 0 var(--spacing-xxl);
  margin-left: -40px;

  @media (max-width: 600px) {
    font-size: 2rem;
    margin-left: 0;
  }
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const Item = styled(motion.div)`
  background-color: #FAF9F7;
  border-radius: 16px;
  overflow: hidden;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    background-color: #f1e9e4;
    box-shadow: 0 6px 18px -8px rgba(40, 1, 1, 0.25);
  }
`;

const Header = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  padding: 20px 24px;
  font-family: var(--font-family-secondary);
  font-size: 1.05rem;
  font-weight: 600;
  color: #1f1a17;
  transition: color 0.25s ease;

  &:hover {
    color: var(--color-bordo-secundario);
  }
`;

/* Icono + que rota y colapsa la barra vertical para transformarse en - */
const IconBox = styled(motion.span)`
  position: relative;
  width: 20px;
  height: 20px;
  flex-shrink: 0;

  &::before,
  &::after {
    content: '';
    position: absolute;
    background-color: currentColor;
    border-radius: 2px;
  }

  &::before {
    top: 50%;
    left: 0;
    width: 100%;
    height: 2px;
    transform: translateY(-50%);
  }

  &::after {
    left: 50%;
    top: 0;
    width: 2px;
    height: 100%;
    transform: translateX(-50%) scaleY(${({ $open }) => ($open ? 0 : 1)});
    transition: transform 0.3s ease;
  }
`;

const Answer = styled.div`
  padding: 0 24px 22px;
  font-size: 0.95rem;
  line-height: 1.6;
  color: #5b524c;
`;

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';

const faqs = [
  '¿Cómo realizo una compra?',
  '¿Qué medios de pago aceptan?',
  '¿Realizan envíos?',
  '¿Cómo sé si mi compra fue confirmada?',
  '¿Puedo retirar mi pedido personalmente?',
  '¿Puede retirar otra persona?',
  '¿Cómo puedo comunicarme con atención al cliente?',
  '¿Los productos publicados tienen stock?',
];

export default function FaqContent() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (index) => {
    setOpenIndex((prev) => (prev === index ? -1 : index));
  };

  return (
    <Wrapper>
      <Title>Preguntas frecuentes</Title>
      <List>
        {faqs.map((question, index) => {
          const isOpen = openIndex === index;
          return (
            <Item
              key={question}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.05, ease: 'easeOut' }}
            >
              <Header onClick={() => toggle(index)} aria-expanded={isOpen}>
                {question}
                <IconBox
                  $open={isOpen}
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                />
              </Header>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
                    style={{ overflow: 'hidden' }}
                  >
                    <Answer>{LOREM}</Answer>
                  </motion.div>
                )}
              </AnimatePresence>
            </Item>
          );
        })}
      </List>
    </Wrapper>
  );
}
