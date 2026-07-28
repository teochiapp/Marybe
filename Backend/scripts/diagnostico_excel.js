/**
 * diagnostico_excel.js
 * Analiza los Excel subidos y detecta por qué productos de la hoja "Productos"
 * pueden terminar procesándose como variantes.
 *
 * Uso: node Backend/scripts/diagnostico_excel.js
 */

const ExcelJS = require('exceljs');
const path    = require('path');

const ARCHIVOS = [
  path.join(__dirname, '../../Frontend/Exportacion_Marybe_2026-07-10 (3).xlsx'),
  path.join(__dirname, '../../Frontend/Exportacion_Marybe_2026-07-28.xlsx'),
];

const HEADER_ROW = 3;

function cellVal(row, colIndex) {
  const cell = row.getCell(colIndex);
  if (!cell || cell.value === null || cell.value === undefined) return '';
  if (cell.value && typeof cell.value === 'object' && 'result' in cell.value) {
    return cell.value.result !== null && cell.value.result !== undefined
      ? String(cell.value.result).trim()
      : '';
  }
  if (cell.value && cell.value.richText) {
    return cell.value.richText.map(rt => rt.text).join('').trim();
  }
  return String(cell.value).trim();
}

function isSeparatorOrEmpty(row) {
  const a = cellVal(row, 1);
  return a === '' || a.startsWith('═') || a.startsWith('→');
}

