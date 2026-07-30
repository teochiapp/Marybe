/**
 * garnier_csv_to_excel.js
 * Convierte el CSV del proveedor Garnier (L'Oreal ARG) a la Plantilla Marybe,
 * con la misma estructura de columnas y estilos que puig_csv_to_excel.js
 *
 * Rubro de Garnier tiene estos formatos:
 *   "SHAMPOO-ACO-BC"           -> Shampoo / Acondicionadores y Cuidado
 *   "CREMAS DE TRATAMIENTO"    -> Cremas de Tratamiento
 *   "TINTURAS-DECOLORACION"    -> Tinturas / Decoloracion
 *   "MAQUILLAJE"               -> Maquillaje
 *
 * Variantes:
 *   - Tamano: detectado por "X NNN ml" al final del nombre (shampoo, cremas)
 *   - Color:  las tinturas llevan el color en el nombre
 *             Ej: "NUTRISSE COLORACION 20 GROSELLA NEGRA"
 *             -> Variante de color: codigo "20", color "Grosella Negra"
 *
 * Uso:   node Backend/scripts/garnier_csv_to_excel.js
 * Salida: Backend/data/Productos_Garnier_Marybe.xlsx
 *
 * IDs reservados: Productos 7000-7999 | Variantes 16000-16999
 */

'use strict';

const ExcelJS = require('exceljs');
const path    = require('path');
const fs      = require('fs');

const CSV_PATH    = path.join(__dirname, '../../Frontend/GARNIER PAGINA - 290726 1017.csv');
const OUTPUT_PATH = path.join(__dirname, '../data/Productos_Garnier_Marybe.xlsx');

const {
  C, headerStyle, dataStyle, noteStyle, readonlyStyle, applyStyle,
} = require('../src/utils/excel-utils');

// Rangos de ID fijos (idempotentes por proveedor)
const GARNIER_BASE_PROD = 7000;
const GARNIER_BASE_VAR  = 16000;

