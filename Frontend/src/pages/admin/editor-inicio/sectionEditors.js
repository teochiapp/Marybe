import { lazyWithRetry } from '../../../utils/lazyWithRetry';

const BannersSectionEditor = lazyWithRetry(() => import('./components/BannersSectionEditor'), 'BannersSectionEditor');
const DestacadaEditor = lazyWithRetry(() => import('./components/destacada/DestacadaEditor'), 'DestacadaEditor');
const CategoriasEditor = lazyWithRetry(() => import('./components/categorias/CategoriasEditor'), 'CategoriasEditor');
const OfertasEditor = lazyWithRetry(() => import('./components/ofertas/OfertasEditor'), 'OfertasEditor');
const CategoriaDestacadaEditor = lazyWithRetry(() => import('./components/categoriaDestacada/CategoriaDestacadaEditor'), 'CategoriaDestacadaEditor');

// Editores reales por identificador de sección. Las secciones sin entrada muestran
// la vista "Editor próximamente disponible"; para habilitar un editor nuevo basta con registrarlo acá.
export const SECTION_EDITORS = {
  banners: BannersSectionEditor,
  'seccion-destacada': DestacadaEditor,
  categorias: CategoriasEditor,
  'categoria-destacada-1': CategoriaDestacadaEditor,
  ofertas: OfertasEditor,
};

export const hasSectionEditor = (id) => Boolean(SECTION_EDITORS[id]);
