'use strict';

const { TAXONOMY, SECCIONES, COLORES } = require('./excel-utils');

function colLetter(number) {
  let letter = '';
  while (number > 0) {
    number--;
    letter = String.fromCharCode(65 + (number % 26)) + letter;
    number = Math.floor(number / 26);
  }
  return letter;
}

function quoteSheetName(name) {
  return `'${String(name).replace(/'/g, "''")}'`;
}

function plainText(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') {
    if ('result' in value) return value.result == null ? '' : String(value.result).trim();
    if (Array.isArray(value.richText)) return value.richText.map(part => part.text).join('').trim();
    return '';
  }
  return String(value).trim();
}

function calcularRefs() {
  const categories = Object.keys(TAXONOMY);
  const subcategoryMap = new Map();
  for (const category of categories) {
    for (const [subcategory, types] of Object.entries(TAXONOMY[category])) {
      if (!subcategoryMap.has(subcategory) || (subcategoryMap.get(subcategory).length === 0 && types.length > 0)) {
        subcategoryMap.set(subcategory, types);
      }
    }
  }
  const subcategories = [...subcategoryMap.keys()];
  const subTypeEntries = subcategories.map(subcategory => ({
    subcategory,
    types: subcategoryMap.get(subcategory) || [],
  }));
  const types = [...new Set(subTypeEntries.flatMap(entry => entry.types))];

  const maxSubs = Math.max(1, ...categories.map(category => Object.keys(TAXONOMY[category]).length));
  const maxTypes = Math.max(1, ...subTypeEntries.map(entry => entry.types.length));

  const subMatrixCol = 7;
  const typeMatrixCol = subMatrixCol + maxSubs;
  const catIdxCol = typeMatrixCol + maxTypes;
  const subRowStartCol = catIdxCol + 1;
  const subRowEndCol = subRowStartCol + maxSubs - 1;
  const subIdxCol = subRowEndCol + 1;
  const typeRowStartCol = subIdxCol + 1;
  const typeRowEndCol = typeRowStartCol + maxTypes - 1;

  const subStartLtr = colLetter(subRowStartCol);
  const subEndLtr = colLetter(subRowEndCol);
  const typeStartLtr = colLetter(typeRowStartCol);
  const typeEndLtr = colLetter(typeRowEndCol);

  return {
    secciones: `Listas!$A$2:$A$${SECCIONES.length + 1}`,
    categorias: `Listas!$B$2:$B$${categories.length + 1}`,
    subcategorias: row => `Listas!$${subStartLtr}$${row}:$${subEndLtr}$${row}`,
    tipos: row => `Listas!$${typeStartLtr}$${row}:$${typeEndLtr}$${row}`,
    booleanos: 'Listas!$F$2:$F$3',
    colores: `Listas!$E$2:$E$${COLORES.length + 1}`,
    layout: {
      maxSubs,
      maxTypes,
      subMatrixCol,
      typeMatrixCol,
      catIdxCol,
      subRowStartCol,
      subRowEndCol,
      subIdxCol,
      typeRowStartCol,
      typeRowEndCol,
    },
    data: { categories, subcategories, subTypeEntries, types },
  };
}

function aplicarValidacionesClasificacion(sheet, refs, firstRow, lastRow) {
  const baseRule = { type: 'list', allowBlank: true, showErrorMessage: false };
  sheet.dataValidations.add(`E${firstRow}:E${lastRow}`, {
    ...baseRule,
    formulae: [refs.secciones],
  });
  sheet.dataValidations.add(`F${firstRow}:F${lastRow}`, {
    ...baseRule,
    formulae: [refs.categorias],
  });
  for (let row = firstRow; row <= lastRow; row++) {
    sheet.dataValidations.add(`G${row}`, {
      ...baseRule,
      formulae: [refs.subcategorias(row)],
    });
    sheet.dataValidations.add(`H${row}`, {
      ...baseRule,
      formulae: [refs.tipos(row)],
    });
  }
}

