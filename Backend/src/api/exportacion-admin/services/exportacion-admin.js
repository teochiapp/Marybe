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
        clasificaciones: true,
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
    // ── Resolver precio del producto (con fallback desde variante fantasma) ──
    let precioNum       = safeNum(prod.precio);
    let precioOfertaNum = safeNum(prod.precio_oferta);

    if (precioNum === null && prod.variantes && prod.variantes.length > 0) {
      const padreIdStr = prod.id_original || String(prod.id || '');
      const v1 = prod.variantes.find(v => v.id_original === `${padreIdStr}-v1`);
      if (v1) {
        precioNum = safeNum(v1.precio);
        if (precioOfertaNum === null) precioOfertaNum = safeNum(v1.precio_oferta);
      } else if (prod.variantes.length === 1) {
        const vUnica = prod.variantes[0];
        const sinAtributos = !(vUnica.volumen || '').trim() && !(vUnica.color_nombre || '').trim();
        if (sinAtributos) {
          precioNum = safeNum(vUnica.precio);
          if (precioOfertaNum === null) precioOfertaNum = safeNum(vUnica.precio_oferta);
        }
      }
    }
    const pctDesc = calcPct(precioNum, precioOfertaNum, prod.descuento);

    // ── Construir la lista de clasificaciones a exportar ──────────────────────
    // Si el producto tiene clasificaciones[] (nuevo campo) las usamos.
    // Fallback: construir una clasificación desde los campos planos / relación.
    let clasifRows = [];

    if (prod.clasificaciones && prod.clasificaciones.length > 0) {
      clasifRows = prod.clasificaciones.map(c => ({
        seccion:      c.seccion      || '',
        categoria:    c.categoria    || '',
        subcategoria: c.subcategoria || '',
        tipo:         c.tipo         || '',
      }));
    } else {
      // Fallback retrocompatible: campos planos + relación categoria
      const catRelacion = prod.categoria || null;
      const categoriaNombre = catRelacion?.nombre || '';
      const seccionVal = prod.seccion || catRelacion?.seccion || '';
      let subcategoriaVal = (prod.subcategoria || '').trim();
      if (!subcategoriaVal && catRelacion?.subcategorias?.length > 0) {
        subcategoriaVal = catRelacion.subcategorias[0]?.nombre || '';
      }
      let tipoVal = (prod.tipo || '').trim();
      if (!tipoVal && catRelacion?.subcategorias?.length > 0) {
        const subcatMatch = subcategoriaVal
          ? catRelacion.subcategorias.find(s => s.nombre === subcategoriaVal)
          : catRelacion.subcategorias[0];
        if (subcatMatch?.tipos?.length > 0) {
          tipoVal = subcatMatch.tipos[0]?.nombre || '';
        }
      }
      clasifRows = [{ seccion: seccionVal, categoria: categoriaNombre, subcategoria: subcategoriaVal, tipo: tipoVal }];
    }

    // ── Calcular descuento para las celdas de precio ──────────────────────────
    let calculatedPct = 0;
    if (precioNum && precioOfertaNum && precioNum > 0) {
      calculatedPct = Math.round((1 - precioOfertaNum / precioNum) * 100);
    } else if (pctDesc > 0) {
      calculatedPct = pctDesc;
    }

    // ── Emitir UNA FILA POR CLASIFICACIÓN ────────────────────────────────────
    for (let clasifIdx = 0; clasifIdx < clasifRows.length; clasifIdx++) {
      const clasif  = clasifRows[clasifIdx];
      const esPrimera = clasifIdx === 0;

      rowIdxP++;
      const isEven  = rowIdxP % 2 === 0;

      // Fondo: la primera clasificación usa el color normal, las adicionales usan
      // un tono gris muy suave para indicar visualmente que son filas duplicadas.
      const bgBase  = isEven ? C.blanco : C.grisClaro;
      const bgExtra = 'FFEDEDED'; // gris muy claro para clasificaciones adicionales
      const bgColor = esPrimera ? bgBase : bgExtra;

      const valores = [
        prod.id_original   || String(prod.id || ''),  // A: ID Original
        esPrimera ? (prod.sku || '') : '',             // B: SKU/EAN (solo fila 1)
        esPrimera ? (prod.nombre || '') : '',          // C: Nombre  (solo fila 1)
        esPrimera ? (prod.marca || '') : '',           // D: Marca   (solo fila 1)
        clasif.seccion,                                // E: Sección
        clasif.categoria,                              // F: Categoría
        clasif.subcategoria,                           // G: Subcategoría
        clasif.tipo,                                   // H: Tipo
        esPrimera ? (prod.descripcion || '') : '',     // I: Descripción (solo fila 1)
        esPrimera ? (prod.especificaciones || '') : '',// J: Especificaciones (solo fila 1)
        esPrimera ? (prod.proveedor || '') : '',       // K: Proveedor (solo fila 1)
        esPrimera ? boolStr(prod.publicado) : '',      // L: Publicado (solo fila 1)
        esPrimera ? boolStr(prod.destacado) : '',      // M: Destacado (solo fila 1)
        esPrimera ? (prod.stock ?? 0) : '',            // N: Stock (solo fila 1)
        esPrimera ? (prod.caracteristicas || '') : '', // O: Características (solo fila 1)
      ];

      const r = wsP.getRow(rowIdxP);
      r.height = 20;

      // Columnas A–O (índices 0-14)
      valores.forEach((val, ci) => {
        const cell = r.getCell(ci + 1);
        cell.value = ci === 0 ? String(val) : val;
        applyStyle(cell, dataStyle(bgColor));
        if (ci === 0) cell.numFmt = '@';

        // Categorías en azul (E,F,G,H = índices 4-7)
        if (ci >= 4 && ci <= 7) {
          const catBg = esPrimera
            ? (isEven ? C.azulClaro : 'FFBFDBFE')
            : 'FFD0E4F7'; // azul más pálido para filas adicionales
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: catBg } };
          cell.font = { color: { argb: '1E3A5F' }, size: 10, name: 'Calibri' };
        }
        // Publicado/Destacado en verde/rojo (L,M = índices 11,12)
        if (ci === 11 || ci === 12) {
          if (val === 'SI' || val === 'NO') {
            cell.font = { bold: true, color: { argb: val === 'SI' ? '16A34A' : 'EF4444' }, size: 10 };
          }
        }
        // Filas adicionales: texto en gris para diferenciar
        if (!esPrimera && ci !== 0 && ci < 4) {
          cell.font = { color: { argb: 'FF888888' }, size: 9, name: 'Calibri', italic: true };
        }
      });

      // Stock (N, col 14) — centrado
      const cellStock = r.getCell(14);
      cellStock.font      = { bold: false, color: { argb: C.grisOscuro }, size: 10, name: 'Calibri' };
      cellStock.alignment = { vertical: 'middle', horizontal: 'center' };

      // P, Q, R: precio solo en la primera fila (las adicionales son solo clasificaciones)
      if (esPrimera) {
        const cP = r.getCell(16);
        if (precioNum !== null) cP.value = precioNum;
        applyStyle(cP, dataStyle(isEven ? C.verdeClaro : 'FFD1FAE5'));
        cP.font      = { bold: true, color: { argb: '065F46' }, size: 10, name: 'Calibri' };
        cP.alignment = { vertical: 'middle', horizontal: 'right' };

        const cQ = r.getCell(17);
        if (precioOfertaNum !== null) cQ.value = precioOfertaNum;
        applyStyle(cQ, dataStyle(isEven ? C.verdeClaro : 'FFD1FAE5'));
        cQ.font      = { bold: true, color: { argb: '065F46' }, size: 10, name: 'Calibri' };
        cQ.alignment = { vertical: 'middle', horizontal: 'right' };

        const cR = r.getCell(18);
        cR.value = calculatedPct;
        applyStyle(cR, readonlyStyle());
        cR.font      = { color: { argb: 'FF065F46' }, size: 10, name: 'Calibri', italic: true };
        cR.alignment = { vertical: 'middle', horizontal: 'center' };
      } else {
        // Filas adicionales: celdas P, Q, R vacías y en gris
        [16, 17, 18].forEach(colIdx => {
          const cell = r.getCell(colIdx);
          cell.value = '';
          applyStyle(cell, dataStyle('FFEDEDED'));
        });
      }

      r.commit();
    }

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
  let productosSinVariante = 0;

  for (const prod of productos) {
    const padreIdOriginal = prod.id_original || String(prod.id || '');
    const variantes       = prod.variantes   || [];

    // Solo exportar variantes de la BD, ocultando las variantes fantasma (-v1) o
    // únicas vacías. Si hay MÚLTIPLES variantes sin atributos, SE EXPORTAN para 
    // que el usuario pueda corregirlas en el Excel.
    const variantesLimpias = variantes.filter(v => {
      const esV1 = v.id_original === `${padreIdOriginal}-v1`;
      const esUnicaYVacia = variantes.length === 1 && !(v.volumen || '').trim() && !(v.color_nombre || '').trim();
      return !(esV1 || esUnicaYVacia);
    });

    if (variantesLimpias.length === 0) {
      productosSinVariante++;
      continue; // no escribir ninguna fila de variante para este producto
    }

    const filasVariantes = variantesLimpias;

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
      cA.value = String(v.id_original || '');
      applyStyle(cA, dataStyle(bgColor));
      cA.numFmt = '@';

      // B: ID Producto Padre
      const cB = r.getCell(2);
      cB.value = String(padreIdOriginal);
      applyStyle(cB, dataStyle(bgColor));
      cB.numFmt = '@';

      // C: Nombre Padre (fórmula VLOOKUP)
      const cC = r.getCell(3);
      // Intenta coincidencia exacta, luego como texto, luego como número
      cC.value = { formula: `IF(B${rowIdxV}<>"",IFERROR(VLOOKUP(B${rowIdxV},'📦 Productos'!A:C,3,FALSE),IFERROR(VLOOKUP(B${rowIdxV}&"",'📦 Productos'!A:C,3,FALSE),IFERROR(VLOOKUP(VALUE(B${rowIdxV}),'📦 Productos'!A:C,3,FALSE),""))),"")` };
      applyStyle(cC, readonlyStyle());

      // D: SKU/EAN
      const cD = r.getCell(4);
      cD.value = v.sku_ean || '';
      applyStyle(cD, dataStyle(bgColor));
      cD.numFmt = '@';

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

      // I: % Descuento Variante — valor numérico calculado en el servidor
      // NO usar fórmula Excel: evita el bug [object Object] al reimportar.
      const cI = r.getCell(9);
      cI.value = pctDescV;  // número puro, sin fórmula
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
    productosSinVariante,
  };
}

