import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AuthModal from './components/auth/AuthModal';
import AuthRedirect from './components/auth/AuthRedirect';

// Componentes principales que siempre se cargan
import Header from './components/header/Header';
import Footer from './components/footer/Footer';

// Lazy load para las páginas
const ApiProductos = lazy(() => import('./pages/ApiProductos'));
const ProductoSingle = lazy(() => import('./pages/tienda/ProductoSingle'));
const Inicio = lazy(() => import('./pages/inicio/Inicio'));
const Catalogo = lazy(() => import('./pages/tienda/Catalogo'));

// Páginas de Ayuda
const PreguntasFrecuentes = lazy(() => import('./pages/ayuda/PreguntasFrecuentes'));
const Envios = lazy(() => import('./pages/ayuda/Envios'));
const CambiosDevoluciones = lazy(() => import('./pages/ayuda/CambiosDevoluciones'));
const TerminosCondiciones = lazy(() => import('./pages/ayuda/TerminosCondiciones'));

// Páginas de Pedidos
const MiCuenta = lazy(() => import('./pages/pedidos/MiCuenta'));

// Página de Contacto
const Contacto = lazy(() => import('./pages/contacto/Contacto'));

// Página de Sucursales
const Sucursales = lazy(() => import('./pages/sucursales/Sucursales'));

// Página de Nuestra Historia
const NuestraHistoria = lazy(() => import('./pages/nuestra-historia/NuestraHistoria'));

// Página de Arrepentimiento
const Arrepentimiento = lazy(() => import('./pages/arrepentimiento/Arrepentimiento'));

// Página 404
const NotFound = lazy(() => import('./pages/not-found/NotFound'));

// Página de Método de envío
const MetodoEnvio = lazy(() => import('./pages/metodo-envio/MetodoEnvio'));

// Panel de Administración
const ImportacionAdmin = lazy(() => import('./pages/admin/ImportacionAdmin'));
const PedidosAdmin = lazy(() => import('./pages/admin/PedidosAdmin'));

// Página de Gift Card
const GiftCardPage = lazy(() => import('./pages/gift-card/GiftCardPage'));

// Carrito
const Carrito = lazy(() => import('./pages/carrito/Carrito'));

// Checkout
const Login = lazy(() => import('./pages/checkout/Login'));
const Envio = lazy(() => import('./pages/checkout/Envio'));
const Pago = lazy(() => import('./pages/checkout/Pago'));
const OrderSuccess = lazy(() => import('./pages/checkout/OrderSuccess'));
const OrderError = lazy(() => import('./pages/checkout/OrderError'));

function App() {
  return (
    <AuthProvider>
      <Header />
      <AuthModal />
      <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>Cargando...</div>}>
        <Routes>
          <Route path="/" element={<Navigate to="/inicio" replace />} />
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
