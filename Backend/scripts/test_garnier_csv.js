/**
 * test_garnier_csv.js
 * Test integral del script garnier_csv_to_excel.js
 *
 * Verifica:
 *   1. Funciones helper puras (parsePrecio, calcDesc, extractVolume, etc.)
 *   2. Mapeo de Rubro → Sección/Categoría/Subcategoría
 *   3. Encoding correcto de caracteres especiales (ñ, tildes)
 *   4. Agrupamiento correcto: variantes de tamaño y variantes de color (tinturas)
 *   5. El Excel generado tiene la estructura esperada:
 *        - Hoja "📦 Productos" con encabezados en fila 3
 *        - Hoja "🔗 Variantes" con encabezados en fila 3
 *        - IDs en rango 7000-7999 (productos) y 16000-16999 (variantes)
 *        - Precios en las columnas correctas
 *        - Colores de tinturas en Col L de Variantes
 *
 * Uso:  node Backend/scripts/test_garnier_csv.js
 */

'use strict';

const ExcelJS = require('exceljs');
const path    = require('path');
const fs      = require('fs');
const { execSync } = require('child_process');

// ─── Colores de consola ───────────────────────────────────────────────────────
const OK   = '\x1b[32m✅\x1b[0m';
const FAIL = '\x1b[31m❌\x1b[0m';
const INFO = '\x1b[36mℹ️ \x1b[0m';
const WARN = '\x1b[33m⚠️ \x1b[0m';

let passed = 0;
let failed = 0;

function assert(condition, description, extra = '') {
  if (condition) {
    console.log(`  ${OK} ${description}`);
    passed++;
  } else {
    console.log(`  ${FAIL} ${description}${extra ? ' → ' + extra : ''}`);
    failed++;
  }
}

function section(title) {
  console.log(`\n${'─'.repeat(55)}`);
  console.log(`📋 ${title}`);
  console.log('─'.repeat(55));
}

// ─── Extraer funciones helper de garnier_csv_to_excel.js ─────────────────────
// En lugar de hacer require() (que llama a main()), copiamos solo las funciones
// que necesitamos testear directamente.

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

function normRubro(rubro) {
  return (rubro || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x00-\x7F]/g, '')
    .trim()
    .toUpperCase();
}

