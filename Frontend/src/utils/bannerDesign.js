export const DEVICES = ['desktop', 'tablet', 'mobile'];
export const DEVICE_WIDTHS = { desktop: 1280, tablet: 820, mobile: 390 };
export const ROW_TYPES = { 'layout.fila-1-columna': 'Una columna', 'layout.fila-2-columnas': 'Dos columnas', 'layout.fila-4-columnas': 'Cuatro columnas', 'layout.fila-mixta': 'Distribución libre' };
export const BANNER_DEFAULTS = { height: 480, width: 100, radius: 20, padding: 24, fit: 'contain', positionX: 50, positionY: 50, imageScale: 100, textX: 6, textY: 50, textWidth: 80, fontSize: 44, subtitleSize: 18, buttonSize: 16, buttonRadius: 8, fontFamily: 'Inter', fontWeight: 700, lineHeight: 1.08, letterSpacing: 0, background: '#faf7f4', color: '#ffffff', buttonBackground: '#560203', buttonColor: '#ffffff', overlay: 0, align: 'left', hidden: false };
export const CAROUSEL_DEFAULTS = { autoplay: true, intervalo: 7, indicador: 'ninguno', vistaParcial: false };
export function designOrigin(design, device, key) {
  const own = Object.prototype.hasOwnProperty.call(design?.[device] || {}, key);
  if (own) return { label: `Personalizado para ${device === 'desktop' ? 'computadora' : device === 'tablet' ? 'tablet' : 'celular'}`, own: true };
  if (device === 'mobile' && Object.prototype.hasOwnProperty.call(design?.tablet || {}, key)) return { label: 'Heredado de tablet', own: false };
  if (device !== 'desktop' && Object.prototype.hasOwnProperty.call(design?.desktop || {}, key)) return { label: 'Heredado de computadora', own: false };
  return { label: 'Original', own: false };
}
export function deviceDesign(design, device, defaults = BANNER_DEFAULTS) {
  const base = { ...defaults, ...design?.desktop };
  if (device !== 'desktop') Object.assign(base, design?.tablet);
  if (device === 'mobile') Object.assign(base, design?.mobile);
  return base;
}
export function imageUrl(image, base = process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337') {
  const raw = typeof image === 'string' ? image : image?.url || image?.data?.attributes?.url || '';
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  // Local storefront assets and uploaded Strapi media use different origins.
  return raw.startsWith('/uploads/') ? `${base}${raw}` : raw.startsWith('/') && !raw.startsWith('//') ? raw : '';
}
export function safeBannerLink(link) { return typeof link === 'string' && !Array.from(link).some(char => char === '\\' || char.charCodeAt(0) < 32) && (/^\/(?!\/)/.test(link) || /^https?:\/\//i.test(link)) ? link : ''; }
export function newBanner() { return { titulo: 'Nuevo banner', subtitulo: '', texto_boton: '', enlace: '', mostrar_texto: false, activo: true, ancho_porcentaje: 100, imagen_desktop: null, diseno: { desktop: {}, tablet: { height: 360 }, mobile: { height: 280, fontSize: 28, subtitleSize: 15 } } }; }
export function duplicateRow(row) { return { ...structuredCopy(row), id: undefined, banners: row.banners.map(b => ({ ...structuredCopy(b), id: undefined })) }; }
export function structuredCopy(value) { return JSON.parse(JSON.stringify(value)); }
export function createSlots(main = {}) {
  const source = main.attributes || main;
  const base = (title, image, extra = {}) => ({ ...newBanner(), titulo: title, imagen_desktop: { url: image }, activo: true, ...extra });
  const slots = {};
  for (const section of ['perfumeria', 'hogar']) {
    const info = (source.secciones || []).find(s => s.seccion?.toLowerCase().replace('í', 'i') === section);
    const discount = source[`descuento_${section}`];
    slots[`featured_${section}`] = { label: `Destacados · ${section}`, banner: base('Destacados', section === 'hogar' ? '/inicio/featuredSectionHogar.webp' : '/inicio/featured.webp', { imagen_desktop: info?.imagen_desktop || { url: section === 'hogar' ? '/inicio/featuredSectionHogar.webp' : '/inicio/featured.webp' }, imagen_mobile: info?.imagen_mobile || null }) };
    slots[`descuento_${section}`] = { label: `Descuentos · ${section}`, banner: base('Descuentos', '', { imagen_desktop: discount?.imagen_destacada || { url: section === 'hogar' ? '/inicio/discountedSectionHogar.webp' : '/inicio/discountedSection.webp' } }) };
    slots[`gift_${section}`] = { label: `Gift Card · ${section}`, banner: base('Regalá Marybe', '/inicio/giftcard.webp', { mostrar_texto: true, subtitulo: 'Elegí el regalo perfecto', texto_boton: 'Conocer más', enlace: '/gift-card', diseno: { desktop: { background: '#560203', fit: 'contain', positionX: 20, textX: 52, textWidth: 44, height: 320 }, mobile: { height: 450, textX: 8, textY: 76, textWidth: 84, fontSize: 28 } } }) };
  }
  for (let i = 0; i < 2; i++) {
    const category = source.categorias_destacadas?.[i];
    slots[`categoria_${i}`] = { label: `Categoría destacada ${i + 1}`, banner: base(category?.titulo || (i === 0 ? 'El poder del elixir' : 'Toda la línea de Azzaro'), '', { imagen_desktop: category?.imagen || { url: i === 0 ? '/inicio/elixir.webp' : '/inicio/azzaro.webp' }, mostrar_texto: true, texto_boton: category?.texto_boton || 'Conocer más', enlace: category?.link_boton || `/tienda?banner=${i === 0 ? 'elixir' : 'azzaro'}`, diseno: { desktop: { color: '#560203', textY: 14, fontSize: 28, textWidth: 88, height: 380 }, mobile: { fontSize: 24 } } }) };
  }
  slots.whatsapp = { label: 'Canal de WhatsApp', banner: base('Sumate a nuestro canal de WhatsApp', '', { mostrar_texto: true, subtitulo: 'Descuentos y lanzamientos antes que nadie.', texto_boton: 'Unirme', diseno: { desktop: { background: '#560203', height: 220, fontSize: 30 }, mobile: { height: 300, fontSize: 26 } } }) };
  return slots;
}
