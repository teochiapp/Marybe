'use strict';

// ─── Taxonomía completa ───────────────────────────────────────────────────────
// @ts-ignore
const TAXONOMY = require('./excel-taxonomy.json');

const SECCIONES = ['Perfumería', 'Hogar'];

const COLORES = ["Negro","Negro Azulado","Castaño Oscuro","Castaño Natural","Castaño Claro","Castaño Ceniza","Castaño Dorado","Chocolate","Caoba","Avellana","Rubio Oscuro","Rubio Natural","Rubio Claro","Rubio Dorado","Rubio Ceniza","Rubio Platinado","Miel","Rojo","Rojo Intenso","Bordo","Bordo Oscuro","Cobre","Rojizo","Rosa Claro","Rosa","Rosa Oscuro","Fucsia","Coral","Durazno","Nude","Beige","Arena","Marfil","Porcelana","Blanco","Blanco Perla","Dorado","Plateado","Bronce","Lavanda","Lila","Violeta","Morado","Azul","Turquesa","Verde","Verde Oliva","Gris Claro","Gris","Gris Oscuro","Transparente","Incoloro","Negro Intenso","Negro Profundo","Ebano","Castano Oscuro","Castano Claro Dorado","Castano Claro","Castano Ceniza Caoba","Castano Rojizo","Castano","Rubio Ultra Claro","Rubio Muy Claro","Rubio Claro Cenizo","Rubio Claro Dorado","Rubio Cenizo","Rubio Rojizo","Rubio","Rojo Cobrizo","Cobrizo Rubi","Cobrizo","Chocolate Caoba","Chocolate Puro","Borgonya","Borgoña","Caramelo","Ceniza","Dorado Cobrizo","Arandano","Grosella","Tamarindo","Cafe","Capuccino","Espresso","Champana","Almendra","Jazmin","Margarita","Nectar","Trigo","Centeno","Ambar","Azahar","Maracuya"];

// ─── Paleta de colores ────────────────────────────────────────────────────────
const C = {
  violeta:       'FF7C6AF7',
  violetaClaro:  'FFEDE9FE',
  coral:         'FFF77C6A',
  coralClaro:    'FFFCE7E4',
  verde:         'FF22C55E',
  verdeClaro:    'FFD1FAE5',
  amarillo:      'FFFBBF24',
  amarilloClaro: 'FFFEF3C7',
  azul:          'FF3B82F6',
  azulClaro:     'FFDBEAFE',
  grisOscuro:    'FF1E1B4B',
  grisClaro:     'FFF8F7FF',
  grisMedio:     'FFE0DEFF',
  blanco:        'FFFFFFFF',
  rojo:          'FFEF4444',
  rojoClaro:     'FFFEE2E2',
  texto:         'FF1E1B4B',
  textomuted:    'FF6B7280',
  naranja:       'FFFFA500',
  naranjaClaro:  'FFFFF3E0',
};

// ─── Helpers de estilo ────────────────────────────────────────────────────────
function headerStyle(bgColor, textColor = C.blanco) {
  return {
    fill:      { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } },
    font:      { bold: true, color: { argb: textColor }, size: 10, name: 'Calibri' },
    alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
    border: {
      top:    { style: 'thin', color: { argb: 'FFD4D4D4' } },
      bottom: { style: 'thin', color: { argb: 'FFD4D4D4' } },
      left:   { style: 'thin', color: { argb: 'FFD4D4D4' } },
      right:  { style: 'thin', color: { argb: 'FFD4D4D4' } },
    },
  };
}

function dataStyle(bgColor = C.blanco, textColor = C.texto) {
  return {
    fill:      { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } },
    font:      { color: { argb: textColor }, size: 10, name: 'Calibri' },
    alignment: { vertical: 'middle', wrapText: true },
    border: {
      top:    { style: 'hair', color: { argb: 'FFE5E7EB' } },
      bottom: { style: 'hair', color: { argb: 'FFE5E7EB' } },
      left:   { style: 'hair', color: { argb: 'FFE5E7EB' } },
      right:  { style: 'hair', color: { argb: 'FFE5E7EB' } },
    },
  };
}

