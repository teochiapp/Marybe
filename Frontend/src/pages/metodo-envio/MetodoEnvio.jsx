import React, { useEffect } from 'react';
import styled from 'styled-components';
import MetodoEnvioContent from '../../components/metodo-envio/MetodoEnvioContent';

const Page = styled.div`
  background-color: var(--color-blanco);
  min-height: 80vh;
  font-family: var(--font-family-secondary);
`;

export default function MetodoEnvio() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <Page>
      <MetodoEnvioContent />
    </Page>
  );
}
