const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../.tmp/data.db');
const db = new Database(dbPath);

try {
  // Ver columnas
  const info = db.prepare("PRAGMA table_info(up_permissions_role_lnk)").all();
  console.log('Columnas de up_permissions_role_lnk:', info);

  // Ver fila de ejemplo
  const rows = db.prepare("SELECT * FROM up_permissions_role_lnk LIMIT 2").all();
  console.log('Filas de ejemplo:', rows);
} catch (e) {
  console.log('Error:', e.message);
}
db.close();
