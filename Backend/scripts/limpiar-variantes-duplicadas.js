#!/usr/bin/env node
'use strict';

const path = require('node:path');
const { createStrapi } = require('@strapi/strapi');

const UID_PRODUCTO = 'api::producto.producto';
const PAGE_SIZE = 100;

function sanitizarVariante(v) {
  const out = {
    id_original: v.id_original ?? null,
    sku_ean: v.sku_ean ?? null,
    volumen: v.volumen ?? null,
    stock: v.stock ?? 0,
    precio: v.precio ?? 0,
    precio_oferta: v.precio_oferta ?? null,
    publicado: v.publicado ?? true,
    envio: v.envio ?? null,
    moneda: v.moneda ?? 'ARS',
    color_nombre: v.color_nombre ?? null,
  };
  if (v.portada?.id) out.portada = v.portada.id;
  return out;
}

function deduplicarVariantes(variantes = []) {
  const vistas = new Set();
  const limpias = [];
  for (const v of variantes) {
    const key = String(v?.id_original ?? '').trim().toLowerCase();
    if (key) {
      if (vistas.has(key)) continue;
      vistas.add(key);
    }
    limpias.push(v);
  }
  return limpias;
}

async function limpiarVariantesDuplicadas(app, { apply = false } = {}) {
  const docs = app.documents(UID_PRODUCTO);
  const procesados = new Set();
  const tareas = [];
  const afectados = [];

  for (const status of ['draft', 'published']) {
    let start = 0;
    while (true) {
      const page = await docs.findMany({
        fields: ['id_original', 'nombre', 'proveedor'],
        populate: { variantes: { populate: ['portada'] } },
        status,
        start,
        limit: PAGE_SIZE,
      });
      if (!Array.isArray(page) || page.length === 0) break;

      for (const prod of page) {
        const key = `${status}:${prod.documentId}`;
        if (procesados.has(key)) continue;
        procesados.add(key);

        const variantes = Array.isArray(prod.variantes) ? prod.variantes : [];
        const limpias = deduplicarVariantes(variantes);
        if (limpias.length === variantes.length) continue;

        tareas.push({ documentId: prod.documentId, status, limpias });
        if (!afectados.some(a => a.documentId === prod.documentId)) {
          afectados.push({
            documentId: prod.documentId,
            id_original: prod.id_original,
            nombre: prod.nombre,
            proveedor: prod.proveedor,
            antes: variantes.length,
            despues: limpias.length,
          });
        }
      }

      if (page.length < PAGE_SIZE) break;
      start += page.length;
    }
  }

  if (apply) {
    for (const { documentId, status, limpias } of tareas) {
      await docs.update({
        documentId,
        data: { variantes: limpias.map(sanitizarVariante) },
        status,
      });
    }
  }

  return afectados;
}

async function main() {
  const apply = process.argv.includes('--apply');
  const appDir = path.resolve(__dirname, '..');
  process.chdir(appDir);
  const app = await createStrapi({ appDir, distDir: appDir }).load();
  try {
    const afectados = await limpiarVariantesDuplicadas(app, { apply });
    console.log(JSON.stringify({
      modo: apply ? 'apply' : 'dry-run',
      productosAfectados: afectados.length,
      detalle: afectados,
    }, null, 2));
    if (!apply && afectados.length > 0) {
      console.log('\nPara aplicar los cambios ejecutá: node scripts/limpiar-variantes-duplicadas.js --apply');
    }
  } finally {
    await app.destroy();
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error('Error limpiando variantes duplicadas:', err);
    process.exit(1);
  });
}

module.exports = { deduplicarVariantes, limpiarVariantesDuplicadas };