function mapRubro(rubroOriginal) {
  const seccion = 'Perfumería';
  const r = normRubro(rubroOriginal);
  const partes = r.split('-').map(p => p.trim());
  const primero = partes[0];

  if (primero === 'SHAMPOO') {
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
  return { seccion, categoria: toTitleCase(r), subcategoria: '', tipo: '' };
}

function extractVolume(nombre) {
  if (!nombre) return { base: nombre, vol: null };
  const matchX = nombre.match(/^(.*?)\s+X\s*(\d[\d.,]*\s*(?:ml|g|gr|oz|L|l|kg|ML|G).*?)\s*$/i);
  if (matchX) return { base: matchX[1].trim(), vol: ('X ' + matchX[2].trim()).replace(/\s+/g, ' ') };
  const matchNum = nombre.match(/^(.*?)\s+(\d+(?:[.,]\d+)?\s*(?:ml|g|gr|oz|L|l|kg|ML))\s*$/i);
  if (matchNum) return { base: matchNum[1].trim(), vol: matchNum[2].trim() };
  return { base: nombre.trim(), vol: null };
}

function extractColorTintura(nombre) {
  if (!nombre) return { base: nombre, colorCodigo: null, colorNombre: null };
  const match = nombre.match(
    /^(.*?(?:COLORACION|COLORACION\s+S\/AMONIACO\s+OLEOS|COR INTENSA|COLOR))\s+([\d]+(?:[.\s][\d]+)?[A-Z]?)\s+(.+)$/i
  );
  if (match) {
    return {
      base:        match[1].trim(),
      colorCodigo: match[2].trim().replace(/\s+/g, '.'),
      colorNombre: toTitleCase(match[3].trim()),
    };
  }
  return { base: nombre, colorCodigo: null, colorNombre: null };
}

// ─── 1. Tests de helpers ──────────────────────────────────────────────────────
section('1. HELPERS — parsePrecio');
assert(parsePrecio('"5.490,00"') === 5490,        'parsePrecio con comillas y formato ES: "5.490,00" → 5490');
assert(parsePrecio('"7.990,00"') === 7990,        'parsePrecio: "7.990,00" → 7990');
assert(parsePrecio('"21.990,00"') === 21990,      'parsePrecio: "21.990,00" → 21990');
assert(parsePrecio('') === null,                  'parsePrecio: vacío → null');
assert(parsePrecio(null) === null,                'parsePrecio: null → null');
assert(parsePrecio('"14.293,50"') === 14293.50,   'parsePrecio con decimal: "14.293,50" → 14293.5');

section('2. HELPERS — calcDesc');
assert(calcDesc(21990, 14293.50) === 35,     'calcDesc: 21990 / 14293.50 → 35%');
assert(calcDesc(16490, 11543)   === 30,      'calcDesc: 16490 / 11543 → 30%');
assert(calcDesc(0, 5000)        === 0,       'calcDesc: precio 0 → 0%');
assert(calcDesc(null, 5000)     === 0,       'calcDesc: precio null → 0%');
assert(calcDesc(5000, null)     === 0,       'calcDesc: oferta null → 0%');

section('3. HELPERS — normRubro (encoding)');
// En el CSV el campo tiene "TINTURAS-DECOLORACIÓN" correctamente en UTF-8
assert(normRubro('TINTURAS-DECOLORACIÓN') === 'TINTURAS-DECOLORACION', 'normRubro: TINTURAS-DECOLORACIÓN → TINTURAS-DECOLORACION');
assert(normRubro('SHAMPOO-ACO-BC') === 'SHAMPOO-ACO-BC',             'normRubro: SHAMPOO-ACO-BC sin cambios');
assert(normRubro('CREMAS DE TRATAMIENTO') === 'CREMAS DE TRATAMIENTO','normRubro: CREMAS DE TRATAMIENTO sin cambios');
assert(normRubro('MAQUILLAJE') === 'MAQUILLAJE',                      'normRubro: MAQUILLAJE sin cambios');

section('4. HELPERS — mapRubro');
const r1 = mapRubro('SHAMPOO-ACO-BC');
assert(r1.categoria === 'Shampoo',        'mapRubro SHAMPOO-ACO-BC → categoria Shampoo');
assert(r1.seccion   === 'Perfumería',     'mapRubro SHAMPOO-ACO-BC → seccion Perfumería');
assert(r1.subcategoria.length > 0,        'mapRubro SHAMPOO-ACO-BC → subcategoria no vacía');

const r2 = mapRubro('CREMAS DE TRATAMIENTO');
assert(r2.categoria === 'Cremas de Tratamiento', 'mapRubro CREMAS DE TRATAMIENTO → categoria ok');
assert(r2.subcategoria === '',                   'mapRubro CREMAS DE TRATAMIENTO → subcategoria vacía');

const r3 = mapRubro('TINTURAS-DECOLORACIÓN');
assert(r3.categoria   === 'Tinturas',     'mapRubro TINTURAS-DECOLORACIÓN → categoria Tinturas');
assert(r3.subcategoria.length > 0,        'mapRubro TINTURAS-DECOLORACIÓN → subcategoria no vacía');

const r4 = mapRubro('MAQUILLAJE');
assert(r4.categoria   === 'Maquillaje',   'mapRubro MAQUILLAJE → categoria Maquillaje');

section('5. HELPERS — extractVolume');
const v1 = extractVolume('FRUCTIS ACONDICIONADOR ALOE HIDRA CLEAN X 200 ML');
assert(v1.base === 'FRUCTIS ACONDICIONADOR ALOE HIDRA CLEAN', 'extractVolume: base correcta (X 200 ML)');
assert(v1.vol  === 'X 200 ML',                                'extractVolume: vol correcta (X 200 ML)');

const v2 = extractVolume('FRUCTIS ACONDICIONADOR LISO COCO X350 ML');
assert(v2.base === 'FRUCTIS ACONDICIONADOR LISO COCO',        'extractVolume: base correcta (X350 ML)');
assert(v2.vol  === 'X 350 ML',                                'extractVolume: vol normalizada a "X 350 ML"');

const v3 = extractVolume('GARNIER AGUA MICELAR SKIN ACTIVE X400 ML');
assert(v3.base === 'GARNIER AGUA MICELAR SKIN ACTIVE',        'extractVolume: base correcta (X400 ML)');
assert(v3.vol  === 'X 400 ML',                                'extractVolume: vol correcta (X400 ML)');

const v4 = extractVolume('GARNIER CONTORNO DE OJOS CON VITAMINA C');
assert(v4.base === 'GARNIER CONTORNO DE OJOS CON VITAMINA C', 'extractVolume: sin volumen → base completa');
assert(v4.vol  === null,                                      'extractVolume: sin volumen → vol null');

const v5 = extractVolume('GARNIER HIDRATANTE TOQUE SECO SALICILICO X85 G');
assert(v5.vol !== null,                                        'extractVolume: "X85 G" detectado');

section('6. HELPERS — extractColorTintura');
const c1 = extractColorTintura('NUTRISSE COLORACION 20 GROSELLA NEGRA');
assert(c1.base        === 'NUTRISSE COLORACION',   'extractColorTintura: base "NUTRISSE COLORACION"');
assert(c1.colorCodigo === '20',                    'extractColorTintura: código "20"');
assert(c1.colorNombre === 'Grosella Negra',        'extractColorTintura: color "Grosella Negra"');

const c2 = extractColorTintura('GARNIER COR INTENSA 4.0 CASTAÑO');
assert(c2.base        === 'GARNIER COR INTENSA',   'extractColorTintura: base "GARNIER COR INTENSA"');
assert(c2.colorCodigo === '4.0',                   'extractColorTintura: código "4.0"');
assert(c2.colorNombre === 'Castaño',               'extractColorTintura: color "Castaño"');

const c3 = extractColorTintura('NUTRISSE COLORACION S/AMONIACO OLEOS 7 RUBIO');
assert(c3.colorCodigo === '7',                     'extractColorTintura S/AMONIACO OLEOS: código "7"');
assert(c3.colorNombre === 'Rubio',                 'extractColorTintura S/AMONIACO OLEOS: color "Rubio"');

const c4 = extractColorTintura('NUTRISSE COLORACION 10.13 MARACUYA RUBIO ULTRA CLARO CENIZA DORADO');
assert(c4.colorCodigo === '10.13',                 'extractColorTintura: código con punto "10.13"');
assert(c4.colorNombre && c4.colorNombre.length > 0,'extractColorTintura: color extraído para 10.13');

section('7. ENCODING — Caracteres especiales (ñ, tildes)');
// Verificar que el nombre con Ñ se extrae correctamente
const vDanios = extractVolume('FRUCTIS ACONDICIONADOR GOODBYE DAÑOS OIL CONTROL X200 ML');
assert(vDanios.base === 'FRUCTIS ACONDICIONADOR GOODBYE DAÑOS OIL CONTROL', 'Ñ en base: DAÑOS correctamente preservada');
assert(vDanios.vol  === 'X 200 ML',                                         'Ñ en base: vol correctamente separada');

const vDanios350 = extractVolume('FRUCTIS ACONDICIONADOR GOODBYE DAÑOS OIL CONTROL X350 ML');
assert(vDanios350.base === 'FRUCTIS ACONDICIONADOR GOODBYE DAÑOS OIL CONTROL', 'Ñ preservada en X350 ML variante');

// Nombre del producto padre debería ser idéntico para ambos tamaños (para agruparlos)
assert(vDanios.base === vDanios350.base, 'Ambos tamaños de DAÑOS tienen la misma base (se agruparán como variantes)');

section('8. AGRUPAMIENTO — Leer CSV y verificar grupos');
const csvPath = path.join(__dirname, '../../Frontend/GARNIER PAGINA - 290726 1017.csv');
if (!fs.existsSync(csvPath)) {
  console.log(`  ${WARN} CSV no encontrado en ${csvPath} — omitiendo tests de CSV`);
} else {
  const csvRaw = fs.readFileSync(csvPath, 'utf8');

  // Parser mínimo inline
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

  const rows = parseCSV(csvRaw);
  let headerIdx = -1;
  for (let i = 0; i < rows.length; i++) {
    if ((rows[i][0] || '').trim() === 'Codigo') { headerIdx = i; break; }
  }

  assert(headerIdx !== -1, 'CSV: fila de encabezado encontrada (Codigo)');

  const headers = rows[headerIdx];
  const COL = {};
  headers.forEach((h, i) => { COL[h.trim()] = i; });
  assert('Codigo' in COL && 'Descripcion' in COL && 'Rubro' in COL, 'CSV: columnas Codigo, Descripcion, Rubro presentes');
  assert('Publico' in COL,                                           'CSV: columna Publico presente');
  assert('Oferta'  in COL,                                           'CSV: columna Oferta presente');

  const dataRows = [];
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const f = rows[i];
    if (!f || f.length < 4) continue;
    const descripcion = (f[COL['Descripcion']] || '').replace(/"/g, '').trim();
    if (!descripcion) continue;
    const rubro = (f[COL['Rubro']] || '').replace(/"/g, '').trim();
    if (!rubro) continue;
    dataRows.push({
      codigo:      (f[COL['Codigo']]    || '').replace(/"/g, '').trim(),
      descripcion,
      rubro,
      publico:     parsePrecio(f[COL['Publico']] || ''),
      oferta:      parsePrecio(f[COL['Oferta']]  || ''),
    });
  }

  assert(dataRows.length >= 100,     `CSV: se leyeron ${dataRows.length} filas (esperado ≥ 100)`);
  assert(dataRows.length === 153,    `CSV: exactamente 153 filas de datos`);

  // Verificar encoding de ñ en descripción
  const daniosRows = dataRows.filter(r => r.descripcion.includes('DAÑOS'));
  assert(daniosRows.length > 0, `CSV: filas con "DAÑOS" encontradas (${daniosRows.length}) — encoding UTF-8 ok`);

  // Verificar rubros presentes
  const rubros = new Set(dataRows.map(r => normRubro(r.rubro)));
  assert(rubros.has('SHAMPOO-ACO-BC'),          'CSV: rubro SHAMPOO-ACO-BC presente');
  assert(rubros.has('CREMAS DE TRATAMIENTO'),   'CSV: rubro CREMAS DE TRATAMIENTO presente');
  assert([...rubros].some(r => r.includes('TINTURAS')), 'CSV: rubro TINTURAS presente');
  assert(rubros.has('MAQUILLAJE'),              'CSV: rubro MAQUILLAJE presente');

  // Agrupar
  function deducirMarca(d) {
    const u = d.toUpperCase();
    if (u.startsWith('FRUCTIS'))  return 'Garnier Fructis';
    if (u.startsWith('NUTRISSE')) return 'Garnier Nutrisse';
    return 'Garnier';
  }

  const grupos = new Map();
  for (const row of dataRows) {
    const { seccion, categoria } = mapRubro(row.rubro);
    const esTintura = categoria === 'Tinturas';
    const marca = deducirMarca(row.descripcion);

    if (esTintura) {
      const { base, colorCodigo, colorNombre } = extractColorTintura(row.descripcion);
      const lineaNorm = base || row.descripcion;
      const key = (lineaNorm + '|' + row.rubro).toUpperCase();
      if (!grupos.has(key)) grupos.set(key, { nombre: toTitleCase(lineaNorm), marca, categoria, variantes: [], esTintura: true });
      grupos.get(key).variantes.push({ colorNombre: colorNombre || '', publico: row.publico, oferta: row.oferta });
    } else {
      const { base, vol } = extractVolume(row.descripcion);
      const key = (base + '|' + categoria).toUpperCase();
      if (!grupos.has(key)) grupos.set(key, { nombre: toTitleCase(base), marca, categoria, variantes: [], esTintura: false });
      grupos.get(key).variantes.push({ vol: vol || '', publico: row.publico, oferta: row.oferta });
    }
  }

  assert(grupos.size > 0,                      `CSV: ${grupos.size} grupos creados`);
  assert(grupos.size === 70,                   `CSV: exactamente 70 productos padre`);

  const tinturas = [...grupos.values()].filter(g => g.esTintura);
  assert(tinturas.length > 0,                  `CSV: ${tinturas.length} líneas de tintura detectadas`);

  const totalVars = [...grupos.values()].reduce((s, g) => s + g.variantes.length, 0);
  assert(totalVars === dataRows.length,         `CSV: total variantes = total filas CSV (${totalVars})`);

  // Producto con ñ agrupado correctamente
  const daniosKey = [...grupos.keys()].find(k => k.includes('DA') && k.includes('OS OIL CONTROL'));
  assert(daniosKey !== undefined, 'AGRUPAMIENTO: "FRUCTIS ... DAÑOS OIL CONTROL" agrupado como 1 producto padre');
  if (daniosKey) {
    const daniosGrupo = grupos.get(daniosKey);
    assert(daniosGrupo.variantes.length >= 2, `AGRUPAMIENTO: DAÑOS OIL CONTROL tiene ${daniosGrupo.variantes.length} variantes de tamaño`);
    assert(daniosGrupo.nombre.includes('Daños') || daniosGrupo.nombre.includes('Danos'),
      'AGRUPAMIENTO: nombre del grupo DAÑOS contiene la palabra correctamente');
  }

  // Tinturas: cada tintura tiene variantes de color
  const nutrisse = [...grupos.values()].find(g => g.nombre.includes('Nutrisse Coloracion') || g.nombre.toLowerCase().includes('nutrisse coloracion'));
  if (nutrisse) {
    assert(nutrisse.variantes.length >= 10, `TINTURAS: Nutrisse Coloracion tiene ${nutrisse.variantes.length} colores (esperado ≥ 10)`);
    const conColor = nutrisse.variantes.filter(v => v.colorNombre && v.colorNombre.length > 0);
    assert(conColor.length > 0, `TINTURAS: variantes de Nutrisse tienen colorNombre asignado (${conColor.length})`);
  }
}

section('9. EXCEL GENERADO — Estructura y datos');
const excelPath = path.join(__dirname, '../data/Productos_Garnier_Marybe.xlsx');
if (!fs.existsSync(excelPath)) {
  console.log(`  ${WARN} Excel no encontrado. Generando...`);
  try {
    execSync('node ' + path.join(__dirname, 'garnier_csv_to_excel.js'), { stdio: 'pipe' });
  } catch (e) {
    console.log(`  ${FAIL} Error al generar Excel: ${e.message}`);
    failed++;
  }
}

if (fs.existsSync(excelPath)) {
  const wb = new ExcelJS.Workbook();
  wb.xlsx.readFile(excelPath).then(() => {

    const wsP = wb.getWorksheet('📦 Productos');
    const wsV = wb.getWorksheet('🔗 Variantes');

    assert(wsP !== null && wsP !== undefined, 'EXCEL: hoja "📦 Productos" existe');
    assert(wsV !== null && wsV !== undefined, 'EXCEL: hoja "🔗 Variantes" existe');

    if (wsP) {
      // Encabezados en fila 3
      const hRow = wsP.getRow(3);
      assert(hRow.getCell(1).value === 'ID Original *',    'EXCEL Productos: Col A = "ID Original *"');
      assert(hRow.getCell(3).value === 'Nombre *',         'EXCEL Productos: Col C = "Nombre *"');
      assert(hRow.getCell(5).value === 'Sección *',        'EXCEL Productos: Col E = "Sección *"');
      assert(hRow.getCell(6).value === 'Categoría',        'EXCEL Productos: Col F = "Categoría"');
      assert(hRow.getCell(16).value === 'Precio *',        'EXCEL Productos: Col P = "Precio *"');
      assert(hRow.getCell(17).value === 'Precio Oferta',   'EXCEL Productos: Col Q = "Precio Oferta"');

      // IDs en rango 7000-7999
      let idMin = Infinity, idMax = -Infinity, filasDatos = 0;
      let rowsConDatos = [];
      wsP.eachRow((row, r) => {
        if (r <= 3) return;
        const idVal = row.getCell(1).value;
        if (!idVal) return;
        const id = parseInt(String(idVal));
        if (!isNaN(id)) { idMin = Math.min(idMin, id); idMax = Math.max(idMax, id); }
        filasDatos++;
        rowsConDatos.push({ r, id, nombre: row.getCell(3).value, cat: row.getCell(6).value, precio: row.getCell(16).value });
      });

      assert(filasDatos === 70,                       `EXCEL Productos: 70 filas de datos (encontradas: ${filasDatos})`);
      assert(idMin >= 7000,                           `EXCEL Productos: ID mínimo ${idMin} ≥ 7000`);
      assert(idMax <= 7999,                           `EXCEL Productos: ID máximo ${idMax} ≤ 7999`);

      // Verificar categorías presentes
      const cats = new Set(rowsConDatos.map(r => r.cat).filter(Boolean));
      assert(cats.has('Shampoo'),                     'EXCEL Productos: categoría "Shampoo" presente');
      assert(cats.has('Tinturas'),                    'EXCEL Productos: categoría "Tinturas" presente');
      assert(cats.has('Cremas de Tratamiento'),       'EXCEL Productos: categoría "Cremas de Tratamiento" presente');
      assert(cats.has('Maquillaje'),                  'EXCEL Productos: categoría "Maquillaje" presente');

      // Verificar que los productos padre con múltiples variantes NO tienen precio en el padre
      const conMultiplesVars = rowsConDatos.filter(r => {
        // Detectamos si tiene múltiples variantes mirando si el precio está vacío
        return r.precio === null || r.precio === undefined || r.precio === '';
      });
      assert(conMultiplesVars.length > 0, `EXCEL Productos: ${conMultiplesVars.length} padres sin precio (correcto: tienen variantes)`);

      // Verificar nombre con Ñ en el Excel
      const conDanios = rowsConDatos.find(r => (r.nombre || '').includes('Daños'));
      assert(conDanios !== undefined, 'EXCEL Productos: "Daños" (con Ñ) guardado correctamente en nombre del producto');
    }

    if (wsV) {
      const hRowV = wsV.getRow(3);
      assert(hRowV.getCell(1).value === 'ID Variante *',           'EXCEL Variantes: Col A = "ID Variante *"');
      assert(hRowV.getCell(2).value === 'ID Producto Padre *',     'EXCEL Variantes: Col B = "ID Producto Padre *"');
      assert(hRowV.getCell(5).value === 'Volumen / Tamaño',        'EXCEL Variantes: Col E = "Volumen / Tamaño"');
      assert(hRowV.getCell(7).value === 'Precio *',                'EXCEL Variantes: Col G = "Precio *"');
      assert(hRowV.getCell(12).value === '🎨 Color',              'EXCEL Variantes: Col L = "🎨 Color"');

      // IDs en rango 16000-16999
      let varIdMin = Infinity, varIdMax = -Infinity, varFilas = 0;
      let varConColor = 0;
      wsV.eachRow((row, r) => {
        if (r <= 3) return;
        const idVal = row.getCell(1).value;
        if (!idVal) return;
        const id = parseInt(String(idVal));
        if (!isNaN(id)) { varIdMin = Math.min(varIdMin, id); varIdMax = Math.max(varIdMax, id); }
        const colorVal = row.getCell(12).value;
        if (colorVal && String(colorVal).trim()) varConColor++;
        varFilas++;
      });

      assert(varFilas === 105,                        `EXCEL Variantes: 105 filas de variantes (encontradas: ${varFilas})`);
      assert(varIdMin >= 16000,                       `EXCEL Variantes: ID mínimo ${varIdMin} ≥ 16000`);
      assert(varIdMax <= 16999,                       `EXCEL Variantes: ID máximo ${varIdMax} ≤ 16999`);
      assert(varConColor > 0,                         `EXCEL Variantes: ${varConColor} variantes con color asignado (tinturas)`);

      // Las variantes de tamaño tienen 'X NNN' en vol (col E)
      let varConVol = 0;
      wsV.eachRow((row, r) => {
        if (r <= 3) return;
        const vol = row.getCell(5).value;
        if (vol && String(vol).toUpperCase().startsWith('X ')) varConVol++;
      });
      assert(varConVol > 0, `EXCEL Variantes: ${varConVol} variantes con tamaño "X NNN ml" en col E`);

      // Precios no nulos en variantes con múltiples opciones
      let varSinPrecio = 0;
      wsV.eachRow((row, r) => {
        if (r <= 3) return;
        const precio = row.getCell(7).value;
        if (!precio && precio !== 0) varSinPrecio++;
      });
      assert(varSinPrecio === 0, `EXCEL Variantes: todas las variantes tienen precio (${varSinPrecio} sin precio)`);
    }

    // ─── Resumen ──────────────────────────────────────────────────────────────
    console.log('\n' + '═'.repeat(55));
    console.log(`📊 RESULTADO FINAL`);
    console.log('═'.repeat(55));
    console.log(`  ${OK} Pasados: ${passed}`);
    if (failed > 0) {
      console.log(`  ${FAIL} Fallados: ${failed}`);
      console.log(`\n  ${WARN} Algunos tests fallaron. Revisá los detalles arriba.`);
    } else {
      console.log(`\n  🎉 TODOS LOS TESTS PASARON`);
    }
    console.log('═'.repeat(55) + '\n');

    process.exit(failed > 0 ? 1 : 0);

  }).catch(err => {
    console.error(`\n${FAIL} Error leyendo el Excel: ${err.message}`);
    process.exit(1);
  });

} else {
  // Sin Excel no podemos correr los tests de sección 9
  console.log(`  ${WARN} Tests de Excel omitidos (archivo no disponible).`);

  console.log('\n' + '═'.repeat(55));
  console.log(`📊 RESULTADO FINAL`);
  console.log('═'.repeat(55));
  console.log(`  ${OK} Pasados: ${passed}`);
  if (failed > 0) console.log(`  ${FAIL} Fallados: ${failed}`);
  else console.log(`\n  🎉 TODOS LOS TESTS PASARON`);
  console.log('═'.repeat(55) + '\n');
  process.exit(failed > 0 ? 1 : 0);
}
