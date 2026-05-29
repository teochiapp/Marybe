// AppRoutes.jsx
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import BlogPost from './components/blog/BlogPost'
import TeoChiappero from './pages/TeoChiappero'
import Loader from './components/loader'
import Header from './pages/Header'
import ErrorBoundary from './components/ErrorBoundary'
import Agnes from './pages/presupuestos/BudgetAgnes'
import TresNoches from './pages/presupuestos/TresNoches'
import Lucho from './pages/presupuestos/Lucho'
import VillaMarAlimentos from './pages/presupuestos/VillaMarAlimentos'
import ColegioAbogados from './pages/presupuestos/ColegioAbogados'
import SBYogaShala from './pages/presupuestos/SBYogaShala'
import FullPower from './pages/presupuestos/FullPower'
import Marybe from './pages/presupuestos/Marybe'
import Domus from './pages/presupuestos/Domus'


export default function AppRoutes() {
  // Component structure for Home page (reused for both languages)
  const HomePage = (
    <>
      <ErrorBoundary>
        <Header />
      </ErrorBoundary>
      <ErrorBoundary>
        <Loader />
      </ErrorBoundary>
      <ErrorBoundary>
        <Home />
      </ErrorBoundary>
    </>
  );

  return (
    <ErrorBoundary>
      <Routes>
        {/* Spanish version (default) */}
        <Route path='/' element={HomePage} />

        {/* English version */}
        <Route path='/eng' element={HomePage} />

        {/* Blog posts */}
        <Route path='/blog/:slug' element={
          <ErrorBoundary>
            <BlogPost />
          </ErrorBoundary>
        } />

        {/* English blog posts */}
        <Route path='/eng/blog/:slug' element={
          <ErrorBoundary>
            <BlogPost />
          </ErrorBoundary>
        } />

        {/* Teo Chiappero page */}
        <Route path='/teo-chiappero' element={
          <ErrorBoundary>
            <TeoChiappero />
          </ErrorBoundary>
        } />

        {/* English Teo Chiappero page */}
        <Route path='/eng/teo-chiappero' element={
          <ErrorBoundary>
            <TeoChiappero />
          </ErrorBoundary>
        } />

        {/* Agnes page */}
        <Route path='/budget/agnes' element={
          <ErrorBoundary>
            <Agnes />
          </ErrorBoundary>
        } />
        {/* Full Power page */}
        <Route path='/presupuesto/fullpower' element={
          <ErrorBoundary>
            <FullPower />
          </ErrorBoundary>
        } />
        {/* Tres Noches al Año page */}
        <Route path='/presupuestos/tres-noches' element={
          <ErrorBoundary>
            <TresNoches />
          </ErrorBoundary>
        } />
        {/* Tres Noches al Año page */}
        <Route path='/presupuestos/lucho' element={
          <ErrorBoundary>
            <Lucho />
          </ErrorBoundary>
        } />
        {/* Tres Noches al Año page */}
        <Route path='/presupuestos/villa-mar-alimentos' element={
          <ErrorBoundary>
            <VillaMarAlimentos />
          </ErrorBoundary>
        } />

        {/* Agnes page */}
        <Route path='/presupuesto/colegio-abogados' element={
          <ErrorBoundary>
            <ColegioAbogados />
          </ErrorBoundary>
        } />
        {/* SB Yoga Shala page */}
        <Route path='/presupuestos/sb-yoga-shala' element={
          <ErrorBoundary>
            <SBYogaShala />
          </ErrorBoundary>
        } />
        {/* Marybe page */}
        <Route path='/presupuestos/marybe' element={
          <ErrorBoundary>
            <Marybe />
          </ErrorBoundary>
        } />
        {/* Domus page */}
        <Route path='/presupuestos/domus' element={
          <ErrorBoundary>
            <Domus />
          </ErrorBoundary>
        } />

      </Routes>
    </ErrorBoundary>
  )
}
