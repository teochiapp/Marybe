'use strict';

const fs   = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

// ─── Configuración ────────────────────────────────────────────────────────────
const CSV_PRODUCTOS = path.join(__dirname, '../data/productos.csv');
const CSV_VARIANTES = path.join(__dirname, '../data/variantes.csv');
const UID           = 'api::producto.producto';
const UID_CAT       = 'api::categoria.categoria';
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

// ─── Upsert de Categoría: buscar por nombre o crear ──────────────────────────
// Retorna el documentId de la categoría
async function upsertCategoria(strapi, { nombre, seccion, subcategorias }) {
  const nombreTrim = (nombre || '').trim();
  if (!nombreTrim) return null;

  // Buscar si ya existe por nombre
  const encontrados = await strapi.documents(UID_CAT).findMany({
    filters: { nombre: { $eq: nombreTrim } },
    limit: 1,
  });

  if (encontrados.length > 0) {
    return encontrados[0].documentId;
  }

  // Crear nueva categoría con subcategorías como componente
  const subcatData = subcategorias
    .filter(s => s && s.trim())
    .map(s => ({ nombre: s.trim() }));

  const nueva = await strapi.documents(UID_CAT).create({
    data: {
      nombre: nombreTrim,
      seccion: seccion || '',
      subcategorias: subcatData,
    },
    status: 'published',
  });

  return nueva.documentId;
}

