import { lazyWithRetry } from '../../../utils/lazyWithRetry';

const BannersSectionEditor = lazyWithRetry(() => import('./components/BannersSectionEditor'), 'BannersSectionEditor');
const DestacadaEditor = lazyWithRetry(() => import('./components/destacada/DestacadaEditor'), 'DestacadaEditor');
const CategoriasEditor = lazyWithRetry(() => import('./components/categorias/CategoriasEditor'), 'CategoriasEditor');
const OfertasEditor = lazyWithRetry(() => import('./components/ofertas/OfertasEditor'), 'OfertasEditor');
const CategoriaDestacadaEditor = lazyWithRetry(() => import('./components/categoriaDestacada/CategoriaDestacadaEditor'), 'CategoriaDestacadaEditor');
const CategoriaDestacada2Editor = lazyWithRetry(
  () => import('./components/categoriaDestacada/CategoriaDestacadaEditor').then(mod => ({ default: mod.CategoriaDestacada2Editor })),
  'CategoriaDestacada2Editor'
);
const DescuentosEditor = lazyWithRetry(() => import('./components/descuentos/DescuentosEditor'), 'DescuentosEditor');
const BeneficiosEditor = lazyWithRetry(() => import('./components/beneficios/BeneficiosEditor'), 'BeneficiosEditor');
const GiftCardEditor = lazyWithRetry(() => import('./components/giftCard/GiftCardEditor'), 'GiftCardEditor');
const ProximosEventosEditor = lazyWithRetry(() => import('./components/proximosEventos/ProximosEventosEditor'), 'ProximosEventosEditor');

// Editores reales por identificador de sección. Las secciones sin entrada muestran
// la vista "Editor próximamente disponible"; para habilitar un editor nuevo basta con registrarlo acá.
export const SECTION_EDITORS = {
  banners: BannersSectionEditor,
  'seccion-destacada': DestacadaEditor,
  categorias: CategoriasEditor,
  'categoria-destacada-1': CategoriaDestacadaEditor,
  ofertas: OfertasEditor,
  descuentos: DescuentosEditor,
  'categoria-destacada-2': CategoriaDestacada2Editor,
  beneficios: BeneficiosEditor,
  'gift-card': GiftCardEditor,
  'proximos-eventos': ProximosEventosEditor,
};

export const hasSectionEditor = (id) => Boolean(SECTION_EDITORS[id]);
