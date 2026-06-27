// ─── megamenu.js ──────────────────────────────────────────────────────────────
// Datos estáticos (fallback) del header / mega menú.
// Cuando Strapi esté disponible, estas constantes actúan como placeholder
// mientras llegan los datos dinámicos.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Categorías que se muestran en la barra de navegación del header (desktop).
 * El orden importa: se renderiza de izquierda a derecha.
 */
export const DEFAULT_CATEGORIES = [
  'Ofertas',
  'Lanzamientos',
  'Dermocosmética',
  'Fragancias',
  'Maquillaje',
  'Cuidado personal',
  'Niños y bebés',
  'Limpieza de hogar',
  'Electro belleza',
];

/**
 * Píldoras destacadas que aparecen en la versión móvil del nav.
 * `active: true` marca la seleccionada por defecto.
 */
export const MOBILE_FEATURED = [
  { label: 'Perfumería', active: true },
  { label: 'Hogar', active: true },
];

/**
 * Columnas de subcategorías del mega menú (placeholder estático).
 * Cada entrada tiene:
 *  - title  : título de la columna
 *  - items  : lista de ítems / subcategorías
 *
 * El componente CategoryNav referencia índices específicos de este array
 * según la categoría activa (ver getMegaColumnsForCategory).
 */
export const MEGA_COLUMNS = [
  // [0]
  {
    title: 'Cocina',
    items: ['Detergentes', 'Lava vajillas', 'Limpieza de superficies'],
  },
  // [1]
  {
    title: 'Baño',
    items: ['Desinfectantes', 'Pastillas de inodoro'],
  },
  // [2]
  {
    title: 'Pisos y muebles',
    items: ['Lavandina', 'Desinfectantes', 'Aromatizantes', 'Lustramuebles', 'Ceras y autobrillos'],
  },
  // [3]
  {
    title: 'Insecticidas y repelentes',
    items: ['Aerosoles', 'Repelentes', 'Aparatos y cebos'],
  },
  // [4]
  {
    title: 'Ropa',
    items: ['Jabones líquidos', 'Suavizantes'],
  },
  // [5]
  {
    title: 'Calzado',
    items: ['Brillos limpiadores', 'Pomadas'],
  },
  // [6]
  {
    title: 'Desodorante de ambiente',
    items: ['Aromatizantes', 'Desinfectantes'],
  },
  // [7]
  {
    title: 'Papeles',
    items: ['Pañuelos', 'Papel higiénico', 'Rollos de cocina', 'Servilletas'],
  },
  // [8]
  {
    title: 'Accesorios de limpieza',
    items: ['Mopas', 'Escobas', 'Esponjas', 'Guantes', 'Palas y cabos', 'Trapos de pisos y paños multiuso'],
  },
];

/**
 * Columnas de descuentos para la categoría "Ofertas", separadas por sección.
 * Cada ítem es { label, href } apuntando al catálogo filtrado por sección y %
 * Formato URL: /tienda?seccion=<sección>&descuento=<valor>
 */
const DESCUENTOS = [10, 20, 30, 40, 50, 60];

export const OFERTAS_PERFUMERIA = {
  title: 'Perfumería',
  items: DESCUENTOS.map((n) => ({
    label: `Hasta ${n}%`,
    href:  `/tienda?seccion=Perfumer%C3%ADa&descuento=${n}`,
  })),
};

export const OFERTAS_HOGAR = {
  title: 'Hogar',
  items: DESCUENTOS.map((n) => ({
    label: `Hasta ${n}%`,
    href:  `/tienda?seccion=Hogar&descuento=${n}`,
  })),
};

/**
 * URL base de Strapi (se puede sobreescribir con la variable de entorno).
 */
export const STRAPI_URL = process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337';
