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
  if (val === null || val === undefined || val === '') return null;
  // Si ya es número (ExcelJS puede devolver números JS directamente)
  if (typeof val === 'number') return isNaN(val) ? null : val;
  const str = val.toString().trim();
  if (!str) return null;
  // Formato argentino: 3.100,50 → remover puntos de miles, cambiar coma decimal
  const normalizado = str.replace(/\./g, '').replace(',', '.');
  const num = parseFloat(normalizado);
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
  register({ strapi }) {
    strapi.server.app.proxy = true;
    strapi.server.use(async (ctx, next) => {
      // FORZAR ABSOLUTAMENTE a Koa y a la librería Cookies a saber que estamos en HTTPS
      if (ctx.cookies) {
        ctx.cookies.secure = true;
      }
      Object.defineProperty(ctx.request, 'protocol', {
        get: () => 'https',
        configurable: true
      });
      Object.defineProperty(ctx.request, 'secure', {
        get: () => true,
        configurable: true
      });

      await next();

      if (ctx.request.path.startsWith('/api/connect/google/callback')) {
        const location = ctx.response.get('Location');
        if (location && location.includes('marybe.surcodes.com') && !location.includes('access_token')) {
          let accessToken = ctx.state?.grant?.response?.access_token || ctx.session?.grant?.response?.access_token || ctx.request.query?.access_token;
          let idToken = ctx.state?.grant?.response?.id_token || ctx.session?.grant?.response?.id_token || ctx.request.query?.id_token;
          let rawCode = ctx.request.query?.code;

          if (accessToken) {
            const separator = location.includes('?') ? '&' : '?';
            ctx.response.set('Location', `${location}${separator}access_token=${accessToken}${idToken ? `&id_token=${idToken}` : ''}`);
          } else if (rawCode) {
            const separator = location.includes('?') ? '&' : '?';
            ctx.response.set('Location', `${location}${separator}access_token=${rawCode}`);
          }
        }
      }
    });

    // ── Lifecycle: enviar email de bienvenida al crear un usuario nuevo ──────────
    strapi.db.lifecycles.subscribe({
      models: ['plugin::users-permissions.user'],

      async afterCreate({ result }) {
        try {
          const email = result.email;
          const nombre = result.username || result.nombre || email.split('@')[0];

          // Pequeño delay para que Strapi termine de confirmar el usuario
          setTimeout(async () => {
            try {
              await strapi.service('api::correo.correo').enviarBienvenida(email, nombre);
              strapi.log.info(`[Bienvenida] Email enviado a: ${email}`);
            } catch (err) {
              strapi.log.error(`[Bienvenida] Error enviando email a ${email}: ${err.message}`);
            }
          }, 2000);
        } catch (err) {
          strapi.log.error('[Bienvenida] Error en lifecycle afterCreate:', err.message);
        }
      }
    });
  },

  async bootstrap({ strapi }) {

    // ── Otorgar permisos públicos para la nueva sección destacada y páginas ──────────
    await grantPublicPermission(strapi, 'api::seccion-destacada.seccion-destacada.find');
    await grantPublicPermission(strapi, 'api::pagina-sucursales.pagina-sucursales.find');
    await grantPublicPermission(strapi, 'api::pagina-historia.pagina-historia.find');

    // ── Permisos públicos para secciones del inicio (promociones, categorías) ───
    await grantPublicPermission(strapi, 'api::promociones-inicio.promociones-inicio.find');
    await grantPublicPermission(strapi, 'api::promociones-inicio.promociones-inicio.findOne');
    await grantPublicPermission(strapi, 'api::seccion-categorias-destacadas.seccion-categorias-destacadas.find');
    await grantPublicPermission(strapi, 'api::seccion-categorias-destacadas.seccion-categorias-destacadas.findOne');

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

    // ── Auto-seed de Página de Sucursales si está vacía ───────────────────
    try {
      const UID_PS = 'api::pagina-sucursales.pagina-sucursales';
      const existingPS = await strapi.documents(UID_PS).findFirst();
      if (!existingPS) {
        await strapi.documents(UID_PS).create({
          data: {
            titulo: 'Nuestras Sucursales',
            sucursales: [
              {
                provincia: 'Santiago del Estero',
                calle: 'Absalón Rojas 55',
                numero_celular: '+54 9 3854 73-5731',
                numero_fijo: '(0385) 4214890',
                embed_google_maps: 'https://maps.app.goo.gl/v2Pv5MuWfwSJLqpYA'
              },
              {
                provincia: 'Santiago del Estero',
                calle: 'Absalón Rojas 20',
                numero_celular: '+54 9 3854 71-4936',
                numero_fijo: '',
                embed_google_maps: 'https://maps.app.goo.gl/EmHayxc7aJZDgdjRA'
              },
              {
                provincia: 'Santiago del Estero',
                calle: 'Pellegrini 141',
                numero_celular: '+54 9 3854 71-4941',
                numero_fijo: '(0385) 4211687',
                embed_google_maps: 'https://maps.app.goo.gl/7LqPPnQxyixpWTxA9'
              },
              {
                provincia: 'Santiago del Estero',
                calle: 'Tucumán 20',
                numero_celular: '+54 9 3855 18-9775',
                numero_fijo: '(0385) 4227000',
                embed_google_maps: 'https://maps.app.goo.gl/kHwZjA289i3QdQj68'
              },
              {
                provincia: 'Santiago del Estero',
                calle: 'España 99 - La Banda',
                numero_celular: '+54 9 3855 99-6408',
                numero_fijo: '(0385) 4221300',
                embed_google_maps: 'https://maps.app.goo.gl/pBUmzByjeiD25KkN7'
              },
              {
                provincia: 'Tucumán',
                calle: '25 de Mayo 256',
                numero_celular: '+54 9 3814 01-1551',
                numero_fijo: '(0381) 4310500',
                embed_google_maps: 'https://maps.app.goo.gl/m5PoF2Vw2ZKH2SEv9'
              },
              {
                provincia: 'Tucumán',
                calle: 'Maipú 164',
                numero_celular: '+54 9 3854 71-4926',
                numero_fijo: '',
                embed_google_maps: 'https://maps.app.goo.gl/jqGnE8KZ7xxGW4Yy8'
              }
            ]
          },
          status: 'published'
        });
        strapi.log.info(`[Seed] ✔ Creada configuración inicial para Página de Sucursales con 7 locales.`);
      }
    } catch (err) {
      strapi.log.warn(`[Seed] ⚠ Error en el seed de Página de Sucursales: ${err.message}`);
    }

    // ── Auto-seed de Página de Nuestra Historia si está vacía ─────────────
    try {
      const UID_PH = 'api::pagina-historia.pagina-historia';
      const existingPH = await strapi.documents(UID_PH).findFirst();
      if (!existingPH) {
        await strapi.documents(UID_PH).create({
          data: {
            titulo: 'Nuestra Historia',
            texto_banner_1: `<p><strong>MARYBE Perfumerías es una empresa familiar fundada en Santiago del Estero en 1969.</strong> Desde sus inicios, creció gracias al trabajo, la tenacidad, la pasión y el compromiso de quienes formaron parte de su camino.</p><p>A lo largo de los años, supo renovarse, adaptarse a los cambios y evolucionar junto a las necesidades de sus clientes, sin perder nunca de vista aquello que la define: el respeto, la cercanía y su vocación por brindar una atención de calidad.</p>`,
            texto_intermedio: `<p>Hoy, MARYBE continúa en <strong>plena expansión</strong>, impulsada por nuevas generaciones de la familia que mantienen vivo el espíritu de sus fundadores, incorporando nuevas formas de pensar, emprender y responder a un mercado cada vez más dinámico, competitivo y exigente.</p><p>Trabajamos día a día para ofrecer una experiencia de compra cercana, confiable y especial, en espacios pensados para que cada persona se vea y se sienta mejor. Esta esencia se refleja en cada una de nuestras sucursales, ubicadas en <strong>Santiago del Estero, La Banda y San Miguel de Tucumán</strong>.</p>`,
            texto_banner_2: `<p><strong>Con más de 50 años de trayectoria</strong>, somos representantes oficiales de reconocidas marcas nacionales e internacionales, reafirmando nuestro compromiso con la excelencia en el servicio y la calidad de cada producto.</p>`
          },
          status: 'published'
        });
        strapi.log.info(`[Seed] ✔ Creada configuración inicial para Página de Nuestra Historia.`);
      }
    } catch (err) {
      strapi.log.warn(`[Seed] ⚠ Error en el seed de Página de Nuestra Historia: ${err.message}`);
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

        if (hijos.length === 0) {
          strapi.log.warn(
            `[Seed] ⚠ Producto "${(p.nombre || '').substring(0, 40)}" (id: ${idOriginal}) no tiene variantes en variantes.csv — se creará sin precios`
          );
        }

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
              descripcion:       (p.descripcion_corta || p.descripcion || '').trim(),
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
