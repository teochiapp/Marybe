import { normalizarComposicion, ORDEN_INICIO } from './composicionInicio';

test('sin configuraci?n conserva el orden original independiente de cada ?rea', () => {
  expect(normalizarComposicion(null, 'perfumeria')).toEqual({ orden: ORDEN_INICIO.perfumeria, ocultos: [] });
  expect(normalizarComposicion(null, 'hogar')).toEqual({ orden: ORDEN_INICIO.hogar, ocultos: [] });
  expect(ORDEN_INICIO.hogar.slice(0, 3)).toEqual(['banners', 'ofertas', 'seccion-destacada']);
});

test('mantiene el orden publicado, filtra valores inv?lidos y completa secciones nuevas', () => {
  const result = normalizarComposicion({ orden: ['ofertas', 'banners', 'ofertas', 'invalida'], ocultos: ['banners', 'banners', 'invalida'] }, 'perfumeria');
  expect(result.orden.slice(0, 2)).toEqual(['ofertas', 'banners']);
  expect(result.orden).toHaveLength(ORDEN_INICIO.perfumeria.length);
  expect(result.ocultos).toEqual(['banners']);
});
