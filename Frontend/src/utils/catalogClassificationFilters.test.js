import { addClassificationFilters, addSearchFilters } from './catalogClassificationFilters';
import { categoryUrl } from '../data/megamenu';

test('category URLs retain their header section', () => {
  expect(categoryUrl('Cuidado Personal', 'HOGAR'))
    .toBe('/tienda?categoria=Cuidado%20Personal&seccion=Hogar');
  expect(categoryUrl('Cuidado Personal', 'PERFUMERIA'))
    .toBe('/tienda?categoria=Cuidado%20Personal&seccion=Perfumer%C3%ADa');
});

test('section and all category levels stay together in each product branch', () => {
  const params = new URLSearchParams();
  const next = addClassificationFilters(params, {
    seccion: 'Hogar', categoria: 'Cuidado Personal', subcategoria: 'Baño', tipo: 'Jabón',
  });
  expect(next).toBe(1);
  for (const [index, prefix] of [['0', ''], ['1', 'clasificaciones][']]) {
    const key = (field, operator = '$eq') => `filters[$and][0][$or][${index}][${prefix}${field}][${operator}]`;
    expect(params.get(key('seccion'))).toBe('Hogar');
    expect(params.get(key(index === '0' ? 'categoria][nombre' : 'categoria', '$in][0'))).toBe('Cuidado Personal');
    expect(params.get(key('subcategoria', '$in][0'))).toBe('Baño');
    expect(params.get(key('tipo', '$in][0'))).toBe('Jabón');
  }
  expect(params.has('filters[seccion][$eq]')).toBe(false);
});

test('search filters group nombre, marca, subcategoria and tipo without colliding with classification filters', () => {
  const params = new URLSearchParams();
  const afterSearch = addSearchFilters(params, '  Givenchy  ', 0);
  expect(afterSearch).toBe(1);
  expect(params.get('filters[$and][0][$or][0][nombre][$containsi]')).toBe('Givenchy');
  expect(params.get('filters[$and][0][$or][1][marca][$containsi]')).toBe('Givenchy');
  expect(params.get('filters[$and][0][$or][2][subcategoria][$containsi]')).toBe('Givenchy');
  expect(params.get('filters[$and][0][$or][3][tipo][$containsi]')).toBe('Givenchy');

  const afterClassif = addClassificationFilters(params, { seccion: 'Perfumería' }, afterSearch);
  expect(afterClassif).toBe(2);
  expect(params.get('filters[$and][1][$or][0][seccion][$eq]')).toBe('Perfumería');
});