function noteStyle() {
  return {
    fill:      { type: 'pattern', pattern: 'solid', fgColor: { argb: C.amarilloClaro } },
    font:      { color: { argb: 'FF92400E' }, size: 9, italic: true, name: 'Calibri' },
    alignment: { vertical: 'middle', wrapText: true },
  };
}

function readonlyStyle() {
  return {
    fill:      { type: 'pattern', pattern: 'solid', fgColor: { argb: C.verdeClaro } },
    font:      { color: { argb: 'FF065F46' }, size: 10, name: 'Calibri' },
    alignment: { vertical: 'middle', horizontal: 'center' },
    border: {
      top:    { style: 'hair', color: { argb: 'FFE5E7EB' } },
      bottom: { style: 'hair', color: { argb: 'FFE5E7EB' } },
      left:   { style: 'hair', color: { argb: 'FFE5E7EB' } },
      right:  { style: 'hair', color: { argb: 'FFE5E7EB' } },
    },
  };
}

function applyStyle(cell, style) {
  if (style.fill)      cell.fill      = style.fill;
  if (style.font)      cell.font      = style.font;
  if (style.alignment) cell.alignment = style.alignment;
  if (style.border)    cell.border    = style.border;
}

function boolStr(val) {
  return val === true || val === 1 || String(val).toLowerCase() === 'true' || String(val).toLowerCase() === 'si' ? 'SI' : 'NO';
}