// Mapa de palabras clave en nombre de color -> HEX aproximado
const COLOR_HEX_MAP = {
  'NEGRO INTENSO':     '#000000',
  'NEGRO PROFUNDO':    '#0A0A0A',
  'EBANO':             '#1C1C1C',
  'NEGRO':             '#1C1C1C',
  'CASTANO OSCURO':    '#3B1E08',
  'CASTANO CLARO DORADO': '#8B5E3C',
  'CASTANO CLARO':     '#6B3A1F',
  'CASTANO CENIZA CAOBA': '#5A3525',
  'CASTANO ROJIZO':    '#7B3B2A',
  'CASTANO':           '#4A2A0A',
  'RUBIO ULTRA CLARO': '#F5E6C8',
  'RUBIO MUY CLARO':   '#E8D5A3',
  'RUBIO CLARO CENIZO':'#C8BFA0',
  'RUBIO CLARO DORADO':'#D4AF37',
  'RUBIO CLARO':       '#D4AF37',
  'RUBIO OSCURO':      '#8B6914',
  'RUBIO CENIZO':      '#B0A080',
  'RUBIO DORADO':      '#C9A84C',
  'RUBIO ROJIZO':      '#A0522D',
  'RUBIO':             '#C9A84C',
  'ROJO COBRIZO':      '#CB6D3A',
  'ROJO INTENSO':      '#B22222',
  'COBRIZO RUBI':      '#9B2335',
  'COBRIZO':           '#CB6D3A',
  'CHOCOLATE CAOBA':   '#4A2416',
  'CHOCOLATE PURO':    '#3D1C02',
  'CHOCOLATE':         '#5C3317',
  'CAOBA':             '#8B2500',
  'BORGONYA':          '#800020',
  'BORGOÑA':           '#800020',
  'CARAMELO':          '#C68642',
  'MIEL':              '#B5813C',
  'CENIZA':            '#A0A0A0',
  'DORADO COBRIZO':    '#B8860B',
  'DORADO':            '#DAA520',
  'ARANDANO':          '#5D2D91',
  'GROSELLA':          '#8B0040',
  'TAMARINDO':         '#6B3226',
  'AVELLANA':          '#7D5A50',
  'CAFE':              '#4A2F1C',
  'CAPUCCINO':         '#6F4E37',
  'ESPRESSO':          '#2C1503',
  'CHAMPANA':          '#F7E7CE',
  'ALMENDRA':          '#EFDECD',
  'JAZMIN':            '#F5F0E8',
  'MARGARITA':         '#FFFACD',
  'NECTAR':            '#FFBE00',
  'TRIGO':             '#F5DEB3',
  'CENTENO':           '#8B7355',
  'AMBAR':             '#FFBF00',
  'AZAHAR':            '#F0E5CE',
  'MARACUYA':          '#F5C518',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function parsePrecio(str) {
  if (!str || str.toString().trim() === '') return null;
  const clean = str.toString().replace(/"/g, '').trim().replace(/\./g, '').replace(',', '.');
  const val = parseFloat(clean);
  return isNaN(val) ? null : val;
}

function calcDesc(publico, oferta) {
  if (!publico || !oferta || publico === 0) return 0;
  const pct = Math.round(((publico - oferta) / publico) * 100);
  return pct > 0 ? pct : 0;
}

function toTitleCase(str) {
  return (str || '')
    .toLowerCase()
    .replace(/(?:^|[\s-])\S/g, c => c.toUpperCase());
}

function parseCSV(text) {
  const rows = [];
  let field = '', fields = [], inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQ && text[i + 1] === '"') { field += '"'; i++; }
      else inQ = !inQ;
    } else if (ch === ',' && !inQ) { fields.push(field.trim()); field = ''; }
    else if ((ch === '\n' || ch === '\r') && !inQ) {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      fields.push(field.trim()); rows.push(fields); fields = []; field = '';
    } else { field += ch; }
  }
  if (field || fields.length > 0) { fields.push(field.trim()); rows.push(fields); }
  return rows;
}

/**
 * Normaliza el campo Rubro que puede tener encoding corrupto:
 * "TINTURAS-DECOLORACI\u00d3N" -> "TINTURAS-DECOLORACION"
 */
function normRubro(rubro) {
  return (rubro || '')
    .normalize('NFD')           // descomponer tildes: Ñ → N + combinando~
    .replace(/[\u0300-\u036f]/g, '') // quitar marcas diacríticas
    .replace(/[^\x00-\x7F]/g, '')    // quitar cualquier otro no-ASCII residual
    .trim()
    .toUpperCase();
}

/**
 * Mapea el campo Rubro al arbol Seccion / Categoria / Subcategoria
 */
function mapRubro(rubroOriginal) {
  const seccion = 'Perfumería';
  const r = normRubro(rubroOriginal);
  const partes = r.split('-').map(p => p.trim());
  const primero = partes[0];

  if (primero === 'SHAMPOO') {
    // SHAMPOO-ACO-BC -> subcat a partir de la 2da parte
    const subcatPartes = partes.slice(1);
    let subcategoria = '';
    if (subcatPartes.includes('ACO')) subcategoria = 'Acondicionadores';
    if (subcatPartes.length > 0)     subcategoria = subcatPartes.map(toTitleCase).join(' ');
    return { seccion, categoria: 'Shampoo', subcategoria, tipo: '' };
  }

  if (primero.includes('TINTURA') || primero.includes('COLORACION') || primero.includes('DECOLORACI')) {
    const sub = partes.length > 1 ? toTitleCase(partes.slice(1).join(' ').trim()) : 'Coloración';
    return { seccion, categoria: 'Tinturas', subcategoria: sub, tipo: '' };
  }

  if (r.includes('CREMA') || r.includes('TRATAMIENTO')) {
    return { seccion, categoria: 'Cremas de Tratamiento', subcategoria: '', tipo: '' };
  }

  if (primero === 'MAQUILLAJE') {
    return { seccion, categoria: 'Maquillaje', subcategoria: '', tipo: '' };
  }

  // fallback
  return { seccion, categoria: toTitleCase(r), subcategoria: '', tipo: '' };
}

