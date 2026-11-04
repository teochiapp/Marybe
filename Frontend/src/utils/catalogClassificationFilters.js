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
