#!/usr/bin/env node
'use strict';

const path = require('node:path');
const { createStrapi } = require('@strapi/strapi');

const UID_CAT = 'api::categoria.categoria';
const UID_PRODUCTO = 'api::producto.producto';
const UID_ORDER = 'api::ordenamiento-menu-header.ordenamiento-menu-header';
const UID_MENU = 'api::menu-lanzamientos-ofertas.menu-lanzamientos-ofertas';
const UID_MAIN = 'api::seccion-principal.seccion-principal';
const PAGE_SIZE = 100;
const DEFAULT_TARGET = 'Coloración Capilar';

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
  const mergeSections = argv.includes('--merge-sections');
  let to = DEFAULT_TARGET;
  let seccion = '';

  for (const arg of argv) {
    if (arg.startsWith('--to=')) to = arg.slice('--to='.length).trim();
    else if (arg.startsWith('--seccion=')) seccion = arg.slice('--seccion='.length).trim();
  }

  if (!to) throw new Error('El parámetro --to no puede estar vacío.');
  return { apply, mergeSections, to, seccion };
}

function dedupStrings(list = []) {
  const out = [];
  const seen = new Set();
  for (const item of list) {
    if (typeof item !== 'string' || !item || seen.has(item)) continue;
    seen.add(item);
    out.push(item);
  }
  return out;
}

function mapDocIdArray(list, sourceToTarget) {
  if (!Array.isArray(list)) return { changed: false, value: list };
  let changed = false;
  const mapped = [];
  for (const id of list) {
    const replacement = sourceToTarget.get(id)?.targetDocId || id;
    if (replacement !== id) changed = true;
    mapped.push(replacement);
  }
  const deduped = dedupStrings(mapped);
  if (deduped.length !== mapped.length) changed = true;
  return { changed, value: deduped };
}

function mapMenuKeyArray(list, sourceToTarget) {
  if (!Array.isArray(list)) return { changed: false, value: list };
  let changed = false;
  const mapped = [];
  for (const entry of list) {
    if (typeof entry === 'string' && entry.startsWith('categoria:')) {
      const oldId = entry.slice('categoria:'.length);
      const nextId = sourceToTarget.get(oldId)?.targetDocId;
      if (nextId && nextId !== oldId) {
        mapped.push(`categoria:${nextId}`);
        changed = true;
        continue;
      }
    }
    mapped.push(entry);
  }
  const deduped = dedupStrings(mapped);
  if (deduped.length !== mapped.length) changed = true;
  return { changed, value: deduped };
}

