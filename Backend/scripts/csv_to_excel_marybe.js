/**
 * csv_to_excel_marybe.js
 * Convierte el CSV de Revlon/Kenzo a la Plantilla Marybe con el mismo
 * estilo visual que generar-plantilla.js (ExcelJS, mismas columnas y colores).
 *
 * Uso:   node Backend/scripts/csv_to_excel_marybe.js
 * Salida: Backend/data/Productos_RevlonKenzo_Marybe.xlsx
 */

const ExcelJS = require('exceljs');
const path    = require('path');
const fs      = require('fs');

const CSV_PATH      = path.join(__dirname, '../data/pagina revlon kenzo - Hoja2.csv');
const TEMPLATE_PATH = path.join(__dirname, '../data/Plantilla_Marybe.xlsx');
const OUTPUT_PATH   = path.join(__dirname, '../data/Productos_RevlonKenzo_Marybe.xlsx');

// ─── Paleta de colores (igual que generar-plantilla.js) ──────────────────────
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

// ─── Funciones de estilo (igual que generar-plantilla.js) ────────────────────
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

// ─── Helpers CSV ─────────────────────────────────────────────────────────────

/** Parsea un precio argentino "196.000,00" → 196000 */
function parsePrecio(str) {
  if (!str || str.trim() === '') return null;
  const clean = str.replace(/"/g, '').trim().replace(/\./g, '').replace(',', '.');
  const val = parseFloat(clean);
  return isNaN(val) ? null : val;
}

/**
 * Extrae el tamaño del nombre del producto.
 * "KENZO AQUA FEMME EDT X 30 ml" → { base: "KENZO AQUA FEMME EDT", size: "30 ml" }
 * "KENZO D ETE X 75"             → { base: "KENZO D ETE", size: "75" }
 */
function extractSize(nombre) {
  if (!nombre) return { base: nombre, size: null };
  const nameUpper = nombre.toUpperCase();

  // 1. Caso explícito: CUTEX ESMALTE DUO PACK
  if (nameUpper.startsWith('CUTEX ESMALTE DUO PACK ')) {
    return { base: nombre.substring(0, 22).trim(), size: nombre.substring(22).trim() };
  }
  // 2. Caso explícito: CUTEX ESMALTE
  if (nameUpper.startsWith('CUTEX ESMALTE ')) {
    return { base: nombre.substring(0, 13).trim(), size: nombre.substring(13).trim() };
  }

  // 3. Tonos de REVLON (números de 1 a 4 dígitos al final)
  if (nameUpper.startsWith('REVLON ')) {
    const matchShade = nombre.match(/^(.*?)\s+(\d{1,4})$/);
    if (matchShade) return { base: matchShade[1].trim(), size: matchShade[2].trim() };
  }

  // 4. Patrón: " X <número> <unidad>" al final
  const matchX = nombre.match(/^(.*?)\s+X\s+(\d+(?:[.,]\d+)?(?:\s*(?:ml|g|gr|oz|L|l|kg|Ml|ML))?)\s*$/i);
  if (matchX) return { base: matchX[1].trim(), size: matchX[2].trim() };

  // 5. Patrón: " <número> ml" al final sin X
  const matchNum = nombre.match(/^(.*?)\s+(\d+(?:[.,]\d+)?\s*(?:ml|g|gr|oz|L|l|kg))\s*$/i);
  if (matchNum) return { base: matchNum[1].trim(), size: matchNum[2].trim() };

  return { base: nombre.trim(), size: null };
}

/** Calcula el % de descuento entero */
function calcDescuento(publico, oferta) {
  if (!publico || !oferta || publico === 0) return 0;
  const pct = Math.round(((publico - oferta) / publico) * 100);
  return pct > 0 ? pct : 0;
}

/** Extrae la marca del proveedor */
function extractMarca(proveedor, descripcion) {
  if (!proveedor) return '';
  if (proveedor.includes('KENZO')) return 'Kenzo';
  if (proveedor.includes('REVLON')) {
    if (descripcion && descripcion.toUpperCase().startsWith('CUTEX')) return 'Cutex';
    return 'Revlon';
  }
  const first = proveedor.split(' ')[0];
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}

/** Capitaliza la primera letra de una palabra (fallback) */
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/** Mapea el rubro del CSV a una de las categorías válidas de la plantilla */
function mapCategoria(rubro) {
  if (!rubro) return '';
  const r = rubro.trim().toUpperCase();
  
  if (r === 'FRAG' || r === 'FRAGANCIAS' || r.includes('FRAGANCIA')) return 'Fragancias';
  if (r === 'MAQUILLAJE' || r === 'MAQUIL' || r.includes('MAQUILLAJE')) return 'Maquillaje';
  if (r === 'DERMO' || r === 'DERMOCOSMETICA' || r.includes('DERMOCOSMETICA')) return 'Dermocosmetica';
  if (r === 'CUIDADO PERSONAL' || r === 'CUIDADO P') return 'Cuidado Personal';
  if (r === 'OFERTAS' || r === 'OFERTA') return 'Ofertas';
  if (r.includes('BEBE') || r.includes('BEBÉ') || r.includes('NIÑO')) return 'Niños y Bebés';
  if (r.includes('LIMPIEZA') || r.includes('HOGAR')) return 'Limpieza del hogar';
  if (r.includes('ELECTRO')) return 'Electro belleza';
  if (r.includes('LANZAMIENTO')) return 'Lanzamientos';

  // Si no coincide, capitalizamos la primera letra (ej. "Perfumeria" -> "Perfumeria")
  return capitalize(rubro);
}

/** Parsea un CSV completo respetando comillas y saltos de línea internos */
function parseCSVFull(text) {
  const rows = [];
  let currentField = '';
  let currentFields = [];
  let inQuote = false;
  
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuote && text[i+1] === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else {
        inQuote = !inQuote;
      }
    } else if (ch === ',' && !inQuote) {
      currentFields.push(currentField.trim());
      currentField = '';
    } else if ((ch === '\n' || ch === '\r') && !inQuote) {
      if (ch === '\r' && text[i+1] === '\n') {
        i++;
      }
      currentFields.push(currentField.trim());
      rows.push(currentFields);
      currentFields = [];
      currentField = '';
    } else {
      currentField += ch;
    }
  }
  if (currentField || currentFields.length > 0) {
    currentFields.push(currentField.trim());
    rows.push(currentFields);
  }
  return rows;
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {

// ─── Leer y parsear CSV ──────────────────────────────────────────────────────
console.log('📂 Leyendo CSV...');
const csvRaw = fs.readFileSync(CSV_PATH, 'utf8');
const rows   = parseCSVFull(csvRaw);

// Encontrar la fila de encabezado (empieza con "Codigo")
let headerRowIdx = -1;
for (let i = 0; i < rows.length; i++) {
  if (rows[i][0] === 'Codigo') { headerRowIdx = i; break; }
}
if (headerRowIdx === -1) { console.error('❌ No se encontró encabezado CSV'); process.exit(1); }

const headers = rows[headerRowIdx];
const COL = {};
headers.forEach((h, i) => { COL[h.trim()] = i; });

const dataRows = [];
for (let i = headerRowIdx + 1; i < rows.length; i++) {
  const fields = rows[i];
  if (fields.length < 2) continue; // Saltar filas vacías
  
  const descripcion = (fields[COL['Descripcion']] || '').replace(/"/g, '').trim();
  if (!descripcion || descripcion.startsWith('Absorbe') || descripcion.startsWith('Difumina')) continue;

  dataRows.push({
    codigo:       (fields[COL['Codigo']]    || '').replace(/"/g, '').trim(),
    descripcion,
    descCompleta: (fields[COL['Costo2']]    || '').trim(), // Costo2 contiene la desc. larga
    publico:      parsePrecio(fields[COL['Publico']] || ''),
    oferta:       parsePrecio(fields[COL['Oferta']]  || ''),
    proveedor:    (fields[COL['Proveedor']] || '').replace(/"/g, '').trim(),
    rubro:        (fields[COL['Rubro']]     || '').replace(/"/g, '').trim(),
  });
}
console.log(`✅ ${dataRows.length} filas leídas del CSV`);

// ─── Agrupar por nombre base (detectar variantes) ────────────────────────────
const productGroups = new Map();
for (const row of dataRows) {
  const { base, size } = extractSize(row.descripcion);
  if (!productGroups.has(base)) {
    productGroups.set(base, { 
      descripcion: base, 
      proveedor: row.proveedor, 
      rubro: row.rubro, 
      descCompleta: row.descCompleta,
      variantes: [] 
    });
  } else if (!productGroups.get(base).descCompleta && row.descCompleta) {
    productGroups.get(base).descCompleta = row.descCompleta;
  }
  productGroups.get(base).variantes.push({
    codigo: row.codigo, descripcion: row.descripcion, size, publico: row.publico, oferta: row.oferta,
  });
}
console.log(`📦 ${productGroups.size} productos únicos agrupados`);

// ─── Leer plantilla con ExcelJS para continuar desde los IDs existentes ──────
console.log('\n📊 Leyendo plantilla para detectar IDs existentes...');
const wbTpl = new ExcelJS.Workbook();
await wbTpl.xlsx.readFile(TEMPLATE_PATH);

const wsPTpl = wbTpl.getWorksheet('📦 Productos');
const wsVTpl = wbTpl.getWorksheet('🔗 Variantes');

// Encontrar max IDs existentes
let maxProductId  = 0;
let maxVarianteId = 0;

if (wsPTpl) {
  wsPTpl.eachRow((row, rowNum) => {
    if (rowNum < 4) return;
    const val = row.getCell(1).value;
    const num = parseInt(val);
    if (!isNaN(num)) maxProductId = Math.max(maxProductId, num);
  });
} else {
  console.warn('⚠ No se encontró la hoja "📦 Productos" en la plantilla. Se empezará desde ID 1.');
}

if (wsVTpl) {
  wsVTpl.eachRow((row, rowNum) => {
    if (rowNum < 4) return;
    const val = row.getCell(1).value;
    const num = parseInt(val);
    if (!isNaN(num)) maxVarianteId = Math.max(maxVarianteId, num);
  });
} else {
  console.warn('⚠ No se encontró la hoja "🔗 Variantes" en la plantilla. Se empezará desde ID 1.');
}

let nextProductId  = maxProductId  + 1;
let nextVarianteId = Math.max(maxVarianteId, maxProductId) + 1;
console.log(`🔢 Próximo ID Producto: ${nextProductId} | Próximo ID Variante: ${nextVarianteId}`);

// ─── Construir el nuevo workbook con ExcelJS ──────────────────────────────────
console.log('\n🏗️  Construyendo nuevo Excel con estilo...');
const wb      = new ExcelJS.Workbook();
wb.creator    = 'Marybe';
wb.created    = new Date();
wb.modified   = new Date();

// ════════════════════════════════════════════════════════════════════════════
// HOJA 1: PRODUCTOS
// ════════════════════════════════════════════════════════════════════════════
const wsP = wb.addWorksheet('📦 Productos', {
  properties: { tabColor: { argb: C.violeta } },
  pageSetup:  { fitToPage: true, fitToWidth: 1, orientation: 'landscape' },
  views:      [{ state: 'frozen', xSplit: 0, ySplit: 3 }],
});

// ── Fila 1: Título ──
wsP.mergeCells('A1:R1');
const titleP     = wsP.getCell('A1');
titleP.value     = '📦 MARYBE — Plantilla de Productos (Hoja 1 de 2)';
titleP.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.grisOscuro } };
titleP.font      = { bold: true, color: { argb: C.blanco }, size: 14, name: 'Calibri' };
titleP.alignment = { horizontal: 'center', vertical: 'middle' };
wsP.getRow(1).height = 36;

// ── Fila 2: Instrucción ──
wsP.mergeCells('A2:R2');
const instrP     = wsP.getCell('A2');
instrP.value     = '⚠ Completar un producto por fila. El campo "id_original" debe coincidir con "producto_padre_id" en la hoja Variantes. No modificar los nombres de columnas.';
applyStyle(instrP, noteStyle());
wsP.getRow(2).height = 28;

// ── Definir columnas ──
const headersP = [
  { key: 'id_original',     header: 'ID Original *',    width: 14, group: 'base',  note: 'ID único del producto. Ej: 4751' },
  { key: 'sku',             header: 'SKU / EAN',        width: 18, group: 'base',  note: 'Código de barras o código interno principal' },
  { key: 'nombre',          header: 'Nombre *',         width: 40, group: 'base',  note: 'Nombre completo del producto' },
  { key: 'marca',           header: 'Marca',            width: 16, group: 'base',  note: 'Marca comercial. Ej: Kenzo, Revlon, Cutex' },
  { key: 'seccion',         header: 'Sección *',        width: 16, group: 'cat',   note: 'Nivel 1: Perfumería o Hogar. Usar el dropdown.' },
  { key: 'categoria',       header: 'Categoría',        width: 22, group: 'cat',   note: 'Nivel 2: Ej: Electro Belleza, Maquillaje, Fragancias' },
  { key: 'subcategoria',    header: 'Subcategoría',     width: 22, group: 'cat',   note: 'Nivel 3: Ej: Perfumes, Esmaltes, Bases' },
  { key: 'tipo',            header: 'Tipo',             width: 22, group: 'cat',   note: 'Nivel 4: Ej: Eau de Parfum, Kit, Crema' },
  { key: 'descripcion',     header: 'Descripción',      width: 60, group: 'extra', note: 'Descripción del producto para mostrar en la web' },
  { key: 'especificaciones', header: 'Especificaciones', width: 50, group: 'extra', note: 'Especificaciones técnicas (opcional)' },
  { key: 'proveedor',       header: 'Proveedor',        width: 28, group: 'extra', note: 'Nombre del proveedor o distribuidor' },
  { key: 'publicado',       header: 'Publicado',        width: 12, group: 'extra', note: 'TRUE = visible en la tienda | FALSE = oculto' },
  { key: 'destacado',       header: 'Destacado',        width: 12, group: 'extra', note: 'TRUE = en sección destacados | FALSE = normal' },
  { key: 'moneda',          header: 'Moneda',           width: 10, group: 'extra', note: 'Código de moneda. Ej: ARS, USD' },
  { key: 'caracteristicas', header: 'Características',  width: 40, group: 'extra', note: 'Características separadas por | Ej: Sin alcohol | Vegano' },
  { key: 'precio',          header: 'Precio *',         width: 16, group: 'precio', note: 'Precio de lista del producto. Si tiene variantes, cada variante puede tener su propio precio.' },
  { key: 'pct_descuento',   header: '% Descuento',      width: 14, group: 'precio', note: 'Porcentaje de descuento (0-100). 0 = sin oferta.' },
  { key: 'precio_oferta',   header: 'Precio Oferta 🔒',  width: 16, group: 'precio', note: '⚡ CALCULADO AUTOMÁTICAMENTE. No modificar.' },
];
wsP.columns = headersP.map(h => ({ key: h.key, width: h.width }));

  // Aplicar color especial a grupos de precio al definir header
const rowHeaderP = wsP.getRow(3);
headersP.forEach((h, i) => {
  const cell  = rowHeaderP.getCell(i + 1);
  cell.value  = h.header;
  let color;
  if (h.group === 'base')   color = C.violeta;
  else if (h.group === 'cat')   color = C.azul;
  else if (h.group === 'precio') color = C.verde;
  else                          color = C.grisOscuro;
  applyStyle(cell, headerStyle(color));
  if (h.note) cell.note = { texts: [{ text: h.note }] };
});
rowHeaderP.height = 30;

// ── Insertar datos de productos (escribir en filas específicas, NO addRow) ──
// Usamos getRow(n) para tener control exacto del índice de fila.
let rowIndexP = 3; // empezamos en fila 4 (índice 3 = header)

for (const [nombreBase, grupo] of productGroups) {
  rowIndexP++;
  const productId = nextProductId++;
  const marca     = extractMarca(grupo.proveedor, nombreBase);
  const primerEAN = grupo.variantes[0]?.codigo || '';
  const isEven    = (rowIndexP % 2 === 0);
  const bgColor   = isEven ? C.blanco : C.grisClaro;

  const primerPrecio = grupo.variantes[0]?.publico || null;

  const valores = [
    productId.toString(),           // A: ID Original
    primerEAN,                      // B: SKU/EAN
    nombreBase,                     // C: Nombre
    marca,                          // D: Marca
    'Perfumería',                   // E: Sección
    mapCategoria(grupo.rubro),      // F: Categoría
    '',                             // G: Subcategoría
    '',                             // H: Tipo
    grupo.descCompleta || nombreBase, // I: Descripción
    '',                             // J: Especificaciones
    grupo.proveedor,                // K: Proveedor
    'TRUE',                         // L: Publicado
    'FALSE',                        // M: Destacado
    'ARS',                          // N: Moneda
    '',                             // O: Características
    // P, Q, R: se escriben por separado con estilos especiales
  ];

  const r = wsP.getRow(rowIndexP);
  r.height = 20;
  valores.forEach((val, ci) => {
    const cell = r.getCell(ci + 1);
    cell.value = val;
    applyStyle(cell, dataStyle(bgColor));
    // Categorías en azul
    if (ci >= 4 && ci <= 7) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isEven ? C.azulClaro : 'FFBFDBFE' } };
      cell.font = { color: { argb: '1E3A5F' }, size: 10, name: 'Calibri' };
    }
    // Publicado / Destacado en color (ahora en columnas L=11 y M=12, índice 0-based: 11 y 12)
    if (ci === 11 || ci === 12) {
      cell.font = { bold: true, color: { argb: val === 'TRUE' ? '16A34A' : 'EF4444' }, size: 10 };
    }
  });

  // ── Columnas de precio (P, Q, R) con estilo especial ──
  // P: Precio
  const cP = r.getCell(16);
  if (primerPrecio !== null) cP.value = primerPrecio;
  applyStyle(cP, dataStyle(isEven ? C.verdeClaro : 'FFD1FAE5'));
  cP.font = { bold: true, color: { argb: '065F46' }, size: 10, name: 'Calibri' };
  cP.alignment = { vertical: 'middle', horizontal: 'right' };

  // Q: % Descuento
  const cQ = r.getCell(17);
  cQ.value = 0;
  applyStyle(cQ, dataStyle(isEven ? C.verdeClaro : 'FFD1FAE5'));
  cQ.font = { color: { argb: '065F46' }, size: 10, name: 'Calibri' };
  cQ.alignment = { vertical: 'middle', horizontal: 'center' };
  cQ.dataValidation = { type: 'whole', allowBlank: true, operator: 'between', formulae: [0, 100] };

  // R: Precio Oferta (fórmula calculada)
  const cR = r.getCell(18);
  cR.value = { formula: `IF(Q${rowIndexP}>0,ROUND(P${rowIndexP}*(1-Q${rowIndexP}/100),2),"")` };
  applyStyle(cR, readonlyStyle());
  cR.font = { color: { argb: 'FF065F46' }, size: 10, name: 'Calibri', italic: true };

  // Validaciones para esta fila de datos
  wsP.getCell(`E${rowIndexP}`).dataValidation = {
    type: 'list', allowBlank: true, formulae: ['"Perfumería,Hogar"'],
    showErrorMessage: true, errorTitle: 'Sección inválida', error: 'Solo se permite: Perfumería o Hogar',
  };
  wsP.getCell(`F${rowIndexP}`).dataValidation = { type: 'list', allowBlank: true, formulae: ["'\uD83D\uDCCB Listas'!$A$2:$A$10"] };
  wsP.getCell(`G${rowIndexP}`).dataValidation = { type: 'list', allowBlank: true, formulae: ["'\uD83D\uDCCB Listas'!$B$2:$B$42"] };
  wsP.getCell(`H${rowIndexP}`).dataValidation = { type: 'list', allowBlank: true, formulae: ["'\uD83D\uDCCB Listas'!$C$2:$C$96"] };
  wsP.getCell(`L${rowIndexP}`).dataValidation = { type: 'list', allowBlank: true, formulae: ['"TRUE,FALSE"'] };
  wsP.getCell(`M${rowIndexP}`).dataValidation = { type: 'list', allowBlank: true, formulae: ['"TRUE,FALSE"'] };
  wsP.getCell(`N${rowIndexP}`).dataValidation = { type: 'list', allowBlank: true, formulae: ['"ARS,USD,EUR"'] };

  r.commit();
}

