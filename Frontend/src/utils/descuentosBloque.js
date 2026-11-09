import { safeBannerLink } from './bannerDesign';

// Los dos bloques de Descuentos tienen identificadores estables, independientes del área de Inicio
// donde se muestran hoy (Perfumería → bloque-1, Hogar → bloque-2).
export const BLOQUES_DESCUENTOS = [
  { key: 'bloque-1', label: 'Bloque 1', seccion: 'perfumeria' },
  { key: 'bloque-2', label: 'Bloque 2', seccion: 'hogar' },
];
export const bloqueDescuentosKey = seccion => (seccion === 'hogar' ? 'bloque-2' : 'bloque-1');

export const DESCUENTOS_DEFAULTS = {
  texto_superior: 'Envíos a todo el país',
  boton_texto: 'Conocer más',
};

export const TIPOS_ENTIDAD = [
  { value: 'categoria', label: 'Categoría', plural: 'categorías' },
  { value: 'marca', label: 'Marca', plural: 'marcas' },
  { value: 'proveedor', label: 'Proveedor', plural: 'proveedores' },
];

export const POSICIONES_IMAGEN_OPTIONS = [
  { value: 'centro', label: 'Centro', description: 'Original' },
  { value: 'arriba', label: 'Arriba', description: 'Prioriza borde superior' },
  { value: 'abajo', label: 'Abajo', description: 'Apoyada abajo' },
  { value: 'izquierda', label: 'Izquierda', description: 'Hacia el texto' },
  { value: 'derecha', label: 'Derecha', description: 'Hacia el borde' },
];

export const AJUSTES_IMAGEN_OPTIONS = [
  { value: 'contener', label: 'Completa', description: 'Original · sin recortes' },
  { value: 'cubrir', label: 'Cubrir', description: 'Llena el área disponible' },
];

const OBJECT_POSITIONS = {
  centro: 'center center',
  arriba: 'center top',
  abajo: 'center bottom',
  izquierda: 'left center',
  derecha: 'right center',
};

// Estilos adicionales para la imagen del bloque de Descuentos; sin ajustes devuelve undefined.
export function imagenEstilo(config) {
  if (!config) return undefined;
  const style = {};
  if (config.imagen_ajuste === 'cubrir') {
    style.objectFit = 'cover';
    style.width = '100%';
    style.height = '48vh';
  }
  if (config.imagen_posicion && config.imagen_posicion !== 'centro' && OBJECT_POSITIONS[config.imagen_posicion]) {
    style.objectPosition = OBJECT_POSITIONS[config.imagen_posicion];
    style.width = '100%';
    style.height = '48vh';
  }
  if (config.imagen_sombra === false) {
    style.filter = 'none';
  }
  return Object.keys(style).length ? style : undefined;
}

// Endpoint de productos publicados para la entidad promocionada en el bloque (o '' si no hay selección).
export function entidadProductosUrl(config, baseUrl = process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337') {
  const id = config?.entidad_id;
  if (!id || !config?.entidad_tipo) return '';
  const encoded = encodeURIComponent(id);
  if (config.entidad_tipo === 'categoria') {
    return `${baseUrl}/api/productos?filters[publicado][$eq]=true&filters[categoria][documentId][$eq]=${encoded}&populate=*`;
  }
  if (config.entidad_tipo === 'marca') {
    return `${baseUrl}/api/productos?filters[publicado][$eq]=true&filters[marca][$eq]=${encoded}&populate=*`;
  }
  if (config.entidad_tipo === 'proveedor') {
    return `${baseUrl}/api/productos?filters[publicado][$eq]=true&filters[proveedor][$eq]=${encoded}&populate=*`;
  }
  return '';
}

// Enlace por defecto del botón (comportamiento original de la sección).
export const descuentosDefaultUrl = seccion => `/tienda?descuento=todas&seccion=${seccion === 'hogar' ? 'Hogar' : 'Perfumer%C3%ADa'}`;

// Páginas públicas reales: el catálogo (/tienda) filtra por categoría (con su sección) y por marca.
// El proveedor no tiene página pública, por eso no genera enlace automático.
export function entidadUrl(tipo, nombre, seccion) {
  if (!nombre) return '';
  if (tipo === 'categoria') return `/tienda?categoria=${encodeURIComponent(nombre)}${seccion ? `&seccion=${encodeURIComponent(seccion)}` : ''}`;
  if (tipo === 'marca') return `/tienda?marca=${encodeURIComponent(nombre)}`;
  return '';
}

/**
 * Destino del botón: enlace personalizado válido > página de la entidad elegida > enlace original.
 * `entidadActual` es la entidad tal como está hoy en Strapi ({ nombre, seccion }) o null si ya no existe.
 */
export function botonDestino(config, defaultUrl, entidadActual) {
  if (config?.boton_modo === 'personalizado') {
    const custom = safeBannerLink(config.boton_enlace);
    if (custom) return custom;
  }
  if (config?.entidad_tipo) {
    const auto = entidadUrl(config.entidad_tipo, entidadActual?.nombre, entidadActual?.seccion);
    if (auto) return auto;
  }
  return defaultUrl;
}

export const isExternalUrl = url => /^https?:\/\//i.test(url);
