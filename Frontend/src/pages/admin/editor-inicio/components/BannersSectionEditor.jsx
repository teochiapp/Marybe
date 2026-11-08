import React from 'react';
import BannersAdmin from '../../BannersAdmin';

// Integra el editor de banners existente sin alterar su lógica de carga, edición ni guardado.
export default function BannersSectionEditor({ onBack, onLogout }) {
  return <BannersAdmin onBack={onBack} onLogout={onLogout} />;
}
