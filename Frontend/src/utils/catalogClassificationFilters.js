const SEARCH_FIELDS = ['nombre', 'marca', 'subcategoria', 'tipo'];

// Group search fields under filters[$and][index][$or] so text queries match
// brands, types, subcategories, and names without colliding with other $and/$or filters.
export function addSearchFilters(params, query = '', index = 0) {
  const cleanQuery = String(query || '').trim();
  if (!cleanQuery) return index;

  SEARCH_FIELDS.forEach((field, fieldIndex) => {
    params.set(`filters[$and][${index}][$or][${fieldIndex}][${field}][$containsi]`, cleanQuery);
  });

  return index + 1;
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
