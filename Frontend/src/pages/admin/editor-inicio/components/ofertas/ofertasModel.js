export const OFERTAS_AREAS = [
  { key: 'perfumeria', label: 'Perfumería' },
  { key: 'hogar', label: 'Hogar' },
];
export const MAX_TITLE = 80;

export const OFERTAS_PARTS = [
  { id: 'titulo', label: 'Título principal', group: 'contenido' },
  { id: 'tipografia', label: 'Tipografía del título', group: 'tipografia' },
  { id: 'color', label: 'Color del título', group: 'diseno' },
  { id: 'fondo', label: 'Fondo y espaciado', group: 'diseno' },
];

// El primer valor de cada grupo (o el marcado como original) es el diseño actual de la sección.
export const FUENTE_OPTIONS = [
  { value: 'secundaria', label: 'Inter', description: 'Diseño original' },
  { value: 'principal', label: 'Brygada 1918', description: 'Con serifa, de la marca' },
];
export const TAMANO_OPTIONS = [
  { value: 'chico', label: 'Chico', description: '30 px en computadora' },
  { value: 'mediano', label: 'Mediano', description: '35 px en computadora' },
  { value: 'grande', label: 'Grande', description: 'Original · 40 px' },
  { value: 'muy-grande', label: 'Muy grande', description: '48 px en computadora' },
];
export const PESO_OPTIONS = [
  { value: 'normal', label: 'Normal', description: '400' },
  { value: 'semibold', label: 'Semibold', description: 'Original · 600' },
  { value: 'bold', label: 'Bold', description: '700' },
];
export const ALINEACION_OPTIONS = [
  { value: 'izquierda', label: 'Izquierda', description: 'Original' },
  { value: 'centro', label: 'Centro', description: '' },
  { value: 'derecha', label: 'Derecha', description: '' },
];
export const COLOR_OPTIONS = [
  { value: 'original', label: 'Original', description: 'Color del área' },
  { value: 'bordo-secundario', label: 'Bordó', description: '#7C0405' },
  { value: 'bordo-tercero', label: 'Bordó oscuro', description: '#560203' },
  { value: 'marron-principal', label: 'Marrón', description: '#3E0102' },
  { value: 'marron-cuarto', label: 'Marrón oscuro', description: '#280101' },
  { value: 'hogar', label: 'Rojo Hogar', description: '#B10002' },
];
export const FONDO_OPTIONS = [
  { value: 'blanco', label: 'Blanco', description: 'Diseño original' },
  { value: 'arena', label: 'Arena', description: 'Destaca la sección' },
  { value: 'rosado', label: 'Rosado', description: 'Tono suave de la marca' },
];
export const ESPACIADO_OPTIONS = [
  { value: 'compacto', label: 'Compacto', description: 'Menos aire arriba y abajo' },
  { value: 'original', label: 'Original', description: 'Diseño original' },
  { value: 'amplio', label: 'Amplio', description: 'Más aire arriba y abajo' },
];

export const AREA_COLORS = { perfumeria: '#7C0405', hogar: '#B10002' };
export const TYPOGRAPHY_DEFAULTS = { fuente: 'secundaria', tamano: 'grande', peso: 'semibold', alineacion: 'izquierda' };
export const DESIGN_DEFAULTS = { color: 'original', fondo: 'blanco', espaciado: 'original' };

export const labelOf = (options, value) => options.find(option => option.value === value)?.label || '';

export function publishProblems(data) {
  if (!data.titulo?.trim()) return [{ part: 'titulo', message: 'Escribí el título de la sección.' }];
  return [];
}
