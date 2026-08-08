'use strict';

const ExcelJS = require('exceljs');

// ─── Estilos y taxonomía compartidos con el exportador principal ─────────────────
const {
  TAXONOMY,
  SECCIONES,
  C,
  headerStyle,
  dataStyle,
  noteStyle,
  readonlyStyle,
  applyStyle,
} = require('../../../utils/excel-utils');

const UID_PRODUCTO = 'api::producto.producto';
const PAGE_SIZE    = 100;

// ─── Helpers para dropdowns (igual que en exportacion-admin) ─────────────────────
function colLetter(n) {
  let r = '';
  while (n > 0) {
    n--;
    r = String.fromCharCode(65 + (n % 26)) + r;
    n = Math.floor(n / 26);
  }
  return r;
}

function calcularRefs() {
  let col = 1;

  const secLtr   = colLetter(col);
  const secciones = `Listas!$${secLtr}$2:$${secLtr}$${SECCIONES.length + 1}`;
  col++;

  const categorias_list = Object.keys(TAXONOMY);
  const catLtr  = colLetter(col);
  const categorias = `Listas!$${catLtr}$2:$${catLtr}$${categorias_list.length + 1}`;
  col++;

  const subcatLtr = colLetter(col);
  const subcategoriasSet = new Set();
  for (const subcats of Object.values(TAXONOMY)) {
    for (const subcat of Object.keys(subcats)) subcategoriasSet.add(subcat);
  }
  const subcategoriasArr = Array.from(subcategoriasSet);
  const subcategorias = `Listas!$${subcatLtr}$2:$${subcatLtr}$${subcategoriasArr.length + 1}`;
  col++;

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

  const boolLtr  = colLetter(col);
  const booleanos = `Listas!$${boolLtr}$2:$${boolLtr}$3`;

  return {
    secciones,
    categorias,
    subcategorias,
    tipos,
    booleanos,
    data: { categorias: categorias_list, subcategorias: subcategoriasArr, tipos: tiposArr },
  };
}

function construirHojaListas(wb, refs) {
  const wsL = wb.addWorksheet('Listas');
  let col = 1;

  wsL.getCell(1, col).value = '_SECCIONES';
  SECCIONES.forEach((s, i) => { wsL.getCell(i + 2, col).value = s; });
  col++;

  wsL.getCell(1, col).value = '_CATEGORIAS';
  refs.data.categorias.forEach((c, i) => { wsL.getCell(i + 2, col).value = c; });
  col++;

  wsL.getCell(1, col).value = '_SUBCATEGORIAS';
  refs.data.subcategorias.forEach((s, i) => { wsL.getCell(i + 2, col).value = s; });
  col++;

  wsL.getCell(1, col).value = '_TIPOS';
  refs.data.tipos.forEach((t, i) => { wsL.getCell(i + 2, col).value = t; });
  col++;

  wsL.getCell(1, col).value = '_BOOLEANOS';
  wsL.getCell(2, col).value = 'SI';
  wsL.getCell(3, col).value = 'NO';
  wsL.state = 'hidden';
}