// ── Validaciones dropdown (DESPUÉS de los datos para no crear filas vacías) ──
const lastProductDataRow = rowIndexP;
for (let i = 4; i <= Math.max(1000, lastProductDataRow + 50); i++) {
  wsP.getCell(`E${i}`).dataValidation = {
    type: 'list', allowBlank: true, formulae: ['"Perfumería,Hogar"'],
    showErrorMessage: true, errorTitle: 'Sección inválida', error: 'Solo se permite: Perfumería o Hogar',
  };
  wsP.getCell(`F${i}`).dataValidation = {
    type: 'list', allowBlank: true,
    formulae: ["'\uD83D\uDCCB Listas'!$A$2:$A$10"],
    showErrorMessage: true, errorTitle: 'Categoría inválida',
    error: 'Seleccioná una categoría de la lista desplegable',
  };
  wsP.getCell(`G${i}`).dataValidation = {
    type: 'list', allowBlank: true,
    formulae: ["'\uD83D\uDCCB Listas'!$B$2:$B$42"],
    showErrorMessage: true, errorTitle: 'Subcategoría inválida',
    error: 'Seleccioná una subcategoría de la lista desplegable',
  };
  wsP.getCell(`H${i}`).dataValidation = {
    type: 'list', allowBlank: true,
    formulae: ["'\uD83D\uDCCB Listas'!$C$2:$C$96"],
    showErrorMessage: true, errorTitle: 'Tipo inválido',
    error: 'Seleccioná un tipo de la lista desplegable',
  };
  wsP.getCell(`L${i}`).dataValidation = {
    type: 'list', allowBlank: true, formulae: ['"TRUE,FALSE"'],
    showErrorMessage: true, errorTitle: 'Valor inválido', error: 'Solo se permite TRUE o FALSE',
  };
  wsP.getCell(`M${i}`).dataValidation = {
    type: 'list', allowBlank: true, formulae: ['"TRUE,FALSE"'],
    showErrorMessage: true, errorTitle: 'Valor inválido', error: 'Solo se permite TRUE o FALSE',
  };
  wsP.getCell(`N${i}`).dataValidation = {
    type: 'list', allowBlank: true, formulae: ['"ARS,USD,EUR"'],
  };
  wsP.getCell(`Q${i}`).dataValidation = {
    type: 'whole', allowBlank: true, operator: 'between', formulae: [0, 100],
    showErrorMessage: true, errorTitle: 'Porcentaje inválido', error: 'El descuento debe ser entre 0 y 100',
  };
  // Fórmula precio oferta en filas nuevas que el usuario agregue
  const cellR = wsP.getCell(`R${i}`);
  if (i > lastProductDataRow) {
    cellR.value = { formula: `IF(Q${i}>0,ROUND(P${i}*(1-Q${i}/100),2),"")` };
    applyStyle(cellR, readonlyStyle());
  }
}