/**
 * Para shampoo/cremas: extrae el volumen al final del nombre.
 * "FRUCTIS ACONDICIONADOR ALOE HIDRA CLEAN X 200 ML" ->
 *   base: "FRUCTIS ACONDICIONADOR ALOE HIDRA CLEAN", vol: "X 200 ML"
 */
function extractVolume(nombre) {
  if (!nombre) return { base: nombre, vol: null };
  // Patron: ... X NNN [ml|g|gr|oz|L|kg] al final
  const matchX = nombre.match(/^(.*?)\s+X\s*(\d[\d.,]*\s*(?:ml|g|gr|oz|L|l|kg|ML|G).*?)\s*$/i);
  if (matchX) {
    return { base: matchX[1].trim(), vol: ('X ' + matchX[2].trim()).replace(/\s+/g, ' ') };
  }
  // Patron numerico: "300 ML" al final
  const matchNum = nombre.match(/^(.*?)\s+(\d+(?:[.,]\d+)?\s*(?:ml|g|gr|oz|L|l|kg|ML))\s*$/i);
  if (matchNum) {
    return { base: matchNum[1].trim(), vol: matchNum[2].trim() };
  }
  return { base: nombre.trim(), vol: null };
}

/**
 * Para tinturas: extrae el codigo de color y nombre desde la descripcion.
 *
 * "NUTRISSE COLORACION 20 GROSELLA NEGRA"
 *   -> lineaBase: "NUTRISSE COLORACION", colorCodigo: "20", colorNombre: "Grosella Negra"
 *
 * "GARNIER COR INTENSA 4.0 CASTANO"
 *   -> lineaBase: "GARNIER COR INTENSA", colorCodigo: "4.0", colorNombre: "Castano"
 *
 * "NUTRISSE COLORACION S/AMONIACO OLEOS 7 RUBIO"
 *   -> lineaBase: "NUTRISSE COLORACION S/AMONIACO OLEOS", colorCodigo: "7", colorNombre: "Rubio"
 */
function extractColorTintura(nombre) {
  if (!nombre) return { base: nombre, colorCodigo: null, colorNombre: null };

  // Patron general: (texto_base) (codigo_numerico) (descripcion_color)
  // El codigo puede ser: 20, 4.0, 10.13, 6646, 7.12, etc. seguido de letras opcionales (P, U)
  const match = nombre.match(
    /^(.*?(?:COLORACION|COLORACION\s+S\/AMONIACO\s+OLEOS|COR INTENSA|COLOR))\s+([\d]+(?:[.\s][\d]+)?[A-Z]?)\s+(.+)$/i
  );

  if (match) {
    const lineaBase  = match[1].trim();
    const codigo     = match[2].trim().replace(/\s+/g, '.');
    const colorDesc  = match[3].trim();
    return {
      base:        lineaBase,
      colorCodigo: codigo,
      colorNombre: toTitleCase(colorDesc),
    };
  }

  return { base: nombre, colorCodigo: null, colorNombre: null };
}

/**
 * Busca el HEX mas cercano para un nombre de color de cabello.
 * Hace busqueda por palabras clave en orden de mas especifico a menos.
 */
function buscarHexColor(colorNombre) {
  if (!colorNombre) return '';
  const upper = colorNombre.toUpperCase()
    .replace(/[ÁÀÂÄ]/g, 'A').replace(/[ÉÈÊË]/g, 'E')
    .replace(/[ÍÌÎÏ]/g, 'I').replace(/[ÓÒÔÖ]/g, 'O')
    .replace(/[ÚÙÛÜ]/g, 'U').replace(/Ñ/g, 'N');

  // Buscar de mas especifico a menos (ordenado por longitud de clave)
  const sortedKeys = Object.keys(COLOR_HEX_MAP).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (upper.includes(key)) return COLOR_HEX_MAP[key];
  }
  return '';
}

