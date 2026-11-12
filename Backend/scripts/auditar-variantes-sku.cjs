#!/usr/bin/env node
'use strict';

const path = require('node:path');
const fs = require('node:fs');
const Database = require('better-sqlite3');

const file = process.argv[2];
if (!file) {
  console.error('Uso: node scripts/auditar-variantes-sku.cjs <ruta-a-copia-sqlite.db>');
  process.exit(1);
}
const databasePath = path.resolve(file);
if (!fs.existsSync(databasePath)) {
  console.error(`No existe la base: ${databasePath}`);
  process.exit(1);
}

const db = new Database(databasePath, { readonly: true, fileMustExist: true });
db.pragma('query_only = ON');
const tables = new Set(db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all().map(row => row.name));
const columns = table => new Set(db.prepare(`PRAGMA table_info("${table.replace(/"/g, '""')}")`).all().map(row => row.name));
const requiredTables = ['productos', 'productos_cmps', 'components_producto_variantes'];
if (requiredTables.some(table => !tables.has(table))) {
  console.error(`Faltan tablas: ${requiredTables.filter(table => !tables.has(table)).join(', ')}`);
  db.close();
  process.exit(1);
}

const productCols = columns('productos');
const variantCols = columns('components_producto_variantes');
const optional = (alias, cols, name) => cols.has(name) ? `${alias}."${name}" AS "${name}"` : `NULL AS "${name}"`;
const rows = db.prepare(`
  SELECT p.id AS product_row_id, ${optional('p', productCols, 'document_id')},
    p.id_original AS parent_id, p.nombre AS parent_name,
    ${optional('p', productCols, 'published_at')},
    v.id AS variant_id, v.id_original AS variant_original_id,
    v.sku_ean, v.volumen, v.color_nombre, v.stock, v.precio,
    v.precio_oferta, v.publicado, v.envio
  FROM productos p
  JOIN productos_cmps l ON l.entity_id = p.id AND l.field = 'variantes'
  JOIN components_producto_variantes v ON v.id = l.cmp_id
  ORDER BY p.id, v.id
`).all();

const skuKey = value => String(value ?? '').trim().toUpperCase();
const status = row => !productCols.has('published_at') ? 'sin_estado' : row.published_at ? 'publicado' : 'borrador';
const markerV1 = row => String(row.variant_original_id ?? '') === `${row.parent_id}-v1`;
const synthetic = row => markerV1(row) && !skuKey(row.sku_ean) && !String(row.volumen ?? '').trim() && !String(row.color_nombre ?? '').trim();
const detail = row => ({
  estado: status(row), producto_id: row.parent_id, producto: row.parent_name,
  document_id: row.document_id, product_row_id: row.product_row_id,
  variante_id: row.variant_id, id_original: row.variant_original_id,
  sku_ean: row.sku_ean,
});
const groups = new Map();
for (const row of rows) {
  const key = skuKey(row.sku_ean);
  if (!key) continue;
  const stateKey = `${status(row)}\0${key}`;
  if (!groups.has(stateKey)) groups.set(stateKey, []);
  groups.get(stateKey).push(row);
}
const duplicates = [...groups].filter(([, list]) => list.length > 1)
  .map(([key, list]) => ({ sku_ean: key.split('\0')[1], estado: status(list[0]), tipo: new Set(list.map(row => row.document_id || row.parent_id)).size > 1 ? 'entre_productos' : 'dentro_del_producto', variantes: list.map(detail) }));