async function analizarArchivo(rutaArchivo) {
  console.log('\n' + '═'.repeat(80));
  console.log(`📂  ARCHIVO: ${path.basename(rutaArchivo)}`);
  console.log('═'.repeat(80));

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(rutaArchivo);

  // ── Listar todas las hojas ──────────────────────────────────────────────────
  console.log('\n📋 HOJAS ENCONTRADAS:');
  wb.worksheets.forEach((ws, i) => {
    console.log(`   [${i}] "${ws.name}"  (state: ${ws.state || 'visible'})`);
  });

  // ── Hoja Productos ──────────────────────────────────────────────────────────
  const wsP = wb.getWorksheet('📦 Productos')
    || wb.worksheets.find(ws => ws.name !== 'Listas' && !ws.name.includes('Colores'));

  if (!wsP) {
    console.log('\n❌ NO SE ENCONTRÓ HOJA DE PRODUCTOS');
    return;
  }
  console.log(`\n✅ Hoja Productos detectada: "${wsP.name}"`);

  // Mostrar encabezados reales (fila 3)
  console.log('\n── Encabezados reales (fila 3) en Productos:');
  const hdrRowP = wsP.getRow(3);
  for (let c = 1; c <= 20; c++) {
    const v = cellVal(hdrRowP, c);
    if (v) console.log(`   Col ${c}: "${v}"`);
  }

  // Analizar cada fila de datos
  const productos = [];
  const problemasProductos = [];

  wsP.eachRow((row, rowNum) => {
    if (rowNum <= HEADER_ROW) return;
    if (isSeparatorOrEmpty(row)) return;

    const id_original = cellVal(row, 1);
    if (!id_original) return;

    const nombre   = cellVal(row, 3);
    const seccion  = cellVal(row, 5);
    const publicado = cellVal(row, 12);
    const moneda   = cellVal(row, 14);

    // ── DETECTAR PROBLEMAS ──────────────────────────────────────────────────
    const probs = [];

    // 1. ¿El id_original parece un separador/texto?
    if (id_original.startsWith('═') || id_original.startsWith('→') || id_original.startsWith('↳')) {
      probs.push(`id_original con carácter especial: "${id_original}"`);
    }

    // 2. ¿Nombre vacío?
    if (!nombre) probs.push('nombre VACÍO');

    // 3. ¿Sección vacía?
    if (!seccion) probs.push('sección VACÍA');

    // 4. ¿Columna 14 parece ser "moneda" o "stock"? Detectar desplazamiento de columnas
    const col14 = cellVal(row, 14);
    const col13 = cellVal(row, 13);
    const col12raw = cellVal(row, 12);
    const col15 = cellVal(row, 15);

    // Revisar si col 14 tiene contenido numérico (podría ser stock) o texto inesperado
    if (['ARS', 'USD', 'EUR'].includes(col14)) {
      // OK, moneda en col 14
    } else if (col14 && isNaN(parseFloat(col14))) {
      probs.push(`Col 14 (esperado=Moneda) tiene valor inesperado: "${col14}"`);
    }

    // 5. ¿Fila tiene menos columnas que las esperadas?
    let lastFilledCol = 0;
    for (let c = 18; c >= 1; c--) {
      if (cellVal(row, c) !== '') { lastFilledCol = c; break; }
    }
    if (lastFilledCol < 11) {
      probs.push(`Fila muy corta: solo ${lastFilledCol} columna(s) con datos`);
    }

    productos.push({ rowNum, id_original, nombre, seccion, publicado, lastFilledCol });
    if (probs.length > 0) {
      problemasProductos.push({ rowNum, id_original, nombre, probs });
    }
  });

  console.log(`\n📦 PRODUCTOS LEÍDOS: ${productos.length}`);

  if (problemasProductos.length > 0) {
    console.log(`\n⚠️  FILAS CON PROBLEMAS EN HOJA PRODUCTOS (${problemasProductos.length}):`);
    problemasProductos.slice(0, 30).forEach(p => {
      console.log(`   Fila ${p.rowNum} | ID="${p.id_original}" | Nombre="${p.nombre}"`);
      p.probs.forEach(pr => console.log(`      → ⚠️  ${pr}`));
    });
  } else {
    console.log('   ✅ Sin problemas detectados en las filas de Productos');
  }

  // ── Hoja Variantes ──────────────────────────────────────────────────────────
  const wsV = wb.getWorksheet('🔗 Variantes')
    || wb.worksheets.find(ws => ws.name !== 'Listas' && !ws.name.includes('Colores') && ws !== wsP);

  if (!wsV) {
    console.log('\n❌ NO SE ENCONTRÓ HOJA DE VARIANTES');
    return;
  }
  console.log(`\n✅ Hoja Variantes detectada: "${wsV.name}"`);

  // Mostrar encabezados reales (fila 3)
  console.log('\n── Encabezados reales (fila 3) en Variantes:');
  const hdrRowV = wsV.getRow(3);
  for (let c = 1; c <= 15; c++) {
    const v = cellVal(hdrRowV, c);
    if (v) console.log(`   Col ${c}: "${v}"`);
  }

  // Analizar variantes
  const variantes = [];
  const problemasVariantes = [];
  const idProductosSet = new Set(productos.map(p => p.id_original));

  wsV.eachRow((row, rowNum) => {
    if (rowNum <= HEADER_ROW) return;
    if (isSeparatorOrEmpty(row)) return;

    const id_original       = cellVal(row, 1);
    const producto_padre_id = cellVal(row, 2);
    const nombre_padre_col3 = cellVal(row, 3); // col C = nombre_padre (fórmula VLOOKUP)
    const sku_ean           = cellVal(row, 4);
    const volumen           = cellVal(row, 5);
    const stock             = cellVal(row, 6);
    const precio            = cellVal(row, 7);

    if (!id_original) return;

    const probs = [];

    // ── PROBLEMA CRÍTICO: producto_padre_id vacío ─────────────────────────
    if (!producto_padre_id) {
      probs.push('❌ CRÍTICO: producto_padre_id (col 2) está VACÍO — esta variante NO puede vincularse a ningún producto padre');
    }

    // ── ¿El id de esta variante coincide con un producto padre? ───────────
    if (id_original === producto_padre_id) {
      // Es variante "simple" (misma ID que el padre) — OK
    } else if (!idProductosSet.has(producto_padre_id)) {
      if (producto_padre_id) {
        probs.push(`⚠️  producto_padre_id="${producto_padre_id}" NO existe en la hoja Productos`);
      }
    }

    // ── ¿La col 3 tiene valor? (nombre_padre = fórmula) ──────────────────
    // Si nombre_padre_col3 es "No encontrado" → la relación está rota
    if (nombre_padre_col3 === 'No encontrado') {
      probs.push(`⚠️  La fórmula VLOOKUP en col C devolvió "No encontrado" → padre="${producto_padre_id}" no está en Productos`);
    }

    // ── ¿Precio vacío? ────────────────────────────────────────────────────
    if (!precio || precio === '0') {
      probs.push('⚠️  precio VACÍO o 0');
    }

    variantes.push({ rowNum, id_original, producto_padre_id, nombre_padre_col3, sku_ean, volumen, precio });
    if (probs.length > 0) {
      problemasVariantes.push({ rowNum, id_original, producto_padre_id, nombre_padre_col3, probs });
    }
  });

  console.log(`\n🔗 VARIANTES LEÍDAS: ${variantes.length}`);

  if (problemasVariantes.length > 0) {
    console.log(`\n⚠️  FILAS CON PROBLEMAS EN HOJA VARIANTES (${problemasVariantes.length}):`);
    problemasVariantes.slice(0, 40).forEach(p => {
      console.log(`   Fila ${p.rowNum} | ID="${p.id_original}" | PadreID="${p.producto_padre_id}" | NombrePadre(col3)="${p.nombre_padre_col3}"`);
      p.probs.forEach(pr => console.log(`      → ${pr}`));
    });
  } else {
    console.log('   ✅ Sin problemas detectados en las filas de Variantes');
  }

  // ── ANÁLISIS CRUZADO ────────────────────────────────────────────────────────
  console.log('\n── ANÁLISIS CRUZADO (¿qué variantes tienen padre sin product en Productos?):');

  // Variantes huérfanas (padre no existe en Productos)
  const variantesHuerfanas = variantes.filter(v =>
    v.producto_padre_id && !idProductosSet.has(v.producto_padre_id)
  );
  console.log(`   Variantes con padre inexistente en Productos: ${variantesHuerfanas.length}`);
  variantesHuerfanas.slice(0, 20).forEach(v => {
    console.log(`     Fila ${v.rowNum}: ID="${v.id_original}" padre="${v.producto_padre_id}"`);
  });

  // Variantes sin padre_id
  const variantesSinPadre = variantes.filter(v => !v.producto_padre_id);
  console.log(`   Variantes SIN producto_padre_id: ${variantesSinPadre.length}`);
  variantesSinPadre.slice(0, 20).forEach(v => {
    console.log(`     Fila ${v.rowNum}: ID="${v.id_original}" sku="${v.sku_ean}"`);
  });

  // ── CONCLUSIÓN ──────────────────────────────────────────────────────────────
  console.log('\n── RESUMEN:');
  console.log(`   Productos en hoja Productos: ${productos.length}`);
  console.log(`   Variantes en hoja Variantes: ${variantes.length}`);
  console.log(`   Productos SIN variantes asociadas: ${productos.filter(p => !variantes.some(v => v.producto_padre_id === p.id_original)).length}`);
  console.log(`   Variantes huérfanas (padre no en Productos): ${variantesHuerfanas.length}`);
  console.log(`   Variantes SIN padre_id (col 2 vacía): ${variantesSinPadre.length}`);
}

(async () => {
  for (const archivo of ARCHIVOS) {
    await analizarArchivo(archivo).catch(err => {
      console.error(`\n❌ Error analizando ${path.basename(archivo)}: ${err.message}`);
    });
  }
  console.log('\n' + '═'.repeat(80));
  console.log('FIN DEL DIAGNÓSTICO');
  console.log('═'.repeat(80) + '\n');
})();
