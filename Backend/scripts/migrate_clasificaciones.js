/**
 * migrate_clasificaciones.js
 *
 * Script de migración ONE-SHOT.
 * Lee todos los productos en Strapi que tienen los campos planos
 * (seccion, categoria, subcategoria, tipo) pero NO tienen clasificaciones[].
 * Para cada uno, crea clasificaciones[0] con esos valores.
 *
 * USO:
 *   node scripts/migrate_clasificaciones.js
 *
 * REQUISITO: Strapi debe estar CORRIENDO en localhost:1337 con el JWT de importación.
 * Configurar IMPORT_ADMIN_EMAIL y IMPORT_ADMIN_PASSWORD en el .env del Backend.
 *
 * SEGURIDAD: Este script NO modifica los campos planos existentes.
 * Es seguro ejecutarlo múltiples veces (idempotente): si clasificaciones ya tiene datos,
 * no vuelve a poblarlos.
 */

'use strict';

const axios = require('axios');

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const EMAIL      = process.env.IMPORT_ADMIN_EMAIL || 'admin@marybe.com';
const PASSWORD   = process.env.IMPORT_ADMIN_PASSWORD;

if (!PASSWORD) {
  console.error('❌ IMPORT_ADMIN_PASSWORD no está definido en las variables de entorno.');
  process.exit(1);
}

const PAGE_SIZE = 50;

// ─── Login para obtener el JWT custom ─────────────────────────────────────────
async function login() {
  const res = await axios.post(`${STRAPI_URL}/api/importacion-admin/login`, {
    identifier: EMAIL,
    password:   PASSWORD,
  });
  return res.data.jwt;
}

// ─── Obtener todos los productos paginados ─────────────────────────────────────
async function fetchAllProductos(jwt) {
  const todos = [];
  let page = 1;

  while (true) {
    const res = await axios.get(`${STRAPI_URL}/api/productos`, {
      headers: { Authorization: `Bearer ${jwt}` },
      params: {
        'populate[clasificaciones]': true,
        'populate[categoria]':       true,
        'pagination[page]':          page,
        'pagination[pageSize]':      PAGE_SIZE,
        'status':                    'published',
      },
    });

    const items = res.data?.data || [];
    if (items.length === 0) break;
    todos.push(...items);
    if (items.length < PAGE_SIZE) break;
    page++;
  }

  return todos;
}

// ─── Actualizar un producto con clasificaciones[] ─────────────────────────────
async function actualizarProducto(jwt, documentId, clasificaciones) {
  await axios.put(
    `${STRAPI_URL}/api/productos/${documentId}`,
    { data: { clasificaciones } },
    { headers: { Authorization: `Bearer ${jwt}` } }
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Iniciando migración de clasificaciones...');
  console.log(`   URL: ${STRAPI_URL}`);
  console.log(`   Usuario: ${EMAIL}`);
  console.log('');

  let jwt;
  try {
    jwt = await login();
    console.log('✅ Login exitoso');
  } catch (err) {
    console.error('❌ Error en login:', err.response?.data || err.message);
    process.exit(1);
  }

  let productos;
  try {
    productos = await fetchAllProductos(jwt);
    console.log(`📦 ${productos.length} productos encontrados en la BD\n`);
  } catch (err) {
    console.error('❌ Error al obtener productos:', err.response?.data || err.message);
    process.exit(1);
  }

  let migrados   = 0;
  let omitidos   = 0;
  let sinDatos   = 0;
  let errores    = 0;

  for (const prod of productos) {
    const attrs   = prod.attributes || prod; // compatibilidad v4 / v5
    const docId   = prod.documentId || prod.id;
    const nombre  = attrs.nombre || String(prod.id);

    // ── Ya tiene clasificaciones → omitir ───────────────────────────────────
    const clasifExistentes = attrs.clasificaciones?.data || attrs.clasificaciones || [];
    if (Array.isArray(clasifExistentes) && clasifExistentes.length > 0) {
      omitidos++;
      continue;
    }

    // ── Construir la clasificación desde los campos planos ───────────────────
    const seccion      = (attrs.seccion      || '').trim();
    const categoria    = (attrs.categoria?.data?.attributes?.nombre || attrs.categoria?.nombre || '').trim();
    const subcategoria = (attrs.subcategoria || '').trim();
    const tipo         = (attrs.tipo         || '').trim();

    // Si no tiene ningún dato taxonómico, omitir
    if (!seccion && !categoria && !subcategoria && !tipo) {
      sinDatos++;
      console.log(`  ⚪ Sin datos taxonómicos: "${nombre}" (${docId})`);
      continue;
    }

    // ── Actualizar en Strapi ─────────────────────────────────────────────────
    try {
      await actualizarProducto(jwt, docId, [{ seccion, categoria, subcategoria, tipo }]);
      migrados++;
      console.log(`  ✅ Migrado: "${nombre}" → seccion="${seccion}", categoria="${categoria}", subcategoria="${subcategoria}", tipo="${tipo}"`);
    } catch (err) {
      errores++;
      console.error(`  ❌ Error en "${nombre}" (${docId}):`, err.response?.data?.error?.message || err.message);
    }
  }

  console.log('\n─────────────────────────────────────────────');
  console.log(`✅ Migración completada:`);
  console.log(`   └ ✅ Migrados:   ${migrados}`);
  console.log(`   └ ⏩ Omitidos (ya tenían clasificaciones): ${omitidos}`);
  console.log(`   └ ⚪ Sin datos taxonómicos:               ${sinDatos}`);
  console.log(`   └ ❌ Errores:    ${errores}`);
  console.log('─────────────────────────────────────────────');

  if (errores > 0) {
    console.log('\n⚠️  Hubo errores. Revisá los logs de arriba y volvé a ejecutar el script.');
    process.exit(1);
  } else {
    console.log('\n🎉 Todos los productos fueron migrados exitosamente.');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('❌ Error inesperado:', err.message);
  process.exit(1);
});
