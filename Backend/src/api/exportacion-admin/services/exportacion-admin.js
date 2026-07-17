'use strict';

const ExcelJS = require('exceljs');

// ─── Constantes ───────────────────────────────────────────────────────────────
const UID_PRODUCTO = 'api::producto.producto';
const PAGE_SIZE    = 100;

const {
  TAXONOMY,
  SECCIONES,
  COLORES,
  C,
  headerStyle,
  dataStyle,
  noteStyle,
  readonlyStyle,
  applyStyle,
} = require('../../../utils/excel-utils');

// ─── Helpers de datos ─────────────────────────────────────────────────────────
function boolStr(val) {
  return val === true || val === 1 || String(val).toLowerCase() === 'true' || String(val).toLowerCase() === 'si' ? 'SI' : 'NO';
}

function safeNum(val) {
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

function calcPct(precio, precioOferta, descuentoExplicito) {
  if (descuentoExplicito && descuentoExplicito > 0) return descuentoExplicito;
  if (precio && precioOferta && precio > 0 && precioOferta < precio) {
    return Math.round(((precio - precioOferta) / precio) * 100);
  }
  return 0;
}

// ─── Helpers para Named Ranges ────────────────────────────────────────────────
/**
 * Convierte índice de columna (1-based) a letra(s) Excel (A, B, ... Z, AA...)
 */
function colLetter(n) {
  let r = '';
  while (n > 0) {
    n--;
    r = String.fromCharCode(65 + (n % 26)) + r;
    n = Math.floor(n / 26);
  }
  return r;
}

/**
 * Crea la hoja "Listas" con todas las listas de selección.
 * En vez de depender de named ranges (que ExcelJS no resuelve bien en
 * data-validation), devuelve un objeto `refs` con las referencias
 * directas a celdas que se usan en las fórmulas de validación.
 *
 * Retorna: { secciones, categorias, booleanos, colores, mapeoRangos }
 *   donde cada valor es un string como "Listas!$A$2:$A$3"
 */
function construirHojaListas(wb) {
  const wsL = wb.addWorksheet('Listas');
  let col = 1;

  // Mapa de rangos directos para la cascada (KEY → rango explícito)
  const rangoDirecto = {};
  // Rango dummy para combos sin opciones
  let sinOpcionesRef = '';

  // ── 1. Secciones ─────────────────────────────────────────────────────────
  wsL.getCell(1, col).value = '_SECCIONES';
  SECCIONES.forEach((s, i) => { wsL.getCell(i + 2, col).value = s; });
  const secLtr = colLetter(col);
  const seccionesRef = `Listas!$${secLtr}$2:$${secLtr}$${SECCIONES.length + 1}`;
  col++;

  // ── 2. Categorías ─────────────────────────────────────────────────────────
  const categorias = Object.keys(TAXONOMY);
  wsL.getCell(1, col).value = '_CATEGORIAS';
  categorias.forEach((c, i) => { wsL.getCell(i + 2, col).value = c; });
  const catLtr = colLetter(col);
  const categoriasRef = `Listas!$${catLtr}$2:$${catLtr}$${categorias.length + 1}`;
  col++;

  // ── 3. Subcategorías por cada Categoría ───────────────────────────────────
  for (const [catName, subcats] of Object.entries(TAXONOMY)) {
    const subcatList = Object.keys(subcats);
    if (subcatList.length === 0) continue;

    wsL.getCell(1, col).value = `_${catName}`;
    subcatList.forEach((s, i) => { wsL.getCell(i + 2, col).value = s; });

    const ltr = colLetter(col);
    // Guardar referencia directa: KEY = catName → rango de subcategorías
    rangoDirecto[catName] = `Listas!$${ltr}$2:$${ltr}$${subcatList.length + 1}`;
    col++;
  }

  // ── 4. Tipos por cada (Categoría + Subcategoría) ──────────────────────────
  for (const [catName, subcats] of Object.entries(TAXONOMY)) {
    for (const [subName, tipos] of Object.entries(subcats)) {
      if (!tipos || tipos.length === 0) continue;

      wsL.getCell(1, col).value = `_${catName}_${subName}`;
      tipos.forEach((t, i) => { wsL.getCell(i + 2, col).value = t; });

      const ltr = colLetter(col);
      // Guardar referencia directa: KEY = catName_subName → rango de tipos
      rangoDirecto[`${catName}_${subName}`] = `Listas!$${ltr}$2:$${ltr}$${tipos.length + 1}`;
      col++;
    }
  }

  // ── 5. Colores ─────────────────────────────────────────────────────────
  wsL.getCell(1, col).value = '_COLORES';
  COLORES.forEach((c, i) => { wsL.getCell(i + 2, col).value = c; });
  const coloresLtr = colLetter(col);
  const coloresRef = `Listas!$${coloresLtr}$2:$${coloresLtr}$${COLORES.length + 1}`;
  col++;

  // ── (dummy) rango para combos sin opciones ──────────
  wsL.getCell(1, col).value = '_SIN_OPCIONES';
  wsL.getCell(2, col).value = '';
  const noOptLtr = colLetter(col);
  sinOpcionesRef = `Listas!$${noOptLtr}$2:$${noOptLtr}$2`;
  col++;

  // ── 6. Tabla de mapeo para VLOOKUP ────────────────────────────────────────
  // KEY = nombre de categoría o "catName_subName"
  // VALUE = referencia directa a celdas (ej: Listas!$C$2:$C$5)
  // INDIRECT resuelve estas referencias directamente, sin named ranges.
  const mapColKey = col;
  const mapColVal = col + 1;
  let mapRow = 1;
  wsL.getCell(mapRow, mapColKey).value = 'KEY';
  wsL.getCell(mapRow, mapColVal).value = 'RANGO_DIRECTO';
  mapRow++;

  for (const [catName, subcats] of Object.entries(TAXONOMY)) {
    // Para categoría → rango de subcategorías
    wsL.getCell(mapRow, mapColKey).value = catName;
    wsL.getCell(mapRow, mapColVal).value = rangoDirecto[catName] || sinOpcionesRef;
    mapRow++;

    // Para subcategorías → rango de tipos
    for (const [subName] of Object.entries(subcats)) {
      const key = `${catName}_${subName}`;
      wsL.getCell(mapRow, mapColKey).value = key;
      wsL.getCell(mapRow, mapColVal).value = rangoDirecto[key] || sinOpcionesRef;
      mapRow++;
    }
  }

  // Referencia directa a la tabla de mapeo (para VLOOKUP)
  const keyLtr = colLetter(mapColKey);
  const valLtr = colLetter(mapColVal);
  const mapeoRef = `Listas!$${keyLtr}$2:$${valLtr}$${mapRow - 1}`;
  col += 2;

  // ── 7. Opciones Booleanas (SI / NO) ─────────────────────────────────────
  wsL.getCell(1, col).value = '_BOOLEANOS';
  wsL.getCell(2, col).value = 'SI';
  wsL.getCell(3, col).value = 'NO';
  const boolLtr = colLetter(col);
  const booleanosRef = `Listas!$${boolLtr}$2:$${boolLtr}$3`;
  col++;

  // Retornar todas las referencias directas
  return {
    secciones:    seccionesRef,
    categorias:   categoriasRef,
    booleanos:    booleanosRef,
    colores:      coloresRef,
    mapeoRangos:  mapeoRef,
    sinOpciones:  sinOpcionesRef,
    // Para los defaults de INDIRECT
    defaultSubcat: rangoDirecto['Dermocosmetica'] || sinOpcionesRef,
    defaultTipo:   rangoDirecto['Dermocosmetica_Cuidado_facial'] || sinOpcionesRef,
    // Mapa completo por si se necesita
    rangos:       rangoDirecto,
  };
}

/**
 * Aplica validación en cascada a una fila de la hoja Productos.
 * E(5)=Sección, F(6)=Categoría, G(7)=Subcategoría, H(8)=Tipo
 *
 * @param {Worksheet} ws  Hoja de productos
 * @param {number} rowIndex  Índice de fila (1-based)
 * @param {object} refs  Referencias directas retornadas por construirHojaListas
 */
function aplicarValidacionFila(ws, rowIndex, refs) {
  // E: Sección (lista fija: Perfumería / Hogar)
  ws.getCell(`E${rowIndex}`).dataValidation = {
    type: 'list', allowBlank: true, showErrorMessage: false,
    formulae: [refs.secciones],
  };
  // F (col 6): Categoría — referencia directa a la columna de categorías
  ws.getCell(`F${rowIndex}`).dataValidation = {
    type: 'list',
    allowBlank: true,
    showErrorMessage: false,
    formulae: [refs.categorias],
  };

  // G (col 7): Subcategoría (cascada basada en F)
  // Usamos la columna oculta AA (27) que devuelve una referencia directa a celdas
  ws.getCell(`G${rowIndex}`).dataValidation = {
    type: 'list',
    allowBlank: true,
    showErrorMessage: false,
    formulae: [`INDIRECT($AA${rowIndex})`],
  };

  // H (col 8): Tipo (cascada basada en G)
  // Usamos la columna oculta AB (28)
  ws.getCell(`H${rowIndex}`).dataValidation = {
    type: 'list',
    allowBlank: true,
    showErrorMessage: false,
    formulae: [`INDIRECT($AB${rowIndex})`],
  };

  // ── Columnas ocultas AA y AB ──────────────────────────────────────────────
  // VLOOKUP busca la categoría/subcategoría en la tabla de mapeo y devuelve
  // la referencia directa a celdas (ej: "Listas!$C$2:$C$5").
  // INDIRECT resuelve esa referencia como rango de celdas.
  const valF = ws.getCell(`F${rowIndex}`).value || '';
  const valG = ws.getCell(`G${rowIndex}`).value || '';

  // Result cacheado: referencia directa (no nombre de rango)
  const resAA = (valF && refs.rangos[valF]) ? refs.rangos[valF] : refs.defaultSubcat;
  const keyAB = valF && valG ? `${valF}_${valG}` : '';
  const resAB = (keyAB && refs.rangos[keyAB]) ? refs.rangos[keyAB] : refs.defaultTipo;

  const cAA = ws.getCell(`AA${rowIndex}`);
  cAA.value = {
    formula: `IF(F${rowIndex}="","${refs.defaultSubcat}",VLOOKUP(F${rowIndex},${refs.mapeoRangos},2,FALSE))`,
    result: resAA,
  };
  const cAB = ws.getCell(`AB${rowIndex}`);
  cAB.value = {
    formula: `IF(G${rowIndex}="","${refs.defaultTipo}",VLOOKUP(F${rowIndex}&"_"&G${rowIndex},${refs.mapeoRangos},2,FALSE))`,
    result: resAB,
  };

  // L (col 12): Publicado
  ws.getCell(`L${rowIndex}`).dataValidation = {
    type: 'list',
    allowBlank: true,
    showErrorMessage: false,
    formulae: [refs.booleanos],
  };

  // M (col 13): Destacado
  ws.getCell(`M${rowIndex}`).dataValidation = {
    type: 'list',
    allowBlank: true,
    showErrorMessage: false,
    formulae: [refs.booleanos],
  };
}

/**
 * Aplica validación a una fila de la hoja Variantes.
 */
function aplicarValidacionVariante(ws, rowIndex, refs) {
  // J (col 10): Publicado
  ws.getCell(`J${rowIndex}`).dataValidation = {
    type: 'list',
    allowBlank: true,
    showErrorMessage: false,
    formulae: [refs.booleanos],
  };

  // L (col 12): Color
  ws.getCell(`L${rowIndex}`).dataValidation = {
    type: 'list',
    allowBlank: true,
    showErrorMessage: false,
    formulae: [refs.colores],
  };
}

// ─── Traer TODOS los productos de Strapi con paginación ──────────────────────
async function fetchAllProductos(strapi) {
  const todos = [];
  let page = 1;

  while (true) {
    const resultado = await strapi.documents(UID_PRODUCTO).findMany({
      populate: {
        variantes: true,
        categoria: {
          populate: {
            subcategorias: {
              populate: { tipos: true }
            }
          }
        }
      },
      limit:  PAGE_SIZE,
      start:  (page - 1) * PAGE_SIZE,
      status: 'published',
    });

    if (!resultado || resultado.length === 0) break;
    todos.push(...resultado);

    if (resultado.length < PAGE_SIZE) break;
    page++;
  }

  return todos;
}

// ─── Generador principal del Excel ───────────────────────────────────────────
async function generarExcel(strapi) {
  strapi.log.info('[ExportAdmin] Obteniendo productos de Strapi...');
  const productos = await fetchAllProductos(strapi);
  strapi.log.info(`[ExportAdmin] ${productos.length} productos obtenidos`);

  const wb   = new ExcelJS.Workbook();
  wb.creator = 'Marybe';
  wb.created = new Date();

  // ── Crear hoja de Listas PRIMERO (para obtener las refs de validación) ────
  const refs = construirHojaListas(wb);

  // ══════════════════════════════════════════════════════════════════════════
  // HOJA 1: PRODUCTOS (A–R)
  // ══════════════════════════════════════════════════════════════════════════
  const wsP = wb.addWorksheet('📦 Productos', {
    properties: { tabColor: { argb: C.violeta } },
    pageSetup:  { fitToPage: true, fitToWidth: 1, orientation: 'landscape' },
    views:      [{ state: 'frozen', xSplit: 0, ySplit: 3 }],
  });

  // Fila 1 — Título
  wsP.mergeCells('A1:R1');
  const titleP     = wsP.getCell('A1');
  titleP.value     = `📦 MARYBE — Exportación de Productos (${new Date().toLocaleDateString('es-AR')})`;
  titleP.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.grisOscuro } };
  titleP.font      = { bold: true, color: { argb: C.blanco }, size: 14, name: 'Calibri' };
  titleP.alignment = { horizontal: 'center', vertical: 'middle' };
  wsP.getRow(1).height = 36;

  // Fila 2 — Instrucción
  wsP.mergeCells('A2:R2');
  const instrP     = wsP.getCell('A2');
  instrP.value     = `⚠ Exportación generada el ${new Date().toLocaleString('es-AR')} — ${productos.length} productos. Las columnas Sección, Categoría, Subcategoría y Tipo tienen listas desplegables en cascada.`;
  applyStyle(instrP, noteStyle());
  wsP.getRow(2).height = 28;

  // Columnas con anchos
  const colDefsP = [
    { header: 'ID Original *',    width: 14, group: 'base',   note: 'ID único del producto' },
    { header: 'SKU / EAN',        width: 18, group: 'base',   note: 'Código de barras o código interno' },
    { header: 'Nombre *',         width: 40, group: 'base',   note: 'Nombre completo del producto' },
    { header: 'Marca',            width: 16, group: 'base',   note: 'Marca comercial' },
    { header: 'Sección *',        width: 16, group: 'cat',    note: 'Perfumería o Hogar' },
    { header: 'Categoría',        width: 22, group: 'cat',    note: '↓ Lista desplegable' },
    { header: 'Subcategoría',     width: 22, group: 'cat',    note: '↓ Depende de Categoría' },
    { header: 'Tipo',             width: 22, group: 'cat',    note: '↓ Depende de Subcategoría' },
    { header: 'Descripción',      width: 60, group: 'extra',  note: 'Descripción del producto' },
    { header: 'Especificaciones', width: 50, group: 'extra',  note: 'Especificaciones técnicas' },
    { header: 'Proveedor',        width: 28, group: 'extra',  note: 'Nombre del proveedor' },
    { header: 'Publicado',        width: 12, group: 'extra',  note: 'SI = visible | NO = oculto' },
    { header: 'Destacado',        width: 12, group: 'extra',  note: 'SI = destacado | NO = normal' },
    { header: 'Stock',            width: 12, group: 'extra',  note: 'Stock disponible (solo para productos sin variantes)' },
    { header: 'Características',  width: 40, group: 'extra',  note: 'Separadas por |' },
    { header: 'Precio *',         width: 16, group: 'precio', note: 'Precio de lista (sin descuento)' },
    { header: 'Precio Oferta',     width: 16, group: 'precio', note: 'Precio con descuento (editable)' },
    { header: '% Descuento 🔒',  width: 14, group: 'precio', note: 'Calculado a partir del Precio Oferta' },
  ];

  wsP.columns = colDefsP.map(h => ({ width: h.width }));
  // Ocultar las columnas AA (27) y AB (28)
  wsP.getColumn(27).hidden = true;
  wsP.getColumn(28).hidden = true;

  // Fila 3 — Headers con colores por grupo
  const rowHeaderP = wsP.getRow(3);
  colDefsP.forEach((h, i) => {
    const cell = rowHeaderP.getCell(i + 1);
    cell.value = h.header;
    const color = h.group === 'base'   ? C.violeta
      : h.group === 'cat'   ? C.azul
      : h.group === 'precio' ? C.verde
      : C.grisOscuro;
    applyStyle(cell, headerStyle(color));
    if (h.note) cell.note = { texts: [{ text: h.note }] };
  });
  rowHeaderP.height = 30;

  // ─ Filas de datos ─
  let rowIdxP    = 3;
  let totalVariantes = 0;

  for (const prod of productos) {
    rowIdxP++;
    const isEven  = rowIdxP % 2 === 0;
    const bgColor = isEven ? C.blanco : C.grisClaro;

    const precioNum       = safeNum(prod.precio);
    const precioOfertaNum = safeNum(prod.precio_oferta);
    const pctDesc         = calcPct(precioNum, precioOfertaNum, prod.descuento);

    // ── Resolver Categoría / Subcategoría / Tipo ────────────────────────────
    // Fuente primaria: campos string planos del producto.
    // Fallback: relación categoria → subcategorias → tipos (deep populate).
    const catRelacion    = prod.categoria || null;
    const categoriaNombre = catRelacion?.nombre || '';

    // Sección: campo del producto, fallback de la categoría
    const seccionVal = prod.seccion || catRelacion?.seccion || '';

    // Subcategoría: campo string del producto, fallback primera subcat de la relación
    let subcategoriaVal = (prod.subcategoria || '').trim();
    if (!subcategoriaVal && catRelacion?.subcategorias?.length > 0) {
      subcategoriaVal = catRelacion.subcategorias[0]?.nombre || '';
    }

    // Tipo: campo string del producto, fallback primer tipo de la primera subcat
    let tipoVal = (prod.tipo || '').trim();
    if (!tipoVal && catRelacion?.subcategorias?.length > 0) {
      // Buscar en la subcategoría que coincida, o en la primera
      const subcatMatch = subcategoriaVal
        ? catRelacion.subcategorias.find(s => s.nombre === subcategoriaVal)
        : catRelacion.subcategorias[0];
      if (subcatMatch?.tipos?.length > 0) {
        tipoVal = subcatMatch.tipos[0]?.nombre || '';
      }
    }

    const valores = [
      prod.id_original   || String(prod.id || ''),  // A: ID Original
      prod.sku            || '',                      // B: SKU/EAN
      prod.nombre         || '',                      // C: Nombre
      prod.marca          || '',                      // D: Marca
      seccionVal,                                     // E: Sección
      categoriaNombre,                                // F: Categoría
      subcategoriaVal,                                // G: Subcategoría
      tipoVal,                                        // H: Tipo
      prod.descripcion    || '',                      // I: Descripción
      prod.especificaciones || '',                    // J: Especificaciones
      prod.proveedor      || '',                      // K: Proveedor
      boolStr(prod.publicado),                        // L: Publicado
      boolStr(prod.destacado),                        // M: Destacado
      prod.stock          ?? 0,                       // N: Stock
      prod.caracteristicas || '',                     // O: Características
      // P, Q, R: con estilos especiales (abajo)
    ];

    const r = wsP.getRow(rowIdxP);
    r.height = 20;

    // Columnas A–O (índices 0-14)
    valores.forEach((val, ci) => {
      const cell = r.getCell(ci + 1);
      cell.value = val;
      applyStyle(cell, dataStyle(bgColor));

      // Categorías en azul (E,F,G,H = índices 4-7)
      if (ci >= 4 && ci <= 7) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isEven ? C.azulClaro : 'FFBFDBFE' } };
        cell.font = { color: { argb: '1E3A5F' }, size: 10, name: 'Calibri' };
      }
      // Publicado/Destacado en verde/rojo (L,M = índices 11,12)
      if (ci === 11 || ci === 12) {
        cell.dataValidation = { type: 'list', allowBlank: true, formulae: ['BOOLEANOS'] };
        cell.font = { bold: true, color: { argb: val === 'SI' ? '16A34A' : 'EF4444' }, size: 10 };
      }
    });

    // Stock (N, col 14) — override estilo: centrado
    const cellStock = r.getCell(14);
    cellStock.font      = { bold: false, color: { argb: C.grisOscuro }, size: 10, name: 'Calibri' };
    cellStock.alignment = { vertical: 'middle', horizontal: 'center' };

    // P (col 16): Precio — editable
    const cP = r.getCell(16);
    if (precioNum !== null) cP.value = precioNum;
    applyStyle(cP, dataStyle(isEven ? C.verdeClaro : 'FFD1FAE5'));
    cP.font      = { bold: true, color: { argb: '065F46' }, size: 10, name: 'Calibri' };
    cP.alignment = { vertical: 'middle', horizontal: 'right' };

    // Q (col 17): Precio Oferta — EDITABLE (usuario lo ingresa)
    const cQ = r.getCell(17);
    if (precioOfertaNum !== null) cQ.value = precioOfertaNum;
    applyStyle(cQ, dataStyle(isEven ? C.verdeClaro : 'FFD1FAE5'));
    cQ.font      = { bold: true, color: { argb: '065F46' }, size: 10, name: 'Calibri' };
    cQ.alignment = { vertical: 'middle', horizontal: 'right' };

    // R (col 18): % Descuento — CALCULADO a partir de P y Q
    const cR = r.getCell(18);
    let calculatedResult = 0;
    if (precioNum && precioOfertaNum && precioNum > 0) {
      calculatedResult = Math.round((1 - precioOfertaNum / precioNum) * 100);
    } else if (pctDesc > 0) {
      calculatedResult = pctDesc;
    }
    cR.value = {
      formula: `IF(AND(P${rowIdxP}>0,Q${rowIdxP}>0),ROUND((1-Q${rowIdxP}/P${rowIdxP})*100,0),0)`,
      result: calculatedResult
    };
    applyStyle(cR, readonlyStyle());
    cR.font      = { color: { argb: 'FF065F46' }, size: 10, name: 'Calibri', italic: true };
    cR.alignment = { vertical: 'middle', horizontal: 'center' };

    // ── Validaciones en cascada para esta fila ──────────────────────────────
    aplicarValidacionFila(wsP, rowIdxP, refs);

    r.commit();
    totalVariantes += (prod.variantes || []).length;
  }

  // ── Validaciones para filas vacías extra (por si agregan productos) ───────
  const EXTRA_ROWS = 300;
  for (let extra = 1; extra <= EXTRA_ROWS; extra++) {
    aplicarValidacionFila(wsP, rowIdxP + extra, refs);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // HOJA 2: VARIANTES (A–L)
  // ══════════════════════════════════════════════════════════════════════════
  const wsV = wb.addWorksheet('🔗 Variantes', {
    properties: { tabColor: { argb: C.coral } },
    pageSetup:  { fitToPage: true, fitToWidth: 1, orientation: 'landscape' },
    views:      [{ state: 'frozen', xSplit: 0, ySplit: 3 }],
  });

  // Fila 1 — Título
  wsV.mergeCells('A1:L1');
  const titleV     = wsV.getCell('A1');
  titleV.value     = '🔗 MARYBE — Variantes exportadas';
  titleV.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7C3AED' } };
  titleV.font      = { bold: true, color: { argb: C.blanco }, size: 14, name: 'Calibri' };
  titleV.alignment = { horizontal: 'center', vertical: 'middle' };
  wsV.getRow(1).height = 36;

  // Fila 2 — Instrucción
  wsV.mergeCells('A2:L2');
  const instrV     = wsV.getCell('A2');
  instrV.value     = '⚠ Una fila por variante. "producto_padre_id" debe coincidir con el "ID Original" de la hoja Productos. Columnas C e I son calculadas automáticamente.';
  applyStyle(instrV, noteStyle());
  wsV.getRow(2).height = 28;

  // Columnas
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

  // Fila 3 — Headers
  const rowHeaderV = wsV.getRow(3);
  colDefsV.forEach((h, i) => {
    const cell = rowHeaderV.getCell(i + 1);
    cell.value = h.header;
    applyStyle(cell, headerStyle(h.color));
    if (h.note) cell.note = { texts: [{ text: h.note }] };
  });
  rowHeaderV.height = 30;

  // ─ Filas de variantes ─
  let rowIdxV = 3;

  for (const prod of productos) {
    const padreIdOriginal = prod.id_original || String(prod.id || '');
    const variantes       = prod.variantes   || [];

    const filasVariantes = variantes.length > 0 ? variantes : [{
      id_original:   `${padreIdOriginal}-v1`,
      sku_ean:      prod.sku  || '',
      volumen:      '',
      stock:        0,
      precio:       prod.precio || 0,
      precio_oferta: prod.precio_oferta || null,
      publicado:    prod.publicado !== false,
      envio:        '1',
      color_nombre: null,
    }];

    for (const v of filasVariantes) {
      rowIdxV++;
      const isEven  = rowIdxV % 2 === 0;
      const bgColor = isEven ? C.blanco : 'FFFFF7ED';

      const precioV       = safeNum(v.precio);
      const precioOfertaV = safeNum(v.precio_oferta);
      const pctDescV      = calcPct(precioV, precioOfertaV, 0);

      const r = wsV.getRow(rowIdxV);
      r.height = 20;

      // A: ID Variante
      const cA = r.getCell(1);
      cA.value = v.id_original || '';
      applyStyle(cA, dataStyle(bgColor));

      // B: ID Producto Padre
      const cB = r.getCell(2);
      cB.value = padreIdOriginal;
      applyStyle(cB, dataStyle(bgColor));

      // C: Nombre Padre (fórmula VLOOKUP)
      const cC = r.getCell(3);
      cC.value = { formula: `IF(B${rowIdxV}<>"",IFERROR(VLOOKUP(B${rowIdxV},'📦 Productos'!A:C,3,FALSE),""),"")` };
      applyStyle(cC, readonlyStyle());

      // D: SKU/EAN
      const cD = r.getCell(4);
      cD.value = v.sku_ean || '';
      applyStyle(cD, dataStyle(bgColor));

      // E: Volumen
      const cE = r.getCell(5);
      cE.value = v.volumen || '';
      applyStyle(cE, dataStyle(bgColor));

      // F: Stock
      const cF = r.getCell(6);
      cF.value = v.stock !== undefined && v.stock !== null ? Number(v.stock) : 0;
      applyStyle(cF, dataStyle(bgColor));
      cF.alignment = { vertical: 'middle', horizontal: 'center' };

      // G: Precio — editable
      const cG = r.getCell(7);
      if (precioV !== null) cG.value = precioV;
      applyStyle(cG, dataStyle(bgColor));
      cG.font = { bold: true, color: { argb: C.grisOscuro }, size: 10, name: 'Calibri' };

      // H: Precio Oferta — EDITABLE (usuario lo ingresa)
      const cH = r.getCell(8);
      if (precioOfertaV !== null) cH.value = precioOfertaV;
      applyStyle(cH, dataStyle(bgColor));
      cH.font      = { bold: true, color: { argb: C.grisOscuro }, size: 10, name: 'Calibri' };
      cH.alignment = { vertical: 'middle', horizontal: 'right' };

      // I: % Descuento Variante
      const cI = r.getCell(9);
      cI.value = {
        formula: `IF(AND(G${rowIdxV}>0,H${rowIdxV}>0),ROUND((1-H${rowIdxV}/G${rowIdxV})*100,0),0)`,
        result: pctDescV
      };
      applyStyle(cI, readonlyStyle());
      cI.font      = { color: { argb: 'FF065F46' }, size: 10, name: 'Calibri', italic: true };
      cI.alignment = { vertical: 'middle', horizontal: 'center' };

      // J: Publicado
      const cJ = r.getCell(10);
      cJ.value = boolStr(v.publicado);
      applyStyle(cJ, dataStyle(bgColor));
      cJ.font  = { bold: true, color: { argb: cJ.value === 'SI' ? '16A34A' : 'EF4444' }, size: 10 };
      cJ.alignment = { vertical: 'middle' };

      // K: Envío
      const cK = r.getCell(11);
      cK.value = v.envio !== undefined && v.envio !== null ? String(v.envio) : '1';
      applyStyle(cK, dataStyle(bgColor));
      cK.alignment = { vertical: 'middle', horizontal: 'center' };

      // L: Color
      const cM = r.getCell(12);
      cM.value = v.color_nombre || '';
      applyStyle(cM, dataStyle(bgColor));

      aplicarValidacionVariante(wsV, rowIdxV, refs);

      r.commit();
    }
  }

  // ── Validaciones para filas vacías extra de Variantes ───────
  for (let extra = 1; extra <= EXTRA_ROWS; extra++) {
    aplicarValidacionVariante(wsV, rowIdxV + extra, refs);
  }
  
  // La hoja de Listas ya fue creada al inicio por construirHojaListas(wb)

  const buffer = await wb.xlsx.writeBuffer();

  return {
    buffer,
    totalProductos: productos.length,
    totalVariantes,
  };
}

// ─── Exports ──────────────────────────────────────────────────────────────────
module.exports = () => ({
  generarExcel,
});
