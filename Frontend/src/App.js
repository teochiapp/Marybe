import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ApiProductos from './Pages/ApiProductos';
import Header from './Pages/Componentes/Header';
import Footer from './Pages/Componentes/Footer';

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Navigate to="" replace />} />
        <Route path="/productos" element={<ApiProductos />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
