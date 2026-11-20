'use strict';

const fs   = require('fs');
const path = require('path');
const { verificarAdmin: verificarAdminImportacion, handleAdminLogin } = require('../../../utils/admin-auth');

const UID_CAT      = 'api::categoria.categoria';
const UID_PRODUCTO = 'api::producto.producto';

function normalizarTxt(val) {
  return String(val || '').trim();
}

function serializarSubcategorias(subcats = []) {
  return subcats
    .map((s) => ({
      nombre: normalizarTxt(s?.nombre),
      tipos: (s?.tipos || [])
        .map((t) => ({ nombre: normalizarTxt(t?.nombre) }))
        .filter((t) => t.nombre),
    }))
    .filter((s) => s.nombre);
}

/**
 * Resuelve una categoría en Strapi v5 por documentId (o id numérico legado)
 * devolviendo tanto la versión publicada como el borrador.
 */
async function resolverCategoriaDoc(strapi, idOrDocId, populate) {
  const raw = normalizarTxt(idOrDocId);
  if (!raw) return { documentId: null, draft: null, published: null };

  let documentId = raw;
  if (/^\d+$/.test(raw)) {
    const row = await strapi.db.query(UID_CAT).findOne({
      where: { id: parseInt(raw, 10) },
      select: ['documentId'],
    });
    if (!row?.documentId) return { documentId: null, draft: null, published: null };
    documentId = row.documentId;
  }

  const docs = strapi.documents(UID_CAT);
  const [published, draft] = await Promise.all([
    docs.findOne({ documentId, status: 'published', ...(populate ? { populate } : {}) }),
    docs.findOne({ documentId, status: 'draft', ...(populate ? { populate } : {}) }),
  ]);

  return { documentId, draft, published };
}

/**
 * Carga todos los productos publicados con su categoría principal y clasificaciones[]
 * paginando para contemplar todo el catálogo.
 */
async function fetchProductosPublicadosConClasificaciones(strapi) {
  const todos = [];
  const PAGE_SIZE = 500;
  for (let start = 0; ; start += PAGE_SIZE) {
    const batch = await strapi.documents(UID_PRODUCTO).findMany({
      status: 'published',
      fields: ['id', 'documentId', 'seccion', 'subcategoria', 'tipo'],
      populate: {
        categoria: { fields: ['documentId', 'nombre', 'seccion'] },
        clasificaciones: true,
      },
      start,
      limit: PAGE_SIZE,
    });
    if (!batch || batch.length === 0) break;
    todos.push(...batch);
    if (batch.length < PAGE_SIZE) break;
  }
  return todos;
}

function coincidenCategoria(catNombre, catSeccion, itemCategoria, itemSeccion) {
  const cCat = normalizarTxt(catNombre);
  const iCat = normalizarTxt(itemCategoria);
  if (!cCat || cCat !== iCat) return false;
  const cSec = normalizarTxt(catSeccion);
  const iSec = normalizarTxt(itemSeccion);
  return !cSec || !iSec || cSec === iSec;
}

/**
 * Reúne las asignaciones únicas de productos a `cat` tanto por la relación
 * directa `cat.productos` como por el componente repetible `clasificaciones[]`.
 */
function obtenerAsignacionesDeCategoria(cat, productosPublicados) {
  const asignaciones = [];
  const vistos = new Set();
  const catDocId = cat.documentId;
  const catNombre = normalizarTxt(cat.nombre);
  const catSeccion = normalizarTxt(cat.seccion);

  const registrar = (prodKey, subcategoria, tipo) => {
    const sub = normalizarTxt(subcategoria);
    const tip = normalizarTxt(tipo);
    const key = `${prodKey}::${sub}::${tip}`;
    if (vistos.has(key)) return;
    vistos.add(key);
    asignaciones.push({ productoKey: prodKey, subcategoria: sub, tipo: tip });
  };

  for (const p of cat.productos || []) {
    const pKey = p.documentId || String(p.id);
    registrar(pKey, p.subcategoria, p.tipo);
  }

  for (const p of productosPublicados || []) {
    const pKey = p.documentId || String(p.id);
    if (p.categoria?.documentId === catDocId) {
      registrar(pKey, p.subcategoria, p.tipo);
    }
    for (const cl of p.clasificaciones || []) {
      if (coincidenCategoria(catNombre, catSeccion, cl?.categoria, cl?.seccion)) {
        registrar(pKey, cl?.subcategoria, cl?.tipo);
      }
    }
  }

  return asignaciones;
}