function safeNum(val) {
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

function calcPct(precio, precioOferta, descuentoExplicito = 0) {
  if (descuentoExplicito && descuentoExplicito > 0) return descuentoExplicito;
  if (precio && precioOferta && precio > 0 && precioOferta < precio) {
    return Math.round(((precio - precioOferta) / precio) * 100);
  }
  return 0;
}

function filtrarVariantesComerciales(padreIdOriginal, variantes = []) {
  const lista = variantes || [];
  return lista.filter(v => {
    const esV1 = v.id_original === `${padreIdOriginal}-v1`;
    const esUnicaYVacia = lista.length === 1 && !(v.volumen || '').trim() && !(v.color_nombre || '').trim();
    return !(esV1 || esUnicaYVacia);
  });
}

function buildParentLookupFormula(rowIdx, parentSheetName = '📦 Productos', parentNameCol = 'C', parentNameColIdx = 3) {
  const escapedSheet = `'${String(parentSheetName).replace(/'/g, "''")}'`;
  const range = `${escapedSheet}!A:${parentNameCol}`;
  return `IF(B${rowIdx}<>"",IFERROR(VLOOKUP(B${rowIdx},${range},${parentNameColIdx},FALSE),IFERROR(VLOOKUP(B${rowIdx}&"",${range},${parentNameColIdx},FALSE),IFERROR(VLOOKUP(VALUE(B${rowIdx}),${range},${parentNameColIdx},FALSE),""))),"")`;
}

function construirHojaVariantes(wb, productos, refs, options = {}) {
  const {
    title = '🔗 MARYBE — Variantes exportadas',
    instruction = '⚠ Una fila por variante. "producto_padre_id" debe coincidir con el "ID Original" de la hoja Productos. Columnas C e I son calculadas automáticamente.',
    parentSheetName = '📦 Productos',
    parentNameCol = 'C',
    parentNameColIdx = 3,
    extraRows = 300,
    groupByProduct = false,
    fallbackExampleIfEmpty = false,
  } = options;

  const wsV = wb.addWorksheet('🔗 Variantes', {
    properties: { tabColor: { argb: C.coral } },
    pageSetup:  { fitToPage: true, fitToWidth: 1, orientation: 'landscape' },
    views:      [{ state: 'frozen', xSplit: 0, ySplit: 3 }],
  });

  wsV.mergeCells('A1:L1');
  const titleV     = wsV.getCell('A1');
  titleV.value     = title;
  titleV.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7C3AED' } };
  titleV.font      = { bold: true, color: { argb: C.blanco }, size: 14, name: 'Calibri' };
  titleV.alignment = { horizontal: 'center', vertical: 'middle' };
  wsV.getRow(1).height = 36;

  wsV.mergeCells('A2:L2');
  const instrV = wsV.getCell('A2');
  instrV.value = instruction;
  applyStyle(instrV, noteStyle());
  wsV.getRow(2).height = 28;

  const colDefsV = [
    { header: 'ID Variante *',            width: 16, color: C.coral,      note: 'ID único de esta variante' },
    { header: 'ID Producto Padre *',      width: 18, color: C.coral,      note: 'Debe coincidir con ID Original de Productos' },
    { header: 'Nombre Producto Padre 🔒', width: 32, color: C.verde,      note: 'Calculado automáticamente con BUSCARV' },
    { header: 'SKU / EAN',               width: 18, color: C.grisOscuro, note: 'Código de barras único de esta variante' },
    { header: 'Volumen / Tamaño',         width: 16, color: C.grisOscuro, note: 'Ej: 30 ml, 50 ml, 100 ml' },
    { header: 'Stock',                    width: 10, color: C.grisOscuro, note: 'Cantidad disponible' },
    { header: 'Precio *',                 width: 14, color: C.coral,      note: 'Precio de venta normal (sin descuento)' },
    { header: 'Precio Oferta',             width: 16, color: C.grisOscuro, note: 'Precio con descuento (editable)' },
    { header: '% Descuento 🔒',          width: 14, color: C.verde,      note: 'Calculado a partir del Precio Oferta' },
    { header: 'Publicado',                width: 12, color: C.grisOscuro, note: 'TRUE = visible | FALSE = oculto' },
    { header: 'Envío',                    width: 10, color: C.grisOscuro, note: '1 = tiene envío | 0 = sin envío' },
    { header: '🎨 Color',                width: 20, color: C.naranja,    note: 'Nombre del color' },
  ];

  wsV.columns = colDefsV.map(h => ({ width: h.width }));

  const rowHeaderV = wsV.getRow(3);
  colDefsV.forEach((h, i) => {
    const cell = rowHeaderV.getCell(i + 1);
    cell.value = h.header;
    applyStyle(cell, headerStyle(h.color));
    if (h.note) cell.note = { texts: [{ text: h.note }] };
  });
  rowHeaderV.height = 30;

  let rowIdxV = 3;
  let productosSinVariante = 0;
  let productGroupIdx = 0;

  const bloquesVariantes = [];
  for (const prod of productos) {
    const padreIdOriginal = prod.id_original || String(prod.id || '');
    const variantesLimpias = prod._variantesEjemplo
      ? prod._variantesEjemplo
      : filtrarVariantesComerciales(padreIdOriginal, prod.variantes || []);

    if (variantesLimpias.length === 0) {
      productosSinVariante++;
      continue;
    }
    bloquesVariantes.push({ padreIdOriginal, variantesLimpias });
  }

  if (bloquesVariantes.length === 0 && fallbackExampleIfEmpty) {
    const primerPadreId = productos[0]
      ? (productos[0].id_original || String(productos[0].id || 'EJEMPLO-001'))
      : 'EJEMPLO-001';
    bloquesVariantes.push({
      padreIdOriginal: primerPadreId,
      variantesLimpias: [
        {
          id_variante:   'EJEMPLO-VAR-001',
          id_padre:      primerPadreId,
          sku_ean:       'EAN-EJEMPLO-001',
          volumen:       '50 ml (EJEMPLO — BORRAR)',
          stock:         5,
          precio:        10000,
          precio_oferta: 8000,
          pct_desc:      20,
          publicado:     'SI',
          envio:         '1',
          color_nombre:  '',
        },
      ],
    });
  }

  for (const { padreIdOriginal, variantesLimpias } of bloquesVariantes) {
    productGroupIdx++;

    for (const v of variantesLimpias) {
      rowIdxV++;
      const isEven = groupByProduct ? (productGroupIdx % 2 === 0) : (rowIdxV % 2 === 0);
      const bgColor = isEven ? C.blanco : 'FFFFF7ED';

      const precioV       = safeNum(v.precio);
      const precioOfertaV = safeNum(v.precio_oferta);
      const pctDescV      = v.pct_desc !== undefined ? v.pct_desc : calcPct(precioV, precioOfertaV, 0);

      const r = wsV.getRow(rowIdxV);
      r.height = 20;

      const cA = r.getCell(1);
      cA.value = String(v.id_original ?? v.id_variante ?? '');
      applyStyle(cA, dataStyle(bgColor));
      cA.numFmt = '@';

      const cB = r.getCell(2);
      cB.value = String(v.id_padre ?? padreIdOriginal);
      applyStyle(cB, dataStyle(bgColor));
      cB.numFmt = '@';

      const cC = r.getCell(3);
      cC.value = { formula: buildParentLookupFormula(rowIdxV, parentSheetName, parentNameCol, parentNameColIdx) };
      applyStyle(cC, readonlyStyle());

      const cD = r.getCell(4);
      cD.value = v.sku_ean || '';
      applyStyle(cD, dataStyle(bgColor));
      cD.numFmt = '@';

      const cE = r.getCell(5);
      cE.value = v.volumen || '';
      applyStyle(cE, dataStyle(bgColor));

      const cF = r.getCell(6);
      cF.value = v.stock !== undefined && v.stock !== null ? Number(v.stock) : 0;
      applyStyle(cF, dataStyle(bgColor));
      cF.alignment = { vertical: 'middle', horizontal: 'center' };

      const cG = r.getCell(7);
      if (precioV !== null) cG.value = precioV;
      applyStyle(cG, dataStyle(bgColor));
      cG.font = { bold: true, color: { argb: C.grisOscuro }, size: 10, name: 'Calibri' };

      const cH = r.getCell(8);
      if (precioOfertaV !== null) cH.value = precioOfertaV;
      applyStyle(cH, dataStyle(bgColor));
      cH.font      = { bold: true, color: { argb: C.grisOscuro }, size: 10, name: 'Calibri' };
      cH.alignment = { vertical: 'middle', horizontal: 'right' };

      const cI = r.getCell(9);
      cI.value = pctDescV;
      applyStyle(cI, readonlyStyle());
      cI.font      = { color: { argb: 'FF065F46' }, size: 10, name: 'Calibri', italic: true };
      cI.alignment = { vertical: 'middle', horizontal: 'center' };

      const cJ = r.getCell(10);
      cJ.value = boolStr(v.publicado);
      applyStyle(cJ, dataStyle(bgColor));
      cJ.font  = { bold: true, color: { argb: cJ.value === 'SI' ? '16A34A' : 'EF4444' }, size: 10 };
      cJ.alignment = { vertical: 'middle' };

      const cK = r.getCell(11);
      cK.value = v.envio !== undefined && v.envio !== null ? String(v.envio) : '1';
      applyStyle(cK, dataStyle(bgColor));
      cK.alignment = { vertical: 'middle', horizontal: 'center' };

      const cM = r.getCell(12);
      cM.value = v.color_nombre || '';
      applyStyle(cM, dataStyle(bgColor));

      r.commit();
    }
  }

  const lastRowV = rowIdxV + extraRows;
  // @ts-ignore
  wsV.dataValidations.add(`J4:J${lastRowV}`, {
    type: 'list', allowBlank: true, showErrorMessage: false,
    formulae: [refs.booleanos],
  });
  // @ts-ignore
  wsV.dataValidations.add(`L4:L${lastRowV}`, {
    type: 'list', allowBlank: true, showErrorMessage: false,
    formulae: [refs.colores],
  });

  return { wsV, rowIdxV, productosSinVariante };
}

module.exports = {
  TAXONOMY,
  SECCIONES,
  COLORES,
  C,
  headerStyle,
  dataStyle,
  noteStyle,
  readonlyStyle,
  applyStyle,
  boolStr,
  safeNum,
  calcPct,
  filtrarVariantesComerciales,
  construirHojaVariantes,
};