console.log(`   ✅ Productos insertados: ${productGroups.size}`);

// ════════════════════════════════════════════════════════════════════════════
// HOJA 2: VARIANTES
// ════════════════════════════════════════════════════════════════════════════
const wsV = wb.addWorksheet('🔗 Variantes', {
  properties: { tabColor: { argb: C.coral } },
  pageSetup:  { fitToPage: true, fitToWidth: 1, orientation: 'landscape' },
  views:      [{ state: 'frozen', xSplit: 0, ySplit: 3 }],
});

// ── Fila 1: Título ──
wsV.mergeCells('A1:M1');
const titleV     = wsV.getCell('A1');
titleV.value     = '🔗 MARYBE — Plantilla de Variantes (Hoja 2 de 2)';
titleV.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7C3AED' } };
titleV.font      = { bold: true, color: { argb: C.blanco }, size: 14, name: 'Calibri' };
titleV.alignment = { horizontal: 'center', vertical: 'middle' };
wsV.getRow(1).height = 36;

// ── Fila 2: Instrucción ──
wsV.mergeCells('A2:M2');
const instrV     = wsV.getCell('A2');
instrV.value     = '⚠ Una fila por variante. "producto_padre_id" debe coincidir con un "id_original" de la hoja Productos. Columna C (Nombre) y Columna I (Precio Oferta) se calculan automáticamente — NO modificar.';
applyStyle(instrV, noteStyle());
wsV.getRow(2).height = 28;

