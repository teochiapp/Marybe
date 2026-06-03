import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ApiProductos from './pages/ApiProductos';
import Inicio from './pages/inicio/Inicio';
import Tienda from './pages/tienda/Tienda';
import Header from './components/header/Header';
import Footer from './components/footer/Footer';

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Navigate to="/inicio" replace />} />
        <Route path="/inicio" element={<Inicio />} />
        <Route path="/tienda" element={<Tienda />} />
        <Route path="/productos" element={<ApiProductos />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
