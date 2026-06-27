/**
 * generar-plantilla.js
 * Genera el archivo Excel con dos hojas:
 *   - Hoja 1: Productos (datos del padre)
 *   - Hoja 2: Variantes (hijos de cada producto)
 *
 * Uso: node Backend/scripts/generar-plantilla.js
 * Salida: Backend/data/Plantilla_Marybe.xlsx
 */

const ExcelJS = require('exceljs');
const path    = require('path');
const fs      = require('fs');

const OUTPUT = path.join(__dirname, '../data/Plantilla_Marybe.xlsx');

// ─── Paleta de colores ───────────────────────────────────────────────────────
const C = {
  violeta:      'FF7C6AF7',
  violetaClaro: 'FFEDE9FE',
  coral:        'FFF77C6A',
  coralClaro:   'FFFCE7E4',
  verde:        'FF22C55E',
  verdeClaro:   'FFD1FAE5',
  amarillo:     'FFFBBF24',
  amarilloClaro:'FFFEF3C7',
  azul:         'FF3B82F6',
  azulClaro:    'FFDBEAFE',
  grisOscuro:   'FF1E1B4B',
  grisClaro:    'FFF8F7FF',
  grisMedio:    'FFE0DEFF',
  blanco:       'FFFFFFFF',
  rojo:         'FFEF4444',
  rojoClaro:    'FFFEE2E2',
  texto:        'FF1E1B4B',
  textomuted:   'FF6B7280',
  naranja:      'FFFFA500',
  naranjaClaro: 'FFFFF3E0',
};

function headerStyle(bgColor, textColor = C.blanco) {
  return {
    fill:   { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } },
    font:   { bold: true, color: { argb: textColor }, size: 10, name: 'Calibri' },
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
    fill:   { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } },
    font:   { color: { argb: textColor }, size: 10, name: 'Calibri' },
    alignment: { vertical: 'middle', wrapText: false },
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
    fill:  { type: 'pattern', pattern: 'solid', fgColor: { argb: C.amarilloClaro } },
    font:  { color: { argb: 'FF92400E' }, size: 9, italic: true, name: 'Calibri' },
    alignment: { vertical: 'middle', wrapText: true },
  };
}

