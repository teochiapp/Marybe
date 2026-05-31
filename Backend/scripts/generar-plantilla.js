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
  violeta:     'FF7C6AF7',
  violetaClaro:'FF EDE9FE'.replace(/\s/g,''), // #EDE9FE
  coral:       'FFF77C6A',
  coralClaro:  'FFFCE7E4',
  verde:       'FF22C55E',
  verdeClaro:  'FFD1FAE5',
  amarillo:    'FFFBBF24',
  amarilloClaro:'FFFEF3C7',
  grisOscuro:  'FF1E1B4B',
  grisClaro:   'FFF8F7FF',
  grisMedio:   'FFE0DEFF',
  blanco:      'FFFFFFFF',
  rojo:        'FFEF4444',
  rojoClaro:   'FFFEE2E2',
  texto:       'FF1E1B4B',
  textomuted:  'FF6B7280',
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

  // ── Fila 1: Título ──
  wsP.mergeCells('A1:I1');
  const titleP = wsP.getCell('A1');
  titleP.value = '📦 MARYBE — Plantilla de Productos (Hoja 1 de 2)';
  titleP.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.grisOscuro } };
  titleP.font  = { bold: true, color: { argb: C.blanco }, size: 14, name: 'Calibri' };
  titleP.alignment = { horizontal: 'center', vertical: 'middle' };
  wsP.getRow(1).height = 36;

  // ── Fila 2: Instrucción ──
  wsP.mergeCells('A2:I2');
  const instrP = wsP.getCell('A2');
  instrP.value = '⚠ Completar un producto por fila. El campo "id_original" debe coincidir con "producto_padre_id" en la hoja Variantes. No modificar los nombres de columnas.';
  applyStyle(instrP, noteStyle());
  wsP.getRow(2).height = 28;

  // ── Fila 3: Headers ──
  const headersP = [
    { key: 'id_original',       header: 'ID Original *',      width: 14, color: C.violeta,      note: 'ID único del producto. Ej: 4751' },
    { key: 'sku',               header: 'SKU / EAN',          width: 18, color: C.violeta,      note: 'Código de barras o código interno principal' },
    { key: 'nombre',            header: 'Nombre *',           width: 40, color: C.violeta,      note: 'Nombre completo del producto' },
    { key: 'marca',             header: 'Marca',              width: 16, color: C.grisMedio.replace('FF',''), note: 'Marca comercial. Ej: L\'Oreal' },
    { key: 'categoria',         header: 'Categoría',          width: 20, color: C.grisMedio.replace('FF',''), note: 'Categoría del producto. Ej: Shampoo, Coloracion' },
    { key: 'descripcion_corta', header: 'Descripción Corta',  width: 45, color: C.grisMedio.replace('FF',''), note: 'Texto breve para mostrar en la web' },
    { key: 'proveedor',         header: 'Proveedor',          width: 28, color: C.grisMedio.replace('FF',''), note: 'Nombre del proveedor o distribuidor' },
    { key: 'publicado',         header: 'Publicado',          width: 12, color: C.grisMedio.replace('FF',''), note: 'TRUE = visible en la tienda | FALSE = oculto' },
    { key: 'moneda',            header: 'Moneda',             width: 10, color: C.grisMedio.replace('FF',''), note: 'Código de moneda. Ej: ARS, USD' },
  ];

  wsP.columns = headersP.map(h => ({ key: h.key, width: h.width }));

  const rowHeaderP = wsP.getRow(3);
  headersP.forEach((h, i) => {
    const cell = rowHeaderP.getCell(i + 1);
    cell.value = h.header;
    applyStyle(cell, headerStyle(i < 3 ? C.violeta : C.grisOscuro));
    if (h.note) cell.note = { texts: [{ text: h.note }] };
  });
  rowHeaderP.height = 30;

  // ── Datos de ejemplo ──
  const datosProductos = [
    ['4751',  '4751',           'ISSUE COLORACION SACHET + oxidante', 'Issue',    'Coloracion',      'Kit coloración completo con oxidante incluido. Ver variantes por color.',  'LABORATORIO CUENCA SA',    'TRUE',  'ARS'],
    ['1001',  '7790416066525',  'CUTEX QUITAESMALTE FORTALECEDOR',    'Cutex',    'Quitaesmalte',    'Elimina el esmalte y fortalece la uña con vitamina E.',                   'NEW REVLON ARG',           'TRUE',  'ARS'],
    ['1003',  '7791001009811',  'BIFERDIL ACONDICIONADOR VITAMINADO', 'Biferdil', 'Acondicionador',  'Acondicionador sin enjuague con vitaminas A, C y E para cabello opaco.',  'BIFERDIL SRL',             'TRUE',  'ARS'],
    ['1007',  '7791289051011',  'ELVIVE SHAMPOO NUTRICION EXTREMA',   "L'Oreal",  'Shampoo',         'Shampoo nutritivo intenso para cabello muy seco y dañado.',               'LOREAL ARGENTINA SA',      'TRUE',  'ARS'],
    ['1011',  '7791290432117',  'SCHWARZKOPF IGORA ROYAL',            'Schwarzkopf','Coloracion',    'Coloración profesional de larga duración. Disponible en múltiples tonos.', 'HENKEL ARGENTINA SA',      'TRUE',  'ARS'],
    // Fila guía vacía para que el cliente entienda
    ['',      '',               '',                                    '',         '',               '',                                                                        '',                         '',      ''],
    ['→ TU PRODUCTO', 'CÓDIGO EAN', 'NOMBRE DEL PRODUCTO',           'MARCA',    'CATEGORÍA',      'DESCRIPCIÓN BREVE (opcional)',                                             'PROVEEDOR',                'TRUE',  'ARS'],
  ];

  datosProductos.forEach((row, idx) => {
    const r = wsP.addRow(row);
    r.height = 20;
    const isGuide = idx === datosProductos.length - 1;
    const isBlank = row[0] === '';
    row.forEach((_, ci) => {
      const cell = r.getCell(ci + 1);
      if (isGuide) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.verdeClaro } };
        cell.font = { color: { argb: 'FF065F46' }, italic: true, size: 9, name: 'Calibri' };
        cell.alignment = { vertical: 'middle' };
      } else if (isBlank) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
      } else {
        applyStyle(cell, dataStyle(idx % 2 === 0 ? C.blanco : C.grisClaro));
        // Resaltar columnas obligatorias
        if (ci === 0 || ci === 2) {
          cell.font = { bold: false, color: { argb: C.grisOscuro }, size: 10, name: 'Calibri' };
        }
        // Columna publicado → formato especial
        if (ci === 7) {
          cell.font = { bold: true, color: { argb: cell.value === 'TRUE' ? '22C55E' : C.rojo }, size: 10 };
        }
      }
    });
  });

  // Validación dropdown para columna Publicado (H)
  for (let i = 4; i <= 1000; i++) {
    wsP.getCell(`H${i}`).dataValidation = {
      type: 'list', allowBlank: true,
      formulae: ['"TRUE,FALSE"'],
      showErrorMessage: true,
      errorTitle: 'Valor inválido',
      error: 'Solo se permite TRUE o FALSE',
    };
    wsP.getCell(`I${i}`).dataValidation = {
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

  // ── Fila 1: Título ──
  wsV.mergeCells('A1:J1');
  const titleV = wsV.getCell('A1');
  titleV.value = '🔗 MARYBE — Plantilla de Variantes (Hoja 2 de 2)';
  titleV.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7C3AED' } };
  titleV.font  = { bold: true, color: { argb: C.blanco }, size: 14, name: 'Calibri' };
  titleV.alignment = { horizontal: 'center', vertical: 'middle' };
  wsV.getRow(1).height = 36;

  // ── Fila 2: Instrucción ──
  wsV.mergeCells('A2:J2');
  const instrV = wsV.getCell('A2');
  instrV.value = '⚠ Una fila por variante. "producto_padre_id" debe coincidir con un "id_original" de la hoja Productos. Productos simples: poner el mismo ID en ambas columnas.';
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
    { key: 'precio_oferta',     header: 'Precio Oferta',       width: 14, req: false, note: 'Precio con descuento. Dejar vacío si no hay oferta' },
    { key: 'publicado',         header: 'Publicado',           width: 12, req: false, note: 'TRUE = visible | FALSE = oculto' },
    { key: 'envio',             header: 'Envío',               width: 10, req: false, note: '1 = tiene envío | 0 = sin envío | dejar vacío' },
    { key: 'moneda',            header: 'Moneda',              width: 10, req: false, note: 'Código de moneda. Ej: ARS, USD' },
  ];

  wsV.columns = headersV.map(h => ({ key: h.key, width: h.width }));

  const rowHeaderV = wsV.getRow(3);
  headersV.forEach((h, i) => {
    const cell = rowHeaderV.getCell(i + 1);
    cell.value = h.header;
    applyStyle(cell, headerStyle(h.req ? C.coral : C.grisOscuro));
    if (h.note) cell.note = { texts: [{ text: h.note }] };
  });
  rowHeaderV.height = 30;

  // ── Datos de ejemplo ──
  // Producto simple: 1001 (se auto-referencia)
  // Producto con variantes: 4751 (ISSUE COLORACION)
  const datosVariantes = [
    // ── Separador visual: producto simple ──
    ['═══', '══════', '── Ejemplo: Producto SIMPLE (sin variantes) ──', '', '', '', '', '', '', ''],
    ['1001', '1001', '7790416066525', '50ml',           '8',  '2300', '',     'TRUE',  '1', 'ARS'],
    // ── Separador: producto con múltiples variantes ──
    ['═══', '══════', '── Ejemplo: Producto CON VARIANTES (mismo producto_padre_id) ──', '', '', '', '', '', '', ''],
    ['4751',  '4751', '4751',         'Kit base',        '0',  '3100', '2480', 'TRUE',  '1', 'ARS'],
    ['13887', '4751', '7793008001614','Castaño Oscuro 3.0','6', '3100', '2480', 'TRUE',  '1', 'ARS'],
    ['13889', '4751', '7793008005063','Castaño Natural 4.0','6','3100', '2480', 'TRUE',  '1', 'ARS'],
    ['13891', '4751', '7793008001621','Castaño Claro 5.0', '6','3100', '2480', 'TRUE',  '1', 'ARS'],
    ['13893', '4751', '7793008001638','Rubio Oscuro 6.0',  '3','3100', '2480', 'TRUE',  '1', 'ARS'],
    ['13899', '4751', '7793008001645','Rubio Natural 7.0', '3','3100', '2480', 'TRUE',  '1', 'ARS'],
    // Fila guía
    ['',      '',     '',             '',                '',   '',     '',     '',      '',   ''],
    ['→ ID', '→ ID PADRE', '→ EAN', '→ 50ml / Tono Rubio / etc.', '→ 10', '→ 3500', '→ 2800 (opcional)', 'TRUE', '1', 'ARS'],
  ];

  datosVariantes.forEach((row, idx) => {
    const r = wsV.addRow(row);
    r.height = 20;

    const isSeparator = row[0] === '═══';
    const isGuide     = idx === datosVariantes.length - 1;
    const isBlank     = row[0] === '';

    row.forEach((val, ci) => {
      const cell = r.getCell(ci + 1);
      if (isSeparator) {
        if (ci === 2) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0DEFF' } };
          cell.font = { bold: true, color: { argb: '4338CA' }, italic: false, size: 9, name: 'Calibri' };
          cell.alignment = { vertical: 'middle' };
        } else {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0DEFF' } };
        }
      } else if (isGuide) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.verdeClaro } };
        cell.font = { color: { argb: '065F46' }, italic: true, size: 9, name: 'Calibri' };
        cell.alignment = { vertical: 'middle' };
      } else if (isBlank) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
      } else {
        // ¿Es variante hija (id diferente al padre)?
        const isHijo = row[0] !== row[1] && row[0] !== '4751';
        applyStyle(cell, dataStyle(
          isHijo ? 'FFFFF7ED' : C.blanco  // fondo naranja claro para hijos
        ));
        // Resaltar columna precio_oferta en verde si tiene valor
        if (ci === 6 && val) {
          cell.font = { bold: true, color: { argb: '16A34A' }, size: 10 };
        }
        if (ci === 7) {
          cell.font = { bold: true, color: { argb: val === 'TRUE' ? '16A34A' : 'EF4444' }, size: 10 };
        }
      }
    });
  });

  // Validaciones dropdown
  for (let i = 4; i <= 1000; i++) {
    wsV.getCell(`H${i}`).dataValidation = {
      type: 'list', allowBlank: true,
      formulae: ['"TRUE,FALSE"'],
      showErrorMessage: true,
      errorTitle: 'Valor inválido',
      error: 'Solo TRUE o FALSE',
    };
    wsV.getCell(`J${i}`).dataValidation = {
      type: 'list', allowBlank: true,
      formulae: ['"ARS,USD,EUR"'],
    };
    wsV.getCell(`I${i}`).dataValidation = {
      type: 'list', allowBlank: true,
      formulae: ['"1,0"'],
    };
  }

  // ════════════════════════════════════════════════════════════════════════════
  // HOJA 3: INSTRUCCIONES
  // ════════════════════════════════════════════════════════════════════════════
  const wsI = wb.addWorksheet('📋 Instrucciones', {
    properties: { tabColor: { argb: C.verde } },
  });

  wsI.columns = [{ width: 4 }, { width: 28 }, { width: 70 }];

  const instrucciones = [
    ['',  '',            ''],
    ['',  '📋 GUÍA DE USO — PLANTILLA MARYBE', ''],
    ['',  '',            ''],
    ['',  '¿Cómo funciona?', ''],
    ['',  '',  'Esta plantilla tiene 2 hojas: "Productos" y "Variantes".'],
    ['',  '',  'Cada PRODUCTO (hoja 1) puede tener una o varias VARIANTES (hoja 2).'],
    ['',  '',  'La relación se establece con el campo "ID Original" = "ID Producto Padre".'],
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
    ['',  '',  ''],
    ['',  'Campos obligatorios (*)', ''],
    ['',  '',  'Productos:  id_original, nombre'],
    ['',  '',  'Variantes:  id_original, producto_padre_id, precio'],
    ['',  '',  ''],
    ['',  'Campos de Precio', ''],
    ['',  '',  '"Precio" → precio de venta normal. Sin puntos de miles. Ej: 3100 (no 3.100)'],
    ['',  '',  '"Precio Oferta" → precio con descuento. Dejar vacío si no hay oferta.'],
    ['',  '',  ''],
    ['',  'Publicado (TRUE / FALSE)', ''],
    ['',  '',  'TRUE  → el producto es visible en la tienda web.'],
    ['',  '',  'FALSE → el producto está oculto (solo lo ve el administrador).'],
    ['',  '',  ''],
    ['',  'Stock', ''],
    ['',  '',  'Número entero. 0 = sin stock (se mostrará como "Sin stock" en la web).'],
    ['',  '',  ''],
    ['',  'IDs', ''],
    ['',  '',  'Pueden ser números (4751) o texto alfanumérico (PROD-001).'],
    ['',  '',  'Deben ser ÚNICOS en toda la planilla. No repetir IDs entre productos.'],
    ['',  '',  ''],
    ['',  'Volumen / Tamaño (solo en Variantes)', ''],
    ['',  '',  'Campo libre de texto. Ejemplos válidos:'],
    ['',  '',  '  50ml   |   200g   |   Talla M   |   Castaño Oscuro 3.0   |   Kit 20 vol.'],
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
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