// ─── Plantilla Vacía (MODO ALTA) ─────────────────────────────────────────────
/**
 * Genera un .xlsx con el mismo formato que generarExcel pero SIN filas de datos reales.
 * Incluye el marcador oculto MODO_ALTA en la celda AA1 de la hoja Productos
 * para que importacion-admin lo detecte y active la validación estricta
 * (rechaza si algún id_original ya existe en la BD).
 *
 * Para que el usuario vea el formato y las fórmulas correctas, se agregan
 * 2 filas de ejemplo en Productos y 2 variantes de ejemplo en Variantes,
 * todas claramente marcadas con "(EJEMPLO — BORRAR)" en el nombre.
 * Estas filas son IDÉNTICAS en estilos, formatos numéricos y fórmulas a
 * las que genera generarExcel con datos reales.
 */
async function generarExcelVacio(strapi) {
  strapi.log.info('[ExportAdmin] Generando plantilla vacía MODO_ALTA...');

  const wb   = new ExcelJS.Workbook();
  wb.creator = 'Marybe';
  wb.created = new Date();

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
  titleP.value     = `📦 MARYBE — Plantilla de Alta de Nuevos Productos (${new Date().toLocaleDateString('es-AR')})`;
  titleP.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.grisOscuro } };
  titleP.font      = { bold: true, color: { argb: C.blanco }, size: 14, name: 'Calibri' };
  titleP.alignment = { horizontal: 'center', vertical: 'middle' };
  wsP.getRow(1).height = 36;

  // Marcador oculto MODO_ALTA en celda AA1 (columna 27)
  const cMarcador       = wsP.getCell(1, 27);
  cMarcador.value       = 'MODO_ALTA';
  cMarcador.font        = { color: { argb: C.blanco }, size: 8 }; // blanco sobre fondo blanco
  cMarcador.fill        = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.blanco } };
  wsP.getColumn(27).hidden = true; // columna oculta

  // Fila 2 — Instrucción
  wsP.mergeCells('A2:R2');
  const instrP     = wsP.getCell('A2');
  instrP.value     = `⚠ PLANTILLA PARA ALTA — Completá solo productos NUEVOS. Borrá las filas de EJEMPLO antes de importar. El ID Original debe ser único y no existir en el catálogo actual. Generada el ${new Date().toLocaleString('es-AR')}.`;
  applyStyle(instrP, noteStyle());
  wsP.getRow(2).height = 28;

  // Columnas con anchos (igual que generarExcel)
  const colDefsP = [
    { header: 'ID Original *',    width: 14, group: 'base',   note: 'ID único del producto (NO puede existir en el catálogo actual)' },
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

  // ── Filas de ejemplo — idénticas en estilos/formatos a generarExcel ──────
  // Producto 1: sin variantes (tiene precio directo y stock)
  // Producto 2: con variantes (precio en variantes, stock 0)
  const productosEjemplo = [
    {
      id_original:      'EJEMPLO-001',
      sku:              'EAN-0000001',
      nombre:           'Perfume Sin Variantes (EJEMPLO — BORRAR)',
      marca:            'Marca Ejemplo',
      seccion:          'Perfumería',
      categoria:        'Fragancias',
      subcategoria:     'Perfumes',
      tipo:             'Eau de Parfum',
      descripcion:      'Descripción de ejemplo. Reemplazá este texto con la descripción real del producto.',
      especificaciones: 'Volumen: 100 ml | Concentración: EDP',
      proveedor:        'Proveedor Ejemplo S.A.',
      publicado:        'SI',
      destacado:        'NO',
      stock:            10,
      caracteristicas:  'Fragancia floral|Larga duración|Fabricado en Francia',
      precio:           15000,
      precio_oferta:    12000,
      pct_desc:         20,
    },
    {
      id_original:      'EJEMPLO-002',
      sku:              'EAN-0000002',
      nombre:           'Perfume Con Variantes de Volumen (EJEMPLO — BORRAR)',
      marca:            'Marca Ejemplo',
      seccion:          'Perfumería',
      categoria:        'Fragancias',
      subcategoria:     'Perfumes',
      tipo:             'Eau de Toilette',
      descripcion:      'Este producto tiene variantes por volumen. Completá los precios en la hoja Variantes.',
      especificaciones: 'Concentración: EDT',
      proveedor:        'Proveedor Ejemplo S.A.',
      publicado:        'SI',
      destacado:        'SI',
      stock:            0,
      caracteristicas:  'Fragancia amaderada|Ideal para regalo',
      precio:           null,   // precio lo llevan las variantes
      precio_oferta:    null,
      pct_desc:         0,
    },
  ];

  let rowIdxP = 3;
  for (const prod of productosEjemplo) {
    rowIdxP++;
    const isEven  = rowIdxP % 2 === 0;
    const bgColor = isEven ? C.blanco : C.grisClaro;

    const valores = [
      String(prod.id_original),  // A: ID Original
      prod.sku,                   // B: SKU/EAN
      prod.nombre,                // C: Nombre
      prod.marca,                 // D: Marca
      prod.seccion,               // E: Sección
      prod.categoria,             // F: Categoría
      prod.subcategoria,          // G: Subcategoría
      prod.tipo,                  // H: Tipo
      prod.descripcion,           // I: Descripción
      prod.especificaciones,      // J: Especificaciones
      prod.proveedor,             // K: Proveedor
      prod.publicado,             // L: Publicado
      prod.destacado,             // M: Destacado
      prod.stock,                 // N: Stock
      prod.caracteristicas,       // O: Características
    ];

    const r = wsP.getRow(rowIdxP);
    r.height = 20;

    // Columnas A–O — idéntico a generarExcel
    valores.forEach((val, ci) => {
      const cell = r.getCell(ci + 1);
      cell.value = val;
      applyStyle(cell, dataStyle(bgColor));
      if (ci === 0) cell.numFmt = '@';

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

    // Stock (N, col 14) — centrado
    const cellStock = r.getCell(14);
    cellStock.font      = { bold: false, color: { argb: C.grisOscuro }, size: 10, name: 'Calibri' };
    cellStock.alignment = { vertical: 'middle', horizontal: 'center' };

    // P (col 16): Precio — editable
    const cP = r.getCell(16);
    if (prod.precio !== null) cP.value = prod.precio;
    applyStyle(cP, dataStyle(isEven ? C.verdeClaro : 'FFD1FAE5'));
    cP.font      = { bold: true, color: { argb: '065F46' }, size: 10, name: 'Calibri' };
    cP.alignment = { vertical: 'middle', horizontal: 'right' };

    // Q (col 17): Precio Oferta — editable
    const cQ = r.getCell(17);
    if (prod.precio_oferta !== null) cQ.value = prod.precio_oferta;
    applyStyle(cQ, dataStyle(isEven ? C.verdeClaro : 'FFD1FAE5'));
    cQ.font      = { bold: true, color: { argb: '065F46' }, size: 10, name: 'Calibri' };
    cQ.alignment = { vertical: 'middle', horizontal: 'right' };

    // R (col 18): % Descuento — valor numérico calculado (readonly), igual a generarExcel
    const cR = r.getCell(18);
    cR.value = prod.pct_desc;
    applyStyle(cR, readonlyStyle());
    cR.font      = { color: { argb: 'FF065F46' }, size: 10, name: 'Calibri', italic: true };
    cR.alignment = { vertical: 'middle', horizontal: 'center' };

    r.commit();
  }

  // Validaciones en cascada (igual que exportación normal, 300 filas extra)
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
  titleV.value     = '🔗 MARYBE — Variantes de Nuevos Productos';
  titleV.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7C3AED' } };
  titleV.font      = { bold: true, color: { argb: C.blanco }, size: 14, name: 'Calibri' };
  titleV.alignment = { horizontal: 'center', vertical: 'middle' };
  wsV.getRow(1).height = 36;

  // Fila 2 — Instrucción
  wsV.mergeCells('A2:L2');
  const instrV     = wsV.getCell('A2');
  instrV.value     = '⚠ Una fila por variante. "ID Producto Padre" debe coincidir con el "ID Original" de la hoja Productos. Borrá las filas de EJEMPLO antes de importar. Si el producto no tiene variantes, dejá esta hoja vacía.';
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

  // ── Filas de variantes de ejemplo (corresponden a EJEMPLO-002) ──
  const variantesEjemplo = [
    {
      id_variante:   'EJEMPLO-002-v30ml',
      id_padre:      'EJEMPLO-002',
      sku_ean:       'EAN-0000002-30',
      volumen:       '30 ml',
      stock:         5,
      precio:        8500,
      precio_oferta: null,
      pct_desc:      0,
      publicado:     'SI',
      envio:         '1',
      color_nombre:  '',
    },
    {
      id_variante:   'EJEMPLO-002-v100ml',
      id_padre:      'EJEMPLO-002',
      sku_ean:       'EAN-0000002-100',
      volumen:       '100 ml',
      stock:         3,
      precio:        18000,
      precio_oferta: 15000,
      pct_desc:      17,
      publicado:     'SI',
      envio:         '1',
      color_nombre:  '',
    },
  ];

  let rowIdxV = 3;
  for (const v of variantesEjemplo) {
    rowIdxV++;
    const isEven  = rowIdxV % 2 === 0;
    const bgColor = isEven ? C.blanco : 'FFFFF7ED';

    const r = wsV.getRow(rowIdxV);
    r.height = 20;

    // A: ID Variante
    const cA = r.getCell(1);
    cA.value = String(v.id_variante);
    applyStyle(cA, dataStyle(bgColor));
    cA.numFmt = '@';

    // B: ID Producto Padre
    const cB = r.getCell(2);
    cB.value = String(v.id_padre);
    applyStyle(cB, dataStyle(bgColor));
    cB.numFmt = '@';

    // C: Nombre Padre — fórmula VLOOKUP idéntica a generarExcel
    const cC = r.getCell(3);
    cC.value = { formula: `IF(B${rowIdxV}<>"",IFERROR(VLOOKUP(B${rowIdxV},'📦 Productos'!A:C,3,FALSE),IFERROR(VLOOKUP(B${rowIdxV}&"",'📦 Productos'!A:C,3,FALSE),IFERROR(VLOOKUP(VALUE(B${rowIdxV}),'📦 Productos'!A:C,3,FALSE),""))),"")` };
    applyStyle(cC, readonlyStyle());

    // D: SKU/EAN
    const cD = r.getCell(4);
    cD.value = v.sku_ean || '';
    applyStyle(cD, dataStyle(bgColor));
    cD.numFmt = '@';

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
    if (v.precio !== null) cG.value = v.precio;
    applyStyle(cG, dataStyle(bgColor));
    cG.font = { bold: true, color: { argb: C.grisOscuro }, size: 10, name: 'Calibri' };

    // H: Precio Oferta — editable
    const cH = r.getCell(8);
    if (v.precio_oferta !== null) cH.value = v.precio_oferta;
    applyStyle(cH, dataStyle(bgColor));
    cH.font      = { bold: true, color: { argb: C.grisOscuro }, size: 10, name: 'Calibri' };
    cH.alignment = { vertical: 'middle', horizontal: 'right' };

    // I: % Descuento Variante — valor numérico calculado (readonly), igual a generarExcel
    const cI = r.getCell(9);
    cI.value = v.pct_desc;
    applyStyle(cI, readonlyStyle());
    cI.font      = { color: { argb: 'FF065F46' }, size: 10, name: 'Calibri', italic: true };
    cI.alignment = { vertical: 'middle', horizontal: 'center' };

    // J: Publicado
    const cJ = r.getCell(10);
    cJ.value = v.publicado;
    applyStyle(cJ, dataStyle(bgColor));
    cJ.font  = { bold: true, color: { argb: v.publicado === 'SI' ? '16A34A' : 'EF4444' }, size: 10 };
    cJ.alignment = { vertical: 'middle' };

    // K: Envío
    const cK = r.getCell(11);
    cK.value = v.envio !== undefined && v.envio !== null ? String(v.envio) : '1';
    applyStyle(cK, dataStyle(bgColor));
    cK.alignment = { vertical: 'middle', horizontal: 'center' };

    // L: Color
    const cL = r.getCell(12);
    cL.value = v.color_nombre || '';
    applyStyle(cL, dataStyle(bgColor));

    r.commit();
  }

  // Validaciones de variantes
  const lastRowV = rowIdxV + EXTRA_ROWS;
  wsV.dataValidations.add(`J4:J${lastRowV}`, {
    type: 'list', allowBlank: true, showErrorMessage: false,
    formulae: [refs.booleanos],
  });
  wsV.dataValidations.add(`L4:L${lastRowV}`, {
    type: 'list', allowBlank: true, showErrorMessage: false,
    formulae: [refs.colores],
  });

  // ── Hoja Listas al final ──────────────────────────────────────────────────
  construirHojaListas(wb, refs);

  const buffer = await wb.xlsx.writeBuffer();
  strapi.log.info('[ExportAdmin] ✅ Plantilla vacía MODO_ALTA generada');

  return { buffer };
}

// ─── Exports ──────────────────────────────────────────────────────────────────
module.exports = () => ({
  generarExcel,
  generarExcelVacio,
});
