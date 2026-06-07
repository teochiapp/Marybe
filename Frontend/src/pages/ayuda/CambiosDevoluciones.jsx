import React from 'react';
import PageLayout from '../../components/shared/PageLayout';
import CambiosDevolucionesContent from '../../components/ayuda/cambiosDevoluciones/CambiosDevolucionesContent';

export default function CambiosDevoluciones() {
  return (
    <PageLayout
      title="Cambios y Devoluciones"
      subtitle="Conocé nuestras políticas y gestioná tus solicitudes de forma simple"
      breadcrumbs={[{ label: 'Ayuda', href: '#' }, { label: 'Cambios y Devoluciones' }]}
    >
      <CambiosDevolucionesContent />
    </PageLayout>
  );
}