// ── Definir columnas ──
const headersV = [
  { key: 'id_original',       header: 'ID Variante *',           width: 16, req: true,  color: null, note: 'ID único de esta variante.' },
  { key: 'producto_padre_id', header: 'ID Producto Padre *',     width: 18, req: true,  color: null, note: 'Debe coincidir con "id_original" de Productos' },
  { key: 'nombre_padre',      header: 'Nombre Producto Padre 🔒',width: 32, req: false, color: C.verde, note: '⚡ CALCULADO AUTOMÁTICAMENTE con BUSCARV.' },
  { key: 'sku_ean',           header: 'SKU / EAN',               width: 18, req: false, color: null, note: 'Código de barras único de esta variante' },
  { key: 'volumen',           header: 'Volumen / Tamaño',        width: 16, req: false, color: null, note: 'Ej: 30 ml, 50 ml, 100 ml' },
  { key: 'stock',             header: 'Stock',                   width: 10, req: false, color: null, note: 'Cantidad disponible. 0 = sin stock' },
  { key: 'precio',            header: 'Precio *',                width: 14, req: true,  color: null, note: 'Precio de venta normal (sin puntos). Ej: 196000' },
  { key: 'pct_descuento',     header: '% Descuento',             width: 14, req: false, color: null, note: 'Porcentaje de descuento (0-100). 0 = sin oferta.' },
  { key: 'precio_oferta',     header: 'Precio Oferta 🔒',        width: 16, req: false, color: C.verde, note: '⚡ CALCULADO AUTOMÁTICAMENTE. No modificar.' },
  { key: 'publicado',         header: 'Publicado',               width: 12, req: false, color: null, note: 'TRUE = visible | FALSE = oculto' },
  { key: 'envio',             header: 'Envío',                   width: 10, req: false, color: null, note: '1 = tiene envío | 0 = sin envío' },
  { key: 'moneda',            header: 'Moneda',                  width: 10, req: false, color: null, note: 'Código de moneda. Ej: ARS, USD' },
  { key: 'color_nombre',      header: '🎨 Color',               width: 20, req: false, color: C.naranja, note: 'Elegir de la lista. Dejar vacío si no aplica.' },
];
wsV.columns = headersV.map(h => ({ key: h.key, width: h.width }));