function localizarSubcategoria(published, draft, subcatId) {
  const targetStr = String(subcatId ?? '').trim();
  const targetNum = /^\d+$/.test(targetStr) ? parseInt(targetStr, 10) : null;
  const buscar = (cat) =>
    (cat?.subcategorias || []).find(
      (s) => (targetNum !== null && s.id === targetNum) || normalizarTxt(s.nombre) === targetStr
    );
  return buscar(published) || buscar(draft) || null;
}

function localizarTipo(published, draft, subcatNombre, tipoId) {
  const targetStr = String(tipoId ?? '').trim();
  const targetNum = /^\d+$/.test(targetStr) ? parseInt(targetStr, 10) : null;
  const subNorm = normalizarTxt(subcatNombre);
  const buscar = (cat) => {
    const sub = (cat?.subcategorias || []).find((s) => normalizarTxt(s.nombre) === subNorm);
    return (sub?.tipos || []).find(
      (t) => (targetNum !== null && t.id === targetNum) || normalizarTxt(t.nombre) === targetStr
    );
  };
  return buscar(published) || buscar(draft) || null;
}

async function actualizarYPublicarSubcategorias(strapi, documentId, subcategorias, publicar) {
  const docs = strapi.documents(UID_CAT);
  await docs.update({
    documentId,
    data: { subcategorias: serializarSubcategorias(subcategorias) },
  });
  if (publicar) {
    await docs.publish({ documentId });
  }
}

/**
 * Controller de Importación Admin
 *
 * Endpoints:
 *  POST /api/importacion-admin/upload  → recibe .xlsx, valida rol, importa
 *  GET  /api/importacion-admin/status  → última importación
 */
