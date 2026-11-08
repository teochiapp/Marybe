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
} from 'react-icons/fi';

export const EDITOR_INICIO_PATH = '/editor-inicio-admin';

// Orden verificado contra la sección Perfumería de pages/inicio/Inicio.jsx.
// `landingComponent` indica qué componente de la landing pública representa cada sección.
export const EDITOR_INICIO_SECTIONS = [
  {
    id: 'banners',
    title: 'Banners',
    description: 'Imágenes principales que abren Inicio en Perfumería y Hogar.',
    icon: FiImage,
    landingComponent: 'PromoCarousel',
  },
  {
    id: 'seccion-destacada',
    title: 'Sección Destacada',
    description: 'Productos destacados que aparecen debajo de los banners.',
    icon: FiStar,
    landingComponent: 'FeaturedSection',
  },
  {
    id: 'categorias',
    title: 'Categorías',
    description: 'Accesos rápidos a las categorías de la tienda.',
    icon: FiGrid,
    landingComponent: 'CategoriesSection',
  },
  {
    id: 'categoria-destacada-1',
    title: 'Categoría Destacada (1)',
    description: 'Primera categoría con una selección de sus productos.',
    icon: FiBookmark,
    landingComponent: 'FeaturedCategorySection',
  },
  {
    id: 'ofertas',
    title: 'Ofertas',
    description: 'Bloque «Disfrutá de las mejores ofertas» con accesos a promociones.',
    icon: FiTag,
    landingComponent: 'OfertasSection',
  },
  {
    id: 'descuentos',
    title: 'Descuentos',
    description: 'Productos con precio rebajado.',
    icon: FiPercent,
    landingComponent: 'DiscountedSection',
  },
  {
    id: 'categoria-destacada-2',
    title: 'Categoría Destacada (2)',
    description: 'Segunda categoría con una selección de sus productos.',
    icon: FiLayers,
    landingComponent: 'SpecificCategorySection',
  },
  {
    id: 'beneficios',
    title: 'Beneficios',
    description: 'Promociones y beneficios de tarjetas bancarias.',
    icon: FiCreditCard,
    landingComponent: 'TarjetasPromociones',
  },
  {
    id: 'gift-card',
    title: 'Gift Card',
    description: 'Banner que invita a regalar una tarjeta Marybe.',
    icon: FiGift,
    landingComponent: 'GiftCard',
  },
  {
    id: 'proximos-eventos',
    title: 'Próximos Eventos',
    description: 'Agenda de eventos y actividades de la tienda.',
    icon: FiCalendar,
    landingComponent: 'ProximosEventos',
  },
];

export const sectionPath = (id) => `${EDITOR_INICIO_PATH}/${id}`;

export const findSection = (id) => EDITOR_INICIO_SECTIONS.find(section => section.id === id);