// ── Fila 3: Headers ──
const rowHeaderV = wsV.getRow(3);
headersV.forEach((h, i) => {
  const cell  = rowHeaderV.getCell(i + 1);
  cell.value  = h.header;
  let hColor;
  if (h.color)    hColor = h.color;
  else if (h.req) hColor = C.coral;
  else            hColor = C.grisOscuro;
  applyStyle(cell, headerStyle(hColor));
  if (h.note) cell.note = { texts: [{ text: h.note }] };
});
rowHeaderV.height = 30;

// ── Insertar datos de variantes (getRow para filas específicas) ──
let rowIndexV     = 3; // empezamos en fila 4 (3 = header)
let totalVariantes = 0;

let tmpProductId = nextProductId - productGroups.size; // rewind al primer ID asignado
for (const [nombreBase, grupo] of productGroups) {
  const productId = tmpProductId++;

  for (const variante of grupo.variantes) {
    rowIndexV++;
    const varId   = nextVarianteId++;
    const desc    = calcDescuento(variante.publico, variante.oferta);
    const isEven  = (rowIndexV % 2 === 0);
    const bgColor = isEven ? C.blanco : 'FFFFF7ED';

    const r = wsV.getRow(rowIndexV);
    r.height = 20;

    // A: ID Variante
    const cA = r.getCell(1);
    cA.value = varId.toString();
    applyStyle(cA, dataStyle(bgColor));

    // B: ID Producto Padre
    const cB = r.getCell(2);
    cB.value = productId.toString();
    applyStyle(cB, dataStyle(bgColor));

    // C: Nombre Padre — fórmula VLOOKUP
    const cC = r.getCell(3);
    cC.value = { formula: `IF(B${rowIndexV}<>"",IFERROR(VLOOKUP(B${rowIndexV},'📦 Productos'!A:C,3,FALSE),""),"")` };
    applyStyle(cC, readonlyStyle());

    // D: SKU/EAN
    const cD = r.getCell(4);
    cD.value = variante.codigo || '';
    applyStyle(cD, dataStyle(bgColor));

    // E: Volumen/Tamaño
    const cE = r.getCell(5);
    cE.value = variante.size || '';
    applyStyle(cE, dataStyle(bgColor));

    // F: Stock (vacío)
    applyStyle(r.getCell(6), dataStyle(bgColor));

    // G: Precio
    const cG = r.getCell(7);
    if (variante.publico !== null) cG.value = variante.publico;
    applyStyle(cG, dataStyle(bgColor));
    if (variante.publico !== null) cG.font = { bold: true, color: { argb: C.grisOscuro }, size: 10, name: 'Calibri' };

    // H: % Descuento
    const cH = r.getCell(8);
    cH.value = desc;
    applyStyle(cH, dataStyle(bgColor));
    if (desc > 0) cH.font = { bold: true, color: { argb: '7C3AED' }, size: 10 };

    // I: Precio Oferta — fórmula automática
    const cI = r.getCell(9);
    cI.value = { formula: `IF(H${rowIndexV}>0,ROUND(G${rowIndexV}*(1-H${rowIndexV}/100),2),"")` };
    applyStyle(cI, readonlyStyle());

    // J: Publicado
    const cJ = r.getCell(10);
    cJ.value = 'TRUE';
    cJ.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
    cJ.font  = { bold: true, color: { argb: '16A34A' }, size: 10 };
    cJ.alignment = { vertical: 'middle' };

    // K: Envío (vacío)
    applyStyle(r.getCell(11), dataStyle(bgColor));

    // L: Moneda
    const cL = r.getCell(12);
    cL.value = 'ARS';
    applyStyle(cL, dataStyle(bgColor));

    // M: Color (vacío)
    const cM = r.getCell(13);
    applyStyle(cM, dataStyle(bgColor));
    cM.dataValidation = {
      type: 'list', allowBlank: true, formulae: ["'🎨 Colores'!$A$2:$A$60"], showErrorMessage: false,
    };

    // Validaciones para otras celdas
    r.getCell(10).dataValidation = { type: 'list', allowBlank: true, formulae: ['"TRUE,FALSE"'] }; // J
    r.getCell(11).dataValidation = { type: 'list', allowBlank: true, formulae: ['"1,0"'] }; // K
    r.getCell(12).dataValidation = { type: 'list', allowBlank: true, formulae: ['"ARS,USD,EUR"'] }; // L
    r.getCell(8).dataValidation = { type: 'whole', allowBlank: true, operator: 'between', formulae: [0, 100] }; // H

    r.commit();
    totalVariantes++;
  }
}

