import React from 'react';
import PageLayout from '../../components/shared/PageLayout';
import PreguntasFrecuentesContent from '../../components/ayuda/preguntasFrecuentes/PreguntasFrecuentesContent';

export default function PreguntasFrecuentes() {
  return (
    <PageLayout
      title="Preguntas Frecuentes"
      subtitle="Encontrá respuestas rápidas a tus consultas"
      breadcrumbs={[{ label: 'Ayuda', href: '#' }, { label: 'Preguntas Frecuentes' }]}
    >
      <PreguntasFrecuentesContent />
    </PageLayout>
  );
}
