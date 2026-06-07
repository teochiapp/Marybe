import React from 'react';
import PageLayout from '../../components/shared/PageLayout';
import OfertasContent from '../../components/categorias/ofertas/OfertasContent';

export default function Ofertas() {
  return (
    <PageLayout
      title="Ofertas Especiales"
      subtitle="Descubrí los mejores descuentos y promociones en perfumería y cosmética"
      breadcrumbs={[{ label: 'Categorías', href: '#' }, { label: 'Ofertas' }]}
    >
      <OfertasContent />
    </PageLayout>
  );
}
