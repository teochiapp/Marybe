/**
 * split-csv.js
 * Procesa el CSV original y genera:
 *   Backend/data/productos.csv   → filas padre (sin pipe en ID) o padres referenciados
 *   Backend/data/variantes.csv   → todas las variantes (filas con pipe + simples como auto-variante)
 */

const fs   = require('fs');
const path = require('path');
const { parse }     = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

// ─── Rutas ─────────────────────────────────────────────────────────────────
const CSV_ORIGINAL  = path.join(__dirname, '../../Frontend/src/data/Cambio Pagina.xlsm - Principal (1).csv');
const OUT_PRODUCTOS = path.join(__dirname, '../data/productos.csv');
const OUT_VARIANTES = path.join(__dirname, '../data/variantes.csv');

// ─── Regex para extraer volumen del nombre ──────────────────────────────────
// Ejemplos: "CUTEX x 50" → "50ml" | "BIFERDIL x 200 ML" → "200ml"
function extraerVolumen(detalle) {
  if (!detalle) return '';
  const match = detalle.match(/[xX]\s*(\d+(?:[.,]\d+)?)\s*(ML|ml|G|g|GR|gr|CC|cc|L|l)?/);
  if (match) {
    const num    = match[1].replace(',', '.');
    const unidad = (match[2] || 'ml').toLowerCase().replace('gr', 'g');
    return `${num}${unidad}`;
  }
  return '';
}

// ─── Extraer marca desde el nombre (primera palabra significativa del proveedor) 
function extraerMarca(proveedor) {
  if (!proveedor) return '';
  // Ej: "NEW REVLON ARG (TOIL)" → "REVLON"
  //     "BIFERDIL SRL" → "BIFERDIL"
  //     "LABORATORIO CUENCA SA" → "CUENCA"
  const limpio = proveedor
    .replace(/\(.*?\)/g, '')
    .replace(/\b(SRL|SA|SA|ARG|LAB|LABORATORIO|NEW|GROUP|DIST|DISTRIB|DISTRIBUIDORA|ARGENTINA)\b/gi, '')
    .trim();
  return limpio.split(/\s+/)[0] || proveedor;
}

// ─── Extraer categoría desde el nombre del producto ─────────────────────────
function extraerCategoria(detalle) {
  if (!detalle) return 'General';
  const d = detalle.toUpperCase();
  if (/COLORACI[OÓ]N|TINTE|TINTURA/.test(d))   return 'Coloracion';
  if (/SHAMPOO|CHAMP[UÚ]|SH[AÁ]MPOO/.test(d))  return 'Shampoo';
  if (/ACONDICIONADOR/.test(d))                  return 'Acondicionador';
  if (/CREMA|LOCION|LOC[IÍ]ON/.test(d))          return 'Cremas';
  if (/QUITAESMALTE/.test(d))                    return 'Quitaesmalte';
  if (/ESMALTE|NAIL/.test(d))                    return 'Esmaltes';
  if (/DEPILATORIA|DEPILACION/.test(d))          return 'Depilacion';
  if (/CERA\s+CAPILAR|GOMA|GEL/.test(d))        return 'Fijacion';
  if (/PERFUME|EAU DE|COLONIA/.test(d))          return 'Perfumeria';
  if (/MAQUILLAJE|MASCARA|LABIAL|RUBOR/.test(d)) return 'Maquillaje';
  if (/SERUM|S[EÉ]RUM/.test(d))                 return 'Serum';
  if (/SUN|SOLAR|BLOQUEADOR/.test(d))            return 'Solar';
  return 'Cuidado Personal';
}

