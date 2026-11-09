import { botonDestino, descuentosDefaultUrl, entidadUrl, TIPOS_ENTIDAD } from '../../../../../utils/descuentosBloque';
import { safeBannerLink } from '../../../../../utils/bannerDesign';

export const DESCUENTOS_AREAS = [
  { key: 'bloque-1', label: 'Bloque 1' },
  { key: 'bloque-2', label: 'Bloque 2' },
];

export const DESCUENTOS_PARTS = [
  { id: 'contenido', label: 'Contenido promocionado', group: 'contenido' },
  { id: 'texto', label: 'Textos del bloque', group: 'contenido' },
  { id: 'imagen', label: 'Imagen promocional', group: 'diseno' },
  { id: 'boton', label: 'Botón', group: 'diseno' },
];

// Cada bloque se muestra hoy en un área de Inicio; sirve solo para orientar y elegir la imagen original.
export const BLOQUE_INFO = {
  'bloque-1': { donde: 'Inicio · Perfumería', seccion: 'perfumeria', imagenOriginal: '/inicio/discountedSection.webp', colorFondo: '#160000' },
  'bloque-2': { donde: 'Inicio · Hogar', seccion: 'hogar', imagenOriginal: '/inicio/discountedSectionHogar.webp', colorFondo: '#B10002' },
};

export const MAX_RESULTS = 60;
export const tipoInfo = tipo => TIPOS_ENTIDAD.find(item => item.value === tipo);

const normalize = value => String(value || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Entidades de un tipo (categoría, marca o proveedor) filtradas por texto, en el orden de Strapi.
export function entityOptions(entities, tipo, query = '') {
  const list = entities?.[tipo] || [];
  const term = normalize(query).trim();
  return term ? list.filter(item => normalize(item.nombre).includes(term)) : list;
}

export const entityKey = (tipo, item) => (tipo === 'categoria' ? item.documentId : item.nombre);

export function findEntity(data, entities) {
  if (!data?.entidad_tipo || !entities) return null;
  return (entities[data.entidad_tipo] || []).find(item => entityKey(data.entidad_tipo, item) === data.entidad_id) || null;
}

// 'ninguna' | 'cargando' | 'ok' | 'inexistente' (borrada, despublicada o sin productos) | 'sin-productos'
export function entityStatus(data, entities) {
  if (!data?.entidad_tipo) return 'ninguna';
  if (!entities) return 'cargando';
  const found = findEntity(data, entities);
  if (!found) return 'inexistente';
  return found.productos === 0 ? 'sin-productos' : 'ok';
}

// Nombre y sección actuales de la entidad (Strapi) o, si ya no existe, los guardados al elegirla.
export function currentEntity(data, entities) {
  const found = findEntity(data, entities);
  if (data.entidad_tipo === 'categoria') return found ? { nombre: found.nombre, seccion: found.seccion } : null;
  return found ? { nombre: found.nombre, seccion: '' } : null;
}

export function destinoDeBloque(data, areaKey, entities) {
  return botonDestino(data, descuentosDefaultUrl(BLOQUE_INFO[areaKey].seccion), currentEntity(data, entities));
}

export const autoUrl = (data, entities) => {
  const entity = currentEntity(data, entities);
  return entity ? entidadUrl(data.entidad_tipo, entity.nombre, entity.seccion) : '';
};

// Datos que recibe el componente público en el lienzo: la entidad se resuelve con lo que ve el editor.
export function toPreviewData(data, entities) {
  const entity = data.entidad_tipo ? currentEntity(data, entities) : null;
  return { ...data, entidad_nombre: entity?.nombre ?? data.entidad_nombre, entidad_seccion: entity?.seccion ?? data.entidad_seccion };
}

export function publishProblems(data) {
  const problems = [];
  if (!data.titulo_cursiva?.trim() && !data.titulo_normal?.trim()) problems.push({ part: 'texto', message: 'Escribí el título del bloque.' });
  if (data.boton_modo === 'personalizado' && !safeBannerLink(data.boton_enlace)) problems.push({ part: 'boton', message: 'Escribí un enlace válido para el botón (https://… o una ruta que empiece con /) o volvé al enlace automático.' });
  return problems;
}
