import React from 'react';
import PageLayout from '../../components/shared/PageLayout';
import LanzamientosContent from '../../components/categorias/lanzamientos/LanzamientosContent';

export default function Lanzamientos() {
  return (
    <PageLayout
      title="Nuevos Lanzamientos"
      subtitle="Explorá las fragancias recién llegadas a nuestro catálogo exclusivo"
      breadcrumbs={[{ label: 'Categorías', href: '#' }, { label: 'Lanzamientos' }]}
    >
      <LanzamientosContent />
    </PageLayout>
  );
}
