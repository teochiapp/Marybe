/**
 * diagnostico_v1.js
 * Analiza el archivo de IMPORTACION (28 jul) para encontrar por qué
 * los productos 4970-4978+ quedan sin variantes reales y generan -v1 al exportar.
 *
 * Uso: node Backend/scripts/diagnostico_v1.js
 */
const ExcelJS = require('exceljs');
const path    = require('path');

// El archivo que los clientes subieron para importar
const IMPORT_FILE  = path.join(__dirname, '../../Frontend/Exportacion_Marybe_2026-07-28 (1).xlsx');
// El archivo resultante después de importar (tiene los -v1)
const EXPORT_FILE  = path.join(__dirname, '../../Frontend/Exportacion_Marybe_2026-07-10 (4).xlsx');

const HEADER_ROW = 3;

function cellVal(row, colIndex) {
  const cell = row.getCell(colIndex);
  if (!cell || cell.value === null || cell.value === undefined) return '';
  if (cell.value && typeof cell.value === 'object' && 'result' in cell.value)
    return cell.value.result !== null ? String(cell.value.result).trim() : '';
  if (cell.value && typeof cell.value === 'object' && 'formula' in cell.value) return '';
  if (cell.value && typeof cell.value === 'object') return '';
  if (cell.value && cell.value.richText)
    return cell.value.richText.map(rt => rt.text).join('').trim();
  return String(cell.value).trim();
}
function isSep(row) {
  const a = cellVal(row, 1);
  return a === '' || a.startsWith('═') || a.startsWith('→') || a.startsWith('↳');
}

async function leerHojas(archivo) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(archivo);

  const wsP = wb.getWorksheet('📦 Productos') || wb.worksheets.find(ws => !ws.name.includes('Listas') && !ws.name.includes('Colores'));
  const wsV = wb.getWorksheet('🔗 Variantes') || wb.worksheets.find(ws => ws !== wsP && !ws.name.includes('Listas'));

  const productos = [];
  wsP.eachRow((row, rowNum) => {
    if (rowNum <= HEADER_ROW || isSep(row)) return;
    const id = cellVal(row, 1);
    if (!id) return;
    productos.push({
      rowNum,
      id_original: id,
      nombre: cellVal(row, 3),
      seccion: cellVal(row, 5),
      precio: cellVal(row, 16),
    });
  });

  const variantes = [];
  wsV.eachRow((row, rowNum) => {
    if (rowNum <= HEADER_ROW || isSep(row)) return;
    const id = cellVal(row, 1);
    if (!id) return;
    variantes.push({
      rowNum,
      id_original: id,
      producto_padre_id: cellVal(row, 2),
      sku_ean: cellVal(row, 4),
      precio: cellVal(row, 7),
    });
  });

  return { productos, variantes };
}

