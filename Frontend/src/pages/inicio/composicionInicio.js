export const ORDEN_INICIO = {
  perfumeria: ['banners', 'seccion-destacada', 'categorias', 'categoria-destacada-1', 'ofertas', 'descuentos', 'categoria-destacada-2', 'beneficios', 'gift-card', 'proximos-eventos', 'descubri-mas'],
  hogar: ['banners', 'ofertas', 'seccion-destacada', 'categorias', 'categoria-destacada-1', 'descuentos', 'categoria-destacada-2', 'beneficios', 'gift-card', 'proximos-eventos', 'descubri-mas'],
};

export function normalizarComposicion(value, area) {
  const defaults = ORDEN_INICIO[area] || ORDEN_INICIO.perfumeria;
  const orden = Array.isArray(value?.orden) ? value.orden.filter((id, index, all) => defaults.includes(id) && all.indexOf(id) === index) : [];
  const ocultos = Array.isArray(value?.ocultos) ? [...new Set(value.ocultos.filter(id => defaults.includes(id)))] : [];
  return { orden: [...orden, ...defaults.filter(id => !orden.includes(id))], ocultos };
}
