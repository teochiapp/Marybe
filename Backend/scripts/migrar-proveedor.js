#!/usr/bin/env node
'use strict';

const path = require('node:path');
const { createStrapi } = require('@strapi/strapi');

const UID_PRODUCTO = 'api::producto.producto';
const UID_MAIN = 'api::seccion-principal.seccion-principal';
const PAGE_SIZE = 100;
const DEFAULT_FROM = 'DCC SA';
const DEFAULT_TO = 'DCC S.A';

/** Normaliza texto eliminando tildes, colapsando espacios y pasando a minúsculas. */
function normalizarClave(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase('es');
}

function parseArgs(argv = process.argv.slice(2)) {
  const apply = argv.includes('--apply');
  const exact = argv.includes('--exact');
  let from = DEFAULT_FROM;
  let to = DEFAULT_TO;

  for (const arg of argv) {
    if (arg.startsWith('--from=')) from = arg.slice('--from='.length).trim();
    else if (arg.startsWith('--to=')) to = arg.slice('--to='.length).trim();
  }

  if (!from) throw new Error('El parámetro --from no puede estar vacío.');
  if (!to) throw new Error('El parámetro --to no puede estar vacío.');
  if (from === to) throw new Error('Los valores de --from y --to no pueden ser idénticos.');

  return { apply, exact, from, to };
}

function coincideProveedor(valor, fromName, exact = false) {
  if (typeof valor !== 'string') return false;
  const trimmed = valor.trim();
  if (!trimmed) return false;
  if (exact) return trimmed === fromName;
  return normalizarClave(trimmed) === normalizarClave(fromName);
}

/** Carga todas las filas de productos agrupadas por documentId y estado (published / draft). */
async function cargarProductosPorEstado(docs) {
  const porDoc = new Map();
  const vistos = new Set();

  for (const status of ['published', 'draft']) {
    let start = 0;
    while (true) {
      const page = await docs.findMany({
        fields: ['id_original', 'nombre', 'proveedor'],
        status,
        start,
        limit: PAGE_SIZE,
      });
      if (!Array.isArray(page) || page.length === 0) break;

      for (const row of page) {
        const key = `${status}:${row.documentId}`;
        if (vistos.has(key)) continue;
        vistos.add(key);

        if (!porDoc.has(row.documentId)) {
          porDoc.set(row.documentId, { documentId: row.documentId, estados: {} });
        }
        porDoc.get(row.documentId).estados[status] = row;
      }

      if (page.length < PAGE_SIZE) break;
      start += page.length;
    }
  }

  return porDoc;
}

function planificarActualizacionSeccionPrincipal(mainDoc, { fromName, toName, exact }) {
  if (!mainDoc) return { data: null, afectados: [] };
  const data = {};
  const afectados = [];

  const actualizarBloque = (bloque, ubicacion) => {
    if (!bloque || typeof bloque !== 'object' || bloque.entidad_tipo !== 'proveedor') {
      return false;
    }
    const idCoincide = coincideProveedor(bloque.entidad_id, fromName, exact) && bloque.entidad_id !== toName;
    const nombreCoincide = coincideProveedor(bloque.entidad_nombre, fromName, exact) && bloque.entidad_nombre !== toName;
    if (!idCoincide && !nombreCoincide) return false;

    afectados.push({
      ubicacion,
      entidad_id_anterior: bloque.entidad_id || '',
      entidad_nombre_anterior: bloque.entidad_nombre || '',
      entidad_final: toName,
    });
    bloque.entidad_id = toName;
    bloque.entidad_nombre = toName;
    return true;
  };

  if (mainDoc.diseno_secciones && typeof mainDoc.diseno_secciones === 'object') {
    const nextDiseno = structuredClone(mainDoc.diseno_secciones);
    let changed = false;
    const descuentos = nextDiseno.descuentos;
    if (descuentos && typeof descuentos === 'object') {
      for (const areaKey of Object.keys(descuentos)) {
        if (actualizarBloque(descuentos[areaKey], `diseno_secciones.descuentos.${areaKey}`)) {
          changed = true;
        }
      }
    }
    if (changed) data.diseno_secciones = nextDiseno;
  }

  if (mainDoc.borradores_editor_inicio && typeof mainDoc.borradores_editor_inicio === 'object') {
    const nextBorradores = structuredClone(mainDoc.borradores_editor_inicio);
    let changed = false;
    const descuentos = nextBorradores.descuentos;
    if (descuentos && typeof descuentos === 'object') {
      for (const areaKey of Object.keys(descuentos)) {
        const draftData = descuentos[areaKey]?.data;
        if (actualizarBloque(draftData, `borradores_editor_inicio.descuentos.${areaKey}.data`)) {
          changed = true;
        }
      }
    }
    if (changed) data.borradores_editor_inicio = nextBorradores;
  }

  return {
    data: Object.keys(data).length > 0 ? data : null,
    afectados,
  };
}

/**
 * Unifica valores del campo `proveedor` en productos (`published` y `draft`) y referencias
 * en bloques de Descuentos de `seccion-principal` desde un nombre origen hacia un destino canónico.
 */
