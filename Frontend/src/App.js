import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AuthModal from './components/auth/AuthModal';
import AuthRedirect from './components/auth/AuthRedirect';

// Componentes principales que siempre se cargan
import Header from './components/header/Header';
import Footer from './components/footer/Footer';

// ── Rutas Críticas (Carga Síncrona) ──
import Inicio from './pages/inicio/Inicio';
import Catalogo from './pages/tienda/Catalogo';
import ProductoSingle from './pages/tienda/ProductoSingle';
import Carrito from './pages/carrito/Carrito';
import Login from './pages/checkout/Login';
import Envio from './pages/checkout/Envio';
import Pago from './pages/checkout/Pago';
import OrderSuccess from './pages/checkout/OrderSuccess';
import OrderError from './pages/checkout/OrderError';

// Función para reintentar la carga del chunk y recargar la página si falla
const lazyWithRetry = (componentImport) =>
  lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false'
    );

    try {
      const component = await componentImport();
      window.sessionStorage.setItem('page-has-been-force-refreshed', 'false');
      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        window.sessionStorage.setItem('page-has-been-force-refreshed', 'true');
        window.location.reload();
        // Devolvemos una promesa que nunca se resuelve para que Suspense espere la recarga
        return new Promise(() => {});
      }
      throw error;
    }
  });

// ── Rutas Secundarias (Carga Perezosa / Lazy) ──
const ApiProductos = lazyWithRetry(() => import('./pages/ApiProductos'));

// Páginas de Ayuda
const PreguntasFrecuentes = lazyWithRetry(() => import('./pages/ayuda/PreguntasFrecuentes'));
const CambiosDevoluciones = lazyWithRetry(() => import('./pages/ayuda/CambiosDevoluciones'));
const TerminosCondiciones = lazyWithRetry(() => import('./pages/ayuda/TerminosCondiciones'));

// Páginas de Pedidos
const MiCuenta = lazyWithRetry(() => import('./pages/pedidos/MiCuenta'));

// Página de Contacto
const Contacto = lazyWithRetry(() => import('./pages/contacto/Contacto'));

// Página de Sucursales
const Sucursales = lazyWithRetry(() => import('./pages/sucursales/Sucursales'));

// Página de Nuestra Historia
const NuestraHistoria = lazyWithRetry(() => import('./pages/nuestra-historia/NuestraHistoria'));

// Página de Arrepentimiento
const Arrepentimiento = lazyWithRetry(() => import('./pages/arrepentimiento/Arrepentimiento'));

// Página 404
const NotFound = lazyWithRetry(() => import('./pages/not-found/NotFound'));

// Página de Método de envío
const MetodoEnvio = lazyWithRetry(() => import('./pages/metodo-envio/MetodoEnvio'));

// Panel de Administración (Muy pesados, ideal para lazy)
const ImportacionAdmin = lazyWithRetry(() => import('./pages/admin/ImportacionAdmin'));
const PedidosAdmin = lazyWithRetry(() => import('./pages/admin/PedidosAdmin'));

// Página de Gift Card
const GiftCardPage = lazyWithRetry(() => import('./pages/gift-card/GiftCardPage'));

// Componente para la raíz / que detecta tokens de OAuth antes de redirigir a /inicio
function RootRoute() {
  const location = useLocation();
  if (location.search.includes('access_token') || location.search.includes('id_token') || location.search.includes('oauth_login')) {
    return <AuthRedirect />;
  }
  return <Navigate to="/inicio" replace />;
}

function App() {
  return (
    <AuthProvider>
      <Header />
      <AuthModal />
      <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>Cargando...</div>}>
        <Routes>
          <Route path="/" element={<RootRoute />} />
          <Route path="/inicio" element={<Inicio />} />
          <Route path="/tienda" element={<Catalogo />} />
          <Route path="/producto/:id" element={<ProductoSingle />} />
          <Route path="/productos" element={<ApiProductos />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/login" element={<Login />} />
          <Route path="/envio" element={<Envio />} />
          <Route path="/pago" element={<Pago />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/order-error" element={<OrderError />} />
          <Route path="/auth/google/callback" element={<AuthRedirect />} />

          {/* Rutas de Ayuda */}
          <Route path="/preguntas-frecuentes" element={<PreguntasFrecuentes />} />
          {/* <Route path="/envios" element={<Envios />} /> */}
          <Route path="/cambios-devoluciones" element={<CambiosDevoluciones />} />
          <Route path="/terminos-condiciones" element={<TerminosCondiciones />} />

          {/* Rutas de Pedidos */}
          <Route path="/mi-cuenta" element={<MiCuenta />} />

          {/* Ruta de Contacto */}
          <Route path="/contacto" element={<Contacto />} />

          {/* Ruta de Sucursales */}
          <Route path="/sucursales" element={<Sucursales />} />

          {/* Ruta de Nuestra Historia */}
          <Route path="/nuestra-historia" element={<NuestraHistoria />} />

          {/* Ruta de Arrepentimiento */}
          <Route path="/arrepentimiento" element={<Arrepentimiento />} />

          {/* Ruta de Método de envío */}
          <Route path="/metodo-envio" element={<MetodoEnvio />} />

          {/* Panel de Administración */}
          <Route path="/importacion-admin" element={<ImportacionAdmin />} />
          <Route path="/pedidos-admin" element={<PedidosAdmin />} />

          {/* Ruta de Gift Card */}
          <Route path="/gift-card" element={<GiftCardPage />} />

          {/* Ruta 404 (Catch all) */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Footer />
    </AuthProvider>
  );
}

export default App;
