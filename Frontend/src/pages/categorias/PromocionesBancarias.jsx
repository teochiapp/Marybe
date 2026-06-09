import React from 'react';
import PageLayout from '../../components/shared/PageLayout';
import PromocionesBancariasContent from '../../components/categorias/promocionesBancarias/PromocionesBancariasContent';

export default function PromocionesBancarias() {
  return (
    <PageLayout
      title="Promociones Bancarias"
      subtitle="Conocé los descuentos vigentes de tus entidades bancarias favoritas"
      breadcrumbs={[{ label: 'Categorías', href: '#' }, { label: 'Promociones bancarias' }]}
    >
      <PromocionesBancariasContent />
    </PageLayout>
  );
}
