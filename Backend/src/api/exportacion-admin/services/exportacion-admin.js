'use strict';

const ExcelJS = require('exceljs');
const { calcularRefs, aplicarValidacionesClasificacion, construirHojaListas } = require('../../../utils/excel-dropdowns');

// ─── Constantes ───────────────────────────────────────────────────────────────
const UID_PRODUCTO = 'api::producto.producto';
const PAGE_SIZE    = 100;

const {
  C,
  headerStyle,
  dataStyle,
  noteStyle,
  readonlyStyle,
  applyStyle,
  boolStr,
  safeNum,
  calcPct,
  construirHojaVariantes,
} = require('../../../utils/excel-utils');

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

  // ── Ordenar: 1° Proveedor (A→Z, sin proveedor al final), 2° ID Original ──
  productos.sort((a, b) => {
    const provA = (a.proveedor || '').trim().toLowerCase();
    const provB = (b.proveedor || '').trim().toLowerCase();

    // Proveedores vacíos van al final
    if (!provA && provB) return 1;
    if (provA && !provB) return -1;

    const cmpProv = provA.localeCompare(provB, 'es', { sensitivity: 'base' });
    if (cmpProv !== 0) return cmpProv;

    // Dentro del mismo proveedor → ordenar por id_original
    const idA = a.id_original || String(a.id || '');
    const idB = b.id_original || String(b.id || '');
    const numA = parseFloat(idA);
    const numB = parseFloat(idB);
    const ambosSonNumericos = !isNaN(numA) && !isNaN(numB);
    return ambosSonNumericos ? numA - numB : idA.localeCompare(idB, 'es', { numeric: true });
  });

  strapi.log.info('[ExportAdmin] Productos ordenados por Proveedor → ID Original');

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
  instrP.value     = `⚠ Exportación generada el ${new Date().toLocaleString('es-AR')} — ${productos.length} productos. Categoría, Subcategoría y Tipo tienen listas desplegables en cascada; Sección se selecciona por separado.`;
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

  // @ts-ignore
  aplicarValidacionesClasificacion(wsP, refs, 4, lastRow, { cascade: false });
  // @ts-ignore
  wsP.dataValidations.add(`L4:L${lastRow}`, {
    type: 'list', allowBlank: true, showErrorMessage: false,
    formulae: [refs.booleanos],
  });
  // @ts-ignore
  wsP.dataValidations.add(`M4:M${lastRow}`, {
    type: 'list', allowBlank: true, showErrorMessage: false,
    formulae: [refs.booleanos],
  });

  // ══════════════════════════════════════════════════════════════════════════
  // HOJA 2: VARIANTES (A–L)
  // ══════════════════════════════════════════════════════════════════════════
  const { productosSinVariante } = construirHojaVariantes(wb, productos, refs, {
    extraRows: EXTRA_ROWS,
  });

  // ── Hoja Listas al final (Productos → Variantes → Listas) ───────────────
  construirHojaListas(wb, refs, { hidden: true });

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
      categoria:        'Dermocosmetica',
      subcategoria:     'Facial',
      tipo:             'Limpieza Facial',
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
      categoria:        'Cuidado Personal',
      subcategoria:     'Higiene Corporal',
      tipo:             'Jabones Líquidos',
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

  // @ts-ignore
  aplicarValidacionesClasificacion(wsP, refs, 4, lastRow);
  // @ts-ignore
  wsP.dataValidations.add(`L4:L${lastRow}`, {
    type: 'list', allowBlank: true, showErrorMessage: false,
    formulae: [refs.booleanos],
  });
  // @ts-ignore
  wsP.dataValidations.add(`M4:M${lastRow}`, {
    type: 'list', allowBlank: true, showErrorMessage: false,
    formulae: [refs.booleanos],
  });

  // ══════════════════════════════════════════════════════════════════════════
  // HOJA 2: VARIANTES (A–L)
  // ══════════════════════════════════════════════════════════════════════════
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
  construirHojaVariantes(wb, [{ id_original: 'EJEMPLO-002', _variantesEjemplo: variantesEjemplo }], refs, {
    title: '🔗 MARYBE — Variantes de Nuevos Productos',
    instruction: '⚠ Una fila por variante. "ID Producto Padre" debe coincidir con el "ID Original" de la hoja Productos. Borrá las filas de EJEMPLO antes de importar. Si el producto no tiene variantes, dejá esta hoja vacía.',
    extraRows: EXTRA_ROWS,
  });

  // ── Hoja Listas al final ──────────────────────────────────────────────────
  construirHojaListas(wb, refs, { mainSheet: wsP, firstRow: 4, lastRow, hidden: true });

  const buffer = await wb.xlsx.writeBuffer();
  strapi.log.info('[ExportAdmin] ✅ Plantilla vacía MODO_ALTA generada');

  return { buffer };
}

// ─── Exports ──────────────────────────────────────────────────────────────────
module.exports = () => ({
  generarExcel,
  generarExcelVacio,
});
