/**
 * excel-to-csv.js
 * Lee la Plantilla_Marybe.xlsx y genera:
 *   Backend/data/productos.csv
 *   Backend/data/variantes.csv
 *
 * Uso: node Backend/scripts/excel-to-csv.js
 */

const ExcelJS    = require('exceljs');
const { stringify } = require('csv-stringify/sync');
const path       = require('path');
const fs         = require('fs');

const XLSX_INPUT   = path.join(__dirname, '../data/Plantilla_Marybe.xlsx');
const OUT_DIR      = path.join(__dirname, '../data');
const OUT_PRODUCTOS = path.join(OUT_DIR, 'productos.csv');
const OUT_VARIANTES = path.join(OUT_DIR, 'variantes.csv');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// Columnas Hoja 1 (Productos): fila 3 es el header real
// A=id_original, B=sku, C=nombre, D=marca, E=seccion, F=categoria,
// G=subcategoria, H=descripcion_corta, I=proveedor, J=publicado, K=destacado, L=moneda

// Columnas Hoja 2 (Variantes): fila 3 es el header real
// A=id_original, B=producto_padre_id, C=nombre_padre, D=sku_ean, E=volumen,
// F=stock, G=precio, H=pct_descuento, I=precio_oferta (calculado),
// J=publicado, K=envio, L=moneda, M=color_nombre

const HEADER_ROW = 3;

function cellVal(row, colIndex) {
  const cell = row.getCell(colIndex);
  if (!cell || cell.value === null || cell.value === undefined) return '';
  // Si es resultado de fórmula, usar el valor calculado
  if (cell.value && typeof cell.value === 'object' && 'result' in cell.value) {
    const r = cell.value.result;
    if (r === null || r === undefined) return '';
    return String(r).trim();
  }
  // Si es RichText (texto con formato como negrita/colores parciales)
  if (cell.value && cell.value.richText) {
    return cell.value.richText.map(rt => rt.text).join('').trim();
  }
  // Si es número directo de JS (ExcelJS devuelve así los campos numéricos)
  if (typeof cell.value === 'number') {
    return String(cell.value);
  }
  return String(cell.value).trim();
}

function isSeparatorOrEmpty(row) {
  const a = cellVal(row, 1);
  // Separador visual: la celda A empieza con '═' o es vacía
  return a === '' || a.startsWith('═') || a.startsWith('→');
}

async function main() {
  console.log(`📂 Leyendo: ${XLSX_INPUT}`);

  if (!fs.existsSync(XLSX_INPUT)) {
    console.error('❌ No se encontró el archivo. Generalo primero con:');
    console.error('   node Backend/scripts/generar-plantilla.js');
    process.exit(1);
  }

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(XLSX_INPUT);

  // ── Hoja 1: Productos ─────────────────────────────────────────────────────
  const wsP = wb.getWorksheet('📦 Productos') || wb.worksheets[0];
  if (!wsP) { console.error('❌ No se encontró la hoja de Productos.'); process.exit(1); }

  const productosRows = [];
  wsP.eachRow((row, rowNum) => {
    if (rowNum <= HEADER_ROW) return;       // saltar título + instrucción + header
    if (isSeparatorOrEmpty(row)) return;    // saltar separadores y guías

    const id_original = cellVal(row, 1);
    if (!id_original) return;

    productosRows.push({
      id_original,
      sku:                  cellVal(row, 2),
      nombre:               cellVal(row, 3),
      marca:                cellVal(row, 4),
      seccion:              cellVal(row, 5),
      categoria:            cellVal(row, 6),
      subcategoria:         cellVal(row, 7),
      descripcion_corta:    cellVal(row, 8),
      descripcion_completa: cellVal(row, 9),
      especificaciones:     cellVal(row, 10),
      proveedor:            cellVal(row, 11),
      publicado:            cellVal(row, 12),
      destacado:            cellVal(row, 13) || 'FALSE',
      moneda:               cellVal(row, 14) || 'ARS',
      caracteristicas:      cellVal(row, 15),
    });
  });

  // ── Hoja 2: Variantes ─────────────────────────────────────────────────────
  const wsV = wb.getWorksheet('🔗 Variantes') || wb.worksheets[1];
  if (!wsV) { console.error('❌ No se encontró la hoja de Variantes.'); process.exit(1); }

  const variantesRows = [];
  wsV.eachRow((row, rowNum) => {
    if (rowNum <= HEADER_ROW) return;
    if (isSeparatorOrEmpty(row)) return;

    const id_original = cellVal(row, 1);
    if (!id_original) return;

    const precio        = parseFloat(cellVal(row, 7)) || 0;
    const pct_descuento = parseFloat(cellVal(row, 8)) || 0;
    const precio_oferta_raw = cellVal(row, 9);

    // DEBUG: mostrar qué se lee en cada fila
    console.log(`  [Fila ${rowNum}] ID=${id_original} | padre=${cellVal(row,2)} | sku=${cellVal(row,4)} | vol=${cellVal(row,5)} | stock=${cellVal(row,6)} | precio=${cellVal(row,7)} | dcto=${cellVal(row,8)} | precio_oferta=${precio_oferta_raw}`);
    if (precio === 0) {
      console.warn(`  ⚠ PRECIO=0 en fila ${rowNum}. Valor crudo col G(7): "${cellVal(row,7)}" | Revisar que la col G del Excel tenga el precio numérico sin formato de texto.`);
    }
    
    // Preferir el valor calculado de la fórmula; si no, calcularlo nosotros
    let precio_oferta = '';
    if (precio_oferta_raw && parseFloat(precio_oferta_raw) > 0) {
      precio_oferta = precio_oferta_raw;
    } else if (pct_descuento > 0 && precio > 0) {
      precio_oferta = String(Math.round(precio * (1 - pct_descuento / 100) * 100) / 100);
    }

    variantesRows.push({
      id_original,
      producto_padre_id: cellVal(row, 2),
      sku_ean:           cellVal(row, 4),
      volumen:           cellVal(row, 5),
      stock:             cellVal(row, 6) || '0',
      precio:            String(precio),
      pct_descuento:     String(pct_descuento || ''),
      precio_oferta,
      publicado:         cellVal(row, 10) || 'TRUE',
      envio:             cellVal(row, 11) || '1',
      moneda:            cellVal(row, 12) || 'ARS',
      color_nombre:      cellVal(row, 13) || '',
    });
  });

  // ── Escribir CSVs ──────────────────────────────────────────────────────────
  fs.writeFileSync(OUT_PRODUCTOS, stringify(productosRows, { header: true }), 'utf8');
  fs.writeFileSync(OUT_VARIANTES, stringify(variantesRows, { header: true }), 'utf8');

  console.log(`\n✅ productos.csv → ${productosRows.length} productos`);
  console.log(`✅ variantes.csv  → ${variantesRows.length} variantes`);

  // Mostrar preview
  if (productosRows.length > 0) {
    console.log('\n📦 Preview Productos:');
    productosRows.slice(0, 3).forEach(p =>
      console.log(`   [${p.id_original}] ${p.nombre} | ${p.seccion} > ${p.categoria} > ${p.subcategoria}`)
    );
  }
  if (variantesRows.length > 0) {
    console.log('\n🔗 Preview Variantes:');
    variantesRows.slice(0, 3).forEach(v =>
      console.log(`   [${v.id_original}→${v.producto_padre_id}] ${v.volumen || '-'} | Color: ${v.color_nombre || 'sin color'} | Precio: $${v.precio} | Oferta: $${v.precio_oferta || '-'} | ${v.pct_descuento ? v.pct_descuento + '%' : 'sin dcto'}`)
    );
  }
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
