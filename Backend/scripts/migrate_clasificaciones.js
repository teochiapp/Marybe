/**
 * migrate_clasificaciones.js
 *
 * Script de migración ONE-SHOT.
 * Se autentica con el endpoint de administración de importación
 * y dispara la migración interna en Strapi a través de la API dedicada:
 * POST /api/importacion-admin/migrar-clasificaciones
 *
 * USO:
 *   node scripts/migrate_clasificaciones.js
 *
 * Variables de entorno:
 *   IMPORT_ADMIN_EMAIL    (opcional, default admin@marybe.com)
 *   IMPORT_ADMIN_PASSWORD (requerido)
 *   STRAPI_URL            (opcional, default http://localhost:1337)
 */

'use strict';

const axios = require('axios');

const STRAPI_URL = (process.env.STRAPI_URL || 'http://localhost:1337').replace(/\/$/, '');
const EMAIL      = process.env.IMPORT_ADMIN_EMAIL || 'admin@marybe.com';
const PASSWORD   = process.env.IMPORT_ADMIN_PASSWORD;

if (!PASSWORD) {
  console.error('❌ IMPORT_ADMIN_PASSWORD no está definido en las variables de entorno.');
  process.exit(1);
}

// ─── Login para obtener el JWT custom ─────────────────────────────────────────
async function login() {
  const res = await axios.post(`${STRAPI_URL}/api/importacion-admin/login`, {
    identifier: EMAIL,
    password:   PASSWORD,
  });
  return res.data.jwt;
}

// ─── Disparar migración en el backend por lotes ────────────────────────────────
async function ejecutarMigracion(jwt, offset, limit) {
  const res = await axios.post(
    `${STRAPI_URL}/api/importacion-admin/migrar-clasificaciones`,
    { offset, limit },
    {
      headers: { Authorization: `Bearer ${jwt}` },
      timeout: 30000, // 30 segundos por batch
    }
  );
  return res.data;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Iniciando migración de clasificaciones...');
  console.log(`   URL:     ${STRAPI_URL}`);
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

  console.log('⏳ Ejecutando migración en Strapi por lotes...');
  
  let totalAnalizados = 0;
  let totalMigrados = 0;
  let totalOmitidos = 0;
  let totalSinDatos = 0;
  let totalErrores = 0;
  const todosErrores = [];
  
  let offset = 0;
  const limit = 500;

  try {
    while (true) {
      console.log(`   ➤ Procesando lote (offset: ${offset}, limit: ${limit})...`);
      const resultado = await ejecutarMigracion(jwt, offset, limit);
      
      totalAnalizados += resultado.total;
      totalMigrados += resultado.migrados;
      totalOmitidos += resultado.omitidos;
      totalSinDatos += resultado.sinDatos;
      totalErrores += resultado.errores;
      
      if (resultado.erroresList && resultado.erroresList.length > 0) {
        todosErrores.push(...resultado.erroresList);
      }
      
      if (resultado.total < limit) {
        break; // No hay más productos
      }
      offset += limit;
    }
  } catch (err) {
    if (err.response?.status === 404) {
      console.error('❌ Error 404: La ruta /api/importacion-admin/migrar-clasificaciones no existe.');
      console.error('👉 Asegurate de haber reiniciado Strapi o desplegado los últimos cambios de código.');
    } else {
      console.error('❌ Error al ejecutar migración:', err.response?.data || err.message);
    }
    process.exit(1);
  }

  console.log('\n─────────────────────────────────────────────');
  console.log('✅ Migración completada exitosamente:');
  console.log(`   ├ 📦 Total analizados:                 ${totalAnalizados}`);
  console.log(`   ├ ✅ Migrados a clasificaciones[]:     ${totalMigrados}`);
  console.log(`   ├ ⏩ Omitidos (ya tenían datos):       ${totalOmitidos}`);
  console.log(`   ├ ⚪ Sin datos taxonómicos:            ${totalSinDatos}`);
  console.log(`   └ ❌ Errores:                          ${totalErrores}`);
  console.log('─────────────────────────────────────────────');

  if (totalErrores > 0) {
    console.log('\n⚠️  Algunos productos tuvieron errores:');
    todosErrores.slice(0, 50).forEach(e => console.log(`   - ID ${e.id}: ${e.error}`));
    if (todosErrores.length > 50) console.log(`   ...y ${todosErrores.length - 50} más.`);
    process.exit(1);
  } else {
    console.log('\n🎉 Todos los productos quedaron listos con el nuevo formato.');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('❌ Error inesperado:', err.message);
  process.exit(1);
});
