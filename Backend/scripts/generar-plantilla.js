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
  //           E=seccion, F=categoria, G=subcategoria,
  //           H=descripcion_corta, I=proveedor, J=publicado, K=moneda

  // ── Fila 1: Título ──
  wsP.mergeCells('A1:L1');
  const titleP = wsP.getCell('A1');
  titleP.value = '📦 MARYBE — Plantilla de Productos (Hoja 1 de 2)';
  titleP.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.grisOscuro } };
  titleP.font  = { bold: true, color: { argb: C.blanco }, size: 14, name: 'Calibri' };
  titleP.alignment = { horizontal: 'center', vertical: 'middle' };
  wsP.getRow(1).height = 36;

  // ── Fila 2: Instrucción ──
  wsP.mergeCells('A2:L2');
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
    { key: 'descripcion_corta', header: 'Descripción Corta',  width: 45, group: 'extra', note: 'Texto breve para mostrar en la web' },
    { key: 'proveedor',         header: 'Proveedor',          width: 28, group: 'extra', note: 'Nombre del proveedor o distribuidor' },
    { key: 'publicado',         header: 'Publicado',          width: 12, group: 'extra', note: 'TRUE = visible en la tienda | FALSE = oculto' },
    { key: 'destacado',         header: 'Destacado',          width: 12, group: 'extra', note: 'TRUE = en sección destacados | FALSE = normal' },
    { key: 'moneda',            header: 'Moneda',             width: 10, group: 'extra', note: 'Código de moneda. Ej: ARS, USD' },
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
    // id_orig, sku,              nombre,                               marca,       seccion,       categoria,        subcategoria,    desc_corta,                                                     proveedor,                  publicado, destacado, moneda
    ['4751',  '4751',           'ISSUE COLORACION SACHET + oxidante', 'Issue',     'Perfumería',  'Coloración',     'Kits',          'Kit coloración completo con oxidante incluido.',                'LABORATORIO CUENCA SA',    'TRUE', 'FALSE', 'ARS'],
    ['1001',  '7790416066525',  'CUTEX QUITAESMALTE FORTALECEDOR',    'Cutex',     'Perfumería',  'Maquillaje',     'Quitaesmalte',  'Elimina el esmalte y fortalece la uña con vitamina E.',         'NEW REVLON ARG',           'TRUE', 'FALSE', 'ARS'],
    ['1003',  '7791001009811',  'BIFERDIL ACONDICIONADOR VITAMINADO', 'Biferdil',  'Perfumería',  'Electro Belleza','Acondicionador','Acondicionador sin enjuague con vitaminas A, C y E.',           'BIFERDIL SRL',             'TRUE', 'FALSE', 'ARS'],
    ['2001',  '7792000100012',  'LAVANDINA CONCENTRADA 2L',           'AyudasDin', 'Hogar',       'Baño',           'Lavandina',     'Lavandina concentrada apta para pisos y sanitarios.',           'DISTRIBUIDORA NORTE SA',   'TRUE', 'TRUE',  'ARS'],
    ['2010',  '7792000100029',  'DETERGENTE LIMÓN 500ML',             'Skip',      'Hogar',       'Cocina',         'Detergentes',   'Detergente líquido con aroma a limón. Gran poder limpiador.',   'UNILEVER ARG SA',          'TRUE', 'FALSE', 'ARS'],
    ['3001',  '7793000000010',  'PERFUME ACQUA DI GIO 100ML',         'Armani',    'Perfumería',  'Fragancias',     'Hombre',        'Elegante fragancia masculina con notas marinas y cítricas.',    'LOREAL ARGENTINA',         'TRUE', 'TRUE',  'ARS'],
    ['3002',  '7793000000020',  'BASE DE MAQUILLAJE FIT ME',          'Maybelline','Perfumería',  'Maquillaje',     'Rostro',        'Base de maquillaje líquida mate, ideal para piel normal a grasa.','LOREAL ARGENTINA',         'TRUE', 'FALSE', 'ARS'],
    ['3003',  '7793000000030',  'SHAMPOO ELVIVE REPARACIÓN TOTAL 5',  'Loreal',    'Perfumería',  'Cuidado Capilar','Shampoo',       'Repara el cabello dañado y fortalece las puntas.',              'LOREAL ARGENTINA',         'TRUE', 'TRUE',  'ARS'],
    ['3004',  '7793000000040',  'CREMA ANTIARRUGAS REVITALIFT',       'Loreal',    'Perfumería',  'Cuidado Facial', 'Cremas',        'Crema de día con ácido hialurónico y protector solar.',         'LOREAL ARGENTINA',         'TRUE', 'FALSE', 'ARS'],
    ['3005',  '7793000000050',  'DESODORANTE DOVE ORIGINAL',          'Dove',      'Perfumería',  'Cuidado Personal','Desodorantes', 'Protección 48h y cuarto de crema humectante.',                  'UNILEVER ARG SA',          'TRUE', 'FALSE', 'ARS'],
    ['3006',  '7793000000060',  'PASTA DENTAL COLGATE TOTAL 12',      'Colgate',   'Perfumería',  'Cuidado Bucal',  'Pastas',        'Protección antibacterial por 12 horas.',                        'COLGATE PALMOLIVE',        'TRUE', 'TRUE',  'ARS'],
    ['3007',  '7793000000070',  'JABÓN LÍQUIDO ARIEL 3L',             'Ariel',     'Hogar',       'Ropa',           'Jabones Líquidos','Jabón líquido para diluir, remueve manchas difíciles.',         'PROCTER & GAMBLE',         'TRUE', 'TRUE',  'ARS'],
    ['3008',  '7793000000080',  'SUAVIZANTE VIVERE CLASSIC 3L',       'Vivere',    'Hogar',       'Ropa',           'Suavizantes',   'Deja tu ropa suave y con perfume duradero.',                    'UNILEVER ARG SA',          'TRUE', 'FALSE', 'ARS'],
    ['3009',  '7793000000090',  'LIMPIADOR POETT PRIMAVERA 900ML',    'Poett',     'Hogar',       'Pisos y Muebles','Desinfectantes','Limpiador líquido antibacterial con exquisita fragancia.',      'CLOROX ARGENTINA',         'TRUE', 'FALSE', 'ARS'],
    ['3010',  '7793000000100',  'INSECTICIDA RAID MATA MOSQUITOS',    'Raid',      'Hogar',       'Insecticidas y Repelentes','Aerosoles','Mata mosquitos al instante con base acuosa.',            'SC JOHNSON',               'TRUE', 'TRUE',  'ARS'],
    ['3011',  '7793000000110',  'ESPONJA MORTIMER MULTIUSO X3',       'Mortimer',  'Hogar',       'Accesorios de Limpieza','Esponjas','Pack de 3 esponjas con fibra verde, ideales para cocina.',     'CLOROX ARGENTINA',         'TRUE', 'FALSE', 'ARS'],
    ['3012',  '7793000000120',  'PAPEL HIGIÉNICO CAMPANITA 30M X4',   'Campanita', 'Hogar',       'Papeles',        'Papel Higiénico','Papel higiénico hoja simple, suave y absorbente.',             'PAPELERA DEL PLATA',       'TRUE', 'FALSE', 'ARS'],
    ['3013',  '7793000000130',  'ROLLO DE COCINA SUSSEX CLASSIC X3',  'Sussex',    'Hogar',       'Papeles',        'Rollos de Cocina','Rollo de cocina súper absorbente x3 unidades.',               'PAPELERA DEL PLATA',       'TRUE', 'FALSE', 'ARS'],
    ['3014',  '7793000000140',  'AEROSOL LYSOL DESINFECTANTE CRISP',  'Lysol',     'Hogar',       'Desodorante de Ambiente','Desinfectantes','Mata el 99.9% de los virus y bacterias del hogar.',   'RECKITT BENCKISER',        'TRUE', 'TRUE',  'ARS'],
    ['3015',  '7793000000150',  'ESCOBA PLASTICA ALASKA C/CABO',      'Alaska',    'Hogar',       'Accesorios de Limpieza','Escobas', 'Escoba reforzada con cerdas plumadas para mejor barrido.',     'INDUSTRIAS ALASKA',        'TRUE', 'FALSE', 'ARS'],
    // Fila guía vacía
    ['',      '',               '',                                    '',          '',            '',               '',              '',                                                              '',                         '',         '',     ''],
    ['→ TU PRODUCTO', '→ EAN', '→ NOMBRE DEL PRODUCTO',             '→ MARCA',   'Perfumería',  '→ Categoría',    '→ Subcategoría','→ Descripción (opcional)',                                      '→ PROVEEDOR',              'TRUE',  'FALSE', 'ARS'],
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
        if (ci >= 4 && ci <= 6) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: idx % 2 === 0 ? C.azulClaro : 'FFBFDBFE' } };
          cell.font = { color: { argb: '1E3A5F' }, size: 10, name: 'Calibri' };
        }
        if (ci === 9 || ci === 10) { // publicado, destacado
          cell.font = { bold: true, color: { argb: val === 'TRUE' ? '16A34A' : C.rojo }, size: 10 };
        }
      }
    });
  });

  // Validación dropdown para Sección (E) — solo Perfumería o Hogar
  for (let i = 4; i <= 1000; i++) {
    wsP.getCell(`E${i}`).dataValidation = {
      type: 'list', allowBlank: true,
      formulae: ['"Perfumería,Hogar"'],
      showErrorMessage: true,
      errorTitle: 'Sección inválida',
      error: 'Solo se permite: Perfumería o Hogar',
    };
    wsP.getCell(`J${i}`).dataValidation = {
      type: 'list', allowBlank: true,
      formulae: ['"TRUE,FALSE"'],
      showErrorMessage: true,
      errorTitle: 'Valor inválido',
      error: 'Solo se permite TRUE o FALSE',
    };
    wsP.getCell(`K${i}`).dataValidation = {
      type: 'list', allowBlank: true,
      formulae: ['"TRUE,FALSE"'],
      showErrorMessage: true,
      errorTitle: 'Valor inválido',
      error: 'Solo se permite TRUE o FALSE',
    };
    wsP.getCell(`L${i}`).dataValidation = {
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
  //           E=stock, F=precio, G=pct_descuento, H=precio_oferta (fórmula), I=publicado, J=envio, K=moneda

  // ── Fila 1: Título ──
  wsV.mergeCells('A1:K1');
  const titleV = wsV.getCell('A1');
  titleV.value = '🔗 MARYBE — Plantilla de Variantes (Hoja 2 de 2)';
  titleV.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7C3AED' } };
  titleV.font  = { bold: true, color: { argb: C.blanco }, size: 14, name: 'Calibri' };
  titleV.alignment = { horizontal: 'center', vertical: 'middle' };
  wsV.getRow(1).height = 36;

  // ── Fila 2: Instrucción ──
  wsV.mergeCells('A2:K2');
  const instrV = wsV.getCell('A2');
  instrV.value = '⚠ Una fila por variante. "producto_padre_id" debe coincidir con un "id_original" de la hoja Productos. Columna H (Precio Oferta) se calcula automáticamente — NO modificar.';
  applyStyle(instrV, noteStyle());
  wsV.getRow(2).height = 28;

  // ── Fila 3: Headers ──
  const headersV = [
    { key: 'id_original',       header: 'ID Variante *',       width: 16, req: true,  note: 'ID único de esta variante. Ej: 13887 (hijo) o 1001 (único)' },
    { key: 'producto_padre_id', header: 'ID Producto Padre *', width: 18, req: true,  note: 'Debe coincidir con "id_original" de la hoja Productos' },
    { key: 'sku_ean',           header: 'SKU / EAN',           width: 18, req: false, note: 'Código de barras único de esta variante' },
    { key: 'volumen',           header: 'Volumen / Tamaño',    width: 16, req: false, note: 'Ej: 50ml, 100ml, 200g, Tono Rubio, Talle M' },
    { key: 'stock',             header: 'Stock',               width: 10, req: false, note: 'Cantidad disponible. Número entero. 0 = sin stock' },
    { key: 'precio',            header: 'Precio *',            width: 14, req: true,  note: 'Precio de venta normal (sin puntos de miles). Ej: 3100' },
    { key: 'pct_descuento',     header: '% Descuento',         width: 14, req: false, note: 'Ingresá el porcentaje de descuento (0-100). Ej: 25 para 25%. Dejar vacío o 0 si no hay oferta.' },
    { key: 'precio_oferta',     header: 'Precio Oferta 🔒',    width: 16, req: false, note: '⚡ CALCULADO AUTOMÁTICAMENTE. No modificar. Resultado de Precio × (1 - %Descuento/100)' },
    { key: 'publicado',         header: 'Publicado',           width: 12, req: false, note: 'TRUE = visible | FALSE = oculto' },
    { key: 'envio',             header: 'Envío',               width: 10, req: false, note: '1 = tiene envío | 0 = sin envío | dejar vacío' },
    { key: 'moneda',            header: 'Moneda',              width: 10, req: false, note: 'Código de moneda. Ej: ARS, USD' },
  ];

  wsV.columns = headersV.map(h => ({ key: h.key, width: h.width }));

  const rowHeaderV = wsV.getRow(3);
  headersV.forEach((h, i) => {
    const cell = rowHeaderV.getCell(i + 1);
    cell.value = h.header;
    // Columna H (índice 7) = precio_oferta calculado → header especial verde
    const color = i === 7 ? C.verde : (h.req ? C.coral : C.grisOscuro);
    applyStyle(cell, headerStyle(color));
    if (h.note) cell.note = { texts: [{ text: h.note }] };
  });
  rowHeaderV.height = 30;

  // ── Datos de ejemplo ──
  // Producto simple: 1001 y 2001
  // Producto con variantes: 4751 (ISSUE COLORACION)
  // Los datos son arrays: [id_orig, padre_id, sku_ean, volumen, stock, precio, pct_descuento]
  // precio_oferta se coloca como fórmula en la col H
  const datosVariantesBase = [
    // sep
    ['═══', '══════', '── Ejemplo: Producto SIMPLE (sin variantes) ──', '', '', '', '', '', '', '', ''],
    ['1001', '1001', '7790416066525', '50ml',           '8',  '2300', '0'],
    ['2001', '2001', '7792000100012', '2L',             '15', '1200', '15'],   // 15% de descuento
    // sep
    ['═══', '══════', '── Ejemplo: Producto CON VARIANTES (mismo producto_padre_id) ──', '', '', '', '', '', '', '', ''],
    ['4751',  '4751', '4751',         'Kit base',        '0',  '3100', '20'],  // 20% de descuento
    ['13887', '4751', '7793008001614','Castaño Oscuro 3.0','6', '3100', '20'],
    ['13889', '4751', '7793008005063','Castaño Natural 4.0','6','3100', '20'],
    ['13891', '4751', '7793008001621','Castaño Claro 5.0', '6','3100', '20'],
    ['13893', '4751', '7793008001638','Rubio Oscuro 6.0',  '3','3100', '0'],   // sin descuento
    ['13899', '4751', '7793008001645','Rubio Natural 7.0', '3','3100', '0'],
    // guía vacía
    ['',      '',     '',             '',                '',   '',     ''],
    ['→ ID', '→ ID PADRE', '→ EAN', '→ 50ml / Tono Rubio / etc.', '→ 10', '→ 3500', '→ 25 (o 0)'],
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
      const [id_original, producto_padre_id, sku_ean, volumen, stock, precio, pct_descuento] = row;
      const isHijo = id_original !== producto_padre_id;
      const bgBase = isHijo ? 'FFFFF7ED' : C.blanco;

      // Cols A-G: datos
      const valores = [id_original, producto_padre_id, sku_ean, volumen, stock, precio, pct_descuento, null, 'TRUE', '1', 'ARS'];
      valores.forEach((val, ci) => {
        const cell = r.getCell(ci + 1);
        if (ci === 7) {
          // Col H: precio_oferta — FÓRMULA
          const pct = parseFloat(pct_descuento);
          if (pct && pct > 0) {
            cell.value = { formula: `IF(G${excelRowNum}>0,ROUND(F${excelRowNum}*(1-G${excelRowNum}/100),2),"")` };
          } else {
            cell.value = { formula: `IF(G${excelRowNum}>0,ROUND(F${excelRowNum}*(1-G${excelRowNum}/100),2),"")` };
          }
          applyStyle(cell, readonlyStyle());
        } else if (ci === 8) { // publicado
          cell.value = val;
          cell.font = { bold: true, color: { argb: '16A34A' }, size: 10 };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgBase } };
        } else {
          cell.value = val;
          applyStyle(cell, dataStyle(bgBase));
          // Resaltar % descuento
          if (ci === 6 && val && parseFloat(val) > 0) {
            cell.font = { bold: true, color: { argb: 'FF7C3AED' }, size: 10 };
          }
          // Precio en negrita
          if (ci === 5) {
            cell.font = { bold: true, color: { argb: C.grisOscuro }, size: 10, name: 'Calibri' };
          }
        }
      });
    }
  });

  // Aplicar fórmula de precio_oferta en todas las filas vacías también (para que el cliente solo llene G)
  const dataStartRow = 4;
  const dataEndRow   = 1000;
  for (let i = dataStartRow; i <= dataEndRow; i++) {
    // Solo si la fila no es de las de ejemplo (que ya tienen fórmula)
    const cell = wsV.getCell(`H${i}`);
    if (!cell.value) {
      cell.value = { formula: `IF(G${i}>0,ROUND(F${i}*(1-G${i}/100),2),"")` };
      applyStyle(cell, readonlyStyle());
    }

    // Validaciones dropdown
    wsV.getCell(`I${i}`).dataValidation = {
      type: 'list', allowBlank: true,
      formulae: ['"TRUE,FALSE"'],
      showErrorMessage: true,
      errorTitle: 'Valor inválido',
      error: 'Solo TRUE o FALSE',
    };
    wsV.getCell(`K${i}`).dataValidation = {
      type: 'list', allowBlank: true,
      formulae: ['"ARS,USD,EUR"'],
    };
    wsV.getCell(`J${i}`).dataValidation = {
      type: 'list', allowBlank: true,
      formulae: ['"1,0"'],
    };
    // Validación % descuento entre 0 y 100
    wsV.getCell(`G${i}`).dataValidation = {
      type: 'whole', allowBlank: true,
      operator: 'between',
      formulae: [0, 100],
      showErrorMessage: true,
      errorTitle: 'Porcentaje inválido',
      error: 'El descuento debe ser un número entre 0 y 100',
    };
  }

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
    ['',  'Jerarquía de Categorías (3 niveles)', ''],
    ['',  '',  'Los productos se clasifican en 3 niveles en la Hoja 1:'],
    ['',  '',  '  1. SECCIÓN   → Perfumería  |  Hogar  (dropdown, solo estas opciones)'],
    ['',  '',  '  2. CATEGORÍA → Electro Belleza, Maquillaje, Baño, Cocina, Pisos y Muebles, etc.'],
    ['',  '',  '  3. SUBCATEGORÍA → Lavandina, Perfumes, Rizadores, Lava Vajillas, etc.'],
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
  console.log(`   ↳ Hoja 1: 12 columnas — ID, SKU, Nombre, Marca, Sección, Categoría, Subcategoría, Desc, Proveedor, Publicado, Destacado, Moneda`);
  console.log(`   ↳ Hoja 2: 11 columnas — % Descuento y Precio Oferta calculado automáticamente`);
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