// ── Validaciones y fórmulas en filas vacías DESPUÉS de los datos ──
const lastVarianteDataRow = rowIndexV;
for (let i = lastVarianteDataRow + 1; i <= Math.max(1000, lastVarianteDataRow + 50); i++) {
  // Col C: fórmula VLOOKUP para filas nuevas que el usuario agregue
  const cellC = wsV.getCell(`C${i}`);
  cellC.value = { formula: `IF(B${i}<>"",IFERROR(VLOOKUP(B${i},'📦 Productos'!A:C,3,FALSE),""),"")` };
  applyStyle(cellC, readonlyStyle());

  // Col I: precio_oferta fórmula
  const cellI = wsV.getCell(`I${i}`);
  cellI.value = { formula: `IF(H${i}>0,ROUND(G${i}*(1-H${i}/100),2),"")` };
  applyStyle(cellI, readonlyStyle());

  // Validaciones dropdown
  wsV.getCell(`J${i}`).dataValidation = {
    type: 'list', allowBlank: true, formulae: ['"TRUE,FALSE"'],
    showErrorMessage: true, errorTitle: 'Valor inválido', error: 'Solo TRUE o FALSE',
  };
  wsV.getCell(`L${i}`).dataValidation = { type: 'list', allowBlank: true, formulae: ['"ARS,USD,EUR"'] };
  wsV.getCell(`K${i}`).dataValidation = { type: 'list', allowBlank: true, formulae: ['"1,0"'] };
  wsV.getCell(`H${i}`).dataValidation = {
    type: 'whole', allowBlank: true, operator: 'between', formulae: [0, 100],
    showErrorMessage: true, errorTitle: 'Porcentaje inválido', error: 'El descuento debe ser entre 0 y 100',
  };
  wsV.getCell(`M${i}`).dataValidation = {
    type: 'list', allowBlank: true, formulae: ["'🎨 Colores'!$A$2:$A$60"], showErrorMessage: false,
  };
}