async function grantPublicPermission(strapi, action) {
  try {
    const knex = strapi.db.connection;

    // 1. Buscar el rol public
    const publicRole = await knex('up_roles').where('type', 'public').first();
    if (!publicRole) return;

    // 2. Verificar si ya existe este permiso asociado a este rol
    const existing = await knex('up_permissions')
      .join('up_permissions_role_lnk', 'up_permissions.id', 'up_permissions_role_lnk.permission_id')
      .where('up_permissions.action', action)
      .where('up_permissions_role_lnk.role_id', publicRole.id)
      .first();

    if (existing) {
      return;
    }

    // 3. Crear el permiso en up_permissions
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let docId = '';
    for (let i = 0; i < 24; i++) {
      docId += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const now = Date.now();
    const [insertedId] = await knex('up_permissions').insert({
      document_id: docId,
      action: action,
      created_at: now,
      updated_at: now,
      published_at: now
    });

    // 4. Crear el link en up_permissions_role_lnk
    const maxOrdRow = await knex('up_permissions_role_lnk')
      .where('role_id', publicRole.id)
      .max('permission_ord as max_ord')
      .first();
    const nextOrd = (maxOrdRow?.max_ord || 0) + 1;

    await knex('up_permissions_role_lnk').insert({
      permission_id: insertedId,
      role_id: publicRole.id,
      permission_ord: nextOrd
    });

    strapi.log.info(`[Seed] ✔ Otorgado permiso público para: ${action}`);
  } catch (err) {
    strapi.log.warn(`[Seed] ⚠ Error otorgando permiso público para ${action}: ${err.message}`);
  }
}

module.exports = {
  register(/*{ strapi }*/) {},

  async bootstrap({ strapi }) {

    // ── Auto-seed Usuario Administrador del Frontend ─────────────────────────
    try {
      const adminEmail = 'admin@marybe.com';
      const existingUser = await strapi.query('plugin::users-permissions.user').findOne({
        where: { email: adminEmail }
      });

      if (!existingUser) {
        const role = await strapi.query('plugin::users-permissions.role').findOne({
          where: { type: 'authenticated' }
        });

        if (role) {
          // Utilizar plugin service para que se encargue de hashear la contraseña
          await strapi.plugin('users-permissions').service('user').add({
            username: 'ImportAdmin',
            email: adminEmail,
            password: 'MarybeSuperAdmin2025!',
            confirmed: true,
            blocked: false,
            role: role.id
          });
          strapi.log.info(`[Seed] ✔ Creado usuario API (${adminEmail}) para importaciones.`);
        } else {
          strapi.log.warn('[Seed] ⚠ No se encontró el rol "authenticated" para el usuario API.');
        }
      }
    } catch (err) {
      strapi.log.error(`[Seed] ❌ Error creando usuario API: ${err.message}`);
    }

    // ── Otorgar permisos públicos para la nueva sección destacada ──────────
    await grantPublicPermission(strapi, 'api::seccion-destacada.seccion-destacada.find');

    // ── Auto-seed de la sección destacada si está vacía ───────────────────
    try {
      const UID_SD = 'api::seccion-destacada.seccion-destacada';
      const existingSD = await strapi.documents(UID_SD).findFirst();
      if (!existingSD) {
        const firstCat = await strapi.documents('api::categoria.categoria').findFirst();
        if (firstCat) {
          await strapi.documents(UID_SD).create({
            data: {
              titulo: `Destacados de ${firstCat.nombre}`,
              categoria: { documentId: firstCat.documentId }
            },
            status: 'published'
          });
          strapi.log.info(`[Seed] ✔ Creada configuración inicial para Sección Destacada con categoría ${firstCat.nombre}`);
        }
      }
    } catch (err) {
      strapi.log.warn(`[Seed] ⚠ Error en el seed de Sección Destacada: ${err.message}`);
    }

    // ── Guard: no reimportar si ya hay datos (salvo que SEED_FORCE=true) ─────
    const existing = await strapi.documents(UID).findMany({ limit: 1 });
    if (existing.length > 0) {
      if (process.env.SEED_FORCE !== 'true') {
        strapi.log.info('[Seed] ✔ Ya existen productos. Omitiendo importación CSV.');
        strapi.log.info('[Seed] ℹ Para reimportar, reiniciar con SEED_FORCE=true');
        return;
      }

      // SEED_FORCE=true → borrar productos y categorías antes de reimportar
      strapi.log.info('[Seed] 🗑 SEED_FORCE=true — Eliminando productos existentes...');
      let totalBorrados = 0;
      while (true) {
        const lote = await strapi.documents(UID).findMany({
          limit: 100,
          fields: ['documentId'],
        });
        if (!lote || lote.length === 0) break;
        for (const doc of lote) {
          try {
            await strapi.documents(UID).delete({ documentId: doc.documentId });
            totalBorrados++;
          } catch (e) {
            strapi.log.warn(`[Seed] No se pudo borrar producto ${doc.documentId}: ${e.message}`);
          }
        }
        strapi.log.info(`[Seed] Borrados hasta ahora: ${totalBorrados}`);
        if (lote.length < 100) break;
      }
      strapi.log.info(`[Seed] ✔ ${totalBorrados} productos eliminados.`);

      // Borrar categorías también
      strapi.log.info('[Seed] 🗑 Eliminando categorías existentes...');
      let totalCatBorradas = 0;
      while (true) {
        const lote = await strapi.documents(UID_CAT).findMany({
          limit: 100,
          fields: ['documentId'],
        });
        if (!lote || lote.length === 0) break;
        for (const doc of lote) {
          try {
            await strapi.documents(UID_CAT).delete({ documentId: doc.documentId });
            totalCatBorradas++;
          } catch (e) {
            strapi.log.warn(`[Seed] No se pudo borrar categoría ${doc.documentId}: ${e.message}`);
          }
        }
        if (lote.length < 100) break;
      }
      strapi.log.info(`[Seed] ✔ ${totalCatBorradas} categorías eliminadas. Iniciando reimportación...`);
    }

    // ── Verificar que existan ambos CSV ───────────────────────────────────────
    const faltaProductos = !fs.existsSync(CSV_PRODUCTOS);
    const faltaVariantes = !fs.existsSync(CSV_VARIANTES);

    if (faltaProductos || faltaVariantes) {
      strapi.log.warn('[Seed] ⚠ Archivos CSV no encontrados. Ejecutar primero:');
      if (faltaProductos) strapi.log.warn(`  → Backend/data/productos.csv`);
      if (faltaVariantes) strapi.log.warn(`  → Backend/data/variantes.csv`);
      strapi.log.warn('  Correr: node Backend/scripts/excel-to-csv.js');
      return;
    }

    strapi.log.info('[Seed] 🚀 Iniciando importación con categorías automáticas...');
    const start = Date.now();

    // ── Leer ambos archivos ───────────────────────────────────────────────────
    const productos = leerCSV(CSV_PRODUCTOS);
    const variantes = leerCSV(CSV_VARIANTES);

    strapi.log.info(`[Seed] 📦 ${productos.length} productos padre`);
    strapi.log.info(`[Seed] 🔗 ${variantes.length} variantes en total`);

    // ── Paso 1: Construir mapa de categorías únicas con sus subcategorías ─────
    // Agrupar por nombre de categoría y acumular subcategorías únicas
    const categoriasMap = new Map(); // nombreCategoria → { seccion, subcategorias: Set }
    for (const p of productos) {
      const cat    = (p.categoria    || '').trim();
      const seccion = (p.seccion     || '').trim();
      const subcat  = (p.subcategoria || '').trim();
      if (!cat) continue;

      if (!categoriasMap.has(cat)) {
        categoriasMap.set(cat, { seccion, subcategorias: new Set() });
      }
      if (subcat) {
        categoriasMap.get(cat).subcategorias.add(subcat);
      }
    }

    // ── Paso 2: Crear las categorías en Strapi y guardar su documentId ────────
    strapi.log.info(`[Seed] 🗂 Creando ${categoriasMap.size} categorías...`);
    const categoriaIdPorNombre = new Map(); // nombreCategoria → documentId

    for (const [nombre, { seccion, subcategorias }] of categoriasMap) {
      try {
        const docId = await upsertCategoria(strapi, {
          nombre,
          seccion,
          subcategorias: [...subcategorias],
        });
        categoriaIdPorNombre.set(nombre, docId);
        strapi.log.info(`[Seed]   ✅ Categoría "${nombre}" (${[...subcategorias].length} subcats) → ${docId}`);
      } catch (e) {
        strapi.log.error(`[Seed]   ❌ Error creando categoría "${nombre}": ${e.message}`);
      }
    }

    // ── Paso 3: Indexar variantes por producto_padre_id ───────────────────────
    const variantesIndex = new Map();
    for (const v of variantes) {
      const padreId = (v.producto_padre_id || '').trim();
      const lista   = variantesIndex.get(padreId) || [];
      lista.push(v);
      variantesIndex.set(padreId, lista);
    }

    let success = 0;
    let errors  = 0;

    // ── Paso 4: Insertar productos con relación de categoría ──────────────────
    for (let i = 0; i < productos.length; i += BATCH_SIZE) {
      const batch = productos.slice(i, i + BATCH_SIZE);

      for (const p of batch) {
        const idOriginal     = (p.id_original || '').trim();
        const nombreCategoria = (p.categoria  || '').trim();
        const hijos          = variantesIndex.get(idOriginal) || [];

        // Resolver documentId de la categoría relacionada
        const categoriaDocId = categoriaIdPorNombre.get(nombreCategoria) || null;

        const variantesData = hijos.map(v => ({
          id_original:   (v.id_original || '').trim(),
          sku_ean:       (v.sku_ean || '').trim(),
          volumen:       (v.volumen || '').trim(),
          stock:         parseInt(v.stock)      || 0,
          precio:        parseDecimal(v.precio) || 0,
          precio_oferta: (() => {
            const pct    = parseDecimal(v.pct_descuento);
            const precio = parseDecimal(v.precio);
            if (pct && precio) return Math.round(precio * (1 - pct / 100) * 100) / 100;
            return parseDecimal(v.precio_oferta);
          })(),
          publicado: parseBoolean(v.publicado),
          envio:     (v.envio  || '').trim(),
          moneda:    (v.moneda || 'ARS').trim(),
        }));

        const maxDescuento = hijos.reduce((max, v) => {
          const pct = Math.round(parseDecimal(v.pct_descuento) || 0);
          return pct > max ? pct : max;
        }, 0);

        try {
          await strapi.documents(UID).create({
            data: {
              id_original:       idOriginal,
              sku:               (p.sku || '').trim(),
              nombre:            (p.nombre || '').trim(),
              marca:             (p.marca || '').trim(),
              seccion:           (p.seccion || '').trim(),
              subcategoria:      (p.subcategoria || '').trim(),
              descripcion_corta: (p.descripcion_corta || '').trim(),
              proveedor:         (p.proveedor || '').trim(),
              publicado:         parseBoolean(p.publicado),
              destacado:         parseBoolean(p.destacado),
              moneda:            (p.moneda || 'ARS').trim(),
              descuento:         maxDescuento,
              variantes:         variantesData,
              // Relación con el CT de Categorías
              ...(categoriaDocId ? { categoria: { documentId: categoriaDocId } } : {}),
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
    strapi.log.info(
      `[Seed] 📊 ${variantes.length} variantes | ${categoriasMap.size} categorías creadas/vinculadas`
    );
  },
};
