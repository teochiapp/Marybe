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
 * Calcula las posiciones de columna para la hoja Listas y construye
 * las referencias a las listas planas, SIN crear la hoja todavía.
 */
function calcularRefs() {
  let col = 1;

  // Col 1: Secciones
  const secLtr = colLetter(col);
  const secciones = `Listas!$${secLtr}$2:$${secLtr}$${SECCIONES.length + 1}`;
  col++;

  // Col 2: Categorías
  const categorias_list = Object.keys(TAXONOMY);
  const catLtr = colLetter(col);
  const categorias = `Listas!$${catLtr}$2:$${catLtr}$${categorias_list.length + 1}`;
  col++;

  // Col 3: Subcategorías (todas aplanadas)
  const subcatLtr = colLetter(col);
  const subcategoriasSet = new Set();
  for (const subcats of Object.values(TAXONOMY)) {
    for (const subcat of Object.keys(subcats)) subcategoriasSet.add(subcat);
  }
  const subcategoriasArr = Array.from(subcategoriasSet);
  const subcategorias = `Listas!$${subcatLtr}$2:$${subcatLtr}$${subcategoriasArr.length + 1}`;
  col++;

  // Col 4: Tipos (todos aplanados)
  const tipoLtr = colLetter(col);
  const tiposSet = new Set();
  for (const subcats of Object.values(TAXONOMY)) {
    for (const tipos of Object.values(subcats)) {
      for (const tipo of tipos) tiposSet.add(tipo);
    }
  }
  const tiposArr = Array.from(tiposSet);
  const tipos = `Listas!$${tipoLtr}$2:$${tipoLtr}$${tiposArr.length + 1}`;
  col++;

  // Col 5: Colores
  const coloresLtr = colLetter(col);
  const colores = `Listas!$${coloresLtr}$2:$${coloresLtr}$${COLORES.length + 1}`;
  col++;

  // Col 6: Booleanos
  const boolLtr = colLetter(col);
  const booleanos = `Listas!$${boolLtr}$2:$${boolLtr}$3`;

  return {
    secciones,
    categorias,
    subcategorias,
    tipos,
    booleanos,
    colores,
    data: {
      categorias: categorias_list,
      subcategorias: subcategoriasArr,
      tipos: tiposArr,
    }
  };
}

/**
 * Crea la hoja "Listas" al final del workbook usando los datos pre-calculados.
 */
function construirHojaListas(wb, refs) {
  const wsL = wb.addWorksheet('Listas');
  let col = 1;

  // 1. Secciones
  wsL.getCell(1, col).value = '_SECCIONES';
  SECCIONES.forEach((s, i) => { wsL.getCell(i + 2, col).value = s; });
  col++;

  // 2. Categorías
  wsL.getCell(1, col).value = '_CATEGORIAS';
  refs.data.categorias.forEach((c, i) => { wsL.getCell(i + 2, col).value = c; });
  col++;

  // 3. Subcategorías
  wsL.getCell(1, col).value = '_SUBCATEGORIAS';
  refs.data.subcategorias.forEach((s, i) => { wsL.getCell(i + 2, col).value = s; });
  col++;

  // 4. Tipos
  wsL.getCell(1, col).value = '_TIPOS';
  refs.data.tipos.forEach((t, i) => { wsL.getCell(i + 2, col).value = t; });
  col++;

  // 5. Colores
  wsL.getCell(1, col).value = '_COLORES';
  COLORES.forEach((c, i) => { wsL.getCell(i + 2, col).value = c; });
  col++;

  // 6. Booleanos
  wsL.getCell(1, col).value = '_BOOLEANOS';
  wsL.getCell(2, col).value = 'SI';
  wsL.getCell(3, col).value = 'NO';
  col++;
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

  // ── Pre-computar referencias sin crear la hoja aún ─────────────────────────
  // La hoja Listas se creará AL FINAL para respetar el orden Productos → Variantes → Listas
  const refs = calcularRefs();

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
    // (Ahora se aplican todas juntas al final mediante bloques)
    r.commit();
    totalVariantes += (prod.variantes || []).length;
  }

  // ── Validaciones en bloque para toda la hoja de Productos ────────────────────
  const EXTRA_ROWS = 300;
  const lastRow    = rowIdxP + EXTRA_ROWS;

  wsP.dataValidations.add(`E4:E${lastRow}`, {
    type: 'list', allowBlank: true, showErrorMessage: false,
    formulae: [refs.secciones],
  });
  wsP.dataValidations.add(`F4:F${lastRow}`, {
    type: 'list', allowBlank: true, showErrorMessage: false,
    formulae: [refs.categorias],
  });
  wsP.dataValidations.add(`G4:G${lastRow}`, {
    type: 'list', allowBlank: true, showErrorMessage: false,
    formulae: [refs.subcategorias],
  });
  wsP.dataValidations.add(`H4:H${lastRow}`, {
    type: 'list', allowBlank: true, showErrorMessage: false,
    formulae: [refs.tipos],
  });
  wsP.dataValidations.add(`L4:L${lastRow}`, {
    type: 'list', allowBlank: true, showErrorMessage: false,
    formulae: [refs.booleanos],
  });
  wsP.dataValidations.add(`M4:M${lastRow}`, {
    type: 'list', allowBlank: true, showErrorMessage: false,
    formulae: [refs.booleanos],
  });

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


      r.commit();
    }
  }

  // ── Validaciones en bloque para toda la hoja de Variantes ────────────────
  const lastRowV = rowIdxV + EXTRA_ROWS;
  wsV.dataValidations.add(`J4:J${lastRowV}`, {
    type: 'list', allowBlank: true, showErrorMessage: false,
    formulae: [refs.booleanos],
  });
  wsV.dataValidations.add(`L4:L${lastRowV}`, {
    type: 'list', allowBlank: true, showErrorMessage: false,
    formulae: [refs.colores],
  });

  // ── Hoja Listas al final (Productos → Variantes → Listas) ───────────────
  construirHojaListas(wb, refs);

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
