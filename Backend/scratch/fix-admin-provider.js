const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../.tmp/data.db');
const db = new Database(dbPath);

try {
  // Corregir el campo provider a 'local' (requerido por Strapi para auth local)
  const result = db.prepare(
    "UPDATE up_users SET provider = 'local' WHERE email = 'admin@marybe.com'"
  ).run();
  console.log('✅ Filas actualizadas:', result.changes);

  const user = db.prepare(
    "SELECT id, email, provider, confirmed, blocked FROM up_users WHERE email = 'admin@marybe.com'"
  ).get();
  console.log('Usuario actualizado:', user);
} catch (e) {
  console.log('❌ Error:', e.message);
} finally {
  db.close();
}