async function migrarProveedor(
  app,
  { apply = false, exact = false, from = DEFAULT_FROM, to = DEFAULT_TO } = {}
) {
  const fromName = String(from || '').trim();
  const toName = String(to || '').trim();
  if (!fromName) throw new Error('Nombre de proveedor origen inválido.');
  if (!toName) throw new Error('Nombre de proveedor destino inválido.');
  if (fromName === toName) throw new Error('El proveedor origen y destino son idénticos.');

  const productosPorDoc = await cargarProductosPorEstado(app.documents(UID_PRODUCTO));
  const tareasFilas = [];
  const productosAfectados = [];
  const variantesOrigen = new Map();
  let destinoYaExistenteDocs = 0;

  for (const [documentId, entry] of productosPorDoc) {
    const estadosAfectados = [];
    let yaTieneDestino = false;
    const valoresPrevios = new Set();

    for (const status of ['published', 'draft']) {
      const row = entry.estados[status];
      if (!row) continue;

      const actual = typeof row.proveedor === 'string' ? row.proveedor : '';
      if (actual === toName) {
        yaTieneDestino = true;
        continue;
      }

      if (coincideProveedor(actual, fromName, exact)) {
        variantesOrigen.set(actual, (variantesOrigen.get(actual) || 0) + 1);
        valoresPrevios.add(actual);
        estadosAfectados.push(status);
        tareasFilas.push({
          rowId: row.id,
          documentId,
          status,
          anterior: actual,
        });
      }
    }

    if (yaTieneDestino && estadosAfectados.length === 0) {
      destinoYaExistenteDocs++;
    }

    if (estadosAfectados.length > 0) {
      const base = entry.estados.published || entry.estados.draft;
      productosAfectados.push({
        documentId,
        id_original: base?.id_original ?? null,
        nombre: base?.nombre ?? '',
        estados: estadosAfectados,
        valoresAnteriores: [...valoresPrevios],
        valorFinal: toName,
      });
    }
  }

  const mainDoc = await app.documents(UID_MAIN).findFirst({
    fields: ['documentId', 'diseno_secciones', 'borradores_editor_inicio'],
  });
  const planMain = planificarActualizacionSeccionPrincipal(mainDoc, {
    fromName,
    toName,
    exact,
  });

  let filasActualizadasCount = 0;
  let seccionPrincipalActualizada = false;
  let restantesOrigenCount = tareasFilas.length;

  if (apply) {
    for (const tarea of tareasFilas) {
      await app.db.query(UID_PRODUCTO).update({
        where: { id: tarea.rowId },
        data: { proveedor: toName },
      });
      filasActualizadasCount++;
    }

    if (planMain.data && mainDoc?.documentId) {
      await app.documents(UID_MAIN).update({
        documentId: mainDoc.documentId,
        data: planMain.data,
      });
      seccionPrincipalActualizada = true;
    }

    const verificacion = await cargarProductosPorEstado(app.documents(UID_PRODUCTO));
    let pendientes = 0;
    for (const entry of verificacion.values()) {
      for (const status of ['published', 'draft']) {
        const row = entry.estados[status];
        if (!row) continue;
        if (row.proveedor !== toName && coincideProveedor(row.proveedor, fromName, exact)) {
          pendientes++;
        }
      }
    }
    restantesOrigenCount = pendientes;
  }

  return {
    modo: apply ? 'apply' : 'dry-run',
    proveedorOrigen: fromName,
    proveedorDestino: toName,
    exacto: exact,
    variantesOrigenDetectadas: Object.fromEntries(variantesOrigen),
    destinoYaExistenteDocs,
    productosAfectadosCount: productosAfectados.length,
    filasAActualizarCount: tareasFilas.length,
    filasActualizadasCount,
    productosAfectados,
    bloquesInicioAfectados: planMain.afectados,
    seccionPrincipalActualizada,
    restantesOrigenCount,
  };
}

async function main() {
  const { apply, exact, from, to } = parseArgs();
  const appDir = path.resolve(__dirname, '..');
  process.chdir(appDir);
  const app = await createStrapi({ appDir, distDir: appDir }).load();
  try {
    const resultado = await migrarProveedor(app, { apply, exact, from, to });
    console.log(JSON.stringify(resultado, null, 2));
    if (!apply && (resultado.filasAActualizarCount > 0 || resultado.bloquesInicioAfectados.length > 0)) {
      const extras = [
        from !== DEFAULT_FROM ? `--from="${from}"` : '',
        to !== DEFAULT_TO ? `--to="${to}"` : '',
        exact ? '--exact' : '',
      ].filter(Boolean).join(' ');
      console.log(
        `\nPara aplicar los cambios ejecutá: node scripts/migrar-proveedor.js${extras ? ` ${extras}` : ''} --apply`
      );
    }
  } finally {
    await app.destroy();
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error('Error migrando proveedor:', err);
    process.exit(1);
  });
}

module.exports = {
  DEFAULT_FROM,
  DEFAULT_TO,
  normalizarClave,
  parseArgs,
  coincideProveedor,
  migrarProveedor,
};
