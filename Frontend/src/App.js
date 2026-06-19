import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AuthModal from './components/auth/AuthModal';
import AuthRedirect from './components/auth/AuthRedirect';

import ApiProductos from './pages/ApiProductos';
import ProductoSingle from './pages/tienda/ProductoSingle';
import Inicio from './pages/inicio/Inicio';
import Catalogo from './pages/tienda/Catalogo';
import Header from './components/header/Header';
import Footer from './components/footer/Footer';

// Páginas de Ayuda
import PreguntasFrecuentes from './pages/ayuda/PreguntasFrecuentes';
import Envios from './pages/ayuda/Envios';
import CambiosDevoluciones from './pages/ayuda/CambiosDevoluciones';
import TerminosCondiciones from './pages/ayuda/TerminosCondiciones';

// Páginas de Pedidos
import MiCuenta from './pages/pedidos/MiCuenta';
// import SeguimientoEnvio from './pages/pedidos/SeguimientoEnvio';

// Páginas de Categorías (desactivadas temporalmente)

// Página de Contacto
import Contacto from './pages/contacto/Contacto';

// Página de Sucursales
import Sucursales from './pages/sucursales/Sucursales';

// Página de Nuestra Historia
import NuestraHistoria from './pages/nuestra-historia/NuestraHistoria';

// Página de Arrepentimiento
import Arrepentimiento from './pages/arrepentimiento/Arrepentimiento';

// Página 404
import NotFound from './pages/not-found/NotFound';

// Página de Método de envío
import MetodoEnvio from './pages/metodo-envio/MetodoEnvio';

// Panel de Administración
import ImportacionAdmin from './pages/admin/ImportacionAdmin';
import PedidosAdmin from './pages/admin/PedidosAdmin';

// Página de Gift Card
import GiftCardPage from './pages/gift-card/GiftCardPage';
// Carrito
import Carrito from './pages/carrito/Carrito';

// Checkout
import Login from './pages/checkout/Login';
import Envio from './pages/checkout/Envio';
import Pago from './pages/checkout/Pago';
import OrderSuccess from './pages/checkout/OrderSuccess';
import OrderError from './pages/checkout/OrderError';

function App() {
  return (
    <AuthProvider>
      <Header />
      <AuthModal />
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
        {/* <Route path="/seguimiento-envio" element={<SeguimientoEnvio />} /> */}

        {/* Rutas de Categorías (desactivadas) */}

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
      <Footer />
    </AuthProvider>
  );
}

export default App;
