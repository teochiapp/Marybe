#!/usr/bin/env node
'use strict';

const path = require('node:path');
const { createStrapi } = require('@strapi/strapi');

const UID_PRODUCTO = 'api::producto.producto';
const PAGE_SIZE = 100;
const MAX_SEQ_ID = 999999999;

function norm(val) {
  return String(val ?? '').trim().toLowerCase();
}

function claveClonVariante(v) {
  const id = norm(v?.id_original);
  if (!id) return null;
  return `${id}|${norm(v?.sku_ean)}|${norm(v?.volumen)}|${norm(v?.color_nombre)}`;
}

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

// Elimina únicamente clones exactos (mismo id_original + mismos atributos identificatorios),
// preservando variantes distintas que por error compartan id_original.
function deduplicarVariantes(variantes = []) {
  const indicesPorClave = new Map();
  const limpias = [];
  for (const v of variantes) {
    const key = claveClonVariante(v);
    if (key) {
      if (indicesPorClave.has(key)) {
        const prevIdx = indicesPorClave.get(key);
        if (!limpias[prevIdx]?.portada?.id && v?.portada?.id) {
          limpias[prevIdx] = v;
        }
        continue;
      }
      indicesPorClave.set(key, limpias.length);
    }
    limpias.push(v);
  }
  return limpias;
}

async function cargarProductos(docs) {
  const porDoc = new Map();
  const vistos = new Set();

  for (const status of ['published', 'draft']) {
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
        if (vistos.has(key)) continue;
        vistos.add(key);

        if (!porDoc.has(prod.documentId)) {
          porDoc.set(prod.documentId, {
            documentId: prod.documentId,
            id_original: prod.id_original,
            nombre: prod.nombre,
            proveedor: prod.proveedor,
            estados: {},
          });
        }
        porDoc.get(prod.documentId).estados[status] = Array.isArray(prod.variantes) ? prod.variantes : [];
      }

      if (page.length < PAGE_SIZE) break;
      start += page.length;
    }
  }
  return porDoc;
}

async function limpiarVariantesDuplicadas(app, { apply = false } = {}) {
  const docs = app.documents(UID_PRODUCTO);
  const porDoc = await cargarProductos(docs);

  const usedIds = new Set();
  let maxSeqId = 0;

  for (const doc of porDoc.values()) {
    for (const status of ['published', 'draft']) {
      const lista = doc.estados[status];
      if (!lista) continue;
      for (const v of lista) {
        const raw = String(v?.id_original ?? '').trim();
        if (!raw) continue;
        usedIds.add(raw.toLowerCase());
        if (/^\d+$/.test(raw)) {
          const n = Number(raw);
          if (n > maxSeqId && n <= MAX_SEQ_ID) maxSeqId = n;
        }
      }
    }
  }

  let nextId = maxSeqId;
  const reservarNuevoId = () => {
    do {
      nextId += 1;
    } while (usedIds.has(String(nextId)));
    const s = String(nextId);
    usedIds.add(s);
    return s;
  };

  const tareas = [];
  const afectados = [];

  for (const doc of porDoc.values()) {
    const docReassignments = new Map();
    let clonesDoc = 0;
    let antesDoc = 0;
    let despuesDoc = 0;
    const detalleReasignados = [];
    const statusesOrden = ['published', 'draft'].filter(s => Array.isArray(doc.estados[s]));

    statusesOrden.forEach((status, statusIdx) => {
      const vistosEnStatus = new Set();
      const originales = doc.estados[status];
      const sinClones = deduplicarVariantes(originales);
      const clonesRemovedHere = originales.length - sinClones.length;
      let reassignedHere = false;

      const finales = sinClones.map(v => {
        const idRaw = String(v?.id_original ?? '').trim();
        const idNorm = idRaw.toLowerCase();
        if (!idNorm) return v;

        const fullKey = claveClonVariante(v);
        if (statusIdx > 0 && fullKey && docReassignments.has(fullKey)) {
          const nuevoId = docReassignments.get(fullKey);
          vistosEnStatus.add(nuevoId);
          reassignedHere = true;
          return { ...v, id_original: nuevoId };
        }

        // Solo reasigna si el id_original se repite dentro del MISMO producto;
        // en el catálogo histórico distintos productos pueden compartir rango numérico.
        if (vistosEnStatus.has(idNorm)) {
          const nuevoId = reservarNuevoId();
          vistosEnStatus.add(nuevoId);
          if (fullKey) docReassignments.set(fullKey, nuevoId);
          reassignedHere = true;
          if (statusIdx === 0) {
            detalleReasignados.push({
              sku_ean: v.sku_ean ?? null,
              volumen: v.volumen ?? null,
              color_nombre: v.color_nombre ?? null,
              anteriorId: idRaw,
              nuevoId,
            });
          }
          return { ...v, id_original: nuevoId };
        }

        vistosEnStatus.add(idNorm);
        return v;
      });

      if (statusIdx === 0) {
        antesDoc = originales.length;
        despuesDoc = finales.length;
      }
      clonesDoc = Math.max(clonesDoc, clonesRemovedHere);

      if (clonesRemovedHere > 0 || reassignedHere) {
        tareas.push({ documentId: doc.documentId, status, limpias: finales });
      }
    });

    const tieneTareas = tareas.some(t => t.documentId === doc.documentId);
    if (tieneTareas) {
      afectados.push({
        documentId: doc.documentId,
        id_original: doc.id_original,
        nombre: doc.nombre,
        proveedor: doc.proveedor,
        antes: antesDoc,
        despues: despuesDoc,
        clonesEliminados: clonesDoc,
        idsReasignados: detalleReasignados.length,
        ...(detalleReasignados.length > 0 ? { detalleReasignados } : {}),
      });
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
