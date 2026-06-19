import React, { useEffect, useContext, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import PageLayout from '../../components/shared/PageLayout';
import MiCuentaContent from '../../components/pedidos/miCuenta/MiCuentaContent';
import { AuthContext } from '../../context/AuthContext';

export default function MiCuenta() {
  const { isAuthenticated, isLoading, openAuthModal } = useContext(AuthContext);
  // Recordamos si el usuario estuvo logueado dentro de esta pantalla.
  // Si se desloguea (Cerrar Sesión), redirigimos sin abrir el modal.
  const wasAuthenticated = useRef(false);

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) {
      wasAuthenticated.current = true;
      return;
    }
    // No está logueado: solo abrimos el modal si nunca estuvo logueado aquí
    if (!wasAuthenticated.current) {
      openAuthModal();
    }
  }, [isLoading, isAuthenticated, openAuthModal]);

  if (isLoading) return null;

  if (!isAuthenticated) return <Navigate to="/inicio" replace />;

  return (
    <PageLayout
      bgColor="#FFFFFF"
      breadcrumbs={[{ label: 'Mi cuenta' }]}
    >
      <MiCuentaContent />
    </PageLayout>
  );
}
