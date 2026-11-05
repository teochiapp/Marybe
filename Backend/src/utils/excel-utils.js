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
};
