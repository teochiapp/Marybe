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

// ─── Disparar migración en el backend ─────────────────────────────────────────
async function ejecutarMigracion(jwt) {
  const res = await axios.post(
    `${STRAPI_URL}/api/importacion-admin/migrar-clasificaciones`,
    {},
    {
      headers: { Authorization: `Bearer ${jwt}` },
      timeout: 120000, // 2 minutos máx
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

  console.log('⏳ Ejecutando migración en Strapi...');
  let resultado;
  try {
    resultado = await ejecutarMigracion(jwt);
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
  console.log(`   ├ 📦 Total analizados:                 ${resultado.total}`);
  console.log(`   ├ ✅ Migrados a clasificaciones[]:     ${resultado.migrados}`);
  console.log(`   ├ ⏩ Omitidos (ya tenían datos):       ${resultado.omitidos}`);
  console.log(`   ├ ⚪ Sin datos taxonómicos:            ${resultado.sinDatos}`);
  console.log(`   └ ❌ Errores:                          ${resultado.errores || 0}`);
  console.log('─────────────────────────────────────────────');

  if (resultado.errores > 0) {
    console.log('\n⚠️  Algunos productos tuvieron errores:');
    (resultado.erroresList || []).forEach(e => console.log(`   - ID ${e.id}: ${e.error}`));
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
