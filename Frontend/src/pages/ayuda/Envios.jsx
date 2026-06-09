import React from 'react';
import PageLayout from '../../components/shared/PageLayout';
import EnviosContent from '../../components/ayuda/envios/EnviosContent';

export default function Envios() {
  return (
    <PageLayout
      title="Información de Envíos"
      subtitle="Todo lo que necesitás saber para recibir tus productos Marybe"
      breadcrumbs={[{ label: 'Ayuda', href: '#' }, { label: 'Envíos' }]}
    >
      <EnviosContent />
    </PageLayout>
  );
}
