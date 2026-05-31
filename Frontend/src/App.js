import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ApiProductos from './pages/ApiProductos';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/productos" replace />} />
      <Route path="/productos" element={<ApiProductos />} />
    </Routes>
  );
}

export default App;