// ─── Deducir marca del nombre del producto ────────────────────────────────────
function deducirMarca(descripcion) {
  const d = (descripcion || '').toUpperCase();
  if (d.startsWith('FRUCTIS')) return 'Garnier Fructis';
  if (d.startsWith('NUTRISSE')) return 'Garnier Nutrisse';
  if (d.startsWith('GARNIER')) return 'Garnier';
  return 'Garnier';
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('📂 Leyendo CSV de Garnier...');

  if (!fs.existsSync(CSV_PATH)) {
    console.error('No se encontro el CSV en: ' + CSV_PATH);
    process.exit(1);
  }

  // El CSV de Garnier es UTF-8
  const csvRaw = fs.readFileSync(CSV_PATH, 'utf8');
  const rows   = parseCSV(csvRaw);

  // Buscar fila de encabezado
  let headerIdx = -1;
  for (let i = 0; i < rows.length; i++) {
    if ((rows[i][0] || '').trim() === 'Codigo') { headerIdx = i; break; }
  }
  if (headerIdx === -1) {
    console.error('No se encontro fila de encabezado (Codigo)');
    process.exit(1);
  }

  const headers = rows[headerIdx];
  const COL = {};
  headers.forEach((h, i) => { COL[h.trim()] = i; });
  console.log('Columnas detectadas:', Object.keys(COL).join(', '));

  // Leer filas de datos
  const dataRows = [];
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const f = rows[i];
    if (!f || f.length < 4) continue;
    const descripcion = (f[COL['Descripcion']] || '').replace(/"/g, '').trim();
    if (!descripcion) continue;
    const rubro = (f[COL['Rubro']] || '').replace(/"/g, '').trim();
    if (!rubro) continue;
    dataRows.push({
      codigo:    (f[COL['Codigo']]    || '').replace(/"/g, '').trim(),
      descripcion,
      rubro,
      proveedor: (f[COL['Proveedor']] || '').replace(/"/g, '').trim(),
      publico:   parsePrecio(f[COL['Publico']] || ''),
      oferta:    parsePrecio(f[COL['Oferta']]  || ''),
    });
  }
  console.log(dataRows.length + ' filas leidas del CSV');

  // ─── Agrupar en Productos Padre + Variantes ───────────────────────────────
  const grupos = new Map();

  for (const row of dataRows) {
    const { seccion, categoria, subcategoria, tipo } = mapRubro(row.rubro);
    const esTintura = categoria === 'Tinturas';
    const marca     = deducirMarca(row.descripcion);

    if (esTintura) {
      // Cada color es una variante de la misma linea de tintura
      const { base, colorCodigo, colorNombre } = extractColorTintura(row.descripcion);
      const lineaNorm = base || row.descripcion;
      // Usar la linea base + subcategoria como clave para diferenciar productos similares
      const key = (lineaNorm + '|' + subcategoria).toUpperCase();

      if (!grupos.has(key)) {
        grupos.set(key, {
          nombre: toTitleCase(lineaNorm),
          marca, seccion, categoria, subcategoria, tipo,
          proveedor: row.proveedor,
          variantes: [],
          esTintura: true,
        });
      }
      grupos.get(key).variantes.push({
        codigo:      row.codigo,
        nombre:      row.descripcion,
        vol:         colorCodigo ? ('N\u00b0 ' + colorCodigo) : '',
        colorNombre: colorNombre || '',
        publico:     row.publico,
        oferta:      row.oferta,
      });

    } else {
      // Agrupar por nombre base (sin volumen)
      const { base, vol } = extractVolume(row.descripcion);
      const key = (base + '|' + categoria).toUpperCase();

      if (!grupos.has(key)) {
        grupos.set(key, {
          nombre: toTitleCase(base),
          marca, seccion, categoria, subcategoria, tipo,
          proveedor: row.proveedor,
          variantes: [],
          esTintura: false,
        });
      }
      grupos.get(key).variantes.push({
        codigo:      row.codigo,
        nombre:      row.descripcion,
        vol:         vol || '',
        colorNombre: '',
        publico:     row.publico,
        oferta:      row.oferta,
      });
    }
  }

  const totalVariantes = [...grupos.values()].reduce((s, g) => s + g.variantes.length, 0);
  console.log('\n📊 Resultado del agrupamiento:');
  console.log('   ' + grupos.size + ' productos padre');
  console.log('   ' + totalVariantes + ' variantes totales');

  let nextProdId = GARNIER_BASE_PROD;
  let nextVarId  = GARNIER_BASE_VAR;
  console.log('IDs Producto desde: ' + nextProdId + ' | IDs Variante desde: ' + nextVarId);

  // ─── Crear Workbook ───────────────────────────────────────────────────────
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Marybe — Script Garnier';
  wb.created = new Date();

  // ════════════════════════════════════════════════
  // HOJA 1: PRODUCTOS
  // ════════════════════════════════════════════════
  const wsP = wb.addWorksheet('📦 Productos', {
    properties: { tabColor: { argb: C.violeta } },
    pageSetup:  { fitToPage: true, fitToWidth: 1, orientation: 'landscape' },
    views:      [{ state: 'frozen', xSplit: 0, ySplit: 3 }],
  });

  wsP.mergeCells('A1:R1');
  const titleP = wsP.getCell('A1');
  titleP.value = '📦 MARYBE — Productos Garnier (' + new Date().toLocaleDateString('es-AR') + ')';
  titleP.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.grisOscuro } };
  titleP.font  = { bold: true, color: { argb: C.blanco }, size: 14, name: 'Calibri' };
  titleP.alignment = { horizontal: 'center', vertical: 'middle' };
  wsP.getRow(1).height = 36;

  wsP.mergeCells('A2:R2');
  const instrP = wsP.getCell('A2');
  instrP.value = '⚠ Generado desde CSV Garnier — ' + grupos.size + ' productos | ' + totalVariantes + ' variantes. Precio del padre vacio cuando hay multiples variantes (el precio vive en cada variante). Tinturas: cada color es una variante.';
  applyStyle(instrP, noteStyle());
  wsP.getRow(2).height = 28;

  const colDefsP = [
    { header: 'ID Original *',    width: 14, group: 'base',   note: 'ID unico del producto' },
    { header: 'SKU / EAN',        width: 18, group: 'base',   note: 'Codigo EAN del primer variante' },
    { header: 'Nombre *',         width: 40, group: 'base',   note: 'Nombre del producto padre' },
    { header: 'Marca',            width: 16, group: 'base',   note: 'Marca comercial' },
    { header: 'Sección *',        width: 16, group: 'cat',    note: 'Perfumería o Hogar' },
    { header: 'Categoría',        width: 22, group: 'cat',    note: 'Shampoo, Tinturas, Cremas de Tratamiento, Maquillaje' },
    { header: 'Subcategoría',     width: 22, group: 'cat',    note: 'Ej: Acondicionadores, Coloracion' },
    { header: 'Tipo',             width: 22, group: 'cat',    note: 'Clasificacion adicional' },
    { header: 'Descripción',      width: 60, group: 'extra',  note: 'Descripcion del producto' },
    { header: 'Especificaciones', width: 50, group: 'extra',  note: 'Especificaciones tecnicas' },
    { header: 'Proveedor',        width: 28, group: 'extra',  note: 'Proveedor' },
    { header: 'Publicado',        width: 12, group: 'extra',  note: 'SI = visible | NO = oculto' },
    { header: 'Destacado',        width: 12, group: 'extra',  note: 'SI = destacado | NO = normal' },
    { header: 'Stock',            width: 12, group: 'extra',  note: 'Stock disponible' },
    { header: 'Características',  width: 40, group: 'extra',  note: 'Separadas por |' },
    { header: 'Precio *',         width: 16, group: 'precio', note: 'Precio de lista' },
    { header: 'Precio Oferta',    width: 16, group: 'precio', note: 'Precio con descuento' },
    { header: '% Descuento 🔒',  width: 14, group: 'precio', note: 'Calculado automaticamente' },
  ];
  wsP.columns = colDefsP.map(h => ({ width: h.width }));

  const rowHeaderP = wsP.getRow(3);
  colDefsP.forEach((h, i) => {
    const cell = rowHeaderP.getCell(i + 1);
    cell.value = h.header;
    const color = h.group === 'base' ? C.violeta
                : h.group === 'cat'   ? C.azul
                : h.group === 'precio'? C.verde
                : C.grisOscuro;
    applyStyle(cell, headerStyle(color));
    if (h.note) cell.note = { texts: [{ text: h.note }] };
  });
  rowHeaderP.height = 30;

  let rowIdxP = 3;
  const baseToId = new Map();

  for (const [key, grupo] of grupos) {
    rowIdxP++;
    const prodId = nextProdId++;
    baseToId.set(key, prodId);
    const isEven  = rowIdxP % 2 === 0;
    const bgColor = isEven ? C.blanco : C.grisClaro;

    const soloUna     = grupo.variantes.length === 1;
    const precioPadre = soloUna ? (grupo.variantes[0]?.publico ?? null) : null;
    const ofertaPadre = soloUna ? (grupo.variantes[0]?.oferta  ?? null) : null;
    const pctDesc     = soloUna ? calcDesc(precioPadre, ofertaPadre) : 0;
    const skuPadre    = grupo.variantes[0]?.codigo || '';

    const r = wsP.getRow(rowIdxP);
    r.height = 20;

    const valores = [
      String(prodId), skuPadre, grupo.nombre, grupo.marca,
      grupo.seccion, grupo.categoria, grupo.subcategoria, grupo.tipo || '',
      '', '', grupo.proveedor, 'SI', 'NO', 0, '',
    ];

    valores.forEach((val, ci) => {
      const cell = r.getCell(ci + 1);
      cell.value = ci === 0 ? String(val) : val;
      applyStyle(cell, dataStyle(bgColor));
      if (ci === 0) cell.numFmt = '@';
      if (ci >= 4 && ci <= 7) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isEven ? C.azulClaro : 'FFBFDBFE' } };
        cell.font = { color: { argb: '1E3A5F' }, size: 10, name: 'Calibri' };
      }
      if (ci === 11 || ci === 12) {
        cell.font = { bold: true, color: { argb: val === 'SI' ? '16A34A' : 'EF4444' }, size: 10 };
      }
    });

    const cP = r.getCell(16);
    if (precioPadre !== null) cP.value = precioPadre;
    applyStyle(cP, dataStyle(isEven ? C.verdeClaro : 'FFD1FAE5'));
    cP.font = { bold: true, color: { argb: '065F46' }, size: 10, name: 'Calibri' };
    cP.alignment = { vertical: 'middle', horizontal: 'right' };

    const cQ = r.getCell(17);
    if (ofertaPadre !== null) cQ.value = ofertaPadre;
    applyStyle(cQ, dataStyle(isEven ? C.verdeClaro : 'FFD1FAE5'));
    cQ.font = { bold: true, color: { argb: '065F46' }, size: 10, name: 'Calibri' };
    cQ.alignment = { vertical: 'middle', horizontal: 'right' };

    const cR = r.getCell(18);
    cR.value = pctDesc;
    applyStyle(cR, readonlyStyle());
    cR.font = { color: { argb: 'FF065F46' }, size: 10, name: 'Calibri', italic: true };
    cR.alignment = { vertical: 'middle', horizontal: 'center' };

    r.commit();
  }

  // ════════════════════════════════════════════════
  // HOJA 2: VARIANTES
  // ════════════════════════════════════════════════
  const wsV = wb.addWorksheet('🔗 Variantes', {
    properties: { tabColor: { argb: C.coral } },
    pageSetup:  { fitToPage: true, fitToWidth: 1, orientation: 'landscape' },
    views:      [{ state: 'frozen', xSplit: 0, ySplit: 3 }],
  });

  wsV.mergeCells('A1:L1');
  const titleV = wsV.getCell('A1');
  titleV.value = '🔗 MARYBE — Variantes Garnier';
  titleV.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7C3AED' } };
  titleV.font  = { bold: true, color: { argb: C.blanco }, size: 14, name: 'Calibri' };
  titleV.alignment = { horizontal: 'center', vertical: 'middle' };
  wsV.getRow(1).height = 36;

  wsV.mergeCells('A2:L2');
  const instrV = wsV.getCell('A2');
  instrV.value = '⚠ Una fila por variante. "ID Producto Padre" debe coincidir con "ID Original" en hoja Productos. Para tinturas: Volumen/Tamano = N° de color | Col 🎨 Color = nombre del tono con HEX en nota.';
  applyStyle(instrV, noteStyle());
  wsV.getRow(2).height = 28;

  const colDefsV = [
    { header: 'ID Variante *',            width: 16, color: C.coral,      note: 'ID unico de esta variante' },
    { header: 'ID Producto Padre *',      width: 18, color: C.coral,      note: 'Debe coincidir con ID Original de Productos' },
    { header: 'Nombre Producto Padre 🔒', width: 32, color: C.verde,      note: 'Calculado automaticamente (no editar)' },
    { header: 'SKU / EAN',               width: 20, color: C.grisOscuro, note: 'EAN de esta variante' },
    { header: 'Volumen / Tamaño',         width: 22, color: C.grisOscuro, note: 'Ej: X 200 ml | N° 20 para tinturas' },
    { header: 'Stock',                    width: 10, color: C.grisOscuro, note: 'Cantidad disponible' },
    { header: 'Precio *',                 width: 14, color: C.coral,      note: 'Precio de venta normal' },
    { header: 'Precio Oferta',            width: 16, color: C.grisOscuro, note: 'Precio con descuento' },
    { header: '% Descuento 🔒',          width: 14, color: C.verde,      note: 'Calculado desde Precio Oferta' },
    { header: 'Publicado',                width: 12, color: C.grisOscuro, note: 'SI = visible | NO = oculto' },
    { header: 'Envío',                    width: 10, color: C.grisOscuro, note: '1 = tiene envio' },
    { header: '🎨 Color',                width: 28, color: C.naranja,    note: 'Nombre del color. Para tinturas: tono del cabello. HEX sugerido en nota de celda.' },
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

  for (const [key, grupo] of grupos) {
    const prodId = baseToId.get(key);

    for (const v of grupo.variantes) {
      // Si tiene 1 sola variante y NO es tintura -> el precio vive en el padre, no exportamos variante
      if (grupo.variantes.length === 1 && !grupo.esTintura) continue;

      rowIdxV++;
      const varId   = nextVarId++;
      const isEven  = rowIdxV % 2 === 0;
      const bgColor = isEven ? C.blanco : 'FFFFF7ED';
      const pctDescV = calcDesc(v.publico, v.oferta);

      const r = wsV.getRow(rowIdxV);
      r.height = 20;

      const cA = r.getCell(1); cA.value = String(varId); applyStyle(cA, dataStyle(bgColor)); cA.numFmt = '@';
      const cB = r.getCell(2); cB.value = String(prodId); applyStyle(cB, dataStyle(bgColor)); cB.numFmt = '@';
      const cC = r.getCell(3);
      cC.value = {
        formula: 'IF(B' + rowIdxV + '<>"",IFERROR(VLOOKUP(B' + rowIdxV + ',\'📦 Productos\'!A:C,3,FALSE),IFERROR(VLOOKUP(B' + rowIdxV + '&"",\'📦 Productos\'!A:C,3,FALSE),IFERROR(VLOOKUP(VALUE(B' + rowIdxV + '),\'📦 Productos\'!A:C,3,FALSE),""))),"")',
      };
      applyStyle(cC, readonlyStyle());

      const cD = r.getCell(4); cD.value = v.codigo || ''; applyStyle(cD, dataStyle(bgColor)); cD.numFmt = '@';
      const cE = r.getCell(5); cE.value = v.vol || '';    applyStyle(cE, dataStyle(bgColor));
      const cF = r.getCell(6); cF.value = 0;              applyStyle(cF, dataStyle(bgColor)); cF.alignment = { vertical: 'middle', horizontal: 'center' };

      const cG = r.getCell(7);
      if (v.publico !== null) cG.value = v.publico;
      applyStyle(cG, dataStyle(bgColor));
      cG.font = { bold: true, color: { argb: C.grisOscuro }, size: 10, name: 'Calibri' };
      cG.alignment = { vertical: 'middle', horizontal: 'right' };

      const cH = r.getCell(8);
      if (v.oferta !== null) cH.value = v.oferta;
      applyStyle(cH, dataStyle(bgColor));
      cH.font = { bold: true, color: { argb: C.grisOscuro }, size: 10, name: 'Calibri' };
      cH.alignment = { vertical: 'middle', horizontal: 'right' };

      const cI = r.getCell(9); cI.value = pctDescV; applyStyle(cI, readonlyStyle());
      cI.font = { color: { argb: 'FF065F46' }, size: 10, name: 'Calibri', italic: true };
      cI.alignment = { vertical: 'middle', horizontal: 'center' };

      const cJ = r.getCell(10); cJ.value = 'SI'; applyStyle(cJ, dataStyle(bgColor));
      cJ.font = { bold: true, color: { argb: '16A34A' }, size: 10 }; cJ.alignment = { vertical: 'middle' };

      const cK = r.getCell(11); cK.value = '1'; applyStyle(cK, dataStyle(bgColor)); cK.alignment = { vertical: 'middle', horizontal: 'center' };

      const cL = r.getCell(12);
      cL.value = v.colorNombre || '';
      applyStyle(cL, dataStyle(bgColor));
      if (v.colorNombre) {
        const hex = buscarHexColor(v.colorNombre);
        if (hex) {
          cL.note = { texts: [{ text: 'HEX sugerido: ' + hex }] };
          cL.font = { bold: true, color: { argb: C.grisOscuro }, size: 10, name: 'Calibri' };
        }
      }

      r.commit();
    }
  }

  // ─── Guardar ──────────────────────────────────────────────────────────────
  const outDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  await wb.xlsx.writeFile(OUTPUT_PATH);

  const conMultiples = [...grupos.values()].filter(g => g.variantes.length > 1).length;
  const conUnica     = [...grupos.values()].filter(g => g.variantes.length <= 1).length;
  const tinturas     = [...grupos.values()].filter(g => g.esTintura).length;
  const varExportadas = rowIdxV - 3;

  console.log('\n✅ Excel generado exitosamente:');
  console.log('   Archivo:                ' + OUTPUT_PATH);
  console.log('   Productos totales:      ' + grupos.size);
  console.log('     - Multiples vars:     ' + conMultiples + ' (precio en variantes)');
  console.log('     - Variante unica:     ' + conUnica + ' (precio en padre)');
  console.log('     - Son tinturas:       ' + tinturas);
  console.log('   Variantes exportadas:   ' + varExportadas);
  console.log('   IDs Productos: ' + GARNIER_BASE_PROD + ' → ' + (nextProdId - 1));
  console.log('   IDs Variantes: ' + GARNIER_BASE_VAR  + ' → ' + (nextVarId  - 1));
}

main().catch(err => {
  console.error('Error fatal:', err.message);
  console.error(err.stack);
  process.exit(1);
});
