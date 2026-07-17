import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LazyMotion, domAnimation } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import AuthRedirect from './components/auth/AuthRedirect';
import { lazyWithRetry } from './utils/lazyWithRetry';

// Componentes principales que siempre se cargan en la estructura base
import Header from './components/header/Header';
import Footer from './components/footer/Footer';

// ── Rutas Críticas (Carga Síncrona solo para la portada) ──
import Inicio from './pages/inicio/Inicio';

// Modales y rutas que no se necesitan en el render principal inicial (Lazy load para reducir Script Evaluation)
const AuthModal = lazyWithRetry(() => import('./components/auth/AuthModal'), 'AuthModal');

// ── Rutas de Tienda y Checkout (Carga Perezosa / Lazy con reintentos para evitar sobrecargar el Main Bundle) ──
const Catalogo = lazyWithRetry(() => import('./pages/tienda/Catalogo'), 'Catalogo');
const ProductoSingle = lazyWithRetry(() => import('./pages/tienda/ProductoSingle'), 'ProductoSingle');
const Carrito = lazyWithRetry(() => import('./pages/carrito/Carrito'), 'Carrito');
const Login = lazyWithRetry(() => import('./pages/checkout/Login'), 'Login');
const Envio = lazyWithRetry(() => import('./pages/checkout/Envio'), 'Envio');
const Pago = lazyWithRetry(() => import('./pages/checkout/Pago'), 'Pago');
const OrderSuccess = lazyWithRetry(() => import('./pages/checkout/OrderSuccess'), 'OrderSuccess');
const OrderError = lazyWithRetry(() => import('./pages/checkout/OrderError'), 'OrderError');

// ── Rutas Secundarias (Carga Perezosa / Lazy con reintentos) ──
const ApiProductos = lazyWithRetry(() => import('./pages/ApiProductos'), 'ApiProductos');

// Páginas de Ayuda
const PreguntasFrecuentes = lazyWithRetry(() => import('./pages/ayuda/PreguntasFrecuentes'), 'PreguntasFrecuentes');
const CambiosDevoluciones = lazyWithRetry(() => import('./pages/ayuda/CambiosDevoluciones'), 'CambiosDevoluciones');
const TerminosCondiciones = lazyWithRetry(() => import('./pages/ayuda/TerminosCondiciones'), 'TerminosCondiciones');

// Páginas de Pedidos
const MiCuenta = lazyWithRetry(() => import('./pages/pedidos/MiCuenta'), 'MiCuenta');

// Página de Contacto
const Contacto = lazyWithRetry(() => import('./pages/contacto/Contacto'), 'Contacto');

// Página de Sucursales
const Sucursales = lazyWithRetry(() => import('./pages/sucursales/Sucursales'), 'Sucursales');

// Página de Nuestra Historia
const NuestraHistoria = lazyWithRetry(() => import('./pages/nuestra-historia/NuestraHistoria'), 'NuestraHistoria');

// Página de Arrepentimiento
const Arrepentimiento = lazyWithRetry(() => import('./pages/arrepentimiento/Arrepentimiento'), 'Arrepentimiento');

// Página 404
const NotFound = lazyWithRetry(() => import('./pages/not-found/NotFound'), 'NotFound');

// Página de Método de envío
const MetodoEnvio = lazyWithRetry(() => import('./pages/metodo-envio/MetodoEnvio'), 'MetodoEnvio');

// Panel de Administración (Muy pesados, ideal para lazy)
const ImportacionAdmin = lazyWithRetry(() => import('./pages/admin/ImportacionAdmin'), 'ImportacionAdmin');
const ExportacionAdmin = lazyWithRetry(() => import('./pages/admin/ExportacionAdmin'), 'ExportacionAdmin');
const ComparacionAdmin = lazyWithRetry(() => import('./pages/admin/ComparacionAdmin'), 'ComparacionAdmin');
const PedidosAdmin = lazyWithRetry(() => import('./pages/admin/PedidosAdmin'), 'PedidosAdmin');

// Página de Gift Card
const GiftCardPage = lazyWithRetry(() => import('./pages/gift-card/GiftCardPage'), 'GiftCardPage');

// Componente para la raíz / que detecta tokens de OAuth antes de redirigir a /inicio
function RootRoute() {
  const location = useLocation();
  const query = location.search;
  return <Navigate to={`/inicio${query}`} replace />;
}

function App() {
  return (
    <AuthProvider>
      <LazyMotion features={domAnimation}>
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
            <Route path="/exportacion-admin" element={<ExportacionAdmin />} />
            <Route path="/comparacion-admin" element={<ComparacionAdmin />} />
            <Route path="/pedidos-admin" element={<PedidosAdmin />} />

            {/* Ruta de Gift Card */}
            <Route path="/gift-card" element={<GiftCardPage />} />

            {/* Ruta 404 (Catch all) */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <Footer />
      </LazyMotion>
    </AuthProvider>
  );
}

export default App;