function readonlyStyle() {
  return {
    fill:   { type: 'pattern', pattern: 'solid', fgColor: { argb: C.verdeClaro } },
    font:   { color: { argb: 'FF065F46' }, size: 10, name: 'Calibri' },
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

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  const wb = new ExcelJS.Workbook();
  wb.creator  = 'Marybe';
  wb.created  = new Date();
  wb.modified = new Date();

  // ════════════════════════════════════════════════════════════════════════════
  // HOJA 1: PRODUCTOS
  // ════════════════════════════════════════════════════════════════════════════
  const wsP = wb.addWorksheet('📦 Productos', {
    properties: { tabColor: { argb: C.violeta } },
    pageSetup:  { fitToPage: true, fitToWidth: 1, orientation: 'landscape' },
    views:      [{ state: 'frozen', xSplit: 0, ySplit: 3 }],
  });

  // Columnas: A=id_original, B=sku, C=nombre, D=marca,
  //           E=seccion, F=categoria, G=subcategoria, H=tipo,
  //           I=descripcion_corta, J=descripcion_completa, K=especificaciones,
  //           L=proveedor, M=publicado, N=destacado, O=moneda, P=caracteristicas

  // ── Fila 1: Título ──
  wsP.mergeCells('A1:N1');
  const titleP = wsP.getCell('A1');
  titleP.value = '📦 MARYBE — Plantilla de Productos (Hoja 1 de 2)';
  titleP.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.grisOscuro } };
  titleP.font  = { bold: true, color: { argb: C.blanco }, size: 14, name: 'Calibri' };
  titleP.alignment = { horizontal: 'center', vertical: 'middle' };
  wsP.getRow(1).height = 36;

  // ── Fila 2: Instrucción ──
  wsP.mergeCells('A2:N2');
  const instrP = wsP.getCell('A2');
  instrP.value = '⚠ Completar un producto por fila. El campo "id_original" debe coincidir con "producto_padre_id" en la hoja Variantes. No modificar los nombres de columnas.';
  applyStyle(instrP, noteStyle());
  wsP.getRow(2).height = 28;

  // ── Fila 3: Headers ──
  //   Cols A-D: datos básicos (violeta)
  //   Cols E-G: jerarquía de categoría (azul)
  //   Cols H-K: info adicional (gris)
  const headersP = [
    { key: 'id_original',       header: 'ID Original *',      width: 14, group: 'base',  note: 'ID único del producto. Ej: 4751' },
    { key: 'sku',               header: 'SKU / EAN',          width: 18, group: 'base',  note: 'Código de barras o código interno principal' },
    { key: 'nombre',            header: 'Nombre *',           width: 40, group: 'base',  note: 'Nombre completo del producto' },
    { key: 'marca',             header: 'Marca',              width: 16, group: 'base',  note: "Marca comercial. Ej: L'Oreal" },
    { key: 'seccion',           header: 'Sección *',          width: 16, group: 'cat',   note: 'Nivel 1: Perfumería o Hogar. Usar el dropdown.' },
    { key: 'categoria',         header: 'Categoría',          width: 22, group: 'cat',   note: 'Nivel 2: Ej: Electro Belleza, Maquillaje, Baño, Pisos y Muebles' },
    { key: 'subcategoria',      header: 'Subcategoría',       width: 22, group: 'cat',   note: 'Nivel 3: Ej: Lavandina, Perfumes, Rizadores, Lava Vajillas' },
    { key: 'tipo',              header: 'Tipo',               width: 22, group: 'cat',   note: 'Nivel 4: Ej: Eau de Parfum, Kit, Crema, Aerosol, Pastilla' },
    { key: 'descripcion_corta', header: 'Descripción Corta',  width: 45, group: 'extra', note: 'Texto breve para mostrar en la web' },
    { key: 'descripcion_completa', header: 'Descripción Completa', width: 60, group: 'extra', note: 'Texto extenso con detalles del producto' },
    { key: 'especificaciones',  header: 'Especificaciones',   width: 50, group: 'extra', note: 'Especificaciones técnicas (opcional)' },
    { key: 'proveedor',         header: 'Proveedor',          width: 28, group: 'extra', note: 'Nombre del proveedor o distribuidor' },
    { key: 'publicado',         header: 'Publicado',          width: 12, group: 'extra', note: 'TRUE = visible en la tienda | FALSE = oculto' },
    { key: 'destacado',         header: 'Destacado',          width: 12, group: 'extra', note: 'TRUE = en sección destacados | FALSE = normal' },
    { key: 'moneda',            header: 'Moneda',             width: 10, group: 'extra', note: 'Código de moneda. Ej: ARS, USD' },
    { key: 'caracteristicas',   header: 'Características',    width: 40, group: 'extra', note: 'Características del producto separadas por | para mostrar como etiquetas. Ej: Sin alcohol | Vegano | Edición limitada' },
  ];

  wsP.columns = headersP.map(h => ({ key: h.key, width: h.width }));

  const rowHeaderP = wsP.getRow(3);
  headersP.forEach((h, i) => {
    const cell = rowHeaderP.getCell(i + 1);
    cell.value = h.header;
    const color = h.group === 'base' ? C.violeta : (h.group === 'cat' ? C.azul : C.grisOscuro);
    applyStyle(cell, headerStyle(color));
    if (h.note) cell.note = { texts: [{ text: h.note }] };
  });
  rowHeaderP.height = 30;

  // ── Datos de ejemplo ──
  const datosProductos = [
    // id_orig, sku,              nombre,                               marca,       seccion,       categoria,        subcategoria,    tipo,                  desc_corta,                                                     desc_comp, espec, proveedor,                  publicado, destacado, moneda, caracteristicas
    ['4751',  '4751',           'ISSUE COLORACION SACHET + oxidante', 'Issue',     'Perfumería',  'Coloración',     'Kits',          'Kit',                 'Kit coloración completo con oxidante incluido.',                '', '', 'LABORATORIO CUENCA SA',    'TRUE', 'FALSE', 'ARS', 'Kit Completo|Con Oxidante'],
    ['1001',  '7790416066525',  'CUTEX QUITAESMALTE FORTALECEDOR',    'Cutex',     'Perfumería',  'Maquillaje',     'Quitaesmalte',  'Líquido',             'Elimina el esmalte y fortalece la uña con vitamina E.',         '', '', 'NEW REVLON ARG',           'TRUE', 'FALSE', 'ARS', 'Vitamina E|Fortalecedor'],
    ['1003',  '7791001009811',  'BIFERDIL ACONDICIONADOR VITAMINADO', 'Biferdil',  'Perfumería',  'Electro Belleza','Acondicionador','Leave-in',            'Acondicionador sin enjuague con vitaminas A, C y E.',           '', '', 'BIFERDIL SRL',             'TRUE', 'FALSE', 'ARS', 'Sin Enjuague|Vitaminas A C y E|Edición Limitada'],
    ['2001',  '7792000100012',  'LAVANDINA CONCENTRADA 2L',           'AyudasDin', 'Hogar',       'Baño',           'Lavandina',     'Concentrada',         'Lavandina concentrada apta para pisos y sanitarios.',           '', '', 'DISTRIBUIDORA NORTE SA',   'TRUE', 'TRUE',  'ARS', 'Concentrada|Uso Doméstico'],
    ['2010',  '7792000100029',  'DETERGENTE LIMÓN 500ML',             'Skip',      'Hogar',       'Cocina',         'Detergentes',   'Líquido',             'Detergente líquido con aroma a limón. Gran poder limpiador.',   '', '', 'UNILEVER ARG SA',          'TRUE', 'FALSE', 'ARS', 'Aroma Limón'],
    ['3001',  '7793000000010',  'PERFUME ACQUA DI GIO 100ML',         'Armani',    'Perfumería',  'Fragancias',     'Hombre',        'Eau de Toilette',     'Elegante fragancia masculina con notas marinas y cítricas.',    '', '', 'LOREAL ARGENTINA',         'TRUE', 'TRUE',  'ARS', 'Notas Marinas|100ml'],
    ['3002',  '7793000000020',  'BASE DE MAQUILLAJE FIT ME',          'Maybelline','Perfumería',  'Maquillaje',     'Rostro',        'Base líquida',        'Base de maquillaje líquida mate, ideal para piel normal a grasa.','', '', 'LOREAL ARGENTINA',         'TRUE', 'FALSE', 'ARS', 'Efecto Mate|Larga Duración'],
    ['3003',  '7793000000030',  'SHAMPOO ELVIVE REPARACIÓN TOTAL 5',  'Loreal',    'Perfumería',  'Cuidado Capilar','Shampoo',       'Reparador',           'Repara el cabello dañado y fortalece las puntas.',              '', '', 'LOREAL ARGENTINA',         'TRUE', 'TRUE',  'ARS', 'Reparador|Sin Sulfatos'],
    ['3004',  '7793000000040',  'CREMA ANTIARRUGAS REVITALIFT',       'Loreal',    'Perfumería',  'Cuidado Facial', 'Cremas',        'Crema de día',        'Crema de día con ácido hialurónico y protector solar.',         '', '', 'LOREAL ARGENTINA',         'TRUE', 'FALSE', 'ARS', 'Ácido Hialurónico|FPS 30'],
    ['3005',  '7793000000050',  'DESODORANTE DOVE ORIGINAL',          'Dove',      'Perfumería',  'Cuidado Personal','Desodorantes', 'Roll-on',             'Protección 48h y cuarto de crema humectante.',                  '', '', 'UNILEVER ARG SA',          'TRUE', 'FALSE', 'ARS', 'Protección 48hs|Con Crema'],
    ['3006',  '7793000000060',  'PASTA DENTAL COLGATE TOTAL 12',      'Colgate',   'Perfumería',  'Cuidado Bucal',  'Pastas',        'Pasta dental',        'Protección antibacterial por 12 horas.',                        '', '', 'COLGATE PALMOLIVE',        'TRUE', 'TRUE',  'ARS', 'Antibacterial|12 horas'],
    ['3007',  '7793000000070',  'JABÓN LÍQUIDO ARIEL 3L',             'Ariel',     'Hogar',       'Ropa',           'Jabones Líquidos','Para diluir',        'Jabón líquido para diluir, remueve manchas difíciles.',         '', '', 'PROCTER & GAMBLE',         'TRUE', 'TRUE',  'ARS', 'Para Diluir|Anti Manchas'],
    ['3008',  '7793000000080',  'SUAVIZANTE VIVERE CLASSIC 3L',       'Vivere',    'Hogar',       'Ropa',           'Suavizantes',   'Concentrado',         'Deja tu ropa suave y con perfume duradero.',                    '', '', 'UNILEVER ARG SA',          'TRUE', 'FALSE', 'ARS', 'Perfume Duradero'],
    ['3009',  '7793000000090',  'LIMPIADOR POETT PRIMAVERA 900ML',    'Poett',     'Hogar',       'Pisos y Muebles','Desinfectantes','Líquido',             'Limpiador líquido antibacterial con exquisita fragancia.',      '', '', 'CLOROX ARGENTINA',         'TRUE', 'FALSE', 'ARS', 'Antibacterial|Aroma Primavera'],
    ['3010',  '7793000000100',  'INSECTICIDA RAID MATA MOSQUITOS',    'Raid',      'Hogar',       'Insecticidas y Repelentes','Aerosoles','Aerosol',          'Mata mosquitos al instante con base acuosa.',            '', '', 'SC JOHNSON',               'TRUE', 'TRUE',  'ARS', 'Base Acuosa|Acción Inmediata'],
    ['3011',  '7793000000110',  'ESPONJA MORTIMER MULTIUSO X3',       'Mortimer',  'Hogar',       'Accesorios de Limpieza','Esponjas','Pack',               'Pack de 3 esponjas con fibra verde, ideales para cocina.',     '', '', 'CLOROX ARGENTINA',         'TRUE', 'FALSE', 'ARS', 'Pack x3|Multiuso'],
    ['3012',  '7793000000120',  'PAPEL HIGIÉNICO CAMPANITA 30M X4',   'Campanita', 'Hogar',       'Papeles',        'Papel Higiénico','Hoja simple',         'Papel higiénico hoja simple, suave y absorbente.',             '', '', 'PAPELERA DEL PLATA',       'TRUE', 'FALSE', 'ARS', 'Pack x4|Hoja Simple'],
    ['3013',  '7793000000130',  'ROLLO DE COCINA SUSSEX CLASSIC X3',  'Sussex',    'Hogar',       'Papeles',        'Rollos de Cocina','Pack',               'Rollo de cocina súper absorbente x3 unidades.',               '', '', 'PAPELERA DEL PLATA',       'TRUE', 'FALSE', 'ARS', 'Pack x3|Súper Absorbente'],
    ['3014',  '7793000000140',  'AEROSOL LYSOL DESINFECTANTE CRISP',  'Lysol',     'Hogar',       'Desodorante de Ambiente','Desinfectantes','Aerosol',       'Mata el 99.9% de los virus y bacterias del hogar.',   '', '', 'RECKITT BENCKISER',        'TRUE', 'TRUE',  'ARS', '99.9% Bacterias|Desinfectante'],
    ['3015',  '7793000000150',  'ESCOBA PLASTICA ALASKA C/CABO',      'Alaska',    'Hogar',       'Accesorios de Limpieza','Escobas', 'Con cabo',            'Escoba reforzada con cerdas plumadas para mejor barrido.',     '', '', 'INDUSTRIAS ALASKA',        'TRUE', 'FALSE', 'ARS', 'Reforzada|Con Cabo'],
    // Fila guía vacía
    ['',      '',               '',                                    '',          '',            '',               '',              '',                    '',                                                              '', '', '',                         '',         '',     '', ''],
    ['→ TU PRODUCTO', '→ EAN', '→ NOMBRE DEL PRODUCTO',             '→ MARCA',   'Perfumería',  '→ Categoría',    '→ Subcategoría','→ Tipo (opcional)',    '→ Descripción (opcional)',                                      '', '', '→ PROVEEDOR',              'TRUE',  'FALSE', 'ARS', '→ Característica 1|Característica 2'],
  ];

  datosProductos.forEach((row, idx) => {
    const r = wsP.addRow(row);
    r.height = 20;
    const isGuide = idx === datosProductos.length - 1;
    const isBlank = row[0] === '';
    row.forEach((val, ci) => {
      const cell = r.getCell(ci + 1);
      if (isGuide) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.verdeClaro } };
        cell.font = { color: { argb: '065F46' }, italic: true, size: 9, name: 'Calibri' };
        cell.alignment = { vertical: 'middle' };
      } else if (isBlank) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
      } else {
        applyStyle(cell, dataStyle(idx % 2 === 0 ? C.blanco : C.grisClaro));
        // Resaltar columnas de categoría
        if (ci >= 4 && ci <= 7) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: idx % 2 === 0 ? C.azulClaro : 'FFBFDBFE' } };
          cell.font = { color: { argb: '1E3A5F' }, size: 10, name: 'Calibri' };
        }
        if (ci === 10 || ci === 11) { // publicado, destacado
          cell.font = { bold: true, color: { argb: val === 'TRUE' ? '16A34A' : C.rojo }, size: 10 };
        }
      }
    });
  });

  // Validación dropdown para Sección (E) — solo Perfumería o Hogar
  // Nota: con la nueva columna H=Tipo, las columnas de control se desplazan:
  //   Publicado=M, Destacado=N, Moneda=O
  for (let i = 4; i <= 1000; i++) {
    wsP.getCell(`E${i}`).dataValidation = {
      type: 'list', allowBlank: true,
      formulae: ['"Perfumería,Hogar"'],
      showErrorMessage: true,
      errorTitle: 'Sección inválida',
      error: 'Solo se permite: Perfumería o Hogar',
    };
    wsP.getCell(`M${i}`).dataValidation = {
      type: 'list', allowBlank: true,
      formulae: ['"TRUE,FALSE"'],
      showErrorMessage: true,
      errorTitle: 'Valor inválido',
      error: 'Solo se permite TRUE o FALSE',
    };
    wsP.getCell(`N${i}`).dataValidation = {
      type: 'list', allowBlank: true,
      formulae: ['"TRUE,FALSE"'],
      showErrorMessage: true,
      errorTitle: 'Valor inválido',
      error: 'Solo se permite TRUE o FALSE',
    };
    wsP.getCell(`O${i}`).dataValidation = {
      type: 'list', allowBlank: true,
      formulae: ['"ARS,USD,EUR"'],
    };
  }

  // ════════════════════════════════════════════════════════════════════════════
  // HOJA 2: VARIANTES
  // ════════════════════════════════════════════════════════════════════════════
  const wsV = wb.addWorksheet('🔗 Variantes', {
    properties: { tabColor: { argb: C.coral } },
    pageSetup:  { fitToPage: true, fitToWidth: 1, orientation: 'landscape' },
    views:      [{ state: 'frozen', xSplit: 0, ySplit: 3 }],
  });

  // Columnas: A=id_original, B=producto_padre_id, C=sku_ean, D=volumen,
  //           E=stock, F=precio, G=pct_descuento, H=precio_oferta (fórmula),
  //           I=publicado, J=envio, K=moneda, L=color_nombre

  // ── Fila 1: Título ──
  wsV.mergeCells('A1:L1');
  const titleV = wsV.getCell('A1');
  titleV.value = '🔗 MARYBE — Plantilla de Variantes (Hoja 2 de 2)';
  titleV.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7C3AED' } };
  titleV.font  = { bold: true, color: { argb: C.blanco }, size: 14, name: 'Calibri' };
  titleV.alignment = { horizontal: 'center', vertical: 'middle' };
  wsV.getRow(1).height = 36;

  // ── Fila 2: Instrucción ──
  wsV.mergeCells('A2:L2');
  const instrV = wsV.getCell('A2');
  instrV.value = '⚠ Una fila por variante. "producto_padre_id" debe coincidir con un "id_original" de la hoja Productos. Columna H (Precio Oferta) se calcula automáticamente — NO modificar. Columna L (Color): elegir de la lista.';
  applyStyle(instrV, noteStyle());
  wsV.getRow(2).height = 28;

  // ── Fila 3: Headers ──
  const headersV = [
    { key: 'id_original',       header: 'ID Variante *',       width: 16, req: true,  note: 'ID único de esta variante. Ej: 13887 (hijo) o 1001 (único)' },
    { key: 'producto_padre_id', header: 'ID Producto Padre *', width: 18, req: true,  note: 'Debe coincidir con "id_original" de la hoja Productos' },
    { key: 'nombre_padre',      header: 'Nombre Producto Padre 🔒', width: 32, req: false, note: '⚡ CALCULADO AUTOMÁTICAMENTE con BUSCARV. Ayuda visual para identificar a qué producto pertenece.' },
    { key: 'sku_ean',           header: 'SKU / EAN',           width: 18, req: false, note: 'Código de barras único de esta variante' },
    { key: 'volumen',           header: 'Volumen / Tamaño',    width: 16, req: false, note: 'Ej: 50ml, 100ml, 200g, Tono Rubio, Talle M' },
    { key: 'stock',             header: 'Stock',               width: 10, req: false, note: 'Cantidad disponible. Número entero. 0 = sin stock' },
    { key: 'precio',            header: 'Precio *',            width: 14, req: true,  note: 'Precio de venta normal (sin puntos de miles). Ej: 3100' },
    { key: 'pct_descuento',     header: '% Descuento',         width: 14, req: false, note: 'Ingresá el porcentaje de descuento (0-100). Ej: 25 para 25%. Dejar vacío o 0 si no hay oferta.' },
    { key: 'precio_oferta',     header: 'Precio Oferta 🔒',    width: 16, req: false, note: '⚡ CALCULADO AUTOMÁTICAMENTE. No modificar. Resultado de Precio × (1 - %Descuento/100)' },
    { key: 'publicado',         header: 'Publicado',           width: 12, req: false, note: 'TRUE = visible | FALSE = oculto' },
    { key: 'envio',             header: 'Envío',               width: 10, req: false, note: '1 = tiene envío | 0 = sin envío | dejar vacío' },
    { key: 'moneda',            header: 'Moneda',              width: 10, req: false, note: 'Código de moneda. Ej: ARS, USD' },
    { key: 'color_nombre',      header: '🎨 Color',            width: 20, req: false, note: 'Elegir de la lista desplegable. Ej: Castaño Oscuro, Rojo, Nude. Dejar vacío si no aplica.' },
  ];

  wsV.columns = headersV.map(h => ({ key: h.key, width: h.width }));

  const rowHeaderV = wsV.getRow(3);
  headersV.forEach((h, i) => {
    const cell = rowHeaderV.getCell(i + 1);
    cell.value = h.header;
    // Columna C (índice 2) = nombre_padre | Columna I (índice 8) = precio_oferta → verde
    // Columna M (índice 12) = color → naranja
    let headerColor;
    if (i === 2 || i === 8)  headerColor = C.verde;
    else if (i === 12) headerColor = C.naranja;
    else headerColor = h.req ? C.coral : C.grisOscuro;
    applyStyle(cell, headerStyle(headerColor));
    if (h.note) cell.note = { texts: [{ text: h.note }] };
  });
  rowHeaderV.height = 30;

  // ── Datos de ejemplo ──
  // Arrays: [id_orig, padre_id, null, sku_ean, volumen, stock, precio, pct_descuento, color_nombre]
  // nombre_padre (col C) y precio_oferta (col I) se colocan como fórmula
  const datosVariantesBase = [
    // sep
    ['═══', '══════', '', '── Ejemplo: Producto SIMPLE (sin color) ──', '', '', '', '', '', '', '', '', ''],
    ['1001', '1001',  '', '7790416066525', '50ml',             '8',  '2300', '0',  ''],
    ['2001', '2001',  '', '7792000100012', '2L',               '15', '1200', '15', ''],
    // sep
    ['═══', '══════', '', '── Ejemplo: Producto CON VARIANTES DE COLOR (colores = variantes) ──', '', '', '', '', '', '', '', '', ''],
    ['4751',  '4751', '', '4751',         'Kit base',          '0',  '3100', '20', 'Castaño Oscuro'],
    ['13887', '4751', '', '7793008001614','Castaño Oscuro 3.0','6',  '3100', '20', 'Castaño Oscuro'],
    ['13889', '4751', '', '7793008005063','Castaño Natural 4.0','6', '3100', '20', 'Castaño Natural'],
    ['13891', '4751', '', '7793008001621','Castaño Claro 5.0', '6',  '3100', '20', 'Castaño Claro'],
    ['13893', '4751', '', '7793008001638','Rubio Oscuro 6.0',  '3',  '3100', '0',  'Rubio Oscuro'],
    ['13899', '4751', '', '7793008001645','Rubio Natural 7.0', '3',  '3100', '0',  'Rubio Natural'],
    // guía vacía
    ['',      '',     '', '',             '',                  '',   '',     '',   ''],
    ['→ ID', '→ ID PADRE', '', '→ EAN', '→ Volumen o Tono', '→ 10', '→ 3500', '→ 25 (o 0)', '→ Elegir de la lista'],
  ];

  // La fórmula de precio_oferta empieza en la fila 4 (índices Excel)
  // Mapeamos los índices reales de fila a medida que insertamos
  let excelRowNum = 3; // ya estamos en la 3 (header), así que la primera data row es 4

  datosVariantesBase.forEach((row, idx) => {
    excelRowNum++;
    const r = wsV.addRow([]);
    r.height = 20;

    const isSeparator = row[0] === '═══';
    const isGuide     = idx === datosVariantesBase.length - 1;
    const isBlank     = row[0] === '';

    if (isSeparator) {
      // Col A-B: fondo violeta claro
      for (let ci = 1; ci <= 11; ci++) {
        const cell = r.getCell(ci);
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0DEFF' } };
        if (ci === 3) {
          cell.value = row[2];
          cell.font = { bold: true, color: { argb: '4338CA' }, size: 9, name: 'Calibri' };
        }
      }
    } else if (isGuide) {
      for (let ci = 1; ci <= 8; ci++) {
        const cell = r.getCell(ci);
        cell.value = row[ci - 1] || '';
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.verdeClaro } };
        cell.font = { color: { argb: '065F46' }, italic: true, size: 9, name: 'Calibri' };
        cell.alignment = { vertical: 'middle' };
      }
    } else if (isBlank) {
      for (let ci = 1; ci <= 11; ci++) {
        r.getCell(ci).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
      }
    } else {
      // Fila de datos real
      const [id_original, producto_padre_id, empty_c, sku_ean, volumen, stock, precio, pct_descuento, color_nombre] = row;
      const isHijo = id_original !== producto_padre_id;
      const bgBase = isHijo ? 'FFFFF7ED' : C.blanco;

      // Cols A-M: datos
      const valores = [
        id_original, 
        producto_padre_id, 
        null, // Col C: nombre_padre
        sku_ean, 
        volumen, 
        stock, 
        precio, 
        pct_descuento, 
        null, // Col I: precio_oferta
        'TRUE', // Col J: publicado
        '1',    // Col K: envio
        'ARS',  // Col L: moneda
        color_nombre || '' // Col M
      ];
      
      valores.forEach((val, ci) => {
        const cell = r.getCell(ci + 1);
        if (ci === 2) {
          // Col C: nombre_padre — FÓRMULA VLOOKUP
          cell.value = { formula: `IF(B${excelRowNum}<>"",IFERROR(VLOOKUP(B${excelRowNum},'📦 Productos'!A:C,3,FALSE),"No encontrado"),"")` };
          applyStyle(cell, readonlyStyle());
        } else if (ci === 8) {
          // Col I: precio_oferta — FÓRMULA automática (G * (1 - H/100))
          cell.value = { formula: `IF(H${excelRowNum}>0,ROUND(G${excelRowNum}*(1-H${excelRowNum}/100),2),"")` };
          applyStyle(cell, readonlyStyle());
        } else if (ci === 9) { // publicado
          cell.value = val;
          cell.font = { bold: true, color: { argb: '16A34A' }, size: 10 };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgBase } };
        } else if (ci === 12) { // color_nombre
          cell.value = val;
          applyStyle(cell, dataStyle(bgBase));
          if (val) {
            cell.font = { bold: true, color: { argb: C.naranja.replace('FF', '') }, size: 10 };
          }
        } else {
          cell.value = val;
          applyStyle(cell, dataStyle(bgBase));
          if (ci === 7 && val && parseFloat(val) > 0) { // pct_descuento
            cell.font = { bold: true, color: { argb: 'FF7C3AED' }, size: 10 };
          }
          if (ci === 6) { // precio
            cell.font = { bold: true, color: { argb: C.grisOscuro }, size: 10, name: 'Calibri' };
          }
        }
      });
    }
  });

  // Aplicar fórmulas (Nombre Padre, Precio Oferta) y validaciones a las filas vacías
  const dataStartRow = 4;
  const dataEndRow   = 1000;
  for (let i = dataStartRow; i <= dataEndRow; i++) {
    // Col C: nombre_padre
    const cellC = wsV.getCell(`C${i}`);
    if (!cellC.value) {
      cellC.value = { formula: `IF(B${i}<>"",IFERROR(VLOOKUP(B${i},'📦 Productos'!A:C,3,FALSE),""),"")` };
      applyStyle(cellC, readonlyStyle());
    }

    // Col I: precio_oferta
    const cellI = wsV.getCell(`I${i}`);
    if (!cellI.value) {
      cellI.value = { formula: `IF(H${i}>0,ROUND(G${i}*(1-H${i}/100),2),"")` };
      applyStyle(cellI, readonlyStyle());
    }

    // Validaciones dropdown
    wsV.getCell(`J${i}`).dataValidation = {
      type: 'list', allowBlank: true,
      formulae: ['"TRUE,FALSE"'],
      showErrorMessage: true,
      errorTitle: 'Valor inválido',
      error: 'Solo TRUE o FALSE',
    };
    wsV.getCell(`L${i}`).dataValidation = {
      type: 'list', allowBlank: true,
      formulae: ['"ARS,USD,EUR"'],
    };
    wsV.getCell(`K${i}`).dataValidation = {
      type: 'list', allowBlank: true,
      formulae: ['"1,0"'],
    };
    // Validación % descuento entre 0 y 100
    wsV.getCell(`H${i}`).dataValidation = {
      type: 'whole', allowBlank: true,
      operator: 'between',
      formulae: [0, 100],
      showErrorMessage: true,
      errorTitle: 'Porcentaje inválido',
      error: 'El descuento debe ser un número entre 0 y 100',
    };
    // Dropdown de colores desde la hoja oculta
    wsV.getCell(`M${i}`).dataValidation = {
      type: 'list', allowBlank: true,
      formulae: ["'🎨 Colores'!$A$2:$A$60"],
      showErrorMessage: false, // permitir valores personalizados también
    };
  }

  // ════════════════════════════════════════════════════════════════════════════
  // HOJA OCULTA: PALETA DE COLORES (fuente del dropdown de col L)
  // ════════════════════════════════════════════════════════════════════════════
  const wsC = wb.addWorksheet('🎨 Colores', {
    properties: { tabColor: { argb: C.naranja } },
    state: 'veryHidden', // oculta para el usuario
  });
  wsC.columns = [{ key: 'nombre', width: 28 }, { key: 'hex', width: 12 }];

  // Encabezado
  const cHeader = wsC.getRow(1);
  cHeader.getCell(1).value = 'Nombre del Color';
  cHeader.getCell(2).value = 'Hex (referencia)';
  applyStyle(cHeader.getCell(1), headerStyle(C.naranja));
  applyStyle(cHeader.getCell(2), headerStyle(C.naranja));
  cHeader.height = 24;

  // Lista de colores: [nombre, hex]
  const COLORES = [
    // ── Negros y oscuros
    ['Negro',              '#1a1a1a'],
    ['Negro Azulado',      '#0d0d1a'],
    // ── Marrones y castaños
    ['Castaño Oscuro',     '#3E2009'],
    ['Castaño Natural',    '#6B4226'],
    ['Castaño Claro',      '#8B6347'],
    ['Castaño Ceniza',     '#6B5B52'],
    ['Castaño Dorado',     '#8B5E3C'],
    ['Chocolate',          '#3D1C02'],
    ['Caoba',              '#722F37'],
    ['Avellana',           '#855E42'],
    // ── Rubios
    ['Rubio Oscuro',       '#C8A96E'],
    ['Rubio Natural',      '#E8C98A'],
    ['Rubio Claro',        '#F5DEB3'],
    ['Rubio Dorado',       '#DAA520'],
    ['Rubio Ceniza',       '#D4C5A9'],
    ['Rubio Platinado',    '#F0E6C8'],
    ['Miel',               '#FFC30B'],
    // ── Rojos y cobres
    ['Rojo',               '#CC0000'],
    ['Rojo Intenso',       '#8B0000'],
    ['Bordo',              '#5C0A0A'],
    ['Bordo Oscuro',       '#3E0102'],
    ['Cobre',              '#B87333'],
    ['Rojizo',             '#9B2335'],
    // ── Rosas / Fucsia
    ['Rosa Claro',         '#FFCDD2'],
    ['Rosa',               '#FFB6C1'],
    ['Rosa Oscuro',        '#C2185B'],
    ['Fucsia',             '#FF0090'],
    ['Coral',              '#FF6B6B'],
    ['Durazno',            '#FFCBA4'],
    // ── Nude / Beige / Marfil
    ['Nude',               '#D4A574'],
    ['Beige',              '#F5F5DC'],
    ['Arena',              '#C2B280'],
    ['Marfil',             '#FFFFF0'],
    ['Porcelana',          '#F7E7CE'],
    // ── Blancos
    ['Blanco',             '#FFFFFF'],
    ['Blanco Perla',       '#F8F8F0'],
    // ── Dorados / Plateados
    ['Dorado',             '#FFD700'],
    ['Plateado',           '#C0C0C0'],
    ['Bronce',             '#CD7F32'],
    // ── Lilas y violetas
    ['Lavanda',            '#E6E6FA'],
    ['Lila',               '#C8A2C8'],
    ['Violeta',            '#8B00FF'],
    ['Morado',             '#6A0DAD'],
    // ── Azules y verdes
    ['Azul',               '#0055AA'],
    ['Turquesa',           '#40E0D0'],
    ['Verde',              '#228B22'],
    ['Verde Oliva',        '#808000'],
    // ── Grises
    ['Gris Claro',         '#D3D3D3'],
    ['Gris',               '#808080'],
    ['Gris Oscuro',        '#404040'],
    // ── Sin color (transparentes)
    ['Transparente',       '#E8E8E8'],
    ['Incoloro',           '#F5F5F5'],
  ];

  COLORES.forEach(([nombre, hex], idx) => {
    const r = wsC.addRow([nombre, hex]);
    r.height = 18;
    const nameCell = r.getCell(1);
    const hexCell  = r.getCell(2);
    nameCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: idx % 2 === 0 ? 'FFFFFFFF' : 'FFFFF3E0' } };
    nameCell.font = { size: 10, name: 'Calibri' };
    nameCell.alignment = { vertical: 'middle' };
    // Previsualización del color real
    hexCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + hex.replace('#', '') } };
    hexCell.font = { size: 9, color: { argb: 'FF555555' }, name: 'Calibri' };
    hexCell.value = hex;
    hexCell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // ════════════════════════════════════════════════════════════════════════════
  // HOJA 3: INSTRUCCIONES
  // ════════════════════════════════════════════════════════════════════════════
  const wsI = wb.addWorksheet('📋 Instrucciones', {
    properties: { tabColor: { argb: C.verde } },
  });

  wsI.columns = [{ width: 4 }, { width: 30 }, { width: 70 }];

  const instrucciones = [
    ['',  '',            ''],
    ['',  '📋 GUÍA DE USO — PLANTILLA MARYBE', ''],
    ['',  '',            ''],
    ['',  '¿Cómo funciona?', ''],
    ['',  '',  'Esta plantilla tiene 2 hojas: "Productos" y "Variantes".'],
    ['',  '',  'Cada PRODUCTO (hoja 1) puede tener una o varias VARIANTES (hoja 2).'],
    ['',  '',  'La relación se establece con el campo "ID Original" = "ID Producto Padre".'],
    ['',  '',  ''],
    ['',  'Jerarquía de Categorías (4 niveles)', ''],
    ['',  '',  'Los productos se clasifican en 4 niveles en la Hoja 1:'],
    ['',  '',  '  1. SECCIÓN      → Perfumería  |  Hogar  (dropdown, solo estas opciones)'],
    ['',  '',  '  2. CATEGORÍA    → Electro Belleza, Maquillaje, Baño, Cocina, Pisos y Muebles, etc.'],
    ['',  '',  '  3. SUBCATEGORÍA → Lavandina, Perfumes, Rizadores, Lava Vajillas, etc.'],
    ['',  '',  '  4. TIPO         → Eau de Parfum, Kit, Crema, Aerosol, Pastilla, etc. (opcional)'],
    ['',  '',  '     El Tipo se usa para agrupar productos en el megamenú del sitio web.'],
    ['',  '',  ''],
    ['',  'Cálculo automático del Precio Oferta (Hoja 2)', ''],
    ['',  '',  'En la columna G (% Descuento) ingresá el porcentaje de descuento.'],
    ['',  '',  'La columna H (Precio Oferta 🔒) se calcula AUTOMÁTICAMENTE con la fórmula:'],
    ['',  '',  '    Precio Oferta = Precio × (1 − %Descuento / 100)'],
    ['',  '',  '    Ejemplo: Precio $3100 con 20% → Precio Oferta $2480'],
    ['',  '',  'Si el descuento es 0 o está vacío, la columna H queda vacía (sin oferta).'],
    ['',  '',  '⚠ NO modificar manualmente la columna H.'],
    ['',  '',  ''],
    ['',  'Caso 1: Producto SIMPLE (sin variantes)', ''],
    ['',  '',  '→ Agregar 1 fila en Productos con un ID único. Ej: 1001'],
    ['',  '',  '→ Agregar 1 fila en Variantes con id_original=1001 y producto_padre_id=1001'],
    ['',  '',  '→ Completar stock, precio y los datos del único tamaño disponible.'],
    ['',  '',  ''],
    ['',  'Caso 2: Producto CON VARIANTES (ej: colores, talles, tamaños)', ''],
    ['',  '',  '→ Agregar 1 fila en Productos con ID único. Ej: 4751'],
    ['',  '',  '→ Agregar VARIAS filas en Variantes, todas con producto_padre_id=4751'],
    ['',  '',  '→ Cada variante tiene su propio EAN, stock, precio y volumen/talle/color.'],
    ['',  '',  '→ Podés poner distinto % de descuento en cada variante.'],
    ['',  '',  ''],
    ['',  'Campos obligatorios (*)', ''],
    ['',  '',  'Productos:  id_original, nombre, sección'],
    ['',  '',  'Variantes:  id_original, producto_padre_id, precio'],
    ['',  '',  ''],
    ['',  'Publicado (TRUE / FALSE)', ''],
    ['',  '',  'TRUE  → el producto es visible en la tienda web.'],
    ['',  '',  'FALSE → el producto está oculto (solo lo ve el administrador).'],
    ['',  '',  ''],
    ['',  '¿Cómo entregar la planilla?', ''],
    ['',  '',  'Guardar como .xlsx y enviar al equipo de Marybe para importar al sistema.'],
    ['',  '',  'No cambiar los nombres de las columnas (fila 3 de cada hoja).'],
    ['',  '',  ''],
  ];

  instrucciones.forEach((row, idx) => {
    const r = wsI.addRow(row);
    if (idx === 1) {
      const cell = r.getCell(2);
      cell.font = { bold: true, size: 15, color: { argb: C.grisOscuro }, name: 'Calibri' };
      r.height = 36;
      wsI.mergeCells(`B${idx + 1}:C${idx + 1}`);
    } else if (row[1] && row[1] !== '' && row[2] === '') {
      const cell = r.getCell(2);
      cell.font      = { bold: true, size: 11, color: { argb: '4F46E5' }, name: 'Calibri' };
      cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.grisMedio } };
      cell.alignment = { vertical: 'middle' };
      r.height = 24;
    } else if (row[2]) {
      const cell = r.getCell(3);
      cell.font      = { size: 10, color: { argb: C.texto }, name: 'Calibri' };
      cell.alignment = { vertical: 'middle', wrapText: true };
      r.height = 18;
    }
  });

  // ── Guardar ──────────────────────────────────────────────────────────────
  if (!fs.existsSync(path.dirname(OUTPUT))) {
    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  }

  await wb.xlsx.writeFile(OUTPUT);
  console.log(`✅ Plantilla generada en: ${OUTPUT}`);
  console.log(`   ↳ Hoja 1: 16 columnas — ID, SKU, Nombre, Marca, Sección, Categoría, Subcategoría, Tipo, Desc, Desc Completa, Especificaciones, Proveedor, Publicado, Destacado, Moneda, Características`);
  console.log(`   ↳ Hoja 2: 11 columnas — % Descuento y Precio Oferta calculado automáticamente`);
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