module.exports = {
  /**
   * POST /api/importacion-admin/login
   * Bypass de DB. Login basado en variables de entorno.
   */
  async login(ctx) {
    return handleAdminLogin(ctx);
  },

  /**
   * POST /api/importacion-admin/upload
   * Requiere: JWT Custom en el header Authorization.
   */
  async upload(ctx) {
    // ── 1. Verificar JWT Custom ─────────────────────────
    if (!verificarAdminImportacion(ctx)) {
      return ctx.unauthorized('No autenticado o sesión expirada. Debés iniciar sesión como administrador.');
    }

    // ── 2. Verificar que llegó un archivo ─────────────────────────────────────
    const files = ctx.request.files;
    if (!files || !files.archivo) {
      return ctx.badRequest('No se recibió ningún archivo. Enviá el campo "archivo" como multipart.');
    }

    const archivo = files.archivo;
    const ext = path.extname(archivo.name || archivo.originalFilename || '').toLowerCase();
    if (ext !== '.xlsx') {
      return ctx.badRequest('El archivo debe ser un .xlsx válido (Plantilla_Marybe).');
    }

    let rutaTemporal = null;

    try {
      // ── 3. Guardar el archivo temporalmente ──────────────────────────────────
      // koa-body guarda el archivo en un path temporal (archivo.path)
      rutaTemporal = archivo.path || archivo.filepath;

      if (!rutaTemporal || !fs.existsSync(rutaTemporal)) {
        return ctx.badRequest('No se pudo acceder al archivo subido.');
      }

      strapi.log.info(`[ImportAdmin] Archivo recibido: ${archivo.name} (${archivo.size} bytes) → ${rutaTemporal}`);

      // ── 4. Ejecutar la importación (upsert) ──────────────────────────────────
      const servicio = strapi.service('api::importacion-admin.importacion-admin');
      const resultado = await servicio.procesarImportacion(strapi, rutaTemporal);

      // ── 4b. MODO ALTA: si hay IDs duplicados, devolver 409 Conflict ──────────
      if (resultado.errorModoAlta) {
        return ctx.send(
          {
            ok:            false,
            errorModoAlta: true,
            mensaje:       `MODO ALTA: ${resultado.duplicados.length} ID(s) ya existen en el catálogo. No se importó ningún producto.`,
            duplicados:    resultado.duplicados, // [{ id_original, nombre }]
            log:           resultado.log,
          },
          409
        );
      }

      const parcial = resultado.errores > 0 || resultado.productosSinId > 0 ||
        resultado.variantesOmitidasSinPadre > 0 || resultado.variantesOmitidasSinId > 0;
      return ctx.send({
        ok: !parcial,
        parcial,
        mensaje: parcial
          ? `Importación parcial: revisá los errores y las filas omitidas (${resultado.tiempoSegundos}s).`
          : `Importación completada en ${resultado.tiempoSegundos}s`,
        datos: {
          totalProductos:          resultado.totalProductos,
          productosSinId:          resultado.productosSinId,
          variantesOmitidasSinPadre: resultado.variantesOmitidasSinPadre,
          variantesOmitidasSinId:  resultado.variantesOmitidasSinId,
          creados:                 resultado.creados,
          actualizados:            resultado.actualizados,
          sinCambios:              resultado.sinCambios || 0,
          errores:                 resultado.errores,
          erroresList:             resultado.erroresList,
          padresConvertidos:       resultado.padresConvertidos || [],
          tiempoSegundos:          resultado.tiempoSegundos,
          log:                     resultado.log,
        },
      });
    } catch (err) {
      strapi.log.error(`[ImportAdmin] Error durante importación: ${err.stack || err.message}`);
      if (err.code === 'INVALID_EXCEL' || /^Fila \d+:|^Formato de Excel no reconocido/.test(err.message)) {
        return ctx.badRequest(err.message);
      }
      return ctx.internalServerError(`Error al importar: ${err.message}`);
    } finally {
      // Limpiar archivo temporal si sigue existiendo
      if (rutaTemporal && fs.existsSync(rutaTemporal)) {
        try { fs.unlinkSync(rutaTemporal); } catch (_) {}
      }
    }
  },


  async status(ctx) {
    if (!verificarAdminImportacion(ctx)) {
      return ctx.unauthorized('No autenticado.');
    }

    const servicio = strapi.service('api::importacion-admin.importacion-admin');
    const ultima = servicio.obtenerUltimaImportacion();

    if (!ultima) {
      return ctx.send({ ok: true, mensaje: 'No se ha realizado ninguna importación aún.', datos: null });
    }

    return ctx.send({ ok: true, datos: ultima });
  },

  /**
   * POST /api/importacion-admin/migrar-clasificaciones
   * Migra productos existentes con campos planos a clasificaciones[].
   */
  async migrarClasificaciones(ctx) {
    if (!verificarAdminImportacion(ctx)) {
      return ctx.unauthorized('No autenticado o sesión expirada.');
    }
    const { offset = 0, limit = 500 } = ctx.request.body || {};

    try {
      const servicio = strapi.service('api::importacion-admin.importacion-admin');
      const resultado = await servicio.migrarClasificacionesExistentes(strapi, Number(offset), Number(limit));
      return ctx.send(resultado);
    } catch (err) {
      strapi.log.error(`[ImportAdmin] Error en migración de clasificaciones: ${err.message}`);
      return ctx.internalServerError(`Error al migrar: ${err.message}`);
    }
  },

  /**
   * GET /api/importacion-admin/verificar-precios
   * Revisa la integridad de precios de todos los productos y comprueba
   * que se exportarán correctamente sin discrepancias.
   */
  async verificarPrecios(ctx) {
    if (!verificarAdminImportacion(ctx)) {
      return ctx.unauthorized('No autenticado.');
    }
    
    try {
      const servicio = strapi.service('api::importacion-admin.importacion-admin');
      const resultado = await servicio.verificarPreciosIntegridad(strapi);
      return ctx.send({ ok: true, ...resultado });
    } catch (err) {
      strapi.log.error(`[ImportAdmin] Error verificando precios: ${err.message}`);
      return ctx.internalServerError(`Error al verificar: ${err.message}`);
    }
  },

  /**
   * GET /api/importacion-admin/taxonomia-vacia
   * Detecta Categorías, Subcategorías y Tipos publicados sin ningún producto asignado.
   */
  async taxonomiaVacia(ctx) {
    if (!verificarAdminImportacion(ctx)) {
      return ctx.unauthorized('No autenticado.');
    }

    try {
      const [categorias, productosPublicados] = await Promise.all([
        strapi.documents(UID_CAT).findMany({
          status: 'published',
          populate: {
            subcategorias: {
              populate: { tipos: true },
            },
            productos: { fields: ['id', 'documentId', 'subcategoria', 'tipo'] },
          },
          limit: 500,
        }),
        fetchProductosPublicadosConClasificaciones(strapi),
      ]);

      const categoriasVacias = [];
      const subcategoriasVacias = [];
      const tiposVacios = [];

      for (const cat of categorias) {
        const asignaciones = obtenerAsignacionesDeCategoria(cat, productosPublicados);
        const productosUnicos = new Set(asignaciones.map((a) => a.productoKey));

        // ── Categoría vacía ──────────────────────────────────────────────────────
        if (productosUnicos.size === 0) {
          categoriasVacias.push({
            id: cat.documentId,
            nombre: cat.nombre,
            seccion: cat.seccion || '—',
          });
          // Si la categoría está vacía no tiene sentido revisar sus subcats
          continue;
        }

        // ── Subcategorías y tipos vacíos ─────────────────────────────────────────
        for (const sub of cat.subcategorias || []) {
          const subNorm = normalizarTxt(sub.nombre);
          const asigEnSubcat = asignaciones.filter((a) => a.subcategoria === subNorm);

          if (asigEnSubcat.length === 0) {
            subcategoriasVacias.push({
              id: sub.id,
              nombre: sub.nombre,
              categoriaId: cat.documentId,
              categoriaNombre: cat.nombre,
            });
            // Si la subcategoría está vacía, sus tipos también lo están
            continue;
          }

          // ── Tipos vacíos dentro de esta subcategoría ──────────────────────────
          for (const tipo of sub.tipos || []) {
            const tipoNorm = normalizarTxt(tipo.nombre);
            const asigEnTipo = asigEnSubcat.filter((a) => a.tipo === tipoNorm);
            if (asigEnTipo.length === 0) {
              tiposVacios.push({
                id: tipo.id,
                nombre: tipo.nombre,
                subcatId: sub.id,
                subcatNombre: sub.nombre,
                categoriaId: cat.documentId,
                categoriaNombre: cat.nombre,
              });
            }
          }
        }
      }

      return ctx.send({
        ok: true,
        total: categoriasVacias.length + subcategoriasVacias.length + tiposVacios.length,
        categorias: categoriasVacias,
        subcategorias: subcategoriasVacias,
        tipos: tiposVacios,
      });
    } catch (err) {
      strapi.log.error(`[ImportAdmin] Error detectando taxonomía vacía: ${err.message}`);
      return ctx.internalServerError(`Error al detectar taxonomía vacía: ${err.message}`);
    }
  },

  /**
   * DELETE /api/importacion-admin/categoria/:id
   * Elimina una categoría (borrador + publicado) si realmente no tiene productos asignados.
   */
  async eliminarCategoria(ctx) {
    if (!verificarAdminImportacion(ctx)) {
      return ctx.unauthorized('No autenticado.');
    }

    const { id } = ctx.params;

    try {
      const [{ documentId, draft, published }, productosPublicados] = await Promise.all([
        resolverCategoriaDoc(strapi, id, {
          productos: { fields: ['id', 'documentId', 'subcategoria', 'tipo'] },
        }),
        fetchProductosPublicadosConClasificaciones(strapi),
      ]);

      const cat = published || draft;
      if (!documentId || !cat) return ctx.notFound('Categoría no encontrada.');

      const asignaciones = obtenerAsignacionesDeCategoria(cat, productosPublicados);
      const productosUnicos = new Set(asignaciones.map((a) => a.productoKey));
      if (productosUnicos.size > 0) {
        return ctx.badRequest(`La categoría "${cat.nombre}" tiene ${productosUnicos.size} productos asignados y no puede eliminarse.`);
      }

      await strapi.documents(UID_CAT).delete({ documentId });

      strapi.log.info(`[ImportAdmin] Categoría eliminada: documentId=${documentId}, nombre="${cat.nombre}"`);
      return ctx.send({ ok: true, mensaje: `Categoría "${cat.nombre}" eliminada correctamente.` });
    } catch (err) {
      strapi.log.error(`[ImportAdmin] Error eliminando categoría ${id}: ${err.message}`);
      return ctx.internalServerError(`Error al eliminar categoría: ${err.message}`);
    }
  },

  /**
   * DELETE /api/importacion-admin/subcategoria/:categoriaId/:subcatId
   * Elimina una subcategoría vacía de su categoría padre y publica el cambio.
   */
  async eliminarSubcategoria(ctx) {
    if (!verificarAdminImportacion(ctx)) {
      return ctx.unauthorized('No autenticado.');
    }

    const { categoriaId, subcatId } = ctx.params;

    try {
      const [{ documentId, draft, published }, productosPublicados] = await Promise.all([
        resolverCategoriaDoc(strapi, categoriaId, {
          subcategorias: { populate: { tipos: true } },
          productos: { fields: ['id', 'documentId', 'subcategoria', 'tipo'] },
        }),
        fetchProductosPublicadosConClasificaciones(strapi),
      ]);

      const baseCat = published || draft;
      if (!documentId || !baseCat) return ctx.notFound('Categoría no encontrada.');

      const subcat = localizarSubcategoria(published, draft, subcatId);
      if (!subcat) return ctx.notFound('Subcategoría no encontrada.');

      const subNorm = normalizarTxt(subcat.nombre);
      const asignaciones = obtenerAsignacionesDeCategoria(baseCat, productosPublicados);
      const prodsUnicos = new Set(asignaciones.filter((a) => a.subcategoria === subNorm).map((a) => a.productoKey));
      if (prodsUnicos.size > 0) {
        return ctx.badRequest(
          `La subcategoría "${subcat.nombre}" tiene ${prodsUnicos.size} productos y no puede eliminarse.`
        );
      }

      const nuevasSubcats = (baseCat.subcategorias || []).filter(
        (s) => normalizarTxt(s.nombre) !== subNorm
      );

      await actualizarYPublicarSubcategorias(strapi, documentId, nuevasSubcats, Boolean(published));

      strapi.log.info(`[ImportAdmin] Subcategoría eliminada: ID=${subcatId}, nombre="${subcat.nombre}" de categoría documentId=${documentId}`);
      return ctx.send({ ok: true, mensaje: `Subcategoría "${subcat.nombre}" eliminada correctamente.` });
    } catch (err) {
      strapi.log.error(`[ImportAdmin] Error eliminando subcategoría ${subcatId}: ${err.message}`);
      return ctx.internalServerError(`Error al eliminar subcategoría: ${err.message}`);
    }
  },

  /**
   * DELETE /api/importacion-admin/tipo/:categoriaId/:subcatId/:tipoId
   * Elimina un tipo vacío de su subcategoría padre y publica el cambio.
   */
  async eliminarTipo(ctx) {
    if (!verificarAdminImportacion(ctx)) {
      return ctx.unauthorized('No autenticado.');
    }

    const { categoriaId, subcatId, tipoId } = ctx.params;

    try {
      const [{ documentId, draft, published }, productosPublicados] = await Promise.all([
        resolverCategoriaDoc(strapi, categoriaId, {
          subcategorias: { populate: { tipos: true } },
          productos: { fields: ['id', 'documentId', 'subcategoria', 'tipo'] },
        }),
        fetchProductosPublicadosConClasificaciones(strapi),
      ]);

      const baseCat = published || draft;
      if (!documentId || !baseCat) return ctx.notFound('Categoría no encontrada.');

      const subcat = localizarSubcategoria(published, draft, subcatId);
      if (!subcat) return ctx.notFound('Subcategoría no encontrada.');

      const tipo = localizarTipo(published, draft, subcat.nombre, tipoId);
      if (!tipo) return ctx.notFound('Tipo no encontrado.');

      const subNorm = normalizarTxt(subcat.nombre);
      const tipoNorm = normalizarTxt(tipo.nombre);
      const asignaciones = obtenerAsignacionesDeCategoria(baseCat, productosPublicados);
      const prodsUnicos = new Set(
        asignaciones
          .filter((a) => a.subcategoria === subNorm && a.tipo === tipoNorm)
          .map((a) => a.productoKey)
      );
      if (prodsUnicos.size > 0) {
        return ctx.badRequest(
          `El tipo "${tipo.nombre}" tiene ${prodsUnicos.size} productos y no puede eliminarse.`
        );
      }

      const nuevasSubcats = (baseCat.subcategorias || []).map((s) => {
        if (normalizarTxt(s.nombre) !== subNorm) return s;
        return {
          ...s,
          tipos: (s.tipos || []).filter((t) => normalizarTxt(t.nombre) !== tipoNorm),
        };
      });

      await actualizarYPublicarSubcategorias(strapi, documentId, nuevasSubcats, Boolean(published));

      strapi.log.info(`[ImportAdmin] Tipo eliminado: ID=${tipoId}, nombre="${tipo.nombre}" de subcategoría="${subcat.nombre}", categoría documentId=${documentId}`);
      return ctx.send({ ok: true, mensaje: `Tipo "${tipo.nombre}" eliminado correctamente.` });
    } catch (err) {
      strapi.log.error(`[ImportAdmin] Error eliminando tipo ${tipoId}: ${err.message}`);
      return ctx.internalServerError(`Error al eliminar tipo: ${err.message}`);
    }
  },

  /**
   * POST /api/importacion-admin/eliminar-padres-migrados
   * Elimina productos padre viejos que ya fueron convertidos en variantes.
   * No borra archivos de la Media Library (las variantes conservan la imagen).
   */
  async eliminarPadresMigrados(ctx) {
    if (!verificarAdminImportacion(ctx)) {
      return ctx.unauthorized('No autenticado.');
    }

    const rawIds = ctx.request.body?.documentIds;
    if (!Array.isArray(rawIds) || rawIds.length === 0 || rawIds.length > 50) {
      return ctx.badRequest('Enviá entre 1 y 50 documentIds válidos para eliminar.');
    }

    const documentIds = [...new Set(rawIds.map(id => (typeof id === 'string' ? id.trim() : '')).filter(Boolean))];
    if (documentIds.length === 0) {
      return ctx.badRequest('No se recibieron documentIds válidos.');
    }

    const docs = strapi.documents('api::producto.producto');
    const eliminados = [];
    const errores = [];

    for (const documentId of documentIds) {
      try {
        const prod =
          (await docs.findOne({ documentId, status: 'published', fields: ['id_original', 'nombre'] })) ||
          (await docs.findOne({ documentId, status: 'draft', fields: ['id_original', 'nombre'] }));
        if (!prod) {
          errores.push({ documentId, mensaje: 'Producto no encontrado o ya eliminado.' });
          continue;
        }
        await docs.delete({ documentId });
        strapi.log.info(`[AUDIT] action=DELETE_PADRE_MIGRADO_A_VARIANTE documentId=${documentId} id_original=${prod.id_original || ''} nombre="${prod.nombre || ''}" timestamp=${new Date().toISOString()}`);
        eliminados.push({ documentId, id_original: prod.id_original || '', nombre: prod.nombre || '' });
      } catch (err) {
        strapi.log.error(`[ImportAdmin] Error eliminando producto migrado ${documentId}: ${err.message}`);
        errores.push({ documentId, mensaje: err.message });
      }
    }

    return ctx.send({
      ok: errores.length === 0,
      eliminados,
      errores,
    });
  },
};