// ─── Main ───────────────────────────────────────────────────────────────────
function main() {
  console.log('📂 Leyendo CSV original...');
  const raw  = fs.readFileSync(CSV_ORIGINAL);
  // Detectar encoding — si tiene BOM UTF-8 (EF BB BF)
  const hasBOM = raw[0] === 0xEF && raw[1] === 0xBB && raw[2] === 0xBF;
  const texto  = raw.toString(hasBOM ? 'utf8' : 'latin1').replace(/^\uFEFF/, '');

  const filas = parse(texto, {
    columns:          true,
    skip_empty_lines: true,
    trim:             true,
    relax_quotes:     true,
  });

  console.log(`✅ ${filas.length} filas totales`);

  // ── Separar padres e hijos ─────────────────────────────────────────────
  const padresMap  = new Map(); // id_original → fila
  const hijosMap   = new Map(); // id_padre    → [filas hijo]

  for (const fila of filas) {
    const rawId = (fila['ID'] || '').trim();
    if (rawId.includes('|')) {
      const [idHijo, idPadre] = rawId.split('|');
      const lista = hijosMap.get(idPadre) || [];
      lista.push({ ...fila, _idHijo: idHijo, _idPadre: idPadre });
      hijosMap.set(idPadre, lista);
    } else {
      padresMap.set(rawId, fila);
    }
  }

  console.log(`📦 Padres/simples: ${padresMap.size}`);
  console.log(`🔗 Padres con variantes: ${hijosMap.size}`);
  console.log(`🔢 Filas variante total: ${[...hijosMap.values()].flat().length}`);

  // ── Construir productos.csv ────────────────────────────────────────────
  const productosRows = [];
  for (const [idOriginal, fila] of padresMap) {
    productosRows.push({
      id_original:       idOriginal,
      sku:               (fila['Codigo EAN'] || idOriginal).trim(),
      nombre:            (fila['Detalle'] || '').trim(),
      marca:             extraerMarca(fila['Proveedor'] || ''),
      categoria:         extraerCategoria(fila['Detalle'] || ''),
      descripcion_corta: (fila['Deta'] || '').trim(),
      proveedor:         (fila['Proveedor'] || '').trim(),
      publicado:         fila['Publica'] === '1' ? 'true' : 'false',
      moneda:            (fila['Moneda'] || 'ARS').trim(),
    });
  }

  // ── Construir variantes.csv ────────────────────────────────────────────
  const variantesRows = [];

  // Variantes hijas (filas con pipe)
  for (const [idPadre, hijos] of hijosMap) {
    for (const h of hijos) {
      variantesRows.push({
        id_original:     h._idHijo,
        producto_padre_id: idPadre,
        sku_ean:         (h['Codigo EAN'] || '').trim(),
        volumen:         extraerVolumen(h['Detalle'] || ''),
        stock:           h['Stock'] || '0',
        precio:          h['Precio'] || '0',
        precio_oferta:   h['Oferta'] || '',
        publicado:       h['Publica'] === '1' ? 'true' : 'false',
        envio:           h['Envio'] || '',
        moneda:          (h['Moneda'] || 'ARS').trim(),
      });
    }
  }

  // Productos simples → se auto-referencian como su propia variante
  for (const [idOriginal, fila] of padresMap) {
    if (!hijosMap.has(idOriginal)) {
      variantesRows.push({
        id_original:       idOriginal,
        producto_padre_id: idOriginal,
        sku_ean:           (fila['Codigo EAN'] || idOriginal).trim(),
        volumen:           extraerVolumen(fila['Detalle'] || ''),
        stock:             fila['Stock'] || '0',
        precio:            fila['Precio'] || '0',
        precio_oferta:     fila['Oferta'] || '',
        publicado:         fila['Publica'] === '1' ? 'true' : 'false',
        envio:             fila['Envio'] || '',
        moneda:            (fila['Moneda'] || 'ARS').trim(),
      });
    }
  }

  // ── Escribir archivos ──────────────────────────────────────────────────
  fs.writeFileSync(OUT_PRODUCTOS, stringify(productosRows, { header: true }), 'utf8');
  fs.writeFileSync(OUT_VARIANTES, stringify(variantesRows, { header: true }), 'utf8');

  console.log(`\n✅ Generado: Backend/data/productos.csv  → ${productosRows.length} filas`);
  console.log(`✅ Generado: Backend/data/variantes.csv  → ${variantesRows.length} filas`);

  // ── Estadísticas ───────────────────────────────────────────────────────
  const conVariantes = [...padresMap.keys()].filter(id => hijosMap.has(id));
  const simples      = [...padresMap.keys()].filter(id => !hijosMap.has(id));
  console.log(`\n📊 Estadísticas:`);
  console.log(`   Productos con variantes agrupadas : ${conVariantes.length}`);
  console.log(`   Productos simples (sin hijos)     : ${simples.length}`);
  console.log(`   Total entries Strapi a crear      : ${padresMap.size}`);
}

main();
