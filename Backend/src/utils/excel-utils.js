'use strict';

// ─── Taxonomía completa ───────────────────────────────────────────────────────
const TAXONOMY = {
  'Ofertas': {
    'Fragancias': [],
    'Maquillaje': [],
    'Dermocosmetica': [],
    'Cuidado Personal': [],
    'Bebés y niños': [],
    'Limpieza del hogar': [],
  },
  'Dermocosmetica': {
    'Cuidado facial':   ['Limpieza facial', 'Exfoliantes y Mascarillas', 'Tónicos', 'Cremas Faciales', 'Serums', 'Contornos de ojos y labios', 'Accesorios'],
    'Cuidado Corporal': ['Cremas Corporales', 'Cremas de manos', 'Cremas para masajes', 'Exfoliantes', 'Accesorios'],
    'Solares':          ['Faciales', 'Corporales', 'Autobronceantes', 'Post Solares', 'Accesorios'],
  },
  'Fragancias': {
    'Femeninas':    ['Premium', 'Sets', 'Semi selectivos', 'Nacionales', 'Body Splash y Colonias'],
    'Masculinos':   ['Premium', 'Sets', 'Semi selectivos', 'Nacionales', 'Body Splash y Colonias'],
    'Bebés y niños': ['Premium', 'Sets', 'Nacionales', 'Body Splash y Colonias'],
  },
  'Maquillaje': {
    'Labios':     ['Labiales Liquidos', 'Labiales en Barra', 'Bálsamos Labiales', 'Brillos Labiales', 'Delineadores'],
    'Ojos':       ['Mascaras de pestañas', 'Sombras', 'Delineadores en Lapiz', 'Delineadores Liquidos', 'Cejas'],
    'Rostro':     ['Bases de Maquillaje', 'Correctores de Ojeras', 'Polvos', 'Bronzer', 'Iluminadores', 'Rubores', 'Fijadores', 'Primer'],
    'Uñas':       ['Esmaltes', 'Quita esmaltes', 'Tratamientos'],
    'Accesorios': ['Brochas y Pinceles', 'Esponjas'],
  },
  'Cuidado Personal': {
    'Cuidado Capilar':  ['Shampoo', 'Acondicionadores', 'Tratamientos Capilares', 'Coloración', 'Gel y Fijadores', 'Cepillos y Peines'],
    'Higiene Corporal': ['Desodorantes', 'Depilacion', 'Afeitado', 'Jabones de Tocador', 'Algodones e hisopos', 'Talcos'],
    'Higiene Oral':     ['Pastas Dentales', 'Cepillos de dientes', 'Hilos dentales', 'Enjuagues bucales'],
    'Cuidado Intimo':   ['Toallitas', 'Protectores diarios', 'Salud intima', 'Incontinencia'],
    'Accesorios':       [],
  },
  'Niños y Bebés': {
    'Pañales':                   [],
    'Higiene del Bebe':          ['Toallas humedas', 'Oleos y algodón', 'Talcos y Aceites'],
    'Jabones':                   [],
    'Colonias':                  [],
    'Fragancias':                [],
    'Desodorantes':              [],
    'Cuidado materno':           ['Protectores Mamarios', 'Cuidado de piel'],
    'Cremas y cepillos dentales': [],
    'Solares':                   [],
    'Capilares':                 ['Shampoo', 'Acondicionadores', 'Tratamientos'],
  },
  'Limpieza del hogar': {
    'Cocina':                  ['Detergentes', 'Lava Vajillas', 'Limpieza de Superficies'],
    'Baño':                    ['Desinfectantes', 'Pastillas de inodoro'],
    'Pisos y Muebles':         ['Lavandina', 'Desinfectantes', 'Aromatizantes', 'Lustramuebles', 'Ceras y Autobrillos'],
    'Insecticida y Repelentes': ['Aerosoles', 'Repelentes', 'Aparatos y cebos'],
    'Ropa':                    ['Jabones Liquidos', 'Suavizantes'],
    'Calzado':                 ['Brillos Limpiadores', 'Pomadas'],
    'Desodorante de Ambiente': ['Aromatizantes', 'Desinfectantes'],
    'Papeles':                 ['Pañuelos', 'Papel Higienico', 'Rollos de Cocina', 'Servilletas'],
    'Accesorios de Limpieza':  ['Mopas', 'Escobas', 'Esponjas', 'Guantes', 'Palas y Cabos', 'Trapos de Piso y Paños Multiuso'],
  },
  'Electro belleza': {
    'Maquinas de Corte Cabello y Barba': [],
    'Planchas y Rizadores':              [],
    'Secadores de Pelo':                 [],
    'Depilación':                        [],
    'Masajeadores':                      [],
    'Cabinas y Tornos de Uñas':          [],
  },
  'Lanzamientos': {},
};

const SECCIONES = ['Perfumería', 'Hogar'];

const COLORES = [
  'Blanco', 'Negro', 'Gris', 'Rojo', 'Rosa', 'Fucsia', 'Nude', 'Beige',
  'Marrón', 'Azul', 'Celeste', 'Verde', 'Amarillo', 'Naranja', 'Violeta',
  'Lila', 'Dorado', 'Plateado', 'Cobre', 'Transparente'
];

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
