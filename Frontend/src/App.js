import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ApiProductos from './pages/ApiProductos';
import Header from './pages/Componentes/Header';

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Navigate to="" replace />} />
        <Route path="/productos" element={<ApiProductos />} />
      </Routes>
    </>
  );
}

export default App;