const signatures = new Map();
const productVersions = db.prepare(`SELECT id, ${productCols.has('document_id') ? 'document_id' : 'id_original AS document_id'}, ${productCols.has('published_at') ? 'published_at' : 'NULL AS published_at'} FROM productos`).all();
for (const product of productVersions) {
  const key = product.document_id;
  if (!signatures.has(key)) signatures.set(key, { publicado: [], borrador: [], sin_estado: [], versiones: { publicado: 0, borrador: 0 } });
  if (productCols.has('published_at')) signatures.get(key).versiones[product.published_at ? 'publicado' : 'borrador']++;
}
for (const row of rows) {
  const key = row.document_id || row.parent_id;
  if (!signatures.has(key)) signatures.set(key, { publicado: [], borrador: [], sin_estado: [], versiones: { publicado: 0, borrador: 0 } });
  signatures.get(key)[status(row)].push(row);
}
const snapshot = list => list.map(row => ({ sku: skuKey(row.sku_ean), id_original: row.variant_original_id, volumen: row.volumen, color: row.color_nombre, stock: row.stock, precio: row.precio, precio_oferta: row.precio_oferta, publicado: row.publicado, envio: row.envio })).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
const differences = [...signatures].filter(([, states]) => states.versiones.publicado && states.versiones.borrador && JSON.stringify(snapshot(states.publicado)) !== JSON.stringify(snapshot(states.borrador)))
  .map(([documentId, states]) => ({ document_id: documentId, producto_id: (states.publicado[0] || states.borrador[0])?.parent_id, publicadas: states.publicado.map(detail), borradores: states.borrador.map(detail) }));

const referenceColumns = [...tables].flatMap(table => [...columns(table)].filter(name => /variante|variant|sku_ean|id_original/i.test(name)).map(name => ({ tabla: table, columna: name })));
const orderTables = [...tables].filter(table => /pedido|order|compra|item/i.test(table));
const orderRows = tables.has('pedidos') && columns('pedidos').has('productos')
  ? db.prepare('SELECT productos FROM pedidos WHERE productos IS NOT NULL').all() : [];
const orderItems = orderRows.flatMap(row => {
  try {
    const value = typeof row.productos === 'string' ? JSON.parse(row.productos) : row.productos;
    return Array.isArray(value) ? value : [];
  } catch { return []; }
});
const variantReferences = orderItems.filter(item => item && typeof item === 'object');
const v1Ids = new Set(rows.filter(markerV1).flatMap(row => [String(row.variant_id), String(row.variant_original_id)]));
const orderUsage = {
  pedidos_versiones: orderRows.length,
  items: variantReferences.length,
  con_id_variante: variantReferences.filter(item => item.id_variante != null).length,
  con_id_variante_original: variantReferences.filter(item => item.id_variante_original != null).length,
  con_sku: variantReferences.filter(item => item.sku != null && String(item.sku).trim()).length,
  referencias_a_marcador_v1: variantReferences.filter(item => v1Ids.has(String(item.id_variante)) || v1Ids.has(String(item.id_variante_original))).length,
};
const result = {
  base: databasePath,
  alcance: 'Solo lectura. Los estados publicados y borradores se auditan por separado.',
  totales: { productos_versiones: new Set(rows.map(row => row.product_row_id)).size, variantes_versiones: rows.length, por_estado: Object.fromEntries([...new Set(rows.map(status))].map(state => [state, rows.filter(row => status(row) === state).length])), sin_sku_comerciales: rows.filter(row => !skuKey(row.sku_ean) && !synthetic(row)).length, duplicados: duplicates.length, marcadores_v1: rows.filter(markerV1).length, sinteticas_sin_sku_ni_atributos: rows.filter(synthetic).length, diferencias_publicado_borrador: differences.length },
  sin_sku_comerciales: rows.filter(row => !skuKey(row.sku_ean) && !synthetic(row)).map(detail),
  sku_duplicados: duplicates,
  marcadores_v1: rows.filter(markerV1).map(row => ({ ...detail(row), posible_sintetica: synthetic(row) })),
  diferencias_publicado_borrador: differences,
  columnas_de_referencia: referenceColumns,
  tablas_pedidos: orderTables.map(table => ({ tabla: table, columnas: [...columns(table)] })),
  uso_en_pedidos: orderUsage,
};
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
db.close();