function construirHojaListas(workbook, refs, { mainSheet = null, firstRow = 4, lastRow = 3, hidden = true } = {}) {
  workbook.calcProperties.fullCalcOnLoad = true;
  const sheet = workbook.addWorksheet('Listas');
  const { categories, subcategories, subTypeEntries, types } = refs.data;
  const {
    maxSubs,
    maxTypes,
    subMatrixCol,
    typeMatrixCol,
    catIdxCol,
    subRowStartCol,
    subIdxCol,
    typeRowStartCol,
  } = refs.layout;

  const putColumn = (column, header, values) => {
    sheet.getCell(1, column).value = header;
    values.forEach((value, index) => { sheet.getCell(index + 2, column).value = value; });
  };

  putColumn(1, '_SECCIONES', SECCIONES);
  putColumn(2, '_CATEGORIAS', categories);
  putColumn(3, '_SUBCATEGORIAS', subcategories);
  putColumn(4, '_TIPOS', types);
  putColumn(5, '_COLORES', COLORES);
  putColumn(6, '_BOOLEANOS', ['SI', 'NO']);

  for (let i = 0; i < maxSubs; i++) {
    sheet.getCell(1, subMatrixCol + i).value = `_MAT_SUB_${i + 1}`;
  }
  categories.forEach((category, catIndex) => {
    const subs = Object.keys(TAXONOMY[category]);
    subs.forEach((sub, subIndex) => {
      sheet.getCell(catIndex + 2, subMatrixCol + subIndex).value = sub;
    });
  });

  for (let j = 0; j < maxTypes; j++) {
    sheet.getCell(1, typeMatrixCol + j).value = `_MAT_TIPO_${j + 1}`;
  }
  subTypeEntries.forEach((entry, subIndex) => {
    entry.types.forEach((typeName, typeIndex) => {
      sheet.getCell(subIndex + 2, typeMatrixCol + typeIndex).value = typeName;
    });
  });

  if (mainSheet && lastRow >= firstRow) {
    const catEndRow = categories.length + 1;
    const subEndRow = subcategories.length + 1;
    const sheetRef = quoteSheetName(mainSheet.name);
    const catIdxLtr = colLetter(catIdxCol);
    const subIdxLtr = colLetter(subIdxCol);
    const subMatrixCols = Array.from({ length: maxSubs }, (_, i) => colLetter(subMatrixCol + i));
    const typeMatrixCols = Array.from({ length: maxTypes }, (_, j) => colLetter(typeMatrixCol + j));

    const catIndexMap = new Map(categories.map((cat, idx) => [cat.toLowerCase(), idx + 1]));
    const subIndexMap = new Map(subcategories.map((sub, idx) => [sub.toLowerCase(), idx + 1]));

    sheet.getCell(1, catIdxCol).value = '_FILA_CAT_IDX';
    for (let i = 0; i < maxSubs; i++) sheet.getCell(1, subRowStartCol + i).value = `_FILA_SUB_${i + 1}`;
    sheet.getCell(1, subIdxCol).value = '_FILA_SUB_IDX';
    for (let j = 0; j < maxTypes; j++) sheet.getCell(1, typeRowStartCol + j).value = `_FILA_TIPO_${j + 1}`;

    for (let row = firstRow; row <= lastRow; row++) {
      const existingRow = mainSheet.findRow(row);
      const catVal = existingRow ? plainText(existingRow.getCell(6).value) : '';
      const subVal = existingRow ? plainText(existingRow.getCell(7).value) : '';

      const catIdx = catVal ? (catIndexMap.get(catVal.toLowerCase()) || 0) : 0;
      const subsForCat = catIdx > 0 ? Object.keys(TAXONOMY[categories[catIdx - 1]]) : [];
      const subIdx = subVal ? (subIndexMap.get(subVal.toLowerCase()) || 0) : 0;
      const typesForSub = subIdx > 0 ? subTypeEntries[subIdx - 1].types : [];

      const listRow = sheet.getRow(row);
      listRow.getCell(catIdxCol).value = {
        formula: `IFERROR(MATCH(${sheetRef}!$F${row},$B$2:$B$${catEndRow},0),0)`,
        result: catIdx,
      };
      for (let i = 0; i < maxSubs; i++) {
        const mCol = subMatrixCols[i];
        listRow.getCell(subRowStartCol + i).value = {
          formula: `IF($${catIdxLtr}${row}=0,"",INDEX(${mCol}$2:${mCol}$${catEndRow},$${catIdxLtr}${row})&"")`,
          result: subsForCat[i] || '',
        };
      }
      listRow.getCell(subIdxCol).value = {
        formula: `IFERROR(MATCH(${sheetRef}!$G${row},$C$2:$C$${subEndRow},0),0)`,
        result: subIdx,
      };
      for (let j = 0; j < maxTypes; j++) {
        const tCol = typeMatrixCols[j];
        listRow.getCell(typeRowStartCol + j).value = {
          formula: `IF($${subIdxLtr}${row}=0,"",INDEX(${tCol}$2:${tCol}$${subEndRow},$${subIdxLtr}${row})&"")`,
          result: typesForSub[j] || '',
        };
      }
    }
  }

  if (hidden) sheet.state = 'hidden';
  return sheet;
}

module.exports = { colLetter, calcularRefs, aplicarValidacionesClasificacion, construirHojaListas };
