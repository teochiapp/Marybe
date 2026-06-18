import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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
import SeguimientoEnvio from './pages/pedidos/SeguimientoEnvio';
import CanjearGiftCard from './pages/pedidos/CanjearGiftCard';

// Páginas de Categorías
import Ofertas from './pages/categorias/Ofertas';
import Lanzamientos from './pages/categorias/Lanzamientos';
import Eventos from './pages/categorias/Eventos';
import PromocionesBancarias from './pages/categorias/PromocionesBancarias';

// Página de Contacto
import Contacto from './pages/contacto/Contacto';

// Página de Sucursales
import Sucursales from './pages/sucursales/Sucursales';

// Página de Nuestra Historia
import NuestraHistoria from './pages/nuestra-historia/NuestraHistoria';

// Página de Arrepentimiento
import Arrepentimiento from './pages/arrepentimiento/Arrepentimiento';

// Página de Método de envío
import MetodoEnvio from './pages/metodo-envio/MetodoEnvio';

// Panel de Administración
import ImportacionAdmin from './pages/admin/ImportacionAdmin';

// Página de Gift Card
import GiftCardPage from './pages/gift-card/GiftCardPage';

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Navigate to="/inicio" replace />} />
        <Route path="/inicio" element={<Inicio />} />
        <Route path="/tienda" element={<Catalogo />} />
        <Route path="/producto/:id" element={<ProductoSingle />} />
        <Route path="/productos" element={<ApiProductos />} />

        {/* Rutas de Ayuda */}
        <Route path="/preguntas-frecuentes" element={<PreguntasFrecuentes />} />
        <Route path="/envios" element={<Envios />} />
        <Route path="/cambios-devoluciones" element={<CambiosDevoluciones />} />
        <Route path="/terminos-condiciones" element={<TerminosCondiciones />} />

        {/* Rutas de Pedidos */}
        <Route path="/mi-cuenta" element={<MiCuenta />} />
        <Route path="/seguimiento-envio" element={<SeguimientoEnvio />} />
        <Route path="/canjear-gift-card" element={<CanjearGiftCard />} />

        {/* Rutas de Categorías */}
        <Route path="/ofertas" element={<Ofertas />} />
        <Route path="/lanzamientos" element={<Lanzamientos />} />
        <Route path="/eventos" element={<Eventos />} />
        <Route path="/promociones-bancarias" element={<PromocionesBancarias />} />

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

        {/* Ruta de Gift Card */}
        <Route path="/gift-card" element={<GiftCardPage />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
