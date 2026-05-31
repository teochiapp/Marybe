import React from 'react';
<<<<<<< HEAD
import Header from './Pages/Componentes/Header';

function App() {
  return (
    <div className="App">
      <Header />
    </div>
=======
import { Routes, Route, Navigate } from 'react-router-dom';
import ApiProductos from './pages/ApiProductos';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/productos" replace />} />
      <Route path="/productos" element={<ApiProductos />} />
    </Routes>
>>>>>>> 7012e9a88a5144ec91aa78109784f1e2a0b5f007
  );
}

export default App;
