'use strict';

const fs   = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

// ─── Configuración ────────────────────────────────────────────────────────────
const CSV_FILE         = path.join(__dirname, '../data/productos.csv');
const CONTENT_TYPE_UID = 'api::producto.producto';
const BATCH_SIZE       = 100;
// ─────────────────────────────────────────────────────────────────────────────

function parseBoolean(val) {
  return ['1', 'true', 'si', 'sí', 'yes'].includes(
    (val || '').toString().toLowerCase().trim()
  );
}

function parseDecimal(val) {
  if (!val || val.trim() === '') return null;
  const cleaned = val.replace(/\./g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function mapRow(row) {
  return {
    id_externo:   (row['ID'] || '').trim(),
    variantes:    (row['Variantes'] || '').trim(),
    codigo_ean:   (row['Codigo EAN'] || '').trim(),
    detalle:      (row['Detalle'] || '').trim(),
    deta:         (row['Deta'] || '').trim(),
    stock:        parseInt(row['Stock']) || 0,
    ver_stk:      parseBoolean(row['Ver stk']),
    precio:       parseDecimal(row['Precio']) || 0,
    oferta:       parseDecimal(row['Oferta']),
    publica:      parseBoolean(row['Publica']),
    envio:        (row['Envio'] || '').trim(),
    moneda:       (row['Moneda'] || 'ARS').trim(),
    verificacion: (row['Verificaci\u00f3n'] || row['Verificacion'] || '').trim(),
    proveedor:    (row['Proveedor'] || '').trim(),
  };
}

module.exports = {
  register(/*{ strapi }*/) {},

  async bootstrap({ strapi }) {

    // ── Guard: evitar re-importar si ya hay datos ─────────────────────────────
    const existing = await strapi.documents(CONTENT_TYPE_UID).findMany({ limit: 1 });
    if (existing.length > 0) {
      strapi.log.info('[Seed] ✔ Ya existen productos. Omitiendo importación CSV.');
      return;
    }

    // ── Verificar que el CSV existe ───────────────────────────────────────────
    if (!fs.existsSync(CSV_FILE)) {
      strapi.log.warn(`[Seed] ⚠ CSV no encontrado en: ${CSV_FILE}`);
      strapi.log.warn('[Seed] Copiar el archivo como: Backend/data/productos.csv');
      return;
    }

    strapi.log.info('[Seed] 🚀 Iniciando importación de productos desde CSV...');
    const start = Date.now();

    const raw  = fs.readFileSync(CSV_FILE, 'utf-8');
    const rows = parse(raw, {
      columns:          true,
      skip_empty_lines: true,
      trim:             true,
      bom:              true,
      relax_quotes:     true,
    });

    strapi.log.info(`[Seed] 📋 ${rows.length} filas encontradas. Procesando en lotes de ${BATCH_SIZE}...`);

    let success = 0;
    let errors  = 0;

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);

      for (const row of batch) {
        try {
          await strapi.documents(CONTENT_TYPE_UID).create({
            data:   mapRow(row),
            status: 'published',
          });
          success++;
        } catch (err) {
          errors++;
          strapi.log.error(
            `[Seed] ❌ Error en fila ${i + 1} — "${(row['Detalle'] || '').substring(0, 40)}": ${err.message}`
          );
        }
      }

      const pct = Math.round(((i + batch.length) / rows.length) * 100);
      strapi.log.info(
        `[Seed] Progreso: ${i + batch.length}/${rows.length} (${pct}%) | ✅ ${success} | ❌ ${errors}`
      );
    }

    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    strapi.log.info(
      `[Seed] ✅ Importación completa en ${elapsed}s — Éxitos: ${success} | Errores: ${errors}`
    );
  },
};
