import React from 'react';
import PageLayout from '../../components/shared/PageLayout';
import TerminosCondicionesContent from '../../components/ayuda/terminosCondiciones/TerminosCondicionesContent';

export default function TerminosCondiciones() {
  return (
    <PageLayout
      title="Términos y Condiciones"
      subtitle="Condiciones generales de uso del sitio web y transacciones comerciales"
      breadcrumbs={[{ label: 'Ayuda', href: '#' }, { label: 'Términos y Condiciones' }]}
    >
      <TerminosCondicionesContent />
    </PageLayout>
  );
}