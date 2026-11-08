export const DESTACADA_AREAS = [
  { key: 'perfumeria', label: 'Perfumería', banners: true, defaults: { cursiva: 'Lo nuevo', normal: 'en Marybe', subtitulo: 'Intensidad, seducción y carácter en un solo lugar.', colorCursiva: '#FFFFFF', colorNormal: '#F2DC8F' } },
  { key: 'hogar', label: 'Hogar', banners: false, defaults: { cursiva: 'Tu espacio,', normal: 'tu hogar', subtitulo: 'Calidez, diseño y aromas para ambientar cada rincón.', colorCursiva: '#FFFFFF', colorNormal: '#FFFFFF' } },
];
// La landing pide los destacados sin paginar: Strapi devuelve como máximo 25.
export const MAX_PRODUCTS = 25;
export const MAX_BOTTOM_BANNERS = 2;

export const areaInfo = key => DESTACADA_AREAS.find(area => area.key === key) || DESTACADA_AREAS[0];

export function destacadaParts(areaKey, data) {
  const parts = [
    { id: 'textos', label: 'Título y subtítulo' },
    { id: 'imagen', label: 'Imagen principal' },
    { id: 'productos', label: 'Productos destacados' },
  ];
  if (areaInfo(areaKey).banners) (data?.banners || []).forEach((banner, index) => parts.push({ id: `banner-${index}`, label: `Banner inferior ${index + 1}`, index }));
  return parts;
}

export const bannerIndex = part => (/^banner-(\d)$/.test(part || '') ? Number(part.slice(7)) : null);

export function newBottomBanner() {
  return { titulo: 'Nuevo banner', imagen: null, escala_imagen_desktop: null, escala_imagen_mobile: null, texto_boton: 'Conocer más', link_boton: '/tienda' };
}

export function copy(value) {
  return JSON.parse(JSON.stringify(value));
}

export function toPreviewData(data, productIndex) {
  return {
    seccionInfo: {
      titulo_cursiva: data.titulo_cursiva,
      titulo_normal: data.titulo_normal,
      color_titulo_cursiva: data.color_titulo_cursiva,
      color_titulo_normal: data.color_titulo_normal,
      subtitulo: data.subtitulo,
      imagen_desktop: data.imagen_desktop,
      imagen_mobile: data.imagen_mobile,
      escala_imagen_desktop: data.escala_imagen_desktop,
      escala_imagen_mobile: data.escala_imagen_mobile,
    },
    banners: (data.banners || []).map(banner => ({ ...banner })),
    // La tienda lista los destacados en el orden del catálogo (id ascendente).
    productos: (data.productos || []).map(id => productIndex[id]).filter(Boolean).sort((a, b) => a.id - b.id),
  };
}

// Espejo de la validación estricta del backend al publicar.
export function publishProblems(data, areaKey) {
  const problems = [];
  if (!data.titulo_cursiva?.trim() || !data.titulo_normal?.trim()) problems.push({ part: 'textos', message: 'Completá las dos partes del título.' });
  if (!data.imagen_desktop) problems.push({ part: 'imagen', message: 'Elegí la imagen para computadora.' });
  if ((data.productos || []).length > MAX_PRODUCTS) problems.push({ part: 'productos', message: `La tienda muestra hasta ${MAX_PRODUCTS} productos destacados: quitá ${data.productos.length - MAX_PRODUCTS}.` });
  if (areaInfo(areaKey).banners) {
    (data.banners || []).forEach((banner, index) => {
      if (!banner.titulo?.trim() || !banner.imagen || !banner.texto_boton?.trim()) problems.push({ part: `banner-${index}`, message: `El banner inferior ${index + 1} necesita título, imagen y texto del botón.` });
    });
  }
  return problems;
}