function safeNum(val) {
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

function calcPct(precio, precioOferta) {
  if (precio && precioOferta && precio > 0 && precioOferta < precio) {
    return Math.round(((precio - precioOferta) / precio) * 100);
  }
  return 0;
}

// ─── Obtener proveedores únicos ───────────────────────────────────────────────
async function fetchProveedores(strapi) {
  const todos = [];
  let page    = 1;

  while (true) {
    const resultado = await strapi.documents(UID_PRODUCTO).findMany({
      fields:  ['proveedor'],
      limit:   PAGE_SIZE,
      start:   (page - 1) * PAGE_SIZE,
      status:  'published',
    });
    if (!resultado || resultado.length === 0) break;
    todos.push(...resultado);
    if (resultado.length < PAGE_SIZE) break;
    page++;
  }

  return [...new Set(
    todos
      .map(p => (p.proveedor || '').trim())
      .filter(p => p.length > 0)
  )].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
}

// ─── Traer productos filtrados por proveedor ──────────────────────────────────
async function fetchProductosPorProveedor(strapi, proveedores) {
  const todos = [];
  let page    = 1;

  while (true) {
    const resultado = await strapi.documents(UID_PRODUCTO).findMany({
      filters:  { proveedor: { $in: proveedores } },
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
      limit:    PAGE_SIZE,
      start:    (page - 1) * PAGE_SIZE,
      status:   'published',
    });
    if (!resultado || resultado.length === 0) break;
    todos.push(...resultado);
    if (resultado.length < PAGE_SIZE) break;
    page++;
  }

  // Proveedor A→Z, luego Nombre A→Z dentro de cada proveedor
  todos.sort((a, b) => {
    const pa = (a.proveedor || '').toLowerCase().trim();
    const pb = (b.proveedor || '').toLowerCase().trim();
    if (pa !== pb) return pa < pb ? -1 : 1;
    const na = (a.nombre || '').toLowerCase().trim();
    const nb = (b.nombre || '').toLowerCase().trim();
    return na < nb ? -1 : na > nb ? 1 : 0;
  });

  return todos;
}

// ─── Generador del Excel ──────────────────────────────────────────────────────
// Hoja única estilo comparacion-admin:
//   Producto Padre (fila en negrita)
//     ↳ Variante 1 (indentada, tono azul)
//     ↳ Variante 2
//
// Orden de columnas:
//   A: ID / ID Variante
//   B: SKU / EAN
//   C: Proveedor
//   D: Nombre
//   E: Sección
//   F: Categoría
//   G: Subcategoría
//   H: Tipo
//   I: Publicado
//   J: Destacado
//   K: Tamaño / Variante
//   L: Stock
//   M: Precio
//   N: Precio Oferta
//   O: % Descuento
async function generarExcelProveedor(strapi, proveedores) {
  strapi.log.info(`[ExportacionProveedoresAdmin] Obteniendo productos para: ${proveedores.join(', ')}...`);
  const productos = await fetchProductosPorProveedor(strapi, proveedores);
  strapi.log.info(`[ExportacionProveedoresAdmin] ${productos.length} productos obtenidos`);

  const wb   = new ExcelJS.Workbook();
  wb.creator = 'Marybe';
  wb.created = new Date();

  // Pre-calcular referencias para los dropdowns (la hoja Listas se crea al final)
  const refs = calcularRefs();

  const provNombres = proveedores.length <= 3
    ? proveedores.join(', ')
    : `${proveedores.length} proveedores`;

  const ws = wb.addWorksheet('💲 Precios por Proveedor', {
    properties: { tabColor: { argb: C.violeta } },
    pageSetup:  { fitToPage: true, fitToWidth: 1, orientation: 'landscape' },
    views:      [{ state: 'frozen', xSplit: 0, ySplit: 3 }],
  });

  // ── Columnas (A–O) ────────────────────────────────────────────────────────
  const colDefs = [
    { header: 'ID / ID Variante',             width: 24,  group: 'id'     }, // A  (1)
    { header: 'SKU / EAN',                    width: 22,  group: 'base'   }, // B  (2)
    { header: 'Proveedor',                    width: 26,  group: 'prov'   }, // C  (3)
    { header: 'Nombre',                       width: 52,  group: 'base'   }, // D  (4)
    { header: 'Sección',                      width: 16,  group: 'cat'    }, // E  (5)
    { header: 'Categoría',                    width: 22,  group: 'cat'    }, // F  (6)
    { header: 'Subcategoría',                 width: 22,  group: 'cat'    }, // G  (7)
    { header: 'Tipo',                         width: 22,  group: 'cat'    }, // H  (8)
    { header: 'Publicado',                    width: 12,  group: 'bool'   }, // I  (9)
    { header: 'Destacado',                    width: 12,  group: 'bool'   }, // J  (10)
    { header: 'Tamaño / Variante',            width: 20,  group: 'base'   }, // K  (11)
    { header: 'Stock',                        width: 10,  group: 'base'   }, // L  (12)
    { header: 'Precio',                       width: 14,  group: 'precio' }, // M  (13)
    { header: 'Precio Oferta',                width: 14,  group: 'precio' }, // N  (14)
    { header: '% Desc.',                      width: 10,  group: 'precio' }, // O  (15)
  ];

  ws.columns = colDefs.map(c => ({ width: c.width }));

  // ── Fila 1: Título ────────────────────────────────────────────────────────
  ws.mergeCells('A1:O1');
  const title     = ws.getCell('A1');
  title.value     = `💲 MARYBE — Precios por Proveedor: ${provNombres} (${new Date().toLocaleDateString('es-AR')})`;
  title.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.grisOscuro } };
  title.font      = { bold: true, color: { argb: C.blanco }, size: 14, name: 'Calibri' };
  title.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 36;

  // ── Fila 2: Instrucción ───────────────────────────────────────────────────
  ws.mergeCells('A2:O2');
  const instr = ws.getCell('A2');
  instr.value = `⚠ Generado el ${new Date().toLocaleString('es-AR')} — ${productos.length} productos. Las variantes aparecen indentadas (↳) debajo de su producto padre. Columnas E–J tienen listas desplegables. Columnas en verde: Precio / Precio Oferta.`;
  applyStyle(instr, noteStyle());
  ws.getRow(2).height = 28;

  // ── Fila 3: Headers ───────────────────────────────────────────────────────
  const rowHeader = ws.getRow(3);
  colDefs.forEach((c, i) => {
    const cell  = rowHeader.getCell(i + 1);
    cell.value  = c.header;
    const color = c.group === 'id'     ? C.grisOscuro
      : c.group === 'prov'   ? C.violeta
      : c.group === 'precio' ? C.verde
      : c.group === 'cat'    ? C.azul
      : c.group === 'bool'   ? 'FF059669'
      : C.azul;
    applyStyle(cell, headerStyle(color));
  });
  rowHeader.height = 30;

  // ── Filas de datos ────────────────────────────────────────────────────────
  let rowIdx         = 3;
  let totalVariantes = 0;

  for (const prod of productos) {
    rowIdx++;
    const isEven    = rowIdx % 2 === 0;
    const bgProd    = isEven ? C.blanco : C.grisClaro;
    const variantes = prod.variantes || [];
    const padreId   = prod.id_original || String(prod.id || '');

    // Precio del padre — con fallback desde variante fantasma
    let precioNum       = safeNum(prod.precio);
    let precioOfertaNum = safeNum(prod.precio_oferta);

    if (precioNum === null && variantes.length > 0) {
      const v1 = variantes.find(v => v.id_original === `${padreId}-v1`);
      if (v1) {
        precioNum       = safeNum(v1.precio);
        if (precioOfertaNum === null) precioOfertaNum = safeNum(v1.precio_oferta);
      } else if (variantes.length === 1) {
        const v = variantes[0];
        if (!(v.volumen || '').trim() && !(v.color_nombre || '').trim()) {
          precioNum       = safeNum(v.precio);
          if (precioOfertaNum === null) precioOfertaNum = safeNum(v.precio_oferta);
        }
      }
    }
    const pctDesc = calcPct(precioNum, precioOfertaNum);

    // Variantes reales (sin fantasmas ni únicas-vacías)
    const variantesLimpias = variantes.filter(v => {
      const esV1         = v.id_original === `${padreId}-v1`;
      const esUnicaVacia = variantes.length === 1
        && !(v.volumen || '').trim()
        && !(v.color_nombre || '').trim();
      return !(esV1 || esUnicaVacia);
    });

    // ── Fila del Producto Padre ───────────────────────────────────────────
    const rProd = ws.getRow(rowIdx);
    rProd.height = 22;

    // A: ID
    const cA = rProd.getCell(1);
    cA.value  = padreId;
    cA.numFmt = '@';
    applyStyle(cA, dataStyle(bgProd));
    cA.font   = { bold: true, color: { argb: C.grisOscuro }, size: 10, name: 'Calibri' };

    // B: SKU/EAN
    const cB = rProd.getCell(2);
    cB.value  = prod.sku || '';
    applyStyle(cB, dataStyle(bgProd));

    // C: Proveedor
    const cC = rProd.getCell(3);
    cC.value  = prod.proveedor || '';
    applyStyle(cC, dataStyle(bgProd));
    cC.font   = { bold: true, color: { argb: '5B21B6' }, size: 10, name: 'Calibri' };

    // D: Nombre
    const cD = rProd.getCell(4);
    cD.value  = prod.nombre || '';
    applyStyle(cD, dataStyle(bgProd));
    cD.font   = { bold: true, color: { argb: C.grisOscuro }, size: 10, name: 'Calibri' };

    // Resolver Categoría / Subcategoría / Tipo desde la relación (igual que exportacion-admin)
    const catRelacion     = prod.categoria || null;
    const categoriaNombre = catRelacion?.nombre || '';
    const seccionVal      = prod.seccion || catRelacion?.seccion || '';
    let subcategoriaVal   = (prod.subcategoria || '').trim();
    if (!subcategoriaVal && catRelacion?.subcategorias?.length > 0) {
      subcategoriaVal = catRelacion.subcategorias[0]?.nombre || '';
    }
    let tipoVal = (prod.tipo || '').trim();
    if (!tipoVal && catRelacion?.subcategorias?.length > 0) {
      const subcatMatch = subcategoriaVal
        ? catRelacion.subcategorias.find(s => s.nombre === subcategoriaVal)
        : catRelacion.subcategorias[0];
      if (subcatMatch?.tipos?.length > 0) tipoVal = subcatMatch.tipos[0]?.nombre || '';
    }
    const boolStr = val => (val === true || val === 1 || String(val).toLowerCase() === 'true' || String(val).toLowerCase() === 'si') ? 'SI' : 'NO';

    // E: Sección
    const cE = rProd.getCell(5);
    cE.value  = seccionVal;
    applyStyle(cE, dataStyle(isEven ? C.azulClaro : 'FFBFDBFE'));
    cE.font   = { color: { argb: '1E3A5F' }, size: 10, name: 'Calibri' };

    // F: Categoría
    const cF = rProd.getCell(6);
    cF.value  = categoriaNombre;
    applyStyle(cF, dataStyle(isEven ? C.azulClaro : 'FFBFDBFE'));
    cF.font   = { color: { argb: '1E3A5F' }, size: 10, name: 'Calibri' };

    // G: Subcategoría
    const cG2 = rProd.getCell(7);
    cG2.value  = subcategoriaVal;
    applyStyle(cG2, dataStyle(isEven ? C.azulClaro : 'FFBFDBFE'));
    cG2.font   = { color: { argb: '1E3A5F' }, size: 10, name: 'Calibri' };

    // H: Tipo
    const cH2 = rProd.getCell(8);
    cH2.value  = tipoVal;
    applyStyle(cH2, dataStyle(isEven ? C.azulClaro : 'FFBFDBFE'));
    cH2.font   = { color: { argb: '1E3A5F' }, size: 10, name: 'Calibri' };

    // I: Publicado
    const cI2 = rProd.getCell(9);
    cI2.value = boolStr(prod.publicado);
    applyStyle(cI2, dataStyle(bgProd));
    cI2.font  = { bold: true, color: { argb: cI2.value === 'SI' ? 'FF16A34A' : 'FFEF4444' }, size: 10, name: 'Calibri' };
    cI2.alignment = { vertical: 'middle', horizontal: 'center' };

    // J: Destacado
    const cJ = rProd.getCell(10);
    cJ.value = boolStr(prod.destacado);
    applyStyle(cJ, dataStyle(bgProd));
    cJ.font  = { bold: true, color: { argb: cJ.value === 'SI' ? 'FF16A34A' : 'FFEF4444' }, size: 10, name: 'Calibri' };
    cJ.alignment = { vertical: 'middle', horizontal: 'center' };

    // K: Tamaño (vacío en padre)
    const cK = rProd.getCell(11);
    cK.value  = '';
    applyStyle(cK, dataStyle(bgProd));

    // L: Stock (solo si no tiene variantes reales)
    const cL = rProd.getCell(12);
    cL.value     = variantesLimpias.length === 0 ? (prod.stock ?? '') : '';
    applyStyle(cL, dataStyle(bgProd));
    cL.alignment = { vertical: 'middle', horizontal: 'center' };

    // M: Precio
    const cM = rProd.getCell(13);
    if (precioNum !== null) cM.value = precioNum;
    applyStyle(cM, dataStyle(isEven ? C.verdeClaro : 'FFD1FAE5'));
    cM.font      = { bold: true, color: { argb: '065F46' }, size: 10, name: 'Calibri' };
    cM.alignment = { vertical: 'middle', horizontal: 'right' };

    // N: Precio Oferta
    const cN = rProd.getCell(14);
    if (precioOfertaNum !== null) cN.value = precioOfertaNum;
    applyStyle(cN, dataStyle(isEven ? C.verdeClaro : 'FFD1FAE5'));
    cN.font      = { bold: true, color: { argb: '065F46' }, size: 10, name: 'Calibri' };
    cN.alignment = { vertical: 'middle', horizontal: 'right' };

    // O: % Descuento
    const cO = rProd.getCell(15);
    cO.value = {
      formula: `IF(M${rowIdx}>0, IF(AND(N${rowIdx}<>"", N${rowIdx}<M${rowIdx}), 1 - N${rowIdx}/M${rowIdx}, 0), 0)`
    };
    applyStyle(cO, readonlyStyle());
    cO.font      = { color: { argb: 'FF065F46' }, size: 10, name: 'Calibri', italic: true };
    cO.alignment = { vertical: 'middle', horizontal: 'center' };
    cO.numFmt    = '0%';

    rProd.commit();

    // ── Filas de Variantes ────────────────────────────────────────────────
    for (const v of variantesLimpias) {
      rowIdx++;
      totalVariantes++;

      const rVar  = ws.getRow(rowIdx);
      rVar.height = 20;
      const bgVar = isEven ? C.azulClaro : 'FFEFF6FF';

      const precioV       = safeNum(v.precio);
      const precioOfertaV = safeNum(v.precio_oferta);
      const pctDescV      = calcPct(precioV, precioOfertaV);
      const tamanio       = [v.volumen, v.color_nombre].filter(Boolean).join(' / ');

      // A: ID Variante (indentado con ↳)
      const vA = rVar.getCell(1);
      vA.value  = v.id_original ? `  ↳ ${v.id_original}` : '';
      vA.numFmt = '@';
      applyStyle(vA, dataStyle(bgVar));
      vA.font   = { color: { argb: '1E40AF' }, size: 9, name: 'Calibri', italic: true };

      // B: SKU/EAN variante
      const vB = rVar.getCell(2);
      vB.value  = v.sku_ean || '';
      applyStyle(vB, dataStyle(bgVar));
      vB.font   = { color: { argb: '1E40AF' }, size: 9, name: 'Calibri' };

      // C: Proveedor (heredado del padre)
      const vC = rVar.getCell(3);
      vC.value  = prod.proveedor || '';
      applyStyle(vC, dataStyle(bgVar));
      vC.font   = { color: { argb: '6D28D9' }, size: 9, name: 'Calibri', italic: true };

      // D: Nombre + identificador de variante
      const vD      = rVar.getCell(4);
      const volDesc = v.volumen      ? ` — ${v.volumen}`      : '';
      const colDesc = v.color_nombre ? ` (${v.color_nombre})` : '';
      vD.value  = `    ${prod.nombre || ''}${volDesc}${colDesc}`;
      applyStyle(vD, dataStyle(bgVar));
      vD.font   = { color: { argb: '1E40AF' }, size: 9, name: 'Calibri', italic: true };

      // E–H: Categoría (heredada del padre, solo referencia visual — no editable en variante)
      const catBg = isEven ? 'FFD1D5DB' : 'FFE5E7EB'; // gris claro para indicar que no es editable
      [5, 6, 7, 8].forEach(col => {
        const vc = rVar.getCell(col);
        vc.value = '';
        applyStyle(vc, dataStyle(catBg));
      });

      // I: Publicado (de la variante)
      const vI2 = rVar.getCell(9);
      vI2.value = boolStr(v.publicado);
      applyStyle(vI2, dataStyle(bgVar));
      vI2.font  = { bold: true, color: { argb: vI2.value === 'SI' ? 'FF16A34A' : 'FFEF4444' }, size: 9, name: 'Calibri' };
      vI2.alignment = { vertical: 'middle', horizontal: 'center' };

      // J: Destacado (vacío en variante)
      const vJ = rVar.getCell(10);
      vJ.value = '';
      applyStyle(vJ, dataStyle(bgVar));

      // K: Tamaño / Variante
      const vK = rVar.getCell(11);
      vK.value  = tamanio || '';
      applyStyle(vK, dataStyle(bgVar));
      vK.font   = { bold: !!tamanio, color: { argb: '1E40AF' }, size: 9, name: 'Calibri' };

      // L: Stock variante
      const vL = rVar.getCell(12);
      vL.value     = v.stock !== undefined && v.stock !== null ? Number(v.stock) : '';
      applyStyle(vL, dataStyle(bgVar));
      vL.alignment = { vertical: 'middle', horizontal: 'center' };
      vL.font      = { color: { argb: '1E40AF' }, size: 9, name: 'Calibri' };

      // M: Precio variante
      const vM = rVar.getCell(13);
      if (precioV !== null) vM.value = precioV;
      applyStyle(vM, dataStyle(isEven ? C.verdeClaro : 'FFD1FAE5'));
      vM.font      = { bold: true, color: { argb: '065F46' }, size: 9, name: 'Calibri' };
      vM.alignment = { vertical: 'middle', horizontal: 'right' };

      // N: Precio Oferta variante
      const vN = rVar.getCell(14);
      if (precioOfertaV !== null) vN.value = precioOfertaV;
      applyStyle(vN, dataStyle(isEven ? C.verdeClaro : 'FFD1FAE5'));
      vN.font      = { bold: true, color: { argb: '065F46' }, size: 9, name: 'Calibri' };
      vN.alignment = { vertical: 'middle', horizontal: 'right' };

      // O: % Descuento variante
      const vO = rVar.getCell(15);
      vO.value = {
        formula: `IF(M${rowIdx}>0, IF(AND(N${rowIdx}<>"", N${rowIdx}<M${rowIdx}), 1 - N${rowIdx}/M${rowIdx}, 0), 0)`
      };
      applyStyle(vO, readonlyStyle());
      vO.font      = { color: { argb: 'FF065F46' }, size: 9, name: 'Calibri', italic: true };
      vO.alignment = { vertical: 'middle', horizontal: 'center' };
      vO.numFmt    = '0%';

      rVar.commit();
    }
  }

  // ── Validaciones en bloque (dropdowns) ─────────────────────────────────────
  const EXTRA_ROWS = 300;
  const lastRow    = rowIdx + EXTRA_ROWS;

  ws.dataValidations.add(`E4:E${lastRow}`, {
    type: 'list', allowBlank: true, showErrorMessage: false,
    formulae: [refs.secciones],
  });
  ws.dataValidations.add(`F4:F${lastRow}`, {
    type: 'list', allowBlank: true, showErrorMessage: false,
    formulae: [refs.categorias],
  });
  ws.dataValidations.add(`G4:G${lastRow}`, {
    type: 'list', allowBlank: true, showErrorMessage: false,
    formulae: [refs.subcategorias],
  });
  ws.dataValidations.add(`H4:H${lastRow}`, {
    type: 'list', allowBlank: true, showErrorMessage: false,
    formulae: [refs.tipos],
  });
  ws.dataValidations.add(`I4:I${lastRow}`, {
    type: 'list', allowBlank: true, showErrorMessage: false,
    formulae: [refs.booleanos],
  });
  ws.dataValidations.add(`J4:J${lastRow}`, {
    type: 'list', allowBlank: true, showErrorMessage: false,
    formulae: [refs.booleanos],
  });

  // Crear la hoja Listas al final (igual que en exportacion-admin)
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
  fetchProveedores,
  generarExcelProveedor,
});
