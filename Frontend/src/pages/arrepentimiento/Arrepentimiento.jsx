import React, { useEffect } from 'react';
import styled from 'styled-components';
import ArrepentimientoContent from '../../components/arrepentimiento/ArrepentimientoContent';

const Page = styled.div`
  background-color: var(--color-blanco);
  font-family: var(--font-family-secondary);
`;

export default function Arrepentimiento() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <Page>
      <ArrepentimientoContent />
    </Page>
  );
}