console.log(`   ✅ Variantes insertadas: ${totalVariantes}`);

// ════════════════════════════════════════════════════════════════════════════
// HOJA OCULTA: PALETA DE COLORES (igual que generar-plantilla.js)
// ════════════════════════════════════════════════════════════════════════════
const wsC = wb.addWorksheet('🎨 Colores', {
  properties: { tabColor: { argb: C.naranja } },
  state: 'veryHidden',
});
wsC.columns = [{ key: 'nombre', width: 28 }, { key: 'hex', width: 12 }];

const cHeader = wsC.getRow(1);
cHeader.getCell(1).value = 'Nombre del Color';
cHeader.getCell(2).value = 'Hex (referencia)';
applyStyle(cHeader.getCell(1), headerStyle(C.naranja));
applyStyle(cHeader.getCell(2), headerStyle(C.naranja));
cHeader.height = 24;

const COLORES = [
  ['Negro', '#1a1a1a'], ['Negro Azulado', '#0d0d1a'],
  ['Castaño Oscuro', '#3E2009'], ['Castaño Natural', '#6B4226'],
  ['Castaño Claro', '#8B6347'], ['Castaño Ceniza', '#6B5B52'],
  ['Castaño Dorado', '#8B5E3C'], ['Chocolate', '#3D1C02'],
  ['Caoba', '#722F37'], ['Avellana', '#855E42'],
  ['Rubio Oscuro', '#C8A96E'], ['Rubio Natural', '#E8C98A'],
  ['Rubio Claro', '#F5DEB3'], ['Rubio Dorado', '#DAA520'],
  ['Rubio Ceniza', '#D4C5A9'], ['Rubio Platinado', '#F0E6C8'],
  ['Miel', '#FFC30B'], ['Rojo', '#CC0000'],
  ['Rojo Intenso', '#8B0000'], ['Bordo', '#5C0A0A'],
  ['Bordo Oscuro', '#3E0102'], ['Cobre', '#B87333'],
  ['Rojizo', '#9B2335'], ['Rosa Claro', '#FFCDD2'],
  ['Rosa', '#FFB6C1'], ['Rosa Oscuro', '#C2185B'],
  ['Fucsia', '#FF0090'], ['Coral', '#FF6B6B'],
  ['Durazno', '#FFCBA4'], ['Nude', '#D4A574'],
  ['Beige', '#F5F5DC'], ['Arena', '#C2B280'],
  ['Marfil', '#FFFFF0'], ['Porcelana', '#F7E7CE'],
  ['Blanco', '#FFFFFF'], ['Blanco Perla', '#F8F8F0'],
  ['Dorado', '#FFD700'], ['Plateado', '#C0C0C0'],
  ['Bronce', '#CD7F32'], ['Lavanda', '#E6E6FA'],
  ['Lila', '#C8A2C8'], ['Violeta', '#8B00FF'],
  ['Morado', '#6A0DAD'], ['Azul', '#0055AA'],
  ['Turquesa', '#40E0D0'], ['Verde', '#228B22'],
  ['Verde Oliva', '#808000'], ['Gris Claro', '#D3D3D3'],
  ['Gris', '#808080'], ['Gris Oscuro', '#404040'],
  ['Transparente', '#E8E8E8'], ['Incoloro', '#F5F5F5'],
];

COLORES.forEach(([nombre, hex], idx) => {
  const row       = wsC.addRow([nombre, hex]);
  row.height      = 18;
  const nameCell  = row.getCell(1);
  const hexCell   = row.getCell(2);
  nameCell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: idx % 2 === 0 ? 'FFFFFFFF' : 'FFFFF3E0' } };
  nameCell.font   = { size: 10, name: 'Calibri' };
  nameCell.alignment = { vertical: 'middle' };
  hexCell.fill    = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + hex.replace('#', '') } };
  hexCell.font    = { size: 9, color: { argb: 'FF555555' }, name: 'Calibri' };
  hexCell.value   = hex;
  hexCell.alignment = { horizontal: 'center', vertical: 'middle' };
});

// ════════════════════════════════════════════════════════════════════════════
// HOJA OCULTA: LISTAS DE CATEGORÍAS / SUBCATEGORÍAS / TIPOS
// ════════════════════════════════════════════════════════════════════════════
const wsL = wb.addWorksheet('📋 Listas', { state: 'veryHidden' });
wsL.columns = [
  { key: 'cat',    width: 32 },
  { key: 'subcat', width: 42 },
  { key: 'tipo',   width: 48 },
];
['Categorías', 'Subcategorías', 'Tipos'].forEach((h, i) => {
  const cell = wsL.getRow(1).getCell(i + 1);
  cell.value = h;
  applyStyle(cell, headerStyle(C.grisOscuro));
});

const CATEGORIAS_L = [
  'Ofertas', 'Dermocosmetica', 'Fragancias', 'Maquillaje',
  'Cuidado Personal', 'Niños y Bebés', 'Limpieza del hogar',
  'Electro belleza', 'Lanzamientos',
];

