import React, { useEffect } from 'react';
import styled from 'styled-components';
import TerminosCondicionesContent from '../../components/ayuda/terminosCondiciones/TerminosCondicionesContent';

const Page = styled.div`
  background-color: var(--color-blanco);
  min-height: 80vh;
  font-family: var(--font-family-secondary);
`;

export default function TerminosCondiciones() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <Page>
      <TerminosCondicionesContent />
    </Page>
  );
}
