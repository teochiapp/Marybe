import React from 'react';
import PageLayout from '../../components/shared/PageLayout';
import EventosContent from '../../components/categorias/eventos/EventosContent';

export default function Eventos() {
  return (
    <PageLayout
      title="Eventos & Masterclasses"
      subtitle="Participá de nuestros talleres interactivos y lanzamientos exclusivos"
      breadcrumbs={[{ label: 'Categorías', href: '#' }, { label: 'Eventos' }]}
    >
      <EventosContent />
    </PageLayout>
  );
}
