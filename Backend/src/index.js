'use strict';

const fs   = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

// ─── Configuración ────────────────────────────────────────────────────────────
const CSV_PRODUCTOS = path.join(__dirname, '../data/productos.csv');
const CSV_VARIANTES = path.join(__dirname, '../data/variantes.csv');
const UID           = 'api::producto.producto';
const BATCH_SIZE    = 50;
// ─────────────────────────────────────────────────────────────────────────────

function leerCSV(rutaArchivo) {
  const raw   = fs.readFileSync(rutaArchivo);
  const texto = raw.toString('utf8').replace(/^\uFEFF/, ''); // strip BOM
  return parse(texto, {
    columns:          true,
    skip_empty_lines: true,
    trim:             true,
    relax_quotes:     true,
  });
}

function parseBoolean(val) {
  return ['1', 'true', 'si', 'sí', 'yes'].includes(
    (val || '').toString().toLowerCase().trim()
  );
}

function parseDecimal(val) {
  if (!val || val.toString().trim() === '') return null;
  const num = parseFloat(val.toString().replace(/\./g, '').replace(',', '.'));
  return isNaN(num) ? null : num;
}

module.exports = {
  register(/*{ strapi }*/) {},

  async bootstrap({ strapi }) {

    // ── Guard: no reimportar si ya hay datos ──────────────────────────────────
    const existing = await strapi.documents(UID).findMany({ limit: 1 });
    if (existing.length > 0) {
      strapi.log.info('[Seed] ✔ Ya existen productos. Omitiendo importación CSV.');
      return;
    }

    // ── Verificar que existan ambos CSV ───────────────────────────────────────
    const faltaProductos = !fs.existsSync(CSV_PRODUCTOS);
    const faltaVariantes = !fs.existsSync(CSV_VARIANTES);

    if (faltaProductos || faltaVariantes) {
      strapi.log.warn('[Seed] ⚠ Archivos CSV no encontrados. Ejecutar primero:');
      if (faltaProductos) strapi.log.warn(`  → Backend/data/productos.csv`);
      if (faltaVariantes) strapi.log.warn(`  → Backend/data/variantes.csv`);
      strapi.log.warn('  Correr: node Backend/scripts/split-csv.js');
      return;
    }

    strapi.log.info('[Seed] 🚀 Iniciando importación con variantes anidadas...');
    const start = Date.now();

    // ── Leer ambos archivos ───────────────────────────────────────────────────
    const productos = leerCSV(CSV_PRODUCTOS);
    const variantes = leerCSV(CSV_VARIANTES);

    strapi.log.info(`[Seed] 📦 ${productos.length} productos padre`);
    strapi.log.info(`[Seed] 🔗 ${variantes.length} variantes en total`);

    // ── Indexar variantes por producto_padre_id ───────────────────────────────
    const variantesIndex = new Map();
    for (const v of variantes) {
      const padreId = (v.producto_padre_id || '').trim();
      const lista   = variantesIndex.get(padreId) || [];
      lista.push(v);
      variantesIndex.set(padreId, lista);
    }

    let success = 0;
    let errors  = 0;

    // ── Insertar en lotes ─────────────────────────────────────────────────────
    for (let i = 0; i < productos.length; i += BATCH_SIZE) {
      const batch = productos.slice(i, i + BATCH_SIZE);

      for (const p of batch) {
        const idOriginal = (p.id_original || '').trim();
        const hijos      = variantesIndex.get(idOriginal) || [];

        const variantesData = hijos.map(v => ({
          id_original:   (v.id_original || '').trim(),
          sku_ean:       (v.sku_ean || '').trim(),
          volumen:       (v.volumen || '').trim(),
          stock:         parseInt(v.stock)          || 0,
          precio:        parseDecimal(v.precio)     || 0,
          precio_oferta: parseDecimal(v.precio_oferta),
          publicado:     parseBoolean(v.publicado),
          envio:         (v.envio || '').trim(),
          moneda:        (v.moneda || 'ARS').trim(),
        }));

        try {
          await strapi.documents(UID).create({
            data: {
              id_original:       idOriginal,
              sku:               (p.sku || '').trim(),
              nombre:            (p.nombre || '').trim(),
              marca:             (p.marca || '').trim(),
              categoria:         (p.categoria || '').trim(),
              descripcion_corta: (p.descripcion_corta || '').trim(),
              proveedor:         (p.proveedor || '').trim(),
              publicado:         parseBoolean(p.publicado),
              moneda:            (p.moneda || 'ARS').trim(),
              variantes:         variantesData,
            },
            status: 'published',
          });
          success++;
        } catch (err) {
          errors++;
          strapi.log.error(
            `[Seed] ❌ Error en "${(p.nombre || '').substring(0, 40)}" (id: ${idOriginal}): ${err.message}`
          );
        }
      }

      const pct = Math.round(((i + batch.length) / productos.length) * 100);
      strapi.log.info(
        `[Seed] Progreso: ${i + batch.length}/${productos.length} (${pct}%) | ✅ ${success} | ❌ ${errors}`
      );
    }

    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    strapi.log.info(
      `[Seed] ✅ Importación completa en ${elapsed}s — Productos: ${success} | Errores: ${errors}`
    );

    // ── Resumen de variantes ──────────────────────────────────────────────────
    const totalVariantesInsertadas = variantes.length;
    strapi.log.info(
      `[Seed] 📊 ${totalVariantesInsertadas} variantes anidadas importadas en ${success} productos`
    );
  },
};
