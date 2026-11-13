#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { createStrapi } = require('@strapi/strapi');
const { filtrarVariantesComerciales } = require('../src/utils/excel-utils');
const { cargarProductos } = require('./limpiar-variantes-duplicadas');

const UID_PRODUCTO = 'api::producto.producto';

function parseArgs(argv = []) {
  const estadoArg = argv.find(arg => arg.startsWith('--estado='));
  const salidaArg = argv.find(arg => arg.startsWith('--salida='));
  const estado = (estadoArg ? estadoArg.split('=')[1] : 'published').trim().toLowerCase();
  const estados = estado === 'ambos' ? ['published', 'draft']
    : estado === 'draft' ? ['draft']
      : ['published'];
  return {
    estados,
    soloExportables: argv.includes('--solo-exportables'),
    soloResumen: argv.includes('--resumen'),
    salida: salidaArg ? salidaArg.slice('--salida='.length).trim() : null,
  };
}

/** Audita en modo solo lectura los IDs de variante repetidos (intra-producto y globales) y vacíos. */
async function auditarIdsVariantes(app, { estados = ['published'], soloExportables = false } = {}) {
  const docs = app.documents(UID_PRODUCTO);
  const porDoc = await cargarProductos(docs);
  const resultadosPorEstado = {};

  for (const status of estados) {
    const porId = new Map();
    const sinId = [];
    let productosAnalizados = 0;
    let totalVariantes = 0;
    let variantesExportables = 0;

    for (const doc of porDoc.values()) {
      const lista = doc.estados[status];
      if (!Array.isArray(lista)) continue;
      productosAnalizados++;

      const padreId = String(doc.id_original || doc.documentId || '').trim();
      const exportables = new Set(filtrarVariantesComerciales(padreId, lista));

      for (const v of lista) {
        const esExportable = exportables.has(v);
        if (soloExportables && !esExportable) continue;
        totalVariantes++;
        if (esExportable) variantesExportables++;

        const idRaw = String(v?.id_original ?? '').trim();
        const item = {
          producto_documentId: doc.documentId,
          producto_id_original: doc.id_original ?? null,
          producto_nombre: doc.nombre ?? null,
          proveedor: doc.proveedor ?? null,
          variante_id_original: idRaw || null,
          sku_ean: v?.sku_ean ?? null,
          volumen: v?.volumen ?? null,
          color_nombre: v?.color_nombre ?? null,
          precio: v?.precio ?? null,
          stock: v?.stock ?? null,
          publicado: v?.publicado ?? null,
          apareceEnExportacion: esExportable,
        };

        if (!idRaw) {
          sinId.push(item);
          continue;
        }

        const key = idRaw.toLowerCase();
        if (!porId.has(key)) porId.set(key, []);
        porId.get(key).push(item);
      }
    }

    const repetidos = [];
    for (const [idNormalizado, ocurrencias] of porId.entries()) {
      if (ocurrencias.length <= 1) continue;
      const productosDistintos = new Set(ocurrencias.map(o => o.producto_documentId));
      const repiteDentroProducto = productosDistintos.size < ocurrencias.length;
      const repiteEntreProductos = productosDistintos.size > 1;
      const alcance = repiteDentroProducto && repiteEntreProductos ? 'intra_y_entre_productos'
        : repiteDentroProducto ? 'intra_producto'
          : 'entre_productos';

      repetidos.push({
        id_variante: ocurrencias[0].variante_id_original,
        id_normalizado: idNormalizado,
        alcance,
        ocurrencias: ocurrencias.length,
        productosAfectados: productosDistintos.size,
        enExportacion: ocurrencias.filter(o => o.apareceEnExportacion).length,
        variantes: ocurrencias,
      });
    }

    repetidos.sort((a, b) =>
      b.ocurrencias - a.ocurrencias ||
      String(a.id_variante).localeCompare(String(b.id_variante), 'es', { numeric: true })
    );

    const repetidosIntraProducto = repetidos.filter(r => r.alcance !== 'entre_productos');
    const repetidosEntreProductos = repetidos.filter(r => r.alcance !== 'intra_producto');

    resultadosPorEstado[status] = {
      resumen: {
        productosAnalizados,
        totalVariantes,
        variantesExportables,
        idsUnicos: porId.size,
        idsRepetidosTotal: repetidos.length,
        ocurrenciasEnRepetidos: repetidos.reduce((acc, r) => acc + r.ocurrencias, 0),
        idsRepetidosIntraProducto: repetidosIntraProducto.length,
        idsRepetidosEntreProductos: repetidosEntreProductos.length,
        variantesSinId: sinId.length,
      },
      repetidos,
      sinId,
    };
  }

  return estados.length === 1
    ? { estado: estados[0], soloExportables, ...resultadosPorEstado[estados[0]] }
    : { soloExportables, estados: resultadosPorEstado };
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const appDir = path.resolve(__dirname, '..');
  process.chdir(appDir);
  const app = await createStrapi({ appDir, distDir: appDir }).load();
  try {
    const reporte = await auditarIdsVariantes(app, opts);
    if (opts.salida) {
      const rutaSalida = path.resolve(opts.salida);
      fs.writeFileSync(rutaSalida, `${JSON.stringify(reporte, null, 2)}\n`, 'utf8');
      console.log(`Reporte guardado en: ${rutaSalida}`);
    }
    const salidaConsola = opts.soloResumen
      ? (reporte.estados
        ? {
            soloExportables: reporte.soloExportables,
            estados: Object.fromEntries(Object.entries(reporte.estados).map(([k, v]) => [k, v.resumen])),
          }
        : { estado: reporte.estado, soloExportables: reporte.soloExportables, resumen: reporte.resumen })
      : reporte;
    if (!opts.salida || opts.soloResumen) {
      console.log(JSON.stringify(salidaConsola, null, 2));
    }
  } finally {
    await app.destroy();
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error('Error auditando IDs de variantes:', err);
    process.exit(1);
  });
}

module.exports = { parseArgs, auditarIdsVariantes };
