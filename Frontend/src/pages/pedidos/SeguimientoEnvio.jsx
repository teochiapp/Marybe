import React from 'react';
import PageLayout from '../../components/shared/PageLayout';
import SeguimientoEnvioContent from '../../components/pedidos/seguimientoEnvio/SeguimientoEnvioContent';

export default function SeguimientoEnvio() {
  return (
    <PageLayout
      title="Seguimiento de Envío"
      subtitle="Conocé el estado en tiempo real de tu pedido online"
      breadcrumbs={[{ label: 'Mis Pedidos', href: '#' }, { label: 'Seguimiento de envío' }]}
    >
      <SeguimientoEnvioContent />
    </PageLayout>
  );
}
