const SEARCH_FIELDS = ['nombre', 'marca', 'subcategoria', 'tipo'];

export function getSearchTerms(query = '') {
  return [...new Set(String(query || '').trim().split(/\s+/).filter(Boolean))];
}

export function matchesProductSearch(product, query = '') {
  const fields = [product.nombre, product.marca].map(value => String(value || '').toLowerCase());
  return getSearchTerms(query).every(term => fields.some(value => value.includes(term.toLowerCase())));
}

// Every word must match a searchable field, without colliding with classification filters.
export function addSearchFilters(params, query = '', index = 0) {
  const terms = getSearchTerms(query);
  terms.forEach((term, termIndex) => {
    SEARCH_FIELDS.forEach((field, fieldIndex) => {
      params.set(`filters[$and][${index + termIndex}][$or][${fieldIndex}][${field}][$containsi]`, term);
    });
  });
  return index + terms.length;
}

// Keep the section and every selected category level on the same classification.
// A product may have another classification in a different section.
export function addClassificationFilters(params, { seccion = '', categoria = '', subcategoria = '', tipo = '' }, index = 0) {
  const levels = [
    ['categoria', categoria],
    ['subcategoria', subcategoria],
    ['tipo', tipo],
  ].map(([field, value]) => [field, value.split(',').filter(Boolean)]);

  if (!seccion && levels.every(([, values]) => values.length === 0)) return index;

  const root = `filters[$and][${index}][$or]`;
  const branches = [
    { seccion: 'seccion', categoria: 'categoria][nombre', subcategoria: 'subcategoria', tipo: 'tipo' },
    { seccion: 'clasificaciones][seccion', categoria: 'clasificaciones][categoria', subcategoria: 'clasificaciones][subcategoria', tipo: 'clasificaciones][tipo' },
  ];

  branches.forEach((fields, branchIndex) => {
    const prefix = `${root}[${branchIndex}]`;
    if (seccion) params.set(`${prefix}[${fields.seccion}][$eq]`, seccion);
    levels.forEach(([field, values]) => {
      values.forEach((value, valueIndex) => {
        params.set(`${prefix}[${fields[field]}][$in][${valueIndex}]`, value);
      });
    });
  });

  return index + 1;
}