(async () => {
  console.log('\n' + '═'.repeat(70));
  console.log('📋 DIAGNÓSTICO DE VARIANTES -v1');
  console.log('═'.repeat(70));

  // ── Analizar archivo de IMPORTACIÓN ──────────────────────────────────────────
  console.log(`\n\n📥 ARCHIVO DE IMPORTACIÓN: ${path.basename(IMPORT_FILE)}`);
  const imp = await leerHojas(IMPORT_FILE);
  
  console.log(`   Productos en hoja Productos: ${imp.productos.length}`);
  console.log(`   Variantes en hoja Variantes: ${imp.variantes.length}`);

  // Construir índice de variantes por padre
  const variantesXPadre = new Map();
  for (const v of imp.variantes) {
    const pid = (v.producto_padre_id || '').trim();
    const lista = variantesXPadre.get(pid) || [];
    lista.push(v);
    variantesXPadre.set(pid, lista);
  }

  // Productos sin variantes en el archivo de importación
  const sinVariante = imp.productos.filter(p => {
    const id = (p.id_original || '').trim();
    const hijos = variantesXPadre.get(id) || [];
    return hijos.length === 0;
  });

  console.log(`\n⚠️  PRODUCTOS SIN VARIANTE EN EL EXCEL DE IMPORTACIÓN: ${sinVariante.length}`);
  if (sinVariante.length > 0) {
    console.log('   Estos productos generarán una variante -v1 al exportar:');
    sinVariante.slice(0, 30).forEach(p => {
      console.log(`   Fila ${p.rowNum} | ID="${p.id_original}" | "${p.nombre?.substring(0,50)}" | Precio="${p.precio}"`);
    });
    if (sinVariante.length > 30) console.log(`   ... y ${sinVariante.length - 30} más`);
  }

  // ── Analizar archivo de EXPORTACIÓN resultante ────────────────────────────────
  console.log(`\n\n📤 ARCHIVO DE EXPORTACIÓN RESULTANTE: ${path.basename(EXPORT_FILE)}`);
  const exp = await leerHojas(EXPORT_FILE);
  
  console.log(`   Productos en hoja Productos: ${exp.productos.length}`);
  console.log(`   Variantes en hoja Variantes: ${exp.variantes.length}`);

  // Buscar las -v1 en el export
  const v1variants = exp.variantes.filter(v => v.id_original.endsWith('-v1'));
  console.log(`\n⚠️  VARIANTES -v1 EN EL EXPORT: ${v1variants.length}`);
  if (v1variants.length > 0) {
    v1variants.slice(0, 30).forEach(v => {
      console.log(`   Fila ${v.rowNum} | ID="${v.id_original}" | PadreID="${v.producto_padre_id}" | Precio="${v.precio}"`);
    });
    if (v1variants.length > 30) console.log(`   ... y ${v1variants.length - 30} más`);
  }

  // ── Cruzar: ¿los productos -v1 del export estaban sin variante en el import? ──
  console.log('\n\n── ANÁLISIS CRUZADO:');
  const idsSinVarianteEnImport = new Set(sinVariante.map(p => (p.id_original || '').trim()));
  const v1conPadreEnImport = v1variants.filter(v => {
    const pid = (v.producto_padre_id || '').trim().replace(/-v1$/, '');
    return idsSinVarianteEnImport.has(pid) || idsSinVarianteEnImport.has(v.producto_padre_id?.trim());
  });

  console.log(`   -v1 que SÍ tenían padre sin variante en el import: ${v1conPadreEnImport.length}`);
  
  // ¿Hay -v1 que NO venían de un producto sin variante? (bug inesperado)
  const v1inesperados = v1variants.filter(v => {
    const pid = (v.producto_padre_id || '').trim();
    return !idsSinVarianteEnImport.has(pid);
  });
  console.log(`   -v1 INESPERADOS (su padre SÍ tenía variante en el import): ${v1inesperados.length}`);
  if (v1inesperados.length > 0) {
    console.log('   Estos son los realmente problemáticos:');
    v1inesperados.slice(0, 20).forEach(v => {
      const hijosPadre = variantesXPadre.get(v.producto_padre_id?.trim()) || [];
      console.log(`     ID="${v.id_original}" PadreID="${v.producto_padre_id}" | Variantes del padre en import: ${hijosPadre.length}`);
      hijosPadre.forEach(h => console.log(`       → Hijo: ID="${h.id_original}" precio="${h.precio}"`));
    });
  }

  // ── ¿Hay variantes en el IMPORT cuyo padre_id coincide con los IDs "4970-v1"? ─
  console.log('\n\n── VERIFICACIÓN INVERSA: ¿Las variantes -v1 del export ya estaban en el import como "variantes reales"?');
  const idsV1export = new Set(v1variants.map(v => (v.producto_padre_id || '').trim()));
  for (const pid of [...idsV1export].slice(0, 10)) {
    const hijosEnImport = variantesXPadre.get(pid) || [];
    if (hijosEnImport.length === 0) {
      console.log(`   PadreID="${pid}" → sin variante en import ✅ (comportamiento esperado)`);
    } else {
      console.log(`   PadreID="${pid}" → TENÍA ${hijosEnImport.length} variante(s) en import ❌ (BUG)`);
      hijosEnImport.forEach(h => console.log(`     Variante: ID="${h.id_original}" precio="${h.precio}" padre="${h.producto_padre_id}"`));
    }
  }

  // ── Estadísticas finales ───────────────────────────────────────────────────────
  console.log('\n\n── RESUMEN FINAL:');
  console.log(`   Productos en import:          ${imp.productos.length}`);
  console.log(`   Productos sin variante en import: ${sinVariante.length}`);
  console.log(`   Variantes -v1 en export:      ${v1variants.length}`);
  console.log(`   (Esperado: ≈ ${sinVariante.length}, Real: ${v1variants.length})`);
  if (sinVariante.length !== v1variants.length) {
    console.log(`   ⚠️  DIFERENCIA: ${Math.abs(v1variants.length - sinVariante.length)} productos extra`);
  } else {
    console.log('   ✅ Los números coinciden: todos los -v1 son por productos sin variante.');
  }

  console.log('\n' + '═'.repeat(70) + '\n');
})().catch(err => console.error('Error:', err.stack));
