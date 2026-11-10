import {
  FiImage,
  FiStar,
  FiGrid,
  FiBookmark,
  FiTag,
  FiPercent,
  FiLayers,
  FiCreditCard,
  FiGift,
  FiCalendar,
  FiMenu,
} from 'react-icons/fi';

export const EDITOR_INICIO_PATH = '/editor-inicio-admin';

// Orden verificado contra la sección Perfumería de pages/inicio/Inicio.jsx.
// `landingComponent` indica qué componente de la landing pública representa cada sección.
export const EDITOR_INICIO_SECTIONS = [
  {
    id: 'menu-header',
    title: 'Menú Header / Mega Menú',
    description: 'Administrá Ofertas, Lanzamientos y el orden del menú principal de la tienda.',
    icon: FiMenu,
    previewImage: '/capturas-admin-editor/00-header.png',
  },
  {
    id: 'banners',
    title: 'Banners',
    description: 'Imágenes principales que abren Inicio en Perfumería y Hogar.',
    icon: FiImage,
    landingComponent: 'PromoCarousel',
    previewImage: '/capturas-admin-editor/01-banners.png',
  },
  {
    id: 'seccion-destacada',
    title: 'Sección Destacada',
    description: 'Productos destacados que aparecen debajo de los banners.',
    icon: FiStar,
    landingComponent: 'FeaturedSection',
    previewImage: '/capturas-admin-editor/02-destacados.png',
  },
  {
    id: 'categorias',
    title: 'Categorías',
    description: 'Accesos rápidos a las categorías de la tienda.',
    icon: FiGrid,
    landingComponent: 'CategoriesSection',
    previewImage: '/capturas-admin-editor/03_categorias.png',
  },
  {
    id: 'categoria-destacada-1',
    title: 'Categoría Destacada (1)',
    description: 'Primera categoría con una selección de sus productos.',
    icon: FiBookmark,
    landingComponent: 'FeaturedCategorySection',
    previewImage: '/capturas-admin-editor/04-categorias-dest.png',
  },
  {
    id: 'ofertas',
    title: 'Ofertas',
    description: 'Bloque «Disfrutá de las mejores ofertas» con accesos a promociones.',
    icon: FiTag,
    landingComponent: 'OfertasSection',
    previewImage: '/capturas-admin-editor/05-ofertas.png',
  },
  {
    id: 'descuentos',
    title: 'Descuentos',
    description: 'Productos con precio rebajado.',
    icon: FiPercent,
    landingComponent: 'DiscountedSection',
    previewImage: '/capturas-admin-editor/06-descuentos.png',
  },
  {
    id: 'categoria-destacada-2',
    title: 'Categoría Destacada (2)',
    description: 'Segunda categoría con una selección de sus productos.',
    icon: FiLayers,
    landingComponent: 'SpecificCategorySection',
    previewImage: '/capturas-admin-editor/07-categoria-destacada.png',
  },
  {
    id: 'beneficios',
    title: 'Beneficios',
    description: 'Promociones y beneficios de tarjetas bancarias.',
    icon: FiCreditCard,
    landingComponent: 'TarjetasPromociones',
    previewImage: '/capturas-admin-editor/08-beneficios.png',
  },
  {
    id: 'gift-card',
    title: 'Gift Card',
    description: 'Banner que invita a regalar una tarjeta Marybe.',
    icon: FiGift,
    landingComponent: 'GiftCard',
    previewImage: '/capturas-admin-editor/09-gift-card.png',
  },
  {
    id: 'proximos-eventos',
    title: 'Próximos Eventos',
    description: 'Agenda de eventos y actividades de la tienda.',
    icon: FiCalendar,
    landingComponent: 'ProximosEventos',
    previewImage: '/capturas-admin-editor/10-eventos.png',
  },
];

export const sectionPath = (id) => `${EDITOR_INICIO_PATH}/${id}`;

export const findSection = (id) => EDITOR_INICIO_SECTIONS.find(section => section.id === id);
