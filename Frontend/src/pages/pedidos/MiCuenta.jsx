import React from 'react';
import PageLayout from '../../components/shared/PageLayout';
import MiCuentaContent from '../../components/pedidos/miCuenta/MiCuentaContent';

export default function MiCuenta() {
  return (
    <PageLayout
      title="Mi Cuenta"
      subtitle="Gestioná tus datos personales, pedidos y preferencias"
      breadcrumbs={[{ label: 'Mis Pedidos', href: '#' }, { label: 'Mi cuenta' }]}
    >
      <MiCuentaContent />
    </PageLayout>
  );
}
