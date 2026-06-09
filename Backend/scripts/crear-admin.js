/**
 * crear-admin.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Crea el usuario administrador de importación directamente en la base de
 * datos SQLite de Strapi, SIN necesidad de que el servidor esté corriendo.
 *
 * Uso:
 *   node Backend/scripts/crear-admin.js
 *
 * Variables de entorno opcionales (o usar los defaults del script):
 *   ADMIN_EMAIL=admin@marybe.com
 *   ADMIN_PASSWORD=MarybeSuperAdmin2025!
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const path   = require('path');
const fs     = require('fs');
const crypto = require('crypto');

// ─── Cargar variables del .env ─────────────────────────────────────────────────
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const [key, ...rest] = line.split('=');
    if (key && key.trim() && !key.trim().startsWith('#')) {
      process.env[key.trim()] = rest.join('=').trim();
    }
  }
}

const DB_PATH = path.join(
  __dirname, '../',
  process.env.DATABASE_FILENAME || '.tmp/data.db'
);

// ─── Configuración del administrador ──────────────────────────────────────────
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || 'admin@marybe.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'MarybeSuperAdmin2025!';
const ADMIN_USERNAME = 'admin-marybe';
const ROL_NAME       = 'admin-importacion';
const ROL_TYPE       = 'admin-importacion';

// ─── Helper: bcrypt simple via crypto (compatible sin deps externos) ──────────
// Strapi usa bcryptjs. Para evitar dependencias extra, usamos better-sqlite3
// y la función de hash que ya usa Strapi internamente.
// Arrancamos Strapi mínimo solo para hashear el password.

async function main() {
  console.log('\n🛠  Creando usuario administrador de importación...\n');

  if (!fs.existsSync(DB_PATH)) {
    console.error(`❌ No se encontró la base de datos en: ${DB_PATH}`);
    console.error('   Asegurate de haber corrido el servidor al menos una vez con: npm run dev');
    process.exit(1);
  }

  // Usar better-sqlite3 directamente
  let Database;
  try {
    Database = require('better-sqlite3');
  } catch (e) {
    console.error('❌ No se pudo cargar better-sqlite3. Asegurate de estar en la carpeta Backend.');
    process.exit(1);
  }

  let bcrypt;
  try {
    bcrypt = require('bcryptjs');
  } catch (e) {
    // Si no está bcryptjs, intentar con bcrypt
    try {
      bcrypt = require('bcrypt');
    } catch (e2) {
      console.error('❌ No se encontró bcryptjs ni bcrypt. Strapi los debería tener instalados.');
      console.error('   Corrí: npm install bcryptjs');
      process.exit(1);
    }
  }

  const db = new Database(DB_PATH);

  try {
    // ── 1. Verificar/crear el rol "admin-importacion" ────────────────────────
    let rol = db.prepare(`SELECT * FROM up_roles WHERE type = ?`).get(ROL_TYPE);

    if (!rol) {
      console.log(`📋 Creando rol "${ROL_NAME}"...`);
      const now = Date.now();
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      let docId = '';
      for (let i = 0; i < 24; i++) docId += chars.charAt(Math.floor(Math.random() * chars.length));

      db.prepare(`
        INSERT INTO up_roles (document_id, name, description, type, created_at, updated_at, published_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        docId,
        ROL_NAME,
        'Administrador con acceso al panel de importación de productos',
        ROL_TYPE,
        now, now, now
      );

      rol = db.prepare(`SELECT * FROM up_roles WHERE type = ?`).get(ROL_TYPE);
      console.log(`   ✅ Rol creado (id: ${rol.id})`);

      // ── 2. Otorgar los permisos necesarios al rol ──────────────────────────
      const permisos = [
        'api::importacion-admin.importacion-admin.upload',
        'api::importacion-admin.importacion-admin.status',
      ];

      for (const accion of permisos) {
        const existePerm = db.prepare(`
          SELECT up_permissions.id FROM up_permissions
          JOIN up_permissions_role_lnk ON up_permissions.id = up_permissions_role_lnk.permission_id
          WHERE up_permissions.action = ? AND up_permissions_role_lnk.role_id = ?
        `).get(accion, rol.id);

        if (!existePerm) {
          let permDocId = '';
          for (let i = 0; i < 24; i++) permDocId += chars.charAt(Math.floor(Math.random() * chars.length));
          const permNow = Date.now();

          const insertResult = db.prepare(`
            INSERT INTO up_permissions (document_id, action, created_at, updated_at, published_at)
            VALUES (?, ?, ?, ?, ?)
          `).run(permDocId, accion, permNow, permNow, permNow);

          const maxOrd = db.prepare(`
            SELECT MAX(permission_ord) as max_ord FROM up_permissions_role_lnk WHERE role_id = ?
          `).get(rol.id);

          db.prepare(`
            INSERT INTO up_permissions_role_lnk (permission_id, role_id, permission_ord)
            VALUES (?, ?, ?)
          `).run(insertResult.lastInsertRowid, rol.id, (maxOrd?.max_ord || 0) + 1);

          console.log(`   ✅ Permiso otorgado: ${accion}`);
        } else {
          console.log(`   ℹ️  Permiso ya existía: ${accion}`);
        }
      }
    } else {
      console.log(`ℹ️  Rol "${ROL_NAME}" ya existe (id: ${rol.id})`);
    }

    // ── 3. Verificar si ya existe el usuario admin ────────────────────────────
    const existeUsuario = db.prepare(`SELECT * FROM up_users WHERE email = ?`).get(ADMIN_EMAIL);

    if (existeUsuario) {
      console.log(`\nℹ️  El usuario "${ADMIN_EMAIL}" ya existe (id: ${existeUsuario.id})`);
      console.log('   Para cambiar la contraseña, eliminá el usuario y corré el script nuevamente.\n');
    } else {
      // ── 4. Hashear contraseña ────────────────────────────────────────────────
      console.log('\n🔐 Hasheando contraseña...');
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

      const now = Date.now();
      let userDocId = '';
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      for (let i = 0; i < 24; i++) userDocId += chars.charAt(Math.floor(Math.random() * chars.length));

      // ── 5. Insertar el usuario ────────────────────────────────────────────────
      const insertUser = db.prepare(`
        INSERT INTO up_users (document_id, username, email, password, confirmed, blocked, created_at, updated_at, published_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(userDocId, ADMIN_USERNAME, ADMIN_EMAIL, hashedPassword, 1, 0, now, now, now);

      const userId = insertUser.lastInsertRowid;

      // ── 6. Vincular el usuario con el rol ─────────────────────────────────────
      const maxOrdUser = db.prepare(`
        SELECT MAX(user_ord) as max_ord FROM up_users_role_lnk WHERE role_id = ?
      `).get(rol.id);

      db.prepare(`
        INSERT INTO up_users_role_lnk (user_id, role_id, user_ord)
        VALUES (?, ?, ?)
      `).run(userId, rol.id, (maxOrdUser?.max_ord || 0) + 1);

      console.log(`\n✅ ¡Usuario administrador creado exitosamente!\n`);
      console.log(`   📧 Email:      ${ADMIN_EMAIL}`);
      console.log(`   🔑 Password:   ${ADMIN_PASSWORD}`);
      console.log(`   👤 Username:   ${ADMIN_USERNAME}`);
      console.log(`   🎭 Rol:        ${ROL_NAME}`);
      console.log(`\n   ⚠️  IMPORTANTE: Cambiá la contraseña después del primer uso.`);
    }

    console.log(`\n🚀 Podés iniciar sesión en: http://localhost:3000/importacion-admin\n`);

  } finally {
    db.close();
  }
}

main().catch(err => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
