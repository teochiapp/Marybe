import React from 'react';
import PageLayout from '../../components/shared/PageLayout';
import BotonArrepentimientoContent from '../../components/ayuda/botonArrepentimiento/BotonArrepentimientoContent';

export default function BotonArrepentimiento() {
  return (
    <PageLayout
      title="Botón de Arrepentimiento"
      subtitle="Revocá tu compra online de forma directa y sin costo"
      breadcrumbs={[{ label: 'Ayuda', href: '#' }, { label: 'Botón de arrepentimiento' }]}
    >
      <BotonArrepentimientoContent />
    </PageLayout>
  );
}