/** Carga todas las entidades de un document-type agrupadas por documentId y estado. */
async function cargarPorEstado(docs, options = {}) {
  const porDoc = new Map();
  const vistos = new Set();

  for (const status of ['published', 'draft']) {
    let start = 0;
    while (true) {
      const page = await docs.findMany({ ...options, status, start, limit: PAGE_SIZE });
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

function combinarSubcategorias(baseSubs = [], extraSubsList = []) {
  const out = [];
  const porClave = new Map();

  const agregarLista = (lista) => {
    for (const sub of lista || []) {
      const nombre = String(sub?.nombre ?? '').trim();
      const clave = normalizarClave(nombre);
      if (!clave) continue;

      let destino = porClave.get(clave);
      if (!destino) {
        destino = {
          nombre,
          tipos: [],
          _tiposClaves: new Set(),
        };
        porClave.set(clave, destino);
        out.push(destino);
      }

      for (const tipo of sub?.tipos || []) {
        const nombreTipo = String(tipo?.nombre ?? '').trim();
        const claveTipo = normalizarClave(nombreTipo);
        if (!claveTipo || destino._tiposClaves.has(claveTipo)) continue;
        destino._tiposClaves.add(claveTipo);
        destino.tipos.push({ nombre: nombreTipo });
      }
    }
  };

  agregarLista(baseSubs);
  for (const extraSubs of extraSubsList) {
    agregarLista(extraSubs);
  }

  return out.map(({ _tiposClaves, ...rest }) => rest);
}

function serializarSubcategorias(subs = []) {
  return JSON.stringify(
    (subs || []).map(sub => ({
      nombre: String(sub?.nombre ?? '').trim(),
      tipos: (sub?.tipos || []).map(tipo => String(tipo?.nombre ?? '').trim()),
    }))
  );
}

function recolectarReferenciasMenu(orderDoc, menuDoc, mainDoc) {
  const refs = new Set();
  const addId = id => { if (typeof id === 'string' && id) refs.add(id); };
  const addMenuEntry = entry => {
    if (typeof entry === 'string' && entry.startsWith('categoria:')) addId(entry.slice('categoria:'.length));
  };

  for (const field of ['categoriasPerfumeria', 'categoriasHogar', 'categoriasGeneral']) {
    for (const cat of orderDoc?.[field] || []) addId(cat?.documentId);
  }
  for (const area of ['perfumeria', 'hogar', 'general']) {
    for (const entry of orderDoc?.ordenVisual?.[area] || []) addMenuEntry(entry);
    for (const id of orderDoc?.ordenVisual?.categoriasAgregadas?.[area] || []) addId(id);
    for (const entry of orderDoc?.borradoresMenu?.[area]?.data?.orden || []) addMenuEntry(entry);
    for (const id of orderDoc?.borradoresMenu?.[area]?.baseCategorias || []) addId(id);
  }

  for (const col of menuDoc?.ofertas?.columnas_categorias || []) {
    for (const cat of col?.categorias || []) addId(cat?.documentId);
  }
  for (const cat of menuDoc?.lanzamientos?.categorias || []) addId(cat?.documentId);

  for (const area of ['perfumeria', 'hogar']) {
    for (const id of mainDoc?.diseno_categorias?.[area]?.orden || []) addId(id);
    for (const id of mainDoc?.borradores_editor_inicio?.categorias?.[area]?.data?.orden || []) addId(id);
    addId(mainDoc?.[`destacada_${area}`]?.categoria?.documentId);
    addId(mainDoc?.[`categoria_especifica_${area}`]?.categoria?.documentId);
    addId(mainDoc?.borradores_editor_inicio?.destacada?.[area]?.data?.categoria);
    addId(mainDoc?.borradores_editor_inicio?.categoriaDestacada?.[area]?.data?.categoria);
  }

  return refs;
}

function seleccionarDestino(candidatas, { targetName, referencias }) {
  const puntuar = entry => {
    const base = entry.estados.published || entry.estados.draft;
    return [
      String(base?.nombre ?? '').trim() === targetName ? 1 : 0,
      referencias.has(entry.documentId) ? 1 : 0,
      entry.estados.published ? 1 : 0,
      base?.portada?.id ? 1 : 0,
      -(Number(base?.id) || 0),
    ];
  };

  return [...candidatas].sort((a, b) => {
    const pa = puntuar(a);
    const pb = puntuar(b);
    for (let i = 0; i < pa.length; i++) {
      if (pb[i] !== pa[i]) return pb[i] - pa[i];
    }
    return a.documentId.localeCompare(b.documentId);
  })[0];
}

function construirGruposCategorias(coincidentes, { mergeSections, seccionObjetivo, targetName, referencias }) {
  const gruposMap = new Map();

  if (mergeSections) {
    const seccionesNoVacias = [...new Set(
      coincidentes
        .map(c => String((c.estados.published || c.estados.draft)?.seccion ?? '').trim())
        .filter(Boolean)
    )];
    const seccionFinal = seccionObjetivo || (seccionesNoVacias.length === 1 ? seccionesNoVacias[0] : '');
    if (!seccionFinal && seccionesNoVacias.length > 1) {
      throw new Error(
        `Hay categorías coincidentes en distintas secciones (${seccionesNoVacias.join(', ')}). Indicá --seccion="Perfumería" o "Hogar" junto con --merge-sections.`
      );
    }
    gruposMap.set('__all__', { seccionFinal, items: coincidentes });
  } else {
    for (const item of coincidentes) {
      const secRaw = String((item.estados.published || item.estados.draft)?.seccion ?? '').trim();
      const key = normalizarClave(secRaw) || '__sin_seccion__';
      if (!gruposMap.has(key)) {
        gruposMap.set(key, { seccionFinal: secRaw, items: [] });
      }
      gruposMap.get(key).items.push(item);
    }
  }

  const planes = [];
  const sourceToTarget = new Map();
  const seccionesAbsorbidas = new Set();

  for (const { seccionFinal, items } of gruposMap.values()) {
    const target = seleccionarDestino(items, { targetName, referencias });
    const sources = items.filter(item => item.documentId !== target.documentId);

    for (const src of sources) {
      const srcBase = src.estados.published || src.estados.draft;
      const srcSeccion = String(srcBase?.seccion ?? '').trim();
      sourceToTarget.set(src.documentId, {
        targetDocId: target.documentId,
        targetSeccion: seccionFinal,
        oldSeccion: srcSeccion,
      });
      if (mergeSections) {
        seccionesAbsorbidas.add(normalizarClave(srcSeccion));
      }
    }

    if (mergeSections) {
      const targetBase = target.estados.published || target.estados.draft;
      seccionesAbsorbidas.add(normalizarClave(targetBase?.seccion));
    }

    planes.push({ seccionFinal, target, sources });
  }

  return { planes, sourceToTarget, seccionesAbsorbidas };
}

function planificarActualizacionCategorias(planes, targetName, mergeSections) {
  const tareas = [];
  const resumenCategorias = [];

  for (const { seccionFinal, target, sources } of planes) {
    const targetBase = target.estados.published || target.estados.draft;
    const extraSubs = sources.flatMap(src => {
      const row = src.estados.published || src.estados.draft;
      return [row?.subcategorias || []];
    });
    const sourcePortadaId = sources
      .map(src => (src.estados.published || src.estados.draft)?.portada?.id)
      .find(Boolean) || null;

    // En Strapi v5 Document Service, update({ status: 'published' }) actualiza y publica el borrador.
    // Solo actualizamos el/los estados existentes y conservamos publicado vs borrador exclusivo.
    const statusObjetivo = target.estados.published ? 'published' : 'draft';
    const row = target.estados[statusObjetivo];
    const data = {};

    if (String(row?.nombre ?? '').trim() !== targetName) {
      data.nombre = targetName;
    }
    if (mergeSections && seccionFinal && String(row?.seccion ?? '').trim() !== seccionFinal) {
      data.seccion = seccionFinal;
    }
    if (!row?.portada?.id && sourcePortadaId) {
      data.portada = sourcePortadaId;
    }

    const subcatsNuevas = combinarSubcategorias(row?.subcategorias || [], extraSubs);
    if (serializarSubcategorias(subcatsNuevas) !== serializarSubcategorias(row?.subcategorias || [])) {
      data.subcategorias = subcatsNuevas;
    }

    const necesitaCambio = Object.keys(data).length > 0;
    if (necesitaCambio) {
      tareas.push({ documentId: target.documentId, status: statusObjetivo, data });
    }

    resumenCategorias.push({
      seccion: seccionFinal || null,
      destino: {
        documentId: target.documentId,
        nombreActual: targetBase?.nombre,
        nombreFinal: targetName,
        actualizada: necesitaCambio,
      },
      absorbidas: sources.map(src => {
        const srcRow = src.estados.published || src.estados.draft;
        return {
          documentId: src.documentId,
          nombre: srcRow?.nombre,
          seccion: srcRow?.seccion || null,
        };
      }),
    });
  }

  return { tareas, resumenCategorias };
}

function normalizarClasificaciones(clasificaciones = [], { targetKey, targetName, mergeSections, seccionObjetivo, seccionesAbsorbidas }) {
  const dedup = [];
  const actualizar = [];
  const eliminarIds = [];
  const vistas = new Set();

  for (const raw of clasificaciones || []) {
    const original = {
      seccion: String(raw?.seccion ?? '').trim(),
      categoria: String(raw?.categoria ?? '').trim(),
      subcategoria: String(raw?.subcategoria ?? '').trim(),
      tipo: String(raw?.tipo ?? '').trim(),
    };
    const actualizado = { ...original };
    if (normalizarClave(actualizado.categoria) === targetKey) {
      actualizado.categoria = targetName;
      if (
        mergeSections &&
        seccionObjetivo &&
        (!actualizado.seccion || seccionesAbsorbidas.has(normalizarClave(actualizado.seccion)))
      ) {
        actualizado.seccion = seccionObjetivo;
      }
    }

    const clave = `${normalizarClave(actualizado.seccion)}|${normalizarClave(actualizado.categoria)}|${normalizarClave(actualizado.subcategoria)}|${normalizarClave(actualizado.tipo)}`;
    if (vistas.has(clave)) {
      if (raw?.id != null) eliminarIds.push(raw.id);
      continue;
    }
    vistas.add(clave);
    dedup.push(actualizado);

    if (
      raw?.id != null &&
      (actualizado.categoria !== original.categoria || actualizado.seccion !== original.seccion)
    ) {
      actualizar.push({ id: raw.id, seccion: actualizado.seccion, categoria: actualizado.categoria });
    }
  }

  const changed = actualizar.length > 0 || eliminarIds.length > 0 || dedup.length !== (clasificaciones || []).length;
  return { changed, clasificaciones: dedup, actualizar, eliminarIds };
}

function planificarActualizacionProductos(productosPorDoc, { targetKey, targetName, sourceToTarget, mergeSections, seccionesAbsorbidas, planes }) {
  const seccionObjetivoUnica = mergeSections ? (planes[0]?.seccionFinal || '') : '';
  const tareas = [];
  const afectados = new Map();

  for (const doc of productosPorDoc.values()) {
    for (const status of ['published', 'draft']) {
      const prod = doc.estados[status];
      if (!prod) continue;

      const productFields = {};
      const motivo = [];

      const relDocId = prod.categoria?.documentId;
      let targetCatDocId = null;
      if (relDocId && sourceToTarget.has(relDocId)) {
        const mapping = sourceToTarget.get(relDocId);
        targetCatDocId = mapping.targetDocId;
        motivo.push('relacion_categoria');
        if (mergeSections && mapping.targetSeccion && String(prod.seccion ?? '').trim() === mapping.oldSeccion) {
          productFields.seccion = mapping.targetSeccion;
        }
      }

      const clasifPlan = normalizarClasificaciones(prod.clasificaciones, {
        targetKey,
        targetName,
        mergeSections,
        seccionObjetivo: seccionObjetivoUnica,
        seccionesAbsorbidas,
      });

      if (clasifPlan.changed) {
        motivo.push('clasificaciones');
      }

      if (targetCatDocId || Object.keys(productFields).length > 0 || clasifPlan.changed) {
        tareas.push({
          rowId: prod.id,
          documentId: doc.documentId,
          status,
          targetCatDocId,
          productFields,
          clasifActualizar: clasifPlan.actualizar,
          clasifEliminarIds: clasifPlan.eliminarIds,
        });
        if (!afectados.has(doc.documentId)) {
          afectados.set(doc.documentId, {
            documentId: doc.documentId,
            id_original: prod.id_original || null,
            nombre: prod.nombre || null,
            estados: [],
            cambios: new Set(),
          });
        }
        const entry = afectados.get(doc.documentId);
        entry.estados.push(status);
        motivo.forEach(m => entry.cambios.add(m));
      }
    }
  }

  return {
    tareas,
    afectados: [...afectados.values()].map(item => ({
      ...item,
      cambios: [...item.cambios],
    })),
  };
}

function planificarActualizacionMenuEInicio({ orderDoc, menuDoc, mainDoc, sourceToTarget }) {
  if (sourceToTarget.size === 0) return [];
  const actualizaciones = [];

  if (orderDoc) {
    const data = {};
    for (const field of ['categoriasPerfumeria', 'categoriasHogar', 'categoriasGeneral']) {
      const ids = (orderDoc[field] || []).map(c => c?.documentId).filter(Boolean);
      const res = mapDocIdArray(ids, sourceToTarget);
      if (res.changed) data[field] = res.value;
    }

    if (orderDoc.ordenVisual && typeof orderDoc.ordenVisual === 'object') {
      const nextVisual = structuredClone(orderDoc.ordenVisual);
      let changed = false;
      for (const area of ['perfumeria', 'hogar', 'general']) {
        const resOrden = mapMenuKeyArray(nextVisual[area], sourceToTarget);
        if (resOrden.changed) { nextVisual[area] = resOrden.value; changed = true; }
        if (nextVisual.categoriasAgregadas?.[area]) {
          const resAgg = mapDocIdArray(nextVisual.categoriasAgregadas[area], sourceToTarget);
          if (resAgg.changed) { nextVisual.categoriasAgregadas[area] = resAgg.value; changed = true; }
        }
      }
      if (changed) data.ordenVisual = nextVisual;
    }

    if (orderDoc.borradoresMenu && typeof orderDoc.borradoresMenu === 'object') {
      const nextBorradores = structuredClone(orderDoc.borradoresMenu);
      let changed = false;
      for (const area of Object.keys(nextBorradores)) {
        const draft = nextBorradores[area];
        if (!draft || typeof draft !== 'object') continue;
        const resBase = mapDocIdArray(draft.baseCategorias, sourceToTarget);
        if (resBase.changed) { draft.baseCategorias = resBase.value; changed = true; }
        const resOrden = mapMenuKeyArray(draft.data?.orden, sourceToTarget);
        if (resOrden.changed) { draft.data.orden = resOrden.value; changed = true; }
        const resCats = mapDocIdArray(draft.data?.categorias, sourceToTarget);
        if (resCats.changed) { draft.data.categorias = resCats.value; changed = true; }
        if (Array.isArray(draft.data?.columnas_categorias)) {
          for (const col of draft.data.columnas_categorias) {
            const resCol = mapDocIdArray(col?.categorias, sourceToTarget);
            if (resCol.changed) { col.categorias = resCol.value; changed = true; }
          }
        }
      }
      if (changed) data.borradoresMenu = nextBorradores;
    }

    if (Object.keys(data).length > 0) {
      actualizaciones.push({ uid: UID_ORDER, documentId: orderDoc.documentId, data });
    }
  }

  if (menuDoc) {
    const data = {};
    if (Array.isArray(menuDoc.ofertas?.columnas_categorias)) {
      let changed = false;
      const columnas = menuDoc.ofertas.columnas_categorias.map(col => {
        const ids = (col?.categorias || []).map(c => c?.documentId).filter(Boolean);
        const res = mapDocIdArray(ids, sourceToTarget);
        if (res.changed) changed = true;
        return {
          ...(col.id ? { id: col.id } : {}),
          titulo_columna: col.titulo_columna || '',
          categorias: res.value,
        };
      });
      if (changed) {
        data.ofertas = {
          ...(menuDoc.ofertas.id ? { id: menuDoc.ofertas.id } : {}),
          mostrar_columna_descuentos: Boolean(menuDoc.ofertas.mostrar_columna_descuentos),
          titulo_descuentos: menuDoc.ofertas.titulo_descuentos || '',
          titulo_destacados: menuDoc.ofertas.titulo_destacados || '',
          productos_destacados: (menuDoc.ofertas.productos_destacados || []).map(p => p?.documentId).filter(Boolean),
          columnas_categorias: columnas,
        };
      }
    }

    if (menuDoc.lanzamientos) {
      const ids = (menuDoc.lanzamientos.categorias || []).map(c => c?.documentId).filter(Boolean);
      const res = mapDocIdArray(ids, sourceToTarget);
      if (res.changed) {
        data.lanzamientos = {
          ...(menuDoc.lanzamientos.id ? { id: menuDoc.lanzamientos.id } : {}),
          titulo_categorias: menuDoc.lanzamientos.titulo_categorias || '',
          titulo_destacados: menuDoc.lanzamientos.titulo_destacados || '',
          productos_destacados: (menuDoc.lanzamientos.productos_destacados || []).map(p => p?.documentId).filter(Boolean),
          categorias: res.value,
        };
      }
    }

    if (Object.keys(data).length > 0) {
      actualizaciones.push({ uid: UID_MENU, documentId: menuDoc.documentId, data });
    }
  }

  if (mainDoc) {
    const data = {};
    if (mainDoc.diseno_categorias && typeof mainDoc.diseno_categorias === 'object') {
      const nextDiseno = structuredClone(mainDoc.diseno_categorias);
      let changed = false;
      for (const area of ['perfumeria', 'hogar']) {
        const res = mapDocIdArray(nextDiseno[area]?.orden, sourceToTarget);
        if (res.changed) { nextDiseno[area].orden = res.value; changed = true; }
      }
      if (changed) data.diseno_categorias = nextDiseno;
    }

    if (mainDoc.borradores_editor_inicio && typeof mainDoc.borradores_editor_inicio === 'object') {
      const nextBorradores = structuredClone(mainDoc.borradores_editor_inicio);
      let changed = false;
      for (const area of ['perfumeria', 'hogar']) {
        const catDraft = nextBorradores.categorias?.[area]?.data;
        if (catDraft) {
          const res = mapDocIdArray(catDraft.orden, sourceToTarget);
          if (res.changed) { catDraft.orden = res.value; changed = true; }
        }
        for (const secKey of ['destacada', 'categoriaDestacada']) {
          const secData = nextBorradores[secKey]?.[area]?.data;
          if (secData?.categoria && sourceToTarget.has(secData.categoria)) {
            secData.categoria = sourceToTarget.get(secData.categoria).targetDocId;
            changed = true;
          }
        }
      }
      if (changed) data.borradores_editor_inicio = nextBorradores;
    }

    for (const area of ['perfumeria', 'hogar']) {
      for (const prefix of ['destacada', 'categoria_especifica']) {
        const field = `${prefix}_${area}`;
        const comp = mainDoc[field];
        const catId = comp?.categoria?.documentId;
        if (catId && sourceToTarget.has(catId)) {
          data[field] = {
            ...(comp.id ? { id: comp.id } : {}),
            titulo: comp.titulo || '',
            ...(comp.icono_titulo !== undefined ? { icono_titulo: comp.icono_titulo } : {}),
            ...(comp.productos_orden !== undefined ? { productos_orden: comp.productos_orden } : {}),
            ...(comp.diseno !== undefined ? { diseno: comp.diseno } : {}),
            ...(prefix === 'categoria_especifica' && comp.icono?.id ? { icono: comp.icono.id } : {}),
            categoria: sourceToTarget.get(catId).targetDocId,
          };
        }
      }
    }

    if (Object.keys(data).length > 0) {
      actualizaciones.push({ uid: UID_MAIN, documentId: mainDoc.documentId, data });
    }
  }

  return actualizaciones;
}

/**
 * Unifica categorías duplicadas por tildes o mayúsculas/minúsculas hacia un nombre canónico,
 * reasignando productos (relación `categoria` y `clasificaciones[]`), menú y página de inicio.
 */
async function migrarCategoriaDuplicada(app, { apply = false, mergeSections = false, to = DEFAULT_TARGET, seccion = '' } = {}) {
  const targetName = String(to || '').trim();
  const targetKey = normalizarClave(targetName);
  if (!targetKey) throw new Error('Nombre de categoría destino inválido.');

  const todasCategorias = await cargarPorEstado(app.documents(UID_CAT), {
    fields: ['nombre', 'seccion'],
    populate: {
      portada: { fields: ['id'] },
      subcategorias: { populate: ['tipos'] },
    },
  });

  const coincidentes = [...todasCategorias.values()].filter(entry => {
    const base = entry.estados.published || entry.estados.draft;
    return normalizarClave(base?.nombre) === targetKey;
  });

  const [orderDoc, menuDoc, mainDoc] = await Promise.all([
    app.documents(UID_ORDER).findFirst({
      populate: {
        categoriasPerfumeria: { fields: ['documentId'] },
        categoriasHogar: { fields: ['documentId'] },
        categoriasGeneral: { fields: ['documentId'] },
      },
    }),
    app.documents(UID_MENU).findFirst({
      populate: {
        ofertas: {
          populate: {
            columnas_categorias: { populate: { categorias: { fields: ['documentId'] } } },
            productos_destacados: { fields: ['documentId'] },
          },
        },
        lanzamientos: {
          populate: {
            categorias: { fields: ['documentId'] },
            productos_destacados: { fields: ['documentId'] },
          },
        },
      },
    }),
    app.documents(UID_MAIN).findFirst({
      populate: {
        destacada_perfumeria: { populate: { categoria: { fields: ['documentId'] } } },
        destacada_hogar: { populate: { categoria: { fields: ['documentId'] } } },
        categoria_especifica_perfumeria: { populate: { categoria: { fields: ['documentId'] }, icono: { fields: ['id'] } } },
        categoria_especifica_hogar: { populate: { categoria: { fields: ['documentId'] }, icono: { fields: ['id'] } } },
      },
    }),
  ]);

  const referencias = recolectarReferenciasMenu(orderDoc, menuDoc, mainDoc);
  const { planes, sourceToTarget, seccionesAbsorbidas } = construirGruposCategorias(coincidentes, {
    mergeSections,
    seccionObjetivo: seccion,
    targetName,
    referencias,
  });

  const { tareas: catTareas, resumenCategorias } = planificarActualizacionCategorias(planes, targetName, mergeSections);

  const productosPorDoc = await cargarPorEstado(app.documents(UID_PRODUCTO), {
    fields: ['id_original', 'nombre', 'seccion'],
    populate: {
      categoria: { fields: ['documentId', 'nombre', 'seccion'] },
      clasificaciones: true,
    },
  });

  const { tareas: prodTareas, afectados: productosAfectados } = planificarActualizacionProductos(productosPorDoc, {
    targetKey,
    targetName,
    sourceToTarget,
    mergeSections,
    seccionesAbsorbidas,
    planes,
  });

  const configTareas = planificarActualizacionMenuEInicio({ orderDoc, menuDoc, mainDoc, sourceToTarget });
  const categoriasAEliminar = [...sourceToTarget.keys()];
  const eliminadas = [];

  if (apply) {
    for (const { documentId, status, data } of catTareas) {
      await app.documents(UID_CAT).update({ documentId, status, data });
    }

    // Recargar IDs numéricos por estado tras la republicación de las categorías destino
    const destinosActualizados = await cargarPorEstado(app.documents(UID_CAT), {
      fields: ['documentId'],
      filters: { documentId: { $in: planes.map(p => p.target.documentId) } },
    });

    for (const tarea of prodTareas) {
      const dataProducto = { ...tarea.productFields };
      if (tarea.targetCatDocId) {
        const destino = destinosActualizados.get(tarea.targetCatDocId);
        const filaDestino = destino?.estados[tarea.status] || destino?.estados.draft || destino?.estados.published;
        if (!filaDestino?.id) {
          throw new Error(`No se encontró la fila ${tarea.status} de la categoría destino ${tarea.targetCatDocId}.`);
        }
        dataProducto.categoria = filaDestino.id;
      }

      if (Object.keys(dataProducto).length > 0) {
        await app.db.query(UID_PRODUCTO).update({
          where: { id: tarea.rowId },
          data: dataProducto,
        });
      }

      for (const compUpdate of tarea.clasifActualizar) {
        await app.db.query('producto.clasificacion').update({
          where: { id: compUpdate.id },
          data: { seccion: compUpdate.seccion, categoria: compUpdate.categoria },
        });
      }

      for (const dupId of tarea.clasifEliminarIds) {
        await app.db.query('producto.clasificacion').delete({ where: { id: dupId } });
      }
    }

    for (const { uid, documentId, data } of configTareas) {
      await app.documents(uid).update({ documentId, data });
    }

    for (const sourceDocId of categoriasAEliminar) {
      for (const status of ['published', 'draft']) {
        const restantes = await app.documents(UID_PRODUCTO).findMany({
          status,
          filters: { categoria: { documentId: { $eq: sourceDocId } } },
          fields: ['documentId'],
          limit: 1,
        });
        if (restantes.length > 0) {
          throw new Error(`La categoría duplicada ${sourceDocId} aún tiene productos vinculados en estado ${status}.`);
        }
      }
      await app.documents(UID_CAT).delete({ documentId: sourceDocId });
      eliminadas.push(sourceDocId);
    }
  }

  const seccionesDetectadas = [...new Set(
    coincidentes.map(c => String((c.estados.published || c.estados.draft)?.seccion ?? '').trim() || '(sin sección)')
  )];

  return {
    modo: apply ? 'apply' : 'dry-run',
    categoriaObjetivo: targetName,
    mergeSections,
    seccionesDetectadas,
    categoriasCoincidentes: coincidentes.length,
    resumenCategorias,
    productosAfectadosCount: productosAfectados.length,
    productosAfectados,
    referenciasMenuInicioActualizadas: configTareas.map(t => t.uid),
    categoriasAEliminar,
    categoriasEliminadas: eliminadas,
    ...(seccionesDetectadas.length > 1 && !mergeSections
      ? {
          nota: 'Se detectaron categorías en más de una sección. Se unificó dentro de cada sección por separado; si también querés colapsarlas en una sola sección ejecutá con --merge-sections --seccion="Perfumería".',
        }
      : {}),
  };
}

async function main() {
  const { apply, mergeSections, to, seccion } = parseArgs();
  const appDir = path.resolve(__dirname, '..');
  process.chdir(appDir);
  const app = await createStrapi({ appDir, distDir: appDir }).load();
  try {
    const resultado = await migrarCategoriaDuplicada(app, { apply, mergeSections, to, seccion });
    console.log(JSON.stringify(resultado, null, 2));
    if (!apply && (resultado.resumenCategorias.some(c => c.absorbidas.length > 0 || c.destino.actualizada) || resultado.productosAfectadosCount > 0)) {
      const extras = [
        to !== DEFAULT_TARGET ? `--to="${to}"` : '',
        mergeSections ? '--merge-sections' : '',
        seccion ? `--seccion="${seccion}"` : '',
      ].filter(Boolean).join(' ');
      console.log(`\nPara aplicar los cambios ejecutá: node scripts/migrar-coloracion-capilar.js${extras ? ` ${extras}` : ''} --apply`);
    }
  } finally {
    await app.destroy();
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error('Error migrando categoría:', err);
    process.exit(1);
  });
}

module.exports = {
  DEFAULT_TARGET,
  normalizarClave,
  parseArgs,
  combinarSubcategorias,
  normalizarClasificaciones,
  migrarCategoriaDuplicada,
};