const SUBCATEGORIAS_L = [
  'Cuidado facial', 'Cuidado Corporal', 'Solares',
  'Femeninas', 'Masculinos', 'Sets',
  'Bebés y niños', 'Labios', 'Ojos', 'Rostro', 'Uñas', 'Accesorios',
  'Cuidado Capilar', 'Higiene Corporal', 'Higiene Oral', 'Cuidado Intimo',
  'Pañales', 'Higiene del Bebe',
  'Jabones', 'Colonias', 'Fragancias', 'Desodorantes',
  'Cuidado materno', 'Capilares',
  'Cocina', 'Baño', 'Pisos y Muebles',
  'Insecticida y Repelentes', 'Ropa', 'Calzado',
  'Desodorante de Ambiente', 'Papeles', 'Accesorios de Limpieza',
  'Maquinas de Corte Cabello y Barba', 'Planchas y Rizadores',
  'Secadores de Pelo', 'Depilación', 'Masajeadores',
  'Cabinas y Tornos de Uñas', 'Peinados y Accesorios',
];

const TIPOS_L = [
  'Limpieza facial', 'Exfoliantes y Mascarillas', 'Tónicos', 'Cremas Faciales',
  'Serums', 'Contornos de ojos y labios',
  'Cremas Corporales', 'Cremas de manos', 'Cremas para masajes', 'Exfoliantes',
  'Faciales', 'Corporales', 'Autobronceantes', 'Post Solares',
  'Premium', 'Sets', 'Semi selectivos', 'Nacionales', 'Body Splash y Colonias',
  'Labiales Liquidos', 'Labiales en Barra', 'Bálsamos Labiales', 'Brillos Labiales', 'Delineadores',
  'Mascaras de pestañas', 'Sombras', 'Delineadores en Lapiz', 'Delineadores Liquidos', 'Cejas',
  'Bases de Maquillaje', 'Correctores de Ojeras', 'Polvos', 'Bronzer',
  'Iluminadores', 'Rubores', 'Fijadores', 'Primer',
  'Esmaltes', 'Quita esmaltes', 'Tratamientos',
  'Brochas y Pinceles', 'Esponjas',
  'Shampoo', 'Acondicionadores', 'Tratamientos Capilares', 'Coloración',
  'Gel y Fijadores', 'Cepillos y Peines',
  'Desodorantes', 'Depilacion', 'Afeitado', 'Jabones de Tocador',
  'Algodones e hisopos', 'Talcos',
  'Pastas Dentales', 'Cepillos de dientes', 'Hilos dentales', 'Enjuagues bucales',
  'Toallitas', 'Protectores diarios', 'Salud intima', 'Incontinencia',
  'Toallas humedas', 'Oleos y algodón', 'Talcos y Aceites',
  'Protectores Mamarios', 'Cuidado de piel',
  'Detergentes', 'Lava Vajillas', 'Limpieza de Superficies',
  'Desinfectantes', 'Pastillas de inodoro',
  'Lavandina', 'Aromatizantes', 'Lustramuebles', 'Ceras y Autobrillos',
  'Aerosoles', 'Repelentes', 'Aparatos y cebos',
  'Jabones Liquidos', 'Suavizantes',
  'Brillos Limpiadores', 'Pomadas',
  'Desinfectantes de Ambiente',
  'Pañuelos', 'Papel Higienico', 'Rollos de Cocina', 'Servilletas',
  'Mopas', 'Escobas', 'Guantes', 'Palas y Cabos', 'Trapos de Piso y Paños Multiuso',
  'Cortadoras de Pelo', 'Recortadoras de Barba', 'Planchas', 'Rizadores',
  'Depiladoras eléctricas', 'Masajeadores eléctricos',
  'Cabinas de Uñas', 'Tornos de Uñas',
  'Accesorios',
];

const maxRowsL = Math.max(CATEGORIAS_L.length, SUBCATEGORIAS_L.length, TIPOS_L.length);
for (let rr = 0; rr < maxRowsL; rr++) {
  const row = wsL.getRow(rr + 2);
  if (CATEGORIAS_L[rr])   row.getCell(1).value = CATEGORIAS_L[rr];
  if (SUBCATEGORIAS_L[rr]) row.getCell(2).value = SUBCATEGORIAS_L[rr];
  if (TIPOS_L[rr])         row.getCell(3).value = TIPOS_L[rr];
  row.height = 16;
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
  ['',  '',  'Esta plantilla tiene 2 hojas de trabajo: "Productos" y "Variantes".'],
  ['',  '',  'Cada PRODUCTO (hoja 1) puede tener una o varias VARIANTES (hoja 2).'],
  ['',  '',  'La relación se establece con el campo "ID Original" = "ID Producto Padre".'],
  ['',  '',  ''],
  ['',  'Jerarquía de Categorías (4 niveles)', ''],
  ['',  '',  'Los productos se clasifican en 4 niveles en la Hoja 1:'],
  ['',  '',  '  1. SECCIÓN      → Perfumería  |  Hogar  (dropdown, solo estas opciones)'],
  ['',  '',  '  2. CATEGORÍA    → Electro Belleza, Maquillaje, Baño, Cocina, etc.'],
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

// ─── Guardar ──────────────────────────────────────────────────────────────────
console.log('\n💾 Guardando archivo...');
await wb.xlsx.writeFile(OUTPUT_PATH);

console.log(`\n✅ COMPLETADO!`);
console.log(`📦 Productos: ${productGroups.size} | 🔗 Variantes: ${totalVariantes}`);
console.log(`📁 Archivo: ${OUTPUT_PATH}`);

// ─── Pequeño resumen de grupos con variantes múltiples ───────────────────────
const multiVariante = [...productGroups.entries()].filter(([, g]) => g.variantes.length > 1);
console.log(`\n🔁 Productos con variantes múltiples: ${multiVariante.length}`);
multiVariante.slice(0, 8).forEach(([nombre, g]) =>
  console.log(`   ${nombre} → ${g.variantes.length} variantes (${g.variantes.map(v => v.size || '?').join(', ')})`)
);

} // end main

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
