import React from 'react';
import PageLayout from '../../components/shared/PageLayout';
import CanjearGiftCardContent from '../../components/pedidos/canjearGiftCard/CanjearGiftCardContent';

export default function CanjearGiftCard() {
  return (
    <PageLayout
      title="Canjear Gift Card"
      subtitle="Consultá el saldo y activá tus tarjetas de regalo Marybe"
      breadcrumbs={[{ label: 'Mis Pedidos', href: '#' }, { label: 'Canjear Gift card' }]}
    >
      <CanjearGiftCardContent />
    </PageLayout>
  );
}
